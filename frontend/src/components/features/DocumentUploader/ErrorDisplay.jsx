// ErrorDisplay component for DocumentUploader error messages
// Shows validation errors and upload failures with consistent styling

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

const ErrorDisplay = ({ errors }) => {
  if (!errors || errors.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-white border-l-4 border-[#DC2626] rounded-2xl p-8 shadow-lg">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-[#DC2626]" />
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-bold text-[#1A1A1A] mb-4">
                {errors.some(e => e.includes('Failed to upload')) 
                  ? 'Backend Upload Error' 
                  : 'Upload Issues Detected'}
              </h4>
              <ul className="space-y-2">
                {errors.map((error, index) => (
                  <motion.li 
                    key={index} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-[#1A1A1A] opacity-70 leading-relaxed"
                  >
                    {error}
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ErrorDisplay;
