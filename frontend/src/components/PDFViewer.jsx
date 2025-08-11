// src/components/PdfViewerModal.jsx

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const PdfViewerModal = ({ file, onClose }) => {
  const viewerRef = useRef(null);
  const ADOBE_CLIENT_ID = "c0598f2728bf431baecd93928d677adc";

  useEffect(() => {
    if (!file) return;

    // This function holds the core logic to render the PDF.
    const renderPdf = () => {
      if (viewerRef.current) {
        const adobeDCView = new window.AdobeDC.View({
          clientId: ADOBE_CLIENT_ID,
          divId: "adobe-pdf-viewer-modal",
        });

        const filePromise = Promise.resolve(file.file.arrayBuffer());

        adobeDCView.previewFile({
          content: { promise: filePromise },
          metaData: { fileName: file.name },
        }, {
          embedMode: "SIZED_CONTAINER",
          defaultViewMode: "FIT_WIDTH",
          showDownloadPDF: true,
          showPrintPDF: true,
        });
      }
    };

    // --- START: THE CRUCIAL CHANGE ---
    // Check if the AdobeDC object is ALREADY available
    if (window.AdobeDC) {
      // If it is, render the PDF immediately.
      renderPdf();
    } else {
      // If not, THEN add the event listener for the future.
      document.addEventListener("adobe_dc_view_sdk.ready", renderPdf);
    }
    // --- END: THE CRUCIAL CHANGE ---


    // The cleanup function is still important.
    return () => {
      document.removeEventListener("adobe_dc_view_sdk.ready", renderPdf);
    };

  }, [file]);

  if (!file) {
    return null;
  }

  return (
    <AnimatePresence>
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
          <div className="flex items-center justify-between p-4 border-b border-slate-200 flex-shrink-0">
            <h3 className="text-lg font-semibold text-slate-800 truncate">{file.name}</h3>
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
          
          <div ref={viewerRef} id="adobe-pdf-viewer-modal" className="flex-grow w-full h-full">
            {/* The Adobe PDF Viewer will be rendered here */}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PdfViewerModal;