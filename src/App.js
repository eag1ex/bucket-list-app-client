import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import {theme} from "@scss/material.theme"
//import { observer } from "mobx-react-lite";
import { ThemeProvider } from '@material-ui/core/styles';
import MobXStore from './store/MobxStore.store'
import Navbar from "./components/Navbar";
import Home from "./pages/Home";

const mobxstore = new MobXStore()
function App() {

  return (
    <BrowserRouter>
      
    <ThemeProvider theme={theme}>

      <Navbar/>
      <div className="container-fluid mt-2">
        <Switch>
          <Route exact path="/">    
            <Home mobxstore={mobxstore} />      
          </Route>    
        </Switch>
      </div>

      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;


