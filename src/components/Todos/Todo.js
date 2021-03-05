import React, { useState } from "react";

import { observer } from "mobx-react-lite";
import Message from '../Messages';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Bucket, BucketStore } from './Models'
import { makeStyles } from '@material-ui/core/styles';
import Accordion from './Accordion'
import List from '@material-ui/core/List';
import { todoList as todoData } from '../../store/dummy.data'
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
  // eslint-disable-next-line no-empty
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


const bucketStore = new BucketStore(copy(todoData).map(n => new Bucket(n)),{entity:'BucketStore'});

export default (props) => {
  const { mobxstore } = props
  if (mobxstore.state === 'ready') {
    mobxstore.bucketStore.self =  bucketStore 
    mobxstore.bucketStore.onReady =1
    
    return (<BucketListView todoList={bucketStore} mobxstore={props.mobxstore} />)
  }
  else return (<CircularProgress color="inherit" size={20} />)
}

