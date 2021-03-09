import React from "react";
import { action } from "mobx";
import { observer } from "mobx-react-lite";
import CircularProgress from '@material-ui/core/CircularProgress';
import { Bucket, BucketStore } from './Models'
import { makeStyles } from '@material-ui/core/styles';
import Accordion from './Accordion'
import List from '@material-ui/core/List';
// import { todoList as todoData } from '../../store/dummy.data' // initial dummy data
import Checkbox from '@material-ui/core/Checkbox';
import BucketSubTasks from './BucketSubtasks';
import Message from '../Messages'

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    // maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
}));


const BucketView = observer(({ todo, onUpdate, mobxstore, bucketStore }) => {
  // eslint-disable-next-line no-empty
  if (!todo.finished === false) { } // hack fix



  return (
    <div className="d-flex justify-content-center m-auto px-3 py-2">
      <Accordion
        Check={() => (
          <Checkbox
            onClick={action(e => {
              let status = todo.toggle() ? 'completed' : 'pending'
              onUpdate({ status }, todo.id, 'bucket', 'statusChange', bucketStore)
              e.stopPropagation()
            })}
            checked={todo.finished}
            edge="start"
          />
        )}
  
        item={todo}
        SubTasks={() => (<BucketSubTasks mobxstore={mobxstore} subtasks={todo.subtasks || []} id={todo.id} onUpdate={(data, id, entity, eventName, childStore, onDone) => {
          todo.onUpdate(data, entity, eventName)
          onUpdate(data, id, 'subtask', eventName, childStore, onDone)
        }} />)}
      />
    </div>
  )
});

const BucketListView = observer(({ bucketStore, mobxstore, onUpdate }) => {
  const classes = useStyles()
  return (<List className={classes.root + ` m-auto`}>
    {bucketStore.todos.map(todo => (
      <BucketView todo={todo} key={todo.id} onUpdate={onUpdate} mobxstore={mobxstore} bucketStore={bucketStore} />
    ))}
    <small className="strong">Tasks left: {bucketStore.unfinishedCount}</small>
  </List>)
});


const BucketComponent = (props) => {
  const { mobxstore, onUpdate } = props

  if (mobxstore.state === 'ready' || mobxstore.state === 'updating') {

    // NOTE adding store dataList to each Bucket model via BucketStore
    const bucketStore = new BucketStore(mobxstore.todoData || [], { entity: 'BucketStore' });
    mobxstore.childstores.bucketStore = bucketStore
    mobxstore.childStoresAvailable.bucketStore.resolve(true)


    if (bucketStore.state === 'ready') {
      return (<BucketListView bucketStore={bucketStore} mobxstore={props.mobxstore} onUpdate={onUpdate} />)
    }

    if (bucketStore.state === 'error') {
      return (<Message type='error' value='No data for Bucket Store' />)
    }
    else {
      return (<CircularProgress color="inherit" size={20} />)
    }
  }

  else return (<CircularProgress color="inherit" size={20} />)
}

export default BucketComponent
