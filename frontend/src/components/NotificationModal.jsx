import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const NotificationModal = ({ isOpen, onClose }) => {
  const notifications = [
    { 
      id: 1,
      title: 'Analysis Complete', 
      message: 'Strategic Market Analysis Q4.pdf processed successfully', 
      time: '2 minutes ago', 
      type: 'success',
      icon: CheckCircle
    },
    { 
      id: 2,
      title: 'New Insights Available', 
      message: '5 cross-document connections discovered in your latest upload', 
      time: '1 hour ago', 
      type: 'info',
      icon: Info
    },
    { 
      id: 3,
      title: 'Reading Goal Achieved', 
      message: 'Congratulations! You\'ve reached your daily reading target', 
      time: '3 hours ago', 
      type: 'success',
      icon: CheckCircle
    },
    { 
      id: 4,
      title: 'Storage Warning', 
      message: 'You\'re approaching your storage limit. Consider upgrading your plan', 
      time: '1 day ago', 
      type: 'warning',
      icon: AlertTriangle
    }
  ];

  const getTypeColors = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'from-emerald-50 to-emerald-50/50',
          border: 'border-emerald-200',
          icon: 'text-emerald-600',
          dot: 'bg-emerald-500'
        };
      case 'warning':
        return {
          bg: 'from-amber-50 to-amber-50/50',
          border: 'border-amber-200',
          icon: 'text-amber-600',
          dot: 'bg-amber-500'
        };
      case 'info':
      default:
        return {
          bg: 'from-blue-50 to-blue-50/50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          dot: 'bg-blue-500'
        };
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                     w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 
                     max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-[#DC2626] to-[#B91C1C] 
                              rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                </div>
                <h2 className="text-lg font-semibold text-[#1A1A1A]">
                  Notifications
                </h2>
              </div>
              <motion.button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5 text-gray-500" />
              </motion.button>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((notification, index) => {
                const colors = getTypeColors(notification.type);
                const IconComponent = notification.icon;
                
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`p-4 border-b border-gray-50 hover:bg-gray-50/50 
                              transition-colors duration-200 cursor-pointer group`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 bg-gradient-to-r ${colors.bg} ${colors.border} 
                                     border rounded-full flex items-center justify-center 
                                     group-hover:scale-105 transition-transform duration-200`}>
                        <IconComponent className={`w-5 h-5 ${colors.icon}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-medium text-[#1A1A1A] truncate">
                            {notification.title}
                          </h3>
                          <div className={`w-2 h-2 ${colors.dot} rounded-full flex-shrink-0`} />
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed mb-2">
                          {notification.message}
                        </p>
                        <span className="text-xs text-gray-400">
                          {notification.time}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50/50 border-t border-gray-100">
              <motion.button
                className="w-full py-2 text-sm font-medium text-[#DC2626] 
                         hover:text-[#B91C1C] transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Mark all as read
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationModal;
