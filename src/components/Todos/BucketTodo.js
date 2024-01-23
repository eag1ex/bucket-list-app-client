
import React from "react"
import { observer } from "mobx-react-lite"
import CircularProgress from '@material-ui/core/CircularProgress'
import { BucketStore } from './Models'
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box'
import { makeStyles } from '@material-ui/core/styles'
import Accordion from './Accordion'
import List from '@material-ui/core/List'

// import { todoList as todoData } from '../../store/dummy.data' //NOTE initial dummy data
import Checkbox from '@material-ui/core/Checkbox'
import BucketSubTasks from './BucketSubtasks'
import Message from '../Messages'
import { purgeDatabase } from '../../utils/utils'
import { delay } from "x-utils-es/umd"

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        // maxWidth: 360,
        backgroundColor: theme.palette.background.paper
    }
}))
// <CircularProgress color="inherit" size={20} />
const BucketView = observer(({ todo, onUpdate, mobxstore, bucketStore }) => {
    // eslint-disable-next-line no-empty
    if (!todo.finished === false) { } // hack fix

    // get subtasks completion count
    const [finishedCount, setCount] = React.useState(0)
 
    const currentCount = (count) => setCount(count)

    return (
        <div className="d-flex justify-content-center m-auto px-3 py-2 bucket-item">
            <Accordion
                Check={() => (
                    <Checkbox
                        onClick={(e) => {                         
                            let status = todo.toggle() ? 'completed' : 'pending'
                            let buck = bucketStore.taskByID(todo.id)
                            // dont emit same event when we dont have any subtasks to perform
                            let eventName = buck.subtasks.length ? 'statusChange' : 'statusNoChange'
                            onUpdate({ status }, todo.id, 'bucket', eventName, bucketStore)

                            e.stopPropagation()
                        }}
                        checked={todo.finished}
                        edge="start"
                    />
                )}

                item={todo}
                finishedCount={finishedCount}        
                SubTasks={() => (<BucketSubTasks onCurrentCount={currentCount} currentCount={(count) => currentCount(count)} mobxstore={mobxstore} subtasks={todo.subtasks || []} id={todo.id} onUpdate={(data, id, entity, eventName, childStore, onDone) => {
     
                    todo.onUpdate(data, entity, eventName)
                    onUpdate(data, id, 'subtask', eventName, childStore, onDone)
                   
                }} />)}
            />
        </div>
    )
})

const BucketListView = observer(({ bucketStore, mobxstore, onUpdate }) => {
    const [deleted, setDelete] = React.useState(0)
    const classes = useStyles()
    return (<><List className={classes.root + ` m-auto bucket-list`}>
        {(bucketStore.todos || []).length ? bucketStore.todos.map(todo => (
            <BucketView todo={todo} key={todo.id} onUpdate={onUpdate} mobxstore={mobxstore} bucketStore={bucketStore} />
        )) : <Message type='info' value='Add a new bucket list :)'/> }

        { ((bucketStore.todos || []).length && bucketStore.unfinishedCount)
            ? (<Message type='info' value={'Tasks left: ' + bucketStore.unfinishedCount}/>) : ((bucketStore.todos || []).length && !bucketStore.unfinishedCount) ? (<Message type='success' value='All done!'/>) : null
        }
    </List><Box style={{ width: '100%', textAlign: 'center', opacity: '40%' }}><Button disabled={deleted === 1} onClick={() => {
        setDelete(1)
        purgeDatabase().then(n => {
            setDelete(2)
            delay(1000).then(n => {
                window.location.reload()
            })
           
        }).catch(n => {
            setDelete(0)
        })
    }} color="error" variant="outlined" size="small" style={{ color: 'red', border: '1px solid red' }} >  {deleted === 1 ? <CircularProgress color="inherit" size={20} /> : 'Delete list' }</Button></Box></>)
})

const BucketComponent = (props) => {
    const { mobxstore, onUpdate } = props

    if (mobxstore.state === 'ready') {

        // NOTE adding store dataList to each Bucket model via BucketStore
        const bucketStore = new BucketStore(mobxstore.todoData || [], { entity: 'BucketStore' })
        mobxstore.childstores.bucketStore = bucketStore
        mobxstore.childStoresAvailable.bucketStore.resolve(true)

        if (bucketStore.state === 'ready') {
            return (<BucketListView bucketStore={bucketStore} mobxstore={props.mobxstore} onUpdate={onUpdate} />)
        }

        if (bucketStore.state === 'error') {
            return (<Message type='error' value='No data for Bucket Store' />)
        } else {
            return (<CircularProgress color="inherit" size={20} />)
        }
    } else return (<CircularProgress color="inherit" size={20} />)
}

export default BucketComponent
