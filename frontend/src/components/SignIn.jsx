import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Shield, 
  CheckCircle, AlertCircle, User, Github, Apple, Chrome,
  Brain, Zap, FileText, BarChart3, Target
} from 'lucide-react';

const SignIn = () => {
  const navigate = useNavigate();
  
  // Elite state management for premium authentication
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [authMethod, setAuthMethod] = useState('email'); // 'email' or 'social'

  // Premium form validation with sophisticated error handling
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Elite callback functions with performance optimization
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const handlePasswordToggle = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const handleSignIn = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simulate authentication with sophisticated loading
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful authentication
      console.log('Sign in successful:', formData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Sign in failed:', error);
      setErrors({ general: 'Authentication failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm, navigate]);

  const handleSocialSignIn = useCallback((provider) => {
    console.log(`Signing in with ${provider}`);
    setIsLoading(true);
    
    // Simulate social authentication
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 1500);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAF9] via-white to-[#F5F5F4] 
                    flex items-center justify-center px-6 py-12">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-5 gap-12 items-center">
        
        {/* PREMIUM LEFT SECTION - Brand Story & Features */}
        <motion.div
          className="lg:col-span-3 space-y-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Elite Brand Header */}
          <div className="space-y-6">
            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#DC2626] to-[#B91C1C] 
                            rounded-3xl flex items-center justify-center shadow-2xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-light text-[#1A1A1A] leading-tight">
                  Intelligence Hub
                </h1>
                <p className="text-lg text-[#1A1A1A]/60 font-light">
                  AI-powered document analysis platform
                </p>
              </div>
            </motion.div>

            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h2 className="text-6xl font-light text-[#1A1A1A] leading-tight">
                Transform how you
                <span className="block text-[#DC2626] font-normal">analyze documents</span>
              </h2>
              <p className="text-xl text-[#1A1A1A]/70 leading-relaxed max-w-2xl">
                Harness the power of artificial intelligence to extract insights, 
                discover patterns, and accelerate your decision-making process.
              </p>
            </motion.div>
          </div>

          {/* Premium Feature Showcase */}
          <motion.div
            className="grid md:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {[
              {
                icon: Brain,
                title: 'AI-Powered Analysis',
                description: 'Advanced machine learning algorithms extract key insights automatically',
                gradient: 'from-purple-500/10 to-purple-600/5',
                color: 'purple'
              },
              {
                icon: Zap,
                title: 'Instant Processing',
                description: 'Upload and analyze documents in seconds, not hours',
                gradient: 'from-amber-500/10 to-amber-600/5',
                color: 'amber'
              },
              {
                icon: Target,
                title: 'Precision Insights',
                description: 'Get exactly what you need with persona-driven analysis',
                gradient: 'from-blue-500/10 to-blue-600/5',
                color: 'blue'
              },
              {
                icon: BarChart3,
                title: 'Visual Analytics',
                description: 'Interactive dashboards and knowledge graphs',
                gradient: 'from-emerald-500/10 to-emerald-600/5',
                color: 'emerald'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className={`p-6 bg-gradient-to-br ${feature.gradient} backdrop-blur-sm 
                          rounded-2xl border border-white/20 hover:shadow-lg 
                          transition-all duration-500 group cursor-pointer`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + (index * 0.1) }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 bg-${feature.color}-500/10 rounded-2xl 
                                 flex items-center justify-center group-hover:bg-${feature.color}-500/20 
                                 transition-all duration-300`}>
                    <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-[#1A1A1A]/60 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Elite Trust Indicators */}
          <motion.div
            className="flex items-center space-x-8 pt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-[#059669]" />
              <span className="text-sm font-medium text-[#1A1A1A]/70">
                Enterprise Security
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-[#059669]" />
              <span className="text-sm font-medium text-[#1A1A1A]/70">
                GDPR Compliant
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-[#DC2626]" />
              <span className="text-sm font-medium text-[#1A1A1A]/70">
                SOC 2 Certified
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* PREMIUM RIGHT SECTION - Authentication Form */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        >
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl 
                        border border-white/20 max-w-md mx-auto">
            
            {/* Form Header */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <h3 className="text-2xl font-light text-[#1A1A1A] mb-2">
                Welcome back
              </h3>
              <p className="text-[#1A1A1A]/60">
                Sign in to access your intelligence dashboard
              </p>
            </motion.div>

            {/* Social Sign In Options */}
            <motion.div
              className="space-y-3 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              {[
                { provider: 'Google', icon: Chrome, color: 'from-blue-500 to-blue-600' },
                { provider: 'GitHub', icon: Github, color: 'from-gray-700 to-gray-800' },
                { provider: 'Apple', icon: Apple, color: 'from-gray-800 to-black' }
              ].map((social) => (
                <motion.button
                  key={social.provider}
                  onClick={() => handleSocialSignIn(social.provider)}
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center space-x-3 p-4 
                            bg-gradient-to-r ${social.color} text-white rounded-2xl 
                            hover:shadow-lg transition-all duration-300 disabled:opacity-50 group`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <social.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-medium">Continue with {social.provider}</span>
                </motion.button>
              ))}
            </motion.div>

            {/* Elegant Divider */}
            <motion.div
              className="relative flex items-center justify-center mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E5E7EB]/50" />
              </div>
              <div className="relative bg-white px-4">
                <span className="text-sm text-[#1A1A1A]/60 font-medium">or continue with email</span>
              </div>
            </motion.div>

            {/* Premium Sign In Form */}
            <motion.form
              onSubmit={handleSignIn}
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
            >
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1A1A1A]/70 block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 
                                  text-[#1A1A1A]/40 w-5 h-5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email address"
                    className={`w-full pl-12 pr-4 py-4 bg-[#FAFAF9] border rounded-2xl 
                              focus:ring-0 outline-none transition-all duration-300 
                              text-[#1A1A1A] placeholder-[#1A1A1A]/40 ${
                                errors.email 
                                  ? 'border-red-500 focus:border-red-500' 
                                  : 'border-[#E5E7EB]/50 focus:border-[#DC2626]'
                              }`}
                    disabled={isLoading}
                  />
                </div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center space-x-2 text-red-600"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{errors.email}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1A1A1A]/70 block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 
                                  text-[#1A1A1A]/40 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter your password"
                    className={`w-full pl-12 pr-12 py-4 bg-[#FAFAF9] border rounded-2xl 
                              focus:ring-0 outline-none transition-all duration-300 
                              text-[#1A1A1A] placeholder-[#1A1A1A]/40 ${
                                errors.password 
                                  ? 'border-red-500 focus:border-red-500' 
                                  : 'border-[#E5E7EB]/50 focus:border-[#DC2626]'
                              }`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={handlePasswordToggle}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 
                             text-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-colors duration-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center space-x-2 text-red-600"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{errors.password}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-[#E5E7EB] text-[#DC2626] 
                             focus:ring-[#DC2626] focus:ring-2"
                  />
                  <span className="text-sm text-[#1A1A1A]/70">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-[#DC2626] hover:text-[#B91C1C] 
                           transition-colors duration-300 font-medium"
                >
                  Forgot password?
                </button>
              </div>

              {/* General Error */}
              <AnimatePresence>
                {errors.general && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-2xl 
                             flex items-center space-x-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-sm text-red-600">{errors.general}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Premium Sign In Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#DC2626] to-[#B91C1C] 
                         hover:from-[#B91C1C] hover:to-[#991B1B] 
                         text-white py-4 rounded-2xl font-medium 
                         transition-all duration-300 disabled:opacity-50 
                         shadow-lg hover:shadow-xl flex items-center justify-center space-x-3 group"
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
              >
                {isLoading ? (
                  <motion.div
                    className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </motion.button>
            </motion.form>

            {/* Sign Up Link */}
            <motion.div
              className="text-center mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.3 }}
            >
              <p className="text-[#1A1A1A]/60">
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/signup')}
                  className="text-[#DC2626] hover:text-[#B91C1C] font-medium 
                           transition-colors duration-300"
                >
                  Sign up
                </button>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignIn;
