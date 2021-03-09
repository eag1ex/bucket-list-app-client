import React from "react";
import { observer } from "mobx-react-lite";
import CircularProgress from '@material-ui/core/CircularProgress';
import Message from './Messages'

const withStoreReady = (Component) => {
    
    const Hoc = observer(({ mobxstore }) => {
        console.log('withStoreReady/state',mobxstore.state)
        if (mobxstore.state === 'error') return (<Message type='error' value='No data from server' />) 
        if (mobxstore.state === 'ready' ||mobxstore.state==='updating' ) return (<Component mobxstore={mobxstore} />)
        else return (<div className="d-flex justify-content-center align-items-center m-5"><CircularProgress color="inherit" size={20} /></div>)
    })
    return Hoc
}

export default withStoreReady

