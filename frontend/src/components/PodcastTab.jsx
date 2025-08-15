import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play,
  Pause,
  Mic,
  Download,
  ArrowRight,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { generatePodcast, downloadPodcast } from '../services/api';

/**
 * PODCAST TAB COMPONENT
 * 
 * Features:
 * - Initial generator state
 * - 3-second loading animation
 * - Premium audio player with waveform visualization
 * - Generate new podcast functionality
 * - Minimal and elegant UX
 */
const PodcastTab = ({ 
  podcastGenerating, 
  handleGeneratePodcast,
  premiumEasing,
  documentContent = null, // Add document content as prop
  documentIds = [] // Add document IDs as prop
}) => {
  // State management
  const [hasPodcast, setHasPodcast] = useState(false);
  const [podcastUrl, setPodcastUrl] = useState(null);
  const [podcastId, setPodcastId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Audio ref for playback control
  const audioRef = useRef(null);
  
  // API call to generate podcast using the actual service
  const generatePodcastAPI = async () => {
    try {
      setError(null);
      setIsGenerating(true);
      
      // FOR TESTING: Use a sample audio URL (uncomment the lines below)
      setTimeout(() => {
        // Try one of these direct audio URLs:
        setPodcastUrl('https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'); // Known to work for downloads
        // setPodcastUrl('https://actions.google.com/sounds/v1/animals/animal_squealing.ogg'); // Alternative
        // setPodcastUrl('https://file-examples.com/storage/fef68c8e4f86b4e98728faf/2017/11/file_example_MP3_700KB.mp3'); // Alternative
        setPodcastId('test-podcast-1234');
        setHasPodcast(true);
        setIsGenerating(false);
      }, 2000);
      return;
      
      // Use the actual API service
      const response = await generatePodcast(
        documentContent || 'Document analysis content', 
        documentIds
      );
      
      if (response.url || response.audioUrl) {
        setPodcastUrl(response.url || response.audioUrl);
        setPodcastId(response.id || response.podcastId);
        setHasPodcast(true);
        setIsGenerating(false);
      } else {
        throw new Error('No podcast URL received from API');
      }
    } catch (err) {
      console.error('Error generating podcast:', err);
      setError(err.message);
      setIsGenerating(false);
    }
  };
  
  // Download podcast function
  const handleDownload = async () => {
    if (!podcastUrl) return;
    
    try {
      setIsDownloading(true);
      
      // For testing mode (direct URLs) - fetch and download the audio file
      if (podcastUrl.startsWith('http')) {
        try {
          // Fetch the audio file
          const response = await fetch(podcastUrl, {
            mode: 'cors',
            headers: {
              'Accept': 'audio/*'
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch audio file');
          }
          
          // Get the blob
          const blob = await response.blob();
          
          // Create download link
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          
          // Get file extension from URL or default to mp3
          const urlParts = podcastUrl.split('.');
          const extension = urlParts[urlParts.length - 1] || 'mp3';
          a.download = `ai-podcast-${podcastId || Date.now()}.${extension}`;
          
          // Trigger download
          document.body.appendChild(a);
          a.click();
          
          // Cleanup
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
        } catch (fetchError) {
          console.log('Direct download failed, opening in new tab:', fetchError);
          // Fallback: open in new tab
          window.open(podcastUrl, '_blank');
        }
      } else if (podcastId) {
        // For production mode - use the API
        const blob = await downloadPodcast(podcastId);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `podcast-${podcastId}.mp3`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Error downloading podcast:', err);
      setError('Failed to download podcast. Please try again.');
      
      // Ultimate fallback: open in new tab
      if (podcastUrl) {
        window.open(podcastUrl, '_blank');
      }
    } finally {
      setIsDownloading(false);
    }
  };
  
  // Enhanced podcast generation handler
  const handlePodcastGeneration = useCallback(async () => {
    handleGeneratePodcast();
    await generatePodcastAPI();
  }, [handleGeneratePodcast, documentContent, documentIds]);
  
  // Reset state function
  const resetPodcastState = useCallback(() => {
    setHasPodcast(false);
    setPodcastUrl(null);
    setPodcastId(null);
    setError(null);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setIsGenerating(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);
  
  // Audio playback controls
  const togglePlayPause = useCallback(() => {
    if (!audioRef.current || !podcastUrl) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying, podcastUrl]);
  
  // Audio event handlers
  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);
  
  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, []);
  
  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);
  
  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Progress bar click handler
  const handleProgressClick = useCallback((e) => {
    if (!audioRef.current || !duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);

  return (
    <motion.section
      key="podcast"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: premiumEasing }}
      className="space-y-6"
    >
      <AnimatePresence mode="wait">
        {isGenerating ? (
          /* Generation Loading State */
          <motion.div
            key="generating"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="relative bg-gradient-to-br from-[#DC2626]/5 via-[#DC2626]/3 to-transparent border border-[#DC2626]/20 rounded-2xl p-12 overflow-hidden"
            style={{
              backdropFilter: 'blur(15px) saturate(150%)',
              boxShadow: '0 8px 32px rgba(220, 38, 38, 0.08)'
            }}
          >
            <div className="text-center relative z-10">
              {/* Elegant spinner */}
              <motion.div 
                className="w-16 h-16 mx-auto mb-6 relative"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <div className="w-full h-full border-4 border-[#DC2626]/20 rounded-full" />
                <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-[#DC2626] rounded-full" />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">
                  Creating Your Podcast
                </h3>
                <p className="text-[#1A1A1A] opacity-60 max-w-sm mx-auto leading-relaxed">
                  AI is analyzing your content and generating an engaging audio discussion...
                </p>
              </motion.div>
            </div>
          </motion.div>
        ) : error ? (
          /* Error State */
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="relative bg-gradient-to-br from-red-50 via-red-25 to-transparent border border-red-200 rounded-2xl p-8 overflow-hidden"
          >
            <div className="text-center relative z-10">
              <motion.div 
                className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
              >
                <AlertCircle className="w-8 h-8 text-red-600" />
              </motion.div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Generation Failed
              </h3>
              <p className="text-gray-600 max-w-sm mx-auto leading-relaxed mb-6">
                {error || 'Something went wrong while generating your podcast. Please try again.'}
              </p>
              
              <motion.button
                onClick={handlePodcastGeneration}
                className="bg-gradient-to-r from-[#DC2626] to-[#B91C1C] text-white font-medium py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center space-x-2 mx-auto"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowRight className="w-4 h-4" />
                <span>Try Again</span>
              </motion.button>
            </div>
          </motion.div>
        ) : hasPodcast ? (
          <motion.div
            key="generator-or-player"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Generated Podcast Player */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: premiumEasing }}
              className="relative bg-gradient-to-br from-white via-[#FAFAF9]/80 to-[#F3F4F6]/50 border border-[#E5E7EB]/30 rounded-2xl overflow-hidden"
              style={{
                backdropFilter: 'blur(15px) saturate(120%)',
                boxShadow: '0 8px 32px rgba(26, 26, 26, 0.08)'
              }}
            >
              {/* Podcast Header */}
              <div className="p-6 border-b border-[#E5E7EB]/20">
                  <div className="flex items-center space-x-4">
                    <motion.div 
                      className="w-12 h-12 bg-gradient-to-r from-[#DC2626] to-[#B91C1C] rounded-xl flex items-center justify-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Mic className="w-6 h-6 text-white" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-[#1A1A1A] mb-1">
                        AI Analysis Discussion
                      </h3>
                      <p className="text-sm text-[#1A1A1A] opacity-60">
                        Generated from your document insights • {duration ? formatTime(duration) : '--:--'}
                      </p>
                    </div>
                    <div className="text-xs text-[#1A1A1A] opacity-40 font-medium">
                      Just now
                    </div>
                  </div>
                </div>

                {/* Hidden Audio Element */}
                {podcastUrl && (
                  <audio
                    ref={audioRef}
                    src={podcastUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={handleEnded}
                    preload="metadata"
                  />
                )}

                {/* Premium Audio Player */}
                <div className="p-6">
                  <div className="relative">
                    {/* Waveform visualization placeholder */}
                    <div className="flex items-center justify-center space-x-1 h-16 mb-6 bg-[#FAFAF9]/60 rounded-xl border border-[#E5E7EB]/20">
                      {Array.from({ length: 50 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-[#DC2626]/30 rounded-full"
                          style={{ height: `${Math.random() * 32 + 8}px` }}
                          animate={{ 
                            scaleY: isPlaying ? [1, Math.random() * 1.5 + 0.5, 1] : 1,
                            opacity: isPlaying ? [0.3, 0.8, 0.3] : 0.3
                          }}
                          transition={{ 
                            duration: 2, 
                            repeat: isPlaying ? Infinity : 0,
                            delay: i * 0.05,
                            ease: "easeInOut"
                          }}
                        />
                      ))}
                    </div>

                    {/* Player Controls */}
                    <div className="flex items-center space-x-6">
                      {/* Play/Pause Button */}
                      <motion.button
                        onClick={togglePlayPause}
                        disabled={!podcastUrl}
                        className="w-12 h-12 bg-gradient-to-r from-[#DC2626] to-[#B91C1C] rounded-full flex items-center justify-center text-white shadow-lg group disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: podcastUrl ? 1.05 : 1 }}
                        whileTap={{ scale: podcastUrl ? 0.95 : 1 }}
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5 ml-0.5" />
                        )}
                      </motion.button>

                      {/* Progress Bar */}
                      <div className="flex-1">
                        <div 
                          className="relative h-2 bg-[#E5E7EB]/40 rounded-full overflow-hidden cursor-pointer"
                          onClick={handleProgressClick}
                        >
                          <motion.div 
                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#DC2626] to-[#B91C1C] rounded-full"
                            style={{ 
                              width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' 
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-[#1A1A1A] opacity-60 mt-2">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>

                      {/* Download Button */}
                      <div className="flex items-center space-x-3">
                        <motion.button
                          onClick={handleDownload}
                          disabled={!podcastUrl || isDownloading}
                          className="p-2 rounded-lg hover:bg-[#FAFAF9] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group/download"
                          whileHover={{ scale: podcastUrl && !isDownloading ? 1.1 : 1 }}
                          title={isDownloading ? "Downloading..." : "Download Podcast"}
                        >
                          {isDownloading ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Loader2 className="w-4 h-4 text-[#DC2626]" />
                            </motion.div>
                          ) : (
                            <Download className="w-4 h-4 text-[#1A1A1A] opacity-60 group-hover/download:opacity-100 group-hover/download:text-[#DC2626] transition-all duration-300" />
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </div>
              </div>
            </motion.div>

            {/* Generate New Podcast Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="relative bg-gradient-to-br from-[#DC2626]/5 via-[#DC2626]/3 to-transparent border border-[#DC2626]/20 rounded-2xl p-6 overflow-hidden group"
              style={{
                backdropFilter: 'blur(15px) saturate(150%)',
                boxShadow: '0 4px 20px rgba(220, 38, 38, 0.06)'
              }}
            >
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <motion.div 
                    className="w-10 h-10 bg-gradient-to-r from-[#DC2626] to-[#B91C1C] rounded-xl flex items-center justify-center"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Mic className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h4 className="font-bold text-[#1A1A1A] text-sm mb-1">
                      Generate New Podcast
                    </h4>
                    <p className="text-xs text-[#1A1A1A] opacity-60">
                      Create another AI discussion from your content
                    </p>
                  </div>
                </div>
                
                <motion.button
                  onClick={() => {
                    resetPodcastState();
                    handlePodcastGeneration();
                  }}
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-[#DC2626] to-[#B91C1C] text-white font-medium py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center space-x-2 group/btn relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: isGenerating ? 1 : 1.02 }}
                  whileTap={{ scale: isGenerating ? 1 : 0.98 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  <span className="text-sm">{isGenerating ? 'Generating...' : 'Generate'}</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          /* Initial Generator State */
          <motion.div
            key="initial-generator"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative bg-gradient-to-br from-[#DC2626]/5 via-[#DC2626]/3 to-transparent border border-[#DC2626]/20 rounded-2xl p-8 overflow-hidden group"
            whileHover={{ scale: 1.01 }}
            style={{
              backdropFilter: 'blur(15px) saturate(150%)',
              boxShadow: '0 8px 32px rgba(220, 38, 38, 0.08)'
            }}
          >
            {/* Ambient background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#DC2626] to-transparent" />
            </div>
            
            <div className="relative z-10">
              <header className="flex items-center space-x-4 mb-8">
                <motion.div 
                  className="w-14 h-14 bg-gradient-to-r from-[#DC2626] to-[#B91C1C] rounded-2xl flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Mic className="w-7 h-7 text-white" />
                </motion.div>
                <div>
                  <h3 className="font-black text-[#1A1A1A] text-xl mb-1">
                    AI Podcast Generator
                  </h3>
                  <p className="text-sm text-[#1A1A1A] opacity-60 leading-relaxed">
                    Transform your analysis into an engaging audio discussion
                  </p>
                </div>
              </header>
              
              <motion.button
                onClick={handlePodcastGeneration}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-[#DC2626] to-[#B91C1C] text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-3 group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: isGenerating ? 1 : 1.02, y: isGenerating ? 0 : -1 }}
                whileTap={{ scale: isGenerating ? 1 : 0.98 }}
                style={{
                  boxShadow: '0 4px 16px rgba(220, 38, 38, 0.2)'
                }}
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                {isGenerating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
                <span>{isGenerating ? 'Generating AI Podcast...' : 'Generate AI Podcast'}</span>
                {!isGenerating && (
                  <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform duration-300" />
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default PodcastTab;
