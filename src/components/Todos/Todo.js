import React, { useState } from "react";

import { observer } from "mobx-react-lite";
import Message from '../Messages';
import { Bucket, BucketList } from './Models'
import { makeStyles } from '@material-ui/core/styles';
import Accordion from './Accordion'
import List from '@material-ui/core/List';
import { todoList as todoData } from '../../data'
import Checkbox from '@material-ui/core/Checkbox';
import TodoSubTasks from './TodoSubtasks';
import { log,copy } from 'x-utils-es';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    // maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
}));


const BucketView = observer(({ todo }) => {
  if (!todo.finished === false) { } // hack fix

  return (
    <div className="d-flex justify-content-center m-auto px-3">
      <Accordion
        Check={() => (
          <Checkbox
            onClick={() => {
              if (todo.toggle()) todo.setSubTasksStatus('completed')
              else todo.setSubTasksStatus('pending')
            }}
            //defaultChecked={todo.finished}
            checked={todo.finished}
            edge="start"
          />
        )}
        item={todo}
        SubTasks={() => (<TodoSubTasks subtasks={todo.subtasks || []} id={todo.id} onUpdate={(data) => todo.onUpdate(data)} />)}
      />
    </div>
  )
});

const BucketListView = observer(({ todoList,mobxstore }) => {
  const classes = useStyles()
  return (<List className={classes.root + ` m-auto`}>
    {todoList.todos.map(todo => (
      <BucketView todo={todo} key={todo.id}/>
    ))}
    <small className="strong">Tasks left: {todoList.unfinishedTodoCount}</small>
  </List>)
});


const bucketStore = new BucketList(copy(todoData).map(n => new Bucket(n)),{entity:'BucketList'});
const Todo = (props) => {
  console.log('Todo/props', props.mobxstore)
  // TODO add call back action/hook to add store item to bucket list
  return (<BucketListView todoList={bucketStore} mobxstore={props.mobxstore} />)
}
const withTodo =  (TodoComp)=>{
  const Hoc = observer(({ mobxstore }) => {      
    console.log('withTodo/mobxstore',mobxstore)

    //  if(mobxstore.state==='ready') return (<Component mobxstore={mobxstore} />)
     // else return (<CircularProgress color="inherit" size={20} />)
     return (<TodoComp mobxstore={mobxstore} />)
  })
  return Hoc
}

export default withTodo(Todo)
