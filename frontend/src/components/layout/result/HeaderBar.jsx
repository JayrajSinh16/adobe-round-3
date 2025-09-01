import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, MoreVertical, Play } from 'lucide-react';

// Professional Header bar component with production-ready design
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
      className="relative flex-shrink-0 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 px-8 py-4 z-50"
    >
      {/* Subtle accent line */} 
      <div className="relative z-10 w-full flex items-center justify-between">
        {/* Left Section - Navigation */}
        <div className="flex items-center space-x-6">
          <motion.div className="flex items-center space-x-3">
            <motion.button
              onClick={handleBackToUpload}
              className="group relative flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-red-600 rounded-lg transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
              <span className="font-medium text-sm">Upload</span>
            </motion.button>
            <div className="text-gray-300 font-light text-sm">/</div>
          </motion.div>

          <motion.div 
            className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-emerald-50/50 rounded-lg border border-emerald-200/50"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}>
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            <span className="text-xs font-medium text-emerald-700">
              {files.length} Document{files.length !== 1 ? 's' : ''}
            </span>
          </motion.div>
        </div>

        {/* Center Section - Title */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4, type: "spring", stiffness: 300 }}
            className="text-center"
          >
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              PDF Analysis
              <span className="text-red-600 ml-1.5">Workspace</span>
            </h1>
            <motion.div 
              className="flex items-center justify-center space-x-2 mt-0.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {selectedFile ? (
                <>
                  <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                  <span className="text-xs text-gray-600 font-medium">
                    {selectedFile.name.length > 30 ? selectedFile.name.substring(0, 30) + '...' : selectedFile.name}
                  </span>
                </>
              ) : (
                <>
                  <div className="w-1 h-1 bg-gray-300 rounded-full" />
                  <span className="text-xs text-gray-500">
                    Select a document to begin
                  </span>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-3">
          <motion.button
            onClick={onOpenYouTube}
            className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
              selectedFile 
                ? ' text-red-600 hover:bg-red-100 border border-red-200/50' 
                : 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200/50'
            }`}
            whileHover={selectedFile ? { scale: 1.02 } : {}}
            whileTap={selectedFile ? { scale: 0.98 } : {}}
            disabled={!selectedFile}
          >
            <Play className="w-4 h-4" />
            <span>YouTube</span>
          </motion.button>
          <motion.button 
            onClick={() => setRightPanelVisible(!rightPanelVisible)}
            className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
              rightPanelVisible 
                ? 'bg-red-600 text-white shadow-md' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200/50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FileText className="w-4 h-4" />
            <span>{rightPanelVisible ? 'Close' : 'Insights'}</span>
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}
