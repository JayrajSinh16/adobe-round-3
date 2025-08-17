import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, Upload, MoreVertical, Download, TrendingUp, AlertTriangle, Target
} from 'lucide-react';

// Import panel components
import LeftPanel from './LeftPanel';
import CenterPanel from './CenterPanel';
import RightPanel from './RightPanel';
import InsightDetailModal from './modals/InsightDetailModal';
import { uploadDocuments, findConnections } from '../services/api';
import { getActivePDFs, upsertPDFs, deletePDF } from '../utils/pdfDb';

const PDFAnalysisWorkspace = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pdfViewerRef = useRef(null);
  const containerRef = useRef(null);

  // Navigation state
  const STORAGE_TTL_MS = 30 * 60 * 1000; // 30 minutes

  // Helper: base64 -> File
  const base64ToFile = (base64DataUrl, fileName, mimeType = 'application/pdf', lastModified) => {
    try {
      const base64Payload = typeof base64DataUrl === 'string' && base64DataUrl.includes(',')
        ? base64DataUrl.split(',')[1]
        : base64DataUrl;
      const byteString = atob(base64Payload || '');
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
      return new File([ab], fileName, { type: mimeType, lastModified: lastModified || Date.now() });
    } catch (e) {
      return null;
    }
  };

  // Helper: File -> data URL
  const fileToBase64 = (blob) => new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    } catch (e) { reject(e); }
  });

  let uploadedFiles = [];
  if (location.state && location.state.uploadedFiles && location.state.uploadedFiles.length > 0) {
    uploadedFiles = location.state.uploadedFiles;
  } else {
    // Load from IndexedDB synchronously-like (can't await in render, so we will start empty and LeftPanel/guards handle empty UI)
    // We'll try to do a quick synchronous snapshot by reading IDB via a blocking pattern is not possible; keep [] and allow user to go back.
    // The uploader already persisted to IDB before navigating.
    // Optionally a future enhancement: lift into an effect. Keeping minimal changes per request.
    // Note: The empty guard at the bottom will show the Upload screen button.
  }

  // Enhanced file management state
  const [files, setFiles] = useState(uploadedFiles);
  // Tabs state: each tab { id, file }
  const [openTabs, setOpenTabs] = useState(() => {
    if (!uploadedFiles || uploadedFiles.length === 0) return [];
    const last = uploadedFiles[uploadedFiles.length - 1];
    return [{ id: `${last.id || last.name}-${Date.now()}`, file: last }];
  });
  const [activeTabId, setActiveTabId] = useState(() => (openTabs[0]?.id || null));
  
  // If no files came via navigation, try to hydrate from IndexedDB on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (files && files.length > 0) return; // already have files
        const records = await getActivePDFs();
        if (cancelled) return;
        if (!Array.isArray(records) || records.length === 0) return;
        const restored = records.map((rec, idx) => {
          const blob = rec.blob;
          const fileObj = new File([blob], rec.name, { type: rec.type || 'application/pdf' });
          return {
            id: rec.id || `file-${Date.now()}-${idx}`,
            name: rec.name,
            size: rec.size,
            type: rec.type || 'application/pdf',
            uploadedAt: rec.uploadedAt || new Date().toISOString(),
            file: fileObj,
          };
        });
        setFiles(restored);
        if (restored.length > 0) {
          const last = restored[restored.length - 1];
          setSelectedFile(last);
          const tid = `${last.id || last.name}-${Date.now()}`;
          setOpenTabs([{ id: tid, file: last }]);
          setActiveTabId(tid);
        }
      } catch (e) {
        // silent fail; empty state UI will prompt upload
      }
    })();
    return () => { cancelled = true; };
  }, []);
  
  // Core UI State
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelVisible, setRightPanelVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(uploadedFiles[uploadedFiles.length - 1] || null);
  const [selectedText, setSelectedText] = useState('');
  const [selectedTextContext, setSelectedTextContext] = useState(null);
  const [activeInsightTab, setActiveInsightTab] = useState('connections');
  const [connectionsData, setConnectionsData] = useState({ connections: [], summary: '', processing_time: 0 });
  const [connectionsError, setConnectionsError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  // Insight modal state (LIFTED)
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Handler to open modal from anywhere
  const handleInsightClick = (insight) => {
    setSelectedInsight(insight);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedInsight(null);
  };
  
  // PDF State
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfZoom, setPdfZoom] = useState(1.0);
  const [pdfLoading, setPdfLoading] = useState(false);
  
  // Analysis State
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [insightsGenerated, setInsightsGenerated] = useState(false);
  
  // Podcast State
  const [podcastGenerating, setPodcastGenerating] = useState(false);

  // Kick off connections fetch when text is selected and panel shows
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!selectedTextContext || !selectedFile) return;
      try {
        setConnectionsError('');
        setAnalysisLoading(true);
        const payload = {
          selected_text: selectedTextContext.text,
          current_document_id: selectedFile.id || selectedFile.name,
          current_page: selectedTextContext.page || 1,
          context_before: '',
          context_after: '',
        };
        const data = await findConnections(payload);
        if (cancelled) return;
        setConnectionsData(data || { connections: [], summary: '', processing_time: 0 });
        setInsightsGenerated(true);
      } catch (e) {
        if (cancelled) return;
        setConnectionsError(e?.message || 'Failed to load connections');
        setConnectionsData({ connections: [], summary: '', processing_time: 0 });
      } finally {
        if (!cancelled) setAnalysisLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedTextContext, selectedFile]);

  // Animation configs
  const goldenTransition = {
    type: "spring",
    stiffness: 400,
    damping: 30,
    mass: 0.8
  };

  const staggerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  /**
   * ADOBE PDF INTEGRATION
   * Enterprise-grade PDF rendering with performance optimization
   */
  // Simplified file processing
  const processedFiles = useMemo(() => {
    return files.map((file) => ({
      ...file,
      category: 'General',
      categoryColor: '#6B7280',
      pages: Math.floor(Math.random() * 50) + 10,
      confidence: Math.floor(Math.random() * 21) + 79,
      lastAccessed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      readingTime: Math.floor(Math.random() * 30) + 5
    }));
  }, [files]);

  // Simple file filtering
  const filteredFiles = useMemo(() => {
    if (!searchTerm.trim()) return processedFiles;
    return processedFiles.filter(file => 
      file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [processedFiles, searchTerm]);

  // Mock data for insights
  const mockConnections = [
    {
      title: 'Transfer Learning Patterns',
      similarity: 94,
      type: 'concept',
      documents: ['Deep Learning Fundamentals.pdf', 'AI Strategy 2024.pdf'],
      snippet: 'Both documents emphasize the importance of pre-trained models...'
    },
    {
      title: 'Neural Network Architecture',
      similarity: 87,
      type: 'technical',
      documents: ['Technical Implementation.pdf', 'Research Paper 2023.pdf'],
      snippet: 'Similar architectural approaches to optimization strategies...'
    }
  ];

  const mockInsights = [
    {
      type: 'trend',
      title: 'Emerging AI Adoption Patterns',
      confidence: 92,
      insight: 'Documents suggest a 340% increase in transfer learning adoption...',
      implications: ['Reduced training costs', 'Faster deployment cycles'],
      icon: TrendingUp
    },
    {
      type: 'gap',
      title: 'Implementation Knowledge Gap',
      confidence: 85,
      insight: 'Analysis reveals significant gaps in practical implementation...',
      implications: ['Training opportunities', 'Documentation needs'],
      icon: AlertTriangle
    }
  ];

  // Event handlers
  const handleFileSelect = useCallback((file) => {
    setSelectedFile(file);
    // open a tab if not already
    setOpenTabs((prev) => {
      const exists = prev.find((t) => t.file?.name === file.name && t.file?.size === file.size);
      if (exists) {
        setActiveTabId(exists.id);
        return prev;
      }
      const newTab = { id: `${file.id || file.name}-${Date.now()}`, file };
      setActiveTabId(newTab.id);
      return [...prev, newTab];
    });
    setRightPanelVisible(false);
    setSelectedText('');
    setSelectedTextContext(null);
  }, []);

  const onActivateTab = useCallback((tabId) => {
    const tab = openTabs.find(t => t.id === tabId);
    if (tab) {
      setActiveTabId(tabId);
      setSelectedFile(tab.file);
      setRightPanelVisible(false);
    }
  }, [openTabs]);

  const onCloseTab = useCallback((tabId) => {
    setOpenTabs((prev) => {
      const idx = prev.findIndex(t => t.id === tabId);
      if (idx === -1) return prev;
      const newTabs = prev.filter(t => t.id !== tabId);
      // update active
      if (activeTabId === tabId) {
        const next = newTabs[idx] || newTabs[idx - 1] || null;
        setActiveTabId(next?.id || null);
        setSelectedFile(next?.file || null);
      }
      return newTabs;
    });
  }, [activeTabId]);

  const handleBackToUpload = useCallback(() => {
    navigate('/upload');
  }, [navigate]);

  const toggleLeftPanel = useCallback(() => {
    setLeftPanelCollapsed(!leftPanelCollapsed);
  }, [leftPanelCollapsed]);

  const handlePDFZoom = useCallback((direction) => {
    const zoomLevels = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndex = zoomLevels.indexOf(pdfZoom);
    let newIndex = currentIndex;
    
    if (direction === 'in' && currentIndex < zoomLevels.length - 1) {
      newIndex = currentIndex + 1;
    } else if (direction === 'out' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    }
    
    setPdfZoom(zoomLevels[newIndex]);
  }, [pdfZoom]);

  const handlePageNavigation = useCallback((direction) => {
    if (!selectedFile) return;
    
    const totalPages = selectedFile.pages || 1;
    if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage, selectedFile]);

  const handleGeneratePodcast = useCallback(() => {
    setPodcastGenerating(true);
    setTimeout(() => {
      setPodcastGenerating(false);
    }, 2000);
  }, []);

  // Enhanced file upload handler
  const handleFileUpload = useCallback(async (incomingFiles) => {
    if (!Array.isArray(incomingFiles) || incomingFiles.length === 0) return;
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = ['application/pdf'];

    // Validate and de-dup
    const currentNames = new Set(files.map(f => f.name + '|' + f.size));
    const valid = [];
    incomingFiles.forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name}: Only PDF files are supported`);
        return;
      }
      if (file.size > maxSize) {
        toast.error(`${file.name}: File size must be less than 50MB`);
        return;
      }
      const key = file.name + '|' + file.size;
      if (currentNames.has(key)) {
        toast.error(`${file.name}: File already uploaded`);
        return;
      }
      valid.push(file);
    });

    if (valid.length === 0) return;

    // Build objects for state and backend
    const now = new Date();
    const processedNewFiles = valid.map((file, index) => ({
      id: `file-${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      type: file.type,
      file,
      uploadedAt: now.toISOString(),
      category: 'General',
      categoryColor: '#6B7280',
      pages: Math.floor(Math.random() * 50) + 10,
      confidence: Math.floor(Math.random() * 21) + 79,
      lastAccessed: now,
      readingTime: Math.floor(Math.random() * 30) + 5
    }));

    // Backend upload MUST succeed before any local persistence
    try {
      await uploadDocuments(processedNewFiles);
      toast.success(`${processedNewFiles.length} document(s) uploaded`);
    } catch (e) {
      toast.error(e.message || 'Failed to upload to server');
      return; // abort local persistence
    }

    // Persist to IndexedDB with TTL, dedup by name|size
    try {
      const records = await Promise.all(processedNewFiles.map(async (f) => ({
        id: f.id,
        name: f.name,
        size: f.size,
        type: f.type,
        uploadedAt: f.uploadedAt,
        blob: f.file,
      })));
      await upsertPDFs(records, STORAGE_TTL_MS);
    } catch (e) {
      toast.error('Failed to persist files locally');
    }

    // Update state and select the latest uploaded by default
    setFiles(prev => {
      const next = [...prev, ...processedNewFiles];
      const latest = processedNewFiles[processedNewFiles.length - 1];
      setSelectedFile(latest);
      // open a new tab for the latest and activate it
      setOpenTabs((tabs) => {
        const exists = tabs.find(t => t.file?.name === latest.name && t.file?.size === latest.size);
        if (exists) {
          setActiveTabId(exists.id);
          return tabs;
        }
        const newTab = { id: `${latest.id || latest.name}-${Date.now()}`, file: latest };
        setActiveTabId(newTab.id);
        return [...tabs, newTab];
      });
      setRightPanelVisible(false);
      return next;
    });
  }, [files, setRightPanelVisible]);

  // Enhanced file delete handler
  const handleFileDelete = useCallback(async (fileId) => {
    try {
      // Find the file to delete
      const fileToDelete = files.find(f => f.id === fileId);
      if (!fileToDelete) {
        toast.error('File not found');
        return;
      }

      // Remove from IndexedDB
      try {
        await deletePDF(fileId);
      } catch (e) {
        console.warn('Failed to delete from IndexedDB:', e);
        // Continue with state deletion even if IndexedDB fails
      }

      // Remove from state
      setFiles(prev => prev.filter(f => f.id !== fileId));
      
      // Close any tabs for this file
      setOpenTabs(prev => prev.filter(tab => tab.file?.id !== fileId));
      
      // If this was the selected file, select another one or null
      if (selectedFile?.id === fileId) {
        const remainingFiles = files.filter(f => f.id !== fileId);
        setSelectedFile(remainingFiles.length > 0 ? remainingFiles[0] : null);
        
        // If no files left and we have tabs, switch to first tab or clear active tab
        if (remainingFiles.length === 0) {
          setActiveTabId(null);
        } else {
          // Switch to first remaining tab if current tab was deleted
          setOpenTabs(prev => {
            const remainingTabs = prev.filter(tab => tab.file?.id !== fileId);
            if (remainingTabs.length > 0) {
              setActiveTabId(remainingTabs[0].id);
            }
            return remainingTabs;
          });
        }
      }

      toast.success(`${fileToDelete.name} deleted successfully`);
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  }, [files, selectedFile, setOpenTabs, setActiveTabId]);

  // Format utilities
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimestamp = (date) => {
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return 'Yesterday';
  };

  const formatReadingTime = (minutes) => {
    return `${minutes}m read`;
  };

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  /**
   * UTILITY FUNCTIONS
   * Helper functions for data processing and optimization
   */
  const generateTopicsForFile = useCallback((fileName) => {
    const topicMappings = {
      'financial': ['Revenue Analysis', 'Cost Optimization', 'ROI Modeling', 'Budget Planning'],
      'technical': ['Architecture', 'Implementation', 'Performance', 'Security'],
      'market': ['Market Trends', 'Competitive Analysis', 'User Research', 'Growth Strategy'],
      'legal': ['Compliance', 'Risk Management', 'Regulatory', 'Governance'],
      'strategy': ['Business Planning', 'Objectives', 'KPIs', 'Roadmap']
    };

    const matchedKey = Object.keys(topicMappings).find(key => fileName.includes(key));
    return topicMappings[matchedKey] || ['Analysis', 'Research', 'Documentation', 'Planning'];
  }, []);

  const generateThumbnailSVG = useCallback((color) => {
    return `
      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="${color}20"/>
        <rect x="8" y="12" width="24" height="2" rx="1" fill="${color}"/>
        <rect x="8" y="17" width="18" height="2" rx="1" fill="${color}80"/>
        <rect x="8" y="22" width="20" height="2" rx="1" fill="${color}80"/>
        <rect x="8" y="27" width="16" height="2" rx="1" fill="${color}60"/>
      </svg>
    `;
  }, []);

  // Empty state guard
  if (!files || files.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-[#FAFAF9] to-[#F3F4F6] flex items-center justify-center p-4"
      >
        <div className="text-center bg-white/90 backdrop-blur-sm rounded-3xl p-16 shadow-xl border border-white/20 max-w-lg mx-auto">
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-[#DC2626] to-[#B91C1C] rounded-2xl flex items-center justify-center">
            <Upload className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-black text-[#1A1A1A] mb-6">No Documents Found</h2>
          <p className="text-lg text-[#1A1A1A] opacity-60 mb-10">Upload your documents to begin analysis.</p>
          <motion.button
            onClick={handleBackToUpload}
            className="bg-gradient-to-r from-[#DC2626] to-[#B91C1C] text-white px-10 py-4 rounded-2xl font-semibold text-lg hover:shadow-lg transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Upload className="w-5 h-5 inline mr-3" />
            Upload Documents
          </motion.button>
        </div>
      </motion.div>
    );
  }

  /**
   * MAIN WORKSPACE RENDERING
   * Three-panel layout with mathematical proportions and premium interactions
   */
  return (
    <motion.div 
      ref={containerRef}
      initial="hidden"
      animate="visible"
      variants={staggerVariants}
      className="h-screen flex flex-col bg-gradient-to-br from-[#FAFAF9] to-[#F3F4F6] overflow-hidden"
    >
      {/* INNOVATIVE FLOATING HEADER - Adaptive glass morphism with contextual intelligence */}
      <motion.header 
        variants={itemVariants}
        className="relative flex-shrink-0 bg-white/80 backdrop-blur-2xl border-b border-white/20 px-6 py-4 z-50 overflow-hidden"
        style={{
          backdropFilter: 'blur(24px) saturate(180%)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(250,250,249,0.8) 100%)',
          borderImage: 'linear-gradient(90deg, transparent, rgba(220,38,38,0.1), transparent) 1',
          boxShadow: '0 8px 32px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)'
        }}
      >
        {/* Ambient background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#DC2626]/20 via-transparent to-[#DC2626]/10" />
        </div>

        <div className="relative z-10 w-full flex items-center justify-between">
          {/* LEFT SECTION - Navigation & Context */}
          <div className="flex items-center space-x-6">
            {/* Enhanced back button with breadcrumb */}
            <motion.div className="flex items-center space-x-4">
              <motion.button
                onClick={handleBackToUpload}
                className="group relative flex items-center space-x-3 px-4 py-2.5 text-[#1A1A1A] hover:bg-white/60 rounded-xl transition-all duration-300 overflow-hidden"
                whileHover={{ scale: 1.02, x: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#DC2626]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300 relative z-10" />
                <span className="font-semibold text-sm tracking-wide relative z-10">Upload</span>
              </motion.button>
              
              {/* Breadcrumb separator */}
              <div className="text-[#E5E7EB] font-bold">/</div>
              
              {/* Current location indicator */}
             
            </motion.div>

            {/* File count indicator */}
            <motion.div 
              className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-white/40 rounded-xl border border-white/20"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="w-2 h-2 bg-[#059669] rounded-full animate-pulse" />
              <span className="text-xs font-bold text-[#1A1A1A] opacity-70">
                {files.length} Document{files.length !== 1 ? 's' : ''}
              </span>
            </motion.div>
          </div>

          {/* CENTER SECTION - Dynamic Brand & Status */}
          <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
            <motion.div
              initial={{ opacity: 0, y: -15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8, type: "spring", stiffness: 300 }}
            >
              <h1 className="text-2xl font-black text-[#1A1A1A] tracking-tight leading-none">
                PDF Analysis
                <span className="text-[#DC2626] ml-1.5 relative">
                  Workspace
                  {/* Innovative pulse indicator */}
                  <motion.div
                    className="absolute -top-1 -right-1 w-2 h-2 bg-[#DC2626] rounded-full"
                    animate={{ 
                      scale: [1, 1.3, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </span>
              </h1>
              
              {/* Dynamic status indicator */}
              <motion.div 
                className="flex items-center justify-center space-x-2 mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {selectedFile ? (
                  <>
                    <div className="w-1 h-1 bg-[#059669] rounded-full" />
                    <span className="text-xs text-[#1A1A1A] opacity-60 font-medium">
                      Analyzing: {selectedFile.name.length > 25 
                        ? selectedFile.name.substring(0, 25) + '...' 
                        : selectedFile.name}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-1 h-1 bg-[#E5E7EB] rounded-full" />
                    <span className="text-xs text-[#1A1A1A] opacity-60 font-medium">
                      Select a document to begin analysis
                    </span>
                  </>
                )}
              </motion.div>
            </motion.div>
          </div>

          {/* RIGHT SECTION - Smart Actions & Insights */}
          <div className="flex items-center space-x-2">
            {/* Analysis progress indicator */}
            {rightPanelVisible && (
              <motion.div 
                className="hidden md:flex items-center space-x-2 px-3 py-2 bg-[#DC2626]/10 rounded-xl border border-[#DC2626]/20"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <motion.div 
                  className="w-2 h-2 bg-[#DC2626] rounded-full"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.6, 1, 0.6]
                  }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <span className="text-xs font-bold text-[#DC2626]">
                  Insights Active
                </span>
              </motion.div>
            )}

            {/* Action buttons with contextual states */}
            <div className="flex items-center space-x-1">
              {/* Smart download with context */}
              <motion.button 
                className={`relative p-2.5 rounded-xl transition-all duration-300 overflow-hidden group ${
                  selectedFile 
                    ? 'bg-[#059669]/10 text-[#059669] hover:bg-[#059669]/20' 
                    : 'bg-[#E5E7EB]/30 text-[#1A1A1A] opacity-40 cursor-not-allowed'
                }`}
                whileHover={selectedFile ? { scale: 1.05 } : {}}
                whileTap={selectedFile ? { scale: 0.95 } : {}}
                disabled={!selectedFile}
                aria-label={selectedFile ? `Download analysis for ${selectedFile.name}` : 'Select a document to download'}
              >
                {selectedFile && (
                  <div className="absolute inset-0 bg-gradient-to-r from-[#059669]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}
                <MoreVertical className="w-4 h-4 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
              </motion.button>

              {/* Innovative workspace insights */}
              <motion.button 
                onClick={() => setRightPanelVisible(!rightPanelVisible)}
                className={`relative px-3 py-2.5 rounded-xl font-semibold text-xs transition-all duration-300 overflow-hidden group ${
                  rightPanelVisible 
                    ? 'bg-[#DC2626] text-white shadow-lg' 
                    : 'bg-white/40 text-[#1A1A1A] hover:bg-white/60'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`absolute inset-0 transition-opacity duration-300 ${
                  rightPanelVisible 
                    ? 'bg-gradient-to-r from-[#B91C1C] to-[#DC2626] opacity-100' 
                    : 'bg-gradient-to-r from-[#DC2626]/10 to-transparent opacity-0 group-hover:opacity-100'
                }`} />
                <span className="relative z-10 tracking-wide">
                  {rightPanelVisible ? 'Close Insights' : 'AI Insights'}
                </span>
                
                {/* Active indicator */}
                {rightPanelVisible && (
                  <motion.div
                    className="absolute inset-0 bg-white/10 rounded-xl"
                    animate={{ 
                      opacity: [0, 0.3, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Innovative bottom accent line */}
        <motion.div 
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-[#DC2626]/30 to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
          style={{ width: '100%' }}
        />
      </motion.header>

      {/* THREE-PANEL WORKSPACE LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL - Enhanced Document Library Navigator */}
        <LeftPanel
          leftPanelCollapsed={leftPanelCollapsed}
          toggleLeftPanel={toggleLeftPanel}
          filteredFiles={filteredFiles}
          selectedFile={selectedFile}
          handleFileSelect={handleFileSelect}
          searchTerm={searchTerm}
          handleSearchChange={handleSearchChange}
          formatFileSize={formatFileSize}
          formatReadingTime={formatReadingTime}
          formatTimestamp={formatTimestamp}
          goldenTransition={goldenTransition}
          rightPanelVisible={rightPanelVisible}
          setRightPanelVisible={setRightPanelVisible}
          onFileUpload={handleFileUpload}
          onFileDelete={handleFileDelete}
        />

        {/* CENTER PANEL - Premium PDF Viewer */}
        <CenterPanel
          selectedFile={selectedFile}
          openTabs={openTabs}
          activeTabId={activeTabId}
          onActivateTab={onActivateTab}
          onCloseTab={onCloseTab}
          currentPage={currentPage}
          pdfZoom={pdfZoom}
          pdfLoading={pdfLoading}
          pdfViewerRef={pdfViewerRef}
          handlePDFZoom={handlePDFZoom}
          handlePageNavigation={handlePageNavigation}
          setSelectedText={setSelectedText}
          setSelectedTextContext={setSelectedTextContext}
          setRightPanelVisible={setRightPanelVisible}
          setActiveInsightTab={setActiveInsightTab}
          setAnalysisLoading={setAnalysisLoading}
          setInsightsGenerated={setInsightsGenerated}
          goldenTransition={goldenTransition}
        />

        {/* RIGHT PANEL - Dynamic Insights & Analysis */}
        <RightPanel
          rightPanelVisible={rightPanelVisible}
          selectedTextContext={selectedTextContext}
          activeInsightTab={activeInsightTab}
          analysisLoading={analysisLoading}
          podcastGenerating={podcastGenerating}
          setRightPanelVisible={setRightPanelVisible}
          setActiveInsightTab={setActiveInsightTab}
          handleGeneratePodcast={handleGeneratePodcast}
          goldenTransition={goldenTransition}
          onInsightClick={handleInsightClick}
          connectionsData={connectionsData}
          connectionsError={connectionsError}
        />
        <InsightDetailModal
          insight={selectedInsight}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </motion.div>
  );
};

export default PDFAnalysisWorkspace;