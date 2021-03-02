import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import {theme} from "@scss/material.theme"
import { ThemeProvider } from '@material-ui/core/styles';
import Navbar from "./components/Navbar";
import Home from "./pages/Home";

function App() {
  return (
    <BrowserRouter>
      
    <ThemeProvider theme={theme}>

      <Navbar/>
      <div className="container-fluid mt-2">
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
        
        </Switch>
      </div>

      </ThemeProvider>
    </BrowserRouter>
  );
}



export default App;
