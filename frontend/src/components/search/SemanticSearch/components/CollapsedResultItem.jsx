/**
 * CollapsedResultItem Component
 * Compact view for collapsed sidebar
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Loader2 } from 'lucide-react';
import { ANIMATION_VARIANTS, UI_CONFIG } from '../utils/constants';

const CollapsedResultItem = ({ 
  result, 
  index, 
  isClicking, 
  onClick 
}) => {
  const relevance = result.relevance_score || 0;
  const displayRelevance = Math.round(relevance * 100);
  const fileName = result.pdf_name || result.file_name || 'Document';
  const pageNumber = result.page || result.page_number;
  const headingText = result.heading || result.heading_text;

  // Debug: Log the result data to check relevance score
  console.log(' CollapsedResultItem data:', {
    relevance_score: result.relevance_score,
    calculated_relevance: relevance,
    display_percentage: displayRelevance
  });

  return (
    <motion.div
      variants={ANIMATION_VARIANTS.collapsedItem}
      initial="initial"
      animate="animate"
      exit="exit"
      custom={index}
      layout
      className="relative group"
    >
      <motion.button
        onClick={() => onClick(result)}
        className={`relative w-full p-4 rounded-xl transition-all duration-200 
                    bg-red-600 hover:bg-red-700 text-white shadow-lg 
                    hover:shadow-xl border border-red-500/30`}
        whileHover={{ 
          scale: UI_CONFIG.HOVER_SCALE,
          rotate: 1
        }}
        whileTap={{ scale: UI_CONFIG.TAP_SCALE }}
        aria-label={`${fileName} - ${displayRelevance}% match`}
      >
        {isClicking ? (
          <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin" />
        ) : (
          <Brain className="w-6 h-6 mx-auto mb-2" />
        )}
        
        <div className="space-y-1">
          <div className="text-xs font-bold text-white">
            {isClicking ? 'Opening...' : `${displayRelevance}%`}
          </div>
          
          {/* Relevance bar */}
          <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${displayRelevance}%` }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            />
          </div>
        </div>
        
        {/* AI indicator dot */}
        <motion.div 
          className="absolute top-2 right-2 w-2.5 h-2.5 bg-white rounded-full"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity 
          }}
        />
      </motion.button>
      
      {/* Enhanced Tooltip */}
      <motion.div
        className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 px-4 py-3 
                   bg-gray-900/95 text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 
                   transition-all duration-300 pointer-events-none whitespace-nowrap z-50 
                   max-w-xs border border-white/10 backdrop-blur-lg"
        initial={{ opacity: 0, x: -8, scale: 0.95 }}
        whileHover={{ opacity: 1, x: 0, scale: 1 }}
      >
        <div className="font-semibold text-white mb-1">
          {fileName}
        </div>
        <div className="text-xs mb-2">
          <span className="text-red-400 font-medium">Match:</span> {headingText}
        </div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs">
            <span className="text-red-400 font-medium">Relevance:</span> {displayRelevance}%
          </div>
          {pageNumber && (
            <div className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
              Page {pageNumber}
            </div>
          )}
        </div>
        
        {/* Tooltip Arrow */}
        <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-2 
                        w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent 
                        border-r-gray-900/95" />
      </motion.div>
    </motion.div>
  );
};

export default CollapsedResultItem;
