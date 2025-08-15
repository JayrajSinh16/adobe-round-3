import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import DocumentUploader from './components/DocumentUploader';
import ResultAnalysis from './components/ResultAnalysis';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-adobe-gray-50 to-white">
        {/* <Header /> */}
        
        <main className=" mx-auto px-4 sm:px-6 lg:px-6 py-6">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Navigate to="/upload" replace />} />
              <Route path="/upload" element={<DocumentUploader />} />
              <Route path="/result-analysis" element={<ResultAnalysis />} />
            </Routes>
          </AnimatePresence>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;