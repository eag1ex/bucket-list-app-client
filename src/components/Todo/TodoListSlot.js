
import React, { PureComponent } from 'react';
import createReactClass from 'create-react-class';

import Accord from '../Accordion.hoc';
import TodoSubList from './TodoSubList';
import Checkbox from '@material-ui/core/Checkbox';

export default class TodoListSlot extends PureComponent {

    constructor(props, context) {
        super(props);
        this.state = {
   
        }

       // this._isMounted = false
    }

    ListSlot = ({ item, onUpdate }) => {

        let { subtasks, id } = item
        return (<div className="mx-2 d-flex justify-content-center m-auto">
            {!subtasks.length ? null : <TodoSubList onUpdate={onUpdate} subtasks={subtasks} id={id} />}
        </div>);
    }


   get Slot() {
        const self = this
  
        return createReactClass({

            render() {
                const { item, onUpdate,inx } = this.props;

                const labelId = `checkbox-list-label-${inx}`;
                return (<Accord
                    Todos={() => (<self.ListSlot item={item} onUpdate={onUpdate} />)}
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

                            checked={item._checked}
                            tabIndex={-1}
                            inputProps={{ 'aria-labelledby': labelId }} />
                    )}

                    item={item}
                    inx={inx}
                />)
            }
        })
    }

    render() {
        const  {item,onUpdate,inx} = this.props
        return (<React.Fragment>
            {item ? <this.Slot item={item} onUpdate={onUpdate} inx={inx} /> : null}
        </React.Fragment>
        )
    }

}