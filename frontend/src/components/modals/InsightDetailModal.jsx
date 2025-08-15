import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ArrowRight, 
  Network, 
  Clock, 
  FileText, 
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Star,
  TrendingUp,
  BookOpen,
  Users,
  Zap
} from 'lucide-react';

const premiumEasing = [0.25, 0.1, 0.25, 1];

const InsightDetailModal = ({ insight, isOpen, onClose }) => {
  if (!insight) return null;

  const getTypeInfo = (type) => {
    const typeMap = {
      takeaway: {
        label: 'Key Takeaway',
        description: 'Essential knowledge that drives strategic decisions',
        color: '#DC2626',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: CheckCircle2
      },
      fact: {
        label: 'Did You Know?',
        description: 'Surprising discoveries that challenge assumptions',
        color: '#D97706',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        icon: Lightbulb
      },
      contradiction: {
        label: 'Contradiction Found',
        description: 'Conflicting evidence requiring careful analysis',
        color: '#EA580C',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        icon: AlertTriangle
      },
      example: {
        label: 'Real-World Example',
        description: 'Practical applications in real scenarios',
        color: '#059669',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        icon: Star
      },
      inspiration: {
        label: 'Cross-Document Inspiration',
        description: 'Novel connections across multiple sources',
        color: '#7C3AED',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        icon: Network
      }
    };
    return typeMap[type] || typeMap.takeaway;
  };

  const typeInfo = getTypeInfo(insight.type);
  const TypeIcon = typeInfo.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ 
              duration: 0.4, 
              ease: premiumEasing,
              type: "spring",
              stiffness: 300,
              damping: 25
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* Header with gradient background */}
              <div 
                className={`relative ${typeInfo.bgColor} ${typeInfo.borderColor} border-b-2 p-8`}
                style={{
                  background: `linear-gradient(135deg, ${typeInfo.color}08 0%, ${typeInfo.color}03 100%)`
                }}
              >
                {/* Close button */}
                <motion.button
                  onClick={onClose}
                  className="absolute top-6 right-6 p-2 rounded-xl hover:bg-white/80 transition-all duration-300 z-10 group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-6 h-6 text-gray-600 group-hover:text-gray-800" />
                </motion.button>

                {/* Type indicator and title */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="flex items-start space-x-6"
                >
                  {/* Large icon */}
                  <div 
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center ${typeInfo.bgColor} border-2 ${typeInfo.borderColor} shadow-lg`}
                    style={{ backgroundColor: `${typeInfo.color}10` }}
                  >
                    <TypeIcon 
                      className="w-10 h-10" 
                      style={{ color: typeInfo.color }}
                    />
                    
                    {/* Special indicators */}
                    {insight.critical && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
                    )}
                    {insight.surprising && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white" />
                    )}
                    {insight.innovative && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full border-2 border-white" />
                    )}
                  </div>

                  <div className="flex-1">
                    {/* Type label */}
                    <motion.div 
                      className="flex items-center space-x-3 mb-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      <span 
                        className="px-4 py-2 rounded-full text-sm font-bold text-white shadow-md"
                        style={{ backgroundColor: typeInfo.color }}
                      >
                        {typeInfo.label}
                      </span>
                      {insight.type === 'contradiction' && (
                        <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                          CRITICAL ATTENTION REQUIRED
                        </span>
                      )}
                    </motion.div>

                    {/* Title */}
                    <motion.h2 
                      className="text-4xl font-black text-gray-900 mb-3 leading-tight"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      {insight.title}
                    </motion.h2>

                    {/* Description */}
                    <motion.p 
                      className="text-gray-600 text-lg font-medium"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                    >
                      {typeInfo.description}
                    </motion.p>
                  </div>
                </motion.div>
              </div>

              {/* Content area */}
              <div className="overflow-y-auto max-h-[60vh] p-8">
                <div className="space-y-8">
                  {/* Source information */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="bg-gray-50 rounded-2xl p-6 border border-gray-200"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <h3 className="text-lg font-bold text-gray-900">Source Information</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-500">Primary Source</div>
                        <div className="text-base font-semibold text-gray-900">{insight.source}</div>
                      </div>
                      
                      {insight.confidence && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-gray-500">Confidence Level</div>
                          <div className="flex items-center space-x-3">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full bg-gradient-to-r from-green-400 to-green-600"
                                style={{ width: `${insight.confidence}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold text-gray-900">{insight.confidence}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.section>

                  {/* Main insight content */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center space-x-3 mb-6">
                      <BookOpen className="w-5 h-5 text-gray-600" />
                      <h3 className="text-lg font-bold text-gray-900">Detailed Analysis</h3>
                    </div>
                    
                    <div 
                      className={`${typeInfo.bgColor} ${typeInfo.borderColor} border-l-4 rounded-r-2xl p-6`}
                      style={{ borderLeftColor: typeInfo.color }}
                    >
                      <p className="text-gray-800 text-lg leading-relaxed font-medium">
                        {insight.insight}
                      </p>
                    </div>
                  </motion.section>

                  {/* Actionable insights */}
                  {insight.actionable && (
                    <motion.section
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7, duration: 0.5 }}
                      className="bg-gradient-to-r from-red-50 to-red-25 rounded-2xl p-6 border border-red-200"
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <Zap className="w-5 h-5 text-red-600" />
                        <h3 className="text-lg font-bold text-gray-900">Recommended Action</h3>
                      </div>
                      
                      <div className="bg-white rounded-xl p-4 border border-red-200">
                        <div className="flex items-start space-x-3">
                          <ArrowRight className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-bold text-red-600 uppercase tracking-wide mb-2">
                              Next Steps
                            </div>
                            <p className="text-gray-800 font-medium leading-relaxed">
                              {insight.actionable}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.section>
                  )}

                  {/* Related documents */}
                  {insight.documents && insight.documents.length > 0 && (
                    <motion.section
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8, duration: 0.5 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center space-x-3 mb-6">
                        <Network className="w-5 h-5 text-gray-600" />
                        <h3 className="text-lg font-bold text-gray-900">Connected Sources</h3>
                      </div>
                      
                      <div className="grid gap-4">
                        {insight.documents.map((doc, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
                            className="bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-md"
                          >
                            <div className="flex items-center space-x-4">
                              <div 
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: typeInfo.color }}
                              />
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900">{doc}</div>
                                <div className="text-sm text-gray-500">Referenced document</div>
                              </div>
                              <ArrowRight className="w-4 h-4 text-gray-400" />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.section>
                  )}

                  {/* Impact assessment */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.5 }}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200"
                  >
                    <div className="flex items-center space-x-3 mb-6">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-bold text-gray-900">Impact Assessment</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-black text-blue-600 mb-2">
                          {insight.type === 'takeaway' ? 'High' : 
                           insight.type === 'contradiction' ? 'Critical' :
                           insight.type === 'fact' ? 'Medium' :
                           insight.type === 'example' ? 'High' : 'Medium'}
                        </div>
                        <div className="text-sm font-medium text-gray-600">Strategic Impact</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-black text-green-600 mb-2">
                          {insight.actionable ? 'Yes' : 'No'}
                        </div>
                        <div className="text-sm font-medium text-gray-600">Actionable</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-black text-purple-600 mb-2">
                          {insight.documents ? insight.documents.length : 1}
                        </div>
                        <div className="text-sm font-medium text-gray-600">Sources</div>
                      </div>
                    </div>
                  </motion.section>

                  {/* Footer actions */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0, duration: 0.5 }}
                    className="flex items-center justify-between pt-6 border-t border-gray-200"
                  >
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>Last updated: Just now</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <motion.button
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Export Insight
                      </motion.button>
                      
                      <motion.button
                        className="px-6 py-3 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                        style={{ 
                          background: `linear-gradient(135deg, ${typeInfo.color} 0%, ${typeInfo.color}CC 100%)` 
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Take Action
                      </motion.button>
                    </div>
                  </motion.section>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default InsightDetailModal;
