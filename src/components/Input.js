import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
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

export default function BasicTextFields({ add, text, style, variantName = "outlined", value, onUpdate, id, todoList }) {

  const classes = useStyles({ style });
  const [listName, setListName] = React.useState({ text: '' });

  return (
    <form

      onChange={(event) => {
        let value = (event.target.value || '').trim()
        if (add) {
          setListName(value)
          return
        }

        if (!onUpdate) return;
        onUpdate(value)

      }}

      onSubmit={(event) => {
        event.stopPropagation()
        event.preventDefault()
        return false
      }}

      className={classes.root} noValidate autoComplete="off">

      <React.Fragment>
        {add ? (
          <div className="input-group mb-3 mr-1">
            <TextField
              className="outlined-basic form-control " label={text} variant={variantName} />
            <Add
          
              actionAdd={() => {
                let noValue = () => {
                  if (!listName) return true
                  if ((listName || {}).text !== undefined) return true
                  else return false
                }

                if (!noValue()) {

                  if (todoList.addSubTask({ title: listName }, id)) {
                    setListName('')
                  }
                }
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
        ):( <TextField
            className="outlined-basic" label={text} variant={variantName} />)}
      </React.Fragment>

    </form>
  );
}
