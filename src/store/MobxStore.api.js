import { action, observable, makeObservable, runInAction } from "mobx"
import { delay, onerror, sq, log } from 'x-utils-es'
import { BucketStore, Bucket, Subtask } from '../components/Todos/Models'
import { fetchHandler, updateTodoValues } from '../utils'
import { api } from './api';
Object.freeze(api) // no mods please!

export default class MobXStoreAPI {

    todoData = []
    state = "pending" // "pending", "ready", "error", "updating", "update-error"


    childStoresAvailable = {
        bucketStore: sq(),
        subTaskStore: sq()
    }

    childstores = {
        // these stores become available after rendering and when resolved by {childStoresAvailable}
        bucketStore: null,
        subTaskStore: null
    }

    constructor() {

        makeObservable(this.childStoresAvailable, {
            bucketStore: observable,
            subTaskStore: observable
        })

    }

    postData(data) {
        return {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(data)
        }
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
        //this.state = "updating"
        return fetch(api.createBucket(), this.postData({ title })).then(fetchHandler)
            .then(({ response, code }) => {

                runInAction(() => {
                    this.todoData.push(response)
                })

                return response

            }).catch(err => {

                // runInAction(() => {
                //     this.state = "update-error"
                // })

                onerror('[createBucketPost]', err)
            })
    }

    /**
    * Request to create new Subtask that belongs on current bucket
    * @param {*} {title}
    * @param {*} id bucket id
    * @memberof MobXStoreAPI
    */
    createSubtaskPost({ title }, id) {

        //this.state = "updating"
        return fetch(api.createSubtask(id), this.postData({ title })).then(fetchHandler)
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

                onerror('[createSubtaskPost]', err)
            })
    }


    bucketListGet() {
        // https://javascript.info/fetch
        this.state = 'pending'
        this.todoData = [];
        return fetch(api.bucketList(), {
            method: 'GET', headers: { 'Content-Type': 'application/json;charset=utf-8' },
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

    /**
    * Request to update Bucket and all subtasks based on status
    * @param {*} {title}
    * @param {*} id bucket id
    * @memberof MobXStoreAPI
    */
    updateBucketStatusPost({ status }, id) {

        //this.state = "updating"
        return fetch(api.updateBucketStatus(id), this.postData({ status })).then(fetchHandler)
            .then(({ response, code }) => {

                runInAction(() => {
                    this.todoData = this.todoData.map(n => {
                        if (n.id === id) n = response
                        return n
                    })

                    this._updateBucket(response, id)

                })

                return response

            }).catch(err => {

                // runInAction(() => {
                //     this.state = "update-error"
                // })

                onerror('[updateBucketStatusPost]', err)
            })

    }

    /**
    * Request to update subtask status
    * @param {*} {title}
    * @param {*} todo_id subtask id
    * @memberof MobXStoreAPI
    */
    updateSubtaskStatusPost({ status }, todo_id) {
        return fetch(api.updateSubtaskStatus(todo_id), this.postData({ status })).then(fetchHandler)
            .then(({ response, code }) => {

                runInAction(() => {

                    this.todoData = this.todoData.map(n => {
                        if (n.id === todo_id) n = response
                        return n
                    })

                    this._updateSubtask(response, todo_id)

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
     * Update bucket data from response
     * @param {*} response 
     * @param {*} id 
     */
    _updateBucket(response, id) {
        if (this.childstores.bucketStore instanceof BucketStore) {
            this.childstores.bucketStore.todos = this.childstores.bucketStore.todos.map(todo => {
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
     * Update subtask data from response
     * @param {*} response 
     * @param {*} todo_id 
     */
    _updateSubtask(response, todo_id) {
        if (this.childstores.subTaskStore instanceof BucketStore) {
            this.childstores.subTaskStore.todos = this.childstores.subTaskStore.todos.map(todo => {
                if (todo instanceof Subtask) {
                    if (todo.todo_id === todo_id) {
                        todo.updateSubtask(response)
                        log('updated todo ?', todo, response)
                    }
                }
                return todo
            })
        }
    }
}
