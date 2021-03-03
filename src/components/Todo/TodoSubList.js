import React, { PureComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import Input from '../Input';
import Add from '../Add';
import { statusTypes,tasksComplete,tasksPending } from '../../utils/utils';

import CircularProgress from '@material-ui/core/CircularProgress';
import { delay, log, copy, isFunction } from 'x-utils-es';


const useStyles = makeStyles((theme) => ({
    root: {
        // width: '100%',
        maxWidth: 360,
        backgroundColor: theme.palette.background.paper,
    },
}));



export default class TodoSubList extends React.Component {
    constructor(props, context) {
        super(props);
        this.state = {
            subtasks: [],
            status: 'pending',// [pending,completed]
            id: '',// id of bucket 
        }

    }

    // componentDidUpdate(){
    //   log('[componentDidUpdate]', this.props)
    //   if(this.props.subtasks) this.setState({subtasks:this.props.subtasks})
    //   if(this.props.id) this.setState({id:this.props.id})
    // }

    componentDidMount() {

        if (this.props.subtasks) this.setState({ subtasks: this.props.subtasks })
        if (this.props.id) this.setState({ id: this.props.id })

    }

    SubList = ({ subtasks }) => {
        //log('[SubList]', subtasks)
        const classes = useStyles();
        const [checked, setChecked] = React.useState([0]);

        // update checked
        subtasks.filter(n => {
            if (statusTypes(n.status) && checked.indexOf(n.todo_id) === -1) checked.push(n.todo_id)
        })

        const onUpdate = this.props.onUpdate

        const handleUpdate = (_id) => {

            const currentIndex = checked.indexOf(_id);
            const newChecked = [...checked];

            if (currentIndex === -1) newChecked.push(_id);
            else newChecked.splice(currentIndex, 1);

            this.updateSubtasks(_id, (currentIndex!==-1 ? 'pending' : 'completed'), onUpdate)
            setChecked(newChecked);
        }


        return (
            <List className={classes.root + ` m-auto`}>
                {(subtasks || []).length ? subtasks.map((task, inx) => {
                    let { todo_id, title, status, created_at } = task

                    const labelId = `checkbox-list-label-${inx}`;

                    return (
                        <ListItem
                            key={todo_id} role={undefined} dense button onClick={(event) => {
                                handleUpdate(todo_id)
                                event.stopPropagation()
                            }}>
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
                }) : null}

                <div className="d-flex justify-content-between align-items-center flex-row">

                    <Input variantName='standard'
                        text='New List'
                        style={{ "& input": { padding: "3px 0 5px" } }} />

                    <Add style={
                        {
                            '& .MuiFab-root': {
                                width: '34px',
                                height: '34px'
                            }
                        }
                    } />
                </div>
            </List>
        );
    }


    /**
     * 
     * @param {*} id 
     * @param {*} status [pending, completed]
     * @param {*} updateBucket is a hoc callback 
     */
    async updateSubtasks(id, status, updateBucket) {

        let initallyCompleted = tasksComplete(this.state.subtasks)
        
        

        let subtasks = this.state.subtasks.map(el => {
            if (el.todo_id === id && status === 'completed') el.status = 'completed'
            if (el.todo_id === id && status === 'pending') el.status = 'pending'
            return el
        })

        let subsCompleted = tasksComplete(subtasks)

        // if (isFunction(updateBucket) && initallyCompleted && !subsCompleted) {
        //     await delay(50)
        //     await updateBucket(this.state.id,'pending','list')
        // }

        log({subsCompleted,subtasks,id, status})


        this.setState({
            subtasks, status: 'completed',
            ...(subsCompleted ? { status: 'completed' } : { status: 'pending' })
        }, () => {
            log('[updateSubtasks][setState][subtasks]', this.state.subtasks)

            if (subsCompleted){
                if (isFunction(updateBucket) ) updateBucket(this.state.id,'completed','bucket')
            }

            if (initallyCompleted && !subsCompleted) {
                if(isFunction(updateBucket) )  updateBucket(this.state.id,'completed','list')
            }

        })

    }

    render() {
        return (<React.Fragment>
            { !this.state.subtasks.length ? <CircularProgress color="inherit" size={20} /> :
                <this.SubList subtasks={this.state.subtasks} />}
        </React.Fragment>)
    }
}
