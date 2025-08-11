import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  Sparkles, 
  Target,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Users,
  Zap,
  Brain,
  Eye,
  Star
} from 'lucide-react';
import { PERSONAS } from '../utils/constants';

const PersonaSelector = () => {
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [hoveredPersona, setHoveredPersona] = useState(null);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customPersona, setCustomPersona] = useState({
    title: '',
    subtitle: '',
    description: '',
    careConcerns: ['', '', '']
  });
  const [customPersonas, setCustomPersonas] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get uploaded files from previous step
  const uploadedFiles = location.state?.uploadedFiles || [];

  const handlePersonaSelect = useCallback((persona) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSelectedPersona(persona);
    
    // Reset animation lock after transition
    setTimeout(() => setIsAnimating(false), 400);
  }, [isAnimating]);

  const handleContinue = useCallback(() => {
    if (selectedPersona && !isAnimating) {
      navigate('/job', { 
        state: { 
          selectedPersona,
          uploadedFiles 
        }
      });
    }
  }, [selectedPersona, uploadedFiles, navigate, isAnimating]);

  const handleCustomPersonaSubmit = useCallback(() => {
    if (customPersona.title) {
      const newPersona = {
        id: `custom-${Date.now()}`,
        title: customPersona.title,
        subtitle: customPersona.subtitle || 'Custom Role',
        description: customPersona.description,
        emoji: '🎯',
        gradient: 'from-purple-500 to-pink-500',
        careConcerns: customPersona.careConcerns.filter(concern => concern.trim() !== ''),
        isCustom: true
      };
      
      setCustomPersonas(prev => [...prev, newPersona]);
      setShowCustomModal(false);
      setCustomPersona({
        title: '',
        subtitle: '',
        description: '',
        careConcerns: ['', '', '']
      });
      
      // Auto-select the new custom persona
      setTimeout(() => handlePersonaSelect(newPersona), 300);
    }
  }, [customPersona, handlePersonaSelect]);

  // Combine default and custom personas
  const allPersonas = [...PERSONAS, ...customPersonas];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300
      }
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 400
      }
    }
  };

  return (
    /*
    ===================================================================
    | WORLD-CLASS PERSONA SELECTOR - DESIGN MASTERPIECE |
    ===================================================================
    
    Design Philosophy:
    - Sophisticated persona selection with premium card interactions
    - Mathematical spacing and golden ratio proportions
    - Cinematic animations that guide user attention
    - Elite color palette with scientific precision
    - Enterprise-grade accessibility and responsive design
    
    Interaction Paradigm:
    - Progressive disclosure with elegant state transitions
    - Micro-animations that feel like luxury software
    - Staggered card reveals for sophisticated entrance
    - Adaptive layout responding to selection state
    
    Visual Hierarchy:
    - Museum-quality typography with surgical precision
    - Glass morphism cards with premium depth
    - Asymmetrical balance creating visual sophistication
    - Color-coded persona categories for instant recognition
    */
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAF9] to-[#F3F4F6] py-4 px-6">
      {/* Maximum width container with elegant proportions */}
      <div className="max-w-7xl mx-auto">
        
        {/* 
        HERO SECTION - MUSEUM QUALITY TYPOGRAPHY
        - Oversized, confident headline that commands attention
        - Progress indication with sophisticated styling
        - Generous negative space for premium feel
        */}
        <header className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          >
            {/* Premium progress indicator */}
            <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg border border-white/20 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[#DC2626] to-[#B91C1C] rounded-xl flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-[#1A1A1A] opacity-70">Step 2 of 3</span>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-[#059669] rounded-full"></div>
                <div className="w-2 h-2 bg-[#DC2626] rounded-full"></div>
                <div className="w-2 h-2 bg-[#E5E7EB] rounded-full"></div>
              </div>
            </div>
            
            {/* Hero Headline - Commanding presence */}
            <h1 className="text-5xl md:text-6xl font-black text-[#1A1A1A] mb-4 leading-[0.9] tracking-tight">
              Choose Your
              <span className=" text-[#DC2626]"> Reading Lens</span>
            </h1>
            
            {/* Elegant subheading with document count integration */}
            <p className="text-xl text-[#1A1A1A] opacity-60 max-w-4xl mx-auto leading-relaxed font-normal mb-4">
              Your perspective shapes the insights that matter most. Select the role that aligns with how you'll analyze your 
              <span className="font-semibold text-[#DC2626]"> {uploadedFiles.length} documents</span>
            </p>
            
            {/* Insight callout */}
            <div className="flex items-center justify-center space-x-3 text-[#1A1A1A] opacity-50">
              <Lightbulb className="w-5 h-5" />
              <span className="font-medium">Each persona reveals different dimensions of your content</span>
            </div>
          </motion.div>
        </header>

        {/* 
        REVOLUTIONARY PERSONA SELECTION INTERFACE
        - Split layout: Selected persona details on right, cards on left
        - Innovative adaptive grid system
        - Custom persona creation capability
        */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
          
          {/* LEFT SECTION - PERSONA CARDS */}
          <div className="xl:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
            >
              {/* Selected Persona Row - Highlighted at top */}
              <AnimatePresence>
                {selectedPersona && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    transition={{ duration: 0.5, type: "spring", stiffness: 300 }}
                    className="mb-8"
                  >
                    <div className="bg-gradient-to-r from-[#DC2626] to-[#B91C1C] rounded-3xl p-1 shadow-2xl">
                      <div className="bg-white rounded-3xl p-6">
                        <div className="flex items-center space-x-4">
                          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedPersona.gradient || 'from-purple-500 to-pink-500'} flex items-center justify-center text-3xl shadow-xl`}>
                            {selectedPersona.emoji}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-2xl font-black text-[#1A1A1A]">
                                {selectedPersona.title}
                              </h3>
                              <CheckCircle className="w-6 h-6 text-[#059669]" />
                            </div>
                            <p className="text-sm font-medium text-[#1A1A1A] opacity-60">
                              {selectedPersona.subtitle}
                            </p>
                          </div>
                          <motion.div 
                            className="text-[#DC2626] font-black text-sm bg-red-50 px-4 py-2 rounded-xl"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            SELECTED
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Available Personas Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {allPersonas.filter(p => p.id !== selectedPersona?.id).map((persona, index) => (
                  <motion.div
                    key={persona.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: index * 0.1,
                    }}
                    whileHover={{ 
                      y: -6, 
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                    onClick={() => handlePersonaSelect(persona)}
                    className="group relative cursor-pointer rounded-2xl overflow-hidden bg-white border-2 border-gray-100 hover:border-[#DC2626] shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${persona.gradient || 'from-purple-500 to-pink-500'} flex items-center justify-center text-xl shadow-lg`}>
                          {persona.emoji}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-[#1A1A1A] mb-1">
                            {persona.title}
                          </h4>
                          <p className="text-xs text-[#1A1A1A] opacity-60">
                            {persona.subtitle}
                          </p>
                        </div>
                        {persona.isCustom && (
                          <div className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-lg font-bold">
                            CUSTOM
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-[#1A1A1A] opacity-70 leading-relaxed line-clamp-2">
                        {persona.description}
                      </p>
                    </div>
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#DC2626]/5 to-[#B91C1C]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </motion.div>
                ))}

                
              </div>
            </motion.div>
          </div>

          {/* RIGHT SECTION - PERSONA DETAILS */}
          <div className="xl:col-span-1">
            <AnimatePresence mode="wait">
              {selectedPersona ? (
                <motion.div
                  key={selectedPersona.id}
                  initial={{ opacity: 0, x: 24, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 24, scale: 0.9 }}
                  transition={{ duration: 0.5, type: "spring", stiffness: 300 }}
                  className="sticky top-8"
                >
                  <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-white/20 shadow-2xl p-8">
                    {/* Persona Avatar */}
                    <div className="text-center mb-6">
                      <div className={`w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br ${selectedPersona.gradient || 'from-purple-500 to-pink-500'} flex items-center justify-center text-4xl shadow-2xl mb-4`}>
                        {selectedPersona.emoji}
                      </div>
                      <h3 className="text-2xl font-black text-[#1A1A1A] mb-2">
                        {selectedPersona.title}
                      </h3>
                      <p className="text-sm text-[#1A1A1A] opacity-60 font-medium">
                        {selectedPersona.subtitle}
                      </p>
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                      <p className="text-[#1A1A1A] opacity-70 leading-relaxed text-center">
                        {selectedPersona.description}
                      </p>
                    </div>

                    {/* Focus Areas */}
                    <div className="mb-8">
                      <h4 className="font-bold text-[#1A1A1A] mb-4 flex items-center justify-center space-x-2">
                        <Target className="w-5 h-5 text-[#DC2626]" />
                        <span>Key Focus Areas</span>
                      </h4>
                      <div className="space-y-3">
                        {selectedPersona.careConcerns.slice(0, 4).map((concern, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-start space-x-3 text-sm text-[#1A1A1A] opacity-80"
                          >
                            <div className="w-2 h-2 bg-[#DC2626] rounded-full mt-2 flex-shrink-0" />
                            <span className="leading-relaxed">{concern}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Continue Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleContinue}
                      className="w-full bg-gradient-to-r from-[#DC2626] to-[#B91C1C] text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Continue with {selectedPersona.title}
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
               // {/* Custom Persona Creator Card */}  
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: allPersonas.length * 0.1 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  onClick={() => setShowCustomModal(true)}
                  className="group cursor-pointer rounded-2xl overflow-hidden bg-gradient-to-br from-red-50 to-red-0 border-2 border-dashed border-red-300 hover:border-red-500 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-red-500 to-red-500 flex items-center justify-center text-xl shadow-lg mb-4">
                      ✨
                    </div>
                    <h4 className="text-lg font-bold text-[#1A1A1A] mb-2">
                      Create Custom Persona
                    </h4>
                    <p className="text-sm text-[#1A1A1A] opacity-70">
                      Build your own analysis perspective
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 
        CUSTOM PERSONA CREATION MODAL
        - Innovative modal design with premium styling
        - Minimal form for quick persona creation
        - Real-time validation and feedback
        */}
        <AnimatePresence>
          {showCustomModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
              onClick={() => setShowCustomModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl shadow-lg mb-4">
                    ✨
                  </div>
                  <h3 className="text-2xl font-black text-[#1A1A1A] mb-2">
                    Create Custom Persona
                  </h3>
                  <p className="text-sm text-[#1A1A1A] opacity-60">
                    Define your unique analysis perspective
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Title Input */}
                  <div>
                    <label className="block text-sm font-bold text-[#1A1A1A] mb-2">
                      Persona Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Marketing Strategist"
                      value={customPersona.title}
                      onChange={(e) => setCustomPersona(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#DC2626] focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Subtitle Input */}
                  {/* <div>
                    <label className="block text-sm font-bold text-[#1A1A1A] mb-2">
                      Role Description
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Campaign Performance Analyst"
                      value={customPersona.subtitle}
                      onChange={(e) => setCustomPersona(prev => ({ ...prev, subtitle: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#DC2626] focus:outline-none transition-colors"
                    />
                  </div> */}

                  {/* Description Input */}
                  <div>
                    <label className="block text-sm font-bold text-[#1A1A1A] mb-2">
                      Analysis Approach 
                    </label>
                    <textarea
                      placeholder="Describe how this persona approaches document analysis..."
                      value={customPersona.description}
                      onChange={(e) => setCustomPersona(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#DC2626] focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  {/* Focus Areas */}
                  <div>
                    <label className="block text-sm font-bold text-[#1A1A1A] mb-2">
                      Key Focus Areas
                    </label>
                    {customPersona.careConcerns.map((concern, idx) => (
                      <input
                        key={idx}
                        type="text"
                        placeholder={`Focus area ${idx + 1}`}
                        value={concern}
                        onChange={(e) => {
                          const newConcerns = [...customPersona.careConcerns];
                          newConcerns[idx] = e.target.value;
                          setCustomPersona(prev => ({ ...prev, careConcerns: newConcerns }));
                        }}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#DC2626] focus:outline-none transition-colors mb-2"
                      />
                    ))}
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex space-x-3 mt-8">
                  <button
                    onClick={() => setShowCustomModal(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-200 text-[#1A1A1A] rounded-xl font-bold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCustomPersonaSubmit}
                    disabled={!customPersona.title}
                    className={`flex-1 px-6 py-3 rounded-xl font-bold transition-colors ${
                      customPersona.title 
                        ? 'bg-gradient-to-r from-[#DC2626] to-[#B91C1C] text-white hover:shadow-lg'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Create Persona
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 
        PREMIUM PROGRESS INDICATOR
        - Floating, elegant progress display
        - Mathematical positioning and spacing
        */}
        

      </div>
    </div>
  );
};

export default PersonaSelector;