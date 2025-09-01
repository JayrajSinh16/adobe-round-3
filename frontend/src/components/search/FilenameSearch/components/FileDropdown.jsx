/**
 * File Dropdown Component - Minimal Professional Design
 * Clean context menu for file operations
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, FileText as SummaryIcon, Trash2 } from 'lucide-react';

const FileDropdown = ({ 
  isOpen, 
  file, 
  onAIDetection, 
  onSummaryGenerate, 
  onDelete 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -8 }}
          transition={{ duration: 0.1 }}
          className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[100] min-w-[140px]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="py-1">
            <button
              onClick={(e) => onSummaryGenerate(e, file)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 transition-colors"
            >
              <SummaryIcon className="w-4 h-4 text-green-600" />
              <span className="text-gray-700">Summary</span>
            </button>
            
            <button
              onClick={(e) => onAIDetection(e, file)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 transition-colors"
            >
              <Brain className="w-4 h-4 text-red-600" />
              <span className="text-gray-700">AI Check</span>
            </button>
            
            <div className="my-1 h-px bg-gray-100"></div>
            
            <button
              onClick={(e) => onDelete(e, file.id)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center space-x-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FileDropdown;
