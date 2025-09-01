/**
 * File List Expanded Component - Minimal Professional Design
 * Clean full file list view with essential features
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText } from 'lucide-react';
import FileItem from './FileItem.jsx';

const FileListExpanded = ({ 
  sortedFiles, 
  selectedFile, 
  visitedFiles,
  formatFileSize,
  onFileSelect,
  isDropdownOpen,
  onToggleDropdown,
  fileActions,
  searchTerm
}) => {
  const { handleAIDetection, handleSummaryGenerate, handleDeleteFile } = fileActions;

  if (sortedFiles.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <h4 className="text-base font-medium text-gray-900 mb-1">No documents found</h4>
        <p className="text-sm text-gray-500">
          {searchTerm ? 'Try adjusting your search terms' : 'Upload documents to get started'}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-2 w-full">
      <AnimatePresence mode="popLayout">
        {sortedFiles.map((file, index) => {
          const isVisited = visitedFiles.has(file.id);
          const isSelected = selectedFile?.id === file.id;
          
          return (
            <FileItem
              key={file.id}
              file={file}
              index={index}
              isSelected={isSelected}
              isVisited={isVisited}
              formatFileSize={formatFileSize}
              onFileSelect={onFileSelect}
              isDropdownOpen={isDropdownOpen(file.id)}
              onToggleDropdown={(e) => onToggleDropdown(file.id, e)}
              onAIDetection={handleAIDetection}
              onSummaryGenerate={handleSummaryGenerate}
              onDelete={handleDeleteFile}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default FileListExpanded;
