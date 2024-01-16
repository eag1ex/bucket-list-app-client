import { makeObservable, observable, action, observe, runInAction, configure } from "mobx"
import { log, copy, warn, delay } from 'x-utils-es'
import { tasksComplete, tasksPending } from '../../../utils'
import { Subtask } from './Subtask.model'

configure({
    enforceActions: "never"
    // computedRequiresReaction: true,
    // reactionRequiresObservable: true,
    // observableRequiresReaction: true,
    // disableErrorBoundaries: true,
})

export class Bucket {
    // initial values
    id = ''
    status = ''
    title = ''
    created_at = ''
    subtasks = []
    finished = false
    error = ''
    reopenStatus = false // if the bucket was closed and we added another subtask

    // dataState = 'pending' // [pending,ready,error]
    constructor({ id, title, status, created_at, subtasks }) {

        makeObservable(this, {
            id: observable,
            status: observable,
            title: observable,
            //  created_at: observable,
            subtasks: observable,
            error: observable,
            finished: observable,
            toggle: action,
            onUpdate: action,
            reopenStatus: observable
        })

        if (!title || !id || !status || !created_at) {
            this.error = 'new Bucket missing some props'
            warn('[Bucket]', this.error)

        } else {

            this.error = ''
            this.id = id
            this.title = title
            this.status = status
            this.created_at = created_at
            this.subtasks = (subtasks || []).length ? copy(subtasks).map(n => new Subtask(n)) : []

            // sort tasks 
            this.subtasks.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

        }
        // initial cleanup
        // if we got some completed buckets from db but have no subtask
        if (this.status === 'completed') {
            this.finished = true
            this.reopenStatus = false
        
            // NOTE so we can check if real changes happened on database
            // this.setSubTasksStatus('completed')
        } 

        if (this.status === 'completed' && !this.subtasks.length) {
            this.status = 'pending'
            this.finished = false
            this.reopenStatus = false
        }

        observe(this, 'status', change => {
           
            if (!this.reopenStatus) {
                this.setSubTasksStatus(change.newValue)
            }
                
        })

        observe(this, 'subtasks', change => {

            if (tasksComplete(change.newValue)) {

                runInAction(() => {
                    this.status = 'completed'
                    this.finished = true
                    log('[tasksCompleted]', 'bucket is complete')
                })
                return
            }

            if (tasksPending(change.newValue)) {

                runInAction(() => {
                    this.status = 'pending'
                    this.finished = false
                    log('[tasksPending]', 'bucket is pending')
                })          
            }

        })
    }

    toggle() {
        // dont perform checks if not subs available
        if (!this.subtasks.length) return
        this.finished = !this.finished
        this.status = this.finished ? 'completed' : 'pending'
        return this.finished
    }

    addSubtask(subTask = []) {
        subTask = copy(subTask)
        runInAction(() => {
            let newSub = new Subtask(subTask)
            if (!newSub.error) {
                this.subtasks.push(newSub)
            } else warn('[addSubtask]', 'subtask not added')
        })
    }

    /**
     * 
     * @param {*} task subtask model
     * @param {*} entity  subtask
     * @param {*} eventName event type
     */
    onUpdate(task, entity, eventName) {

        if (eventName === 'addSubtask' && entity === 'subtask') {

            // this.setSubTasksStatus(task.status, task.todo_id)
            runInAction(() => {
                if (this.status === 'completed') {
                    this.reopenStatus = true
                    delay(300).then(() => {
                        this.finished = false   
                        this.status = 'pending'                  
                        this.reopenStatus = false
                         
                    })                             
                }
            })

            return 
        }

        if (eventName === 'statusChange' && entity === 'subtask') {
           
            runInAction(() => {
               
                this.setSubTasksStatus(task.status, task.todo_id)

                if (this.status === 'completed' && !tasksComplete(this.subtasks)) {
                    this.reopenStatus = true
                    this.status = 'pending'
                    this.finished = false
                    this.reopenStatus = false
                    return 
                }

                if (tasksComplete(this.subtasks)) {
                    this.status = 'completed'
                    this.finished = true
                }

                if (tasksPending(this.subtasks)) {
                    this.status = 'pending'
                    this.finished = false
                }

            })
        }
    }

    /**
     * update status of all subtasks 
     * if id is set only that subtask is updated
     * @param {*} byStatus 
     * @param {*} todo_id (optional)
     */
    setSubTasksStatus(byStatus, todo_id) {
        if (byStatus === 'completed' || byStatus === 'pending') {
            runInAction(() => {
                this.subtasks = this.subtasks
                    .map(n => {
                        if (todo_id === undefined) {
       
                            n.status = byStatus
                            n.finished = byStatus === 'completed'
                            return n
                        } else {
                            if (todo_id === n.todo_id) {
                                n.status = byStatus
                                n.finished = byStatus === 'completed'
                            }
                            return n
                        }
                    })
            })
        }
    }
}
