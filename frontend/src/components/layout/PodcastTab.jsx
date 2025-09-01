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

const PodcastTab = ({ 
  podcastGenerating, 
  podcastData,
  podcastError,
  handleGeneratePodcast,
  premiumEasing,
  selectedTextContext
}) => {
  // State management
  const [hasPodcast, setHasPodcast] = useState(false);
  const [podcastUrl, setPodcastUrl] = useState(null);
  const [podcastBlob, setPodcastBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [language, setLanguage] = useState('en');
  
  // Audio ref for playback control
  const audioRef = useRef(null);

  // Debug logging for state changes
  React.useEffect(() => {
    console.log('PodcastTab state:', {
      podcastGenerating,
      hasPodcast,
      error,
      podcastError,
      podcastData: !!podcastData
    });
  }, [podcastGenerating, hasPodcast, error, podcastError, podcastData]);

  // Reset state function - defined early to avoid reference errors
  const resetPodcastState = useCallback(() => {
    setHasPodcast(false);
    setPodcastUrl(null);
    setPodcastBlob(null);
    setError(null);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setTranscript('');
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  // Effect to handle podcast data updates
  React.useEffect(() => {
    if (podcastData && podcastData.success) {
      setPodcastUrl(podcastData.audioUrl);
      setPodcastBlob(podcastData.audioBlob);
      setTranscript(podcastData.transcript || '');
      setDuration(podcastData.duration || 0);
      setHasPodcast(true);
      setError(null);
      console.log('Podcast data loaded:', podcastData);
    }
  }, [podcastData]);

  // Effect to handle podcast errors
  React.useEffect(() => {
    if (podcastError) {
      setError(podcastError);
      setHasPodcast(false);
    }
  }, [podcastError]);

  // Effect to sync generating state and handle cleanup
  React.useEffect(() => {
    if (!podcastGenerating && error && !podcastError) {
      // Clear error when generation stops and no external error
      setError(null);
    }
  }, [podcastGenerating, podcastError, error]);
  
  // Download podcast function
  const handleDownload = async () => {
    if (!podcastBlob && !podcastUrl) return;
    
    try {
      setIsDownloading(true);
      
      // Use the blob if available (preferred)
      if (podcastBlob) {
        const url = URL.createObjectURL(podcastBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-podcast-${Date.now()}.wav`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else if (podcastUrl) {
        // Fallback to URL (for testing or external URLs)
        try {
          const response = await fetch(podcastUrl, {
            mode: 'cors',
            headers: {
              'Accept': 'audio/*'
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch audio file');
          }
          
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `ai-podcast-${Date.now()}.wav`;
          document.body.appendChild(a);
          a.click();
          URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
        } catch (fetchError) {
          console.log('Direct download failed, opening in new tab:', fetchError);
          window.open(podcastUrl, '_blank');
        }
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
  
  // Enhanced podcast generation handler - delegates to parent
  const handlePodcastGeneration = useCallback(async () => {
    // Pass selected language to parent handler
    handleGeneratePodcast({ language });
  }, [handleGeneratePodcast, language]);
  
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
        {podcastGenerating ? (
          /* Generation Loading State */
          <motion.div
            key="generating"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-white border border-[#FF0000]/30 rounded-xl p-8 shadow-sm"
          >
            <div className="text-center">
              {/* Simple spinner */}
              <motion.div 
                className="w-16 h-16 mx-auto mb-6 relative"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <div className="w-full h-full border-4 border-red-100 rounded-full" />
                <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-[#B91C1C] rounded-full" />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Creating Your Podcast
                </h3>
                <p className="text-gray-600 max-w-sm mx-auto">
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
            className="bg-white border border-red-200 rounded-xl p-8 shadow-sm"
          >
            <div className="text-center">
              <motion.div 
                className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-xl flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
              >
                <AlertCircle className="w-8 h-8 text-red-600" />
              </motion.div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Generation Failed
              </h3>
              <p className="text-gray-600 max-w-sm mx-auto mb-6">
                {error || 'Something went wrong while generating your podcast. Please try again.'}
              </p>
              
              <motion.button
                onClick={handlePodcastGeneration}
                className="bg-[#DC2626] text-white font-medium py-3 px-6 rounded-lg hover:bg-[#B91C1C] transition-colors duration-200 flex items-center space-x-2 mx-auto"
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
              className="bg-white border border-gray-200 rounded-xl shadow-sm"
            >
              {/* Podcast Header */}
              <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-4">
                    <motion.div 
                      className="w-12 h-12 bg-[#DC2626] rounded-xl flex items-center justify-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Mic className="w-6 h-6 text-white" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        AI Analysis Discussion
                      </h3>
                      <p className="text-sm text-gray-600">
                        Generated from your document insights • {duration ? formatTime(duration) : '--:--'}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
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

                {/* Audio Player */}
                <div className="p-6">
                  <div className="relative">
                    {/* Waveform visualization placeholder */}
                    <div className="flex items-center justify-center space-x-1 h-16 mb-6 bg-gray-50 rounded-xl border border-gray-100">
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
                        className="w-12 h-12 bg-[#DC2626] rounded-full flex items-center justify-center text-white shadow-md hover:bg-[#B91C1C] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                          className="relative h-2 bg-gray-200 rounded-full overflow-hidden cursor-pointer"
                          onClick={handleProgressClick}
                        >
                          <motion.div 
                            className="absolute left-0 top-0 h-full bg-[#DC2626] rounded-full"
                            style={{ 
                              width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' 
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-600 mt-2">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>

                      {/* Download Button */}
                      <div className="flex items-center space-x-3">
                        <motion.button
                          onClick={handleDownload}
                          disabled={!podcastUrl || isDownloading}
                          className="p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                            <Download className="w-4 h-4 text-gray-600 hover:text-[#DC2626] transition-colors duration-200" />
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
              className="relative bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#DC2626] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mic className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-base">
                      Generate New Podcast
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Create another AI discussion from your content
                    </p>
                  </div>
                </div>
                
                {/* Language Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg py-2.5 px-3 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626] transition-colors duration-200"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="hi">Hindi</option>
                    <option value="ja">Japanese</option>
                    <option value="zh">Chinese</option>
                  </select>
                </div>
                
                {/* Generate Button */}
                <motion.button
                  onClick={() => {
                    resetPodcastState();
                    handlePodcastGeneration();
                  }}
                  disabled={podcastGenerating}
                  className="w-full bg-[#DC2626] text-white font-medium py-3 px-4 rounded-lg hover:bg-[#B91C1C] transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: podcastGenerating ? 1 : 1.01 }}
                  whileTap={{ scale: podcastGenerating ? 1 : 0.99 }}
                >
                  {podcastGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Generate Podcast</span>
                    </>
                  )}
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
            className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="space-y-6">
              <header className="text-center">
                <div className="w-16 h-16 bg-[#DC2626] rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Mic className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 text-xl mb-2">
                  AI Podcast Generator
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Transform your document analysis into an engaging audio discussion
                </p>
              </header>

              {/* Language selector */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg py-2.5 px-3 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626] transition-colors duration-200"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="hi">Hindi</option>
                  <option value="ja">Japanese</option>
                  <option value="zh">Chinese</option>
                </select>
                <p className="text-xs text-gray-500">
                  Audio will be generated in the selected language with native pronunciation
                </p>
              </div>
              
              <motion.button
                onClick={handlePodcastGeneration}
                disabled={podcastGenerating}
                className="w-full bg-[#DC2626] text-white font-medium py-3 px-4 rounded-lg hover:bg-[#B91C1C] transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: podcastGenerating ? 1 : 1.01 }}
                whileTap={{ scale: podcastGenerating ? 1 : 0.99 }}
              >
                {podcastGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    <span>Generate AI Podcast</span>
                  </>
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
