import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Target,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Brain,
  Clock
} from 'lucide-react';

// Import specialized insight components
import KeyOutcomeInsight from '../insights/KeyOutcomeInsight';
import DidYouKnowInsight from '../insights/DidYouKnowInsight';
import ContradictionFoundInsight from '../insights/ContradictionFoundInsight';
import RealWorldExampleInsight from '../insights/RealWorldExampleInsight';
import CrossDocumentInspirationInsight from '../insights/CrossDocumentInspirationInsight';

const premiumEasing = [0.25, 0.46, 0.45, 0.94];

const InsightDetailModal = ({ insight, isOpen, onClose }) => {
  if (!insight) return null;

  // Debug log to see what data we're receiving
  console.log('InsightDetailModal received insight data:', insight);

  const getTypeInfo = (type) => {
    const typeMap = {
      // Key Outcome variations
      takeaway: {
        label: 'Key Outcome',
        description: 'Strategic insight that drives competitive advantage',
        color: '#DC2626',
        bgGradient: 'from-red-50 via-red-100 to-white',
        borderColor: 'border-red-200',
        icon: Target,
        component: 'KeyOutcome'
      },
      key_takeaway: {
        label: 'Key Outcome',
        description: 'Strategic insight that drives competitive advantage',
        color: '#DC2626',
        bgGradient: 'from-red-50 via-red-100 to-white',
        borderColor: 'border-red-200',
        icon: Target,
        component: 'KeyOutcome'
      },
      KeyOutcome: {
        label: 'Key Outcome',
        description: 'Strategic insight that drives competitive advantage',
        color: '#DC2626',
        bgGradient: 'from-red-50 via-red-100 to-white',
        borderColor: 'border-red-200',
        icon: Target,
        component: 'KeyOutcome'
      },
      outcome: {
        label: 'Key Outcome',
        description: 'Strategic insight that drives competitive advantage',
        color: '#DC2626',
        bgGradient: 'from-red-50 via-red-100 to-white',
        borderColor: 'border-red-200',
        icon: Target,
        component: 'KeyOutcome'
      },
      
      // Did You Know variations
      fact: {
        label: 'Did You Know?',
        description: 'Fascinating discoveries and surprising insights',
        color: '#059669',
        bgGradient: 'from-emerald-50 via-emerald-100 to-white',
        borderColor: 'border-emerald-200',
        icon: Lightbulb,
        component: 'DidYouKnow'
      },
      DidYouKnow: {
        label: 'Did You Know?',
        description: 'Fascinating discoveries and surprising insights',
        color: '#059669',
        bgGradient: 'from-emerald-50 via-emerald-100 to-white',
        borderColor: 'border-emerald-200',
        icon: Lightbulb,
        component: 'DidYouKnow'
      },
      insight: {
        label: 'Did You Know?',
        description: 'Fascinating discoveries and surprising insights',
        color: '#059669',
        bgGradient: 'from-emerald-50 via-emerald-100 to-white',
        borderColor: 'border-emerald-200',
        icon: Lightbulb,
        component: 'DidYouKnow'
      },
      
      // Contradiction variations
      contradiction: {
        label: 'Contradiction Found',
        description: 'Conflicting information requiring immediate attention',
        color: '#EA580C',
        bgGradient: 'from-orange-50 via-orange-100 to-white',
        borderColor: 'border-orange-200',
        icon: AlertTriangle,
        component: 'ContradictionFound'
      },
      contradictions: {
        label: 'Contradiction Found',
        description: 'Conflicting information requiring immediate attention',
        color: '#EA580C',
        bgGradient: 'from-orange-50 via-orange-100 to-white',
        borderColor: 'border-orange-200',
        icon: AlertTriangle,
        component: 'ContradictionFound'
      },
      ContradictionFound: {
        label: 'Contradiction Found',
        description: 'Conflicting information requiring immediate attention',
        color: '#EA580C',
        bgGradient: 'from-orange-50 via-orange-100 to-white',
        borderColor: 'border-orange-200',
        icon: AlertTriangle,
        component: 'ContradictionFound'
      },
      conflict: {
        label: 'Contradiction Found',
        description: 'Conflicting information requiring immediate attention',
        color: '#EA580C',
        bgGradient: 'from-orange-50 via-orange-100 to-white',
        borderColor: 'border-orange-200',
        icon: AlertTriangle,
        component: 'ContradictionFound'
      },
      
      // Real World Example variations
      example: {
        label: 'Real-World Example',
        description: 'Real-world examples and implementation scenarios',
        color: '#0891B2',
        bgGradient: 'from-cyan-50 via-cyan-100 to-white',
        borderColor: 'border-cyan-200',
        icon: CheckCircle2,
        component: 'RealWorldExample'
      },
      examples: {
        label: 'Real-World Example',
        description: 'Real-world examples and implementation scenarios',
        color: '#0891B2',
        bgGradient: 'from-cyan-50 via-cyan-100 to-white',
        borderColor: 'border-cyan-200',
        icon: CheckCircle2,
        component: 'RealWorldExample'
      },
      RealWorldExample: {
        label: 'Real-World Example',
        description: 'Real-world examples and implementation scenarios',
        color: '#0891B2',
        bgGradient: 'from-cyan-50 via-cyan-100 to-white',
        borderColor: 'border-cyan-200',
        icon: CheckCircle2,
        component: 'RealWorldExample'
      },
      
      // Cross Document Inspiration variations
      inspiration: {
        label: 'Cross-Document Inspiration',
        description: 'Creative connections spanning multiple sources',
        color: '#7C3AED',
        bgGradient: 'from-purple-50 via-purple-100 to-white',
        borderColor: 'border-purple-200',
        icon: Brain,
        component: 'CrossDocumentInspiration'
      },
      cross_references: {
        label: 'Cross-Document Inspiration',
        description: 'Creative connections spanning multiple sources',
        color: '#7C3AED',
        bgGradient: 'from-purple-50 via-purple-100 to-white',
        borderColor: 'border-purple-200',
        icon: Brain,
        component: 'CrossDocumentInspiration'
      },
      CrossDocumentInspiration: {
        label: 'Cross-Document Inspiration',
        description: 'Creative connections spanning multiple sources',
        color: '#7C3AED',
        bgGradient: 'from-purple-50 via-purple-100 to-white',
        borderColor: 'border-purple-200',
        icon: Brain,
        component: 'CrossDocumentInspiration'
      },

      // Did You Know variations
      did_you_know: {
        label: 'Did You Know?',
        description: 'Fascinating discoveries from your documents',
        color: '#059669',
        bgGradient: 'from-emerald-50 via-emerald-100 to-white',
        borderColor: 'border-emerald-200',
        icon: Lightbulb,
        component: 'DidYouKnow'
      },
      DidYouKnow: {
        label: 'Did You Know?',
        description: 'Fascinating discoveries from your documents',
        color: '#059669',
        bgGradient: 'from-emerald-50 via-emerald-100 to-white',
        borderColor: 'border-emerald-200',
        icon: Lightbulb,
        component: 'DidYouKnow'
      }
    };

    // Enhanced fallback logic with better type detection
    const normalizedType = type?.toLowerCase?.() || 'unknown';
    console.log('Looking up insight type:', type, 'normalized:', normalizedType);
    
    // Try exact match first
    if (typeMap[type]) {
      console.log('Found exact match for type:', type);
      return typeMap[type];
    }
    
    // Try normalized lowercase match
    if (typeMap[normalizedType]) {
      console.log('Found normalized match for type:', normalizedType);
      return typeMap[normalizedType];
    }
    
    // Try partial matches for common patterns
    if (normalizedType.includes('outcome') || normalizedType.includes('takeaway')) {
      console.log('Using outcome pattern for type:', type);
      return typeMap.KeyOutcome;
    }
    
    if (normalizedType.includes('know') || normalizedType.includes('fact') || normalizedType.includes('insight')) {
      console.log('Using DidYouKnow pattern for type:', type);
      return typeMap.DidYouKnow;
    }
    
    if (normalizedType.includes('contradiction') || normalizedType.includes('conflict')) {
      console.log('Using contradiction pattern for type:', type);
      return typeMap.ContradictionFound;
    }
    
    if (normalizedType.includes('example')) {
      console.log('Using example pattern for type:', type);
      return typeMap.RealWorldExample;
    }
    
    if (normalizedType.includes('inspiration') || normalizedType.includes('cross')) {
      console.log('Using inspiration pattern for type:', type);
      return typeMap.CrossDocumentInspiration;
    }
    
    // Final fallback - return a default with warning
    console.warn('No match found for insight type:', type, '- using default KeyOutcome');
    return typeMap.KeyOutcome;
  };

  const typeInfo = getTypeInfo(insight.type);
  const TypeIcon = typeInfo.icon;
  
  // Enhanced debugging
  console.log('Insight type:', insight.type);
  console.log('Selected typeInfo:', typeInfo);
  console.log('Background gradient class:', typeInfo.bgGradient);
  console.log('Border color class:', typeInfo.borderColor);

  // Render the appropriate specialized component
  const renderInsightComponent = () => {
    switch (typeInfo.component) {
      case 'KeyOutcome':
        return <KeyOutcomeInsight insight={insight} />;
      case 'DidYouKnow':
        return <DidYouKnowInsight insight={insight} />;
      case 'ContradictionFound':
        return <ContradictionFoundInsight insight={insight} />;
      case 'RealWorldExample':
        return <RealWorldExampleInsight insight={insight} />;
      case 'CrossDocumentInspiration':
        return <CrossDocumentInspirationInsight insight={insight} />;
      default:
        return <KeyOutcomeInsight insight={insight} />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Full screen backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
            onClick={onClose}
          />

          {/* Full screen modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ 
              duration: 0.5, 
              ease: premiumEasing
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
              
              {/* Enhanced Header */}
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
                      className="text-4xl font-black text-gray-900 mb-2 leading-tight tracking-tight"
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

              {/* Specialized Insight Content */}
              <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
                <div className="p-6">
                  {renderInsightComponent()}
                  
                  {/* Footer with Timestamp */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                    className="flex items-center justify-center pt-8 border-t border-gray-200 mt-8"
                  >
                    <div className="flex items-center space-x-3 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">Intelligence generated on {new Date().toLocaleDateString()}</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default InsightDetailModal;
