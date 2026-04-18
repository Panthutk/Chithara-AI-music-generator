import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import MusicLibrary from './pages/MusicLibrary';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/library" element={<MusicLibrary />} />
      </Routes>
    </Router>
  );
}

export default App;
