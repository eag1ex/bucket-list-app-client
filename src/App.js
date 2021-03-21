import React from "react"
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom"
import { theme } from "../src/theme/material.theme"
import { ThemeProvider } from '@material-ui/core/styles'
import MobXStore from './store/MobxStore'
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Message from './components/Messages'
import { loggerSetting, log } from 'x-utils-es'
if (process.env.REACT_APP_ENV === 'production') {
    loggerSetting('log', 'off')
    loggerSetting('debug', 'off')
}

if (process.env.REACT_APP_ENV === 'development') {
    log('IN_DEVELOPMENT_MODE')
}

const mobxstore = new MobXStore()
function App() {
   
    return (
        <BrowserRouter basename={process.env.PUBLIC_URL} >

            <ThemeProvider theme={theme}>
                <Navbar mobxstore={mobxstore} />
                <div className="container-fluid mt-3">

                    <Switch>
                        <Route exact path="/" render={(props) => (
                            <Redirect to="/profile/johndoe"/>
                        )}/>
      
                    </Switch>

                    <Switch>
                        <Route path="/profile/:user">
                            <Home mobxstore={mobxstore} />
                        </Route>
                    </Switch>
          
                    <Switch>
                        <Route exact path="/error" render={(props) => {          
                            return (<Message type='error' value='Ups something went wrong' />)
                        }}/>                  
                    </Switch>

                    <Switch>
                        <Route exact path="/session-expired" render={(props) => {          
                            return (<Message type='error' value='Your token expired, please login again at: /login' />)
                        }}/>                  
                    </Switch>

                    <Switch>
                        <Route path="*" >
                            <Redirect to="/"/>
                        </Route>
                    </Switch>

                </div>

            </ThemeProvider>
        </BrowserRouter>
    )
}

export default App

/*
<Switch>
  <Layout exact path="/hotel/:agency" component={Home} />
  <Layout exact path="/hotel/:agency/list" component={List} />
  <Layout exact path="/hotel/:agency/detail/:id" component={Detail} />

</Switch>
* */
