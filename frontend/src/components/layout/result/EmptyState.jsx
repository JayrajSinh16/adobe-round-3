import React from 'react';
import { motion } from 'framer-motion';
import { Upload } from 'lucide-react';

// Empty state extracted from ResultAnalysis; logic unchanged.
export default function EmptyState({ handleBackToUpload }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-[#FAFAF9] to-[#F3F4F6] flex items-center justify-center p-4"
    >
      <div className="text-center bg-white/90 backdrop-blur-sm rounded-3xl p-16 shadow-xl border border-white/20 max-w-lg mx-auto">
        <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-[#DC2626] to-[#B91C1C] rounded-2xl flex items-center justify-center">
          <Upload className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-3xl font-black text-[#1A1A1A] mb-6">No Documents Found</h2>
        <p className="text-lg text-[#1A1A1A] opacity-60 mb-10">Upload your documents to begin analysis.</p>
        <motion.button
          onClick={handleBackToUpload}
          className="bg-gradient-to-r from-[#DC2626] to-[#B91C1C] text-white px-10 py-4 rounded-2xl font-semibold text-lg hover:shadow-lg transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Upload className="w-5 h-5 inline mr-3" />
          Upload Documents
        </motion.button>
      </div>
    </motion.div>
  );
}
