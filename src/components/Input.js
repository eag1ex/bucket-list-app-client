import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Add from './Add'

const useStyles = (opts = {}) => makeStyles((theme) => {
    let o = {
        root: {
            backgroundColor: theme.palette.background.paper,
            '& > *': {
                margin: theme.spacing(1),
                width: '25ch'
            },
            '& .outlined-basic.form-control': {
                background: 'transparent'
            },
            ...(opts.style ? opts.style : {})
        }
    }
    return o
})()

export default function BasicTextFields({ className, entity, add, childStore, text, style, variantName = "outlined", value, onUpdate, id }) {

    const classes = useStyles({ style })
    const [inputName, setInputName] = React.useState('')

    return (
        <form

            value={inputName}
            onChange={(event) => {
                let value = (event.target.value || '')
       
                if (onUpdate) {
                    // disable for now
                    // onUpdate({ value }, id, entity, 'inputTitle', childStore, () => {
                    // }) 
                }
                setInputName(value)
          
            }}

            onSubmit={(event) => {      
                let eventName = entity === 'subtask' ? 'addSubtask' : 'addBucket'

                onUpdate({ title: inputName }, id, entity, eventName, childStore, () => {
                    setInputName('')
                })
    
                event.stopPropagation()
                event.preventDefault()
                return false
            }}

            className={classes.root + " " + className} noValidate autoComplete="off">

            <React.Fragment>
                {add ? (
                    <div className="input-group mb-3 mr-1">
                        <TextField
                            value={inputName}
                            className="outlined-basic form-control " label={text} variant={variantName} />
                        <Add

                            actionAdd={() => {

                                let eventName = entity === 'subtask' ? 'addSubtask' : 'addBucket'
                 
                                onUpdate({ title: inputName }, id, entity, eventName, childStore, () => {
                                    setInputName('')
                                })
                            }}

                            style={
                                {
                                    '& .MuiFab-root': {
                                        width: '34px',
                                        height: '34px'

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
    )
}
