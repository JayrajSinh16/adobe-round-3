/**
 * ResultItem Component
 * Individual search result item with professional design
 */

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ChevronRight } from 'lucide-react';
import { getRelevanceColor, truncateText } from '../utils/searchUtils';
import { ANIMATION_VARIANTS, UI_CONFIG } from '../utils/constants';

const ResultItem = ({ 
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
  console.log(' ResultItem data:', {
    relevance_score: result.relevance_score,
    calculated_relevance: relevance,
    display_percentage: displayRelevance,
    result_keys: Object.keys(result)
  });

  return (
    <motion.article
      variants={ANIMATION_VARIANTS.resultItem}
      initial="initial"
      animate="animate"
      exit="exit"
      custom={index}
      layout
      className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-200 
                  border border-gray-200/60 bg-red-50 hover:bg-white hover:border-red-200 
                  hover:shadow-lg backdrop-blur-sm ${getRelevanceColor(relevance)}`}
      onClick={() => onClick(result)}
      whileHover={{ 
        y: -2,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      whileTap={{ 
        scale: UI_CONFIG.TAP_SCALE,
        transition: { duration: 0.1 }
      }}
    >
      <div className="flex items-start space-x-4">
        {/* File Icon */}
        <motion.div 
          className="p-3 rounded-lg bg-red-100 text-red-600 flex-shrink-0"
          whileHover={{ scale: 1.05, rotate: 2 }}
          transition={{ duration: 0.2 }}
        >
          <FileText className="w-5 h-5" />
        </motion.div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header with relevance */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-red-700 transition-colors">
                {fileName}
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                Page {pageNumber} • {result.level || 'Section'}
              </p>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
              <div className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                {displayRelevance}%
              </div>
              {isClicking ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.5, ease: "linear" }}
                  className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full"
                />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" />
              )}
            </div>
          </div>

          {/* Heading match */}
          <div className="bg-red-50/80 border-l-4 border-red-400 p-3 rounded-r-lg">
            <div className="text-sm font-medium text-red-800 mb-1">
              {truncateText(headingText, 100)}
            </div>
            {result.context && (
              <div className="text-xs text-red-600/80">
                {truncateText(result.context, 150)}
              </div>
            )}
          </div>

          {/* Relevance bar */}
          <div className="mt-3">
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${displayRelevance}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Clicking overlay */}
      {isClicking && (
        <motion.div
          className="absolute inset-0 bg-red-100/30 rounded-xl"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      )}
    </motion.article>
  );
};

export default ResultItem;
