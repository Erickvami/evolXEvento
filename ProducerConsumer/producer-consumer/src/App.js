import React, { Component } from 'react';
import './App.css';
import ControlPanel from './ControlPanel.js';
import {Container} from 'react-bootstrap';
import './bootstrap.css';
class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
            <Container>
                <ControlPanel />
        </Container>
        </header>
      </div>
    );
  }
}

export default App;
