
import { makeObservable, observable, computed, action, observe, runInAction, configure } from "mobx"
import { log, onerror, copy, warn, isFunction, delay } from 'x-utils-es'
import { tasksComplete, tasksPending, updateTodoValues } from '../../utils'
import { v4 } from 'uuid'

configure({
    enforceActions: "never"
    // computedRequiresReaction: true,
    // reactionRequiresObservable: true,
    // observableRequiresReaction: true,
    // disableErrorBoundaries: true,
})

class Subtask {
    // initial values

    todo_id = ''
    status = ''
    title = ''
    created_at = ''
    finished = false
    error = ''
    constructor({ todo_id, title, status, created_at }) {

        makeObservable(this, {
            todo_id: observable,
            status: observable,
            title: observable,
            // created_at: observable,
            error: observable,
            finished: observable,
            toggle: action,
            updateSubtask: action
        })

        if (!title || !todo_id || !status || !created_at) {
            this.error = 'new Subtask missing some props'
            warn('[Subtask]', this.error)

        } else {

            this.error = ''
            this.todo_id = todo_id
            this.title = title
            this.status = status
            this.created_at = created_at
        }

        if (this.status === 'completed') {
            this.finished = true
        }

        observe(this, 'status', change => {

            if (change.newValue === 'completed') {
                this.finished = true
            }

            log('[subtask]', `is ${change.newValue}`)
        })
    }

    toggle() {
        this.finished = !this.finished
        this.status = this.finished ? 'completed' : 'pending'
    }
      
    updateSubtask(task = {}) {
        task = copy(task)
        runInAction(() => {
            if (task.title) this.title = task.title
            if (task.created_at) this.created_at = task.created_at
            if (task.status) this.status = task.status
        })
    }
}

class Bucket {
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
        }

        if (this.status === 'completed') {
            this.finished = true
            this.reopenStatus = false
        
            // NOTE so we can check if real changes happened on database
            // this.setSubTasksStatus('completed')
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
                    log('[tasksComleted]', 'bucket is complete')
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

/**
 * BucketStore class is also used as SubTaskStore class, that is why we use {entity} name
 */
class BucketStore/** SubTaskStore */ {
    todos = [];
    state = "pending" // "pending", "update" "ready" or "error"

    id = '' // NOTE id not available on entity BucketStore
    get unfinishedCount() {
        return this.todos.filter(todo => !todo.finished).length
    }

    /**
     * 
     * @param {*} todos 
     * @param `{id, entity}` id is only available on entity='SubTaskStore'
     */
    constructor(todos, { id, entity }) {

        makeObservable(this, {
            id: observable,
            state: observable,
            todos: observable,
            unfinishedCount: computed,
            // onUpdate:action
            addNewBucket: action,
            addNewSubTask: action
        })

        this.entity = entity
        this.id = id

        if (this.entity === 'BucketStore') {
            this.todos = todos.map(n => new Bucket(n)).filter(n => !n.error)
            this.state = 'ready'
        }

        if (this.entity === 'SubTaskStore') {
            this.todos = todos.map(n => new Subtask(n)).filter(n => !n.error)
            this.state = 'ready'
        }

        observe(this, 'todos', change => {
            log(`[${this.entity}][todos][updated]`)
        })

        observe(this, 'state', change => {
            log(`[${this.entity}][state]`, change.newValue)
        })

        // log(`[entity: ${this.entity}] /todos`, this.todos)
    }

    /**
     * add new bucket ahead of time then wait for server response to update again using lazy callback
     * @returns number of added buckets 
     */
    addNewBucket({ title }, lazyCB) {

        if (this.entity !== 'BucketStore') {
            throw new Error(`not allowed performing task/addNewBucket on entity:${this.entity}`)
        }

        try {

            if (!title) throw new Error('Bucket not added, {title} missing')

            /**
             * NOTE
             * So we dont wait for return success callback from server
             * We create initial item and then update its {id,created_at} with the official
             */
            const tempItem = ({ title }) => {
                return {
                    id: v4(), // updated by server 
                    title,
                    status: 'pending', // [pending/completed]
                    created_at: new Date(), // updated by server 
                    subtasks: []
                }
            }

            let bucket = new Bucket(tempItem({ title }))
            let initialID = bucket.id

            runInAction(() => {
                // add another bucket          
                this.todos.push(bucket)
                // this.state = 'ready'
                // NOTE lazy callback from server 
                if (isFunction(lazyCB)) {
                    lazyCB(bucket).then((updatedBucket) => {
                        this.todos.forEach((todo, inx) => {
                            if (todo.id === initialID) {
                                todo = updateTodoValues(updatedBucket, todo)                              
                                this.todos[inx] = todo 
                                log('[addNewBucket][lazyUpdate][done]')
                            }
                        })
                    })
                        // TODO Here we can reverse last add in case server/connection drops out 
                        .catch(onerror)
                }
            })

            return bucket

        } catch (err) {
            onerror(err)
        }

        return undefined
    }

    /**
     * add new subtask ahead of time then wait for server response to update again using lazy callback
     * @returns number of added subTaks 
     */
    addNewSubTask({ title }, lazyCB) {

        if (this.entity !== 'SubTaskStore') {
            throw (`not allowed performing task/addSubTask on entity:${this.entity}`)
        }

        try {

            if (!title) {
                warn('[addNewSubTask]', `subtask not added, {title} missing`)
                return
            }

            /**
            * 
            * So we dont wait for return success callback from server
            * We create initial item and then update its {todo_id,created_at} with the official
            */
            const tempItem = ({ title }) => {
                return {
                    todo_id: v4(), // updated by server 
                    title,
                    status: 'pending', // [pending/completed]
                    created_at: new Date() // updated by server 
                }
            }

            let subtask = new Subtask(tempItem({ title }))
            let initialID = subtask.todo_id
            // add another subtask
            runInAction(() => {

                this.todos.push(subtask)

                // this.state = 'ready'
                // NOTE lazy callback from server 
                if (isFunction(lazyCB)) {

                    lazyCB(subtask).then((updatedSubtask) => {
                        this.todos.forEach(n => {
                            if (n.todo_id === initialID) {
                                n = updateTodoValues(updatedSubtask, n)
                            }
                        })
                    })
                        // TODO Here we can reverse last add in case server/connection drops out 
                        .catch(onerror)
                }
            })

            return subtask

        } catch (err) {
            onerror('[addSubTask]', err)
        }
        return undefined

    }

}

export { BucketStore }
export { Bucket }
export { Subtask }
