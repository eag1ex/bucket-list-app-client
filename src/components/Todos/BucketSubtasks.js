
import { makeStyles } from '@material-ui/core/styles'
import React from 'react'
import { observer } from "mobx-react-lite"
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Checkbox from '@material-ui/core/Checkbox'
import { BucketStore as SubTaskStore } from './Models'
import Input from '../Input'

const useStyles = makeStyles((theme) => ({
    root: {
        // width: '100%', 
        //  maxWidth: 380,
        backgroundColor: theme.palette.background.paper
    }
}))

const SubTaskView = observer(({ todo, inx, onUpdate, subTaskStore, currentCount, onCurrentCount }) => {

    // callback to <BucketView/>
    const [didLoad, setDidLoad] = React.useState(false)
    React.useEffect(() => {
        if (!didLoad) {
            currentCount(subTaskStore.finishedCount)
            setDidLoad(true)
        }
    }, [didLoad, currentCount, subTaskStore.finishedCount])

    const labelId = `subtask-item checkbox-list-label-${inx}`
    return (<ListItem

        key={todo.todo_id}
        role={undefined} dense button
        onClick={(e => {
            todo.toggle()
            onUpdate(todo, todo.todo_id, 'subtask', 'statusChange', subTaskStore) // hoc call to Bucket
            onCurrentCount() // execute change only
            e.stopPropagation()
        })}>
        <ListItemIcon>
            <Checkbox
                edge="start"
                checked={todo.finished}
                tabIndex={-1}
                inputProps={{ 'aria-labelledby': labelId }}
            />
        </ListItemIcon>
        <ListItemText id={labelId} primary={todo.title} />
    </ListItem>)
})

const SubTasksListView = observer(({ subTaskStore, inx, onUpdate, currentCount, onCurrentCount }) => {

    const classes = useStyles()
    return (<List className={classes.root + ` m-auto subtask-list`}>
        {subTaskStore.todos.map(todo => (
            <SubTaskView onCurrentCount={onCurrentCount} currentCount={currentCount} todo={todo} key={todo.todo_id} inx={inx} onUpdate={onUpdate} subTaskStore={subTaskStore} />
        ))}

        <div className="d-flex justify-content-between align-items-center flex-row subtask-item">

            <Input variantName='standard'
                text='Add List'
                style={{ "& input": { padding: "3px 0 5px" } }}
                id={subTaskStore.id}
                entity='subtask'
                childStore={subTaskStore}
                onUpdate={onUpdate} // we need to handle add new update events as well
                add={true} // tells the input to add <Add/> component
            />
        </div>

    </List>)
})

const SubtaskComponent = (props) => {
    const { subtasks, id, onUpdate, onCurrentCount, currentCount } = props
    const subTaskStore = new SubTaskStore(subtasks || [], { id, entity: 'SubTaskStore' })
    return (<SubTasksListView currentCount={currentCount} onCurrentCount={() => onCurrentCount(subTaskStore.finishedCount)} subTaskStore={subTaskStore} onUpdate={onUpdate} />)
}

export default SubtaskComponent
