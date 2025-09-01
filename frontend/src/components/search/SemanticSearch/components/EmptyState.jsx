/**
 * EmptyState Component
 * Display when no search results are found
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Search } from 'lucide-react';

const EmptyState = ({ searchTerm }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12 px-4"
    >
      <div className="relative inline-block mb-6">
        <Brain className="w-16 h-16 mx-auto text-red-300 mb-2" />
        <Search className="w-6 h-6 absolute -bottom-1 -right-1 text-red-500 bg-white rounded-full p-1" />
      </div>
      
      <h4 className="text-lg font-semibold text-gray-900 mb-2">
        No heading matches found
      </h4>
      
      <p className="text-sm text-gray-600 max-w-sm mx-auto leading-relaxed">
        {searchTerm 
          ? `No matches for "${searchTerm}". Try different keywords like "introduction", "methodology", or "conclusion".`
          : 'Enter a search term to find specific headings and sections within your documents using AI-powered search.'
        }
      </p>
      
      {searchTerm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 p-3 bg-red-50 rounded-lg text-xs text-red-700"
        >
          <strong>Tips:</strong> Try broader terms or check spelling
        </motion.div>
      )}
    </motion.div>
  );
};

export default EmptyState;
