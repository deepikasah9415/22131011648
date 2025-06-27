import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ShortenerPage from './components/ShortenerPage';
import StatsPage from './components/StatsPage';
import RedirectHandler from './components/RedirectHandler';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ShortenerPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path=":shortcode" element={<RedirectHandler />} />
      </Routes>
    </Router>
  );
}

export default App;
