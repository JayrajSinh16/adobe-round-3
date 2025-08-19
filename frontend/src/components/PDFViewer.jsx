// Enhanced PDFViewer with bug fixes
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, Loader2 } from 'lucide-react';

const PdfViewerModal = ({ file, isVisible, onClose }) => {
  const viewerRef = useRef(null);
  const ADOBE_CLIENT_ID = "c0598f2728bf431baecd93928d677adc";

  const [isProcessing, setIsProcessing] = useState(false);
  const [adobeView, setAdobeView] = useState(null);


  // Cleanup function
  const cleanup = useCallback(() => {
    
    const viewerNode = document.getElementById("adobe-pdf-viewer-modal");
    if (viewerNode) {
      viewerNode.innerHTML = "";
    }
    
    setAdobeView(null);
  }, []);

  useEffect(() => {
    if (!file || !viewerRef.current || adobeView) return;

    const renderPdf = () => {
      console.log('Initializing Adobe PDF viewer...');
      
      const view = new window.AdobeDC.View({
        clientId: ADOBE_CLIENT_ID,
        divId: "adobe-pdf-viewer-modal",
      });
      
      setAdobeView(view);

      const previewFilePromise = view.previewFile({
        content: { promise: file.file.arrayBuffer() },
        metaData: { fileName: file.name },
      }, {
        embedMode: "SIZED_CONTAINER",
        defaultViewMode: "FIT_WIDTH",
        showDownloadPDF: true,
        showPrintPDF: true,
        showAnnotationTools: true,
        enableTextSelection: true,
      });

      previewFilePromise.then(adobeViewer => {
        console.log('📄 PDF loaded successfully');

      }).catch(error => {
        console.error('❌ Failed to load PDF:', error);
      });
    };

    if (window.AdobeDC) {
      renderPdf();
    } else {
      document.addEventListener("adobe_dc_view_sdk.ready", renderPdf);
    }

    return cleanup;
  }, [file]); // REMOVED problematic dependencies

  if (!file) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative bg-white rounded-2xl w-full h-full max-w-6xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 flex-shrink-0 bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-slate-800 truncate">{file.name}</h3>
              </div>
              <div className="flex items-center space-x-2">
                {isProcessing && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Processing...</span>
                  </div>
                )}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 text-slate-500 hover:text-red-500 rounded-full"
                  aria-label="Close viewer"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>
            </div>
            
            {/* PDF Viewer Container */}
            <div ref={viewerRef} id="adobe-pdf-viewer-modal" className="flex-grow w-full h-full relative" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PdfViewerModal;
