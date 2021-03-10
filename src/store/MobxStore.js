import { action, observable, makeObservable, observe } from "mobx"
import { log, onerror } from 'x-utils-es'
import { BucketStore } from '../components/Todos/Models'
import MobXStoreAPI from './MobxStore.api'
import { tasksComplete } from '../utils'

// TODO add server upkeep check  

export default class MobXStore extends MobXStoreAPI {

    constructor() {
        super()

        makeObservable(this, {
            todoData: observable,
            state: observable,
            onUpdate: action,
            fetch_bucketListGet: action
        })

        // NOTE get initial bucket data from server
        this.fetch_bucketListGet()

        observe(this, 'todoData', change => {
            log(`[todoData][updated]`)
        })
    }

    /**
     * 
     * @param {*} data data as object transmited
     * @param {*} id id that belongs to each entity, except for homeComponent
     * @param {*} entity [homeComponent','bucket','subtask']
     * @param {*} eventName [addBucket ','addSubtask','subtask','inputTitle,statusChange,statusNoChange]
     * @param {*} childStore current store instance during execution, 
     */
    async onUpdate(data = {}, id, entity, eventName, childStore, onDone) {

        let entities = ['homeComponent', 'bucket', 'subtask']
        if (!onDone) onDone = function () { }

        let doSwitch = async (ent) => {
            let done = {}
            switch (ent) {
                case 'homeComponent': {

                    // disabled
                    // if (eventName === 'inputTitle') {
                    //     // on input type and change set
                    // }

                    if (eventName === 'addBucket') {
                        let r = await this.addBucket_and_fetch(data)
                        if (r) onDone(true)
                        else {
                            done = {
                                fail: true,
                                message: 'addBucket_and_fetch no completed'
                            }
                        }
                    }

                    break
                }

                case 'bucket': {

                    // eslint-disable-next-line no-empty
                    if (eventName === 'statusNoChange') {}

                    if (eventName === 'statusChange') {
                        let r = await this.fetch_updateBucketStatusPost({ status: data.status }, id)
                        if (r) {
                            this._updateBucket(r, id, childStore)
                        } else {
                            done = {
                                fail: true,
                                message: 'fetch_updateBucketStatusPost not complete'
                            }
                        }
                    }

                    break
                }

                case 'subtask': {

                    if (eventName === 'statusChange') {

                        let r = await this.fetch_updateSubtaskStatusPost({ status: data.status }, id)
                        if (r) {

                            this._updateSubtask(r, id, childStore)

                            // when all subtasks are completed/ or still pending, make another fetch and update bucket status to complete
      
                            let bucketID = childStore.id
                            let status = tasksComplete(childStore.todos) ? 'completed' : 'pending'
                            if (!await this.fetch_updateBucketOnlyStatus({ status }, bucketID)) {
                                done = {
                                    fail: true,
                                    message: 'fetch_updateSubtaskStatusPost > fetch_updateBucketOnlyStatus not complete'
                                }
                            }
                            
                            onDone(true)
                        } else {
                            done = {
                                fail: true,
                                message: 'fetch_updateSubtaskStatusPost not complete'
                            }
                        }
                    }

                    if (eventName === 'addSubtask') {
                        if (await this.addSubtask_and_fetch(data, childStore)) onDone(true)
                        else {
                            done = {
                                fail: true,
                                message: 'addSubtask not complete'
                            }
                        }
                    }

                    break
                }

                default: {
                    done = {
                        fail: true,
                        message: `no entity matched for: ${entity}`
                    }
                }
            }

            if (!done) {
                done = {
                    pass: true
                }
            }

            return done
        }

        for (let ent of entities) {
            if (ent !== entity) continue
            let o = doSwitch(ent)
            if (o) {
                if (o.fail) onerror('[MobXStore][onUpdate]', o.message)
            }
        }

        log('[MobXStore][onUpdate]', '[data][id][entity][childStore][eventName][?onDone]')
    }

    /**
     * The store gains access to BucketStore after <BucketComponent/> is loaded
     * @param {*} data 
     */
    async addBucket_and_fetch({ title }) {

        await this.childStoresAvailable.bucketStore.promise
        if (this.childstores.bucketStore instanceof BucketStore) {
            // execute bucketStore addNewBucket
            // wait for server response 
            // perform lazy callback    
            let bucketItem = this.childstores.bucketStore.addNewBucket({ title }, ({ title }) => {
                return this.fetch_createBucketPost({ title }).then(n => {
                    if (!n) return Promise.reject('addBucket,No data available')
                    else return n
                }).catch(onerror)
            })
            return bucketItem
        }
        return false
    }

    /**
    * The store gains access to SubtaskStore after <BucketSubTasks/> is loaded
    * @param {*} data 
    */
    async addSubtask_and_fetch({ title }, childStore) {
     
        // just a reminder, we are using same class for both {BucketStore} and {subTaskStore}
        // the only difference is the {entity}
       
        if (childStore instanceof BucketStore && childStore.entity === 'SubTaskStore') {

            // execute subTaskStore addNewSubTask
            // wait for server response 
            // perform lazy callback    
            const bucketId = childStore.id

            let subtaskItem = childStore.addNewSubTask({ title }, ({ title }) => {
                
                return this.fetch_createSubtaskPost({ title }, bucketId).then(n => {
                    if (!n) return Promise.reject('addSubtask, No data available')
                    else return n
                }).catch(onerror)
            })

            return subtaskItem
        }
        return false
    }

}
