
import { makeObservable, observable, computed, action, observe, runInAction, configure } from "mobx";
import { log, onerror, debug } from 'x-utils-es';
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

    constructor({ todo_id, title, status, created_at }) {

        makeObservable(this, {
            todo_id: observable,
            status: observable,
            title: observable,
            created_at: observable,

            // internal
            finished: observable,
            toggle: action
        });


        this.todo_id = todo_id;
        this.title = title;
        this.status = status;
        this.created_at = created_at

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
    todo_id = '' // for subtask only
    status = ''
    title = ''
    created_at = ''
    subtasks = []
    finished = false

    constructor({ id, todo_id, title, status, created_at, subtasks }) {

        makeObservable(this, {
            id: observable,
            todo_id: observable,
            status: observable,
            title: observable,
            created_at: observable,
            subtasks: observable,
            // internal
            finished: observable,
            toggle: action,
            onUpdate: action,

        });

        this.id = id;
        this.todo_id = todo_id;
        this.title = title;
        this.status = status;
        this.created_at = created_at
        this.subtasks = (subtasks || []).length ? subtasks.map(n => new Subtask(n)) : []


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

            //console.log(change.type, change.name, "from", change.oldValue, "to", change.object[change.name])
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
    constructor(todos, { id, entity }) {
        makeObservable(this, {
            id: observable,
            state: observable,
            todos: observable,
            unfinishedTodoCount: computed,
            // onUpdate:action
            addNewBucket: action,
            addNewSubTask: action
        });

        this.entity = entity
        this.id = id
        this.todos = todos;

        observe(this, 'todos', change => {
            log(`[${this.entity}][todos]`, change.newValue)

        })

        observe(this, 'state', change => {
            log(`[${this.entity}][state]`, change.newValue)
        })

        log(`[entity: ${this.entity}] /todos`, this.todos)
    }

    /**
     * 
     * @returns number of added buckets 
     */
    addNewBucket({ title }) {

        if (this.entity !== 'BucketStore') {
            throw (`not allowed performing task/addNewBucket on entity:${this.entity}`)
        }

        try {

            if (!title) throw ('Bucket not added, {title} missing')

            const dummyItem = ({ title }) => {
                return {
                    id: v4(),
                    title,
                    status: 'pending', // [pending/completed]
                    created_at: '',
                    subtasks: []
                }
            }

            let bucket = new Bucket(dummyItem({ title }))

            runInAction(() => {
                // add another bucket          
                this.todos.push(bucket)
            })

            return this.todos.length

        } catch (err) {
            onerror(err)
        }

        return 0
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
            if (!title) throw ('subtask not added, {title} missing')
            if (!id) throw ('subtask not added, {id} missing')

            const dummyItem = ({ title }) => {
                return {
                    todo_id: v4(),
                    title,
                    status: 'pending', // [pending/completed]
                    created_at: ''
                }
            }

            if (this.id !== id) throw (`no BucketStore not found for id:${id}`)

            let todo = new Subtask(dummyItem({ title }))
            // add another subtask
            runInAction(() => {
                this.todos.push(todo)
            })

            return this.todos.length

        } catch (err) {
            onerror('[addSubTask]', err)
        }
        return 0

    }

}

export { BucketStore }
export { Bucket }
export { Subtask }