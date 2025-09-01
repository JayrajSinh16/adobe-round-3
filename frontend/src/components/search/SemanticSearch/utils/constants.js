/**
 * SemanticSearch Constants
 * Centralized configuration for the SemanticSearch component
 */

export const SEARCH_CONFIG = {
  SEARCH_DELAY: 500,
  MAX_RESULTS: 10,
  MIN_QUERY_LENGTH: 2,
  MAX_COLLAPSED_RESULTS: 8,
};

export const UI_CONFIG = {
  CLICK_ANIMATION_DELAY: 150,
  STAGGER_DELAY: 0.055,
  HOVER_SCALE: 1.02,
  TAP_SCALE: 0.98,
};

export const ANIMATION_VARIANTS = {
  searchInput: {
    initial: { scale: 0 },
    animate: { scale: 1 },
  },
  resultItem: {
    initial: { opacity: 0, y: 8 },
    animate: (index) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.03,
        duration: 0.2,
        ease: "easeOut",
      },
    }),
    exit: { opacity: 0, y: -8 },
  },
  collapsedItem: {
    initial: { opacity: 0, scale: 0.9 },
    animate: (index) => ({
      opacity: 1,
      scale: 1,
      transition: { delay: index * 0.05, duration: 0.2 },
    }),
    exit: { opacity: 0, scale: 0.9 },
  },
};
