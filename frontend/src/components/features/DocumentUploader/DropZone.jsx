// DropZone component for DocumentUploader file upload area
// Renders the main drag-and-drop interface with animations and upload states

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload } from 'lucide-react';

const DropZone = ({ 
  dragActive, 
  uploading, 
  dragHandlers, 
  onFileInput, 
  fileInputRef 
}) => {
  // Enhanced drag handlers with file processing
  const enhancedDragHandlers = {
    ...dragHandlers,
    onDrop: (e) => dragHandlers.onDrop(e, onFileInput),
  };

  return (
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
        {...enhancedDragHandlers}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf"
          onChange={(e) => {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
              onFileInput(files);
            }
          }}
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
              <UploadingState key="uploading" />
            ) : (
              <DefaultState key="default" dragActive={dragActive} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

const UploadingState = () => (
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
);

const DefaultState = ({ dragActive }) => (
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
      className="mb-10"
    >
      <div className="relative">
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
);

export default DropZone;
