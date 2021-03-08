import { action, observable, makeObservable, runInAction, observe } from "mobx"
import { log, delay, onerror, sq,isObject } from 'x-utils-es'
import { BucketStore } from '../components/Todos/Models'
import {fetchHandler} from '../utils'
import {api} from './api';

Object.freeze(api) // no mods please!


class MobXStoreAPI{

    todoData = []
    state = "pending" // "pending", "ready", "error", "updating", "update-error"

    constructor(){

    }

    async fetchTodo() {
    
        this.todoData = [];
        this.state = "pending"
        await delay(2000) // fake loading
        import('./dummy.data').then(
            action("fetchSuccess", todos => {
                this.todoData = todos.todoList
                this.state = "ready"
            }),
            action("fetchError", error => {
                this.state = "error"
            })
        )
    }
    
    /**
     * Request to create new Bucket
     * Add new bucket to todoData[]
     * @param {*} {title}
     * @memberof MobXStoreAPI
     */
    createBucketPost({ title }) {

        let opts = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({ title })
        }
        //this.state = "updating"
        return fetch(api.createBucket(), opts).then(fetchHandler)
            .then(({ response, code }) => {

                runInAction(() => {
                    this.todoData.push(response)
                })
                return response

            }).catch(err => {

                runInAction(() => {
                    this.state = "update-error"
                })

                onerror('[createBucketPost]', err)
            })
    }


    bucketListGet() {
        // https://javascript.info/fetch
        this.state = 'pending'
        this.todoData = [];
        return fetch(api.bucketList(), {
            method: 'GET', headers: { 'Content-Type': 'application/json' },
        }).then(fetchHandler)
            .then(({ response, code }) => {
                // NOTE prefer this approche, more readable 
                runInAction(() => {
                    this.todoData = response
                    this.state = "ready"
                })
            }).catch(err => {

                runInAction(() => {
                    this.state = "error"
                })
                onerror('[bucketListGet]', err)
            })
    }
}


export default class MobXStore extends MobXStoreAPI {

    dispatchValue = null

    bucketStore = {
        defer: sq(), // to be safe ew can check it realy there
        onReady: 0, // 0 or 1
        self: null
    }

    constructor() {
        super()
        makeObservable(this, {
            todoData: observable,
            state: observable,
            //fetchTodo: action,
            dispatchValue: observable,
            dispatch: action,
            addBucket: action
        });

        makeObservable(this.bucketStore, {
            onReady: observable
        })

        this.bucketListGet()
        //this.fetchTodo() // demo data

        observe(this.bucketStore, 'onReady', change => {
            if (change.newValue === 1) {
                this.bucketStore.defer.resolve(true)
                log('observe/bucketStore/onReady', change, this.bucketStore.self)
            }

        })

    }

    /**
     *
     * gain access to Toto/BucketStore class instance after it was loaded
     * @readonly
     * @memberof BucketStore
     */
    async asyncBucketStore() {
        if (this.bucketStore.self instanceof BucketStore && this.bucketStore.onReady === 1) {
            try {
                await this.bucketStore.defer.promise
                return this.bucketStore.self
            } catch (err) {
                return Promise.reject(err)
            }

        } else {
            onerror('[fromBucketStore]', 'bucketStore.self is not a BucketStore')
            return Promise.reject('bucketStore.self is not a BucketStore')
        }
    }

    /**
     * The store gains access to BucketStore after it is loaded, because <Input/> does not live inside of the Todo/bucket component, hence we need to pass it.
     * @param {*} data 
     */
    addBucket({ title }) {

        // gain access to Bucket store
        return this.asyncBucketStore().then(async(bucketStore) => {   
                // execute Bucket addNewBucket
                // wait for server response 
                // perform lazy callback    
                return bucketStore.addNewBucket({title},({title})=>{
                    return this.createBucketPost({title}).then(n=>{
                        if(!n) return Promise.reject('addBucket,No data available')
                        else return n
                    })
                })              
        }).catch(onerror)
    }

    dispatch(data) {
        this.dispatchValue = data
        log('got data from dispatch', data, this.dispatchValue)
    }
    
}
