import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const InsightHeader = ({ insight, typeInfo, onClose, premiumEasing }) => {
  const TypeIcon = typeInfo.icon;

  return (
    <div className={`relative bg-gradient-to-r ${typeInfo.bgGradient} ${typeInfo.borderColor} border-b-2 p-6 flex-shrink-0`}>
      {/* Close button */}
      <motion.button
        onClick={onClose}
        className="absolute top-4 right-4 p-3 rounded-xl bg-white/80 hover:bg-white shadow-lg transition-all duration-300 z-20 group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <X className="w-6 h-6 text-gray-600 group-hover:text-gray-800" />
      </motion.button>

      {/* Header content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="flex items-start space-x-6"
      >
        {/* Premium icon */}
        <div 
          className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl border-2"
          style={{ 
            backgroundColor: `${typeInfo.color}15`,
            borderColor: typeInfo.color
          }}
        >
          <TypeIcon 
            className="w-10 h-10" 
            style={{ color: typeInfo.color }}
          />
        </div>

        <div className="flex-1">
          {/* Category badge */}
          <motion.div 
            className="mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <span 
              className="px-6 py-2 rounded-full text-sm font-bold text-white shadow-lg"
              style={{ backgroundColor: typeInfo.color }}
            >
              {typeInfo.label}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1 
            className="text-4xl font-black text-gray-900 mb-3 leading-tight tracking-tight"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {insight.title}
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            className="text-lg text-gray-600 font-medium leading-relaxed"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {typeInfo.description}
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default InsightHeader;
