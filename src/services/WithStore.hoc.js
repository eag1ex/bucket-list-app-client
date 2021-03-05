import React,{useState} from "react";
import { observer } from "mobx-react-lite";
//import {log} from 'x-utils-es'
import CircularProgress from '@material-ui/core/CircularProgress';

// import Message from ''
const WithStore =  (Component)=>{
     
    const Hoc = observer(({ mobxstore }) => {      
        if(mobxstore.state==='ready') return (<Component mobxstore={mobxstore} />)
        else return (<CircularProgress color="inherit" size={20} />)
    })
    return Hoc
}

export default WithStore

