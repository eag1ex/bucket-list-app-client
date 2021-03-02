import React, { PureComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import CommentIcon from '@material-ui/icons/Comment';
import CircularProgress from '@material-ui/core/CircularProgress';
import TodoSubList from './TodoSubList';
import Accord from './Accordion.hoc';

import { delay, log } from 'x-utils-es'
const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: theme.palette.background.paper,
    },
}));

export default class TodoListComponent extends PureComponent {

    constructor(props, context) {
        super(props);
        this.state = {
            todoList: []
        }

        this.loadList()
    }

    async loadList() {

        const todoData = await import('../data/dummy.data')

        //const response = await fetch('');
        await delay(2000); // For demo purposes.
        this.setState({ todoList: todoData.todoList })
    }

    list({ onUpdate, todoList }) {


        const classes = useStyles();
        const [checked, setChecked] = React.useState([0]);

        // update initial checked states
        todoList.filter(n => {
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
                    {list.map((item, inx) => {
                        // simplified hoc
                        return (<Accord
                            key={item.id}
                            Todos={ () => (<Slot item={item} inx={inx} />)} />
                        )


                    })}
                </List>
            );
        }


        function Slot({ item, inx }) {
            let { id, title, status, created_at, subtasks } = item
            const labelId = `checkbox-list-label-${inx}`;
            return (
                <div>



                    <ListItem role={undefined} dense button onClick={handleToggle(id)}>
                        <ListItemIcon>
                            <Checkbox
                                edge="start"
                                checked={checked.indexOf(id) !== -1}
                                tabIndex={-1}
                                disableRipple
                                inputProps={{ 'aria-labelledby': labelId }}
                            />
                        </ListItemIcon>
                        <ListItemText id={labelId} primary={title} />

                        <ListItemSecondaryAction>
                            <IconButton edge="end" aria-label="comments">
                                <CommentIcon />

                            </IconButton>

                        </ListItemSecondaryAction>
                    </ListItem>

                    <div className="mx-2 d-flex justify-content-center m-auto">
                        {!subtasks.length ? null : <TodoSubList onUpdate={onUpdate} subtasks={subtasks} />}
                    </div>

                </div>
            );
        }


        return (<React.Fragment>
            { !todoList.length ? <CircularProgress color="inherit" size={20} /> : <ListItems list={todoList} />}
        </React.Fragment>)
    }

    updateList(id, status) {

        this.state.todoList.forEach(el => {
            if (el.id === id && status === 'add') el.checked = true
            if (el.id === id && status === 'remove') el.checked = false
        })

        this.setState({ todoList: this.state.todoList })
    }

    render() {

        return (
            <this.list onUpdate={this.updateList.bind(this)} todoList={this.state.todoList} />
        )
    }
}
