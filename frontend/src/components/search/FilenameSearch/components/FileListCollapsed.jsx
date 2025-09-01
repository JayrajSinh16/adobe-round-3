/**
 * File List Collapsed Component - Minimal Professional Design
 * Clean compact file list for sidebar
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText } from 'lucide-react';
import { UI_CONFIG } from '../utils/constants.js';

const FileListCollapsed = ({ 
  sortedFiles, 
  selectedFile, 
  visitedFiles,
  formatFileSize,
  onFileSelect
}) => {
  const displayFiles = sortedFiles.slice(0, UI_CONFIG.maxCollapsedFiles);
  const remainingCount = sortedFiles.length - UI_CONFIG.maxCollapsedFiles;

  return (
    <div className="space-y-1 w-full">
      <AnimatePresence mode="popLayout">
        {displayFiles.map((file, index) => {
          const isVisited = visitedFiles.has(file.id);
          const isSelected = selectedFile?.id === file.id;
          
          return (
            <motion.div
              key={file.id}
              className="relative group"
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                transition: { delay: index * 0.03 }
              }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <motion.button
                onClick={() => onFileSelect(file)}
                className={`relative w-full p-2.5 rounded-lg transition-colors duration-200 ${
                  isSelected
                    ? 'bg-red-50 text-red-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-label={file.name}
              >
                <FileText className="w-4 h-4 mx-auto" />
                
                {/* Status Indicators */}
                <AnimatePresence>
                  {!isSelected && (
                    <motion.div 
                      className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${
                        isVisited ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    />
                  )}
                </AnimatePresence>
              </motion.button>
              
              {/* Tooltip */}
              <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                <div className="font-medium">{file.name}</div>
                <div className="text-xs opacity-80">
                  {formatFileSize(file.size)} • {isVisited ? 'Read' : 'Unread'}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      
      {/* Overflow Indicator */}
      {remainingCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-1"
        >
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded text-center">
            +{remainingCount} more
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FileListCollapsed;
