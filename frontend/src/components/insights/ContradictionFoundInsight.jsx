import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Shield, 
  Scale, 
  FileX,
  Search,
  CheckCircle,
  XCircle
} from 'lucide-react';

const ContradictionFoundInsight = ({ insight }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.6 }}
      className="bg-white rounded-3xl py-6 px-8 shadow-lg border border-orange-200"
    >
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="p-3 bg-orange-100 rounded-xl">
          <AlertTriangle className="w-7 h-7 text-orange-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contradiction Found</h2>
          <p className="text-sm text-orange-600 font-medium">Conflicting Information Requiring Attention</p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="space-y-6">
        {/* Alert Banner */}
        <div className="bg-gradient-to-r from-orange-50 via-red-50 to-orange-50 rounded-2xl p-6 border border-orange-200">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0 mt-1">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Conflicting Information Detected</h3>
              <div className="text-gray-800 text-lg leading-relaxed font-medium whitespace-pre-wrap break-words">
                {insight.content}
              </div>
            </div>
          </div>
        </div>

        {/* Conflict Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Source A */}
          <div className="bg-red-50 rounded-xl p-6 border border-red-200">
            <div className="flex items-center space-x-3 mb-4">
              <XCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-bold text-gray-900">Source A Position</h3>
            </div>
            <div className="space-y-3">
              <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap break-words">
                {insight.source_a?.description || insight.sourceA || "First documented perspective or claim that contradicts other findings in the analysis."}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">Document:</span>
                <span className="text-xs font-medium text-red-600">
                  {insight.source_a?.pdf_name || insight.documentA || insight.source || "Primary Source"}
                </span>
              </div>
            </div>
          </div>

          {/* Source B */}
          <div className="bg-green-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-bold text-gray-900">Source B Position</h3>
            </div>
            <div className="space-y-3">
              <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap break-words">
                {insight.source_b?.description || insight.sourceB || "Alternative perspective or contradictory evidence found in the document set."}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">Document:</span>
                <span className="text-xs font-medium text-green-600">
                  {insight.source_b?.pdf_name || insight.documentB || "Secondary Source"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Severity Assessment */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <Scale className="w-5 h-5 text-gray-600" />
            <span>Contradiction Severity Assessment</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center bg-white rounded-lg p-4">
              <div className="text-2xl font-black text-blue-600 mb-2">
                {Math.round((insight.confidence || 0.7) * 100)}%
              </div>
              <div className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                Confidence
              </div>
            </div>
            
            <div className="text-center bg-white rounded-lg p-4">
              <div className="text-2xl font-black text-orange-600 mb-2">
                {insight.severity || 'Medium'}
              </div>
              <div className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                Risk Level
              </div>
            </div>
            
            <div className="text-center bg-white rounded-lg p-4">
              <div className="text-2xl font-black text-green-600 mb-2">
                {insight.source_documents?.length || 1}
              </div>
              <div className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                Sources
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-800 mb-1">Recommended Action</h4>
                <p className="text-yellow-700 text-sm">
                  {insight.resolution_strategy || "Immediate verification required. Cross-reference with additional sources to resolve conflicting information before making decisions based on this data."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Resolution Steps */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <Search className="w-5 h-5 text-blue-600" />
            <span>Resolution Strategy</span>
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold text-sm">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Verify Source Credibility</h4>
                <p className="text-gray-600 text-sm">
                  Evaluate the reliability, recency, and authority of each conflicting source.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-bold text-sm">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Seek Additional Evidence</h4>
                <p className="text-gray-600 text-sm">
                  Look for third-party sources or additional documentation to break the tie.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 font-bold text-sm">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Expert Consultation</h4>
                <p className="text-gray-600 text-sm">
                  Consider consulting subject matter experts to help resolve the contradiction.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Mitigation */}
        {insight.actionable && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-200">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-red-100 rounded-lg flex-shrink-0 mt-1">
                <FileX className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Immediate Risk Mitigation</h3>
                <p className="text-gray-700 leading-relaxed">
                  {insight.actionable}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Source Documents */}
        {insight.source_documents && insight.source_documents.length > 0 && (
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0 mt-1">
                <Search className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Analyzed Documents</h3>
                <div className="space-y-2">
                  {insight.source_documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
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
      </div>
    </motion.section>
  );
};

export default ContradictionFoundInsight;
