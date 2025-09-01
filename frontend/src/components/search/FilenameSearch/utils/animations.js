/**
 * Animation Configurations
 * Framer Motion animation variants and configurations
 */

export const fileItemVariants = {
  initial: { opacity: 0, y: 13, scale: 0.95 },
  animate: (index) => ({ 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      delay: index * 0.055,
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  }),
  exit: { opacity: 0, scale: 0.95, y: -13 },
  hover: { 
    y: -2,
    transition: { duration: 0.2 }
  }
};

export const collapsedItemVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: (index) => ({ 
    opacity: 1, 
    scale: 1,
    transition: { delay: index * 0.05 }
  }),
  exit: { opacity: 0, scale: 0.8 },
  hover: { scale: 1.02 },
  tap: { scale: 0.95 }
};

export const dropdownVariants = {
  initial: { opacity: 0, scale: 0.95, y: -5 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: -5 },
  transition: { duration: 0.15 }
};

export const pulseVariants = {
  animate: { 
    scale: [1, 1.2, 1],
    opacity: [1, 0.7, 1]
  },
  transition: { 
    duration: 2, 
    repeat: Infinity 
  }
};
