import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Network, FileText, Copy, Download } from 'lucide-react';

const ConnectionsSummaryModal = ({ isOpen, onClose, summary, documentName }) => {
  const premiumEasing = [0.25, 0.46, 0.45, 0.94];

  // Copy summary to clipboard
  const handleCopySummary = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
      // You could add a toast notification here
    }
  };

  // Export summary
  const handleExportSummary = () => {
    if (!summary) return;
    
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Connections Summary - ${documentName || 'Document'}</title>
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
              border-bottom: 3px solid #DC2626;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #DC2626;
              margin: 0 0 10px 0;
              font-size: 28px;
              font-weight: bold;
            }
            .header .filename {
              color: #6b7280;
              font-size: 16px;
              margin: 5px 0;
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
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🔗 Connections Summary</h1>
            <div class="filename">Document: ${documentName || 'Document'}</div>
          </div>
          
          <div class="summary-section">
            <div class="section-title">
              📋 Summary
            </div>
            <div class="summary-content">
              ${summary}
            </div>
          </div>
          
          <div class="footer">
            Connections summary generated using AI analysis • Generated on ${new Date().toLocaleDateString()}
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    };
  };

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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#DC2626] to-[#B91C1C] px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Network className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Connections Summary</h2>
                  <p className="text-red-100 text-sm">{documentName || 'Document Analysis'}</p>
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
          <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
            {summary ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* Summary Header */}
                <div className="bg-gradient-to-r from-red-50 to-rose-50 p-6 rounded-xl border border-red-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-red-500" />
                      <span>Cross-Document Analysis Summary</span>
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                      onClick={handleCopySummary}
                      title="Copy summary to clipboard"
                    >
                      <Copy className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
                    </motion.button>
                  </div>
                </div>

                {/* Main Summary */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-6 rounded-xl border">
                    <p className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">
                      {summary}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    Summary generated from cross-document connections analysis
                  </div>
                  <div className="flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                      onClick={handleExportSummary}
                    >
                      <Download className="w-4 h-4 text-xs" />
                      <span>Export Summary</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2 bg-[#DC2626] text-white rounded-lg hover:bg-[#B91C1C] transition-colors"
                      onClick={onClose}
                    >
                      Done
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Network className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Summary Available</h3>
                <p className="text-gray-600 text-center max-w-md">
                  No summary was found in the connections response. Try selecting different text or ensure connections are loaded.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConnectionsSummaryModal;
