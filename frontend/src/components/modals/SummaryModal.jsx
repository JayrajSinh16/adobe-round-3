import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Clock, TrendingUp, BookOpen, Lightbulb, Copy, Download } from 'lucide-react';

const SummaryModal = ({ isOpen, onClose, file }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [summary, setSummary] = useState(null);

  // Export summary as PDF
  const handleExportSummary = () => {
    if (!summary || !file) return;
    
    // Create a new window with the summary content
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Summary - ${file.name}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 40px 20px;
              line-height: 1.6;
              color: #333;
            }
            .header {
              border-bottom: 3px solid #10b981;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #10b981;
              margin: 0 0 10px 0;
              font-size: 28px;
              font-weight: bold;
            }
            .header .filename {
              color: #6b7280;
              font-size: 16px;
              margin: 5px 0;
            }
            .meta-info {
              display: flex;
              gap: 20px;
              margin: 15px 0;
              font-size: 14px;
              color: #6b7280;
            }
            .summary-section {
              margin: 30px 0;
            }
            .section-title {
              font-size: 20px;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 15px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .summary-content {
              background: #f9fafb;
              padding: 25px;
              border-radius: 12px;
              border: 1px solid #e5e7eb;
              font-size: 16px;
              line-height: 1.7;
            }
            .key-points {
              margin: 30px 0;
            }
            .key-point {
              background: #ecfdf5;
              border: 1px solid #d1fae5;
              padding: 15px;
              margin: 10px 0;
              border-radius: 8px;
              display: flex;
              align-items: center;
              gap: 12px;
            }
            .key-point::before {
              content: '•';
              color: #10b981;
              font-weight: bold;
              font-size: 18px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              font-size: 12px;
              color: #9ca3af;
            }
            @media print {
              body { margin: 0; padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📄 Document Summary</h1>
            <div class="filename">File: ${file.name}</div>
            <div class="meta-info">
              <span>⏱️ Reading time: ${summary.readingTime}</span>
              <span>📊 Sentiment: ${summary.sentiment}</span>
              <span>📝 100 words summary</span>
            </div>
          </div>
          
          <div class="summary-section">
            <div class="section-title">
              💡 ${summary.title}
            </div>
            <div class="summary-content">
              ${summary.content}
            </div>
          </div>
          
          <div class="key-points">
            <div class="section-title">🔑 Key Highlights</div>
            ${summary.keyPoints.map(point => `
              <div class="key-point">
                <span>${point}</span>
              </div>
            `).join('')}
          </div>
          
          <div class="footer">
            Summary generated using AI analysis • Generated on ${new Date().toLocaleDateString()}
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    };
  };

  // Generate dummy summary based on file
  const generateDummySummary = (fileName) => {
    const summaries = [
      {
        title: "Financial Performance Analysis",
        content: "This document provides a comprehensive analysis of quarterly financial performance, highlighting significant growth in revenue streams and operational efficiency. Key findings include a 15% increase in net profit margins, strategic cost reduction initiatives, and market expansion opportunities. The report emphasizes sustainable growth strategies and recommends continued investment in technology infrastructure to maintain competitive advantage in the evolving market landscape.",
        keyPoints: ["15% profit margin increase", "Cost reduction initiatives", "Technology investment recommendations"],
        readingTime: "8 minutes",
        sentiment: "Positive"
      },
      {
        title: "Strategic Business Plan Overview",
        content: "A detailed strategic roadmap outlining organizational objectives for the upcoming fiscal year. The document encompasses market analysis, competitive positioning, and resource allocation frameworks. Critical focus areas include digital transformation, customer experience enhancement, and operational scalability. The plan presents actionable insights for stakeholder alignment and establishes measurable KPIs to track progress toward long-term business sustainability and growth targets.",
        keyPoints: ["Digital transformation focus", "Customer experience enhancement", "Measurable KPIs established"],
        readingTime: "12 minutes",
        sentiment: "Strategic"
      },
      {
        title: "Research Methodology Report",
        content: "This research document presents innovative methodologies for data collection and analysis within academic frameworks. The study explores qualitative and quantitative approaches, statistical modeling techniques, and validation processes. Significant findings demonstrate improved accuracy rates and reduced processing times. The methodology has broad applications across multiple research domains and offers valuable insights for future academic investigations and practical implementations in various professional contexts.",
        keyPoints: ["Improved accuracy rates", "Reduced processing times", "Broad research applications"],
        readingTime: "10 minutes",
        sentiment: "Analytical"
      },
      {
        title: "Technical Documentation Summary",
        content: "Comprehensive technical documentation covering system architecture, implementation guidelines, and best practices. The document details software development protocols, security frameworks, and integration methodologies. Key highlights include automated testing procedures, deployment strategies, and maintenance protocols. This technical guide serves as a valuable resource for development teams, ensuring consistent code quality and efficient project delivery while maintaining high security standards and performance optimization.",
        keyPoints: ["Automated testing procedures", "Security frameworks", "Performance optimization"],
        readingTime: "15 minutes",
        sentiment: "Technical"
      },
      {
        title: "Market Research Insights",
        content: "Extensive market research revealing consumer behavior patterns, industry trends, and competitive landscape analysis. The study identifies emerging opportunities, potential market gaps, and consumer preference shifts. Key insights include demographic analysis, purchasing patterns, and brand perception studies. These findings provide strategic direction for product development, marketing campaigns, and business expansion initiatives, enabling data-driven decision making for sustained market growth.",
        keyPoints: ["Consumer behavior patterns", "Emerging opportunities", "Data-driven insights"],
        readingTime: "9 minutes",
        sentiment: "Insightful"
      }
    ];

    // Select summary based on file name characteristics or random
    const index = Math.abs(fileName.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % summaries.length;
    return summaries[index];
  };

  useEffect(() => {
    if (isOpen && file) {
      setIsAnalyzing(true);
      setSummary(null);
      
      // Simulate analysis time
      const timer = setTimeout(() => {
        setSummary(generateDummySummary(file.name));
        setIsAnalyzing(false);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [isOpen, file]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Document Summary</h2>
                  <p className="text-green-100 text-sm">{file?.name}</p>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full mb-6"
                />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Analyzing Document</h3>
                <p className="text-gray-600 text-center max-w-md">
                  Our AI is reading through your document and extracting key insights to create a comprehensive summary...
                </p>
                
                {/* Progress Steps */}
                <div className="mt-8 space-y-2">
                  {['Extracting text content', 'Identifying key themes', 'Generating insights', 'Finalizing summary'].map((step, index) => (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ 
                        opacity: 1, 
                        x: 0,
                        transition: { delay: index * 0.6 }
                      }}
                      className="flex items-center space-x-3 text-sm text-gray-600"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ 
                          scale: 1,
                          transition: { delay: index * 0.6 + 0.3 }
                        }}
                        className="w-2 h-2 bg-green-500 rounded-full"
                      />
                      <span>{step}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : summary ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* Summary Header */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{summary.title}</h3>
                  
                  {/* Meta Information */}
                  <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Reading time: {summary.readingTime}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>Sentiment: {summary.sentiment}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span>100 words summary</span>
                    </div>
                  </div>
                </div>

                {/* Main Summary */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                      <span>Executive Summary</span>
                    </h4>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                      onClick={() => {
                        navigator.clipboard.writeText(summary.content);
                        // You could add a toast notification here
                      }}
                      title="Copy summary to clipboard"
                    >
                      <Copy className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
                    </motion.button>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-xl border">
                    <p className="text-gray-700 leading-relaxed text-base">
                      {summary.content}
                    </p>
                  </div>
                </div>

                {/* Key Points */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">Key Highlights</h4>
                  <div className="grid gap-3">
                    {summary.keyPoints.map((point, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ 
                          opacity: 1, 
                          x: 0,
                          transition: { delay: index * 0.1 }
                        }}
                        className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg border border-green-200"
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                        <span className="text-gray-700 font-medium">{point}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Summary generated using AI analysis
                  </div>
                  <div className="flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                      onClick={handleExportSummary}
                    >
                      <Download className="w-4 h-4" />
                      <span>Export Summary</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      onClick={onClose}
                    >
                      Done
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SummaryModal;
