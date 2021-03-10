import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Fab from '@material-ui/core/Fab'
import AddIcon from '@material-ui/icons/Add'

const useStyles = (opts = {}) => makeStyles((theme) => {
    let o = {
        root: {
   
            '& > *': {
                margin: theme.spacing(1)
            },
            ...(opts.style ? opts.style : {}),
            backgroundColor: theme.palette.background.paper
        },
        extendedIcon: {
            marginRight: theme.spacing(1)
        }
    }
    return o
})()

export default function FloatingActionButtons({ actionAdd, style }) {
    const classes = useStyles({ style })
    const onClick = (event) => (actionAdd ? actionAdd() : null)  

    return (
        <div className={classes.root}>
            <Fab color="primary" aria-label="add">
                <AddIcon onClick={onClick} />
            </Fab>
        </div>
    )
}
