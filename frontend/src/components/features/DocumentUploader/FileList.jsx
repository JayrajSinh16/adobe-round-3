// FileList component for DocumentUploader sidebar
// Displays uploaded files with management actions and continue workflow

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, 
  Plus, 
  FileText, 
  CheckCircle, 
  Eye, 
  Trash2,
  Download 
} from 'lucide-react';

const FileList = ({ 
  files, 
  onPreview, 
  onRemove, 
  onClear, 
  onContinue, 
  onAddMore,
  formatFileSize 
}) => {
  if (files.length === 0) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: 0.3 }}
      className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden"
    >
      {/* Header */}
      <div className="px-8 py-6 bg-gradient-to-r from-[#1A1A1A] to-[#374151] text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {files.length} Document{files.length !== 1 ? 's' : ''}
              </h3>
              <p className="text-sm opacity-70">Ready for processing</p>
            </div>
          </div>
          <button
            onClick={onAddMore}
            className="px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] rounded-xl transition-all duration-200 text-sm font-semibold flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add More</span>
          </button>
        </div>
      </div>

      {/* File List */}
      <div className="max-h-96 overflow-y-auto">
        <AnimatePresence>
          {files.map((file, index) => (
            <FileItem
              key={file.id}
              file={file}
              index={index}
              onPreview={onPreview}
              onRemove={onRemove}
              formatFileSize={formatFileSize}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Actions Footer */}
      <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <button 
            onClick={onClear}
            className="px-6 py-2 text-[#1A1A1A] border border-gray-300 rounded-xl hover:bg-white hover:border-[#DC2626] transition-all duration-200 font-medium"
          >
            Clear All
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onContinue}
            className="px-8 py-3 bg-gradient-to-r from-[#DC2626] to-[#B91C1C] text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold"
          >
            Continue →
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const FileItem = ({ file, index, onPreview, onRemove, formatFileSize }) => (
  <motion.div
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
              <div className="flex items-center space-x-1 ml-2">
                <CheckCircle className="w-4 h-4 text-[#059669]" />
                <span className="text-[#059669] font-medium">Ready</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onPreview(file)}
            className="p-2 hover:bg-white rounded-lg transition-colors duration-200"
            aria-label={`Preview ${file.name}`}
          >
            <Eye className="w-5 h-5 text-[#1A1A1A] opacity-60 hover:opacity-100" />
          </button>
          <button
            onClick={() => onRemove(file.id)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors duration-200"
            aria-label={`Remove ${file.name}`}
          >
            <Trash2 className="w-5 h-5 text-[#DC2626] opacity-60 hover:opacity-100" />
          </button>
        </div>
      </div>
    </div>
  </motion.div>
);

const StatsCards = ({ fileCount, totalSize, formatFileSize }) => (
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
          <p className="text-3xl font-black text-[#DC2626]">{fileCount}</p>
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
            {formatFileSize(totalSize)}
          </p>
        </div>
        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
          <Download className="w-6 h-6 text-green-600" />
        </div>
      </div>
    </div>
  </motion.div>
);

export { FileList as default, StatsCards };
