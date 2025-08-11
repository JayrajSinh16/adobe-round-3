import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  Lightbulb,
  Clock,
  TrendingUp,
  BookOpen,
  Search,
  PenTool,
  BarChart3,
  Zap,
  Plus,
  X,
  Brain,
  Eye,
  Star,
  Settings,
  ChevronDown,
  Check
} from 'lucide-react';

const JobToBeDone = () => {
  const [selectedJob, setSelectedJob] = useState('');
  const [customJob, setCustomJob] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [urgency, setUrgency] = useState('moderate');
  const [scope, setScope] = useState('comprehensive');
  const [tags, setTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showUrgencyDropdown, setShowUrgencyDropdown] = useState(false);
  const [showScopeDropdown, setShowScopeDropdown] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const { selectedPersona, uploadedFiles } = location.state || {};

  useEffect(() => {
    if (selectedPersona) {
      setAvailableTags(generateTagsForPersona(selectedPersona));
    }
  }, [selectedPersona]);

  const generateTagsForPersona = useCallback((persona) => {
    const tagMap = {
      researcher: ['methodology', 'data analysis', 'literature review', 'citations', 'frameworks'],
      analyst: ['financial metrics', 'trends', 'forecasting', 'benchmarking', 'KPIs'],
      student: ['key concepts', 'examples', 'summaries', 'exam prep', 'definitions'],
      entrepreneur: ['opportunities', 'innovation', 'market research', 'business models', 'trends'],
      journalist: ['facts', 'quotes', 'sources', 'timeline', 'angles'],
      custom: ['insights', 'analysis', 'research', 'data', 'recommendations']
    };
    return tagMap[persona.id] || tagMap.custom;
  }, []);

  const getJobSuggestions = (persona) => {
    const suggestions = {
      researcher: [
        "Prepare a comprehensive literature review focusing on methodologies and key findings",
        "Analyze research gaps and identify future research opportunities",
        "Compare different approaches and methodologies across studies",
        "Extract key data points and statistical findings for meta-analysis"
      ],
      analyst: [
        "Analyze financial performance trends and identify key growth drivers",
        "Benchmark against industry standards and competitor performance", 
        "Identify market opportunities and potential risk factors",
        "Prepare executive summary with strategic recommendations"
      ],
      student: [
        "Create comprehensive study notes focusing on key concepts and examples",
        "Identify important topics likely to appear on upcoming exams",
        "Understand complex theories through practical examples and case studies",
        "Summarize main points for quick review and memorization"
      ],
      entrepreneur: [
        "Identify market opportunities and validate business ideas",
        "Research innovative business models and scaling strategies",
        "Analyze customer insights and market trends",
        "Study successful case studies and implementation strategies"
      ],
      journalist: [
        "Research background information and gather supporting facts",
        "Find expert quotes and credible sources for story development",
        "Verify claims and cross-reference information across sources",
        "Develop story angles and identify key narrative threads"
      ],
      custom: [
        "Extract key insights relevant to my specific objectives",
        "Analyze content from my unique perspective and requirements",
        "Focus on information that supports my particular use case",
        "Generate customized recommendations based on my needs"
      ]
    };
    return suggestions[persona?.id] || suggestions.custom;
  };

  const handleJobSelect = useCallback((job) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSelectedJob(job);
    setShowCustomInput(false);
    setCustomJob('');
    
    // Reset animation lock
    setTimeout(() => setIsAnimating(false), 300);
  }, [isAnimating]);

  const handleCustomJobToggle = useCallback(() => {
    setShowCustomInput(true);
    setSelectedJob('');
  }, []);

  const handleCustomJobChange = useCallback((e) => {
    setCustomJob(e.target.value);
  }, []);

  const handleCustomJobContinue = useCallback(() => {
    if (customJob.trim()) {
      setSelectedJob(customJob.trim());
      setShowCustomInput(false);
    }
  }, [customJob]);

  const handleCustomJobDiscard = useCallback(() => {
    setCustomJob('');
    setShowCustomInput(false);
    // If we're editing a custom goal, clear the selection
    if (selectedJob && !getJobSuggestions(selectedPersona).includes(selectedJob)) {
      setSelectedJob('');
    }
  }, [selectedJob, selectedPersona]);

  const addTag = useCallback((tag) => {
    if (!tags.includes(tag)) {
      setTags(prev => [...prev, tag]);
    }
  }, [tags]);

  const removeTag = useCallback((tagToRemove) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  }, []);

  const handleContinue = useCallback(() => {
    const finalJob = customJob || selectedJob;
    if (finalJob.trim() && !isAnimating) {
      navigate('/result-analysis', {
        state: {
          selectedPersona,
          uploadedFiles,
          jobToBeDone: finalJob.trim(),
          urgency,
          scope,
          tags
        }
      });
    }
  }, [customJob, selectedJob, selectedPersona, uploadedFiles, urgency, scope, tags, navigate, isAnimating]);

  const urgencyOptions = [
    { value: 'low', label: 'Low Priority', icon: Clock },
    { value: 'moderate', label: 'Moderate', icon: TrendingUp },
    { value: 'high', label: 'Urgent', icon: Zap }
  ];

  const scopeOptions = [
    { value: 'focused', label: 'Focused Analysis', icon: Search },
    { value: 'comprehensive', label: 'Comprehensive Review', icon: BookOpen },
    { value: 'strategic', label: 'Strategic Overview', icon: BarChart3 }
  ];

  const getSelectedUrgencyOption = () => urgencyOptions.find(option => option.value === urgency);
  const getSelectedScopeOption = () => scopeOptions.find(option => option.value === scope);

  if (!selectedPersona) {
    return (
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-[#FAFAF9] via-white to-[#F8F9FA] flex items-center justify-center p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <div className="text-center">
          <motion.div
            className="p-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-[#E5E7EB]/30 inline-block mb-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Brain className="h-12 w-12 text-[#DC2626] mx-auto" />
          </motion.div>
          <motion.p 
            className="text-xl text-[#1A1A1A]/60"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            Please select a persona first to continue.
          </motion.p>
        </div>
      </motion.div>
    );
  }

  return (
    
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-[#FAFAF9] via-white to-[#F8F9FA] flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      <div className="w-full max-w-7xl">
        {/* Premium progress indicator */}
                    {/* <div className="inline-flex items-center justify-center space-x-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg border border-white/20 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#DC2626] to-[#B91C1C] rounded-xl flex items-center justify-center">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-[#1A1A1A] opacity-70">Step 2 of 3</span>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-[#059669] rounded-full"></div>
                        <div className="w-2 h-2 bg-[#DC2626] rounded-full"></div>
                        <div className="w-2 h-2 bg-[#E5E7EB] rounded-full"></div>
                      </div>
                    </div> */}
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        >
          <div className="flex items-center justify-center mb-4">
            <motion.div
              className="p-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-[#E5E7EB]/30"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Brain className="h-12 w-12 text-[#DC2626]" />
            </motion.div>
          </div>
          
          <motion.h1 
            className="text-5xl md:text-6xl font-light text-[#1A1A1A] mb-4 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          >
            Define Your{' '}
            <span className="font-normal text-[#DC2626]">Mission</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-[#1A1A1A]/60 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          >
            What specific insights do you want to extract from your documents? 
            Be precise about your analytical goals.
          </motion.p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Job Selection Section */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-sm border border-[#E5E7EB]/30">
              <div className="flex items-center mb-8">
                <Eye className="h-6 w-6 text-[#DC2626] mr-3" />
                <h2 className="text-2xl font-light text-[#1A1A1A]">
                  Select Your Analysis Goal
                </h2>
              </div>

              {/* Predefined Jobs Grid */}
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {getJobSuggestions(selectedPersona).map((job, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleJobSelect(job)}
                    className={`
                      p-6 rounded-2xl text-left transition-all duration-300 border
                      ${selectedJob === job
                        ? 'bg-[#DC2626] text-white border-[#DC2626] shadow-lg'
                        : 'bg-white/70 text-[#1A1A1A] border-[#E5E7EB]/50 hover:border-[#DC2626]/30 hover:bg-white'
                      }
                    `}
                    whileHover={{ 
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.8, 
                      delay: 1 + index * 0.1, 
                      ease: "easeOut" 
                    }}
                  >
                    <div className="flex items-start">
                      <div className={`
                        w-2 h-2 rounded-full mt-2 mr-3 transition-colors duration-300
                        ${selectedJob === job ? 'bg-white' : 'bg-[#DC2626]'}
                      `} />
                      <span className="font-medium leading-relaxed">{job}</span>
                    </div>
                  </motion.button>
                ))}
                
                {/* Custom Job Display Card */}
                {selectedJob && !getJobSuggestions(selectedPersona).includes(selectedJob) && (
                  <motion.div
                    className="p-6 rounded-2xl border bg-[#DC2626] text-white border-[#DC2626] shadow-lg"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <div className="flex items-start">
                      <div className="w-2 h-2 rounded-full mt-2 mr-3 bg-white" />
                      <span className="font-medium leading-relaxed">{selectedJob}</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <span className="text-xs text-white/80 font-medium">Custom Goal</span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Custom Job Input */}
              {!selectedJob || getJobSuggestions(selectedPersona).includes(selectedJob) ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.4, ease: "easeOut" }}
                >
                  <motion.button
                    onClick={handleCustomJobToggle}
                    className="w-full p-6 rounded-2xl border-2 border-dashed border-[#E5E7EB] 
                             hover:border-[#DC2626]/50 transition-all duration-300 text-left group"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center">
                      <Plus className="h-5 w-5 text-[#DC2626] mr-3 group-hover:rotate-90 transition-transform duration-300" />
                      <span className="text-[#1A1A1A]/60 group-hover:text-[#1A1A1A] transition-colors duration-300">
                        Create custom analysis goal
                      </span>
                    </div>
                  </motion.button>

                  <AnimatePresence>
                    {showCustomInput && (
                      <motion.div
                        className="mt-6"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      >
                        <textarea
                          value={customJob}
                          onChange={handleCustomJobChange}
                          placeholder="Describe your specific analysis goals in detail..."
                          className="w-full p-4 rounded-2xl border border-[#E5E7EB]/50 
                                   focus:border-[#DC2626] focus:ring-0 outline-none
                                   bg-white/70 backdrop-blur-sm text-[#1A1A1A]
                                   placeholder-[#1A1A1A]/40 transition-all duration-300
                                   resize-none mb-4"
                          rows={4}
                          autoFocus
                        />
                        
                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <motion.button
                            onClick={handleCustomJobContinue}
                            disabled={!customJob.trim()}
                            className={`
                              flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-300
                              flex items-center justify-center space-x-2
                              ${customJob.trim()
                                ? 'bg-[#DC2626] text-white hover:bg-[#DC2626]/90 shadow-lg'
                                : 'bg-[#E5E7EB]/50 text-[#1A1A1A]/40 cursor-not-allowed'
                              }
                            `}
                            whileHover={customJob.trim() ? { scale: 1.02 } : {}}
                            whileTap={customJob.trim() ? { scale: 0.98 } : {}}
                          >
                            <Check className="h-4 w-4" />
                            <span>Continue</span>
                          </motion.button>
                          
                          <motion.button
                            onClick={handleCustomJobDiscard}
                            className="flex-1 py-3 px-4 rounded-xl font-medium text-sm
                                     bg-white/70 text-[#1A1A1A] border border-[#E5E7EB]/50
                                     hover:border-[#1A1A1A]/30 hover:bg-white
                                     transition-all duration-300 flex items-center justify-center space-x-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <X className="h-4 w-4" />
                            <span>Discard</span>
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                /* Edit Custom Goal Button */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <motion.button
                    onClick={() => {
                      setShowCustomInput(true);
                      setCustomJob(selectedJob);
                    }}
                    className="w-full p-4 rounded-2xl border border-[#E5E7EB]/50 
                             bg-white/70 text-[#1A1A1A] hover:border-[#DC2626]/30 
                             hover:bg-white transition-all duration-300 text-left group"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <PenTool className="h-5 w-5 text-[#DC2626] mr-3" />
                        <span className="text-[#1A1A1A]/80 group-hover:text-[#1A1A1A] transition-colors duration-300">
                          Edit custom goal
                        </span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-[#1A1A1A]/40" />
                    </div>
                  </motion.button>

                  <AnimatePresence>
                    {showCustomInput && (
                      <motion.div
                        className="mt-4"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      >
                        <textarea
                          value={customJob}
                          onChange={handleCustomJobChange}
                          placeholder="Describe your specific analysis goals in detail..."
                          className="w-full p-4 rounded-2xl border border-[#E5E7EB]/50 
                                   focus:border-[#DC2626] focus:ring-0 outline-none
                                   bg-white/70 backdrop-blur-sm text-[#1A1A1A]
                                   placeholder-[#1A1A1A]/40 transition-all duration-300
                                   resize-none mb-4"
                          rows={4}
                          autoFocus
                        />
                        
                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <motion.button
                            onClick={handleCustomJobContinue}
                            disabled={!customJob.trim()}
                            className={`
                              flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-300
                              flex items-center justify-center space-x-2
                              ${customJob.trim()
                                ? 'bg-[#DC2626] text-white hover:bg-[#DC2626]/90 shadow-lg'
                                : 'bg-[#E5E7EB]/50 text-[#1A1A1A]/40 cursor-not-allowed'
                              }
                            `}
                            whileHover={customJob.trim() ? { scale: 1.02 } : {}}
                            whileTap={customJob.trim() ? { scale: 0.98 } : {}}
                          >
                            <Check className="h-4 w-4" />
                            <span>Update</span>
                          </motion.button>
                          
                          <motion.button
                            onClick={handleCustomJobDiscard}
                            className="flex-1 py-3 px-4 rounded-xl font-medium text-sm
                                     bg-white/70 text-[#1A1A1A] border border-[#E5E7EB]/50
                                     hover:border-[#1A1A1A]/30 hover:bg-white
                                     transition-all duration-300 flex items-center justify-center space-x-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <X className="h-4 w-4" />
                            <span>Cancel</span>
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Configuration Panel */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 1, ease: "easeOut" }}
          >
            {/* Analysis Parameters */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-sm border border-[#E5E7EB]/30">
              <div className="flex items-center mb-8">
                <Settings className="h-6 w-6 text-[#DC2626] mr-3" />
                <h3 className="text-xl font-light text-[#1A1A1A]">
                  Analysis Parameters
                </h3>
              </div>

              <div className="space-y-8">
                {/* Urgency Selector */}
                <div className="relative">
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-4">
                    Priority Level
                  </label>
                  
                  {/* Dropdown Button */}
                  <button
                    onClick={() => setShowUrgencyDropdown(!showUrgencyDropdown)}
                    className="w-full p-4 rounded-xl border border-[#E5E7EB]/50 
                             bg-white/70 text-[#1A1A1A] hover:border-[#DC2626]/30 
                             hover:bg-white transition-all duration-300 flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      {React.createElement(getSelectedUrgencyOption().icon, {
                        className: "h-5 w-5 mr-3 text-[#DC2626]"
                      })}
                      <span className="font-medium">{getSelectedUrgencyOption().label}</span>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-[#1A1A1A]/60 transition-transform duration-300 ${
                      showUrgencyDropdown ? 'rotate-180' : ''
                    }`} />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {showUrgencyDropdown && (
                      <motion.div
                        className="absolute top-full left-0 right-0 z-10 mt-2 
                                 bg-white/90 backdrop-blur-sm rounded-xl border border-[#E5E7EB]/50 
                                 shadow-lg overflow-hidden"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        {urgencyOptions.map((option) => {
                          const IconComponent = option.icon;
                          return (
                            <button
                              key={option.value}
                              onClick={() => {
                                setUrgency(option.value);
                                setShowUrgencyDropdown(false);
                              }}
                              className={`
                                w-full p-4 text-left transition-all duration-200 flex items-center
                                hover:bg-[#DC2626]/10 first:rounded-t-xl last:rounded-b-xl
                                ${urgency === option.value ? 'bg-[#DC2626]/5 text-[#DC2626]' : 'text-[#1A1A1A]'}
                              `}
                            >
                              <IconComponent className={`h-5 w-5 mr-3 ${
                                urgency === option.value ? 'text-[#DC2626]' : 'text-[#1A1A1A]/60'
                              }`} />
                              <span className="font-medium flex-1">{option.label}</span>
                              {urgency === option.value && (
                                <Check className="h-4 w-4 text-[#DC2626]" />
                              )}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Scope Selector */}
                <div className="relative">
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-4">
                    Analysis Depth
                  </label>
                  
                  {/* Dropdown Button */}
                  <button
                    onClick={() => setShowScopeDropdown(!showScopeDropdown)}
                    className="w-full p-4 rounded-xl border border-[#E5E7EB]/50 
                             bg-white/70 text-[#1A1A1A] hover:border-[#DC2626]/30 
                             hover:bg-white transition-all duration-300 flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      {React.createElement(getSelectedScopeOption().icon, {
                        className: "h-5 w-5 mr-3 text-[#DC2626]"
                      })}
                      <span className="font-medium">{getSelectedScopeOption().label}</span>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-[#1A1A1A]/60 transition-transform duration-300 ${
                      showScopeDropdown ? 'rotate-180' : ''
                    }`} />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {showScopeDropdown && (
                      <motion.div
                        className="absolute top-full left-0 right-0 z-10 mt-2 
                                 bg-white/90 backdrop-blur-sm rounded-xl border border-[#E5E7EB]/50 
                                 shadow-lg overflow-hidden"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        {scopeOptions.map((option) => {
                          const IconComponent = option.icon;
                          return (
                            <button
                              key={option.value}
                              onClick={() => {
                                setScope(option.value);
                                setShowScopeDropdown(false);
                              }}
                              className={`
                                w-full p-4 text-left transition-all duration-200 flex items-center
                                hover:bg-[#DC2626]/10 first:rounded-t-xl last:rounded-b-xl
                                ${scope === option.value ? 'bg-[#DC2626]/5 text-[#DC2626]' : 'text-[#1A1A1A]'}
                              `}
                            >
                              <IconComponent className={`h-5 w-5 mr-3 ${
                                scope === option.value ? 'text-[#DC2626]' : 'text-[#1A1A1A]/60'
                              }`} />
                              <span className="font-medium flex-1">{option.label}</span>
                              {scope === option.value && (
                                <Check className="h-4 w-4 text-[#DC2626]" />
                              )}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Smart Tags */}
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-4">
                    Focus Areas
                  </label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-2 rounded-xl text-sm
                                 bg-[#DC2626] text-white"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-2 hover:bg-white/20 rounded-full p-1 transition-colors duration-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {generateTagsForPersona(selectedPersona?.title || '').map((tag) => (
                      <button
                        key={tag}
                        onClick={() => addTag(tag)}
                        className="px-3 py-2 rounded-xl text-sm border border-[#E5E7EB]
                                 text-[#1A1A1A]/70 hover:border-[#DC2626] hover:text-[#DC2626]
                                 transition-all duration-300"
                        disabled={tags.includes(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <motion.button
              onClick={handleContinue}
              disabled={!selectedJob || isAnimating}
              className={`
                w-full py-4 rounded-2xl font-medium text-lg transition-all duration-300
                flex items-center justify-center space-x-3
                ${selectedJob && !isAnimating
                  ? 'bg-[#DC2626] text-white hover:bg-[#DC2626]/90 shadow-lg hover:shadow-xl'
                  : 'bg-[#E5E7EB]/50 text-[#1A1A1A]/40 cursor-not-allowed'
                }
              `}
              whileHover={selectedJob && !isAnimating ? { 
                scale: 1.02,
                transition: { duration: 0.2 }
              } : {}}
              whileTap={selectedJob && !isAnimating ? { 
                scale: 0.98 
              } : {}}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
            >
              <Star className="h-5 w-5" />
              <span>Start Analysis</span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default JobToBeDone;