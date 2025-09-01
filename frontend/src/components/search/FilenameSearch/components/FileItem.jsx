/**
 * File Item Component - Minimal Professional Design
 * Clean, production-ready file item with essential interactions
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, MoreVertical } from 'lucide-react';
import FileDropdown from './FileDropdown.jsx';

const FileItem = ({ 
  file, 
  index, 
  isSelected, 
  isVisited,
  formatFileSize,
  onFileSelect,
  isDropdownOpen,
  onToggleDropdown,
  onAIDetection,
  onSummaryGenerate,
  onDelete
}) => {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        transition: { 
          delay: index * 0.03,
          duration: 0.2,
          ease: "easeOut"
        }
      }}
      exit={{ opacity: 0, y: -8 }}
      className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
        isSelected
          ? 'bg-red-100/10 border-red-100 shadow-sm'
          : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300'
      } ${isDropdownOpen ? 'z-50' : ''}`}
      onClick={() => onFileSelect(file)}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center space-x-3">
        {/* File Icon */}
        <div className={`p-2 rounded-md transition-colors duration-200 ${
          isSelected 
            ? 'bg-red-50 text-red-600' 
            : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
        }`}>
          <FileText className="w-4 h-4" />
        </div>
        
        {/* File Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 max-w-[60%]">
              <h4 className={`text-sm font-medium truncate ${
                isSelected ? 'text-red-600' : 'text-gray-900'
              }`}>
                {file.name}
              </h4>
              {!isVisited && (
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
              )}
              {isVisited && (
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
              )}
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-1 ">
              <span className="text-xs text-gray-500 font-medium">
                {formatFileSize(file.size)}
              </span>
              
              {/* Dropdown Menu */}
              <div className="relative">
                <motion.button
                  onClick={onToggleDropdown}
                  className={`p-1.5 rounded-md transition-colors duration-200 ${
                    isDropdownOpen 
                      ? 'bg-gray-200 text-gray-700' 
                      : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={`Options for ${file.name}`}
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </motion.button>

                <FileDropdown
                  isOpen={isDropdownOpen}
                  file={file}
                  onAIDetection={onAIDetection}
                  onSummaryGenerate={onSummaryGenerate}
                  onDelete={onDelete}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Selection Indicator */}
      <AnimatePresence>
        {isSelected && (
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 top-0 bottom-0 w-0.5 bg-red-500 rounded-r-sm"
          />
        )}
      </AnimatePresence>
    </motion.article>
  );
};

export default FileItem;
