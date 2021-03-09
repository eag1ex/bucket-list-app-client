import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { action } from 'mobx'
import Add from './Add';

//import {log} from 'x-utils-es';

const useStyles = (opts = {}) => makeStyles((theme) => {
  let o = {
    root: {
      '& > *': {
        margin: theme.spacing(1),
        width: '25ch',
      },
      ...(opts.style ? opts.style : {})
    }
  }
  return o
})()

export default function BasicTextFields({ entity,add, childStore, text, style, variantName = "outlined", value, onUpdate, id }) {

  const classes = useStyles({ style });
  const [inputName, setInputName] = React.useState('');

  return (
    <form
      value={inputName}
      onChange={(event) => {
        let value = (event.target.value || '')
       
        if (onUpdate) onUpdate({value},id,entity,'inputTitle',childStore,()=>{
        })
        setInputName(value)
          
      }}

      onSubmit={(event) => {      
        let eventName = entity === 'subtask' ? 'addSubtask' : 'addBucket'

        onUpdate({ title: inputName }, id, entity, eventName,childStore,()=>{
          setInputName('')
        })
    
        event.stopPropagation()
        event.preventDefault()
        return false
      }}

      className={classes.root} noValidate autoComplete="off">

      <React.Fragment>
        {add ? (
          <div className="input-group mb-3 mr-1">
            <TextField
              value={inputName}
              className="outlined-basic form-control " label={text} variant={variantName} />
            <Add

              actionAdd={() => {

                let eventName = entity === 'subtask' ? 'addSubtask' : 'addBucket'
                 
                onUpdate({ title: inputName }, id, entity, eventName, childStore,()=>{
                  setInputName('')
                })
              }}

              style={
                {
                  '& .MuiFab-root': {
                    width: '34px',
                    height: '34px',

                  }
                }
              } />
          </div>
        ) : (<TextField
              value={inputName}
              className="outlined-basic"
              label={text}
              variant={variantName} />)}
      </React.Fragment>

    </form>
  );
}
