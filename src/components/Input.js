import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

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

export default function BasicTextFields({text,style,variantName="outlined"}) {

  const classes = useStyles({style});
  return (
    <form className={classes.root} noValidate autoComplete="off">
      <TextField className="outlined-basic" label={text} variant={variantName}  />
    </form>
  );
}
