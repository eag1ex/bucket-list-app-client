import { makeObservable, observable, action, observe, runInAction, configure } from "mobx"
import { log, copy, warn } from 'x-utils-es'

configure({
    enforceActions: "never"
    // computedRequiresReaction: true,
    // reactionRequiresObservable: true,
    // observableRequiresReaction: true,
    // disableErrorBoundaries: true,
})

export class Subtask {
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

        // initial cleanup
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
