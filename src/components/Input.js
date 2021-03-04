import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
//import {log} from 'x-utils-es';

const useStyles = (opts = {}) => makeStyles((theme) => {
    let o = {
        root: {
            '& > *': {
                margin: theme.spacing(1),
                width: '25ch',
            },
            ...(opts.style ? opts.style:{})
        }
    }
    return o
})()

export default function BasicTextFields({text,style,variantName="outlined", value, onUpdate}) {

  const classes = useStyles({style});
  return (
    <form 
     onChange={(event)=>{
        if(!onUpdate) return;

        let value = (event.target.value ||'').trim()
          onUpdate(value)   
      }}

      onSubmit={(event)=>{
        event.stopPropagation()
        event.preventDefault()
        return false
      }}

    className={classes.root} noValidate autoComplete="off">
      <TextField 
    
     // defaultValue="Hello World"
      className="outlined-basic" label={text} variant={variantName}  />
    </form>
  );
}
