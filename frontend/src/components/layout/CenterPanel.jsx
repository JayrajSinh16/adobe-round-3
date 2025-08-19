import React, { useRef, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import InlinePDFViewer from '../features/InlinePDFViewer';

const CenterPanel = ({
  selectedFile,
  openTabs, // [{id, file}] order preserved
  activeTabId,
  onActivateTab,
  onCloseTab,
  currentPage,
  setSelectedText,
  setSelectedTextContext,
  setRightPanelVisible,
  setActiveInsightTab,
  setAnalysisLoading,
  setInsightsGenerated,
  goldenTransition,
  onAdobeApisReady
}) => {
  // Keep a map of tabId -> apis
  const apisRefMap = useRef(new Map());

  const onApisReady = useCallback((tabId, apis) => {
    apisRefMap.current.set(tabId, apis);
    // Forward the active tab's APIs to the parent component
    if (tabId === activeTabId && onAdobeApisReady) {
      onAdobeApisReady(apis);
    }
  }, [activeTabId, onAdobeApisReady]);

  const activeApis = useMemo(() => {
    const apis = activeTabId ? apisRefMap.current.get(activeTabId) : null;
    // Update parent component with the current active APIs
    if (apis && onAdobeApisReady) {
      onAdobeApisReady(apis);
    }
    return apis;
  }, [activeTabId, onAdobeApisReady]);

  const onSelection = useCallback(({ text, page, position }) => {
    if (!text) return;
    setSelectedText(text);
    setSelectedTextContext({
      text,
      documentName: selectedFile?.name,
      page,
      position,
      timestamp: Date.now(),
    });
    setRightPanelVisible(true);
    setActiveInsightTab('connections');
  setAnalysisLoading(true);
  }, [selectedFile, setSelectedText, setSelectedTextContext, setRightPanelVisible, setActiveInsightTab, setAnalysisLoading, setInsightsGenerated]);

  // Also send selection to Insights consumers (no tab switch)
  const onGenerateInsights = useCallback(({ text, page }) => {
    if (!text) return;
    setSelectedText(text);
    setSelectedTextContext({
      text,
      documentName: selectedFile?.name,
      page,
      position: { x: 0, y: 0 },
      timestamp: Date.now(),
    });
    setRightPanelVisible(true);
    // Do not force switch to insights tab; keep current tab selection behavior
  }, [selectedFile, setSelectedText, setSelectedTextContext, setRightPanelVisible]);

  const onZoom = useCallback((direction) => {
    const apis = activeApis;
    if (!apis) return;
    try {
      if (direction === 'in') apis.zoomIn?.();
      if (direction === 'out') apis.zoomOut?.();
    } catch {}
  }, [activeApis]);

  const onNavigatePage = useCallback((direction) => {
    const apis = activeApis;
    if (!apis) return;
    try {
      const target = direction === 'next' ? currentPage + 1 : currentPage - 1;
      if (target > 0) apis.gotoLocation?.(target);
    } catch {}
  }, [currentPage, activeApis]);
  return (
    <motion.main
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, ...goldenTransition }}
  className="flex-1 basis-0 min-w-0 bg-gradient-to-br from-[#E5E7EB]/20 to-[#F3F4F6]/30 flex flex-col"
    >
      {/* Tabs Bar */}
  <div className="bg-white/90 backdrop-blur-sm border-b border-[#E5E7EB]/20 px-2 py-2 flex items-center space-x-1 overflow-x-auto whitespace-nowrap no-scrollbar">
        {(openTabs || []).map((t) => (
          <div
            key={t.id}
    className={`group flex-none flex items-center max-w-xs px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
              activeTabId === t.id ? 'bg-[#DC2626]/10 text-[#DC2626]' : 'hover:bg-[#E5E7EB]/50 text-[#1A1A1A]'
            }`}
            onClick={() => onActivateTab?.(t.id)}
            onAuxClick={(e) => { if (e.button === 1) onCloseTab?.(t.id); }}
            title={t.file?.name}
          >
            <FileText className="w-4 h-4 mr-2 opacity-70" />
            <span className="truncate text-sm">{t.file?.name}</span>
            <button
              className="ml-2 opacity-0 group-hover:opacity-100 hover:text-[#DC2626]"
              onClick={(e) => { e.stopPropagation(); onCloseTab?.(t.id); }}
              aria-label={`Close ${t.file?.name}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>

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
        </div>
      </div>

      {/* PDF Content Area */}
      <div className="flex-1 relative overflow-hidden min-h-0">
        {(openTabs && openTabs.length > 0) ? (
          <div className="h-full p-4">
            {(() => {
              const active = openTabs.find(t => t.id === activeTabId) || openTabs[openTabs.length - 1];
              return active ? (
                <div className="w-full h-full" key={active.id}>
                  <InlinePDFViewer
                    file={active.file}
                    onSelection={onSelection}
                    onGenerateInsights={onGenerateInsights}
                    onApisReady={(apis) => onApisReady(active.id, apis)}
                    containerId={`adobe-view-${active.id}`}
                  />
                </div>
              ) : null;
            })()}
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
