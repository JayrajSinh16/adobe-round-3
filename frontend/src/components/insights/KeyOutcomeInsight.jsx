import React from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  TrendingUp, 
  BarChart3, 
  CheckCircle2,
  ArrowRight,
  Star,
  Zap
} from 'lucide-react';

const KeyOutcomeInsight = ({ insight }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="bg-white rounded-3xl py-6 px-8 shadow-lg border border-red-200"
    >
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="p-3 bg-red-100 rounded-xl">
          <Target className="w-7 h-7 text-red-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Key Outcome</h2>
          <p className="text-sm text-red-600 font-medium">Strategic Intelligence from Document Analysis</p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="space-y-6">
        {/* Primary Insight */}
        <div className="bg-gradient-to-r from-red-50 via-red-100 to-white rounded-2xl p-6 border-l-4 border-red-500">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-red-100 rounded-lg flex-shrink-0 mt-1">
              <Star className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Strategic Outcome</h3>
              <div className="text-gray-800 text-lg leading-relaxed font-medium whitespace-pre-wrap break-words">
                {insight.content || insight.insight || 'No detailed content available'}
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-red-600 mb-2">
              {Math.round((insight.confidence || 0.95) * 100)}%
            </div>
            <div className="text-sm font-bold text-gray-600 uppercase tracking-wide">
              Confidence
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-green-600 mb-2">
              High
            </div>
            <div className="text-sm font-bold text-gray-600 uppercase tracking-wide">
              Impact Level
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-blue-600 mb-2">
              {insight.source_documents?.length || 1}
            </div>
            <div className="text-sm font-bold text-gray-600 uppercase tracking-wide">
              Sources
            </div>
          </div>
        </div>

        

        {/* Business Impact */}
        {insight.business_impact && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0 mt-1">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Business Impact</h3>
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                  {insight.business_impact}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        {insight.next_steps && insight.next_steps.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-green-100 rounded-lg flex-shrink-0 mt-1">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Next Steps</h3>
                <div className="space-y-3">
                  {insight.next_steps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-xs font-bold text-green-600">{index + 1}</span>
                      </div>
                      <div className="text-gray-700 leading-relaxed flex-1">
                        {step}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Source Documents */}
        {insight.source_documents && insight.source_documents.length > 0 && (
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0 mt-1">
                <BarChart3 className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Source Documents</h3>
                <div className="space-y-2">
                  {insight.source_documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
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

        {/* Strategic Implications */}
{/* Actionable Items */}
        {(insight.immediate_action_required || insight.actionable) && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-yellow-100 rounded-lg flex-shrink-0 mt-1">
                <Zap className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Immediate Action Required</h3>
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                  {insight.immediate_action_required || insight.actionable}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
};

export default KeyOutcomeInsight;
