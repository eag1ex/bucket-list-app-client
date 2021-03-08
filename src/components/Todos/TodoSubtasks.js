
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { observer } from "mobx-react-lite";
import List from '@material-ui/core/List';
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


const SubTaskView = observer(({ todo, inx, onUpdate }) => {
    // let { todo_id, title, status, created_at } = todo;
    // eslint-disable-next-line no-empty
    if (todo.finished) { }
    const labelId = `checkbox-list-label-${inx}`;
    return (<ListItem
        key={todo.todo_id}
        role={undefined} dense button
        onClick={(event) => {
            event.stopPropagation()
            todo.toggle()
            onUpdate(todo) // hoc call to Bucket
        }}>
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


const SubTasksListView = observer(({ todoList, inx, onUpdate, id }) => {

    const classes = useStyles();

    return (<List className={classes.root + ` m-auto`}>
        {todoList.todos.map(todo => (
            <SubTaskView todo={todo} key={todo.todo_id} inx={inx} onUpdate={onUpdate} id={id} />
        ))}

        <div className="d-flex justify-content-between align-items-center flex-row">

            <Input variantName='standard'
                text='Add List'
                style={{ "& input": { padding: "3px 0 5px" } }}
                id={id}
                add={{todoList}} // tells the input to add <Add/> component
            />
           
        </div>
        <div>Tasks left: {todoList.unfinishedTodoCount}</div>
    </List>)
});


export default (props) => {
    const { subtasks, id, onUpdate } = props
    const store = new SubTaskStore({ id, entity: 'SubTaskStore' });
    store.init(subtasks)

    if (store.state === 'ready') return (<SubTasksListView todoList={store} id={id} onUpdate={onUpdate} />)
    if (store.state === 'error') return (<Message type='error' value='No data for Subtasks' />)
    else return (<CircularProgress color="inherit" size={20} />)
}


