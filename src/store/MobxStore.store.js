import { action, makeAutoObservable,observable,makeObservable,runInAction,observe } from "mobx"
import {log,isFunction,delay,onerror,sq} from 'x-utils-es'
import {BucketStore} from '../components/Todos/Models'
// import { todoList as todoData } from '../../data'

export default class MobXStore {
    todoData = []
    state = "pending" // "pending", "ready" or "error"
    dispatchValue = null

    bucketStore = {
        defer:sq(), // to be safe ew can check it realy there
        onReady:0, // 0 or 1
        self:null
    }
    
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

        makeObservable(this.bucketStore, {
            onReady:observable
        })

        this.onStateUpdate_cb = null

        runInAction(() => {
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

        observe(this.bucketStore, 'onReady', change => {
            if (change.newValue === 1) {
                this.bucketStore.defer.resolve(true)
                log('observe/bucketStore/onReady', change, this.bucketStore.self)
            }
           
        })

    }
  
    /**
     *
     *  gain access to Toto/BucketStore class instance after it was laoded
     * @readonly
     * @memberof BucketStore
     */
    async asyncBucketStore() {
        if (this.bucketStore.self instanceof BucketStore && this.bucketStore.onReady === 1) {
            try {
                await this.bucketStore.defer.promise
                return this.bucketStore.self
            } catch (err) {
                //
            }

        } else {
            onerror('[fromBucketStore]', 'bucketStore.self is not a BucketStore')
            return {}
        }
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
        import('./dummy.data').then( 
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