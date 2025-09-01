/**
 * FilenameSearch Constants
 * Centralized configuration for the FilenameSearch component
 */

export const SORT_OPTIONS = {
  RECENT: 'recent',
  NAME: 'name', 
  SIZE: 'size',
  CONFIDENCE: 'confidence'
};

export const FILTER_OPTIONS = {
  ALL: 'all',
  VISITED: 'visited',
  UNVISITED: 'unvisited'
};

export const ANIMATION_CONFIG = {
  springConfig: {
    type: "spring",
    stiffness: 400,
    damping: 25
  },
  staggerDelay: 0.055,
  hoverScale: 1.05,
  tapScale: 0.98,
  dropdownDuration: 0.15
};

export const UI_CONFIG = {
  maxCollapsedFiles: 8,
  tooltipDelay: 200,
  dropdownZIndex: 100
};
