import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PizzeriaDashboard from './components/dashboard/PizzeriaDashboard';
import ClientiPage from './components/clienti/ClientiPage';
import MenuPage from './components/menu/MenuPage';
import FedeltaPage from './components/fedelta/FedeltaPage';
import OrdiniPage from './components/ordini/OrdiniPage';
import './App.css';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<PizzeriaDashboard />} />
          <Route path="/clienti" element={<ClientiPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/fedelta" element={<FedeltaPage />} />
          <Route path="/ordini" element={<OrdiniPage />} />
          {/* Altre rotte saranno aggiunte qui man mano che si creano nuove pagine */}
        </Routes>
      </Router>
    </div>
  );
}

export default App;