import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Upload, Search, Filter, Grid3X3, List, Star, Download, Share2, 
  Trash2, PlayCircle, BookOpen, Clock, ChevronRight, MoreVertical, Plus,
  Sparkles, TrendingUp, Brain, Target, Lightbulb, Zap, Network, CheckCircle,
  Users, BarChart3, Activity, Circle, ArrowRight, Menu, Bell, Settings,
  Home, Bookmark, Calendar, PieChart
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Advanced state management with performance optimization
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showDocumentActions, setShowDocumentActions] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('velocity');
  
  // Refs for scroll animations
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.98]);

  // Elite data generation with sophisticated insights
  const generateDocumentStats = useCallback(() => {
    return [
      {
        id: 1,
        name: "Strategic Market Analysis Q4.pdf",
        size: 4.2 * 1024 * 1024,
        pages: 47,
        readingProgress: 78,
        status: 'reading',
        isStarred: true,
        relevanceScore: 94,
        highlightsCount: 23,
        estimatedReadTime: 35,
        lastRead: new Date(Date.now() - 2 * 60 * 60 * 1000),
        keyTopics: ['Market Trends', 'Competition Analysis', 'Growth Strategy', 'Revenue Forecasting'],
        uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        id: 2,
        name: "Technical Architecture Guidelines.pdf",
        size: 8.7 * 1024 * 1024,
        pages: 89,
        readingProgress: 45,
        status: 'reading',
        isStarred: false,
        relevanceScore: 87,
        highlightsCount: 15,
        estimatedReadTime: 67,
        lastRead: new Date(Date.now() - 24 * 60 * 60 * 1000),
        keyTopics: ['System Design', 'Scalability', 'Security', 'Performance'],
        uploadDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        id: 3,
        name: "Regulatory Compliance Framework.pdf",
        size: 2.8 * 1024 * 1024,
        pages: 34,
        readingProgress: 100,
        status: 'completed',
        isStarred: true,
        relevanceScore: 91,
        highlightsCount: 18,
        estimatedReadTime: 28,
        lastRead: new Date(Date.now() - 6 * 60 * 60 * 1000),
        keyTopics: ['Compliance', 'Legal Framework', 'Risk Management', 'Audit'],
        uploadDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];
  }, []);

  const generateReadingMetrics = useCallback(() => {
    return {
      todayMinutes: 127,
      weeklyGoal: 300,
      documentsCompleted: 8,
      averageVelocity: 2.3,
      knowledgeConnections: 847,
      insightQuality: 94
    };
  }, []);

  // Memoized data with sophisticated calculations
  const documentStats = generateDocumentStats();
  const readingMetrics = generateReadingMetrics();
  
  const filteredDocuments = documentStats.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.keyTopics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()));
    
    switch (filterBy) {
      case 'reading': return doc.status === 'reading' && matchesSearch;
      case 'completed': return doc.status === 'completed' && matchesSearch;
      case 'starred': return doc.isStarred && matchesSearch;
      case 'high-relevance': return doc.relevanceScore >= 90 && matchesSearch;
      default: return matchesSearch;
    }
  });

  // Premium callback functions with performance optimization
  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handleFilterChange = useCallback((filter) => {
    setFilterBy(filter);
  }, []);

  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
  }, []);

  const handleStartReading = useCallback((document) => {
    navigate('/reader', { state: { document } });
  }, [navigate]);

  const handleDocumentAction = useCallback((action, document) => {
    console.log(`${action} action on document:`, document.name);
    setShowDocumentActions(null);
  }, []);

  // Premium utility functions
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Premium guard clause for empty states
  if (!documentStats || documentStats.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAFAF9] via-white to-[#F5F5F4] 
                    flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-[#DC2626]/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-[#DC2626]" />
          </div>
          <h2 className="text-2xl font-light text-[#1A1A1A] mb-4">Welcome to Your Dashboard</h2>
          <p className="text-[#1A1A1A]/60 mb-8 max-w-md">
            Upload your first document to begin your intelligent analysis journey.
          </p>
          <motion.button
            onClick={() => navigate('/upload')}
            className="bg-gradient-to-r from-[#DC2626] to-[#B91C1C] text-white px-8 py-4 
                     rounded-2xl font-medium hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Get Started
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAF9] via-white to-[#F5F5F4]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* HERO COMMAND CENTER - Asymmetrical luxury design */}
        <motion.div
          ref={heroRef}
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="mb-12"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
            
            {/* Elite Header with Mathematical Spacing */}
            <motion.div
              className="flex items-center justify-between mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div>
                <h1 className="text-3xl font-light text-[#1A1A1A] mb-2">
                  Intelligence Dashboard
                </h1>
                <p className="text-[#1A1A1A]/60 font-light">
                  Elevating human cognition through AI-powered document analysis
                </p>
              </div>
              
              <motion.div
                className="flex items-center space-x-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-[#059669] rounded-full animate-pulse"></div>
                  <span className="text-sm text-[#1A1A1A]/60">AI Active</span>
                </div>
                
                <motion.button
                  className="p-3 bg-[#1A1A1A]/5 hover:bg-[#1A1A1A]/10 rounded-2xl transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Settings className="w-5 h-5 text-[#1A1A1A]/60" />
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Sophisticated Metrics Grid */}
            <motion.div
              className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
            >
              {[
                { 
                  label: 'Documents', 
                  value: documentStats.length,
                  icon: FileText,
                  color: 'red',
                  gradient: 'from-[#DC2626]/10 to-[#B91C1C]/5'
                },
                { 
                  label: 'In Progress', 
                  value: documentStats.filter(doc => doc.status === 'reading').length,
                  icon: BookOpen,
                  color: 'blue',
                  gradient: 'from-blue-500/10 to-blue-600/5'
                },
                { 
                  label: 'Completed', 
                  value: documentStats.filter(doc => doc.status === 'completed').length,
                  icon: CheckCircle,
                  color: 'emerald',
                  gradient: 'from-emerald-500/10 to-emerald-600/5'
                },
                { 
                  label: 'Insights', 
                  value: documentStats.reduce((acc, doc) => acc + doc.highlightsCount, 0),
                  icon: Sparkles,
                  color: 'amber',
                  gradient: 'from-amber-500/10 to-amber-600/5'
                }
              ].map((metric, index) => (
                <motion.div
                  key={metric.label}
                  className={`bg-gradient-to-br ${metric.gradient} backdrop-blur-sm rounded-2xl p-6 
                            border border-white/20 hover:shadow-lg transition-all duration-500 cursor-pointer group`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + (index * 0.1) }}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-${metric.color}-500/10 rounded-2xl flex items-center justify-center
                                   group-hover:bg-${metric.color}-500/20 transition-all duration-300`}>
                      <metric.icon className={`w-6 h-6 text-${metric.color}-600`} />
                    </div>
                  </div>
                  
                  <div className={`text-3xl font-bold text-${metric.color}-600 mb-2`}>
                    {metric.value}
                  </div>
                  <div className="text-sm text-[#1A1A1A]/60 font-medium">
                    {metric.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Premium Focus Summary */}
            <motion.div
              className="bg-gradient-to-r from-[#1A1A1A]/5 to-[#1A1A1A]/2 rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#DC2626]/10 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-[#DC2626]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#1A1A1A]">
                      Today's Focus: {Math.floor(readingMetrics.todayMinutes / 60)}h {readingMetrics.todayMinutes % 60}m
                    </h3>
                    <p className="text-[#1A1A1A]/60">
                      {Math.round((readingMetrics.todayMinutes / readingMetrics.weeklyGoal) * 100)}% of weekly goal • 
                      {readingMetrics.averageVelocity}x reading velocity
                    </p>
                  </div>
                </div>
                
                <motion.button
                  onClick={() => navigate('/analytics')}
                  className="bg-[#DC2626] text-white px-6 py-3 rounded-2xl font-medium
                           hover:bg-[#B91C1C] transition-all duration-300 flex items-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>View Analytics</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* DOCUMENT LIBRARY - Premium asymmetrical layout */}
        <div className="grid xl:grid-cols-5 gap-12">
          
          {/* Main Document Grid - 3/5 width */}
          <motion.div
            className="xl:col-span-3"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
              
              {/* Library Header with sophisticated controls */}
              <div className="flex items-center justify-between mb-8">
                <motion.h2 
                  className="text-2xl font-light text-[#1A1A1A] flex items-center space-x-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  <FileText className="w-6 h-6 text-[#DC2626]" />
                  <span>Document Library</span>
                  <span className="text-sm text-[#1A1A1A]/40 font-normal">
                    ({filteredDocuments.length})
                  </span>
                </motion.h2>
                
                {/* View Mode Toggles */}
                <motion.div 
                  className="flex items-center space-x-2 bg-[#E5E7EB]/30 rounded-2xl p-2"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1 }}
                >
                  {['grid', 'list'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => handleViewModeChange(mode)}
                      className={`p-2 rounded-xl transition-all duration-300 ${
                        viewMode === mode 
                          ? 'bg-[#DC2626] text-white shadow-lg' 
                          : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A] hover:bg-white/50'
                      }`}
                    >
                      {mode === 'grid' ? <Grid3X3 className="w-4 h-4" /> : <List className="w-4 h-4" />}
                    </button>
                  ))}
                </motion.div>
              </div>

              {/* Search and Filter Controls */}
              <motion.div
                className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
              >
                {/* Premium Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#1A1A1A]/40 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search documents, topics, insights..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-[#FAFAF9] border border-[#E5E7EB]/50 rounded-2xl 
                             focus:border-[#DC2626] focus:ring-0 outline-none transition-all duration-300
                             text-[#1A1A1A] placeholder-[#1A1A1A]/40"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex items-center space-x-2">
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'reading', label: 'Reading' },
                    { key: 'completed', label: 'Completed' },
                    { key: 'starred', label: 'Starred' },
                    { key: 'high-relevance', label: 'High Relevance' }
                  ].map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => handleFilterChange(filter.key)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                        filterBy === filter.key
                          ? 'bg-[#DC2626] text-white shadow-lg'
                          : 'bg-white/60 text-[#1A1A1A]/70 border border-white/20 hover:bg-white hover:text-[#1A1A1A]'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Document Grid/List */}
              <AnimatePresence mode="wait">
                {filteredDocuments.length > 0 ? (
                  <motion.div
                    key={viewMode}
                    className={viewMode === 'grid' 
                      ? 'grid md:grid-cols-2 gap-6' 
                      : 'space-y-4'
                    }
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {filteredDocuments.map((doc, index) => (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.05 }}
                        className={`group relative bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-sm 
                                  rounded-2xl border border-white/20 shadow-lg hover:shadow-xl 
                                  transition-all duration-500 cursor-pointer ${
                                    viewMode === 'grid' ? 'p-6' : 'p-4'
                                  }`}
                        onClick={() => handleStartReading(doc)}
                        whileHover={{ scale: viewMode === 'grid' ? 1.02 : 1.01 }}
                      >
                        {/* Document Actions Dropdown */}
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDocumentActions(showDocumentActions === doc.id ? null : doc.id);
                            }}
                            className="p-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white 
                                     transition-all duration-200 border border-white/20"
                          >
                            <MoreVertical className="w-4 h-4 text-[#1A1A1A]/60" />
                          </button>

                          <AnimatePresence>
                            {showDocumentActions === doc.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                className="absolute right-0 top-full mt-2 bg-white/95 backdrop-blur-sm rounded-2xl 
                                         shadow-xl border border-white/20 py-2 min-w-[160px] z-20"
                              >
                                {[
                                  { action: 'star', icon: Star, label: doc.isStarred ? 'Unstar' : 'Star', color: 'amber' },
                                  { action: 'download', icon: Download, label: 'Download', color: 'blue' },
                                  { action: 'share', icon: Share2, label: 'Share', color: 'green' },
                                  { action: 'delete', icon: Trash2, label: 'Delete', color: 'red' }
                                ].map(({ action, icon: Icon, label, color }) => (
                                  <button
                                    key={action}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDocumentAction(action, doc);
                                    }}
                                    className={`w-full px-4 py-2 text-left text-sm hover:bg-${color}-50 
                                              transition-colors duration-200 flex items-center space-x-3 ${
                                                action === 'delete' ? 'text-red-600' : 'text-[#1A1A1A]/70'
                                              }`}
                                  >
                                    <Icon className={`w-4 h-4 ${
                                      action === 'star' && doc.isStarred ? 'text-amber-500 fill-current' : 
                                      action === 'delete' ? 'text-red-500' : `text-${color}-500`
                                    }`} />
                                    <span>{label}</span>
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {viewMode === 'grid' ? (
                          /* Premium Grid Card Layout */
                          <>
                            {/* Document Header */}
                            <div className="flex items-start space-x-4 mb-6">
                              <div className="w-14 h-14 bg-gradient-to-br from-[#DC2626]/10 to-[#B91C1C]/5 
                                            rounded-2xl flex items-center justify-center flex-shrink-0 border border-[#DC2626]/10">
                                <FileText className="w-7 h-7 text-[#DC2626]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h3 className="font-semibold text-[#1A1A1A] truncate text-lg">
                                    {doc.name}
                                  </h3>
                                  {doc.isStarred && (
                                    <Star className="w-5 h-5 text-amber-500 fill-current flex-shrink-0" />
                                  )}
                                </div>
                                <div className="flex items-center space-x-3 text-sm text-[#1A1A1A]/60">
                                  <span>{formatFileSize(doc.size)}</span>
                                  <span>•</span>
                                  <span>{doc.pages} pages</span>
                                  <span>•</span>
                                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                    doc.status === 'completed' 
                                      ? 'bg-[#059669]/10 text-[#059669]' 
                                      : 'bg-blue-500/10 text-blue-600'
                                  }`}>
                                    {doc.status === 'completed' ? 'Completed' : 'Reading'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Advanced Progress Visualization */}
                            <div className="mb-6">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-[#1A1A1A]/70">Reading Progress</span>
                                <span className="text-sm font-bold text-[#1A1A1A]">{doc.readingProgress}%</span>
                              </div>
                              <div className="relative">
                                <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                                  <motion.div 
                                    className="h-full bg-gradient-to-r from-[#DC2626] to-[#B91C1C] rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${doc.readingProgress}%` }}
                                    transition={{ duration: 1, delay: 0.2 }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Enhanced Analytics Grid */}
                            <div className="grid grid-cols-3 gap-3 mb-6">
                              {[
                                { label: 'Relevance', value: `${doc.relevanceScore}%`, color: 'blue' },
                                { label: 'Insights', value: doc.highlightsCount, color: 'emerald' },
                                { label: 'Read Time', value: `${doc.estimatedReadTime}m`, color: 'purple' }
                              ].map((metric) => (
                                <div key={metric.label} className={`bg-${metric.color}-500/5 border border-${metric.color}-500/10 
                                                                   rounded-xl p-3 text-center`}>
                                  <div className={`text-lg font-bold text-${metric.color}-600 mb-1`}>
                                    {metric.value}
                                  </div>
                                  <div className="text-xs text-[#1A1A1A]/60 font-medium">
                                    {metric.label}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Smart Topics */}
                            <div className="mb-6">
                              <div className="flex flex-wrap gap-2">
                                {doc.keyTopics.slice(0, 3).map(topic => (
                                  <span 
                                    key={topic}
                                    className="px-3 py-1.5 bg-[#1A1A1A]/5 text-[#1A1A1A]/70 rounded-xl text-xs font-medium
                                             border border-[#1A1A1A]/10"
                                  >
                                    {topic}
                                  </span>
                                ))}
                                {doc.keyTopics.length > 3 && (
                                  <span className="px-3 py-1.5 bg-[#1A1A1A]/5 text-[#1A1A1A]/50 rounded-xl text-xs font-medium">
                                    +{doc.keyTopics.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Action Footer */}
                            <div className="flex items-center justify-between pt-4 border-t border-[#1A1A1A]/5">
                              <div className="flex items-center space-x-2 text-xs text-[#1A1A1A]/50">
                                <Clock className="w-3 h-3" />
                                <span>Last read {formatTimeAgo(doc.lastRead)}</span>
                              </div>
                              
                              <motion.div
                                className="bg-gradient-to-r from-[#DC2626] to-[#B91C1C] text-white px-4 py-2 
                                         rounded-xl text-sm font-medium flex items-center space-x-2 
                                         group-hover:shadow-lg transition-all duration-300"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {doc.readingProgress > 0 ? (
                                  <>
                                    <PlayCircle className="w-4 h-4" />
                                    <span>Continue</span>
                                  </>
                                ) : (
                                  <>
                                    <BookOpen className="w-4 h-4" />
                                    <span>Start Reading</span>
                                  </>
                                )}
                              </motion.div>
                            </div>
                          </>
                        ) : (
                          /* Premium List Layout */
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#DC2626]/10 to-[#B91C1C]/5 
                                          rounded-xl flex items-center justify-center flex-shrink-0">
                              <FileText className="w-6 h-6 text-[#DC2626]" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="font-semibold text-[#1A1A1A] truncate">
                                  {doc.name}
                                </h3>
                                {doc.isStarred && (
                                  <Star className="w-4 h-4 text-amber-500 fill-current" />
                                )}
                                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                  doc.status === 'completed' 
                                    ? 'bg-[#059669]/10 text-[#059669]' 
                                    : 'bg-blue-500/10 text-blue-600'
                                }`}>
                                  {doc.status === 'completed' ? 'Done' : 'Reading'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-6 text-sm text-[#1A1A1A]/60">
                                <span>{formatFileSize(doc.size)}</span>
                                <span>{doc.pages} pages</span>
                                <span>{doc.readingProgress}% read</span>
                                <span>{doc.highlightsCount} insights</span>
                                <span>Last read {formatTimeAgo(doc.lastRead)}</span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <div className="text-sm font-semibold text-[#1A1A1A]">
                                  {doc.relevanceScore}% relevant
                                </div>
                                <div className="text-xs text-[#1A1A1A]/60">
                                  {doc.estimatedReadTime}min read
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-[#1A1A1A]/40 group-hover:text-[#DC2626] 
                                                     transition-colors duration-300" />
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  /* Empty State with Sophisticated Design */
                  <motion.div
                    className="text-center py-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    <div className="w-20 h-20 bg-[#DC2626]/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <FileText className="w-10 h-10 text-[#DC2626]/40" />
                    </div>
                    <h3 className="text-xl font-light text-[#1A1A1A] mb-3">
                      No documents found
                    </h3>
                    <p className="text-[#1A1A1A]/60 mb-8 max-w-md mx-auto leading-relaxed">
                      {searchQuery ? 'Try adjusting your search terms or filters.' : 'Upload documents to begin your intelligent analysis journey.'}
                    </p>
                    <motion.button
                      onClick={() => navigate('/upload')}
                      className="bg-gradient-to-r from-[#DC2626] to-[#B91C1C] text-white px-6 py-3 
                               rounded-2xl font-medium hover:shadow-xl transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Upload Documents
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
          
          {/* AI INSIGHTS SIDEBAR - 2/5 width */}
          <motion.div
            className="xl:col-span-2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
          >
            <div className="bg-gradient-to-br from-white/70 to-white/50 backdrop-blur-sm rounded-3xl 
                          p-8 shadow-xl border border-white/20 sticky top-8">
              
              {/* Insights Header */}
              <motion.div
                className="flex items-center space-x-3 mb-8"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-[#DC2626] to-[#B91C1C] rounded-2xl 
                              flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-light text-[#1A1A1A]">AI Insights</h2>
              </motion.div>

              {/* Quick Analytics */}
              <motion.div
                className="space-y-6 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
              >
                {[
                  {
                    label: 'Reading Velocity',
                    value: '2.3x faster',
                    change: '+15%',
                    icon: TrendingUp,
                    color: 'emerald'
                  },
                  {
                    label: 'Knowledge Synthesis',
                    value: '847 connections',
                    change: '+23%',
                    icon: Brain,
                    color: 'purple'
                  },
                  {
                    label: 'Insight Quality',
                    value: '94% relevance',
                    change: '+8%',
                    icon: Target,
                    color: 'blue'
                  }
                ].map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    className={`bg-${metric.color}-500/5 border border-${metric.color}-500/10 
                              rounded-2xl p-4 flex items-center space-x-4`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 1.4 + (index * 0.1) }}
                  >
                    <div className={`w-12 h-12 bg-${metric.color}-500/10 rounded-xl 
                                   flex items-center justify-center`}>
                      <metric.icon className={`w-6 h-6 text-${metric.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`text-lg font-bold text-${metric.color}-600`}>
                          {metric.value}
                        </span>
                        <span className="text-xs bg-[#059669]/10 text-[#059669] px-2 py-1 rounded-lg font-medium">
                          {metric.change}
                        </span>
                      </div>
                      <div className="text-sm text-[#1A1A1A]/60 font-medium">
                        {metric.label}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Recent Discoveries */}
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.6 }}
              >
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4 flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5 text-[#DC2626]" />
                  <span>Recent Discoveries</span>
                </h3>
                
                <div className="space-y-4">
                  {[
                    {
                      insight: "Cross-referenced market analysis patterns across 3 documents",
                      relevance: 96,
                      timeAgo: "2 hours ago"
                    },
                    {
                      insight: "Identified strategic framework alignment in regulatory documents", 
                      relevance: 89,
                      timeAgo: "4 hours ago"
                    },
                    {
                      insight: "Discovered emerging trend correlations in quarterly reports",
                      relevance: 92,
                      timeAgo: "6 hours ago"
                    }
                  ].map((discovery, index) => (
                    <motion.div
                      key={index}
                      className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20
                               hover:bg-white/80 transition-all duration-300 cursor-pointer group"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 1.8 + (index * 0.1) }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-[#DC2626]/10 rounded-xl flex items-center justify-center mt-1">
                          <Zap className="w-4 h-4 text-[#DC2626]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-[#1A1A1A]/80 leading-relaxed mb-2">
                            {discovery.insight}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                              discovery.relevance >= 95 ? 'bg-[#059669]/10 text-[#059669]' :
                              discovery.relevance >= 90 ? 'bg-blue-500/10 text-blue-600' :
                              'bg-amber-500/10 text-amber-600'
                            }`}>
                              {discovery.relevance}% relevant
                            </span>
                            <span className="text-xs text-[#1A1A1A]/50">
                              {discovery.timeAgo}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#1A1A1A]/30 group-hover:text-[#DC2626] 
                                               transition-colors duration-300" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Knowledge Graph Preview */}
              <motion.div
                className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#1A1A1A] flex items-center space-x-2">
                    <Network className="w-5 h-5 text-[#DC2626]" />
                    <span>Knowledge Map</span>
                  </h3>
                  <motion.button
                    className="text-[#DC2626] text-sm font-medium hover:text-[#B91C1C] transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Explore All
                  </motion.button>
                </div>
                
                <div className="h-32 bg-gradient-to-br from-[#DC2626]/5 to-[#B91C1C]/5 rounded-xl 
                              flex items-center justify-center border border-[#DC2626]/10">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-[#DC2626]/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
                      <Network className="w-6 h-6 text-[#DC2626]" />
                    </div>
                    <p className="text-sm text-[#1A1A1A]/60 font-medium">
                      Interactive visualization
                    </p>
                    <p className="text-xs text-[#1A1A1A]/40">
                      Click to explore connections
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* FLOATING ACTION PANEL */}
        <motion.div
          className="fixed bottom-8 right-8 z-50"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 2.2 }}
        >
          <div className="bg-gradient-to-r from-[#DC2626] to-[#B91C1C] rounded-2xl shadow-2xl 
                        backdrop-blur-sm border border-white/20">
            <motion.button
              onClick={() => navigate('/upload')}
              className="flex items-center space-x-3 px-6 py-4 text-white font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-5 h-5" />
              <span>Add Document</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
