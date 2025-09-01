import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchHeadings } from '../../services/api';
import SearchInput from './SemanticSearch/components/SearchInput';
import SearchStatus from './SemanticSearch/components/SearchStatus';
import ResultItem from './SemanticSearch/components/ResultItem';
import CollapsedResultItem from './SemanticSearch/components/CollapsedResultItem';
import EmptyState from './SemanticSearch/components/EmptyState';
import { SEARCH_CONFIG } from './SemanticSearch/utils/constants';

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
  const [clickingFile, setClickingFile] = useState(null);

  // Semantic search function with API integration
  const performSemanticSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSemanticResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      // Call the real search API
      const results = await searchHeadings(query, SEARCH_CONFIG.MAX_RESULTS);
      
      // Debug: Log the API response to check data structure
      console.log(' API Response:', results);
      if (results && results.length > 0) {
        console.log('First result structure:', results[0]);
        console.log('Relevance score:', results[0].relevance_score);
      }
      
      // Transform API results to match our expected format
      const transformedResults = results.map(result => ({
        pdf_id: result.pdf_id,
        pdf_name: result.pdf_name,
        heading: result.heading,
        heading_text: result.heading, // Alias for compatibility
        relevance_score: result.relevance_score,
        page: result.page,
        page_number: result.page, // Alias for compatibility
        level: result.level,
        context: `Found in ${result.pdf_name}, Page ${result.page}`,
        // Legacy format for backward compatibility
        fileId: result.pdf_id,
        pdfName: result.pdf_name,
        relevanceScore: result.relevance_score
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
    }, SEARCH_CONFIG.SEARCH_DELAY);
    
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

  // Enhanced result click for new format
  const handleResultClick = useCallback((result) => {
    if (!onNavigateToDocument) return;
    
    setClickingFile(result.pdfName);
    
    setTimeout(() => {
      console.log(`🎯 Semantic search: navigating to ${result.pdfName}, page ${result.page}`);
      onNavigateToDocument(result.pdfName, result.page, result.heading);
      setClickingFile(null);
    }, 150);
  }, [onNavigateToDocument]);

  return (
    <>
      {/* Semantic Search Input */}
      <SearchInput
        value={semanticSearchTerm}
        onChange={setSemanticSearchTerm}
        isSearching={isSearching}
        leftPanelCollapsed={leftPanelCollapsed}
      />

      {/* Results Counter and Status */}
      <SearchStatus
        searchTerm={semanticSearchTerm}
        isSearching={isSearching}
        resultsCount={semanticResults.length}
        leftPanelCollapsed={leftPanelCollapsed}
      />

      {/* Semantic Results List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {!leftPanelCollapsed ? (
          <div className="space-y-3 w-full">
            <AnimatePresence mode="popLayout">
              {semanticResults.length > 0 ? (
                semanticResults.map((result, index) => (
                  <ResultItem
                    key={`${result.pdf_id}-${result.page}-${index}`}
                    result={result}
                    index={index}
                    isClicking={clickingFile === result.pdf_name}
                    onClick={handleResultClick}
                  />
                ))
              ) : (
                <EmptyState searchTerm={semanticSearchTerm} />
              )}
            </AnimatePresence>
          </div>
        ) : (
          // Collapsed View for Semantic Results
          <div className="space-y-3 w-full overflow-hidden">
            <AnimatePresence mode="popLayout">
              {semanticResults.slice(0, SEARCH_CONFIG.MAX_COLLAPSED_RESULTS).map((result, index) => (
                <CollapsedResultItem
                  key={`${result.pdf_id}-${result.page}-collapsed-${index}`}
                  result={result}
                  index={index}
                  isClicking={clickingFile === result.pdf_name}
                  onClick={handleResultClick}
                />
              ))}
            </AnimatePresence>
            
            {/* Overflow Indicator */}
            {semanticResults.length > SEARCH_CONFIG.MAX_COLLAPSED_RESULTS && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-2"
              >
                <div className="text-xs text-red-600 font-medium bg-red-50 px-3 py-2 rounded-lg inline-flex items-center">
                  +{semanticResults.length - SEARCH_CONFIG.MAX_COLLAPSED_RESULTS} more matches
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
