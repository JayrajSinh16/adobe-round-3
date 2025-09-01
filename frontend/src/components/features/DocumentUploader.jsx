import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PDFViewerFixed from './PDFViewer';
import { uploadDocuments } from '../../services/api';
import { getActivePDFs, upsertPDFs, dataUrlToBlob } from '../../utils/pdfDb';

// Components
import DropZone from './DocumentUploader/DropZone';
import FileList, { StatsCards } from './DocumentUploader/FileList';
import ErrorDisplay from './DocumentUploader/ErrorDisplay';

// Hooks & Utils
import { useDragAndDrop } from './DocumentUploader/useDragAndDrop';
import { useFileUpload } from './DocumentUploader/useFileUpload';
import { formatFileSize, fileToBase64 } from './DocumentUploader/utils';
import { FILE_CONFIG } from './DocumentUploader/constants';

const DocumentUploader = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // State
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fileToPreview, setFileToPreview] = useState(null);

  // Custom hooks
  const { dragActive, dragHandlers } = useDragAndDrop();
  const { 
    uploading, 
    errors, 
    processFiles, 
    removeFile, 
    clearFiles,
    setErrors,
    setUploading 
  } = useFileUpload(uploadedFiles, setUploadedFiles);

  // Load persisted PDFs from IndexedDB on mount
  useEffect(() => {
    let cancelled = false;
    
    (async () => {
      try {
        const records = await getActivePDFs();
        if (cancelled) return;
        
        if (Array.isArray(records) && records.length > 0) {
          const restored = records.map((rec) => {
            const blob = rec.blob;
            const previewUrl = URL.createObjectURL(blob);
            const fileObj = new File([blob], rec.name, { type: rec.type || 'application/pdf' });
            
            return {
              id: rec.id,
              name: rec.name,
              size: rec.size,
              type: rec.type || 'application/pdf',
              uploadedAt: rec.uploadedAt || new Date().toISOString(),
              status: 'ready',
              uploadProgress: 100,
              previewUrl,
              pages: Math.floor(Math.random() * 50) + 1,
              file: fileObj,
            };
          });
          setUploadedFiles(restored);
        }
      } catch (e) {
        console.warn('Failed to load PDFs from storage:', e?.message || e);
      }
    })();
    
    return () => { cancelled = true; };
  }, []);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      uploadedFiles.forEach(file => {
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });
    };
  }, [uploadedFiles]);

  // Save current PDFs to IndexedDB with TTL and navigate
  const handleContinue = async () => {
    if (uploadedFiles.length === 0) return;

    try {
      setUploading(true);
      setErrors([]);

      // Filter valid File entries (avoid base64-only restored entries)
      const validFiles = uploadedFiles.filter(
        (f) => f?.file && typeof f.file?.name === 'string' && typeof f.file?.size === 'number' && typeof f.file?.slice === 'function' && (f.type === 'application/pdf' || f.file?.type === 'application/pdf')
      );

      // 1) Upload to backend
      let backendResponse = null;
      try {
        if (validFiles.length > 0) {
          backendResponse = await uploadDocuments(validFiles);
        } else {
          throw new Error('No valid PDF files to upload to backend');
        }
      } catch (e) {
        console.error('Backend upload failed:', e);
        
        // Clean up UI state on backend upload failure
        const failedFileNames = validFiles.map(f => f.name);
        setUploadedFiles(prev => prev.filter(f => !failedFileNames.includes(f.name)));
        
        setErrors([e?.message || 'Failed to upload documents to server']);
        return; // abort flow; do not persist to IndexedDB
      }

      // 2) Persist PDFs to IndexedDB as Blobs with TTL
      try {
        const records = await Promise.all(
          uploadedFiles.map(async (f) => {
            let blob = null;
            if (f?.file instanceof Blob) blob = f.file;
            else if (typeof f?.base64 === 'string') blob = dataUrlToBlob(f.base64);
            if (!blob) return null;
            return {
              id: f.id,
              name: f.name,
              size: f.size,
              type: f.type || 'application/pdf',
              uploadedAt: f.uploadedAt,
              blob,
            };
          })
        );
        await upsertPDFs(records.filter(Boolean), FILE_CONFIG.STORAGE_TTL_MS);
      } catch (e) {
        console.warn('Failed to persist PDFs locally:', e?.message || e);
      }

      // 3) Navigate with state
      navigate('/result-analysis', {
        state: {
          uploadedFiles,
          backendData: backendResponse,
          uploadedDocumentIds: Array.isArray(backendResponse)
            ? backendResponse.map((d) => d?.id || d?.document_id).filter(Boolean)
            : [],
        },
      });
    } catch (error) {
      console.error('Continue flow failed:', error);
      
      // Clean up any files that might have been added but failed to process
      const errorMessage = error.message || 'Failed to continue';
      setErrors([errorMessage]);
      
      // If the error occurred during upload, remove any files that were added in this session
      if (errorMessage.includes('upload') || errorMessage.includes('server')) {
        setUploadedFiles(prev => {
          // Keep only files that existed before this upload attempt
          const existingFiles = prev.filter(f => f.status !== 'uploading');
          return existingFiles;
        });
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAF9] to-[#F3F4F6] py-4 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          >
            <h1 className="text-xl md:text-5xl font-black text-[#1A1A1A] mb-2 leading-[0.85] tracking-tight">
              Document 
              <span className="text-[#DC2626]"> Experience</span>
            </h1>
            <p className="text-xl text-[#1A1A1A] opacity-60 max-w-3xl mx-auto leading-relaxed font-light">
              Upload, organize, and process your PDFs with 
              <span className="font-medium text-[#DC2626]"> surgical precision</span>
            </p>
          </motion.div>
        </header>

        {/* Main Content */}
        <div className={uploadedFiles.length > 0 
          ? "grid grid-cols-1 xl:grid-cols-5 gap-12 xl:gap-16" 
          : "flex justify-center items-start pt-12"
        }>
          {/* Upload Area */}
          <motion.div
            layout
            transition={{ type: 'spring', stiffness: 200, damping: 30 }}
            className="xl:col-span-3 space-y-12 w-full max-w-4xl"
          >
            <DropZone
              dragActive={dragActive}
              uploading={uploading}
              dragHandlers={dragHandlers}
              onFileInput={processFiles}
              fileInputRef={fileInputRef}
            />
            
            <ErrorDisplay errors={errors} />
          </motion.div>

          {/* File Management Sidebar */}
          {uploadedFiles.length > 0 && (
            <div className="xl:col-span-2 space-y-8">
              <FileList
                files={uploadedFiles}
                onPreview={setFileToPreview}
                onRemove={removeFile}
                onClear={clearFiles}
                onContinue={handleContinue}
                onAddMore={() => fileInputRef.current?.click()}
                formatFileSize={formatFileSize}
              />
              
              <StatsCards 
                fileCount={uploadedFiles.length}
                totalSize={uploadedFiles.reduce((total, file) => total + file.size, 0)}
                formatFileSize={formatFileSize}
              />
            </div>
          )}
        </div>

        {/* PDF Preview Modal */}
        {fileToPreview && (
          <PDFViewerFixed
            file={fileToPreview}
            isVisible={!!fileToPreview}
            onClose={() => setFileToPreview(null)}
          />
        )}
      </div>
    </div>
  );
};

export default DocumentUploader;