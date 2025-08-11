import React, { useState, useCallback, useRef, useMemo } from 'react';
import PdfViewerModal from './PDFViewer';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { 
  Search, 
  FileText, 
  Lightbulb,
  Volume2,
  ArrowUpRight,
  Play,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Coffee,
  Zap,
  Star,
  ChevronUp,
  ChevronDown,
  Filter,
  Eye,
  BookOpen,
  Download
} from 'lucide-react';

/**
 * ELITE PROJECT ANALYSIS DASHBOARD
 * 
 * Design Philosophy: Museum-quality minimalism with surgical precision
 * - Mathematical proportions based on golden ratio (1.618)
 * - Asymmetrical layouts for visual sophistication  
 * - Interactive micro-animations that feel like premium software
 * - Enterprise-grade accessibility and responsive design
 */

const ProjectAnalysisDashboard = () => {
  // Core application state with sophisticated data management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeView, setActiveView] = useState('synthesis');
  const [isLoading, setIsLoading] = useState(false);
  const [fileToPreview, setFileToPreview] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedInsightBox, setSelectedInsightBox] = useState(null);
  const [showAdvancedInsights, setShowAdvancedInsights] = useState(false);
  const location = useLocation();
  const containerRef = useRef(null);

  // Extract navigation state for personalized experience
  const analysisParams = location.state || {};

  // Use uploaded files from navigation state if available, otherwise fallback to mock data
  const files = useMemo(() => {
    if (analysisParams.uploadedFiles && Array.isArray(analysisParams.uploadedFiles) && analysisParams.uploadedFiles.length > 0) {
      // Map uploaded files to display format
      return analysisParams.uploadedFiles.map((file, idx) => ({
        id: idx + 1,
        name: file.name || `Document ${idx + 1}`,
        icon: FileText,
        size: file.size ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'Unknown',
        pages: file.pages || '--',
        category: file.category || 'Uploaded',
        lastModified: file.lastModified || '',
        confidence: 95
      }));
    }
    // Fallback to mock data
    return [
      { 
        id: 1, 
        name: 'strategic-analysis-2024.pdf', 
        icon: FileText, 
        size: '3.2 MB',
        pages: 47,
        category: 'Strategy',
        lastModified: '2024-08-10',
        confidence: 96
      },
      { 
        id: 2, 
        name: 'competitive-landscape.pdf', 
        icon: FileText, 
        size: '2.1 MB',
        pages: 32,
        category: 'Market Research',
        lastModified: '2024-08-09',
        confidence: 91
      },
      { 
        id: 3, 
        name: 'financial-projections.pdf', 
        icon: FileText, 
        size: '4.7 MB',
        pages: 63,
        category: 'Finance',
        lastModified: '2024-08-08',
        confidence: 98
      },
    ];
  }, [analysisParams.uploadedFiles]);

  const rankedSections = useMemo(() => [
    {
      id: 1,
      rank: 1,
      title: 'Market Expansion Opportunity Assessment',
      snippet: 'Cross-functional analysis reveals unprecedented growth potential in emerging markets, with 67% projected increase in addressable market size over 24-month horizon...',
      source: 'strategic-analysis-2024.pdf',
      page: 23,
      score: 97,
      category: 'Strategic Insight',
      impact: 'High',
      relevance: 98
    },
    {
      id: 2,
      rank: 2,
      title: 'Competitive Positioning Matrix',
      snippet: 'Comprehensive benchmarking demonstrates superior value proposition across 12 key performance indicators, positioning for market leadership...',
      source: 'competitive-landscape.pdf',
      page: 15,
      score: 94,
      category: 'Market Analysis',
      impact: 'High',
      relevance: 96
    },
    {
      id: 3,
      rank: 3,
      title: 'Revenue Optimization Framework',
      snippet: 'Data-driven revenue model optimization yields 34% efficiency improvement through strategic pricing architecture and customer lifecycle management...',
      source: 'financial-projections.pdf',
      page: 41,
      score: 92,
      category: 'Financial Strategy',
      impact: 'Medium',
      relevance: 94
    },
  ], []);

  // Sophisticated filtering with performance optimization
  const filteredFiles = useMemo(() => 
    files.filter(file =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.category.toLowerCase().includes(searchTerm.toLowerCase())
    ), [files, searchTerm]
  );

  // Premium interaction handlers with micro-animations
  const handleFileSelection = useCallback((file) => {
    setSelectedFile(file);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // Elite animation configurations following design system
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 1.0, 
        ease: [0.25, 0.46, 0.45, 0.94],
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      ref={containerRef}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-[#FAFAF9] to-[#F3F4F6]"
    >
      {/* PREMIUM GLOBAL HEADER - Mathematical spacing with golden ratio */}
      <motion.header 
        variants={itemVariants}
        className="bg-white/90 backdrop-blur-sm shadow-xl border-b border-white/20 sticky top-0 z-50 rounded-xl"
      >
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Hero headline with sophisticated typography hierarchy */}
            <div className="space-y-1">
              <motion.h1
                className="text-[2.75rem] leading-[3.2rem] xl:text-[2.5rem] xl:leading-[rem] font-black text-[#1A1A1A] tracking-tight"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                Intelligence
                <span className="text-[#DC2626] ml-3">Dashboard</span>
              </motion.h1>
              <motion.p 
                className="text-[1.1rem] leading-[1.8rem] font-light text-[#1A1A1A] opacity-60 max-w-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Cross-document synthesis & strategic insights
              </motion.p>
            </div>

            {/* Premium action button with gradient and micro-interactions */}
            <motion.button 
              className="group relative overflow-hidden bg-gradient-to-r from-[#DC2626] to-[#B91C1C] text-white px-8 py-4 rounded-2xl font-semibold text-[0.95rem] leading-[1.2rem] tracking-wide shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10 flex items-center space-x-2">
                <Sparkles className="w-[1.1rem] h-[1.1rem]" />
                <span>New Analysis</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#B91C1C] to-[#DC2626] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div className="max-w-7xl mx-auto px- py-12 flex gap-10 relative">
        {/* LEFT: Document List (30%) */}
        <motion.div
          variants={itemVariants}
          className="w-full max-w-[30%] flex-shrink-0 flex flex-col space-y-8"
        >
          {/* Glass morphism search interface */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
            <div className="space-y-6">
              <div>
                <h2 className="text-[1.75rem] leading-[2.2rem] font-light text-[#1A1A1A] mb-3 tracking-wide">
                  Document Index
                </h2>
                <p className="text-[0.82rem] leading-[1.1rem] text-[#1A1A1A] opacity-60 font-medium">
                  {filteredFiles.length} analyzed documents
                </p>
              </div>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-[1.1rem] h-[1.1rem] text-[#1A1A1A] opacity-40 group-focus-within:opacity-70 transition-opacity duration-300" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-12 pr-4 py-4 bg-[#FAFAF9] border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#DC2626] focus:border-transparent transition-all duration-300 text-[0.92rem] leading-[1.2rem] text-[#1A1A1A] placeholder-[#1A1A1A] placeholder-opacity-40 font-medium"
                />
              </div>
            </div>
          </div>
          {/* File list, scrollable if many */}
          <div className="space-y-4 flex-1 overflow-y-auto min-h-0">
            <AnimatePresence mode="popLayout">
              {filteredFiles.map((file, index) => (
                <motion.div
                  key={file.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`group cursor-pointer bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] ${
                    selectedFile?.id === file.id
                      ? 'border-[#DC2626] ring-2 ring-[#DC2626]/20 bg-gradient-to-br from-white to-[#DC2626]/5'
                      : 'border-white/20 hover:border-[#DC2626]/30'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl ${
                      selectedFile?.id === file.id 
                        ? 'bg-[#DC2626] text-white' 
                        : 'bg-[#E5E7EB] text-[#1A1A1A] group-hover:bg-[#DC2626] group-hover:text-white'
                    } transition-all duration-300`}>
                      <file.icon className="w-[1.35rem] h-[1.35rem]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[0.95rem] leading-[1.25rem] text-[#1A1A1A] truncate mb-2 tracking-wide">
                        {file.name}
                      </h3>
                      <div className="flex items-center justify-between text-[0.72rem] leading-[0.95rem] text-[#1A1A1A] opacity-60 font-medium">
                        <span>{file.size}</span>
                        <span>{file.pages} pages</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[0.68rem] leading-[0.9rem] bg-[#059669]/10 text-[#059669] px-2 py-1 rounded-lg font-semibold tracking-wide">
                          {file.category}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Star className="w-[0.75rem] h-[0.75rem] text-[#DC2626]" />
                          <span className="text-[0.72rem] leading-[0.95rem] font-bold text-[#1A1A1A]">{file.confidence}%</span>
                        </div>
                      </div>
                    </div>
                    {/* Eye button for PDF preview */}
                    <button
                      onClick={()=>setFileToPreview(file)}
                      className="ml-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                      aria-label={`Preview ${file.name}`}
                    >
                      <Eye className="w-5 h-5 text-[#1A1A1A] opacity-60 hover:opacity-100" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        {/* PDF Preview Modal - Premium implementation */}
        {fileToPreview && (
        <PdfViewerModal
          file={fileToPreview}
          onClose={() => setFileToPreview(null)}
        />
        )}
        </motion.div>

        {/* RIGHT: Intelligence Ranking (70%) */}
        <div className="w-full max-w-[70%] flex flex-col gap-8">
          {/* Intelligence Ranking Grid */}
          <motion.div
            variants={itemVariants}
            className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-[1.75rem] leading-[2.2rem] font-light text-[#1A1A1A] mb-3 tracking-wide">
                  Intelligence Ranking
                </h2>
                <p className="text-[0.82rem] leading-[1.1rem] text-[#1A1A1A] opacity-60 font-medium">
                  Relevance-scored insights
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-[1.1rem] h-[1.1rem] text-[#1A1A1A] opacity-40" />
                <ChevronDown className="w-[0.9rem] h-[0.9rem] text-[#1A1A1A] opacity-40" />
              </div>
            </div>
            {/* 2x2 grid, scrollable if >4 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[32rem] overflow-y-auto pb-2">
              <AnimatePresence>
                {rankedSections.map((section, index) => (
                  <motion.div
                    key={section.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }}
                    className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedSection(section)}
                  >
                    {/* Rank indicator with premium styling */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-[2.5rem] h-[2.5rem] bg-gradient-to-r from-[#DC2626] to-[#B91C1C] rounded-xl flex items-center justify-center text-white font-black text-[1.1rem] shadow-lg">
                            {section.rank}
                          </div>
                          <div className="absolute -top-1 -right-1 w-[0.75rem] h-[0.75rem] bg-[#059669] rounded-full border-2 border-white" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[0.68rem] leading-[0.9rem] font-bold text-[#DC2626] bg-[#DC2626]/10 px-2 py-1 rounded-lg tracking-wide">
                              Score: {section.score}
                            </span>
                            <span className="text-[0.72rem] leading-[0.95rem] text-[#1A1A1A] opacity-60 font-medium">
                              {section.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      <TrendingUp className="w-[1.1rem] h-[1.1rem] text-[#059669] opacity-60" />
                    </div>
                    {/* Content with refined typography */}
                    <h4 className="text-[1.15rem] leading-[1.5rem] font-semibold text-[#1A1A1A] mb-3 group-hover:text-[#DC2626] transition-colors duration-200 tracking-wide">
                      {section.title}
                    </h4>
                    <p className="text-[0.85rem] leading-[1.3rem] text-[#1A1A1A] opacity-70 mb-4 font-medium">
                      "{section.snippet}"
                    </p>
                    {/* Metadata with sophisticated layout */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-[0.6rem] leading-[0.9rem] text-[#1A1A1A] opacity-60 font-medium">
                        <div className="flex items-center space-x-1">
                          <BookOpen className="w-[0.75rem] h-[0.75rem]" />
                          <span>{section.source}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-[0.75rem] h-[0.75rem]" />
                          <span>pg. {section.page}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`px-2 py-1 rounded-lg text-[0.68rem] leading-[0.9rem] font-bold tracking-wide ${
                          section.impact === 'High' 
                            ? 'bg-[#DC2626]/10 text-[#DC2626]' 
                            : 'bg-[#059669]/10 text-[#059669]'
                        }`}>
                          {section.impact} Impact
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
        {/* Section Details Modal */}
        <AnimatePresence>
        {selectedSection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedSection(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-10 relative"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 transition-colors"
                onClick={() => setSelectedSection(null)}
                aria-label="Close details"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#DC2626]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <div className="mb-6 flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#DC2626] to-[#B91C1C] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">
                  {selectedSection.rank}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#1A1A1A] mb-1">{selectedSection.title}</h2>
                  <div className="flex items-center space-x-2 text-sm text-[#1A1A1A] opacity-60">
                    <span>{selectedSection.category}</span>
                    <span>•</span>
                    <span>Score: {selectedSection.score}</span>
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <p className="text-base text-[#1A1A1A] opacity-80 font-medium mb-2">{selectedSection.snippet}</p>
                <div className="flex items-center space-x-4 text-sm text-[#1A1A1A] opacity-60">
                  <div className="flex items-center space-x-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{selectedSection.source}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>pg. {selectedSection.page}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-4">
                <div className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wide ${
                  selectedSection.impact === 'High'
                    ? 'bg-[#DC2626]/10 text-[#DC2626]'
                    : 'bg-[#059669]/10 text-[#059669]'
                }`}>
                  {selectedSection.impact} Impact
                </div>
                <div className="px-3 py-1 rounded-lg text-xs font-bold tracking-wide bg-[#1A1A1A]/10 text-[#1A1A1A]">
                  Relevance: {selectedSection.relevance}%
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>
              </AnimatePresence>
            </div>
            {/* Load more with premium styling */}
        {/* Toggle Button for Advanced Insights */}
            <motion.div
              className="text-center py-6"
              whileHover={{ scale: 1.02 }}
            >
              <button
                onClick={() => setShowAdvancedInsights(prevState => !prevState)}
                className="inline-flex items-center space-x-2 text-[#DC2626] hover:text-[#B91C1C] font-semibold text-[0.85rem] leading-[1.15rem] transition-colors duration-200 group tracking-wide"
              >
                {/* Dynamically render the icon */}
                {showAdvancedInsights ? (
                  <ChevronUp className="w-[0.9rem] h-[0.9rem] transition-transform duration-200" />
                ) : (
                  <ChevronDown className="w-[0.9rem] h-[0.9rem] transition-transform duration-200" />
                )}

                {/* Dynamically render the text */}
                <span>
                  {showAdvancedInsights ? 'Hide Advanced Insights' : 'Show Advanced Insights'}
                </span>
              </button>
            </motion.div>
          </motion.div>
          {/* Cross-Document Synthesis Section */}
          {showAdvancedInsights && (

          <motion.div 
            variants={itemVariants}
            transition={{duration:0.5 , ease:'easeInOut'}}
            className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 mt-8"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-[1.75rem] leading-[2.2rem] font-light text-[#1A1A1A] mb-3 tracking-wide">
                  Cross-Document Synthesis
                </h2>
                <p className="text-[0.82rem] leading-[1.1rem] text-[#1A1A1A] opacity-60 font-medium">
                  AI-powered intelligence extraction
                </p>
              </div>
              <Coffee className="w-[2rem] h-[2rem] text-[#DC2626] opacity-60" />
            </div>
            {/* Four premium insight boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Key Insights */}
              <motion.div
                className="cursor-pointer bg-gradient-to-br from-[#DC2626]/5 to-[#DC2626]/10 rounded-2xl p-8 border-l-4 border-[#DC2626] shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex flex-col"
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedInsightBox('keyInsights')}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-[#DC2626]/10 rounded-xl">
                    <Lightbulb className="w-7 h-7 text-[#DC2626]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1A1A1A] tracking-wide">Key Insights</h3>
                </div>
                <p className="text-base text-[#1A1A1A] opacity-70 font-medium">Discover the most important findings and actionable intelligence across your documents.</p>
              </motion.div>
              {/* Did You Know? Facts */}
              <motion.div
                className="cursor-pointer bg-gradient-to-br from-[#059669]/5 to-emerald-50 rounded-2xl p-8 border-l-4 border-[#059669] shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex flex-col"
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedInsightBox('didYouKnow')}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-[#059669]/10 rounded-xl">
                    <Sparkles className="w-7 h-7 text-[#059669]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1A1A1A] tracking-wide">Did You Know? Facts</h3>
                </div>
                <p className="text-base text-[#1A1A1A] opacity-70 font-medium">Uncover surprising facts and lesser-known details extracted from your documents.</p>
              </motion.div>
              {/* Contradictions/Counterpoints */}
              <motion.div
                className="cursor-pointer bg-gradient-to-br from-[#DC2626]/5 to-orange-50 rounded-2xl p-8 border-l-4 border-[#DC2626] shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex flex-col"
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedInsightBox('contradictions')}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-[#DC2626]/10 rounded-xl">
                    <AlertTriangle className="w-7 h-7 text-[#DC2626]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1A1A1A] tracking-wide">Contradictions / Counterpoints</h3>
                </div>
                <p className="text-base text-[#1A1A1A] opacity-70 font-medium">Identify conflicting information or alternative perspectives across your sources.</p>
              </motion.div>
              {/* Inspiration/Connections */}
              <motion.div
                className="cursor-pointer bg-gradient-to-br from-[#6366F1]/5 to-indigo-50 rounded-2xl p-8 border-l-4 border-[#6366F1] shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex flex-col"
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedInsightBox('inspiration')}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-[#6366F1]/10 rounded-xl">
                    <BookOpen className="w-7 h-7 text-[#6366F1]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1A1A1A] tracking-wide">Inspiration / Connections</h3>
                </div>
                <p className="text-base text-[#1A1A1A] opacity-70 font-medium">See creative links, patterns, or inspirations that span multiple documents.</p>
              </motion.div>
            </div>
          </motion.div>
          )}
        </div>
            {/* Enhanced Fullscreen Modal for Insight Box - Premium, immersive experience */}
            <AnimatePresence>
              {selectedInsightBox && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                  onClick={() => setSelectedInsightBox(null)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 30 }}
                    transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="relative w-full max-w-7xl h-[90vh] flex flex-col bg-white/98 rounded-3xl shadow-2xl overflow-hidden"
                    onClick={e => e.stopPropagation()}
                  >
                    {/* Enhanced Top Navigation Bar - Sticky */}
                    <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-6 border-b border-[#E5E7EB]/40 bg-gradient-to-r from-[#FAFAF9] via-white to-[#F8FAFC] backdrop-blur-sm shadow-sm rounded-t-3xl">
                      <div className="flex items-center space-x-6">
                        <motion.div 
                          className="p-3 rounded-xl shadow-lg"
                          style={{
                            background: selectedInsightBox === 'keyInsights' ? 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)' :
                                       selectedInsightBox === 'didYouKnow' ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' :
                                       selectedInsightBox === 'contradictions' ? 'linear-gradient(135deg, #DC2626 0%, #EA580C 100%)' :
                                       'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)'
                          }}
                          whileHover={{ scale: 1.05 }}
                        >
                          {selectedInsightBox === 'keyInsights' && <Lightbulb className="w-8 h-8 text-white" />}
                          {selectedInsightBox === 'didYouKnow' && <Sparkles className="w-8 h-8 text-white" />}
                          {selectedInsightBox === 'contradictions' && <AlertTriangle className="w-8 h-8 text-white" />}
                          {selectedInsightBox === 'inspiration' && <BookOpen className="w-8 h-8 text-white" />}
                        </motion.div>
                        <div>
                          <h2 className="text-2xl md:text-3xl font-black text-[#1A1A1A] tracking-tight mb-1">
                            {selectedInsightBox === 'keyInsights' && 'Strategic Key Insights'}
                            {selectedInsightBox === 'didYouKnow' && 'Discovery & Intelligence Facts'}
                            {selectedInsightBox === 'contradictions' && 'Critical Contradictions & Counterpoints'}
                            {selectedInsightBox === 'inspiration' && 'Cross-Document Inspirations & Connections'}
                          </h2>
                          <p className="text-base text-[#1A1A1A] opacity-60 font-medium">
                            {selectedInsightBox === 'keyInsights' && 'AI-powered strategic intelligence extraction'}
                            {selectedInsightBox === 'didYouKnow' && 'Surprising insights from document synthesis'}
                            {selectedInsightBox === 'contradictions' && 'Conflicting information requiring attention'}
                            {selectedInsightBox === 'inspiration' && 'Creative patterns across your document corpus'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <motion.button
                          className="p-2 rounded-lg bg-[#059669]/10 text-[#059669] hover:bg-[#059669]/20 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Download className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          onClick={() => setSelectedInsightBox(null)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          aria-label="Close details"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#DC2626]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </motion.button>
                      </div>
                    </div>

                    {/* Enhanced Modal Content - Rich, detailed insights */}
                    <div className="flex-1 px-8 py-8 bg-gradient-to-b from-white to-[#FAFAF9] overflow-y-auto">
                      {selectedInsightBox === 'keyInsights' && (
                        <div className="space-y-12">
                          {/* Executive Summary */}
                          <motion.div 
                            className="bg-gradient-to-r from-[#DC2626]/5 to-[#DC2626]/10 rounded-3xl p-8 border-l-4 border-[#DC2626]"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                          >
                            <h3 className="text-2xl font-bold text-[#1A1A1A] mb-4 flex items-center space-x-3">
                              <TrendingUp className="w-6 h-6 text-[#DC2626]" />
                              <span>Executive Summary</span>
                            </h3>
                            <p className="text-lg text-[#1A1A1A] opacity-80 font-medium leading-relaxed">
                              Cross-document analysis reveals <span className="font-bold text-[#DC2626]">unprecedented strategic opportunities</span> with measurable impact across market expansion, competitive positioning, and revenue optimization frameworks.
                            </p>
                          </motion.div>

                          {/* Detailed Insights */}
                          <motion.div 
                            className="space-y-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <h3 className="text-2xl font-bold text-[#1A1A1A] mb-6">Strategic Intelligence Findings</h3>
                            <div className="grid gap-8">
                              {[
                                {
                                  title: "Market Expansion Opportunity",
                                  metric: "67% growth potential",
                                  description: "Emerging markets analysis demonstrates unprecedented expansion opportunities with minimal competitive saturation and high customer acquisition potential.",
                                  reference: "strategic-analysis-2024.pdf, pages 23-27",
                                  impact: "High",
                                  confidence: "96%"
                                },
                                {
                                  title: "Competitive Advantage Matrix",
                                  metric: "12 KPI superiority",
                                  description: "Comprehensive benchmarking reveals superior positioning across critical performance indicators including market share, customer satisfaction, and operational efficiency.",
                                  reference: "competitive-landscape.pdf, pages 15-19",
                                  impact: "High",
                                  confidence: "94%"
                                },
                                {
                                  title: "Revenue Optimization Framework",
                                  metric: "34% efficiency improvement",
                                  description: "Data-driven revenue model optimization through strategic pricing architecture and enhanced customer lifecycle management protocols.",
                                  reference: "financial-projections.pdf, pages 41-45",
                                  impact: "Medium",
                                  confidence: "92%"
                                }
                              ].map((insight, idx) => (
                                <motion.div
                                  key={idx}
                                  className="bg-white rounded-2xl p-8 shadow-lg border border-[#E5E7EB]/30 hover:shadow-xl transition-shadow duration-300"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.3 + idx * 0.1 }}
                                >
                                  <div className="flex items-start justify-between mb-4">
                                    <h4 className="text-xl font-bold text-[#1A1A1A]">{insight.title}</h4>
                                    <div className="flex items-center space-x-2">
                                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                        insight.impact === 'High' 
                                          ? 'bg-[#DC2626]/10 text-[#DC2626]' 
                                          : 'bg-[#059669]/10 text-[#059669]'
                                      }`}>
                                        {insight.impact} Impact
                                      </span>
                                      <span className="px-3 py-1 rounded-lg text-xs font-bold bg-[#6366F1]/10 text-[#6366F1]">
                                        {insight.confidence}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="mb-4">
                                    <span className="text-3xl font-black text-[#DC2626] mr-3">{insight.metric}</span>
                                  </div>
                                  <p className="text-base text-[#1A1A1A] opacity-80 mb-4 leading-relaxed">{insight.description}</p>
                                  <div className="flex items-center text-sm text-[#1A1A1A] opacity-60">
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    <span>{insight.reference}</span>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>

                          {/* AI Analysis Context */}
                          <motion.div 
                            className="bg-gradient-to-r from-[#6366F1]/5 to-[#6366F1]/10 rounded-2xl p-6 border-l-4 border-[#6366F1]"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                          >
                            <div className="flex items-center space-x-3 mb-3">
                              <Zap className="w-5 h-5 text-[#6366F1]" />
                              <span className="font-bold text-[#1A1A1A]">AI Analysis Methodology</span>
                            </div>
                            <p className="text-sm text-[#1A1A1A] opacity-70 leading-relaxed">
                              These insights are synthesized using advanced natural language processing, cross-document correlation analysis, and strategic pattern recognition across your entire document corpus. Confidence scores reflect data quality and cross-reference validation.
                            </p>
                          </motion.div>
                        </div>
                      )}

                      {selectedInsightBox === 'didYouKnow' && (
                        <div className="space-y-12">
                          {/* Fun Stats Header */}
                          <motion.div 
                            className="text-center space-y-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                          >
                            <h3 className="text-3xl font-black text-[#059669]">Fascinating Document Intelligence</h3>
                            <p className="text-lg text-[#1A1A1A] opacity-70 max-w-3xl mx-auto">
                              Surprising patterns and hidden insights discovered through AI-powered document analysis
                            </p>
                          </motion.div>

                          {/* Discovery Cards */}
                          <div className="grid md:grid-cols-2 gap-8">
                            {[
                              {
                                icon: <FileText className="w-8 h-8 text-[#059669]" />,
                                stat: "47 pages",
                                title: "Average Document Length",
                                description: "Your strategic documents contain comprehensive analysis with an average of 47 pages per document, indicating thorough research and detailed strategic planning.",
                                insight: "Documents with 40+ pages show 23% higher strategic value correlation."
                              },
                              {
                                icon: <TrendingUp className="w-8 h-8 text-[#059669]" />,
                                stat: "12 KPIs",
                                title: "Unique Performance Indicators",
                                description: "AI detected 12 distinct Key Performance Indicators across all documents, creating a comprehensive performance measurement framework.",
                                insight: "Organizations tracking 10+ KPIs demonstrate 31% better strategic outcomes."
                              },
                              {
                                icon: <Sparkles className="w-8 h-8 text-[#059669]" />,
                                stat: "67%",
                                title: "Growth Projection Consensus",
                                description: "Multiple documents independently project 67% growth in emerging markets over the next 24 months, indicating strong market validation.",
                                insight: "Consensus projections have 89% historical accuracy in strategic planning."
                              },
                              {
                                icon: <AlertTriangle className="w-8 h-8 text-[#059669]" />,
                                stat: "3 conflicts",
                                title: "Data Discrepancies Found",
                                description: "AI identified 3 significant data conflicts between documents, highlighting areas requiring further investigation and validation.",
                                insight: "Early conflict detection prevents 73% of strategic planning errors."
                              }
                            ].map((fact, idx) => (
                              <motion.div
                                key={idx}
                                className="bg-white rounded-2xl p-8 shadow-lg border border-[#E5E7EB]/30 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 + idx * 0.1 }}
                              >
                                <div className="flex items-center space-x-4 mb-6">
                                  <div className="p-3 bg-[#059669]/10 rounded-xl">
                                    {fact.icon}
                                  </div>
                                  <div>
                                    <div className="text-4xl font-black text-[#059669] mb-1">{fact.stat}</div>
                                    <div className="text-lg font-bold text-[#1A1A1A]">{fact.title}</div>
                                  </div>
                                </div>
                                <p className="text-base text-[#1A1A1A] opacity-80 mb-4 leading-relaxed">{fact.description}</p>
                                <div className="bg-[#059669]/5 rounded-xl p-4 border-l-4 border-[#059669]">
                                  <p className="text-sm text-[#1A1A1A] opacity-70 font-medium">
                                    <span className="font-bold text-[#059669]">Pro Insight:</span> {fact.insight}
                                  </p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedInsightBox === 'contradictions' && (
                        <div className="space-y-12">
                          {/* Alert Header */}
                          <motion.div 
                            className="bg-gradient-to-r from-[#DC2626]/10 to-orange-50 rounded-2xl p-8 border-l-4 border-[#DC2626]"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                          >
                            <div className="flex items-center space-x-4 mb-4">
                              <AlertTriangle className="w-8 h-8 text-[#DC2626]" />
                              <h3 className="text-2xl font-bold text-[#1A1A1A]">Critical Analysis Required</h3>
                            </div>
                            <p className="text-lg text-[#1A1A1A] opacity-80">
                              AI has identified significant contradictions between your documents that require immediate attention and reconciliation.
                            </p>
                          </motion.div>

                          {/* Contradiction Analysis */}
                          <div className="space-y-8">
                            {[
                              {
                                title: "Market Share Data Discrepancy",
                                severity: "High",
                                documents: ["strategic-analysis-2024.pdf", "competitive-landscape.pdf"],
                                pages: ["pg. 23", "pg. 15"],
                                description: "Strategic analysis reports 34% market share while competitive landscape document indicates 28% market share for the same time period and market segment.",
                                impact: "This 6-point discrepancy could significantly affect strategic planning and resource allocation decisions.",
                                recommendation: "Verify data sources and reconcile methodological differences between reports."
                              },
                              {
                                title: "Revenue Projection Variance",
                                severity: "Medium",
                                documents: ["financial-projections.pdf", "strategic-analysis-2024.pdf"],
                                pages: ["pg. 41", "pg. 31"],
                                description: "Financial projections show 15% variance in revenue forecasts compared to strategic analysis assumptions.",
                                impact: "This variance could affect budget planning and investment decisions for the next fiscal year.",
                                recommendation: "Align forecasting models and validate underlying assumptions across documents."
                              },
                              {
                                title: "Customer Acquisition Cost Conflict",
                                severity: "Medium",
                                documents: ["competitive-landscape.pdf", "financial-projections.pdf"],
                                pages: ["pg. 22", "pg. 18"],
                                description: "Customer acquisition costs differ by $47 per customer between competitive analysis and financial modeling.",
                                impact: "Inconsistent CAC data affects marketing budget allocation and ROI calculations.",
                                recommendation: "Standardize CAC calculation methodology across all strategic documents."
                              }
                            ].map((conflict, idx) => (
                              <motion.div
                                key={idx}
                                className="bg-white rounded-2xl p-8 shadow-lg border border-[#DC2626]/20"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + idx * 0.1 }}
                              >
                                <div className="flex items-start justify-between mb-6">
                                  <h4 className="text-xl font-bold text-[#1A1A1A]">{conflict.title}</h4>
                                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                    conflict.severity === 'High' 
                                      ? 'bg-[#DC2626]/10 text-[#DC2626]' 
                                      : 'bg-orange-100 text-orange-800'
                                  }`}>
                                    {conflict.severity} Severity
                                  </span>
                                </div>
                                
                                <div className="grid md:grid-cols-2 gap-6 mb-6">
                                  <div>
                                    <h5 className="font-semibold text-[#1A1A1A] mb-2">Conflicting Sources</h5>
                                    <div className="space-y-2">
                                      {conflict.documents.map((doc, docIdx) => (
                                        <div key={docIdx} className="flex items-center space-x-2 text-sm text-[#1A1A1A] opacity-70">
                                          <BookOpen className="w-4 h-4" />
                                          <span>{doc}</span>
                                          <span className="text-[#DC2626]">({conflict.pages[docIdx]})</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <h5 className="font-semibold text-[#1A1A1A] mb-2">Business Impact</h5>
                                    <p className="text-sm text-[#1A1A1A] opacity-70">{conflict.impact}</p>
                                  </div>
                                </div>

                                <div className="bg-[#DC2626]/5 rounded-xl p-4 mb-4">
                                  <p className="text-base text-[#1A1A1A] opacity-80">{conflict.description}</p>
                                </div>

                                <div className="bg-[#059669]/5 rounded-xl p-4 border-l-4 border-[#059669]">
                                  <h6 className="font-semibold text-[#059669] mb-2">Recommended Action</h6>
                                  <p className="text-sm text-[#1A1A1A] opacity-70">{conflict.recommendation}</p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedInsightBox === 'inspiration' && (
                        <div className="space-y-12">
                          {/* Creative Header */}
                          <motion.div 
                            className="text-center space-y-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                          >
                            <div className="flex items-center justify-center space-x-4">
                              <BookOpen className="w-12 h-12 text-[#6366F1]" />
                              <h3 className="text-3xl font-black text-[#6366F1]">Creative Intelligence Synthesis</h3>
                            </div>
                            <p className="text-lg text-[#1A1A1A] opacity-70 max-w-4xl mx-auto leading-relaxed">
                              AI has discovered fascinating patterns, connections, and inspirational insights that span across your documents, revealing hidden opportunities for innovation and strategic advancement.
                            </p>
                          </motion.div>

                          {/* Connection Map */}
                          <div className="space-y-10">
                            {[
                              {
                                title: "Market-Finance Strategic Fusion",
                                connection: "competitive-landscape.pdf ↔ financial-projections.pdf",
                                insight: "Customer lifecycle management patterns directly correlate with revenue optimization opportunities",
                                description: "Analysis reveals that companies with sophisticated customer lifecycle frameworks achieve 31% higher revenue per customer. Your documents show untapped potential in applying competitive intelligence to financial modeling.",
                                inspiration: "Consider developing a unified customer-revenue intelligence platform that merges competitive insights with financial projections.",
                                potential: "23% revenue optimization potential identified"
                              },
                              {
                                title: "Strategic Positioning Innovation",
                                connection: "strategic-analysis-2024.pdf ↔ competitive-landscape.pdf",
                                insight: "Market expansion strategies align perfectly with competitive differentiation opportunities",
                                description: "Cross-document analysis reveals that emerging market opportunities complement your competitive advantages in ways that create unique market positioning possibilities.",
                                inspiration: "Develop a 'Blue Ocean' strategy that leverages your competitive strengths in unexplored market segments.",
                                potential: "67% market expansion opportunity"
                              },
                              {
                                title: "Operational Excellence Convergence",
                                connection: "All Documents",
                                insight: "Efficiency patterns emerge across strategy, competition, and finance creating holistic optimization blueprint",
                                description: "AI identified recurring themes of operational excellence that, when combined, suggest a comprehensive transformation framework affecting all business dimensions.",
                                inspiration: "Create an integrated excellence program that addresses strategic, competitive, and financial efficiency simultaneously.",
                                potential: "34% overall efficiency improvement"
                              }
                            ].map((connection, idx) => (
                              <motion.div
                                key={idx}
                                className="bg-gradient-to-br from-white to-[#6366F1]/5 rounded-3xl p-10 shadow-xl border border-[#6366F1]/20"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 + idx * 0.15 }}
                              >
                                <div className="flex items-start justify-between mb-6">
                                  <h4 className="text-2xl font-bold text-[#1A1A1A]">{connection.title}</h4>
                                  <div className="px-4 py-2 bg-[#6366F1]/10 rounded-xl">
                                    <span className="text-sm font-bold text-[#6366F1]">{connection.potential}</span>
                                  </div>
                                </div>

                                <div className="mb-6">
                                  <div className="flex items-center space-x-3 mb-3">
                                    <Sparkles className="w-5 h-5 text-[#6366F1]" />
                                    <span className="font-semibold text-[#1A1A1A]">Connection Pattern</span>
                                  </div>
                                  <p className="text-sm text-[#1A1A1A] opacity-60 font-mono bg-[#6366F1]/5 rounded-lg px-4 py-2">
                                    {connection.connection}
                                  </p>
                                </div>

                                <div className="mb-6">
                                  <h5 className="font-bold text-[#6366F1] text-lg mb-3">{connection.insight}</h5>
                                  <p className="text-base text-[#1A1A1A] opacity-80 leading-relaxed">{connection.description}</p>
                                </div>

                                <div className="bg-gradient-to-r from-[#6366F1]/10 to-[#6366F1]/5 rounded-2xl p-6 border-l-4 border-[#6366F1]">
                                  <div className="flex items-center space-x-3 mb-3">
                                    <Lightbulb className="w-5 h-5 text-[#6366F1]" />
                                    <span className="font-bold text-[#6366F1]">Strategic Inspiration</span>
                                  </div>
                                  <p className="text-base text-[#1A1A1A] opacity-80 leading-relaxed">{connection.inspiration}</p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
      </div>

    </motion.div>
  );
};

export default ProjectAnalysisDashboard;