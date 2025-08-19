import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Network, 
  Layers, 
  BookOpen,
  ArrowRight,
  Zap,
  Eye,
  Puzzle,
  Sparkles,
  Share2
} from 'lucide-react';

const CrossDocumentInspirationInsight = ({ insight }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.6 }}
      className="bg-white rounded-3xl py-6 px-8 shadow-lg border border-purple-200"
    >
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="p-3 bg-purple-100 rounded-xl">
          <Brain className="w-7 h-7 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cross-Document Inspiration</h2>
          <p className="text-sm text-purple-600 font-medium">Creative Connections Across Multiple Sources</p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="space-y-6">
        {/* Inspiration Highlight */}
        <div className="bg-gradient-to-r from-purple-50 via-purple-100 to-white rounded-2xl p-6 border-l-4 border-purple-500">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0 mt-1">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Innovative Connection</h3>
              <div className="text-gray-800 text-lg leading-relaxed font-medium whitespace-pre-wrap break-words">
                {insight.content}
              </div>
            </div>
          </div>
        </div>

        {/* Connection Mapping */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <Network className="w-5 h-5 text-purple-600" />
            <span>Document Connection Map</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Source Documents */}
            <div className="space-y-3">
              <h4 className="font-semibold text-purple-600 text-sm mb-3">Source Documents</h4>
              {(insight.source_documents || [
                { pdf_name: 'Document A.pdf', page_number: 1, relevance_score: 0.95 },
                { pdf_name: 'Document B.pdf', page_number: 3, relevance_score: 0.87 },
                { pdf_name: 'Document C.pdf', page_number: 2, relevance_score: 0.82 }
              ]).map((doc, index) => (
                <div key={index} className="bg-white rounded-lg p-3 border border-purple-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                      <div>
                        <span className="text-gray-700 text-sm font-medium block">
                          {typeof doc === 'string' ? doc : doc.pdf_name}
                        </span>
                        {typeof doc === 'object' && doc.page_number && (
                          <span className="text-xs text-gray-500">Page {doc.page_number}</span>
                        )}
                      </div>
                    </div>
                    {typeof doc === 'object' && doc.relevance_score && (
                      <div className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded">
                        {Math.round(doc.relevance_score * 100)}%
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Connection Lines */}
            <div className="flex items-center justify-center">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                  <Puzzle className="w-6 h-6 text-purple-500" />
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 text-center">AI-Powered<br/>Connection Analysis</p>
              </div>
            </div>

            {/* Generated Insight */}
            <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg p-4">
              <h4 className="font-semibold text-purple-800 text-sm mb-3">Innovation Catalyst</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-purple-600" />
                  <span className="text-purple-700 text-sm">Novel Pattern Detected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-purple-600" />
                  <span className="text-purple-700 text-sm">Hidden Relationship Found</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-purple-600" />
                  <span className="text-purple-700 text-sm">Creative Synthesis</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Innovation Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-purple-600 mb-2">
              {Math.round((insight.confidence || 0.85) * 100)}%
            </div>
            <div className="text-sm font-bold text-gray-600 uppercase tracking-wide">
              Confidence
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-indigo-600 mb-2">
              {insight.connection_strength || 'Strong'}
            </div>
            <div className="text-sm font-bold text-gray-600 uppercase tracking-wide">
              Connection Strength
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-pink-600 mb-2">
              {insight.source_documents?.length || insight.documents?.length || 3}
            </div>
            <div className="text-sm font-bold text-gray-600 uppercase tracking-wide">
              Sources Connected
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-yellow-600 mb-2">
              {insight.innovation_potential || 'High'}
            </div>
            <div className="text-sm font-bold text-gray-600 uppercase tracking-wide">
              Innovation Potential
            </div>
          </div>
        </div>

        {/* Detailed Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pattern Analysis */}
          <div className="bg-white border border-purple-100 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Layers className="w-5 h-5 text-purple-600" />
              <span>Pattern Analysis</span>
            </h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-purple-600 text-sm mb-2">Common Themes</h4>
                <div className="flex flex-wrap gap-2">
                  {(insight.common_themes || ['Innovation', 'Efficiency', 'Scalability']).map((theme, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-indigo-600 text-sm mb-2">Emerging Patterns</h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {insight.pattern_analysis }
                </p>
              </div>
            </div>
          </div>

          {/* Innovation Opportunity */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              <span>Innovation Catalyst</span>
            </h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-yellow-600 text-sm mb-2">Innovation Opportunities</h4>
                {insight.innovation_catalyst && insight.innovation_catalyst.length > 0 ? (
                  <div className="space-y-2">
                    {insight.innovation_catalyst.map((catalyst, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span className="text-gray-700 text-sm leading-relaxed">
                          {catalyst}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {insight.synthesis_potential || "Combining insights from different documents reveals unexplored opportunities for innovation and optimization."}
                  </p>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-green-600 text-sm mb-2">Implementation Ideas</h4>
                <ul className="space-y-1">
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span className="text-gray-700 text-sm">
                      {insight.idea1 || "Develop hybrid approach combining best practices"}
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span className="text-gray-700 text-sm">
                      {insight.idea2 || "Create integrated framework for implementation"}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Future Exploration */}
        {insight.future_exploration && insight.future_exploration.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>Future Exploration</span>
            </h3>
            
            <div className="space-y-3">
              {insight.future_exploration.map((exploration, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {exploration}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Source Documents */}
        {insight.source_documents && insight.source_documents.length > 0 && (
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0 mt-1">
                <Network className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Connected Documents</h3>
                <div className="space-y-2">
                  {insight.source_documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-gray-700 font-medium">{doc.pdf_name}</span>
                        <span className="text-sm text-gray-500">Page {doc.page_number}</span>
                      </div>
                      <div className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {Math.round(doc.relevance_score * 100)}% relevance
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Collaborative Insights */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <Share2 className="w-5 h-5 text-purple-600" />
              <span>Share This Innovation</span>
            </h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              <Share2 className="w-4 h-4 inline mr-2" />
              Share Connection
            </motion.button>
          </div>
          
          <p className="text-gray-700 text-sm leading-relaxed">
            This cross-document insight reveals innovative connections that might inspire new approaches 
            in your field. Consider sharing with colleagues or teams working on similar challenges to 
            foster collaborative innovation and knowledge sharing.
          </p>
        </div>

        {/* Related Connections */}
        {insight.related_connections && (
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Related Connections</h3>
            <div className="space-y-3">
              {insight.related_connections.map((connection, index) => (
                <div key={index} className="flex items-center space-x-3 bg-white rounded-lg p-3">
                  <Network className="w-4 h-4 text-purple-500" />
                  <span className="text-gray-700 text-sm font-medium">{connection}</span>
                  <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
};

export default CrossDocumentInspirationInsight;
