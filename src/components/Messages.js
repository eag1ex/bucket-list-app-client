import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Alert from '@material-ui/lab/Alert'

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        '& > * + *': {
            marginTop: theme.spacing(2)
        }
    }
}))

/**
 *  `<Message type='' value=''/>`  types: [error,info,success]
 * display message based on props
 * @param {*} props //type,value 
 */
export default function Messages(props) {
    const classes = useStyles()
    const type = props.type
    const message = props.value

    if (!message) return null
    return (
        <div className={classes.root + ' mx-1'}>
            {type === 'error' ? (<Alert severity="error">{message}</Alert>) : type === 'warning' ? (<Alert severity="warning">{message}</Alert>)
                : type === 'info' ? (<Alert severity="info">{message}</Alert>)
                    : type === 'success' ? (<Alert severity="success">{message}</Alert>) : null}  
        </div>
    )
}
