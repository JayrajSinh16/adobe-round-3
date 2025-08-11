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
      <div className="max-w-7xl mx-auto px- py-12 flex gap-10">
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
                      onClick={e => {
                        e.stopPropagation();
                        setFileToPreview(file);
                      }}
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
            <motion.div 
              className="text-center py-6"
              whileHover={{ scale: 1.02 }}
            >
              <button className="inline-flex items-center space-x-2 text-[#DC2626] hover:text-[#B91C1C] font-semibold text-[0.85rem] leading-[1.15rem] transition-colors duration-200 group tracking-wide">
                <Zap className="w-[0.9rem] h-[0.9rem] group-hover:scale-110 transition-transform duration-200" />
                <span>Load Advanced Insights</span>
              </button>
            </motion.div>
          </motion.div>
          {/* Cross-Document Synthesis Section */}
          <motion.div 
            variants={itemVariants}
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

            {/* Fullscreen Modal for Insight Box - Innovative, immersive, with bullet points and references */}
            <AnimatePresence>
              {selectedInsightBox && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-[#1A1A1A]/90 to-[#DC2626]/80 backdrop-blur-2xl"
                  onClick={() => setSelectedInsightBox(null)}
                >
                  <motion.div
                    initial={{ scale: 0.98, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.98, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="relative w-full max-w-4xl mx-auto rounded-3xl shadow-2xl bg-white/95 p-0 overflow-hidden"
                    onClick={e => e.stopPropagation()}
                  >
                    {/* Top bar with close and title */}
                    <div className="flex items-center justify-between px-10 py-7 border-b border-[#E5E7EB]/60 bg-gradient-to-r from-[#FAFAF9] to-[#F3F4F6]">
                      <div className="flex items-center space-x-4">
                        {selectedInsightBox === 'keyInsights' && <Lightbulb className="w-8 h-8 text-[#DC2626]" />}
                        {selectedInsightBox === 'didYouKnow' && <Sparkles className="w-8 h-8 text-[#059669]" />}
                        {selectedInsightBox === 'contradictions' && <AlertTriangle className="w-8 h-8 text-[#DC2626]" />}
                        {selectedInsightBox === 'inspiration' && <BookOpen className="w-8 h-8 text-[#6366F1]" />}
                        <h2 className="text-2xl md:text-3xl font-black text-[#1A1A1A] tracking-tight">
                          {selectedInsightBox === 'keyInsights' && 'Key Insights'}
                          {selectedInsightBox === 'didYouKnow' && 'Did You Know? Facts'}
                          {selectedInsightBox === 'contradictions' && 'Contradictions / Counterpoints'}
                          {selectedInsightBox === 'inspiration' && 'Inspiration / Connections'}
                        </h2>
                      </div>
                      <button
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        onClick={() => setSelectedInsightBox(null)}
                        aria-label="Close details"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#DC2626]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    {/* Modal Content by box type - innovative, with bullet points and references */}
                    <div className="px-10 py-10 md:py-14 bg-white/95">
                      {selectedInsightBox === 'keyInsights' && (
                        <>
                          <ul className="list-disc pl-6 space-y-4 text-lg text-[#1A1A1A] font-medium">
                            <li>Market expansion opportunities demonstrate <span className="font-bold text-[#DC2626]">67% growth potential</span> in emerging segments. <span className="text-xs text-[#1A1A1A]/60">[Ref: strategic-analysis-2024.pdf, pg. 23]</span></li>
                            <li>Competitive positioning analysis reveals <span className="font-bold text-[#DC2626]">superior value proposition</span> across 12 KPIs. <span className="text-xs text-[#1A1A1A]/60">[Ref: competitive-landscape.pdf, pg. 15]</span></li>
                            <li>Revenue optimization framework yields <span className="font-bold text-[#DC2626]">34% efficiency improvement</span> potential. <span className="text-xs text-[#1A1A1A]/60">[Ref: financial-projections.pdf, pg. 41]</span></li>
                          </ul>
                          <div className="mt-8 text-sm text-[#1A1A1A] opacity-70">
                            <span className="font-semibold">Context:</span> These insights are synthesized from cross-document analysis using AI-powered extraction and benchmarking.
                          </div>
                        </>
                      )}
                      {selectedInsightBox === 'didYouKnow' && (
                        <>
                          <ul className="list-disc pl-6 space-y-4 text-lg text-[#1A1A1A] font-medium">
                            <li>The average document contains <span className="font-bold text-[#059669]">47 pages</span> of strategic analysis. <span className="text-xs text-[#1A1A1A]/60">[Ref: All uploaded files]</span></li>
                            <li>AI detected <span className="font-bold text-[#059669]">12 unique KPIs</span> across all uploaded files. <span className="text-xs text-[#1A1A1A]/60">[Ref: AI Extraction]</span></li>
                            <li>Emerging markets are projected to grow <span className="font-bold text-[#059669]">67%</span> in the next 24 months. <span className="text-xs text-[#1A1A1A]/60">[Ref: strategic-analysis-2024.pdf]</span></li>
                          </ul>
                          <div className="mt-8 text-sm text-[#1A1A1A] opacity-70">
                            <span className="font-semibold">Fun Fact:</span> These facts are surfaced by advanced pattern recognition and document synthesis.
                          </div>
                        </>
                      )}
                      {selectedInsightBox === 'contradictions' && (
                        <>
                          <ul className="list-disc pl-6 space-y-4 text-lg text-[#1A1A1A] font-medium">
                            <li>Strategic analysis and competitive landscape documents show <span className="font-bold text-[#DC2626]">conflicting market share data</span> requiring reconciliation. <span className="text-xs text-[#1A1A1A]/60">[Ref: strategic-analysis-2024.pdf vs. competitive-landscape.pdf]</span></li>
                            <li>Revenue projections differ by up to <span className="font-bold text-[#DC2626]">15%</span> between sources. <span className="text-xs text-[#1A1A1A]/60">[Ref: financial-projections.pdf, pg. 41]</span></li>
                          </ul>
                          <div className="mt-8 text-sm text-[#1A1A1A] opacity-70">
                            <span className="font-semibold">Counterpoint:</span> Contradictions highlight the need for deeper investigation and source triangulation.
                          </div>
                        </>
                      )}
                      {selectedInsightBox === 'inspiration' && (
                        <>
                          <ul className="list-disc pl-6 space-y-4 text-lg text-[#1A1A1A] font-medium">
                            <li>Cross-document synthesis reveals <span className="font-bold text-[#6366F1]">creative links</span> between market research and financial strategy. <span className="text-xs text-[#1A1A1A]/60">[Ref: competitive-landscape.pdf & financial-projections.pdf]</span></li>
                            <li>Patterns in customer lifecycle management inspire <span className="font-bold text-[#6366F1]">new pricing architectures</span>. <span className="text-xs text-[#1A1A1A]/60">[Ref: strategic-analysis-2024.pdf]</span></li>
                          </ul>
                          <div className="mt-8 text-sm text-[#1A1A1A] opacity-70">
                            <span className="font-semibold">Inspiration:</span> These connections are surfaced by AI-driven pattern mining across all documents.
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectAnalysisDashboard;