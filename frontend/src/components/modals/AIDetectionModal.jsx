import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, User, BarChart3, AlertTriangle } from 'lucide-react';

export default function AIDetectionModal({ isOpen, onClose, file, onDetectionComplete }) {
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [results, setResults] = React.useState(null);

  // Mock AI detection function - replace with actual API call
  const performAIDetection = async () => {
    setIsAnalyzing(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock results - replace with actual API response
    const mockResults = {
      aiProbability: Math.random() * 0.4 + 0.3, // Random between 30-70%
      humanProbability: Math.random() * 0.4 + 0.3,
      confidence: Math.random() * 0.3 + 0.7, // Random between 70-100%
      segments: [
        { text: "Introduction paragraph", aiProbability: 0.85, startIndex: 0, endIndex: 120 },
        { text: "Main content section", aiProbability: 0.25, startIndex: 121, endIndex: 350 },
        { text: "Conclusion section", aiProbability: 0.65, startIndex: 351, endIndex: 500 }
      ]
    };
    
    setResults(mockResults);
    setIsAnalyzing(false);
    
    if (onDetectionComplete) {
      onDetectionComplete(mockResults);
    }
  };

  const handleClose = () => {
    setResults(null);
    setIsAnalyzing(false);
    onClose();
  };

  const formatPercentage = (value) => `${(value * 100).toFixed(1)}%`;

  const getResultColor = (aiProb) => {
    if (aiProb > 0.7) return 'text-red-600';
    if (aiProb > 0.4) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getResultBg = (aiProb) => {
    if (aiProb > 0.7) return 'bg-red-50 border-red-200';
    if (aiProb > 0.4) return 'bg-yellow-50 border-yellow-200';
    return 'bg-green-50 border-green-200';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[1000] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={handleClose} />
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden border border-white/40"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-white to-gray-50/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#DC2626] to-[#EF4444] rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900">AI Content Detection</h3>
                  <p className="text-sm text-gray-500">{file?.name || 'Document Analysis'}</p>
                </div>
              </div>
              <button 
                onClick={handleClose} 
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {!results && !isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-[#DC2626]/10 to-[#EF4444]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8 text-[#DC2626]" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Analyze Content Authenticity</h4>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Use our advanced AI detection to determine if this document was written by AI or humans.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={performAIDetection}
                    className="bg-gradient-to-r from-[#DC2626] to-[#EF4444] text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                  >
                    Start Analysis
                  </motion.button>
                </motion.div>
              )}

              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="relative inline-flex mb-6">
                    <div className="w-16 h-16 rounded-full border-4 border-[#DC2626]/20"></div>
                    <div className="w-16 h-16 rounded-full border-4 border-t-[#DC2626] border-r-transparent border-b-transparent border-l-transparent animate-spin absolute left-0 top-0"></div>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Analyzing Content...</h4>
                  <p className="text-gray-600">Please wait while we process your document</p>
                </motion.div>
              )}

              {results && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Overall Results */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-xl border-2 ${getResultBg(results.aiProbability)}`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <Brain className="w-5 h-5 text-[#DC2626]" />
                        <span className="font-semibold text-gray-900">AI Generated</span>
                      </div>
                      <div className={`text-2xl font-bold ${getResultColor(results.aiProbability)}`}>
                        {formatPercentage(results.aiProbability)}
                      </div>
                    </div>

                    <div className={`p-4 rounded-xl border-2 ${getResultBg(1 - results.aiProbability)}`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-gray-900">Human Written</span>
                      </div>
                      <div className={`text-2xl font-bold ${getResultColor(1 - results.aiProbability)}`}>
                        {formatPercentage(1 - results.aiProbability)}
                      </div>
                    </div>
                  </div>

                  {/* Confidence Score */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-900">Confidence Score</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${results.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-lg font-bold text-blue-600">
                        {formatPercentage(results.confidence)}
                      </span>
                    </div>
                  </div>

                  {/* Segment Analysis */}
                  {results.segments && (
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Detailed Segment Analysis</span>
                      </h5>
                      <div className="space-y-3">
                        {results.segments.map((segment, index) => (
                          <div 
                            key={index}
                            className={`p-3 rounded-lg border ${getResultBg(segment.aiProbability)}`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-sm">{segment.text}</span>
                              <span className={`font-bold ${getResultColor(segment.aiProbability)}`}>
                                {formatPercentage(segment.aiProbability)} AI
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              Characters {segment.startIndex}-{segment.endIndex}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-center space-x-4 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setResults(null);
                        performAIDetection();
                      }}
                      className="px-6 py-2 border-2 border-[#DC2626] text-[#DC2626] rounded-xl font-semibold hover:bg-[#DC2626] hover:text-white transition-all duration-200"
                    >
                      Re-analyze
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleClose}
                      className="px-6 py-2 bg-gradient-to-r from-[#DC2626] to-[#EF4444] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                    >
                      Close
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}