import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp, Network, Lightbulb, Headphones, Sparkles } from 'lucide-react';
import InsightsTab from './InsightsTab';
import PodcastTab from './PodcastTab';

/**
 * PREMIUM RIGHT PANEL COMPONENT
 * 
 * Design Philosophy: Museum-quality minimalism with mathematical precision
 * - Golden ratio proportions (1.618) for optimal visual harmony
 * - Asymmetrical layouts for sophisticated visual hierarchy
 * - Glass morphism with surgical precision in spacing
 * - Enterprise-grade micro-interactions and accessibility
 */
const RightPanel = ({
  rightPanelVisible,
  selectedTextContext,
  activeInsightTab,
  analysisLoading,
  podcastGenerating,
  podcastData,
  podcastError,
  setRightPanelVisible,
  setActiveInsightTab,
  handleGeneratePodcast,
  goldenTransition,
  onInsightClick,
  connectionsData,
  connectionsError,
  onInsightsTabClick,
  insightsData,
  insightsError,
  hasConnectionsResponse,
  onNavigateToDocument,
}) => {
  const goldenRatio = 1.618;
  const premiumEasing = [0.25, 0.46, 0.45, 0.94];
  const [isSelectedTextExpanded, setIsSelectedTextExpanded] = useState(false);
  const toText = useCallback((v, fallback = '') => {
    if (v == null) return fallback;
    if (typeof v === 'string') return v;
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    if (typeof v === 'object') {
      if (typeof v.text === 'string') return v.text;
      if (typeof v.name === 'string') return v.name;
      try { return JSON.stringify(v); } catch { return fallback; }
    }
    try { return String(v); } catch { return fallback; }
  }, []);
  
  const containerVariants = {
    hidden: { opacity: 0, x: 50, scale: 0.98 },
    visible: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 30, mass: 0.8, staggerChildren: 0.05 } },
    exit: { opacity: 0, x: 30, scale: 0.98, transition: { duration: 0.3, ease: premiumEasing } },
  };

  const itemVariants = { hidden: { opacity: 0, y: 20, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 500, damping: 35 } } };

  return (
    <AnimatePresence mode="wait">
      {rightPanelVisible && (
        <motion.aside
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="w-[480px] bg-white/95 backdrop-blur-xl border-l border-[#E5E7EB]/20 shadow-2xl flex flex-col relative overflow-hidden"
          style={{ backdropFilter: 'blur(20px) saturate(180%)', boxShadow: '0 32px 64px -24px rgba(26, 26, 26, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.05)', borderImage: 'linear-gradient(180deg, rgba(229, 231, 235, 0.2), rgba(229, 231, 235, 0.05)) 1' }}
        >
          <motion.header variants={itemVariants} className="relative px-6 py-2 border-b border-[#E5E7EB]/10" style={{ paddingTop: `${12 * goldenRatio}px` }}>
            <div className="absolute inset-0 bg-gradient-to-r from-[#DC2626]/3 via-transparent to-transparent" />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-2">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.6, ease: premiumEasing }}>
                  <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight leading-none mb-2">Smart Analysis</h2>
                  <p className="text-[#1A1A1A] opacity-60 font-medium text-sm leading-relaxed">AI-powered insights and connections</p>
                </motion.div>
                <motion.button onClick={() => setRightPanelVisible(false)} className="group relative p-3 rounded-xl hover:bg-[#FAFAF9] transition-all duration-300 flex-shrink-0" whileHover={{ scale: 1.05, transition: { duration: 0.2 } }} whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}>
                  <X className="w-5 h-5 text-[#1A1A1A] opacity-50 group-hover:opacity-80 group-hover:text-[#DC2626] transition-all duration-300" />
                  <div className="absolute inset-0 bg-[#DC2626]/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <motion.div className="absolute inset-0 rounded-xl border-2 border-[#DC2626]/20 opacity-0 group-hover:opacity-100" initial={false} whileHover={{ scale: [1, 1.05, 1], opacity: [0, 0.5, 0] }} transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }} />
                </motion.button>
              </div>

              {/* SELECTED TEXT CONTEXT - Collapsible minimal card */}
              <AnimatePresence mode="wait">
                {selectedTextContext && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.4, ease: premiumEasing }}
                    className="relative  border border-[#DC2626]/20 rounded-2xl overflow-hidden mb-4"
                    style={{
                      backdropFilter: 'blur(15px) saturate(150%)',
                      
                    }}
                  >
                    {/* Compact header with dropdown toggle */}
                    <motion.div 
                      className="flex items-center justify-between p-4 cursor-pointer group"
                      onClick={() => setIsSelectedTextExpanded(!isSelectedTextExpanded)}
                      whileHover={{ backgroundColor: 'rgba(220, 38, 38, 0.02)' }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <motion.div 
                          className="w-6 h-6 bg-gradient-to-r from-[#DC2626] to-[#B91C1C] rounded-lg flex items-center justify-center flex-shrink-0"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Sparkles className="w-3 h-3 text-white" />
                        </motion.div>
                        
                        <div className="flex items-center space-x-2 text-sm text-[#1A1A1A] opacity-70 font-medium min-w-0">
                          <span className="font-bold text-[#DC2626] truncate">
                            {selectedTextContext.documentName || 'Current Document'}
                          </span>
                          <div className="w-1 h-1 bg-[#E5E7EB] rounded-full flex-shrink-0" />
                          <span className="flex-shrink-0">Page {selectedTextContext.page}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {/* Quick preview of text when collapsed */}
                        {!isSelectedTextExpanded && (
                          <motion.span 
                            className="text-xs text-[#1A1A1A] opacity-50 italic max-w-24 truncate hidden sm:block"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            {(() => {
                              const s = toText(selectedTextContext.text, '');
                              const trimmed = s.length > 30 ? s.substring(0, 30) + '...' : s;
                              return `"${trimmed}"`;
                            })()}
                          </motion.span>
                        )}
                        
                        {/* Expand/collapse button */}
                        <motion.div
                          className="p-1 rounded-lg hover:bg-[#DC2626]/10 transition-all duration-300"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {isSelectedTextExpanded ? (
                            <ChevronUp className="w-4 h-4 text-[#DC2626]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[#1A1A1A] opacity-60 group-hover:text-[#DC2626] group-hover:opacity-100" />
                          )}
                        </motion.div>
                        {/* Close button */}
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRightPanelVisible(false);
                          }}
                          className="p-1 rounded-lg hover:bg-[#DC2626]/10 transition-all duration-300 group/close"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <X className="w-4 h-4 text-[#1A1A1A] opacity-60 group-hover/close:opacity-100 group-hover/close:text-[#DC2626]" />
                        </motion.button>
                      </div>
                    </motion.div>
                    
                    {/* Expandable content */}
                    <AnimatePresence>
                      {isSelectedTextExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ 
                            duration: 0.3, 
                            ease: premiumEasing,
                            opacity: { duration: 0.2 }
                          }}
                          className="overflow-hidden"
                        >
                          <motion.div 
                            className="relative bg-gradient-to-r from-[#FAFAF9] to-white border-l-3 border-[#DC2626] mx-4 mb-4 pl-4 py-3 rounded-r-lg"
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.1, duration: 0.3 }}
                            style={{
                              backdropFilter: 'blur(10px)',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
                            }}
                          >
                            <p className="text-[#1A1A1A] text-sm leading-relaxed line-clamp-2 italic">
                              {(() => {
                                const s = toText(selectedTextContext.text, '');
                                const trimmed = s.length > 120 ? s.substring(0, 120) + '...' : s;
                                return `"${trimmed}"`;
                              })()}
                            </p>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* PREMIUM TAB NAVIGATION - Golden ratio spacing */}
              <motion.div 
                className="relative bg-[#FAFAF9]/80 backdrop-blur-sm p-2 rounded-2xl border border-[#E5E7EB]/20"
                variants={itemVariants}
                style={{ 
                  boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.02)',
                  backdropFilter: 'blur(10px) saturate(150%)'
                }}
              >
                <div className="flex space-x-1">
                  {[
                    { 
                      id: 'connections', 
                      label: 'Connections', 
                      icon: Network, 
                      
                      color: 'from-blue-500 to-indigo-600'
                    },
                    { 
                      id: 'insights', 
                      label: 'Insights', 
                      icon: Lightbulb, 
                      count: 8,
                      color: 'from-amber-500 to-orange-600'
                    },
                    { 
                      id: 'podcast', 
                      label: 'Podcast', 
                      icon: Headphones, 
                      count: 3,
                      color: 'from-purple-500 to-pink-600'
                    }
                  ].map((tab, index) => (
                    <motion.button
                      key={tab.id}
                      onClick={() => {
                        if (tab.id === 'insights' && typeof onInsightsTabClick === 'function') {
                          onInsightsTabClick();
                        } else {
                          setActiveInsightTab(tab.id);
                        }
                      }}
                      className={`flex-1 relative flex items-center justify-center space-x-2 px-4 py-4 rounded-xl font-semibold text-sm transition-all duration-500 overflow-hidden ${
                        activeInsightTab === tab.id
                          ? 'bg-white text-[#DC2626] shadow-md'
                          : 'text-[#1A1A1A] opacity-60 hover:opacity-100 hover:bg-white/50'
                      }`}
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                    >
                      {/* Active tab background gradient */}
                      {activeInsightTab === tab.id && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-white rounded-xl"
                          transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        />
                      )}
                      
                      <div className="relative z-10 flex items-center space-x-2">
                        <tab.icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                        
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.header>

          {/* PREMIUM CONTENT AREA - Mathematical spacing and typography */}
          <main 
            className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-2"
            style={{ 
              scrollbarWidth: 'thin',
              scrollbarColor: '#E5E7EB transparent'
            }}
          >
            <AnimatePresence mode="wait">
              {analysisLoading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="text-center py-16"
                >
                  {/* Premium loading spinner with golden ratio dimensions */}
                  <motion.div 
                    className="w-16 h-16 mx-auto mb-8 relative"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="w-full h-full border-4 border-[#E5E7EB]/20 rounded-full" />
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-[#DC2626] rounded-full" />
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h4 className="text-xl font-bold text-[#1A1A1A] mb-3">
                      Analyzing Content
                    </h4>
                    <p className="text-[#1A1A1A] opacity-60 max-w-sm mx-auto leading-relaxed">
                      Our AI is processing your selection to find meaningful connections and insights
                    </p>
                  </motion.div>
                </motion.div>
              ) : (
                <div className="space-y-8">
                  {/* CONNECTIONS TAB - Minimal elegant connection visualization */}
                  {activeInsightTab === 'connections' && (
                    <motion.section
                      key="connections"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5, ease: premiumEasing }}
                      className="space-y-6"
                    >
                      {/* Minimal source context */}
                      {/* {selectedTextContext && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, ease: premiumEasing }}
                          className="flex items-center space-x-3 p-4 bg-[#FAFAF9]/60 border border-[#E5E7EB]/30 rounded-2xl"
                          style={{ backdropFilter: 'blur(10px)' }}
                        >
                          <div className="w-2 h-2 bg-[#DC2626] rounded-full" />
                          <span className="text-sm font-medium text-[#1A1A1A] opacity-70">
                            Analyzing from{' '}
                            <span className="font-bold text-[#DC2626]">
                              {selectedTextContext.documentName || 'Current Document'}
                            </span>
                            {' '}• Page {selectedTextContext.page}
                          </span>
                        </motion.div>
                      )} */}

                      {/* Elegant connection cards */}
                      <div className="space-y-4">
                        {connectionsError && (
                          <div className="p-4 border border-red-200 bg-red-50 text-sm text-red-700 rounded-xl">
                            {connectionsError}
                          </div>
                        )}
                        {!connectionsError && hasConnectionsResponse && (connectionsData?.connections || []).length === 0 && (
                          <div className="p-4 border border-gray-200 bg-gray-50 text-sm text-gray-700 rounded-xl">
                            No connections found.
                          </div>
                        )}
                        {(Array.isArray(connectionsData?.connections) ? connectionsData.connections : []).map((connection, index) => (
                          <motion.article
                            key={`${connection.title}-${index}`}
                            className="group relative bg-white/90 border border-[#E5E7EB]/20 rounded-2xl overflow-hidden cursor-pointer"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ 
                              delay: index * 0.05, 
                              duration: 0.3,
                              ease: premiumEasing
                            }}
                            whileHover={{ 
                              y: -2, 
                              scale: 1.005,
                              transition: { duration: 0.2 }
                            }}
                            style={{
                              backdropFilter: 'blur(12px) saturate(120%)',
                              boxShadow: '0 4px 20px rgba(26, 26, 26, 0.06)'
                            }}
                          >
                            <div className="p-4">
                              <header className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-3 flex-1">
                                  <motion.div 
                                    className="w-3 h-3 rounded-full bg-[#DC2626]"
                                    whileHover={{ scale: 1.2 }}
                                    transition={{ duration: 0.2 }}
                                  />
                                  <h3 className="text-lg font-bold text-[#1A1A1A] group-hover:text-[#DC2626] transition-colors duration-300">{toText(connection.title, 'Untitled')}</h3>
                                </div>
                              </header>
                              <motion.blockquote 
                                className="bg-[#FAFAF9]/60 border-l-3 border-[#DC2626] pl-4 py-1 mb-2 rounded-r-lg"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 + 0.1, duration: 0.3 }}
                              >
                                <p className="text-sm text-[#1A1A1A] opacity-80 italic leading-relaxed">"{toText(connection.snippet, '')}"</p>
                              </motion.blockquote>
                              <footer className="space-y-2">
                                <div className="text-xs font-medium text-[#1A1A1A] opacity-50 uppercase tracking-wide mb-3">
                                  Connected Source
                                </div>
                                <motion.div
                                  className="flex items-center justify-between p-3 bg-[#FAFAF9]/40 rounded-lg border border-[#E5E7EB]/20 hover:bg-[#DC2626]/5 transition-all duration-300"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.05 + 0.2, duration: 0.3 }}
                                  whileHover={{ scale: 1.01 }}
                                >
                                  <div className="flex items-center space-x-3 w-full">
                                    <div className="w-2 h-2 bg-[#DC2626] rounded-full opacity-60" />
                                    <div className='flex justify-between w-full items-center space-x-2'>
                                      <div 
                                        className="text-sm font-medium text-[#1A1A1A] hover:text-[#DC2626] cursor-pointer transition-colors duration-300"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          const documentName = toText(connection.document, '');
                                          const pageNumber = Array.isArray(connection.pages) && connection.pages.length > 0 ? connection.pages[0] : 1;
                                          const snippet = toText(connection.snippet, '');
                                          
                                          if (documentName && onNavigateToDocument) {
                                            console.log(`🔗 Connection card clicked: ${documentName}, page ${pageNumber}`);
                                            onNavigateToDocument(documentName, pageNumber, snippet);
                                          }
                                        }}
                                        title={`Click to open ${toText(connection.document, '')} and navigate to page ${Array.isArray(connection.pages) && connection.pages.length > 0 ? connection.pages[0] : 1}`}
                                      >
                                        {toText(connection.document, 'Unknown')}
                                      </div>
                                      <div className="text-xs text-[#1A1A1A] opacity-60">
                                        Page {Array.isArray(connection.pages) && connection.pages.length > 0 ? connection.pages[0] : 1}
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              </footer>
                            </div>
                          </motion.article>
                        ))}
                      </div>
                    </motion.section>
                  )}

                  {/* INSIGHTS TAB - Innovative insight cards with deep intelligence */}
                  {activeInsightTab === 'insights' && (
                    <InsightsTab 
                      onInsightClick={onInsightClick} 
                      insightsData={insightsData}
                      insightsError={insightsError}
                    />
                  )}

                  {/* PODCAST TAB - Premium audio generation */}
                  {activeInsightTab === 'podcast' && (
                    <PodcastTab 
                      podcastGenerating={podcastGenerating}
                      podcastData={podcastData}
                      podcastError={podcastError}
                      handleGeneratePodcast={handleGeneratePodcast}
                      premiumEasing={premiumEasing}
                      selectedTextContext={selectedTextContext}
                    />
                  )}
                </div>
              )}
            </AnimatePresence>
          </main>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default RightPanel;
