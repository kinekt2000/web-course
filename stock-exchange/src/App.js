import './App.css';
import React from "react";

import {BrowserRouter, Switch, Route} from "react-router-dom";

import Enter from "./components/Enter";
import Broker from "./components/Broker";
import Admin from "./components/Admin";

function App() {
  return (
      <BrowserRouter>
          <Switch>
              <Route exact path="/" component={Enter}/>
              <Route path="/broker" component={Broker}/>
              <Route path="/admin" component={Admin}/>
          </Switch>
      </BrowserRouter>
  );
}

export default App;
