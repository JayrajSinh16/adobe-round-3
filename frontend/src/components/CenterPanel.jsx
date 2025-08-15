import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';

const CenterPanel = ({
  selectedFile,
  currentPage,
  pdfZoom,
  pdfLoading,
  pdfViewerRef,
  handlePDFZoom,
  handlePageNavigation,
  setSelectedText,
  setSelectedTextContext,
  setRightPanelVisible,
  setActiveInsightTab,
  setAnalysisLoading,
  setInsightsGenerated,
  goldenTransition
}) => {
  return (
    <motion.main
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, ...goldenTransition }}
      className="flex-1 bg-gradient-to-br from-[#E5E7EB]/20 to-[#F3F4F6]/30 flex flex-col"
    >
      {/* PDF Toolbar */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-[#E5E7EB]/20 px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-6">
          <motion.h2 
            className="text-lg font-black text-[#1A1A1A] truncate max-w-md tracking-tight"
            key={selectedFile?.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {selectedFile ? selectedFile.name : 'Select a document to begin'}
          </motion.h2>
          
          {selectedFile && (
            <motion.div 
              className="flex items-center space-x-4 text-sm text-[#1A1A1A] opacity-60 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span>Page {currentPage} of {selectedFile.pages}</span>
              <span>•</span>
              <span>{Math.round(pdfZoom * 100)}% zoom</span>
            </motion.div>
          )}
        </div>
        
        {/* PDF Controls */}
        <div className="flex items-center space-x-1">
          <motion.button 
            onClick={() => handlePDFZoom('out')}
            className="p-3 rounded-xl hover:bg-[#E5E7EB]/50 transition-all duration-300 disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={pdfZoom <= 0.5}
            aria-label="Zoom out"
          >
            <ZoomOut className="w-5 h-5" />
          </motion.button>
          
          <motion.button 
            onClick={() => handlePDFZoom('in')}
            className="p-3 rounded-xl hover:bg-[#E5E7EB]/50 transition-all duration-300 disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={pdfZoom >= 3.0}
            aria-label="Zoom in"
          >
            <ZoomIn className="w-5 h-5" />
          </motion.button>
          
          <div className="w-px h-6 bg-[#E5E7EB] mx-2"></div>
          
          <motion.button 
            onClick={() => handlePageNavigation('prev')}
            className="p-3 rounded-xl hover:bg-[#E5E7EB]/50 transition-all duration-300 disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={currentPage <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          
          <motion.button 
            onClick={() => handlePageNavigation('next')}
            className="p-3 rounded-xl hover:bg-[#E5E7EB]/50 transition-all duration-300 disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!selectedFile || currentPage >= selectedFile.pages}
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* PDF Content Area */}
      <div className="flex-1 relative overflow-auto">
        {selectedFile ? (
          <div className="h-full flex items-center justify-center p-8">
            {pdfLoading ? (
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="w-20 h-20 mx-auto mb-6 border-4 border-[#DC2626]/20 border-t-[#DC2626] rounded-full animate-spin"></div>
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Loading PDF...</h3>
                <p className="text-[#1A1A1A] opacity-60">Initializing Adobe PDF viewer</p>
              </motion.div>
            ) : (
              <motion.div 
                ref={pdfViewerRef}
                className="bg-white shadow-2xl rounded-2xl p-10 max-w-5xl w-full relative"
                style={{ 
                  minHeight: '1000px',
                  transform: `scale(${pdfZoom})`,
                  transformOrigin: 'center top'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onMouseUp={() => {
                  // Enhanced text selection
                  setTimeout(() => {
                    const selection = window.getSelection();
                    const selectedText = selection.toString().trim();
                    
                    if (selectedText.length > 10 && selectedText.split(' ').length >= 3) {
                      const range = selection.getRangeAt(0);
                      const rect = range.getBoundingClientRect();
                      
                      setSelectedText(selectedText);
                      setSelectedTextContext({
                        text: selectedText,
                        documentName: selectedFile.name,
                        page: currentPage,
                        position: { x: rect.left, y: rect.top },
                        timestamp: Date.now()
                      });
                      setRightPanelVisible(true);
                      setActiveInsightTab('connections');
                      setAnalysisLoading(true);
                      
                      // Simulate analysis
                      setTimeout(() => {
                        setAnalysisLoading(false);
                        setInsightsGenerated(true);
                      }, 1200);
                    }
                  }, 100);
                }}
              >
                {/* PDF Content Mockup */}
                <div className="space-y-8 text-[#1A1A1A] leading-relaxed">
                  <motion.h1 
                    className="text-4xl font-black mb-8 text-[#1A1A1A] tracking-tight"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {selectedFile.name.replace('.pdf', '')}
                  </motion.h1>
                  
                  <div className="space-y-6">
                    <motion.section
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <h2 className="text-2xl font-bold text-[#DC2626] mb-4">Executive Summary</h2>
                      <p className="text-justify leading-loose mb-4">
                        This comprehensive analysis reveals significant opportunities for strategic advancement in our current operational framework. 
                        Through detailed examination of <span className="bg-yellow-200 cursor-pointer px-2 py-1 rounded-lg hover:bg-yellow-300 transition-colors">Transfer Learning</span> methodologies, 
                        we have identified key areas where implementation can drive substantial performance improvements across enterprise systems.
                      </p>
                      
                      <p className="text-justify leading-loose">
                        The integration of advanced <span className="bg-yellow-200 cursor-pointer px-2 py-1 rounded-lg hover:bg-yellow-300 transition-colors">Machine Learning</span> techniques 
                        with existing infrastructure presents unique opportunities for optimization. Our analysis indicates that 
                        <span className="bg-yellow-200 cursor-pointer px-2 py-1 rounded-lg hover:bg-yellow-300 transition-colors">artificial intelligence</span> adoption rates have 
                        increased dramatically, suggesting strong market readiness for these innovations.
                      </p>
                    </motion.section>

                    <motion.section
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <h2 className="text-2xl font-bold text-[#DC2626] mb-4">Key Findings</h2>
                      <ul className="list-disc pl-8 space-y-3 text-lg">
                        <li>Implementation of <span className="bg-yellow-200 cursor-pointer px-2 py-1 rounded-lg hover:bg-yellow-300 transition-colors">neural networks</span> shows 67% efficiency improvement</li>
                        <li>Cross-functional collaboration enhances <span className="bg-yellow-200 cursor-pointer px-2 py-1 rounded-lg hover:bg-yellow-300 transition-colors">deep learning</span> outcomes significantly</li>
                        <li>Risk assessment indicates manageable exposure levels with clear mitigation strategies</li>
                        <li>ROI projections exceed industry benchmarks by 23% within first deployment cycle</li>
                      </ul>
                    </motion.section>

                    <motion.section
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <h2 className="text-2xl font-bold text-[#DC2626] mb-4">Technical Implementation</h2>
                      <p className="text-justify leading-loose mb-4">
                        The proposed <span className="bg-yellow-200 cursor-pointer px-2 py-1 rounded-lg hover:bg-yellow-300 transition-colors">algorithmic framework</span> leverages 
                        state-of-the-art methodologies to ensure optimal performance. Through careful consideration of 
                        <span className="bg-yellow-200 cursor-pointer px-2 py-1 rounded-lg hover:bg-yellow-300 transition-colors">data processing</span> requirements and 
                        infrastructure constraints, we can achieve seamless integration with minimal operational disruption.
                      </p>

                      <blockquote className="border-l-4 border-[#DC2626] pl-6 py-4 bg-[#DC2626]/5 rounded-r-lg italic text-lg">
                        "The future of enterprise technology lies in the intelligent integration of 
                        <span className="bg-yellow-200 cursor-pointer px-2 py-1 rounded-lg hover:bg-yellow-300 transition-colors">automated systems</span> 
                        that can adapt and evolve with changing business requirements while maintaining operational excellence."
                      </blockquote>
                    </motion.section>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <motion.div 
            className="h-full flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-center">
              <motion.div
                className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-[#E5E7EB] to-[#F3F4F6] rounded-3xl flex items-center justify-center"
                whileHover={{ scale: 1.05, rotate: 2 }}
              >
                <FileText className="w-16 h-16 text-[#1A1A1A] opacity-40" />
              </motion.div>
              <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3">Select a document to view</h3>
              <p className="text-lg text-[#1A1A1A] opacity-60">Choose a document from the library to start your analysis journey</p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.main>
  );
};

export default CenterPanel;
