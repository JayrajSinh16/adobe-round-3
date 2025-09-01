/**
 * Document management API endpoints
 * Handles upload, listing, deletion, and text processing for documents
 */
import { api } from '../config';
import { handleApiError } from '../utils/errorHandler';
import { validateFileUpload, validateRequired } from '../utils/validators';

export const uploadDocuments = async (files) => {
  try {
    const validFiles = validateFileUpload(files);
    const formData = new FormData();
    
    // Add each file to FormData with metadata
    validFiles.forEach((fileObj, index) => {
      formData.append('files', fileObj.file, fileObj.name || fileObj.file.name || `file-${index}.pdf`);
      formData.append(`metadata[${index}]`, JSON.stringify({
        id: fileObj.id,
        filename: fileObj.name,
        size: fileObj.size,
        upload_time: fileObj.uploadedAt
      }));
    });

    // Guard: ensure we have files to upload
    if (![...formData.keys()].some((k) => k === 'files')) {
      throw new Error('No valid PDF files to upload');
    }

    const response = await api.post('/api/documents/bulk-upload', formData, {
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log(`Upload Progress: ${percentCompleted}%`);
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error, 'Failed to upload documents'));
  }
};

export const getDocuments = async () => {
  try {
    const response = await api.get('/api/documents/list');
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error, 'Failed to fetch documents'));
  }
};

// Alias for compatibility
export const listDocuments = getDocuments;

export const deleteDocument = async (documentId) => {
  try {
    validateRequired(documentId, 'Document ID');
    const response = await api.delete(`/api/documents/${documentId}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error, 'Failed to delete document'));
  }
};

export const processSelectedText = async (textData) => {
  try {
    validateRequired(textData.text, 'Selected text');
    validateRequired(textData.fileName, 'File name');
    
    const response = await api.post('/api/documents/process-text', {
      selectedText: textData.text,
      fileName: textData.fileName,
      pageNumber: textData.pageNumber,
      documentId: textData.documentId,
      selectionContext: textData.context
    });

    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error, 'Failed to process selected text'));
  }
};
