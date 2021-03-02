import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import Input from './Input';
import Add from './Add';

import CircularProgress from '@material-ui/core/CircularProgress';
//import { delay, log } from 'x-utils-es'

const useStyles = makeStyles((theme) => ({
    root: {
       // width: '100%',
        maxWidth: 360,
        backgroundColor: theme.palette.background.paper,
    },
}));


export default function TodoSubList({ onUpdate, subtasks }) {


    const classes = useStyles();
    const [checked, setChecked] = React.useState([0]);

    // update initial checked states
    subtasks.filter(n => {
        if (n.checked && checked.indexOf(n.id) == -1) checked.push(n.id)
    })


    const handleToggle = (id) => () => {
        const currentIndex = checked.indexOf(id);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(id);
            // 
            onUpdate(id, 'add')

        } else {
            newChecked.splice(currentIndex, 1);
            onUpdate(id, 'remove')
        }

        setChecked(newChecked);
    };





    function ListItems({ list }) {

        return (
            <List className={classes.root + ` m-auto`}>

                {list.length? list.map((item, inx) => {
                    let { todo_id, title, status, created_at } = item

                    const labelId = `checkbox-list-label-${inx}`;

                    return (
                        <ListItem key={todo_id} role={undefined} dense button onClick={handleToggle(todo_id)}>
                            <ListItemIcon>
                                <Checkbox
                                    edge="start"
                                    checked={checked.indexOf(todo_id) !== -1}
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{ 'aria-labelledby': labelId }}
                                />
                            </ListItemIcon>
                            <ListItemText id={labelId} primary={title} />            

                        </ListItem>
                    );
                }):null}

                <div className="d-flex justify-content-between align-items-center flex-row">

                    <Input variantName='standard'
                        text='New milestone'
                        style={{ "& input": { padding: "3px 0 5px" } }} />

                    <Add  style={
                            { '& .MuiFab-root': {
                                width: '34px',
                                height: '34px'}
                            }
                        } />
                </div>
                
            </List>
        );
    }

    return (<React.Fragment>
        { !subtasks.length ? <CircularProgress color="inherit" size={20} /> : <ListItems list={subtasks} />}
    </React.Fragment>)
}

