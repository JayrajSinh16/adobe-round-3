import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Building, 
  Users, 
  TrendingUp,
  MapPin,
  Calendar,
  Award,
  ExternalLink,
  Lightbulb,
  BarChart3
} from 'lucide-react';

const RealWorldExampleInsight = ({ insight }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
      className="bg-white rounded-3xl py-6 px-8 shadow-lg border border-cyan-200"
    >
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="p-3 bg-cyan-100 rounded-xl">
          <CheckCircle2 className="w-7 h-7 text-cyan-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Real-World Example</h2>
          <p className="text-sm text-cyan-600 font-medium">Practical Implementation & Case Study</p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="space-y-6">
        {/* Example Highlight */}
        <div className="bg-gradient-to-r from-cyan-50 via-cyan-100 to-white rounded-2xl p-6 border-l-4 border-cyan-500">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-cyan-100 rounded-lg flex-shrink-0 mt-1">
              <Building className="w-5 h-5 text-cyan-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Case Study Overview</h3>
              <div className="text-gray-800 text-lg leading-relaxed font-medium whitespace-pre-wrap break-words">
                {insight.content}
              </div>
            </div>
          </div>
        </div>

        {/* Key Details Grid */}
      

        {/* Implementation Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Approach */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              <span>Implementation Approach</span>
            </h3>
            <div className="space-y-3">
              {insight.implementation_approach && insight.implementation_approach.length > 0 ? (
                insight.implementation_approach.map((approach, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-cyan-600">{index + 1}</span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {approach}
                    </p>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700 text-sm">
                      {insight.approach1 || "Phased implementation starting with pilot program"}
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700 text-sm">
                      {insight.approach2 || "Cross-functional team collaboration"}
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700 text-sm">
                      {insight.approach3 || "Continuous monitoring and optimization"}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Key Challenges */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-orange-600 mb-4 flex items-center space-x-2">
              <span>Key Challenges</span>
            </h3>
            <div className="space-y-3">
              {insight.key_challenges && insight.key_challenges.length > 0 ? (
                insight.key_challenges.map((challenge, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-orange-600">{index + 1}</span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {challenge}
                    </p>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700 text-sm">
                      {insight.challenge1 || "Initial resistance to change"}
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700 text-sm">
                      {insight.challenge2 || "Technical integration complexity"}
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700 text-sm">
                      {insight.challenge3 || "Resource allocation constraints"}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Key Success Factors */}
        {/* <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <Award className="w-5 h-5 text-yellow-600" />
            <span>Critical Success Factors</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-green-600 mb-3 text-sm">What Worked Well</h4>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">
                    {insight.success1 || "Strong leadership commitment and vision"}
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">
                    {insight.success2 || "Comprehensive stakeholder engagement"}
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">
                    {insight.success3 || "Robust change management process"}
                  </span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-orange-600 mb-3 text-sm">Key Challenges</h4>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <div className="w-4 h-4 border-2 border-orange-400 rounded-full mt-0.5 flex-shrink-0"></div>
                  <span className="text-gray-700 text-sm">
                    {insight.challenge1 || "Initial resistance to change"}
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-4 h-4 border-2 border-orange-400 rounded-full mt-0.5 flex-shrink-0"></div>
                  <span className="text-gray-700 text-sm">
                    {insight.challenge2 || "Technical integration complexity"}
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-4 h-4 border-2 border-orange-400 rounded-full mt-0.5 flex-shrink-0"></div>
                  <span className="text-gray-700 text-sm">
                    {insight.challenge3 || "Resource allocation constraints"}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div> */}

        {/* Applicability Assessment */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Applicability to Your Context</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center bg-white rounded-lg p-4">
              <div className="text-2xl font-black text-blue-600 mb-2">
                {Math.round((insight.confidence || 0.85) * 100)}%
              </div>
              <div className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                Confidence
              </div>
            </div>
            
            <div className="text-center bg-white rounded-lg p-4">
              <div className="text-2xl font-black text-green-600 mb-2">
                {insight.feasibility || 'Medium'}
              </div>
              <div className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                Feasibility
              </div>
            </div>
            
            <div className="text-center bg-white rounded-lg p-4">
              <div className="text-2xl font-black text-purple-600 mb-2">
                {insight.source_documents?.length || 1}
              </div>
              <div className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                Sources
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <p className="text-gray-700 text-sm leading-relaxed">
              <strong>Adaptation Recommendation:</strong> This example provides a proven framework 
              that can be adapted to your specific context. Consider the scale, timeline, and 
              resource requirements when planning implementation.
            </p>
          </div>
        </div>

        {/* Further Reading */}
        {insight.references && (
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <ExternalLink className="w-5 h-5 text-gray-600" />
              <span>Additional Resources</span>
            </h3>
            <div className="space-y-2">
              {insight.references.map((ref, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <ExternalLink className="w-4 h-4 text-cyan-600" />
                  <span className="text-cyan-600 hover:text-cyan-700 text-sm font-medium cursor-pointer">
                    {ref}
                  </span>
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
                <BarChart3 className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Source Documents</h3>
                <div className="space-y-2">
                  {insight.source_documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
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

export default RealWorldExampleInsight;
