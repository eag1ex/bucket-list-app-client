import { action, observable, makeObservable, observe } from "mobx"
import { log, onerror } from 'x-utils-es'
import { BucketStore } from '../components/Todos/Models'
import MobXStoreAPI from './MobxStore.api'

// TODO add server upkeep check  


export default class MobXStore extends MobXStoreAPI {


    constructor() {
        super()

        makeObservable(this, {
            todoData: observable,
            state: observable,
            addBucket: action,
            addSubtask: action,
            onUpdate: action,
            bucketListGet: action,
            createSubtaskPost: action,
            createBucketPost: action,
            updateBucketStatusPost: action
        });



        // NOTE get initial bucket data from server
        this.bucketListGet()


        observe(this, 'todoData', change => {
            log(`[todoData][updated]`)
        })


    }

    /**
     * 
     * @param {*} data data as object transmited
     * @param {*} id id that belongs to each entity, except for homeComponent
     * @param {*} entity [homeComponent','bucket','subtask']
     * @param {*} eventName [addBucket ','addSubtask','subtask','inputTitle,statusChange]
     * @param {*} childStore current store instance during execution, 
     */
    async onUpdate(data = {}, id, entity, eventName, childStore, onDone) {

        let entities = ['homeComponent', 'bucket', 'subtask']
        if(!onDone) onDone = function(){}

        let doSwitch = async (entity) => {
            let done = {}
            switch (entity) {
                case 'homeComponent': {

                    if (eventName === 'inputTitle') {
                        // on input type and change set
                    }

                    if (eventName === 'addBucket') {
                        if (!await this.addBucket(data)) onDone(true)
                        else {
                            done = {
                                fail: true,
                                message: 'bucketStore not available on mobxstore'
                            }
                        }
                    }

                    break
                }

                case 'bucket': {

                    if (eventName === 'statusChange') {
                        if(await this.updateBucketStatusPost({status:data.status},id)){
                            log('bucket/statusChange updated !!')
                        }
                    }

                    break
                }

                case 'subtask': {

                    if (eventName === 'statusChange') {
                        if(await this.updateSubtaskStatusPost({status:data.status},id)){
                            onDone(true)
                            log('subtask/statusChange updated !!')
                        } else {
                            done = {
                                fail: true,
                                message: 'subTaskStore not available on mobxstore'
                            }
                        }
                    }

                    if (eventName === 'addSubtask') {
                        if (await this.addSubtask(data, childStore)) onDone(true)
                        else {
                            done = {
                                fail: true,
                                message: 'subTaskStore not available on mobxstore'
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

        for (let entity of entities) {
            let o = doSwitch(entity)
            if (o) {
                if (o.fail) onerror('[MobXStore][onUpdate]', o.message)
            }
        }

        log('[MobXStore][onUpdate]', data, id, entity, childStore, eventName)
    }

    /**
     * The store gains access to BucketStore after <BucketComponent/> is loaded
     * @param {*} data 
     */
    async addBucket({ title }) {
        await this.childStoresAvailable.bucketStore.promise
        if (this.childstores.bucketStore instanceof BucketStore) {
            // execute bucketStore addNewBucket
            // wait for server response 
            // perform lazy callback    
            let bucketItem = this.childstores.bucketStore.addNewBucket({ title }, ({ title }) => {
                return this.createBucketPost({ title }).then(n => {
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
    async addSubtask({ title }, childStore) {

        // just a reminder, we are using same class for both {BucketStore} and {subTaskStore}
        // the only difference is the {entity}
        if (childStore instanceof BucketStore) {
            // execute subTaskStore addNewSubTask
            // wait for server response 
            // perform lazy callback    
            const bucketId = childStore.id
            let subtaskItem = childStore.addNewSubTask({ title }, ({ title }) => {
                return this.createSubtaskPost({ title }, bucketId).then(n => {
                    if (!n) return Promise.reject('addSubtask,No data available')
                    else return n
                }).catch(onerror)
            })

            log('addNewSubTask called', subtaskItem)

            return subtaskItem
        }
        return false
    }


}
