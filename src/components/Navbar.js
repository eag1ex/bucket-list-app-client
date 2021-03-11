import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import { delay } from 'x-utils-es/umd'
import Chip from '@material-ui/core/Chip'
import TagFacesIcon from '@material-ui/icons/TagFaces'

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1
    },
    menuButton: {
        marginRight: theme.spacing(2)
    },
    title: {
        flexGrow: 1
    }
}))

function ButtonAppBar() {

    const [userName, setUser] = React.useState('')

    // assign fake user 
    const defaultUser = 'Johndoe'
    delay(3000).then(() => {
        setUser(defaultUser)
    })
  
    const classes = useStyles()

    return (
        <div className={classes.root}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" className={classes.title}>
            Bucket List
                    </Typography>
                    {userName ? (<Chip
                        avatar={<TagFacesIcon />}
                        className="nav-avatar"
                        label={userName}
                        clickable
                        variant="outlined"
                    />) : null}

                </Toolbar>
            </AppBar>
        </div>
    )
}

export default ButtonAppBar
