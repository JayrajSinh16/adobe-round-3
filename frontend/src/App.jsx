import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Footer from './components/layout/Footer';
import DocumentUploader from './components/features/DocumentUploader';
import ResultAnalysis from './components/layout/result/ResultAnalysis';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-adobe-gray-50 to-white">
        
        <main className=" mx-auto px-4 sm:px-6 lg:px-6 py-6">
          <Toaster position="top-right" gutter={8} toastOptions={{
            success: { duration: 2500 },
            error: { duration: 4000 }
          }} />
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