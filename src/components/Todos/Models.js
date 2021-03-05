
import { makeObservable, observable, computed, action, observe, runInAction, configure } from "mobx";
import { log, onerror,debug } from 'x-utils-es';
import { tasksComplete, tasksPending } from '../../utils';
import { v4 } from 'uuid';
configure({
    enforceActions: "never"
})

/*
// observe changes
https://mobx.js.org/intercept-and-observe.html
import { when, makeAutoObservable } from "mobx"

class MyResource {
    constructor() {
        makeAutoObservable(this, { dispose: false })
        when(
            // Once...
            () => !this.isVisible,
            // ... then.
            () => this.dispose()
        )
    }

    get isVisible() {
        // Indicate whether this item is visible.
    }

    dispose() {
        // Clean up some resources.
    }
}
* */


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
            log('observe/Subtask/status', change)
            //console.log(change.type, change.name, "from", change.oldValue, "to", change.object[change.name])
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
        this.subtasks = subtasks.map(n => new Subtask(n))


        if (this.status === 'completed') {

            runInAction(() => {
                this.finished = true
                this.setSubTasksStatus('completed')
            })
        }


        observe(this, 'status', change => {
            log('observe/Bucket/status', change)
            if (!change.oldValue) {
                if (change.newValue === 'pending' || change.newValue === 'completed') {
                    runInAction(() => {
                        this.setSubTasksStatus(change.newValue)
                    })
                }
            }
        })

        observe(this, 'subtasks', change => {

            if (tasksComplete(change.newValue)) {

                runInAction(() => {
                    this.status = 'completed'
                    this.finished = true
                    log('[tasksPending]', 'bucket is complete')

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
            this.subtasks = this.subtasks.map(n => {
                n.status = byStatus
                n.finished = byStatus === 'completed' ? true : false
                return n
            })
        }
    }

    updateSubTasks(task) {

        this.subtasks = this.subtasks.map((el) => {
            if (el.todo_id === task.todo_id) {
                el = task
                el.finished = el.status === 'completed' ? true : false

            }
            return el
        })
    }
}


class BucketList {
    todos = [];
    state = "pending" // "pending", "update" "ready" or "error"
    id = ''
    get unfinishedTodoCount() {
        return this.todos.filter(todo => !todo.finished).length;
    }

    /**
     * 
     * @param {*} todos 
     * @param `{id, entity}` id is only availab on entity='SubTaskList'
     */
    constructor(todos, {id, entity}) {
        makeObservable(this, {
            id: observable,
            state:observable,
            todos: observable,
            unfinishedTodoCount: computed,
            // onUpdate:action
            addBucketList:action
        });

        this.entity = entity
        this.id = id
        this.todos = todos;

        observe(this, 'todos', change => {
            log(`[${this.entity}][todos]`, change.newValue)
            //console.log(change.type, change.name, "from", change.oldValue, "to", change.object[change.name])
        })

        observe(this, 'state', change => {
            log(`[${this.entity}][state]`, change.newValue)
            //console.log(change.type, change.name, "from", change.oldValue, "to", change.object[change.name])
        })
        log(`[entity: ${this.entity}] /todos`,this.todos)      
    }

    /**
     * 
     * @param {*} bucketList
     * @returns number of addd buckets 
     */
    addBucketList(bucketList){
        bucketList.forEach((buc,inx)=>{
            this.todos = new Bucket(buc)
            debug('[addBucketList][added]',inx)
        })

        return this.todos.length
    }


    addSubTask({ title }, id) {

        if(this.entity !=='SubTaskList'){
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

            if (this.id !== id) throw (`no BucketList not found for id:${id}`)

            let todo = new Subtask(dummyItem({ title }))
            let todosIndex = this.todos.length
            this.todos = this.todos.concat(todo)
            if (this.todos.length === todosIndex) throw (`todo not added, for id:${id}`)
            return true

        } catch (err) {
            onerror('[addSubTask]', err)
        }
        return false

    }

}

export { BucketList }
export { Bucket }
export { Subtask }