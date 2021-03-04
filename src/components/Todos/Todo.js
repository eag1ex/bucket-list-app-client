import React, { useState } from "react";

import { observer } from "mobx-react-lite";

import { Bucket, BucketList } from './Models'
import { makeStyles } from '@material-ui/core/styles';
import Accordion from './Accordion'
import List from '@material-ui/core/List';
import { todoList as todoData } from '../../data'
import Checkbox from '@material-ui/core/Checkbox';
import TodoSubTasks from './TodoSubtasks';
//import { log } from 'x-utils-es';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
}));



const BucketView = observer(({ todo }) => {
  if (!todo.finished === false) { } // hack fix

  return (
    <div className="mx-2 d-flex justify-content-center m-auto px-2">
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

const BucketListView = observer(({ todoList }) => {
  const classes = useStyles()

  return (<List className={classes.root + ` m-auto`}>
    {todoList.todos.map(todo => (
      <BucketView todo={todo} key={todo.id} />
    ))}
    <small className="strong">Tasks left: {todoList.unfinishedTodoCount}</small>
  </List>)
});

// lazy example: https://mobx.js.org/lazy-observables.html

const store = new BucketList(todoData.map(n => new Bucket(n)));
export default () => (<BucketListView todoList={store} />)

