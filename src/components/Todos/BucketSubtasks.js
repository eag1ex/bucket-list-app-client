
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { observer } from "mobx-react-lite";
import List from '@material-ui/core/List';
import { action } from "mobx";
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import CircularProgress from '@material-ui/core/CircularProgress';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import { BucketStore as SubTaskStore } from './Models'
import Message from '../Messages'

import Input from '../Input';


const useStyles = makeStyles((theme) => ({
    root: {
        // width: '100%', 
      //  maxWidth: 380,
        backgroundColor: theme.palette.background.paper,
    },
}));


const SubTaskView = observer(({ todo, inx, onUpdate,subTaskStore }) => {
   
    const labelId = `checkbox-list-label-${inx}`;
    return (<ListItem

        key={todo.todo_id}
        role={undefined} dense button
        onClick={action(e=>{
            todo.toggle()
            onUpdate(todo,todo.todo_id,'subtask','statusChange',subTaskStore) // hoc call to Bucket
            e.stopPropagation()
        })}
        >
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
});


const SubTasksListView = observer(({ subTaskStore, inx, onUpdate }) => {

    const classes = useStyles();
    return (<List className={classes.root + ` m-auto`}>
        {subTaskStore.todos.map(todo => (
            <SubTaskView todo={todo} key={todo.todo_id} inx={inx} onUpdate={onUpdate} subTaskStore={subTaskStore} />
        ))}

        <div className="d-flex justify-content-between align-items-center flex-row">

            <Input variantName='standard'
                text='Add List'
                style={{ "& input": { padding: "3px 0 5px" } }}
                id={subTaskStore.id}
                entity='subtask'
                childStore={subTaskStore}
                onUpdate={onUpdate} // we need to handle add new update events as well
                add={{subTaskStore}} // tells the input to add <Add/> component
            />     
        </div>
 
    </List>)
});


const SubtaskComponent = (props) => {
    const { subtasks, id, onUpdate,mobxstore } = props
    const subTaskStore = new SubTaskStore(subtasks||[],{ id, entity: 'SubTaskStore' });
    mobxstore.childstores.subTaskStore = subTaskStore
    mobxstore.childStoresAvailable.subTaskStore.resolve(true)
    return (<SubTasksListView subTaskStore={subTaskStore} onUpdate={onUpdate} />)
}

export default SubtaskComponent

