import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { theme } from "@scss/material.theme"
//import { observer } from "mobx-react-lite";
import { ThemeProvider } from '@material-ui/core/styles';
import MobXStore from './store/MobxStore.store'
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Message from './components/Messages'
import CircularProgress from '@material-ui/core/CircularProgress';

const mobxstore = new MobXStore()
function App() {

  return (
    <BrowserRouter>

      <ThemeProvider theme={theme}>
        <Navbar />
        <div className="container-fluid mt-2">

          <Switch>
            <Route exact path="/">
              <React.Fragment>
                <CircularProgress color="inherit" size={20} />
              </React.Fragment>
            </Route>
          </Switch>

          <Switch>
            <Route path="/profile/:user">
              <Home mobxstore={mobxstore} />
            </Route>
          </Switch>
          
          <Switch>
            <Route exact path="/error">
              <React.Fragment>
                {(<div><Message type='error' message='Invalid session, user not found' /></div>)}
              </React.Fragment>
            </Route>
          </Switch>

        </div>

      </ThemeProvider>
    </BrowserRouter>
  );
}


export default App;

