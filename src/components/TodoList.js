import React, { PureComponent, Suspense } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import Checkbox from '@material-ui/core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';
import TodoSubList from './TodoSubList';
import Accord from './Accordion.hoc';

import { delay, log } from 'x-utils-es';
import { statusTypes } from '../utils/utils';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: theme.palette.background.paper,
    },
}));

export default class TodoList extends PureComponent {

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
        // update initial checked states
        todoList.filter(n => {
            if (statusTypes(n.status) && n.checked === undefined) n.checked = true
        })

        const ListSlot = ({ item }) => {

            let { subtasks, id } = item
            return (<div className="mx-2 d-flex justify-content-center m-auto">
                {!subtasks.length ? null : <TodoSubList onUpdate={onUpdate} subtasks={subtasks} id={id} />}
            </div>);
        }

        const ListItems = ({ list }) => {

            return (
                <List className={classes.root + ` m-auto`}>
                    {list.map((item, inx) => {
                        const labelId = `checkbox-list-label-${inx}`;

                        return (<div key={item.id}><Suspense fallback={<div>...</div>}>

                            <Accord

                                Todos={() => (<ListSlot item={item} />)}
                                Check={() => (
                                    <Checkbox
                                        edge="start"

                                        onChange={(event) => {
                                            event.stopPropagation()
                                            if (event.target.checked) {
                                                onUpdate(item.id, 'completed', 'bucket')
                                            } else {
                                                onUpdate(item.id, 'pending', 'bucket')
                                            }
                                        }}

                                        checked={item.checked}
                                        tabIndex={-1}
                                        inputProps={{ 'aria-labelledby': labelId }} />
                                )}

                                item={item}
                                inx={inx}
                            />
                        </Suspense></div>)
                    })}
                </List>
            );
        }

        return (<React.Fragment>
            { !todoList.length ? <CircularProgress color="inherit" size={20} /> : <ListItems onUpdate={onUpdate} list={todoList} />}
        </React.Fragment>)
    }

    /**
     * 
     * @param {*} id 
     * @param {*} status [pending, completed]
     * @param {*} origin  [bucket, or > list] 
     */
    updateAll(id, status, origin = 'bucket') {

        log('[updateAll]', { id, status, origin })

        let todoList = this.state.todoList

        /*
       Target buckets by id and update them
       * */
        if (origin === 'bucket') {
            todoList = todoList.map(el => {

                // if bucket previously completed, and now reopened, clear all bucket > lists
                if (el.id === id && status === 'pending') {
                    if (el.status === 'completed') {
                        el.subtasks = el.subtasks.map(n => {
                            n.status = 'pending'
                            return n
                        })
                    }
                    el.status = 'pending'
                    el.checked = false
                }

                if (el.id === id && status === 'completed') {
                    el.status = 'completed'
                    el.checked = true
                    el.subtasks = el.subtasks.map(n => {
                        n.status = 'completed'
                        return n
                    })
                }
                return el
            })

            delay(50).then(() => {
                this.setState({ todoList: todoList }, () => {
                    log('[setState][todoList]', this.state.todoList)
                })
            })
        }

        /*
        Target subtasks belonging to bucket by id/todo_id and update them
        * */
        if (origin === 'list') {

            //let subCompleteIndex = 0
            todoList = todoList.map(el => {

                el.subtasks = el.subtasks.map(n => {
                    if (n.todo_id === id && status === 'completed') {
                        n.status = 'completed'
                    }

                    if (n.todo_id === id && status === 'pending') {
                        n.status = 'pending'
                    }
                    return n
                })

                let subsCompleted = el.subtasks.filter(n => n.status === 'completed').length === el.subtasks.length

                if (subsCompleted) {
                    el.status = 'completed'
                    log('should complete main bucket ?')
                } else {
                    // reopen the buckeck if any tasks still pending
                    el.status = 'pending'
                    log('should reopen main bucket ?')
                }
                return el
            })
        }
    }

    render() {

        return (
            <this.list onUpdate={this.updateAll.bind(this)} todoList={this.state.todoList} />
        )
    }
}
