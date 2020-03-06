import React from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom'
import './App.css';
import Home from './components/Home'

function App() {
  return (
    <div className="App">
      <Router>
        <Route path='/' render={routerProps => <Home {...routerProps}/>} />
      </Router>
    </div>
  );
}

export default App;
