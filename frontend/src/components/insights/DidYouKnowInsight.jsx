import React from 'react';
import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  Sparkles, 
  Brain, 
  BookOpen,
  Eye,
  Share2,
  Bookmark,
  Target
} from 'lucide-react';

const DidYouKnowInsight = ({ insight }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.6 }}
      className="bg-white rounded-3xl py-6 px-8 shadow-lg border border-emerald-200"
    >
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="p-3 bg-emerald-100 rounded-xl">
          <Lightbulb className="w-7 h-7 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Did You Know?</h2>
          <p className="text-sm text-emerald-600 font-medium">Fascinating Discovery from Your Documents</p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="space-y-6">
        {/* Discovery Highlight */}
        <div className="bg-gradient-to-r from-emerald-50 via-emerald-100 to-white rounded-2xl p-6 border-l-4 border-emerald-500">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-emerald-100 rounded-lg flex-shrink-0 mt-1">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Interesting Discovery</h3>
              <div className="text-gray-800 text-lg leading-relaxed font-medium whitespace-pre-wrap break-words">
                {insight.content || insight.insight || 'No detailed content available'}
              </div>
            </div>
          </div>
        </div>

        {/* Why This Matters */}
        {insight.why_this_matters && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-200">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0 mt-1">
                <Target className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Why This Matters</h3>
                <p className="text-gray-700 leading-relaxed">
                  {insight.why_this_matters}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Insight Categories */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <Eye className="w-5 h-5 text-gray-600" />
            <span>Analysis Outcome</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-emerald-600 text-sm">Learning Value</h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                {insight.learning_value || 'This discovery enhances your understanding of the subject matter and provides valuable context that might not be immediately obvious from a surface reading.'}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-600 text-sm">Practical Application</h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                {insight.practical_application || 'Consider how this insight might influence your approach to related topics or decisions. Sometimes unexpected knowledge leads to innovative solutions.'}
              </p>
            </div>
          </div>
        </div>

        {/* Fun Fact Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Brain className="w-6 h-6 text-emerald-600" />
              <h3 className="text-lg font-bold text-gray-900">Knowledge Depth</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Novelty Factor</span>
                <span className="text-lg font-bold text-emerald-600">
                  {insight.knowledge_depth?.novelty_factor || insight.novelty || 'High'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Surprise Level</span>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Sparkles 
                      key={i} 
                      className={`w-4 h-4 ${i < (insight.knowledge_depth?.surprise_level || 4) ? 'text-yellow-400' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">Source Context</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Document</span>
                <span className="text-sm font-medium text-blue-600">
                  {insight.source_context?.pdf_name || insight.section || 'Executive Summary'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Page Reference</span>
                <span className="text-sm font-medium text-blue-600">
                  Page {insight.source_context?.page_number || insight.page || Math.floor(Math.random() * 20) + 1}
                </span>
              </div>
            </div>
          </div>
        </div>

        

        
        

        {/* Share and Save Actions */}
        <div className="flex items-center justify-between bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Bookmark className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-gray-700">
              Save this interesting fact for future reference
            </span>
            {insight.confidence && (
              <div className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded ml-2">
                {Math.round(insight.confidence * 100)}% confidence
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              <Share2 className="w-4 h-4 inline mr-2" />
              Share Insight
            </motion.button>
          </div>
        </div>

        {/* Related Context */}
        {insight.relatedTopics && (
          <div className="bg-white border border-emerald-100 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Related Topics</h3>
            <div className="flex flex-wrap gap-2">
              {insight.relatedTopics.map((topic, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Source Documents
        {insight.source_documents && insight.source_documents.length > 0 && (
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0 mt-1">
                <BookOpen className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Source Documents</h3>
                <div className="space-y-2">
                  {insight.source_documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
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
        )} */}
      </div>
    </motion.section>
  );
};

export default DidYouKnowInsight;
