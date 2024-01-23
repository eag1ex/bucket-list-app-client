import { makeObservable, observable, computed, action, observe, runInAction, configure } from "mobx"
import { log, onerror, warn, isFunction } from 'x-utils-es'
import { updateTodoValues } from '../../../utils'
import { v4 } from 'uuid'
import { Bucket } from './Bucket.model'
import { Subtask } from './Subtask.model' 

configure({
    enforceActions: "never"
    // computedRequiresReaction: true,
    // reactionRequiresObservable: true,
    // observableRequiresReaction: true,
    // disableErrorBoundaries: true,
})

/**
 * BucketStore class is also used as SubTaskStore class, that is why we use {entity} name
 */
export class BucketStore/** SubTaskStore */ {
    todos = [];
    state = "pending" // "pending", "update" "ready" or "error"

    id = '' // NOTE id not available on entity BucketStore
    get unfinishedCount() {
        return this.todos.filter(todo => !todo.finished).length
    }
    get finishedCount() {
        return this.todos.filter(todo => todo.finished).length
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
            finishedCount: computed,
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
     * remove from database by api call
     */
    deleteExecCron() {

    }

    /**
     * @memberof Subtask/Bucket
     * grab either subtask or bucket by id
     * @param {*} id
     */
    taskByID(id) {
        if (this.entity === 'SubTaskStore') {
            let task = this.todos.find(n => n.todo_id === id)
            if (task instanceof Subtask) return task
        }
        if (this.entity === 'BucketStore') {
            let task = this.todos.find(n => n.id === id)
            if (task instanceof Bucket) return task
        }
        return undefined
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

            if (!title) {
                warn('Bucket not added, {title} missing')
                return 
            }

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
     * @returns number of added subTask 
     */
    addNewSubTask({ title }, lazyCB) {

        if (this.entity !== 'SubTaskStore') {
            throw new Error(`not allowed performing task/addSubTask on entity:${this.entity}`)
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
