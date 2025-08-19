import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Brain, Target, FileText
} from 'lucide-react';
import { searchHeadings } from '../../services/api';

const SemanticSearch = ({
  filteredFiles,
  selectedFile,
  handleFileSelectWithVisit,
  formatFileSize,
  formatTimestamp,
  visitedFiles,
  leftPanelCollapsed,
  onNavigateToDocument
}) => {
  // Local state for semantic search
  const [semanticSearchTerm, setSemanticSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [semanticResults, setSemanticResults] = useState([]);
  const [clickingFile, setClickingFile] = useState(null); // Track which file is being clicked

  // Semantic search function with API integration
  const performSemanticSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSemanticResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      // Call the real search API
      const results = await searchHeadings(query, 10);
      
      // Transform API results to match our expected format
      const transformedResults = results.map(result => ({
        fileId: result.pdf_id,
        heading: result.heading,
        relevanceScore: result.relevance_score,
        context: `Found in ${result.pdf_name}, Page ${result.page}`,
        page: result.page,
        pdfName: result.pdf_name,
        level: result.level
      }));
      
      setSemanticResults(transformedResults);
    } catch (error) {
      console.error('Semantic search failed:', error);
      // Fallback to empty results on error
      setSemanticResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced semantic search
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      performSemanticSearch(semanticSearchTerm);
    }, 500);
    
    return () => clearTimeout(delayedSearch);
  }, [semanticSearchTerm, performSemanticSearch]);

  // Process semantic results into file format
  const sortedFiles = React.useMemo(() => {
    if (semanticResults.length === 0) return [];
    
    return semanticResults.map(result => {
      // Find the actual file by matching PDF ID
      const file = filteredFiles.find(f => f.id === result.fileId) || {
        id: result.fileId,
        name: result.pdfName || `Document ${result.fileId}`,
        size: Math.floor(Math.random() * 5000000) + 1000000,
        lastAccessed: Date.now() - Math.floor(Math.random() * 10000000),
        confidence: result.relevanceScore
      };
      return {
        ...file,
        semanticHeading: result.heading,
        semanticContext: result.context,
        relevanceScore: result.relevanceScore,
        page: result.page,
        pdfName: result.pdfName,
        level: result.level,
        isSemanticResult: true
      };
    });
  }, [semanticResults, filteredFiles]);

  // Enhanced file selection with PDF navigation for semantic search results
  const handleFileClick = useCallback(async (file) => {
    setClickingFile(file.id);
    
    // Add a small delay to show the clicking animation
    setTimeout(() => {
      if (file.isSemanticResult && onNavigateToDocument && file.pdfName && file.page) {
        // Navigate to the specific document and page from semantic search
        console.log(`🎯 Semantic search: navigating to ${file.pdfName}, page ${file.page}`);
        onNavigateToDocument(file.pdfName, file.page, file.semanticHeading);
      } else {
        // Fallback to normal file selection
        handleFileSelectWithVisit(file);
      }
      setClickingFile(null);
    }, 150);
  }, [handleFileSelectWithVisit, onNavigateToDocument]);

  return (
    <>
      {/* Semantic Search Input - only show when not collapsed */}
      {!leftPanelCollapsed && (
        <div className="relative group">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center space-x-1"
            >
              <Sparkles className="w-4 h-4 text-[#DC2626] group-focus-within:text-[#DC2626]" />
              {isSearching && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-3 h-3 border-2 border-[#DC2626] border-t-transparent rounded-full"
                />
              )}
            </motion.div>
          </div>
          
          <input
            type="text"
            placeholder="Search document headings... (e.g., 'introduction', 'methodology', 'results')"
            value={semanticSearchTerm}
            onChange={(e) => setSemanticSearchTerm(e.target.value)}
            className="w-full pl-12 pr-16 py-3 border-2 border-[#DC2626]/30 bg-gradient-to-r from-[#DC2626]/5 to-[#B91C1C]/5 rounded-xl focus:ring-2 focus:ring-[#DC2626]/20 focus:border-[#DC2626] transition-all duration-300 text-sm font-medium placeholder-[#1A1A1A] placeholder-opacity-40 hover:bg-white"
            style={{
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 16px rgba(220, 38, 38, 0.1)'
            }}
          />
          
          {/* AI Indicator */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute right-3 top-1/4 transform -translate-y-1/2"
          >
            <div className="bg-[#DC2626] text-white text-xs px-2 py-1 rounded-full font-bold flex items-center space-x-1">
              <Brain className="w-3 h-3" />
              <span>AI</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Results Counter and Status - only show when not collapsed */}
      {!leftPanelCollapsed && (
        <AnimatePresence>
          {(semanticSearchTerm || isSearching) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-[#DC2626]" />
                <span className="text-[#1A1A1A] opacity-70">
                  {isSearching ? 'Searching headings...' : `${semanticResults.length} heading matches`}
                </span>
              </div>
              {semanticResults.length > 0 && (
                <div className="text-xs text-[#DC2626] font-medium">
                  Sorted by relevance
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Semantic Results List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {!leftPanelCollapsed ? (
          <div className="space-y-3 w-full">
            <AnimatePresence mode="popLayout">
              {sortedFiles.map((file, index) => {
                const isSelected = selectedFile?.id === file.id;
                const isClicking = clickingFile === file.id;
                
                return (
                  <motion.article
                    key={`${file.id}-semantic`}
                    layout
                    initial={{ opacity: 0, y: 13, scale: 0.95 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0, 
                      scale: 1,
                      transition: { 
                        delay: index * 0.055,
                        type: "spring",
                        stiffness: 400,
                        damping: 25
                      }
                    }}
                    exit={{ opacity: 0, scale: 0.95, y: -13 }}
                    className={`group relative px-4 pt-4 my-2 mx-2 rounded-2xl cursor-pointer transition-all duration-300 border overflow-hidden `}
                    onClick={() => handleFileClick(file)}
                    whileHover={{ 
                      y: isSelected ? 0 : (isClicking ? 0 : -4),
                      transition: { duration: 0.2, type: "spring", stiffness: 400 }
                    }}
                    whileTap={{ 
                      scale: 0.96,
                      transition: { duration: 0.1 }
                    }}
                    style={{
                      backdropFilter: 'blur(12px) saturate(120%)',
                     
                    }}
                  >
                    {/* File Header */}
                    <div className="flex items-start space-x-4">
                        <div>
                      <motion.div 
                        className={`p-3 rounded-xl transition-all duration-500 relative overflow-hidden ${
                          isSelected 
                            ? 'bg-[#DC2626] text-white  ring-2 ring-white/30' 
                            : 'bg-gradient-to-br from-[#DC2626] to-[#B91C1C] text-white  group-hover:shadow-xl group-hover:scale-105'
                        }`}
                        whileHover={!isSelected ? { scale: 1.1, rotate: 5 } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        <Brain className="w-5 h-5 relative z-10" />
                        
                        {/* Selected state indicator glow */}
                        
                        
                        {/* Clicking state indicator */}
                        {isClicking && (
                          <motion.div
                            className="absolute inset-0 bg-white/30 rounded-xl"
                            animate={{ 
                              opacity: [0.3, 0.6, 0.3],
                              scale: [1, 1.1, 1]
                            }}
                            transition={{ 
                              duration: 0.3, 
                              ease: "easeInOut"
                            }}
                          />
                        )}
                      </motion.div>
                       <div className="flex items-center space-x-1 mt-2">
                                  <div className="text-xs font-medium text-[#DC2626] bg-[#DC2626]/20 px-2 py-1 rounded-full">
                                    {Math.round(file.relevanceScore * 100)}% 
                                  </div>
                                </div>
                                </div>
                      <div className="flex-1 min-w-0">
                        {/* Semantic Context */}
                        <div className="space-y-2 mb-3">
                          {file.semanticHeading && (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`rounded-lg px-3 py-2 border transition-all duration-300 ${
                                isSelected 
                                  ? 'bg-[#DC2626]/15 border-[#DC2626]/30 ring-1 ring-[#DC2626]/20'
                                  : 'bg-[#DC2626]/10 border-[#DC2626]/20 group-hover:bg-[#DC2626]/15 group-hover:border-[#DC2626]/30'
                              }`}
                            >
                              <div className="text-sm font-bold text-[#DC2626] mb-1 flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Target className="w-3 h-3" />
                                  <span>Found: {file.semanticHeading}</span>
                                </div>
                               
                              </div>
                              {file.semanticContext && (
                                <div className="text-xs text-[#1A1A1A] opacity-70 mt-1">
                                  {file.semanticContext}
                                </div>
                              )}
                            </motion.div>
                          )}
                          
                          <div className="flex items-center justify-between space-x-2">
                            {/* <h4 className={`text-[15px] font-semibold truncate transition-colors duration-300 ${
                              isSelected ? 'text-[#DC2626] font-bold' : 'text-[#1A1A1A] group-hover:text-[#DC2626]'
                            }`}>
                              {file.name}
                            </h4> */}
                            
                           {/* Click indicator */}
                          {/* <motion.div 
                            className={`text-xs font-medium px-2 py-1 rounded-full transition-all duration-300 ${
                              isSelected 
                                ? 'bg-[#DC2626]/20 text-[#DC2626] border border-[#DC2626]/30'
                                : isClicking
                                ? 'bg-[#DC2626]/30 text-[#DC2626] border border-[#DC2626]/40 animate-pulse'
                                : 'bg-[#E5E7EB] text-[#6B7280] group-hover:bg-[#DC2626]/10 group-hover:text-[#DC2626] group-hover:border group-hover:border-[#DC2626]/20'
                            }`}
                            whileHover={{ scale: 1.05 }}
                          >
                            {isSelected ? 'Viewing' : isClicking ? 'Opening...' : 'Open'}
                          </motion.div> */}
                          </div>
                          
                          
                        </div>
                        
                        
                      </div>
                    </div>
                    
                    {/* Selection Indicator
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div 
                          initial={{ scaleY: 0, opacity: 0 }}
                          animate={{ scaleY: 1, opacity: 1 }}
                          exit={{ scaleY: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="absolute left-0 top-1/2 transform -translate-y-1/2 w-2 h-10 bg-gradient-to-b from-[#DC2626] to-[#B91C1C] rounded-r-full "
                          layoutId="selectedIndicator"
                        />
                      )}
                    </AnimatePresence> */}
                    
                    {/* Hover glow effect */}
                    <motion.div
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      style={{
                        background: isSelected 
                          ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(185, 28, 28, 0.05) 100%)'
                          : 'linear-gradient(135deg, rgba(220, 38, 38, 0.05) 0%, rgba(185, 28, 28, 0.02) 100%)',
                      }}
                    />
                  </motion.article>
                );
              })}
            </AnimatePresence>

            {/* Empty State */}
            {sortedFiles.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <Brain className="w-16 h-16 mx-auto text-[#DC2626] opacity-30 mb-4" />
                <h4 className="text-lg font-bold text-[#1A1A1A] mb-2">No heading matches found</h4>
                <p className="text-sm text-[#1A1A1A] opacity-60 max-w-sm mx-auto leading-relaxed">
                  {semanticSearchTerm 
                    ? `Try different keywords. Search for document sections like "introduction", "methodology", "results", or "conclusion".`
                    : 'Enter a search term to find specific headings and sections within your documents using AI-powered search.'
                  }
                </p>
              </motion.div>
            )}
          </div>
        ) : (
          // Collapsed View for Semantic Results
          <div className="space-y-3 w-full overflow-hidden">
            <AnimatePresence mode="popLayout">
              {sortedFiles.slice(0, 8).map((file, index) => {
                const isSelected = selectedFile?.id === file.id;
                const isClicking = clickingFile === file.id;
                
                return (
                  <motion.div
                    key={file.id}
                    className="relative group"
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      transition: { delay: index * 0.05 }
                    }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <motion.button
                      onClick={() => handleFileClick(file)}
                      className={`relative w-full p-4 rounded-xl transition-all duration-300 group ${
                        isSelected
                          ? 'bg-[#DC2626] text-white   ring-2 ring-[#DC2626]/50 scale-105'
                          : isClicking
                          ? 'bg-[#DC2626]/90 text-white ring-1 ring-[#DC2626]/40 scale-95'
                          : 'bg-gradient-to-br from-[#DC2626] to-[#B91C1C] text-white ring-2 ring-[#DC2626]/30'
                      }`}
                      whileHover={{ 
                        scale: isSelected ? 1.05 : (isClicking ? 0.95 : 1.08),
                        rotate: isSelected ? 0 : (isClicking ? 0 : 2)
                      }}
                      whileTap={{ scale: 0.92 }}
                      aria-label={file.name}
                      style={{
                        
                      }}
                    >
                      <Brain className="w-6 h-6 mx-auto mb-2" />
                      
                      {/* Relevance score indicator with visual bar */}
                      <div className="space-y-1">
                        <motion.div 
                          className={`text-xs font-bold ${
                            isSelected ? 'text-white/90' : isClicking ? 'text-white animate-pulse' : 'text-white/80'
                          }`}
                          whileHover={{ scale: 1.1 }}
                        >
                          {isClicking ? 'Opening...' : `${Math.round(file.relevanceScore * 100)}%` }
                        </motion.div>
                        
                        {/* Relevance bar */}
                        <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-white rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${file.relevanceScore * 100}% ` }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                          />
                        </div>
                      </div>
                      
                      {/* AI Indicator */}
                      <motion.div 
                        className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${
                          isSelected ? 'bg-white' : isClicking ? 'bg-white animate-ping' : 'bg-white/80'
                        }`}
                        animate={{ 
                          scale: isSelected ? [1, 1.3, 1] : isClicking ? [1, 1.5, 1] : [1, 1.2, 1],
                          opacity: isSelected ? [0.8, 1, 0.8] : isClicking ? [0.8, 1, 0.8] : [0.7, 1, 0.7]
                        }}
                        transition={{ 
                          duration: isSelected ? 1.5 : isClicking ? 0.5 : 2, 
                          repeat: Infinity 
                        }}
                      />
                      
                      {/* Selection glow effect */}
                      
                    </motion.button>
                    
                    {/* Enhanced Tooltip */}
                    <motion.div
                      className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 px-4 py-3 bg-[#1A1A1A] text-white text-sm font-medium rounded-xl  opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 max-w-xs border border-white/10"
                      initial={{ opacity: 0, x: -8, scale: 0.95 }}
                      whileHover={{ opacity: 1, x: 0, scale: 1 }}
                      style={{ backdropFilter: 'blur(12px)' }}
                    >
                      <div className="font-semibold text-white mb-1">{file.name}</div>
                      <div className="text-xs mb-2">
                        <span className="text-[#DC2626] font-medium">AI Match:</span> {file.semanticHeading}
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs">
                          <span className="text-[#DC2626] font-medium">Relevance:</span> {Math.round(file.relevanceScore * 100)}% 
                        </div>
                        {file.page && (
                          <div className="text-xs bg-[#DC2626]/20 text-[#DC2626] px-2 py-1 rounded">
                            Page {file.page}
                          </div>
                        )}
                      </div>
                      <div className="text-xs opacity-60">
                        {formatFileSize(file.size)} • {formatTimestamp(file.lastAccessed)}
                      </div>
                      
                      {/* Tooltip Arrow */}
                      <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-[#1A1A1A]"></div>
                      
                      {/* Tooltip glow */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#DC2626]/20 to-transparent opacity-50 pointer-events-none"></div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {/* Overflow Indicator */}
            {sortedFiles.length > 8 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-2"
              >
                <div className="text-xs text-[#DC2626] font-medium bg-[#DC2626]/10 px-2 py-1 rounded-lg inline-flex items-center">
                  +{sortedFiles.length - 8} more AI matches
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default SemanticSearch;
