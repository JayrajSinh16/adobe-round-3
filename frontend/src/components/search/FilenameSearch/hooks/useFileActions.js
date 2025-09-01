/**
 * File Actions Hook
 * Handles file operation callbacks with dropdown management
 */

import { useCallback } from 'react';

export const useFileActions = ({ 
  onFileDelete, 
  onAIDetection, 
  onSummaryGenerate,
  closeAllDropdowns 
}) => {
  const handleDeleteFile = useCallback((e, fileId) => {
    e.stopPropagation();
    if (onFileDelete) {
      onFileDelete(fileId);
    }
    closeAllDropdowns();
  }, [onFileDelete, closeAllDropdowns]);

  const handleAIDetection = useCallback((e, file) => {
    e.stopPropagation();
    if (onAIDetection) {
      onAIDetection(file);
    }
    closeAllDropdowns();
  }, [onAIDetection, closeAllDropdowns]);

  const handleSummaryGenerate = useCallback((e, file) => {
    e.stopPropagation();
    if (onSummaryGenerate) {
      onSummaryGenerate(file);
    }
    closeAllDropdowns();
  }, [onSummaryGenerate, closeAllDropdowns]);

  return {
    handleDeleteFile,
    handleAIDetection,
    handleSummaryGenerate
  };
};
