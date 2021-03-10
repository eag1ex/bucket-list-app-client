import { observable, makeObservable, runInAction } from "mobx"
import { onerror, sq } from 'x-utils-es'
import { BucketStore, Bucket, Subtask } from '../components/Todos/Models'
import { fetchHandler, updateTodoValues, presetPost } from '../utils'
import { api } from './api'
Object.freeze(api) // no mods please!

export default class MobXStoreAPI {

    todoData = []
    state = "pending" // "pending", "ready", "error", "updating", "update-error"

    childStoresAvailable = {
        bucketStore: sq()
    }

    childstores = {
        // these stores become available after rendering
        bucketStore: null
    }

    constructor() {

        makeObservable(this.childStoresAvailable, {
            bucketStore: observable
        })

    }
  
    // async fetchTodo() {

    //     this.todoData = []
    //     this.state = "pending"
    //     await delay(2000) // fake loading
    //     import('./dummy.data').then(
    //         action("fetchSuccess", todos => {
    //             this.todoData = todos.todoList
    //             this.state = "ready"
    //         }),
    //         action("fetchError", error => {
    //             this.state = "error"
    //         })
    //     )
    // }
    
    /**
     * fetch initial buckets from the server
     */
    fetch_bucketListGet() {

        this.state = 'pending'
        this.todoData = []
        return fetch(api.bucketList(), {
            method: 'GET', headers: { 'Content-Type': 'application/json;charset=utf-8' }
        }).then(fetchHandler)
            .then(({ response, code }) => {
                // NOTE prefer this approche, more readable 
                runInAction(() => {
                    this.todoData = response || []
                    this.todoData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    console.log('this.todoData', this.todoData)
                    this.state = "ready"
                })
            }).catch(err => {

                runInAction(() => {
                    this.state = "error"
                })
                onerror('[fetch_bucketListGet]', err)
            })
    }

    /**
     * Request to create new Bucket
     * Add new bucket to todoData[]
     * @param {*} {title}
     * @memberof MobXStoreAPI
     */
    fetch_createBucketPost({ title }) {
        // this.state = "updating"
        return fetch(api.createBucket(), presetPost({ title })).then(fetchHandler)
            .then(({ response, code }) => {

                runInAction(() => {
                    this.todoData.push(response)
                })

                return response

            }).catch(err => {

                // runInAction(() => {
                //     this.state = "update-error"
                // })

                onerror('[fetch_createBucketPost]', err)
            })
    }

    /**
    * Request to create new Subtask that belongs on current bucket
    * @param {*} {title}
    * @param {*} id bucket id
    * @memberof MobXStoreAPI
    */
    fetch_createSubtaskPost({ title }, id) {

        // this.state = "updating"
        return fetch(api.createSubtask(id), presetPost({ title })).then(fetchHandler)
            .then(({ response, code }) => {

                runInAction(() => {

                    this.todoData = (this.todoData || []).map(todo => {
                        if (todo.id === id) todo = response
                        return todo
                    })

                    this._addSubToBucket(response, id)
                })

                return response

            }).catch(err => {

                // runInAction(() => {
                //     this.state = "update-error"
                // })

                onerror('[fetch_createSubtaskPost]', err)
            })
    }

    /**
    * fetch update, and reset todoData
    * @param {*} {title}
    * @param {*} id bucket id
    * @memberof MobXStoreAPI
    */
    fetch_updateBucketStatusPost({ status }, id) {

        return fetch(api.updateBucketStatus(id), presetPost({ status })).then(fetchHandler)
            .then(({ response, code }) => {

                runInAction(() => {
                    this.todoData = this.todoData.map(n => {
                        if (n.id === id) n = response
                        return n
                    })
                })

                return response

            }).catch(err => {

                // runInAction(() => {
                //     this.state = "update-error"
                // })

                onerror('[fetch_updateBucketStatusPost]', err)
            })

    }

    /**
    * fetch update, and reset todoData
    * @param {*} {title}
    * @param {*} todo_id subtask id
    * @memberof MobXStoreAPI
    */
    fetch_updateSubtaskStatusPost({ status }, todo_id) {
        return fetch(api.updateSubtaskStatus(todo_id), presetPost({ status })).then(fetchHandler)
            .then(({ response, code }) => {

                runInAction(() => {

                    this.todoData = this.todoData.map(n => {
                        if (n.id === todo_id) n = response
                        return n
                    })
                })

                return response

            }).catch(err => {

                // runInAction(() => {
                //     this.state = "update-error"
                // })

                onerror('[updateSubtaskStatusPost]', err)
            })
    }

    /**
     * update store and bucket directly without rerendering component
     * @param {*} response 
     * @param {*} id 
     */
    _addSubToBucket(response, id) {
        if (this.childstores.bucketStore instanceof BucketStore) {
            this.childstores.bucketStore.todos = this.childstores.bucketStore.todos.map(todo => {
                if (todo.id === id) {
                    if (todo instanceof Bucket) {
                        todo.addSubtask(response)
                    }
                }
                return todo
            })
        }
    }

    /**
     * update store and bucket directly without rerendering component
     * @param {*} response 
     * @param {*} id 
     */
    _updateBucket(response, id, childStore) {
        if (childStore instanceof BucketStore) {
            childStore.todos = childStore.todos.map(todo => {
                if (todo.id === id) {
                    if (todo instanceof Bucket) {
                        todo = updateTodoValues(response, todo)

                    }
                }
                return todo
            })
        }
    }

    /**
     * update store and subtask directly without rerendering component
     * @param {*} response 
     * @param {*} todo_id 
     */
    _updateSubtask(response, todo_id, subTaskStore) {
        if (subTaskStore instanceof BucketStore) {
            subTaskStore.todos = subTaskStore.todos.map(todo => {
                if (todo instanceof Subtask) {
                    if (todo.todo_id === todo_id) {
                        todo.updateSubtask(response)
                    }
                }
                return todo
            })
        }
    }
}