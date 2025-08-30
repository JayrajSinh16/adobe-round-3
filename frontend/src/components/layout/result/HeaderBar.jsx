import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, MoreVertical } from 'lucide-react';

// Header bar extracted from ResultAnalysis. Receives all needed props; no logic changed.
export default function HeaderBar({
  files,
  selectedFile,
  rightPanelVisible,
  setRightPanelVisible,
  handleBackToUpload,
  itemVariants,
  onOpenYouTube
}) {
  return (
    <motion.header 
      variants={itemVariants}
      className="relative flex-shrink-0 bg-white/80 backdrop-blur-2xl border-b border-white/20 px-6 py-4 z-50 overflow-hidden"
      style={{
        backdropFilter: 'blur(24px) saturate(180%)',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(250,250,249,0.8) 100%)',
        borderImage: 'linear-gradient(90deg, transparent, rgba(220,38,38,0.1), transparent) 1',
        boxShadow: '0 8px 32px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)'
      }}
    >
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#DC2626]/20 via-transparent to-[#DC2626]/10" />
      </div>

      <div className="relative z-10 w-full flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <motion.div className="flex items-center space-x-4">
            <motion.button
              onClick={handleBackToUpload}
              className="group relative flex items-center space-x-3 px-4 py-2.5 text-[#1A1A1A] hover:bg-white/60 rounded-xl transition-all duration-300 overflow-hidden"
              whileHover={{ scale: 1.02, x: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#DC2626]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300 relative z-10" />
              <span className="font-semibold text-sm tracking-wide relative z-10">Upload</span>
            </motion.button>
            <div className="text-[#E5E7EB] font-bold">/</div>
          </motion.div>

          <motion.div 
            className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-white/40 rounded-xl border border-white/20"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="w-2 h-2 bg-[#059669] rounded-full animate-pulse" />
            <span className="text-xs font-bold text-[#1A1A1A] opacity-70">
              {files.length} Document{files.length !== 1 ? 's' : ''}
            </span>
          </motion.div>
        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8, type: "spring", stiffness: 300 }}
          >
            <h1 className="text-2xl font-black text-[#1A1A1A] tracking-tight leading-none">
              PDF Analysis
              <span className="text-[#DC2626] ml-1.5 relative">
                Workspace
                <motion.div
                  className="absolute -top-1 -right-1 w-2 h-2 bg-[#DC2626] rounded-full"
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </span>
            </h1>
            <motion.div 
              className="flex items-center justify-center space-x-2 mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {selectedFile ? (
                <>
                  <div className="w-1 h-1 bg-[#059669] rounded-full" />
                  <span className="text-xs text-[#1A1A1A] opacity-60 font-medium">
                    Analyzing: {selectedFile.name.length > 25 ? selectedFile.name.substring(0, 25) + '...' : selectedFile.name}
                  </span>
                </>
              ) : (
                <>
                  <div className="w-1 h-1 bg-[#E5E7EB] rounded-full" />
                  <span className="text-xs text-[#1A1A1A] opacity-60 font-medium">
                    Select a document to begin analysis
                  </span>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>

        <div className="flex items-center space-x-2">
          <motion.button
            onClick={onOpenYouTube}
            className={`relative px-3 py-2.5 rounded-xl font-semibold text-xs transition-all duration-300 overflow-hidden group ${selectedFile ? 'bg-[#FF0000]/10 text-[#FF0000] hover:bg-[#FF0000]/20 border border-[#FF0000]/30' : 'bg-[#E5E7EB]/30 text-[#1A1A1A] opacity-40 cursor-not-allowed'}`}
            whileHover={selectedFile ? { scale: 1.02 } : {}}
            whileTap={selectedFile ? { scale: 0.98 } : {}}
            disabled={!selectedFile}
            aria-label={selectedFile ? 'Show YouTube recommendations' : 'Select a document first'}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF0000]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 tracking-wide">YouTube Videos</span>
          </motion.button>

          <div className="flex items-center space-x-1">
            <motion.button 
              className={`relative p-2.5 rounded-xl transition-all duration-300 overflow-hidden group ${
                selectedFile ? 'bg-[#059669]/10 text-[#059669] hover:bg-[#059669]/20' : 'bg-[#E5E7EB]/30 text-[#1A1A1A] opacity-40 cursor-not-allowed'
              }`}
              whileHover={selectedFile ? { scale: 1.05 } : {}}
              whileTap={selectedFile ? { scale: 0.95 } : {}}
              disabled={!selectedFile}
              aria-label={selectedFile ? `Download analysis for ${selectedFile.name}` : 'Select a document to download'}
            >
              {selectedFile && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#059669]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              )}
              <MoreVertical className="w-4 h-4 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
            </motion.button>

            <motion.button 
              onClick={() => setRightPanelVisible(!rightPanelVisible)}
              className={`relative px-3 py-2.5 rounded-xl font-semibold text-xs transition-all duration-300 overflow-hidden group ${
                rightPanelVisible ? 'bg-[#DC2626] text-white shadow-lg' : 'bg-white/40 text-[#1A1A1A] hover:bg-white/60'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`absolute inset-0 transition-opacity duration-300 ${
                rightPanelVisible ? 'bg-gradient-to-r from-[#B91C1C] to-[#DC2626] opacity-100' : 'bg-gradient-to-r from-[#DC2626]/10 to-transparent opacity-0 group-hover:opacity-100'
              }`} />
              <span className="relative z-10 tracking-wide">
                {rightPanelVisible ? 'Close Insights' : 'AI Insights'}
              </span>
              {rightPanelVisible && (
                <motion.div
                  className="absolute inset-0 bg-white/10 rounded-xl"
                  animate={{ opacity: [0, 0.3, 0], scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      <motion.div 
        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-[#DC2626]/30 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
        style={{ width: '100%' }}
      />
    </motion.header>
  );
}
