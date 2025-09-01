import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Plus, Brain, File } from 'lucide-react';
import FilenameSearch from '../search/FilenameSearch';
import SemanticSearch from '../search/SemanticSearch';
import { listDocuments, deleteDocument } from '../../services/api';

const LeftPanel = ({
  leftPanelCollapsed,
  toggleLeftPanel,
  filteredFiles,
  selectedFile,
  handleFileSelect,
  searchTerm,
  handleSearchChange,
  formatFileSize,
  formatTimestamp,
  goldenTransition,
  rightPanelVisible,
  onFileUpload,
  onFileDelete,
  setRightPanelVisible, // Add this prop to control right panel
  onNavigateToDocument, // Add this prop for PDF navigation
  onAIDetection, // Add this prop for AI detection
  onSummaryGenerate, // Add this prop for summary generation
}) => {
  const [visitedFiles, setVisitedFiles] = useState(new Set());
  const fileInputRef = useRef(null);
  const [searchMode, setSearchMode] = useState('filename');

  useEffect(() => {
    if (rightPanelVisible && !leftPanelCollapsed) {
      toggleLeftPanel();
    }
  }, [rightPanelVisible, leftPanelCollapsed, toggleLeftPanel]);

  // Enhanced toggle function that closes right panel when expanding left panel
  const handleToggleLeftPanel = useCallback(() => {
    // If left panel is collapsed and right panel is open, close right panel first
    if (leftPanelCollapsed && rightPanelVisible && setRightPanelVisible) {
      setRightPanelVisible(false);
    }
    // Then toggle the left panel
    toggleLeftPanel();
  }, [leftPanelCollapsed, rightPanelVisible, setRightPanelVisible, toggleLeftPanel]);

  const handleSearchModeChange = useCallback((mode) => {
    setSearchMode(mode);
    if (mode === 'filename') {
      handleSearchChange({ target: { value: '' } });
    }
  }, [handleSearchChange]);

  const handleFileSelectWithVisit = useCallback((file) => {
    setVisitedFiles((prev) => new Set([...prev, file.id]));
    handleFileSelect(file);
  }, [handleFileSelect]);

  const handleFileDelete = useCallback(async (fileId) => {
    // Attempt backend deletion first (best-effort, non-blocking UI)
    try {
      const target = (filteredFiles || []).find((f) => f.id === fileId);
      const filename = target?.name;
      if (filename) {
        const resp = await listDocuments();
        const docs = Array.isArray(resp?.documents) ? resp.documents : [];
        const match = docs.find((d) => d?.filename === filename);
        if (match?.id) {
          try {
            await deleteDocument(match.id);
          } catch {}
        }
      }
    } catch {}

    // Remove from visited files if it was visited
    setVisitedFiles((prev) => {
      const newVisited = new Set(prev);
      newVisited.delete(fileId);
      return newVisited;
    });

    // Delegate to parent for local/indexedDB state updates
    if (onFileDelete) {
      onFileDelete(fileId);
    }
  }, [onFileDelete, filteredFiles]);

  const handleUploadClick = useCallback(() => {
    if (fileInputRef.current) fileInputRef.current.click();
  }, []);

  const handleFileUploadChange = useCallback((event) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0 && onFileUpload) {
      onFileUpload(files);
    }
    event.target.value = '';
  }, [onFileUpload]);

  const containerVariants = {
    expanded: { width: '400px', transition: { ...goldenTransition, staggerChildren: 0.05 } },
    collapsed: { width: '80px', transition: { ...goldenTransition, staggerChildren: 0.03 } },
  };

  return (
    <>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf"
        onChange={handleFileUploadChange}
        className="hidden"
      />

      {/* Left Panel */}
      <motion.aside
        initial={{ opacity: 0, x: -21 }}
        animate={{ opacity: 1, x: 0, width: leftPanelCollapsed ? '80px' : '400px' }}
        variants={containerVariants}
        transition={{ ...goldenTransition, duration: 0.4, ease: "easeOut" }}
        className="flex-shrink-0 bg-white border-r border-gray-100 flex flex-col relative overflow-hidden"
        style={{
          minWidth: leftPanelCollapsed ? '80px' : '400px',
          maxWidth: leftPanelCollapsed ? '80px' : '400px',
        }}
      >
        {/* Header */}
        <div className={`py-3 ${leftPanelCollapsed ? 'px-2' : 'pl-6 pr-2'} border-b border-gray-100 flex items-center justify-between relative`}>
          <AnimatePresence mode="wait">
            {!leftPanelCollapsed && (
              <motion.div
                key="header-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex-1"
              >
                <div className="flex items-center justify-between mt-4">
                  <h3 className="text-xl font-semibold text-gray-900">Document Library</h3>
                  <motion.button
                    onClick={handleUploadClick}
                    className="p-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    aria-label="Upload new documents"
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-gray-500">
                    {filteredFiles.length} document{filteredFiles.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={handleToggleLeftPanel}
            className={`px-2 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 ${leftPanelCollapsed ? 'w-full flex justify-center' : ''}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label={leftPanelCollapsed ? 'Expand library' : 'Collapse library'}
          >
            <ChevronLeft
              className={`w-4 h-4 transition-transform duration-200 ${leftPanelCollapsed ? 'rotate-180 text-red-500' : 'text-gray-600'}`}
            />
          </motion.button>
        </div>

        {/* Search mode toggle */}
        <AnimatePresence>
          {!leftPanelCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="px-6 py-3 border-b border-gray-200"
            >
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <motion.button
                  onClick={() => handleSearchModeChange('filename')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200 ${
                    searchMode === 'filename' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <File className="w-4 h-4" />
                  <span>Filename</span>
                </motion.button>
                <motion.button
                  onClick={() => handleSearchModeChange('semantic')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200 ${
                    searchMode === 'semantic'
                      ? 'bg-red-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Brain className="w-4 h-4" />
                  <span>Semantic</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search container */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {!leftPanelCollapsed && (
            <div className="px-6 py-4 space-y-4 flex-1 flex flex-col overflow-hidden">
              {searchMode === 'filename' ? (
                <FilenameSearch
                  filteredFiles={filteredFiles}
                  selectedFile={selectedFile}
                  handleFileSelectWithVisit={handleFileSelectWithVisit}
                  searchTerm={searchTerm}
                  handleSearchChange={handleSearchChange}
                  formatFileSize={formatFileSize}
                  formatTimestamp={formatTimestamp}
                  visitedFiles={visitedFiles}
                  leftPanelCollapsed={leftPanelCollapsed}
                  onFileDelete={handleFileDelete}
                  onAIDetection={onAIDetection}
                  onSummaryGenerate={onSummaryGenerate}
                />
              ) : (
                <SemanticSearch
                  filteredFiles={filteredFiles}
                  selectedFile={selectedFile}
                  handleFileSelectWithVisit={handleFileSelectWithVisit}
                  formatFileSize={formatFileSize}
                  formatTimestamp={formatTimestamp}
                  visitedFiles={visitedFiles}
                  leftPanelCollapsed={leftPanelCollapsed}
                  onNavigateToDocument={onNavigateToDocument}
                />
              )}
            </div>
          )}

          {/* Collapsed view - only back button and files */}
          {leftPanelCollapsed && (
            <div className="flex-1 overflow-hidden pt-2 px-1">
              <FilenameSearch
                filteredFiles={filteredFiles}
                selectedFile={selectedFile}
                handleFileSelectWithVisit={handleFileSelectWithVisit}
                searchTerm=""
                handleSearchChange={() => {}}
                formatFileSize={formatFileSize}
                formatTimestamp={formatTimestamp}
                visitedFiles={visitedFiles}
                leftPanelCollapsed={leftPanelCollapsed}
                onFileDelete={handleFileDelete}
                onAIDetection={onAIDetection}
                onSummaryGenerate={onSummaryGenerate}
              />
            </div>
          )}
        </div>
      </motion.aside>
    </>
  );
};

export default LeftPanel;
