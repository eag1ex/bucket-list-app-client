import React, { PureComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import Input from './Input';
import Add from './Add';
import { statusTypes } from '../utils/utils';

import CircularProgress from '@material-ui/core/CircularProgress';
import { delay, log,copy } from 'x-utils-es';


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
            status:'pending',// [pending,completed]
            id: '',// id of current subtask
            index:0
        } 
        this.rendered = false
    }

 

    // static getDerivedStateFromProps(){
    //     log('[getDerivedStateFromProps]', this.props)
    // }
    // componentDidUpdate(){
    //   log('[componentDidUpdate]', this.props)
    //   if(this.props.subtasks) this.setState({subtasks:this.props.subtasks})
    //   if(this.props.id) this.setState({id:this.props.id})
    // }

    componentDidMount() {
        log('[componentDidMount]',this.props.subtasks ,this.state.subtasks )
        this.setState({ subtasks: this.props.subtasks })
        this.setState({ id: this.props.id })
    }

    ListItems = ({ subtasks,id }) => {

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

            if (currentIndex === -1) {
                newChecked.push(_id);
                // onUpdate(id, 'completed', 'list')     
                this.updateSubtasks(_id, 'completed', 'list')   

            } else {
                newChecked.splice(currentIndex, 1);
                this.updateSubtasks(_id, 'pending', 'list')
            
            }
            setChecked(newChecked);
        }

        this.rendered = true

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


    // updateSubtasks(){
    //     let subsCompleted = this.state.subtasks.filter(n => n.status === 'completed').length ===this.state.subtasks.length
    //     if(subsCompleted) this.setState({status:'completed'})
    //     else this.setState({status:'pending'})

    //     log('[updateSubtasks]',subsCompleted,this.state.subtasks)
    // }

    /**
     * 
     * @param {*} id 
     * @param {*} status [pending, completed]
     * @param {*} origin  [bucket, or > list] 
     */
    updateSubtasks(id, status, origin = 'list') {
    
        log('[updateSubtasks]', { id, status, origin })

        let subtasks = this.state.subtasks.map(el=>{
            if (el.todo_id === id && status === 'completed') {
                el.status = 'completed'
            }

            if (el.todo_id === id && status === 'pending') {
                el.status = 'pending'
            }

            return el
        })

        let subsCompleted = subtasks.filter(n => n.status === 'completed').length ===subtasks.length

        this.setState({ subtasks,status:'completed' ,index:this.state.index +1, 
                        ...(subsCompleted ? {status:'completed'}:{status:'pending'}) }, () => {
            log('[setState][subtasks][updateSubtasks]', this.state.subtasks)
        })
    }


    render() {

        return (<React.Fragment>
            { !this.state.subtasks.length ? <CircularProgress color="inherit" size={20} /> : 
            <this.ListItems subtasks={this.state.subtasks} id={this.state.id} />}
        </React.Fragment>)
    }
}
