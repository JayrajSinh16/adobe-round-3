import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PDFViewerFixed from './PDFViewer';
import {uploadDocuments} from '../../services/api';
import { getActivePDFs, upsertPDFs, dataUrlToBlob } from '../../utils/pdfDb';
import { 
  Upload, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle, 
  FileText,
  Folder,
  Download,
  Eye,
  Trash2,
  Plus
} from 'lucide-react';

// *** CHANGE 1 of 3: DEFINE THE EXPIRATION TIME (30 MINUTES) ***
const STORAGE_TTL_MS = 30 * 60 * 1000;

const DocumentUploader = () => {
  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [fileToPreview, setFileToPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Load any persisted PDFs from IndexedDB (TTL enforced in helper)
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

  // Cleanup blob URLs when component unmounts to prevent memory leaks
  useEffect(() => {
    return () => {
      uploadedFiles.forEach(file => {
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });
    };
  }, [uploadedFiles]);

  // File validation
  const validateFile = (file) => {
    const allowedTypes = ['application/pdf'];
    
    if (!allowedTypes.includes(file.type)) {
      return 'Only PDF files are supported';
    }
    
    return null;
  };

  // Handle file processing
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

      // Check for duplicates
      const exists = uploadedFiles.some(f => 
        f.name === file.name && f.size === file.size
      );
      
      if (exists) {
        newErrors.push(`${file.name}: File already uploaded`);
        continue;
      }

      // Create file object with metadata
      const fileObj = {
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
        status: 'ready',
        uploadProgress: 100,
        previewUrl: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString(),
        pages: Math.floor(Math.random() * 50) + 1 // Mock page count
      };
      
      newFiles.push(fileObj);
    }

    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    setErrors(newErrors);
    setUploading(false);
  }, [uploadedFiles]);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  // File input handler
  const handleFileInput = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  // Remove file with proper cleanup
  const removeFile = useCallback((fileId) => {
    setUploadedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.previewUrl) {
        // Clean up blob URL to prevent memory leaks
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      
      // Clear any errors related to the removed file
      if (fileToRemove?.name) {
        setErrors(prevErrors => prevErrors.filter(error => !error.includes(fileToRemove.name)));
      }
      
      return prev.filter(f => f.id !== fileId);
    });
  }, []);

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Helper: File/Blob -> base64 (data URL)
  const fileToBase64 = (blob) => new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result); // data:application/pdf;base64,....
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    } catch (e) {
      reject(e);
    }
  });

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
        await upsertPDFs(records.filter(Boolean), STORAGE_TTL_MS);
      } catch (e) {
        console.warn('Failed to persist PDFs locally:', e?.message || e);
      }

      // 3) Navigate with state (NO CHANGES HERE)
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
    // ... JSX remains unchanged ...
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAF9] to-[#F3F4F6] py-4 px-6 ">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          >
            <h1 className="text-xl md:text-5xl font-black text-[#1A1A1A] mb-2 leading-[0.85] tracking-tight">
              Document 
              <span className=" text-[#DC2626]"> Experience</span>
            </h1>
            <p className="text-xl text-[#1A1A1A] opacity-60 max-w-3xl mx-auto leading-relaxed font-light">
              Upload, organize, and process your PDFs with 
              <span className="font-medium text-[#DC2626]"> surgical precision</span>
            </p>
          </motion.div>
        </header>
        <div className={uploadedFiles.length>0? "grid grid-cols-1 xl:grid-cols-5 gap-12 xl:gap-16":
          "flex justify-center items-start pt-12"
        }>
          <motion.div
            layout
            transition={{ type: 'spring', stiffness: 200, damping: 30 }}
            className="xl:col-span-3 space-y-12 w-full max-w-4xl">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div
                className={`
                  relative border-2 border-dashed rounded-3xl bg-white/80 backdrop-blur-sm
                  transition-all duration-500 cursor-pointer overflow-hidden
                  ${dragActive 
                    ? 'border-[#DC2626] shadow-2xl shadow-red-500/20 transform scale-[1.02] bg-gradient-to-br from-red-50/50 to-white' 
                    : 'border-[#E5E7EB] hover:border-[#DC2626] hover:shadow-xl hover:shadow-black/10'
                  }
                  ${uploading ? 'pointer-events-none opacity-75' : ''}
                `}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={handleFileInput}
                  className="hidden"
                  aria-label="Upload PDF documents"
                />
                <div className="py-20 px-12 text-center relative">
                  <div className="absolute inset-0 opacity-[0.02]">
                    <div className="absolute top-8 left-8 w-32 h-32 bg-[#DC2626] rounded-full blur-3xl"></div>
                    <div className="absolute bottom-8 right-8 w-24 h-24 bg-[#1A1A1A] rounded-full blur-2xl"></div>
                  </div>
                  <AnimatePresence mode="wait">
                    {uploading ? (
                      <motion.div
                        key="uploading"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4 }}
                        className="relative z-10"
                      >
                        <div className="w-full max-w-xs mx-auto mb-8 h-20 flex items-center justify-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                            <motion.div
                              className="bg-gradient-to-r from-[#DC2626] to-[#B91C1C] h-2.5 rounded-full"
                              initial={{ x: "-100%" }}
                              animate={{ x: "100%" }}
                              transition={{
                                repeat: Infinity,
                                repeatType: "loop",
                                duration: 1.5,
                                ease: "linear",
                              }}
                              style={{ width: '50%' }}
                            />
                          </div>
                        </div>
                        <h3 className="text-3xl font-bold text-[#1A1A1A] mb-4">
                          Processing Excellence
                        </h3>
                        <p className="text-lg text-[#1A1A1A] opacity-60">
                          Analyzing your documents with precision...
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="default"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4 }}
                        className="relative z-10"
                      >
                        <motion.div
                          animate={dragActive ? { scale: 1.2, rotate: 5 } : { scale: 1, rotate: 0 }}
                          transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
                          className="mb-10 "
                        >
                          <div className="relative ">
                            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#DC2626] to-[#B91C1C] rounded-2xl flex items-center justify-center shadow-lg">
                              <Upload className="w-12 h-12 text-white" />
                            </div>
                            <div className="absolute inset-0 w-24 h-24 mx-auto bg-[#DC2626] rounded-2xl blur-xl opacity-20"></div>
                          </div>
                        </motion.div>
                        <h3 className="text-4xl font-black text-[#1A1A1A] mb-6 leading-tight">
                          {dragActive ? (
                            <span className="text-[#DC2626]">Release to Upload</span>
                          ) : (
                            'Drop Files Here'
                          )}
                        </h3>
                        <p className="text-xl text-[#1A1A1A] opacity-70 mb-10 font-light">
                          or click to browse your computer
                        </p>
                        <div className="flex items-center justify-center space-x-8 text-sm text-[#1A1A1A] opacity-40">
                          <div className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-[#DC2626] rounded-full"></div>
                            <span className="font-medium">PDF Only</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-[#DC2626] rounded-full"></div>
                            <span className="font-medium">50MB Max</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-[#DC2626] rounded-full"></div>
                            <span className="font-medium">Multiple Files</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
            <AnimatePresence>
              {errors.length > 0 && (
                <motion.div>
                  <div className="bg-white border-l-4 border-[#DC2626] rounded-2xl p-8 shadow-lg">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-6 h-6 text-[#DC2626]" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-[#1A1A1A] mb-4">
                          {errors.some(e => e.includes('Failed to upload')) 
                            ? 'Backend Upload Error' 
                            : 'Upload Issues Detected'}
                        </h4>
                        <ul className="space-y-2">
                          {errors.map((error, index) => (
                            <motion.li key={index} className="text-[#1A1A1A] opacity-70 leading-relaxed">
                              {error}
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          <div className="xl:col-span-2 space-y-8">
            {uploadedFiles.length > 0 && (
              <motion.div
                layout
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden"
              >
                <div className="px-8 py-6 bg-gradient-to-r from-[#1A1A1A] to-[#374151] text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <Folder className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">
                          {uploadedFiles.length} Document{uploadedFiles.length !== 1 ? 's' : ''}
                        </h3>
                        <p className="text-sm opacity-70">Ready for processing</p>
                      </div>
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] rounded-xl transition-all duration-200 text-sm font-semibold flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add More</span>
                    </button>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <AnimatePresence>
                    {uploadedFiles.map((file, index) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        className="group border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-all duration-200"
                      >
                        <div className="px-8 py-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 flex-1 min-w-0">
                              <div className="w-12 h-12 bg-gradient-to-br from-[#DC2626] to-[#B91C1C] rounded-xl flex items-center justify-center">
                                <FileText className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-[#1A1A1A] truncate mb-1">
                                  {file.name}
                                </h4>
                                <div className="flex items-center space-x-2 text-xs text-[#1A1A1A] opacity-60">
                                  <span>{formatFileSize(file.size)}</span>
                                  <span>•</span>
                                  <span>{file.pages} pages</span>
                                  <span>•</span>
                                  <div className="flex items-center space-x-1 ml-2">
                                    <CheckCircle className="w-4 h-4 text-[#059669]" />
                                    <span className="text-[#059669] font-medium">Ready</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button
                                onClick={() => setFileToPreview(file)}
                                className="p-2 hover:bg-white rounded-lg transition-colors duration-200"
                                aria-label={`Preview ${file.name}`}
                              >
                                <Eye className="w-5 h-5 text-[#1A1A1A] opacity-60 hover:opacity-100" />
                              </button>
                              <button
                                onClick={() => removeFile(file.id)}
                                className="p-2 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                aria-label={`Remove ${file.name}`}
                              >
                                <Trash2 className="w-5 h-5 text-[#DC2626] opacity-60 hover:opacity-100" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => setUploadedFiles([])}
                      className="px-6 py-2 text-[#1A1A1A] border border-gray-300 rounded-xl hover:bg-white hover:border-[#DC2626] transition-all duration-200 font-medium"
                    >
                      Clear All
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleContinue}
                      className="px-8 py-3 bg-gradient-to-r from-[#DC2626] to-[#B91C1C] text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold"
                    >
                      Continue →
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
            {uploadedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="space-y-4"
              >
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#1A1A1A] opacity-60 mb-1">Documents</p>
                      <p className="text-3xl font-black text-[#DC2626]">{uploadedFiles.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-[#DC2626]" />
                    </div>
                  </div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#1A1A1A] opacity-60 mb-1">Total Size</p>
                      <p className="text-3xl font-black text-[#DC2626]">
                        {formatFileSize(uploadedFiles.reduce((total, file) => total + file.size, 0))}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Download className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
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