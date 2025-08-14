import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  X, 
  Loader2,
  Sparkles
} from 'lucide-react';

const TextSelectionPopup = ({ 
  position, 
  selectedText, 
  fileName, 
  pageNumber,
  onProcess, 
  onClose, 
  isVisible 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleGetInsights = async () => {
    setIsProcessing(true);
    try {
      await onProcess({
        text: selectedText,
        fileName,
        pageNumber,
        action: 'analyze'
      });
    } catch (error) {
      console.error('Failed to process text:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const truncateText = (text, maxLength = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Calculate better position to stay within viewport
  const getOptimalPosition = () => {
    if (!position) return { x: 0, y: 0 };
    
    const popupWidth = 320; // Approximate popup width
    const popupHeight = 220; // Approximate popup height
    const padding = 20; // Padding from viewport edges
    
    let x = position.x;
    let y = position.y;
    
    // Adjust horizontal position to stay within viewport
    if (x + popupWidth/2 > window.innerWidth - padding) {
      x = window.innerWidth - popupWidth - padding;
    } else if (x - popupWidth/2 < padding) {
      x = padding + popupWidth/2;
    }
    
    // Adjust vertical position to stay within viewport
    if (y + popupHeight > window.innerHeight - padding) {
      y = position.y - popupHeight - 20; // Show above selection
    }
    
    // Ensure minimum distance from top
    if (y < padding) {
      y = padding;
    }
    
    return { x, y };
  };

  const optimalPosition = getOptimalPosition();

  return (
    <AnimatePresence>
      {isVisible && position && (
        <>
          {/* Backdrop to catch clicks and close popup */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998]"
            onClick={onClose}
          />
          
          {/* Main popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25,
              duration: 0.2 
            }}
            className="fixed z-[9999] pointer-events-auto"
            style={{
              left: `${optimalPosition.x}px`,
              top: `${optimalPosition.y}px`,
              transform: 'translateX(-50%)'
            }}
            onClick={(e) => e.stopPropagation()} // Prevent backdrop click when clicking popup
          >
            {/* Complete rectangle popup without pointer */}
            <div className="bg-white rounded-xl shadow-2xl border-2 border-gray-300 overflow-hidden w-80 max-w-[90vw]">
              
              {/* Header */}
              <div className="bg-gradient-to-r from-[#DC2626] to-[#B91C1C] px-4 py-3 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="font-semibold text-sm">Text Selected</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent event bubbling
                      onClose();
                    }}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                
                {/* Selected text preview */}
                <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-[#DC2626]">
                  <div className="mb-2">
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Selected Text
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-800 leading-relaxed line-clamp-3">
                    "{truncateText(selectedText, 120)}"
                  </p>
                  
                  {/* Context info */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200">
                    <span className="text-xs text-gray-500 truncate">
                      📄 {fileName}
                    </span>
                    {pageNumber && (
                      <span className="text-xs text-gray-500">
                        📃 Page {pageNumber}
                      </span>
                    )}
                  </div>
                </div>

                {/* Main Action Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGetInsights}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-[#DC2626] to-[#B91C1C] text-white px-6 py-3 rounded-lg font-semibold text-base flex items-center justify-center space-x-3 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Getting Insights...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5" />
                      <span>Get Insights</span>
                    </>
                  )}
                </motion.button>

                {/* Instructions */}
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    AI will analyze the selected text for insights
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TextSelectionPopup;
