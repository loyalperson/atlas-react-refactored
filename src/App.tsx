import React from 'react';
import logo from './logo.svg';
import './styles/globals.css';
import './styles/custom.css';
import MapComponent  from './pages/MapComponent';
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter basename="/">
      <MapComponent/>
    </BrowserRouter>
  );
}

export default App;
