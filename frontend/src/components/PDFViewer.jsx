// Enhanced PDFViewer with bug fixes
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, Loader2 } from 'lucide-react';
import TextSelectionPopup from './TextSelectionPopup';

const PdfViewerModal = ({ file, isVisible, onClose }) => {
  const viewerRef = useRef(null);
  const ADOBE_CLIENT_ID = "c0598f2728bf431baecd93928d677adc";

  const [selectionData, setSelectionData] = useState(null);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [adobeView, setAdobeView] = useState(null);
  
  // Add state to track selection polling
  const selectionIntervalRef = useRef(null);
  const lastSelectedTextRef = useRef('');
  const isCheckingSelectionRef = useRef(false);

  const handleProcessText = useCallback(async (textData) => {
    console.log('🚀 Processing text data:', textData);
    
    // Prepare the complete payload that would be sent to backend
    const backendPayload = {
      selectedText: textData.text,
      fileName: file.name,
      pageNumber: currentPageNumber,
      documentId: file.id,
      selectionContext: {
        action: textData.action || 'analyze',
        selectionLength: textData.text.length,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        windowSize: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      },
      // Additional metadata that might be useful for backend
      metadata: {
        fileSize: file.size,
        fileType: file.type,
        uploadedAt: file.uploadedAt,
        textPreview: textData.text.substring(0, 100) + (textData.text.length > 100 ? '...' : ''),
        wordCount: textData.text.split(/\s+/).length,
        characterCount: textData.text.length
      }
    };
    
    console.log('📤 COMPLETE BACKEND PAYLOAD:');
    console.log('=====================================');
    console.log(JSON.stringify(backendPayload, null, 2));
    console.log('=====================================');
    console.log('📊 PAYLOAD SUMMARY:');
    console.log(`- Selected Text: "${textData.text.substring(0, 50)}${textData.text.length > 50 ? '...' : ''}"`);
    console.log(`- File: ${file.name} (${file.size} bytes)`);
    console.log(`- Page: ${currentPageNumber}`);
    console.log(`- Action: ${textData.action || 'analyze'}`);
    console.log(`- Text Length: ${textData.text.length} characters`);
    console.log(`- Word Count: ${textData.text.split(/\s+/).length} words`);
    console.log('=====================================');
    
    setIsProcessing(true);
    setSelectionData(null); 
    
    try {
      // Simulate API call without actually calling backend
      console.log('🔄 Simulating backend API call...');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock response
      const mockResponse = {
        success: true,
        processingId: `proc_${Date.now()}`,
        analysis: {
          summary: `Analysis of "${textData.text.substring(0, 30)}..."`,
          sentiment: 'neutral',
          keyTopics: ['topic1', 'topic2', 'topic3'],
          processedAt: new Date().toISOString()
        }
      };
      
      console.log('✅ MOCK BACKEND RESPONSE:');
      console.log(JSON.stringify(mockResponse, null, 2));
      
      alert(`🧠 AI Analysis Complete!\n\nSelected: "${textData.text.substring(0, 50)}..."\nFile: ${file.name}\nPage: ${currentPageNumber}\n\nCheck console for complete backend payload!`);
      
    } catch (error) {
      console.error('❌ Failed to process text:', error);
      alert('Failed to process text with AI. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [file.name, file.id, file.size, file.type, file.uploadedAt, currentPageNumber]);

  // Enhanced selection checking with debouncing
  const checkTextSelection = useCallback((apis) => {
    if (isCheckingSelectionRef.current) return;
    isCheckingSelectionRef.current = true;

    apis.getSelectedContent()
      .then(result => {
        const hasValidSelection = result && 
                                 result.type === 'text' && 
                                 result.data && 
                                 result.data.trim().length > 2;

        if (hasValidSelection) {
          const selectedText = result.data.trim();
          
          // Avoid duplicate popups for same text or if we just manually closed
          if (lastSelectedTextRef.current === selectedText) {
            isCheckingSelectionRef.current = false;
            return;
          }
          
          // Add small delay to prevent immediate reappearing after manual close
          if (Date.now() - (window._lastPopupCloseTime || 0) < 1500) {
            isCheckingSelectionRef.current = false;
            return;
          }
          
          lastSelectedTextRef.current = selectedText;
          console.log('✅ New text selected:', selectedText.substring(0, 50) + '...');
          
          // Get current page
          apis.getCurrentPage()
            .then(pageNumber => {
              setCurrentPageNumber(pageNumber);
              
              // Calculate popup position - try to position near selection
              const viewerElement = document.getElementById("adobe-pdf-viewer-modal");
              let position = { x: window.innerWidth / 2, y: 150 }; // Default fallback
              
              if (viewerElement) {
                const viewerRect = viewerElement.getBoundingClientRect();
                
                // Try to get selection position from DOM
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                  try {
                    const range = selection.getRangeAt(0);
                    const selectionRect = range.getBoundingClientRect();
                    
                    if (selectionRect.width > 0 && selectionRect.height > 0) {
                      // Position popup near the actual selection
                      position = {
                        x: Math.min(
                          Math.max(selectionRect.left + selectionRect.width / 2, 160),
                          window.innerWidth - 160
                        ),
                        y: Math.max(selectionRect.top - 10, 60)
                      };
                    } else {
                      // Fallback to center of viewer
                      position = {
                        x: viewerRect.left + viewerRect.width / 2,
                        y: viewerRect.top + 120,
                      };
                    }
                  } catch (e) {
                    // Fallback position
                    position = {
                      x: viewerRect.left + viewerRect.width / 2,
                      y: viewerRect.top + 120,
                    };
                  }
                }
              }
              
              setSelectionData({ text: selectedText, position });
            })
            .catch(err => {
              console.warn('Could not get current page:', err);
              const position = { x: window.innerWidth / 2, y: 150 };
              setSelectionData({ text: selectedText, position });
            });
        } else {
          // Clear selection if no valid text is selected - but don't cause re-renders
          if (lastSelectedTextRef.current) {
            console.log('🧹 Clearing text selection');
            lastSelectedTextRef.current = '';
            setSelectionData(null);
          }
        }
      })
      .catch(() => {
        // Expected when no text is selected - clear if needed
        if (lastSelectedTextRef.current) {
          lastSelectedTextRef.current = '';
          setSelectionData(null);
        }
      })
      .finally(() => {
        isCheckingSelectionRef.current = false;
      });
  }, []); // Remove dependencies to prevent circular updates

  // Cleanup function
  const cleanup = useCallback(() => {
    if (selectionIntervalRef.current) {
      clearInterval(selectionIntervalRef.current);
      selectionIntervalRef.current = null;
    }
    
    const viewerNode = document.getElementById("adobe-pdf-viewer-modal");
    if (viewerNode) {
      viewerNode.innerHTML = "";
    }
    
    setAdobeView(null);
    setSelectionData(null);
    lastSelectedTextRef.current = '';
    isCheckingSelectionRef.current = false;
  }, []);

  useEffect(() => {
    if (!file || !viewerRef.current || adobeView) return;

    const renderPdf = () => {
      console.log('🚀 Initializing Adobe PDF viewer...');
      
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
        
        adobeViewer.getAPIs().then(apis => {
          console.log('🔌 Adobe APIs loaded, starting text selection monitoring...');
          
          // Start text selection monitoring with reduced frequency
          selectionIntervalRef.current = setInterval(() => {
            checkTextSelection(apis);
          }, 1000); // Reduced frequency to prevent performance issues

          // Handle page changes
          view.registerCallback(
            window.AdobeDC.View.Enum.CallbackType.EVENT_LISTENER,
            (event) => {
              if (event.type === "PAGE_VIEW") {
                setCurrentPageNumber(event.data.pageNumber);
                // Clear selection when page changes
                setSelectionData(null);
                lastSelectedTextRef.current = '';
              }
            },
            { enableFilePreviewEvents: true }
          );

        }).catch(error => {
          console.error('❌ Failed to get Adobe PDF APIs:', error);
        });

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

  // Handle clicking outside popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectionData && !event.target.closest('.text-selection-popup')) {
        setSelectionData(null);
        lastSelectedTextRef.current = '';
      }
    };
    
    if (selectionData) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [selectionData]);

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
                <div className="flex items-center space-x-2 px-3 py-1 bg-[#DC2626] text-white rounded-full text-xs">
                  <Brain className="w-3 h-3" />
                  <span>AI-Enabled</span>
                </div>
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
            
            {/* Instructions */}
            <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
              <p className="text-sm text-blue-700 flex items-center space-x-2">
                <Brain className="w-4 h-4" />
                <span>💡 <strong>Pro tip:</strong> Select any text in the PDF to analyze it with AI</span>
              </p>
            </div>
            
            {/* PDF Viewer Container */}
            <div ref={viewerRef} id="adobe-pdf-viewer-modal" className="flex-grow w-full h-full relative" />
            
            {/* Text Selection Popup */}
            <div className="text-selection-popup">
              <TextSelectionPopup
                isVisible={!!selectionData}
                position={selectionData?.position}
                selectedText={selectionData?.text}
                fileName={file.name}
                pageNumber={currentPageNumber}
                onProcess={handleProcessText}
                onClose={() => {
                  console.log('🚫 Manually closing popup - clearing selection');
                  
                  // Set timestamp to prevent immediate reappearing
                  window._lastPopupCloseTime = Date.now();
                  
                  setSelectionData(null);
                  lastSelectedTextRef.current = '';
                  
                  // Clear the actual text selection in the document
                  if (window.getSelection) {
                    const selection = window.getSelection();
                    if (selection.removeAllRanges) {
                      selection.removeAllRanges();
                    }
                  }
                  
                  // Clear Adobe PDF selection if possible
                  if (adobeView) {
                    try {
                      // Try to clear PDF selection using Adobe APIs
                      adobeView.getAPIs?.().then(apis => {
                        apis.clearPageSelection?.(currentPageNumber);
                      }).catch(() => {
                        // Ignore errors - not all PDFs support this
                      });
                    } catch (e) {
                      // Ignore errors
                    }
                  }
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PdfViewerModal;
