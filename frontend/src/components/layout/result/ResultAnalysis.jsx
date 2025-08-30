import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MoreVertical, TrendingUp, AlertTriangle } from 'lucide-react';

import LeftPanel from '../LeftPanel';
import CenterPanel from '../CenterPanel';
import RightPanel from '../RightPanel';
import InsightDetailModal from '../../modals/InsightDetailModal';
import { YouTubeModal } from '../../modals';
import HeaderBar from './HeaderBar';
import EmptyState from './EmptyState';
import { uploadDocuments, findConnections, generateInsights, listDocuments, fetchKeyTakeaway, fetchDidYouKnow, fetchContradictions, fetchExamples, fetchCrossReferences, generatePodcastAudio, recommendYouTube } from '../../../services/api';
import { getActivePDFs, upsertPDFs, deletePDF } from '../../../utils/pdfDb';

// NOTE: Logic is preserved exactly from original ResultAnalysis.jsx. Only UI sections were extracted.
const PDFAnalysisWorkspace = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pdfViewerRef = useRef(null);
  const containerRef = useRef(null);

  const STORAGE_TTL_MS = 30 * 60 * 1000;

  let uploadedFiles = [];
  if (location.state && location.state.uploadedFiles && location.state.uploadedFiles.length > 0) {
    uploadedFiles = location.state.uploadedFiles;
  }

  const [files, setFiles] = useState(uploadedFiles);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelVisible, setRightPanelVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(uploadedFiles[uploadedFiles.length - 1] || null);
  const [selectedText, setSelectedText] = useState('');
  const [selectedTextContext, setSelectedTextContext] = useState(null);
  const [activeInsightTab, setActiveInsightTab] = useState('connections');
  const [connectionsData, setConnectionsData] = useState({ connections: [], summary: '', processing_time: 0 });
  const [connectionsError, setConnectionsError] = useState('');
  const [insightsData, setInsightsData] = useState({ insights: [], selected_text: '', processing_time: 0 });
  const [insightsError, setInsightsError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfZoom, setPdfZoom] = useState(1.0);

  const [openTabs, setOpenTabs] = useState(() => {
    if (!uploadedFiles || uploadedFiles.length === 0) return [];
    const last = uploadedFiles[uploadedFiles.length - 1];
    return [{ id: `${last.id || last.name}-${Date.now()}`, file: last }];
  });
  const [activeTabId, setActiveTabId] = useState(() => (openTabs[0]?.id || null));

  const backendDocIdMapRef = useRef(new Map());

  const base64ToFile = (base64DataUrl, fileName, mimeType = 'application/pdf', lastModified) => {
    try {
      if (!base64DataUrl || !fileName) return null;
      const base64Payload = typeof base64DataUrl === 'string' && base64DataUrl.includes(',')
        ? base64DataUrl.split(',')[1]
        : base64DataUrl;
      if (!base64Payload) return null;
      const byteString = atob(base64Payload);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
      try {
        return new File([ab], fileName, { type: mimeType || 'application/pdf', lastModified: lastModified || Date.now() });
      } catch (fileError) {
        const blob = new Blob([ab], { type: mimeType || 'application/pdf' });
        blob.name = fileName; // fallback properties for environments without File
        blob.lastModified = lastModified || Date.now();
        return blob;
      }
    } catch (e) {
      console.error('base64ToFile error:', e);
      return null;
    }
  };

  const fileToBase64 = (blob) => new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    } catch (e) { reject(e); }
  });

  const INSIGHTS_CACHE_KEY = 'insightsCacheV3';
  const clearInsightsCache = useCallback(() => {
    try {
      localStorage.removeItem(INSIGHTS_CACHE_KEY);
      setInsightsData({ insights: [], selected_text: '', processing_time: 0 });
      setInsightsError('');
    } catch (e) {
      console.warn('Failed to clear cache:', e);
    }
  }, []);

  const getServerDocumentId = useCallback(() => {
    if (!selectedFile?.name) return '';
    const key = String(selectedFile.name).toLowerCase();
    return backendDocIdMapRef.current.get(key) || String(selectedFile.id || '');
  }, [selectedFile]);

  const [pdfLoading, setPdfLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [insightsGenerated, setInsightsGenerated] = useState(false);
  const [podcastGenerating, setPodcastGenerating] = useState(false);
  const [podcastData, setPodcastData] = useState(null);
  const [podcastError, setPodcastError] = useState(null);
  const [youtubeOpen, setYouTubeOpen] = useState(false);
  const [youtubeQuery, setYouTubeQuery] = useState('');
  const [youtubeLoading, setYouTubeLoading] = useState(false);
  const [youtubeVideos, setYouTubeVideos] = useState([]);
  const onOpenYouTube = useCallback(async () => {
    try {
      if (!selectedFile) return;
      const q = (selectedTextContext?.text || selectedText || selectedFile?.name || '').toString().trim();
      if (!q) return;
      setYouTubeQuery(q);
      setYouTubeOpen(true);
      setYouTubeLoading(true);
      const vids = await recommendYouTube({ text: q, limit: 10 });
      setYouTubeVideos(vids || []);
    } catch (e) {
      toast.error(e?.message || 'Failed to fetch YouTube videos');
      setYouTubeVideos([]);
    } finally {
      setYouTubeLoading(false);
    }
  }, [selectedFile, selectedTextContext, selectedText]);

  const centerPanelRef = useRef(null);
  const adobeApisRef = useRef(null);
  const [hasConnectionsResponse, setHasConnectionsResponse] = useState(false);

  const INSIGHTS_CACHE_TTL_MS = 60 * 60 * 1000;
  const MAX_CACHE_ENTRIES = 50;
  const getInsightsCache = () => {
    try {
      const raw = localStorage.getItem(INSIGHTS_CACHE_KEY);
      const cache = raw ? JSON.parse(raw) : {};
      const now = Date.now();
      let changed = false;
      Object.keys(cache).forEach((k) => {
        const entry = cache[k];
        if (!entry || !entry.__ts || now - entry.__ts > INSIGHTS_CACHE_TTL_MS) {
          delete cache[k];
          changed = true;
        }
      });
      const entries = Object.entries(cache).sort((a, b) => (a[1].__ts || 0) - (b[1].__ts || 0));
      if (entries.length > MAX_CACHE_ENTRIES) {
        const toRemove = entries.slice(0, entries.length - MAX_CACHE_ENTRIES);
        toRemove.forEach(([key]) => { delete cache[key]; changed = true; });
      }
      if (changed) {
        try { localStorage.setItem(INSIGHTS_CACHE_KEY, JSON.stringify(cache)); } catch (e) { localStorage.removeItem(INSIGHTS_CACHE_KEY); return {}; }
      }
      return cache;
    } catch (e) {
      console.warn('Error reading cache, clearing:', e);
      localStorage.removeItem(INSIGHTS_CACHE_KEY);
      return {};
    }
  };

  const setInsightsCache = (cache) => {
    try { localStorage.setItem(INSIGHTS_CACHE_KEY, JSON.stringify(cache)); }
    catch (e) { console.warn('Failed to save cache, clearing:', e); localStorage.removeItem(INSIGHTS_CACHE_KEY); }
  };

  const makeInsightsKey = (serverDocId, page, text) => {
    const normText = (text || '').trim().substring(0, 100);
    const hash = normText.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
    return `${serverDocId}|${page}|${hash}|${normText.length}`;
  };

  const textsMatch = (text1, text2) => {
    const normalize = (t) => (t || '').trim().replace(/\s+/g, ' ');
    return normalize(text1) === normalize(text2);
  };

  useEffect(() => {
    const isPageRefresh = !window.performance || window.performance.navigation.type === 1;
    if (isPageRefresh) { clearInsightsCache(); }
    window.clearInsightsCache = clearInsightsCache;
    window.getInsightsCache = getInsightsCache;
    window.forceFreshInsights = forceFreshInsights;
    window.debugInsightsCache = () => {
      const cache = getInsightsCache();
      console.log('=== INSIGHTS CACHE DEBUG ===');
      console.log('Cache entries:', Object.keys(cache).length);
      Object.entries(cache).forEach(([key, value]) => {
        console.log(`Key: ${key}`);
        console.log(`  Text: ${value.selected_text?.substring(0, 50)}...`);
        console.log(`  Timestamp: ${new Date(value.__ts).toLocaleString()}`);
        console.log(`  Insights count: ${value.insights?.length || 0}`);
        console.log(`  Insights types: ${value.insights?.map(i => i.type).join(', ') || 'none'}`);
      });
      console.log('=== END DEBUG ===');
    };
    return () => {
      delete window.clearInsightsCache;
      delete window.getInsightsCache;
      delete window.forceFreshInsights;
      delete window.debugInsightsCache;
    };
  }, [clearInsightsCache]);

  useEffect(() => {
    if (uploadedFiles && uploadedFiles.length > 0) {
      setFiles(uploadedFiles);
      setSelectedFile(uploadedFiles[uploadedFiles.length - 1]);
    } else {
      const loadFromIndexedDB = async () => {
        try {
          const records = await getActivePDFs();
          if (records && records.length > 0) {
            const convertedFiles = records.map(record => {
              if (record.blob && record.blob instanceof Blob) {
                return new File([record.blob], record.name, { type: record.type || 'application/pdf', lastModified: record.uploadedAt ? new Date(record.uploadedAt).getTime() : Date.now() });
              } else if (record.dataUrl) {
                return base64ToFile(record.dataUrl, record.name, record.type, record.uploadedAt ? new Date(record.uploadedAt).getTime() : Date.now());
              } else { return null; }
            }).filter(Boolean);
            if (convertedFiles.length > 0) {
              setFiles(convertedFiles);
              setSelectedFile(convertedFiles[convertedFiles.length - 1]);
              const lastFile = convertedFiles[convertedFiles.length - 1];
              const tid = `${lastFile.name}-${Date.now()}`;
              setOpenTabs([{ id: tid, file: lastFile }]);
              setActiveTabId(tid);
            }
          }
        } catch (error) { console.error('Failed to load files from IndexedDB:', error); }
      };
      loadFromIndexedDB();
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (files && files.length > 0) return;
        const records = await getActivePDFs();
        if (cancelled) return;
        if (!Array.isArray(records) || records.length === 0) return;
        const restored = records.map((rec, idx) => {
          const blob = rec.blob;
          const fileObj = new File([blob], rec.name, { type: rec.type || 'application/pdf' });
          return { id: rec.id || `file-${Date.now()}-${idx}`, name: rec.name, size: rec.size, type: rec.type || 'application/pdf', uploadedAt: rec.uploadedAt || new Date().toISOString(), file: fileObj };
        });
        setFiles(restored);
        if (restored.length > 0) {
          const last = restored[restored.length - 1];
          setSelectedFile(last);
          const tid = `${last.id || last.name}-${Date.now()}`;
          setOpenTabs([{ id: tid, file: last }]);
          setActiveTabId(tid);
        }
      } catch (e) {}
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const resp = await listDocuments();
        const docs = Array.isArray(resp?.documents) ? resp.documents : [];
        const map = new Map();
        docs.forEach((d) => { if (d?.filename && d?.id) { map.set(String(d.filename).toLowerCase(), String(d.id)); } });
        if (!cancel) backendDocIdMapRef.current = map;
      } catch (e) { console.warn('Failed to sync backend documents:', e?.message || e); }
    })();
    return () => { cancel = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let intervalId;
    const reconcile = async () => {
      try {
        const records = await getActivePDFs();
        if (cancelled) return;
        const byKey = new Set((records || []).map((r) => `${r.name}|${r.size}`));
        if ((!records || records.length === 0) && files.length > 0) {
          setFiles([]); setOpenTabs([]); setActiveTabId(null); setSelectedFile(null); return;
        }
        const filtered = files.filter((f) => byKey.has(`${f.name}|${f.size}`));
        if (filtered.length !== files.length) {
          setFiles(filtered);
          setOpenTabs((prev) => prev.filter((t) => byKey.has(`${t.file?.name}|${t.file?.size}`)));
          if (selectedFile && !byKey.has(`${selectedFile.name}|${selectedFile.size}`)) {
            setSelectedFile(filtered[0] || null);
            setActiveTabId((prevId) => { const first = filtered[0]; const tab = first ? `${first.id || first.name}-${Date.now()}` : null; return tab; });
          }
        }
      } catch {}
    };
    intervalId = window.setInterval(reconcile, 2500);
    const onVis = () => { if (document.visibilityState === 'visible') reconcile(); };
    document.addEventListener('visibilitychange', onVis);
    reconcile();
    return () => { cancelled = true; if (intervalId) window.clearInterval(intervalId); document.removeEventListener('visibilitychange', onVis); };
  }, [files, selectedFile]);

  const handleInsightClick = async (insight) => {
    try {
      if (!insight) return;
      if (!selectedTextContext || !selectedTextContext.text || !selectedFile) { setSelectedInsight(insight); setIsModalOpen(true); return; }
      const serverDocId = getServerDocumentId();
      if (!serverDocId) { setSelectedInsight(insight); setIsModalOpen(true); return; }
      const page_no = selectedTextContext.page || 1;
      const respond = {
        type: insight.type || 'key_takeaways',
        title: insight.title || 'Insight',
        content: insight.content || insight.insight || '',
        source_documents: (Array.isArray(insight.source_documents) ? insight.source_documents.map(s => ({
          pdf_name: s.pdf_name || s.document || s.name || selectedFile?.name || 'Current Document',
          pdf_id: s.pdf_id || s.id || '',
          page: s.page || page_no,
        })) : [{ pdf_name: selectedFile?.name || 'Current Document', pdf_id: '', page: page_no }]),
        confidence: Number(insight.confidence) || 0.8,
      };
      const baseArgs = { selected_text: selectedTextContext.text, document_id: serverDocId, page_no, respond };
      let data; const insightType = insight.type;
      switch (insightType) {
        case 'key_takeaways':
        case 'key_takeaway':
          data = await fetchKeyTakeaway({ ...baseArgs, insight_type: 'key_takeaway' }); break;
        case 'did_you_know':
          data = await fetchDidYouKnow({ ...baseArgs, insight_type: 'did_you_know' }); break;
        case 'contradictions':
          data = await fetchContradictions({ ...baseArgs, insight_type: 'contradictions' }); break;
        case 'examples':
          data = await fetchExamples({ ...baseArgs, insight_type: 'examples' }); break;
        case 'cross_references':
          data = await fetchCrossReferences({ ...baseArgs, insight_type: 'cross_references' }); break;
        default:
          data = await fetchKeyTakeaway({ ...baseArgs, insight_type: 'key_takeaway' });
      }
      const merged = data ? { ...insight, ...data } : insight;
      setSelectedInsight(merged); setIsModalOpen(true);
    } catch (err) { setSelectedInsight(insight); setIsModalOpen(true); }
  };
  const handleCloseModal = () => { setIsModalOpen(false); setSelectedInsight(null); };

  const forceFreshInsights = useCallback(async () => {
    if (!selectedTextContext || !selectedTextContext.text || !selectedFile) return;
    try {
      clearInsightsCache(); setAnalysisLoading(true); setInsightsError('');
      const serverDocId = getServerDocumentId();
      if (!serverDocId) { throw new Error('Document mapping not found'); }
      const insights = await generateInsights({ selected_text: selectedTextContext.text, document_id: serverDocId, page_number: selectedTextContext.page || 1 });
      setInsightsData(insights || { insights: [], selected_text: '', processing_time: 0 });
    } catch (error) { setInsightsError(error?.message || 'Failed to generate insights'); }
    finally { setAnalysisLoading(false); }
  }, [selectedTextContext, selectedFile, getServerDocumentId, clearInsightsCache]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!selectedTextContext || !selectedFile) return;
      setPodcastData(null); setPodcastError(null); setPodcastGenerating(false);
      try {
        setConnectionsError(''); setAnalysisLoading(true); setHasConnectionsResponse(false);
        const serverDocId = getServerDocumentId(); if (!serverDocId) { throw new Error('Document mapping not found for connections'); }
        const payload = { selected_text: selectedTextContext.text, current_document_id: serverDocId, current_page: selectedTextContext.page || 1, context_before: '', context_after: '' };
        const data = await findConnections(payload);
        if (cancelled) return; setConnectionsData(data || { connections: [], summary: '', processing_time: 0 }); setInsightsGenerated(true);
      } catch (e) {
        if (cancelled) return; setConnectionsError(e?.message || 'Failed to load connections'); setConnectionsData({ connections: [], summary: '', processing_time: 0 });
      } finally {
        if (!cancelled) { setAnalysisLoading(false); setHasConnectionsResponse(true); }
      }
      try {
        if (cancelled) return; if (!selectedTextContext || !selectedTextContext.text || !selectedFile) return;
        const serverDocId2 = getServerDocumentId(); if (!serverDocId2) return; const page = selectedTextContext.page || 1;
        const cache = getInsightsCache(); const cacheKey = makeInsightsKey(serverDocId2, page, selectedTextContext.text); const cachedEntry = cache[cacheKey];
        if (cachedEntry && textsMatch(cachedEntry.selected_text, selectedTextContext.text)) { setInsightsData(cachedEntry); setInsightsError(''); return; }
        const insights = await generateInsights({ selected_text: selectedTextContext.text, document_id: serverDocId2, page_number: page });
        if (cancelled) return; setInsightsData(insights || { insights: [], selected_text: '', processing_time: 0 }); setInsightsError('');
        const next = { ...cache, [cacheKey]: { ...insights, __ts: Date.now() } }; setInsightsCache(next);
      } catch (ie) { if (cancelled) return; setInsightsError(ie?.message || 'Failed to generate insights'); }
    })();
    return () => { cancelled = true; };
  }, [selectedTextContext, selectedFile, getServerDocumentId]);

  const goldenTransition = { type: 'spring', stiffness: 400, damping: 30, mass: 0.8 };
  const staggerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  const processedFiles = useMemo(() => {
    return files.map((file) => ({ ...file, category: 'General', categoryColor: '#6B7280', pages: Math.floor(Math.random() * 50) + 10, confidence: Math.floor(Math.random() * 21) + 79, lastAccessed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), readingTime: Math.floor(Math.random() * 30) + 5 }));
  }, [files]);

  const filteredFiles = useMemo(() => {
    if (!searchTerm.trim()) return processedFiles;
    return processedFiles.filter(file => file.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [processedFiles, searchTerm]);

  const handleFileSelect = useCallback((file) => {
    setSelectedFile(file);
    setOpenTabs((prev) => {
      const exists = prev.find((t) => t.file?.name === file.name && t.file?.size === file.size);
      if (exists) { setActiveTabId(exists.id); return prev; }
      const newTab = { id: `${file.id || file.name}-${Date.now()}`, file };
      setActiveTabId(newTab.id); return [...prev, newTab];
    });
    setRightPanelVisible(false); setSelectedText(''); setSelectedTextContext(null);
  }, []);

  const onActivateTab = useCallback((tabId) => {
    const tab = openTabs.find(t => t.id === tabId);
    if (tab) { setActiveTabId(tabId); setSelectedFile(tab.file); setRightPanelVisible(false); }
  }, [openTabs]);

  const onCloseTab = useCallback((tabId) => {
    setOpenTabs((prev) => {
      const idx = prev.findIndex(t => t.id === tabId);
      if (idx === -1) return prev;
      const newTabs = prev.filter(t => t.id !== tabId);
      if (activeTabId === tabId) {
        const next = newTabs[idx] || newTabs[idx - 1] || null;
        setActiveTabId(next?.id || null);
        setSelectedFile(next?.file || null);
      }
      return newTabs;
    });
  }, [activeTabId]);

  const handleBackToUpload = useCallback(() => { navigate('/upload'); }, [navigate]);
  const toggleLeftPanel = useCallback(() => { setLeftPanelCollapsed(!leftPanelCollapsed); }, [leftPanelCollapsed]);
  const handlePDFZoom = useCallback((direction) => {
    const zoomLevels = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndex = zoomLevels.indexOf(pdfZoom);
    let newIndex = currentIndex;
    if (direction === 'in' && currentIndex < zoomLevels.length - 1) { newIndex = currentIndex + 1; }
    else if (direction === 'out' && currentIndex > 0) { newIndex = currentIndex - 1; }
    setPdfZoom(zoomLevels[newIndex]);
  }, [pdfZoom]);
  const handlePageNavigation = useCallback((direction) => {
    if (!selectedFile) return;
    const totalPages = selectedFile.pages || 1;
    if (direction === 'next' && currentPage < totalPages) { setCurrentPage(currentPage + 1); }
    else if (direction === 'prev' && currentPage > 1) { setCurrentPage(currentPage - 1); }
  }, [currentPage, selectedFile]);

  const handleNavigateToDocument = useCallback(async (documentName, pageNumber, snippet = null) => {
    try {
      const existingTab = openTabs.find(tab => tab.file && tab.file.name === documentName);
      if (existingTab) {
        setActiveTabId(existingTab.id);
        setTimeout(() => {
          if (adobeApisRef.current) {
            try {
              if (adobeApisRef.current.gotoLocation) {
                adobeApisRef.current.gotoLocation(pageNumber, 0, 0).catch(() => {});
              }
              if (snippet && snippet.trim().length > 3) { setTimeout(() => { handleHighlightText(snippet); }, 1000); }
            } catch {}
          }
        }, 300);
        return;
      }
      try {
        const documentsResponse = await listDocuments();
        const document = documentsResponse.documents.find(doc => doc.filename === documentName);
        if (!document) { toast.error(`Document "${documentName}" not found`); return; }
        const pdfUrl = `http://localhost:8080/static/pdfs/${encodeURIComponent(documentName)}`;
        const response = await fetch(pdfUrl);
        if (!response.ok) { throw new Error(`Failed to fetch PDF: ${response.statusText}`); }
        const blob = await response.blob();
        const file = new File([blob], documentName, { type: 'application/pdf' });
        const newFile = { file, name: documentName, id: document.id, size: blob.size, type: 'application/pdf', uploadedAt: new Date().toISOString() };
        setFiles(prevFiles => { const exists = prevFiles.find(f => f.name === documentName); if (exists) return prevFiles; return [...prevFiles, newFile]; });
        const newTabId = `${document.id}-${Date.now()}`;
        const newTab = { id: newTabId, file: newFile };
        setOpenTabs(prevTabs => [...prevTabs, newTab]);
        setActiveTabId(newTabId);
        setSelectedFile(newFile);
        setTimeout(() => {
          if (adobeApisRef.current) {
            try {
              if (adobeApisRef.current.gotoLocation) {
                adobeApisRef.current.gotoLocation(pageNumber, 0, 0).catch(() => {});
              }
              if (snippet && snippet.trim().length > 3) { setTimeout(() => { handleHighlightText(snippet); }, 1500); }
            } catch {}
          }
        }, 2000);
        toast.success(`Opened "${documentName}" and navigated to page ${pageNumber}`);
      } catch (error) { console.error('Failed to load document from backend:', error); toast.error(`Failed to load document "${documentName}"`); }
    } catch (error) { console.error('Error in handleNavigateToDocument:', error); toast.error('Failed to navigate to document'); }
  }, [openTabs, setActiveTabId, setOpenTabs, setSelectedFile, setFiles]);

  const handleHighlightText = useCallback((searchText) => {
    if (!adobeApisRef.current || !searchText || searchText.trim().length < 3) return;
    try {
      if (adobeApisRef.current.search) {
        adobeApisRef.current.search(searchText.trim()).then((searchObject) => {
          if (searchObject && searchObject.onResultsUpdate) {
            searchObject.onResultsUpdate((searchResult) => {
              if (searchResult.totalResults > 0) {
                toast.success(`Found "${searchText.substring(0, 30)}..." (${searchResult.totalResults} results)`);
              } else { toast.info(`Text "${searchText.substring(0, 30)}..." not found in document`); }
            });
          }
        }).catch(() => { toast.info(`Look for: "${searchText.substring(0, 50)}..."`); });
      } else { toast.info(`Look for: "${searchText.substring(0, 50)}..."`); }
    } catch {}
  }, []);

  const handleAdobeApisReady = useCallback((apis) => { adobeApisRef.current = apis; }, []);

  const handleGeneratePodcast = useCallback(async () => {
    try {
      setPodcastGenerating(true); setPodcastError(null);
      if (!selectedTextContext || !selectedTextContext.text) { toast.error('Please select some text first to generate a podcast'); return; }
      if (!selectedFile) { toast.error('No document selected'); return; }
      const serverDocId = getServerDocumentId(); if (!serverDocId) { toast.error('Document mapping not found. Please try reloading the page.'); return; }
      let insights = [];
      if (insightsData && insightsData.insights) { insights = insightsData.insights; }
      else {
        const cacheKey = `insights_${selectedFile.id}_${selectedTextContext.text.substring(0, 50)}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) { try { const parsedCache = JSON.parse(cached); if (parsedCache.data && parsedCache.data.insights) { insights = parsedCache.data.insights; } } catch (e) {} }
      }
      if (!insights || insights.length === 0) { toast.error('No insights available. Please generate insights first by selecting text.'); return; }
      const podcastResult = await generatePodcastAudio({ selected_text: selectedTextContext.text, insights: insights, document_id: serverDocId, format: 'podcast', duration: 'medium' });
      setPodcastData(podcastResult); toast.success('Podcast generated successfully!');
    } catch (error) { setPodcastError(error.message || 'Failed to generate podcast'); toast.error(error.message || 'Failed to generate podcast'); }
    finally { setPodcastGenerating(false); }
  }, [selectedTextContext, selectedFile, getServerDocumentId, insightsData]);

  const handleInsightsTabClick = useCallback(async () => {
    setRightPanelVisible(true); setActiveInsightTab('insights');
    try {
      if (!selectedTextContext || !selectedTextContext.text || !selectedFile) return;
      const serverDocId = getServerDocumentId(); if (!serverDocId) return;
      const page = selectedTextContext.page || 1; const cache = getInsightsCache();
      const cacheKey = makeInsightsKey(serverDocId, page, selectedTextContext.text);
      const cachedEntry = cache[cacheKey];
      if (cachedEntry && textsMatch(cachedEntry.selected_text, selectedTextContext.text) && (!insightsData || (insightsData.insights || []).length === 0)) {
        setInsightsData(cachedEntry); setInsightsError('');
      }
    } catch (e) { }
  }, [selectedTextContext, selectedFile, getServerDocumentId, setActiveInsightTab, setRightPanelVisible, insightsData]);

  const handleFileUpload = useCallback(async (incomingFiles) => {
    if (!Array.isArray(incomingFiles) || incomingFiles.length === 0) return;
    const maxSize = 50 * 1024 * 1024; const allowedTypes = ['application/pdf'];
    const currentNames = new Set(files.map(f => f.name + '|' + f.size));
    const valid = [];
    incomingFiles.forEach((file) => {
      if (!allowedTypes.includes(file.type)) { toast.error(`${file.name}: Only PDF files are supported`); return; }
      if (file.size > maxSize) { toast.error(`${file.name}: File size must be less than 50MB`); return; }
      const key = file.name + '|' + file.size; if (currentNames.has(key)) { toast.error(`${file.name}: File already uploaded`); return; }
      valid.push(file);
    });
    if (valid.length === 0) return;
    const now = new Date();
    const processedNewFiles = valid.map((file, index) => ({ id: `file-${Date.now()}-${index}`, name: file.name, size: file.size, type: file.type, file, uploadedAt: now.toISOString(), category: 'General', categoryColor: '#6B7280', pages: Math.floor(Math.random() * 50) + 10, confidence: Math.floor(Math.random() * 21) + 79, lastAccessed: now, readingTime: Math.floor(Math.random() * 30) + 5 }));
    try { await uploadDocuments(processedNewFiles); toast.success(`${processedNewFiles.length} document(s) uploaded`); }
    catch (e) { toast.error(e.message || 'Failed to upload to server'); return; }
    try {
      const records = await Promise.all(processedNewFiles.map(async (f) => ({ id: f.id, name: f.name, size: f.size, type: f.type, uploadedAt: f.uploadedAt, blob: f.file })));
      await upsertPDFs(records, STORAGE_TTL_MS);
    } catch (e) { toast.error('Failed to persist files locally'); }
    setFiles(prev => {
      const next = [...prev, ...processedNewFiles]; const latest = processedNewFiles[processedNewFiles.length - 1]; setSelectedFile(latest);
      setOpenTabs((tabs) => { const exists = tabs.find(t => t.file?.name === latest.name && t.file?.size === latest.size); if (exists) { setActiveTabId(exists.id); return tabs; } const newTab = { id: `${latest.id || latest.name}-${Date.now()}`, file: latest }; setActiveTabId(newTab.id); return [...tabs, newTab]; });
      setRightPanelVisible(false); return next;
    });
  }, [files, setRightPanelVisible]);

  const handleFileDelete = useCallback(async (fileId) => {
    try {
      const fileToDelete = files.find(f => f.id === fileId);
      if (!fileToDelete) { toast.error('File not found'); return; }
      try { await deletePDF(fileId); } catch (e) { }
      setFiles(prev => prev.filter(f => f.id !== fileId));
      setOpenTabs(prev => prev.filter(tab => tab.file?.id !== fileId));
      if (selectedFile?.id === fileId) {
        const remainingFiles = files.filter(f => f.id !== fileId); setSelectedFile(remainingFiles.length > 0 ? remainingFiles[0] : null);
        if (remainingFiles.length === 0) { setActiveTabId(null); }
        else {
          setOpenTabs(prev => { const remainingTabs = prev.filter(tab => tab.file?.id !== fileId); if (remainingTabs.length > 0) { setActiveTabId(remainingTabs[0].id); } return remainingTabs; });
        }
      }
      toast.success(`${fileToDelete.name} deleted successfully`);
    } catch (error) { toast.error('Failed to delete file'); }
  }, [files, selectedFile, setOpenTabs, setActiveTabId]);

  const formatFileSize = (bytes) => { if (bytes === 0) return '0 Bytes'; const k = 1024; const sizes = ['Bytes', 'KB', 'MB', 'GB']; const i = Math.floor(Math.log(bytes) / Math.log(k)); return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]; };
  const formatTimestamp = (date) => { const now = new Date(); const diffInHours = Math.floor((now - date) / (1000 * 60 * 60)); if (diffInHours < 1) return 'Just now'; if (diffInHours < 24) return `${diffInHours}h ago`; return 'Yesterday'; };
  const formatReadingTime = (minutes) => `${minutes}m read`;
  const handleSearchChange = useCallback((e) => { setSearchTerm(e.target.value); }, []);

  if (!files || files.length === 0) { return <EmptyState handleBackToUpload={handleBackToUpload} />; }

  return (
    <motion.div ref={containerRef} initial="hidden" animate="visible" variants={staggerVariants} className="h-screen flex flex-col bg-gradient-to-br from-[#FAFAF9] to-[#F3F4F6] overflow-hidden">
      <HeaderBar
        files={files}
        selectedFile={selectedFile}
        rightPanelVisible={rightPanelVisible}
        setRightPanelVisible={setRightPanelVisible}
        handleBackToUpload={handleBackToUpload}
        itemVariants={itemVariants}
  onOpenYouTube={onOpenYouTube}
      />

      <div className="flex-1 flex overflow-hidden">
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
          onNavigateToDocument={handleNavigateToDocument}
        />

        <CenterPanel
          ref={centerPanelRef}
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
          onAdobeApisReady={handleAdobeApisReady}
        />

        <RightPanel
          rightPanelVisible={rightPanelVisible}
          selectedTextContext={selectedTextContext}
          activeInsightTab={activeInsightTab}
          analysisLoading={analysisLoading}
          podcastGenerating={podcastGenerating}
          podcastData={podcastData}
          podcastError={podcastError}
          setRightPanelVisible={setRightPanelVisible}
          setActiveInsightTab={setActiveInsightTab}
          handleGeneratePodcast={handleGeneratePodcast}
          goldenTransition={goldenTransition}
          onInsightClick={handleInsightClick}
          connectionsData={connectionsData}
          connectionsError={connectionsError}
          onInsightsTabClick={handleInsightsTabClick}
          insightsData={insightsData}
          insightsError={insightsError}
          hasConnectionsResponse={hasConnectionsResponse}
          onNavigateToDocument={handleNavigateToDocument}
        />
  <InsightDetailModal insight={selectedInsight} isOpen={isModalOpen} onClose={handleCloseModal} />
  <YouTubeModal isOpen={youtubeOpen} onClose={() => setYouTubeOpen(false)} videos={youtubeVideos} query={youtubeQuery} loading={youtubeLoading} />
      </div>
    </motion.div>
  );
};

export default PDFAnalysisWorkspace;
