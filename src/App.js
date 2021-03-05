import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import {theme} from "@scss/material.theme"
import { observer } from "mobx-react-lite";
import { ThemeProvider } from '@material-ui/core/styles';
import MobXStore from './services/MobxStore.service'
import Navbar from "./components/Navbar";
import Home from "./pages/Home";

function App() {
  const mobxstore = new MobXStore()



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


