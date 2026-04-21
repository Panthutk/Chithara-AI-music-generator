import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import MusicLibrary from './pages/MusicLibrary';
import GenerationPage from './pages/GenerationPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/library" element={<MusicLibrary />} />
        <Route path="/generate" element={<GenerationPage />} />
      </Routes>
    </Router>
  );
}

export default App;
