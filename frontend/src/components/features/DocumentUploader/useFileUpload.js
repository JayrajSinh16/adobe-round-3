// Custom hook for file upload processing in DocumentUploader
// Handles file validation, processing, upload simulation, and file management operations

import { useState, useCallback } from 'react';
import { validateFile, checkDuplicate, createFileObject } from './utils';

export const useFileUpload = (uploadedFiles, setUploadedFiles) => {
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState([]);

  const processFiles = useCallback(async (files) => {
    setUploading(true);
    setErrors([]);
    const newFiles = [];
    const newErrors = [];

    for (let file of files) {
      const error = validateFile(file);
      if (error) {
        newErrors.push(`${file.name}: ${error}`);
        continue;
      }

      if (checkDuplicate(file, uploadedFiles)) {
        newErrors.push(`${file.name}: File already uploaded`);
        continue;
      }

      newFiles.push(createFileObject(file));
    }

    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    setErrors(newErrors);
    setUploading(false);
  }, [uploadedFiles, setUploadedFiles]);

  const removeFile = useCallback((fileId) => {
    setUploadedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      
      if (fileToRemove?.name) {
        setErrors(prevErrors => prevErrors.filter(error => !error.includes(fileToRemove.name)));
      }
      
      return prev.filter(f => f.id !== fileId);
    });
  }, [setUploadedFiles]);

  const clearFiles = useCallback(() => {
    uploadedFiles.forEach(file => {
      if (file.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
      }
    });
    setUploadedFiles([]);
    setErrors([]);
  }, [uploadedFiles, setUploadedFiles]);

  return {
    uploading,
    errors,
    processFiles,
    removeFile,
    clearFiles,
    setErrors,
    setUploading,
  };
};
