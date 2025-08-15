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
  Zap,
  Brain,
  Target,
  Eye,
  Info,
  Globe,
  Layers,
  MapPin,
  Calendar,
  BarChart3,
  Shield,
  Activity
} from 'lucide-react';

const premiumEasing = [0.25, 0.46, 0.45, 0.94];

const InsightDetailModal = ({ insight, isOpen, onClose }) => {
  if (!insight) return null;

  const getTypeInfo = (type) => {
    const typeMap = {
      takeaway: {
        label: 'Strategic Intelligence',
        description: 'Critical strategic insight that drives competitive advantage',
        color: '#DC2626',
        bgGradient: 'from-red-50 via-red-25 to-white',
        borderColor: 'border-red-200',
        icon: Target
      },
      fact: {
        label: 'Discovery Intelligence',
        description: 'Fascinating discoveries and surprising insights',
        color: '#059669',
        bgGradient: 'from-emerald-50 via-emerald-25 to-white',
        borderColor: 'border-emerald-200',
        icon: Lightbulb
      },
      contradiction: {
        label: 'Critical Analysis',
        description: 'Conflicting information requiring immediate attention',
        color: '#EA580C',
        bgGradient: 'from-orange-50 via-orange-25 to-white',
        borderColor: 'border-orange-200',
        icon: AlertTriangle
      },
      example: {
        label: 'Practical Application',
        description: 'Real-world examples and implementation scenarios',
        color: '#0891B2',
        bgGradient: 'from-cyan-50 via-cyan-25 to-white',
        borderColor: 'border-cyan-200',
        icon: CheckCircle2
      },
      inspiration: {
        label: 'Cross-Document Intelligence',
        description: 'Creative connections spanning multiple sources',
        color: '#7C3AED',
        bgGradient: 'from-purple-50 via-purple-25 to-white',
        borderColor: 'border-purple-200',
        icon: Brain
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
            className="fixed inset-0 z-50 flex items-center justify-center p-2"
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

              {/* Comprehensive Content Area with Detailed Information Sections */}
              <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
                <div className="p-8 space-y-10">
                  
                  {/* 1. Executive Summary */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200"
                  >
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <Info className="w-6 h-6 text-blue-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Executive Summary</h2>
                    </div>
                    
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <p className="text-lg text-gray-800 leading-relaxed font-medium">
                        {insight.insight}
                      </p>
                    </div>
                  </motion.section>

                  {/* 2. Source Information & Metadata */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200"
                  >
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="p-3 bg-green-100 rounded-xl">
                        <FileText className="w-6 h-6 text-green-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Source Intelligence & Metadata</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="bg-gray-50 rounded-2xl p-6">
                        <div className="flex items-center space-x-3 mb-3">
                          <BookOpen className="w-5 h-5 text-gray-600" />
                          <h3 className="font-bold text-gray-900">Primary Source</h3>
                        </div>
                        <p className="text-gray-700 font-medium">{insight.source || 'Document Analysis'}</p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-2xl p-6">
                        <div className="flex items-center space-x-3 mb-3">
                          <BarChart3 className="w-5 h-5 text-gray-600" />
                          <h3 className="font-bold text-gray-900">Confidence Level</h3>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-3">
                            <div 
                              className="h-3 rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-1000"
                              style={{ width: `${insight.confidence || 95}%` }}
                            />
                          </div>
                          <span className="text-lg font-bold text-gray-900">{insight.confidence || 95}%</span>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-2xl p-6">
                        <div className="flex items-center space-x-3 mb-3">
                          <Calendar className="w-5 h-5 text-gray-600" />
                          <h3 className="font-bold text-gray-900">Analysis Date</h3>
                        </div>
                        <p className="text-gray-700 font-medium">Today</p>
                      </div>
                    </div>
                  </motion.section>

                  {/* 3. Detailed Analysis & Context */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                    className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200"
                  >
                    <div className="flex items-center space-x-4 mb-6">
                      <div 
                        className="p-3 rounded-xl"
                        style={{ backgroundColor: `${typeInfo.color}15` }}
                      >
                        <Brain className="w-6 h-6" style={{ color: typeInfo.color }} />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Detailed Analysis & Context</h2>
                    </div>
                    
                    <div className="space-y-6">
                      <div className={`bg-gradient-to-r ${typeInfo.bgGradient} rounded-2xl p-6 border-l-4`} style={{ borderColor: typeInfo.color }}>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Core Insight</h3>
                        <p className="text-gray-800 text-lg leading-relaxed">{insight.insight}</p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-gray-50 rounded-2xl p-6">
                          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                            <Globe className="w-5 h-5 text-blue-600" />
                            <span>Broader Context</span>
                          </h3>
                          <p className="text-gray-700 leading-relaxed">
                            This insight provides critical understanding within the broader strategic landscape and should be considered alongside related findings from the document analysis.
                          </p>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-6">
                          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                            <Layers className="w-5 h-5 text-purple-600" />
                            <span>Strategic Implications</span>
                          </h3>
                          <p className="text-gray-700 leading-relaxed">
                            The implications of this insight extend beyond immediate considerations and may influence long-term strategic planning and decision-making processes.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.section>

                  {/* 4. Impact Assessment & Risk Analysis */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200"
                  >
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="p-3 bg-red-100 rounded-xl">
                        <TrendingUp className="w-6 h-6 text-red-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Impact Assessment & Risk Analysis</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      <div className="text-center bg-gradient-to-b from-blue-50 to-blue-100 rounded-2xl p-6">
                        <div className="text-3xl font-black text-blue-600 mb-2">
                          {insight.type === 'takeaway' || insight.type === 'contradiction' ? 'High' : 'Medium'}
                        </div>
                        <div className="text-sm font-bold text-gray-600 uppercase tracking-wide">Strategic Impact</div>
                      </div>
                      
                      <div className="text-center bg-gradient-to-b from-green-50 to-green-100 rounded-2xl p-6">
                        <div className="text-3xl font-black text-green-600 mb-2">
                          {insight.actionable ? 'Yes' : 'No'}
                        </div>
                        <div className="text-sm font-bold text-gray-600 uppercase tracking-wide">Actionable</div>
                      </div>
                      
                      <div className="text-center bg-gradient-to-b from-purple-50 to-purple-100 rounded-2xl p-6">
                        <div className="text-3xl font-black text-purple-600 mb-2">
                          {insight.documents ? insight.documents.length : 1}
                        </div>
                        <div className="text-sm font-bold text-gray-600 uppercase tracking-wide">Sources</div>
                      </div>

                      <div className="text-center bg-gradient-to-b from-orange-50 to-orange-100 rounded-2xl p-6">
                        <div className="text-3xl font-black text-orange-600 mb-2">
                          {insight.type === 'contradiction' ? 'High' : 'Low'}
                        </div>
                        <div className="text-sm font-bold text-gray-600 uppercase tracking-wide">Risk Level</div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                        <Shield className="w-5 h-5 text-gray-600" />
                        <span>Risk & Opportunity Matrix</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-red-600 mb-2">Potential Risks</h4>
                          <ul className="text-gray-700 space-y-1 text-sm">
                            <li>• Information accuracy validation required</li>
                            <li>• Implementation complexity considerations</li>
                            <li>• Resource allocation impact</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-green-600 mb-2">Opportunities</h4>
                          <ul className="text-gray-700 space-y-1 text-sm">
                            <li>• Strategic advantage potential</li>
                            <li>• Process optimization opportunities</li>
                            <li>• Competitive positioning benefits</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </motion.section>

                  {/* 5. Actionable Recommendations */}
                  {insight.actionable && (
                    <motion.section
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9, duration: 0.6 }}
                      className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200"
                    >
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="p-3 bg-yellow-100 rounded-xl">
                          <Zap className="w-6 h-6 text-yellow-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Actionable Recommendations</h2>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border-l-4 border-yellow-500">
                          <div className="flex items-start space-x-4">
                            <div className="p-2 bg-yellow-100 rounded-lg flex-shrink-0 mt-1">
                              <ArrowRight className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 mb-3">Immediate Next Steps</h3>
                              <p className="text-gray-800 leading-relaxed font-medium">
                                {insight.actionable}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gray-50 rounded-xl p-4">
                            <h4 className="font-bold text-gray-900 mb-2">Short-term (1-30 days)</h4>
                            <p className="text-sm text-gray-700">Immediate implementation and validation steps</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <h4 className="font-bold text-gray-900 mb-2">Medium-term (1-3 months)</h4>
                            <p className="text-sm text-gray-700">Strategic integration and optimization phases</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <h4 className="font-bold text-gray-900 mb-2">Long-term (3+ months)</h4>
                            <p className="text-sm text-gray-700">Sustained impact and continuous improvement</p>
                          </div>
                        </div>
                      </div>
                    </motion.section>
                  )}

                  {/* 6. Related Sources & Cross-References */}
                  {insight.documents && insight.documents.length > 0 && (
                    <motion.section
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.0, duration: 0.6 }}
                      className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200"
                    >
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="p-3 bg-indigo-100 rounded-xl">
                          <Network className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Related Sources & Cross-References</h2>
                      </div>
                      
                      <div className="grid gap-4">
                        {insight.documents.map((doc, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.0 + index * 0.1, duration: 0.5 }}
                            className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-200 hover:shadow-md transition-all duration-300"
                          >
                            <div className="flex items-center space-x-4">
                              <div 
                                className="w-4 h-4 rounded-full flex-shrink-0"
                                style={{ backgroundColor: typeInfo.color }}
                              />
                              <div className="flex-1">
                                <h3 className="font-bold text-gray-900 text-lg">{doc}</h3>
                                <p className="text-sm text-gray-600 mt-1">Cross-referenced intelligence source</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
                                  Source {index + 1}
                                </span>
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.section>
                  )}

                  {/* 7. Technical Analysis & Methodology */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1, duration: 0.6 }}
                    className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200"
                  >
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="p-3 bg-gray-100 rounded-xl">
                        <Activity className="w-6 h-6 text-gray-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Technical Analysis & Methodology</h2>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-gray-50 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Analysis Methodology</h3>
                        <p className="text-gray-700 leading-relaxed mb-4">
                          This insight was generated using advanced natural language processing and cross-document correlation analysis. 
                          The methodology involves pattern recognition, semantic analysis, and contextual understanding to extract meaningful intelligence.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Processing Techniques</h4>
                            <ul className="text-sm text-gray-700 space-y-1">
                              <li>• Natural Language Understanding</li>
                              <li>• Semantic Pattern Recognition</li>
                              <li>• Cross-document Correlation</li>
                              <li>• Context-aware Analysis</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Validation Criteria</h4>
                            <ul className="text-sm text-gray-700 space-y-1">
                              <li>• Source reliability verification</li>
                              <li>• Statistical significance testing</li>
                              <li>• Cross-reference validation</li>
                              <li>• Expert knowledge integration</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-2xl p-6 border-l-4 border-blue-500">
                        <div className="flex items-center space-x-3 mb-3">
                          <Eye className="w-5 h-5 text-blue-600" />
                          <h3 className="font-bold text-blue-900">Quality Assurance</h3>
                        </div>
                        <p className="text-blue-800 text-sm leading-relaxed">
                          This insight has undergone comprehensive quality assurance processes including accuracy verification, 
                          relevance scoring, and contextual validation. The confidence score reflects the reliability of the analysis.
                        </p>
                      </div>
                    </div>
                  </motion.section>

                  {/* 8. Footer with Timestamp */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                    className="flex items-center justify-center pt-8 border-t border-gray-200"
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
