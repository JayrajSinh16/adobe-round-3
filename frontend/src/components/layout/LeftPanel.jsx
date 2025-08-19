import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Plus, Brain, File } from 'lucide-react';
import FilenameSearch from '../search/FilenameSearch';
import SemanticSearch from '../search/SemanticSearch';

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

  const handleFileDelete = useCallback((fileId) => {
    // Remove from visited files if it was visited
    setVisitedFiles((prev) => {
      const newVisited = new Set(prev);
      newVisited.delete(fileId);
      return newVisited;
    });
    
    // Call parent delete handler
    if (onFileDelete) {
      onFileDelete(fileId);
    }
  }, [onFileDelete]);

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
        transition={{ ...goldenTransition, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex-shrink-0 bg-white/90 backdrop-blur-sm border-r border-[#E5E7EB]/20 flex flex-col shadow-xl relative overflow-hidden"
        style={{
          backdropFilter: 'blur(20px) saturate(180%)',
          borderImage: 'linear-gradient(180deg, rgba(229, 231, 235, 0.3), rgba(229, 231, 235, 0.1)) 1',
          minWidth: leftPanelCollapsed ? '80px' : '400px',
          maxWidth: leftPanelCollapsed ? '80px' : '400px',
        }}
      >
        {/* Header */}
        <div className={`py-2 ${leftPanelCollapsed ? 'px-2' : 'pl-6 pr-2'} border-b border-[#E5E7EB]/20 flex items-center justify-between relative`}>
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
                <div className="flex items-center justify-between mt-6 ">
                  <h3 className="text-[26px] font-bold text-[#1A1A1A] tracking-tight">Document Library</h3>
                  <motion.button
                    onClick={handleUploadClick}
                    className="group relative p-3 bg-gradient-to-r from-[#DC2626] to-[#B91C1C] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    whileHover={{ scale: 1.05, rotate: 90 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Upload new documents"
                  >
                    <Plus className="w-5 h-5 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.button>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[16px] text-[#1A1A1A] opacity-60 font-medium">
                    {filteredFiles.length} document{filteredFiles.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={handleToggleLeftPanel}
            className={`p-3 rounded-xl hover:bg-[#E5E7EB]/50 transition-all duration-300 relative group ${leftPanelCollapsed ? 'w-full flex justify-center' : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={leftPanelCollapsed ? 'Expand library' : 'Collapse library'}
          >
            <ChevronLeft
              className={`w-5 h-5 transition-all duration-500 ${leftPanelCollapsed ? 'rotate-180 text-[#DC2626]' : 'text-[#1A1A1A]'}`}
            />
            <div className="absolute inset-0 bg-[#DC2626]/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
              className="px-6 border-b border-[#E5E7EB]/20 space-y-4"
            >
              <div className="flex items-center space-x-1 bg-[#F3F4F6] rounded-xl p-1">
                <motion.button
                  onClick={() => handleSearchModeChange('filename')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    searchMode === 'filename' ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-[#1A1A1A] opacity-60 hover:opacity-100'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <File className="w-4 h-4" />
                  <span>Filename</span>
                </motion.button>
                <motion.button
                  onClick={() => handleSearchModeChange('semantic')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    searchMode === 'semantic'
                      ? 'bg-gradient-to-r from-[#DC2626] to-[#B91C1C] text-white shadow-sm'
                      : 'text-[#1A1A1A] opacity-60 hover:opacity-100'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
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
              />
            </div>
          )}
        </div>
      </motion.aside>
    </>
  );
};

export default LeftPanel;
