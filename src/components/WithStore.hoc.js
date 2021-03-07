import React from "react";
import { observer } from "mobx-react-lite";
import CircularProgress from '@material-ui/core/CircularProgress';
import Message from './Messages'

const withStoreReady = (Component) => {
    const Hoc = observer(({ mobxstore }) => {
        if (mobxstore.state === 'error') return (<Message type='error' message='No bucket data availabe' />)
        if (mobxstore.state === 'ready') return (<Component mobxstore={mobxstore} />)
        else return (<CircularProgress color="inherit" size={20} />)
    })
    return Hoc
}

export default withStoreReady

