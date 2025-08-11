// src/components/OnboardingFlow.js
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Brain, Link, Sparkles, ChevronRight } from 'lucide-react';
import PersonaSelector from './PersonaSelector';
import DocumentUploader from './DocumentUploader';

const OnboardingFlow = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState('hero'); // hero, persona, upload
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);

  const handleGetStarted = () => {
    setCurrentStep('persona');
  };

  const handlePersonaSelected = (persona) => {
    setSelectedPersona(persona);
    setCurrentStep('upload');
  };

  const handleDocumentsUploaded = (documents) => {
    setUploadedDocuments(documents);
    onComplete(selectedPersona, documents);
  };

  const handleSkipUpload = () => {
    onComplete(selectedPersona, []);
  };

  const steps = [
    { id: 'hero', label: 'Welcome', number: 1 },
    { id: 'persona', label: 'Choose Role', number: 2 },
    { id: 'upload', label: 'Upload Docs', number: 3 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1.5s'}}></div>
      </div>

      {/* Progress Bar */}
      <div className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex justify-center items-center space-x-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center space-x-3 ${
                  currentStep === step.id ? 'text-white' : 
                  steps.findIndex(s => s.id === currentStep) > index ? 'text-green-300' : 'text-white/60'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                    currentStep === step.id ? 'bg-indigo-500 border-white text-white' :
                    steps.findIndex(s => s.id === currentStep) > index ? 'bg-green-500 border-green-300 text-white' :
                    'bg-white/20 border-white/40'
                  }`}>
                    {steps.findIndex(s => s.id === currentStep) > index ? '✓' : step.number}
                  </div>
                  <span className="font-medium hidden sm:block">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-12 h-0.5 bg-white/30 mx-4 hidden sm:block"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {currentStep === 'hero' && (
            <HeroScreen key="hero" onGetStarted={handleGetStarted} />
          )}
          
          {currentStep === 'persona' && (
            <PersonaSelector 
              key="persona"
              onPersonaSelected={handlePersonaSelected}
              onBack={() => setCurrentStep('hero')}
            />
          )}
          
          {currentStep === 'upload' && (
            <DocumentUploader
              key="upload"
              selectedPersona={selectedPersona}
              onDocumentsUploaded={handleDocumentsUploaded}
              onSkip={handleSkipUpload}
              onBack={() => setCurrentStep('persona')}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Hero Screen Component
const HeroScreen = ({ onGetStarted }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="text-center text-white max-w-4xl mx-auto"
    >
      {/* Animated PDF Demo */}
      <div className="mb-12 relative h-48 flex items-center justify-center">
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          <FileText className="w-20 h-20 text-white/90 mb-4 mx-auto" />
          
          {/* Connection Lines */}
          <motion.div
            className="absolute -top-4 -left-8 w-16 h-0.5 bg-gradient-to-r from-indigo-400 to-cyan-400 rounded-full"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 64, opacity: 1 }}
            transition={{ delay: 0.5, duration: 1, repeat: Infinity, repeatDelay: 2 }}
          />
          <motion.div
            className="absolute -bottom-4 -right-8 w-20 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 80, opacity: 1 }}
            transition={{ delay: 1, duration: 1, repeat: Infinity, repeatDelay: 2 }}
          />
          
          {/* Insight Bubbles */}
          <motion.div
            className="absolute -top-6 right-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
          >
            <Brain className="w-4 h-4" />
          </motion.div>
          <motion.div
            className="absolute -bottom-6 left-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
          >
            <Link className="w-4 h-4" />
          </motion.div>
          <motion.div
            className="absolute top-0 -right-6 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
          >
            <Sparkles className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </div>

      {/* Hero Text */}
      <motion.h1 
        className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Your PDFs, Finally Awake
      </motion.h1>
      
      <motion.p 
        className="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        Transform static documents into intelligent, interactive experiences 
        with AI-powered insights and cross-document connections.
      </motion.p>

      {/* Features */}
      <motion.div 
        className="flex flex-wrap justify-center gap-8 mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex flex-col items-center space-y-2 text-white/80">
          <Brain className="w-8 h-8" />
          <span className="font-medium">Smart Analysis</span>
        </div>
        <div className="flex flex-col items-center space-y-2 text-white/80">
          <Link className="w-8 h-8" />
          <span className="font-medium">Connect Ideas</span>
        </div>
        <div className="flex flex-col items-center space-y-2 text-white/80">
          <Sparkles className="w-8 h-8" />
          <span className="font-medium">Generate Insights</span>
        </div>
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <button
          className="btn-primary text-lg px-8 py-4 group hover:shadow-2xl"
          onClick={onGetStarted}
        >
          See What Your Documents Know
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>

      {/* Trust Signals */}
      <motion.p 
        className="mt-8 text-white/70 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        ✨ No sign-up required • Works offline • Privacy-first
      </motion.p>
    </motion.div>
  );
};

export default OnboardingFlow;