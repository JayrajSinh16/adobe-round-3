import React, { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Settings, User, Bell, Search, Menu, Home, FileText, 
  Sparkles, Brain, Zap, LogOut, HelpCircle, Palette
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import NotificationModal from './NotificationModal';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Elite state management for premium interactions
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Sophisticated scroll detection for premium header behavior
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95]);
  const headerBlur = useTransform(scrollY, [0, 100], [0, 12]);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Premium page metadata with sophisticated routing intelligence
  const getPageMetadata = useCallback(() => {
    const routes = {
      '/upload': { 
        title: 'Document Upload', 
        subtitle: 'Transform PDFs into insights',
        icon: FileText,
        gradient: 'from-blue-500/10 to-blue-600/5'
      },
      '/persona': { 
        title: 'Persona Selection', 
        subtitle: 'Choose your analytical perspective',
        icon: Brain,
        gradient: 'from-purple-500/10 to-purple-600/5'
      },
      '/job': { 
        title: 'Goal Definition', 
        subtitle: 'Define your analysis objectives',
        icon: Zap,
        gradient: 'from-amber-500/10 to-amber-600/5'
      },
      '/dashboard': { 
        title: 'Intelligence Dashboard', 
        subtitle: 'Your AI-powered analysis hub',
        icon: Sparkles,
        gradient: 'from-[#DC2626]/10 to-[#B91C1C]/5'
      },
      '/reader': { 
        title: 'Smart Reader', 
        subtitle: 'Enhanced document analysis',
        icon: FileText,
        gradient: 'from-emerald-500/10 to-emerald-600/5'
      }
    };
    
    return routes[location.pathname] || { 
      title: 'Intelligence Hub', 
      subtitle: 'AI-powered document analysis',
      icon: Home,
      gradient: 'from-[#1A1A1A]/10 to-[#1A1A1A]/5'
    };
  }, [location.pathname]);

  // Elite navigation logic with sophisticated back button behavior
  const canGoBack = useCallback(() => {
    const noBackRoutes = ['/', '/upload', '/dashboard'];
    return !noBackRoutes.includes(location.pathname);
  }, [location.pathname]);

  // Premium callback functions with performance optimization
  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleNotificationModalToggle = useCallback(() => {
    setShowNotificationModal(prev => !prev);
  }, []);

  const handleNavigation = useCallback((path) => {
    navigate(path);
    setShowNotificationModal(false);
  }, [navigate]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowNotificationModal(false);
    };

    if (showNotificationModal) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showNotificationModal]);

  const pageMetadata = getPageMetadata();
  const IconComponent = pageMetadata.icon;

  return (
    <motion.header 
      style={{ 
        opacity: headerOpacity,
        backdropFilter: `blur(${headerBlur}px)`
      }}
      className={`sticky top-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-xl shadow-xl border-b border-white/20' 
          : 'bg-white/90 backdrop-blur-sm shadow-lg border-b border-[#E5E7EB]/50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* PREMIUM LEFT SECTION - Navigation & Brand Identity */}
          <motion.div 
            className="flex items-center space-x-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            
            {/* Sophisticated Back Button with Premium Animation */}
            <AnimatePresence>
              {canGoBack() && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8, x: -10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: -10 }}
                  whileHover={{ scale: 1.05, x: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGoBack}
                  className="group p-3 bg-gradient-to-r from-[#1A1A1A]/5 to-[#1A1A1A]/2 
                           hover:from-[#DC2626]/10 hover:to-[#B91C1C]/5 
                           rounded-2xl transition-all duration-300 
                           border border-[#E5E7EB]/30 hover:border-[#DC2626]/20"
                  aria-label="Go back to previous page"
                >
                  <ChevronLeft className="w-5 h-5 text-[#1A1A1A]/60 group-hover:text-[#DC2626] 
                                       transition-colors duration-300" />
                </motion.button>
              )}
            </AnimatePresence>
            
            {/* Elite Brand Identity with Mathematical Spacing */}
            <motion.div 
              className="flex items-center space-x-4"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
            >
              {/* Premium Logo Container with Gradient Background */}
              <div className={`relative w-12 h-12 bg-gradient-to-br ${pageMetadata.gradient} 
                             rounded-2xl flex items-center justify-center 
                             border border-white/20 shadow-lg overflow-hidden group cursor-pointer`}
                   onClick={() => handleNavigation('/dashboard')}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#DC2626] to-[#B91C1C] 
                              opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="relative z-10"
                >
                  <IconComponent className="w-6 h-6 text-[#DC2626] group-hover:text-white 
                                         transition-colors duration-300" />
                </motion.div>
              </div>
              
              {/* Sophisticated Brand Text with Adaptive Typography */}
              <div className="flex flex-col">
                <motion.h1 
                  className="text-xl font-light text-[#1A1A1A] leading-tight cursor-pointer
                           hover:text-[#DC2626] transition-colors duration-300"
                  onClick={() => handleNavigation('/dashboard')}
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.2 }}
                >
                  Intelligence Hub
                </motion.h1>
                <motion.p 
                  className="text-sm text-[#1A1A1A]/60 font-light leading-tight"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {pageMetadata.subtitle}
                </motion.p>
              </div>
            </motion.div>
            
            {/* Premium Page Context Indicator */}
            <motion.div
              className="hidden lg:flex items-center space-x-3 px-4 py-2 
                       bg-gradient-to-r from-[#FAFAF9] to-white/50 
                       rounded-2xl border border-[#E5E7EB]/30 shadow-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="w-2 h-2 bg-[#DC2626] rounded-full animate-pulse" />
              <span className="text-sm font-medium text-[#1A1A1A]/70">
                {pageMetadata.title}
              </span>
            </motion.div>
          </motion.div>

          {/* PREMIUM RIGHT SECTION - User Actions & Notifications */}
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            
            {/* Elite Status Indicator */}
            <motion.div
              className="hidden sm:flex items-center space-x-2 px-3 py-2 
                       bg-gradient-to-r from-[#059669]/10 to-[#059669]/5 
                       rounded-2xl border border-[#059669]/20"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-2 h-2 bg-[#059669] rounded-full animate-pulse" />
              <span className="text-xs font-medium text-[#059669]">AI ACTIVE</span>
            </motion.div>

            {/* Premium Quick Search Button */}
            <motion.button
              className="p-3 bg-gradient-to-r from-[#1A1A1A]/5 to-[#1A1A1A]/2 
                       hover:from-[#1A1A1A]/10 hover:to-[#1A1A1A]/5 
                       rounded-2xl transition-all duration-300 
                       border border-[#E5E7EB]/30 hover:border-[#1A1A1A]/20 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Quick search"
            >
              <Search className="w-5 h-5 text-[#1A1A1A]/60 group-hover:text-[#1A1A1A] 
                               transition-colors duration-300" />
            </motion.button>

            {/* Simple Notifications Button with Modal */}
            <motion.button
              onClick={handleNotificationModalToggle}
              className="relative p-3 bg-gradient-to-r from-[#1A1A1A]/5 to-[#1A1A1A]/2 
                       hover:from-amber-500/10 hover:to-amber-600/5 
                       rounded-2xl transition-all duration-300 
                       border border-[#E5E7EB]/30 hover:border-amber-500/20 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5 text-[#1A1A1A]/60 group-hover:text-amber-600 
                             transition-colors duration-300" />
              {/* Premium notification badge with pulsing animation */}
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-[#DC2626] rounded-full 
                         border-2 border-white shadow-lg"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.button>

            {/* Premium Sign In Button */}
            <motion.button
              onClick={() => handleNavigation('/signin')}
              className="flex items-center space-x-3 px-6 py-3 
                       bg-gradient-to-r from-[#DC2626] to-[#B91C1C] 
                       hover:from-[#B91C1C] hover:to-[#991B1B] 
                       text-white rounded-2xl transition-all duration-300 
                       shadow-lg hover:shadow-xl border border-white/20 group"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              aria-label="Sign in to your account"
            >
              <User className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">Sign In</span>
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Notification Modal */}
      <NotificationModal 
        isOpen={showNotificationModal} 
        onClose={() => setShowNotificationModal(false)} 
      />
    </motion.header>
  );
};

export default Header;