import { action, makeAutoObservable,observable,makeObservable,runInAction,observe } from "mobx"
import {log,isFunction,delay} from 'x-utils-es'
// import { todoList as todoData } from '../../data'

export default class MobXStore {
    todoData = []
    state = "pending" // "pending", "ready" or "error"
    dispatchValue = null
    constructor() {
        // makeAutoObservable(this)
      
        makeObservable(this, {

            todoData: observable,
            state: observable,
          //  toggle: action,
            fetchTodo:action,
            dispatchValue:observable,
            dispatch:action,
            addBucket:action,
           // onStateUpdate:action
        });

        this.onStateUpdate_cb = null

        runInAction((d) => {
            this.fetchTodo()         
        })

        // observe(this, 'state', change => {
        //     log('observe/MobXStore/state', change)
        //     if(change.newValue==='ready'){
        //         console.log('this.onStateUpdate_cb?',this.onStateUpdate_cb)
        //         if(this.onStateUpdate_cb ) this.onStateUpdate_cb('ready')
        //     }
        //     //console.log(change.type, change.name, "from", change.oldValue, "to", change.object[change.name])
        // })

    }

    addBucket(data){
        log('[addBucket]',data)
    }

    dispatch(data){     
        this.dispatchValue = data
        log('got data from dispatch',data, this.dispatchValue)
    }

    async fetchTodo() {
        this.todoData = [];
        this.state = "pending"
        await delay(2000) // fake loading
        import('../data').then( 
            action("fetchSuccess", todos => {
                //const filteredProjects = somePreprocessing(projects)
                this.todoData = todos.todoList
                this.state = "ready"

                log('got some data',todos)
            }),
            action("fetchError", error => {
                this.state = "error"
            })
        )
    }
}