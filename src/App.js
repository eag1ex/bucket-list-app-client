import React from "react";
import { BrowserRouter, Switch, Route,Redirect } from "react-router-dom";
import { theme } from "@scss/material.theme"
//import { observer } from "mobx-react-lite";
import { ThemeProvider } from '@material-ui/core/styles';
import MobXStore from './store/MobxStore.store'
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Message from './components/Messages'
import CircularProgress from '@material-ui/core/CircularProgress';
import { log } from 'x-utils-es';
const mobxstore = new MobXStore()
function App() {

  return (
    <BrowserRouter>

      <ThemeProvider theme={theme}>
        <Navbar />
        <div className="container-fluid mt-2">

          <Switch>
              <Route exact path="/" render={(props) => (
                  <Redirect to="/profile/oozou"/>
              )}/>
      
          </Switch>

          <Switch>
            <Route path="/profile/:user">
              <Home mobxstore={mobxstore} />
            </Route>
          </Switch>
          
          <Switch>
            <Route exact path="/error" render={(props)=>{          
               return (<Message type='error' value='Ups something went wrong' />)
            }}/>
                     
          </Switch>

        </div>

      </ThemeProvider>
    </BrowserRouter>
  );
}


export default App;



/*
   <React.Fragment>
              <div className="d-flex justify-content-center align-items-center m-5">
                  <CircularProgress color="inherit" size={20} />
              </div>            
              </React.Fragment>
* */