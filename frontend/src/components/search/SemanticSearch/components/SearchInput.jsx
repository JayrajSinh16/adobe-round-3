/**
 * SearchInput Component
 * Professional search input with AI indicators
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Search, Brain, Loader2 } from 'lucide-react';
import { ANIMATION_VARIANTS } from '../utils/constants';

const SearchInput = ({ 
  value, 
  onChange, 
  isSearching, 
  leftPanelCollapsed 
}) => {
  if (leftPanelCollapsed) return null;

  return (
    <div className="relative group">
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2 z-10">
        <motion.div
          variants={ANIMATION_VARIANTS.searchInput}
          initial="initial"
          animate="animate"
          className="flex items-center space-x-1"
        >
          <Search className="w-4 h-4 text-red-600 group-focus-within:text-red-700" />
          {isSearching && (
            <Loader2 className="w-3 h-3 text-red-600 animate-spin" />
          )}
        </motion.div>
      </div>
      
      <input
        type="text"
        placeholder="Search document headings..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-16 py-3 border-2 border-red-200/50 bg-white/80 
                   rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 
                   transition-all duration-200 text-sm font-medium 
                   placeholder-gray-500 hover:bg-white hover:border-red-300/60
                   backdrop-blur-sm"
      />
      
      {/* AI Badge */}
      
    </div>
  );
};

export default SearchInput;
