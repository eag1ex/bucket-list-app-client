
import { makeObservable, observable, computed, action, observe, runInAction, configure } from "mobx";
import { log, onerror, copy, warn ,isFunction} from 'x-utils-es';
import { tasksComplete, tasksPending } from '../../utils';
import { v4 } from 'uuid';

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
            created_at: observable,
            error: observable,

            finished: observable,
            toggle: action
        });


        if (!title || !todo_id || !status || !created_at) {

            runInAction(() => {
                this.error = 'new Subtask missing some props'
                warn('[Subtask]', this.error)
            })

        } else {
            runInAction(() => {
                this.error = ''
            })

            this.todo_id = todo_id;
            this.title = title;
            this.status = status;
            this.created_at = created_at
        }


        observe(this, 'status', change => {
            log('[subtask]', `is ${change.newValue}`)
        })
    }

    toggle() {
        this.finished = !this.finished;
        this.status = this.finished ? 'completed' : 'pending'
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

    // dataState = 'pending' // [pending,ready,error]
    constructor({ id, title, status, created_at, subtasks }) {

        makeObservable(this, {
            id: observable,
            status: observable,
            title: observable,
            created_at: observable,
            subtasks: observable,
            error: observable,
            finished: observable,
            toggle: action,
            onUpdate: action
        });


        if (!title || !id || !status || !created_at) {


            runInAction(() => {
                this.error = 'new Bucket missing some props'
                warn('[Bucket]', this.error)
            })

        } else {

            runInAction(() => {
                this.error = ''
            })

            this.id = id;
            this.title = title;
            this.status = status;
            this.created_at = created_at
            this.subtasks = (subtasks || []).length ? copy(subtasks).map(n => new Subtask(n)) : []
        }



        if (this.status === 'completed') {
            this.finished = true
            this.setSubTasksStatus('completed')
        }

        observe(this, 'status', change => {
            if (!change.oldValue) {
                if (change.newValue === 'pending' || change.newValue === 'completed') {
                    this.setSubTasksStatus(change.newValue)
                }
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

                return
            }

            if (!tasksPending(change.newValue) && !tasksComplete(change.newValue)) {
                runInAction(() => {
                    this.status = 'pending'
                    this.finished = false
                    log('[tasksPending]', 'bucket is still pending')
                })

                return
            }
        })
    }


    toggle() {
        this.finished = !this.finished;
        this.status = this.finished ? 'completed' : 'pending'
        return this.finished
    }

    onUpdate(task) {
        if (task instanceof Subtask) {
            runInAction(() => this.updateSubTasks(task))
        }
    }

    setSubTasksStatus(byStatus) {
        if (byStatus === 'completed' || byStatus === 'pending') {
            runInAction(() => {
                this.subtasks = this.subtasks.map(n => {
                    n.status = byStatus
                    n.finished = byStatus === 'completed' ? true : false
                    return n
                })
            })
        }
    }

    updateSubTasks(task) {
        runInAction(() => {
            this.subtasks = this.subtasks.map((el) => {
                if (el.todo_id === task.todo_id) {
                    el = task
                    el.finished = el.status === 'completed' ? true : false

                }
                return el
            })
        })

    }
}


/**
 * BucketStore class is also used as SubTaskStore class, that is why we use {entity} name
 */
class BucketStore {
    todos = [];
    state = "pending" // "pending", "update" "ready" or "error"
    id = ''
    get unfinishedTodoCount() {
        return this.todos.filter(todo => !todo.finished).length;
    }

    /**
     * 
     * @param {*} todos 
     * @param `{id, entity}` id is only available on entity='SubTaskStore'
     */
    constructor({ id, entity }) {
        makeObservable(this, {
            id: observable,
            state: observable,
            todos: observable,
            unfinishedTodoCount: computed,
            // onUpdate:action
            addNewBucket: action,
            addNewSubTask: action,
            init: action
        });

        this.entity = entity
        this.id = id

        observe(this, 'todos', change => {
            log(`[${this.entity}][todos][updated]`)

        })

        observe(this, 'state', change => {
            log(`[${this.entity}][state]`, change.newValue)
        })

       // log(`[entity: ${this.entity}] /todos`, this.todos)
    }


    /** 
     * Performed once mobxstore is available
    */
    init(todosList = [],) {
        this.state = 'pending'
        try {

       
            if (this.entity === 'BucketStore') {
                this.todos = todosList.map(n => new Bucket(n)).filter(n => !n.error)
            }

            if (this.entity === 'SubTaskStore') {
                this.todos = todosList.map(n => new Subtask(n)).filter(n => !n.error)
            }

            this.state = 'ready'


        } catch (err) {
            onerror('[Bucket][init]', err)
            this.state = 'error'
        }
        return true
    }

    /**
     * add new bucket ahead of time then wait for server response to update again using lazy callback
     * @returns number of added buckets 
     */
    addNewBucket({ title },cb) {

        if (this.entity !== 'BucketStore') {
            throw new Error(`not allowed performing task/addNewBucket on entity:${this.entity}`);
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
                    created_at: new Date(),  // updated by server 
                    subtasks: []
                }
            }

            let bucket = new Bucket(tempItem({ title }))
            let initialID = bucket.id

            runInAction(() => {
                // add another bucket          
                this.todos.push(bucket)

                // NOTE lazy callback from server 
                if (isFunction(cb)) {
                    cb(bucket).then((updatedBucket) => {
                        this.todos = this.todos.map(n => {

                            if (n.id === initialID) {
                                for (let [k, val] of Object.entries(updatedBucket).values()) {
                                    if (n[k]) n[k] = val
                                }
                                
                                log('[addNewBucket][lazyUpdate][done]')
                            }
                            return n
                        })
                    }).catch(onerror)
                }
            })

            return bucket

        } catch (err) {
            onerror(err)
        }

        return undefined
    }


    /**
     * 
     * @returns number of added subTaks 
     */
    addNewSubTask({ title }, id) {

        if (this.entity !== 'SubTaskStore') {
            throw (`not allowed performing task/addSubTask on entity:${this.entity}`)
        }

        try {
            if (!title) throw new Error('subtask not added, {title} missing')
            if (!id) throw new Error('subtask not added, {id} missing')

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
                    created_at: new Date()  // updated by server 
                }
            }

            if (this.id !== id) throw new Error(`no BucketStore not found for id:${id}`)

            let todo = new Subtask(tempItem({ title }))
            // add another subtask
            runInAction(() => {
                this.todos.push(todo)
            })



            return todo

        } catch (err) {
            onerror('[addSubTask]', err)
        }
        return undefined

    }

}

export { BucketStore }
export { Bucket }
export { Subtask }