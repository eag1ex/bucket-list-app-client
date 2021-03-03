import React, { PureComponent, Suspense } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import CircularProgress from '@material-ui/core/CircularProgress';
import TodoListSlot from './TodoListSlot'
import { delay, log, sq } from 'x-utils-es';
import { statusTypes, tasksComplete, tasksPending } from '../../utils/utils';

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
        this._isMounted = false
    }


    async loadList() {

        const todoData = await import('../../data/dummy.data')
        //const response = await fetch('');
        await delay(2000); // For demo purposes.
        this.setState({ todoList: todoData.todoList })
    }

    componentDidMount() {
        this._isMounted = true
    }

    BucketList({ onUpdate, todoList }) {
        log('[BucketList]', { todoList })

        const classes = useStyles();

        // update initial checked states
        todoList = todoList.map(n => {

            if (!tasksComplete(n.subtasks) && !tasksPending(n.subtasks)) {
                n.status = 'pending'
                n._checked = false
                return n
            }

            if (tasksComplete(n.subtasks)) {
                n.status = 'completed'
                n.subtasks = n.subtasks.map(nn => {
                    nn.status = 'completed'
                    return nn
                })
                n._checked = true
                return n
            }

            if (tasksPending(n.subtasks)) {
                n.status = 'pending'

                n._checked = false
                return n
            }

            if (n._checked === undefined && statusTypes(n.status)) {

                n._checked = true
            }

            return n
        })


        const ListItems = ({ list }) => {

            return (
                <List className={classes.root + ` m-auto`}>
                    {list.map((item, inx) => {


                        return (<div key={item.id}><Suspense fallback={<div>...</div>}>

                            <TodoListSlot
                                onUpdate={onUpdate}
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
    async updateAll(id, status, origin = 'bucket') {

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
                    el._checked = false
                }

                if (el.id === id && status === 'completed') {
                    el.status = 'completed'
                    el._checked = true

                    el.subtasks = el.subtasks.map(n => {
                        n.status = 'completed'
                        return n
                    })
                }
                return el
            })
        }


        /*
        Check if the previously selected task was reopened
        * */
        if (origin === 'list') {

            todoList = todoList.map(el => {

                if (el.id === id &&
                    (!tasksPending(el.subtasks) && !tasksComplete(el.subtasks)) &&
                    el.status === 'completed') {
                    el.status = 'pending'
                    el._checked = false
                }
                return el
            })
        }

        await delay(300)

        let defer = sq()

        this.setState({ todoList: todoList }, () => {
            log('[updateAll][bucket][setState]', this.state.todoList)
            defer.resolve()
        })
        return defer.promise
    }

    render() {

        return (
            <this.BucketList onUpdate={this.updateAll.bind(this)} todoList={this.state.todoList} />
        )
    }
}
