/**
 * SearchStatus Component
 * Display search status and results count
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target } from 'lucide-react';

const SearchStatus = ({ 
  searchTerm, 
  isSearching, 
  resultsCount, 
  leftPanelCollapsed 
}) => {
  if (leftPanelCollapsed || (!searchTerm && !isSearching)) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="flex items-center justify-between text-sm"
      >
        <div className="flex items-center space-x-2">
          <Target className="w-4 h-4 text-red-600" />
          <span className="text-gray-700">
            {isSearching 
              ? 'Searching headings...' 
              : `${resultsCount} heading${resultsCount !== 1 ? 's' : ''} found`
            }
          </span>
        </div>
        {resultsCount > 0 && (
          <div className="text-xs text-red-600 font-medium">
            Sorted by relevance
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default SearchStatus;
