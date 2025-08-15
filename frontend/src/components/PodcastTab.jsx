import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play,
  Mic,
  Download,
  ArrowRight
} from 'lucide-react';

/**
 * PODCAST TAB COMPONENT
 * 
 * Features:
 * - Initial generator state
 * - 3-second loading animation
 * - Premium audio player with waveform visualization
 * - Generate new podcast functionality
 * - Minimal and elegant UX
 */
const PodcastTab = ({ 
  podcastGenerating, 
  handleGeneratePodcast,
  premiumEasing
}) => {
  // State to track if podcast has been generated
  const [hasPodcast, setHasPodcast] = useState(false);
  
  // Enhanced podcast generation handler
  const handlePodcastGeneration = useCallback(() => {
    handleGeneratePodcast();
    // Simulate 3-second generation then show podcast
    setTimeout(() => {
      setHasPodcast(true);
    }, 3000);
  }, [handleGeneratePodcast]);

  return (
    <motion.section
      key="podcast"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: premiumEasing }}
      className="space-y-6"
    >
      <AnimatePresence mode="wait">
        {podcastGenerating ? (
          /* Generation Loading State */
          <motion.div
            key="generating"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="relative bg-gradient-to-br from-[#DC2626]/5 via-[#DC2626]/3 to-transparent border border-[#DC2626]/20 rounded-2xl p-12 overflow-hidden"
            style={{
              backdropFilter: 'blur(15px) saturate(150%)',
              boxShadow: '0 8px 32px rgba(220, 38, 38, 0.08)'
            }}
          >
            <div className="text-center relative z-10">
              {/* Elegant spinner */}
              <motion.div 
                className="w-16 h-16 mx-auto mb-6 relative"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <div className="w-full h-full border-4 border-[#DC2626]/20 rounded-full" />
                <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-[#DC2626] rounded-full" />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">
                  Creating Your Podcast
                </h3>
                <p className="text-[#1A1A1A] opacity-60 max-w-sm mx-auto leading-relaxed">
                  AI is analyzing your content and generating an engaging audio discussion...
                </p>
              </motion.div>
            </div>
          </motion.div>
        ) : hasPodcast ? (
          <motion.div
            key="generator-or-player"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Generated Podcast Player */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: premiumEasing }}
              className="relative bg-gradient-to-br from-white via-[#FAFAF9]/80 to-[#F3F4F6]/50 border border-[#E5E7EB]/30 rounded-2xl overflow-hidden"
              style={{
                backdropFilter: 'blur(15px) saturate(120%)',
                boxShadow: '0 8px 32px rgba(26, 26, 26, 0.08)'
              }}
            >
              {/* Podcast Header */}
              <div className="p-6 border-b border-[#E5E7EB]/20">
                <div className="flex items-center space-x-4">
                  <motion.div 
                    className="w-12 h-12 bg-gradient-to-r from-[#DC2626] to-[#B91C1C] rounded-xl flex items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Mic className="w-6 h-6 text-white" />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[#1A1A1A] mb-1">
                      AI Analysis Discussion
                    </h3>
                    <p className="text-sm text-[#1A1A1A] opacity-60">
                      Generated from your document insights • 8:42
                    </p>
                  </div>
                  <div className="text-xs text-[#1A1A1A] opacity-40 font-medium">
                    Just now
                  </div>
                </div>
              </div>

              {/* Premium Audio Player */}
              <div className="p-6">
                <div className="relative">
                  {/* Waveform visualization placeholder */}
                  <div className="flex items-center justify-center space-x-1 h-16 mb-6 bg-[#FAFAF9]/60 rounded-xl border border-[#E5E7EB]/20">
                    {Array.from({ length: 50 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-[#DC2626]/30 rounded-full"
                        style={{ height: `${Math.random() * 32 + 8}px` }}
                        animate={{ 
                          scaleY: [1, Math.random() * 1.5 + 0.5, 1],
                          opacity: [0.3, 0.8, 0.3]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          delay: i * 0.05,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </div>

                  {/* Player Controls */}
                  <div className="flex items-center space-x-6">
                    {/* Play/Pause Button */}
                    <motion.button
                      className="w-12 h-12 bg-gradient-to-r from-[#DC2626] to-[#B91C1C] rounded-full flex items-center justify-center text-white shadow-lg group"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Play className="w-5 h-5 ml-0.5" />
                    </motion.button>

                    {/* Progress Bar */}
                    <div className="flex-1">
                      <div className="relative h-2 bg-[#E5E7EB]/40 rounded-full overflow-hidden">
                        <motion.div 
                          className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#DC2626] to-[#B91C1C] rounded-full"
                          initial={{ width: '0%' }}
                          animate={{ width: '35%' }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-[#1A1A1A] opacity-60 mt-2">
                        <span>3:02</span>
                        <span>8:42</span>
                      </div>
                    </div>

                    {/* Volume & Options */}
                    <div className="flex items-center space-x-3">
                      <motion.button
                        className="p-2 rounded-lg hover:bg-[#FAFAF9] transition-all duration-300"
                        whileHover={{ scale: 1.1 }}
                      >
                        <Download className="w-4 h-4 text-[#1A1A1A] opacity-60" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Generate New Podcast Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="relative bg-gradient-to-br from-[#DC2626]/5 via-[#DC2626]/3 to-transparent border border-[#DC2626]/20 rounded-2xl p-6 overflow-hidden group"
              style={{
                backdropFilter: 'blur(15px) saturate(150%)',
                boxShadow: '0 4px 20px rgba(220, 38, 38, 0.06)'
              }}
            >
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <motion.div 
                    className="w-10 h-10 bg-gradient-to-r from-[#DC2626] to-[#B91C1C] rounded-xl flex items-center justify-center"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Mic className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h4 className="font-bold text-[#1A1A1A] text-sm mb-1">
                      Generate New Podcast
                    </h4>
                    <p className="text-xs text-[#1A1A1A] opacity-60">
                      Create another AI discussion from your content
                    </p>
                  </div>
                </div>
                
                <motion.button
                  onClick={handlePodcastGeneration}
                  className="bg-gradient-to-r from-[#DC2626] to-[#B91C1C] text-white  font-medium py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center space-x-2 group/btn relative overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                  <Play className="w-8 h-8" />
                  <span className="text-sm">Generate</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          /* Initial Generator State */
          <motion.div
            key="initial-generator"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative bg-gradient-to-br from-[#DC2626]/5 via-[#DC2626]/3 to-transparent border border-[#DC2626]/20 rounded-2xl p-8 overflow-hidden group"
            whileHover={{ scale: 1.01 }}
            style={{
              backdropFilter: 'blur(15px) saturate(150%)',
              boxShadow: '0 8px 32px rgba(220, 38, 38, 0.08)'
            }}
          >
            {/* Ambient background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#DC2626] to-transparent" />
            </div>
            
            <div className="relative z-10">
              <header className="flex items-center space-x-4 mb-8">
                <motion.div 
                  className="w-14 h-14 bg-gradient-to-r from-[#DC2626] to-[#B91C1C] rounded-2xl flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Mic className="w-7 h-7 text-white" />
                </motion.div>
                <div>
                  <h3 className="font-black text-[#1A1A1A] text-xl mb-1">
                    AI Podcast Generator
                  </h3>
                  <p className="text-sm text-[#1A1A1A] opacity-60 leading-relaxed">
                    Transform your analysis into an engaging audio discussion
                  </p>
                </div>
              </header>
              
              <motion.button
                onClick={handlePodcastGeneration}
                className="w-full bg-gradient-to-r from-[#DC2626] to-[#B91C1C] text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-3 group relative overflow-hidden"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  boxShadow: '0 4px 16px rgba(220, 38, 38, 0.2)'
                }}
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <Play className="w-5 h-5" />
                <span>Generate AI Podcast</span>
                <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform duration-300" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default PodcastTab;
