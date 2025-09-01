# SemanticSearch Component

A professional, modular semantic search component with AI-powered document heading search and PDF navigation capabilities.

## Overview

The SemanticSearch component provides intelligent document search functionality with the following features:
- AI-powered semantic search through document headings
- Professional minimal design with blue color scheme
- PDF navigation with page-specific highlighting
- Responsive design supporting both expanded and collapsed views
- Smooth animations and professional micro-interactions

## Architecture

### 📁 File Structure
```
SemanticSearch/
├── components/
│   ├── SearchInput.jsx          # Search input with AI indicators
│   ├── SearchStatus.jsx         # Results counter and status display
│   ├── ResultItem.jsx           # Individual search result cards
│   ├── CollapsedResultItem.jsx  # Compact view for collapsed sidebar
│   └── EmptyState.jsx           # No results state
├── hooks/
│   └── useSemanticSearch.js     # Search logic and state management
├── utils/
│   ├── constants.js             # Configuration constants
│   └── searchUtils.js           # Search utilities and helpers
└── index.js                     # Module exports
```

### 🔧 Key Components

#### SearchInput
- Professional search input with AI badge
- Loading indicator integration
- Auto-focus and accessibility features

#### ResultItem
- Professional card design with relevance scoring
- Page number and context display
- Smooth hover and click animations
- Relevance bar visualization

#### CollapsedResultItem
- Compact design for sidebar collapsed state
- Tooltip with detailed information
- Relevance indicators and animations

### 🎯 Core Functionality

#### Semantic Search
- **API Integration**: Real-time search through `searchHeadings` API
- **Debounced Search**: 500ms delay to prevent excessive API calls
- **Error Handling**: Graceful fallback on API failures
- **Result Processing**: Transforms API results to component format

#### PDF Navigation
- **Direct Navigation**: Click results to navigate to specific PDF pages
- **Highlight Support**: Preserves semantic heading context for highlighting
- **Navigation Callback**: Uses `onNavigateToDocument(pdfName, page, heading)`

### ⚙️ Configuration

#### SEARCH_CONFIG
```javascript
{
  SEARCH_DELAY: 500,           // Debounce delay in ms
  MAX_RESULTS: 10,             // Maximum API results
  MIN_QUERY_LENGTH: 2,         // Minimum query length
  MAX_COLLAPSED_RESULTS: 8,    // Max results in collapsed view
}
```

#### UI_CONFIG
```javascript
{
  CLICK_ANIMATION_DELAY: 150,  // Click feedback delay
  STAGGER_DELAY: 0.055,        // Animation stagger
  HOVER_SCALE: 1.02,           // Hover scale factor
  TAP_SCALE: 0.98,             // Tap scale factor
}
```

### 🎨 Design System

#### Color Palette
- **Primary**: Blue (#3B82F6)
- **Secondary**: Blue variants for relevance indicators
- **Background**: White with subtle transparency
- **Text**: Gray scale for hierarchy

#### Animations
- **Framer Motion**: Smooth entrance and exit animations
- **Micro-interactions**: Hover, tap, and loading states
- **Staggered Animations**: Sequential result appearance

### 📊 Data Flow

1. **User Input** → Debounced search trigger
2. **API Call** → `searchHeadings(query, maxResults)`
3. **Result Processing** → Transform to component format
4. **Rendering** → Display results with animations
5. **User Interaction** → Navigate to PDF page with highlighting

### 🔄 State Management

#### Local State
- `semanticSearchTerm`: Current search query
- `isSearching`: Loading state indicator
- `semanticResults`: Processed search results
- `clickingFile`: Click animation tracking

#### Props Interface
```javascript
{
  // Core functionality
  onNavigateToDocument: Function,     // PDF navigation callback
  leftPanelCollapsed: Boolean,        // UI state
  
  // Legacy compatibility (maintained)
  filteredFiles: Array,
  selectedFile: Object,
  handleFileSelectWithVisit: Function,
  formatFileSize: Function,
  formatTimestamp: Function,
  visitedFiles: Set,
}
```

### 🚀 Performance Optimizations

- **Debounced Search**: Prevents excessive API calls
- **Memoized Results**: Optimized result processing
- **Lazy Animations**: Staggered rendering for large result sets
- **Component Splitting**: Modular architecture for better bundle splitting

### 🎯 Accessibility

- **Keyboard Navigation**: Full keyboard support
- **ARIA Labels**: Proper labeling for screen readers
- **Focus Management**: Logical tab order
- **Color Contrast**: WCAG compliant color choices

### 🔧 Usage Example

```jsx
import SemanticSearch from './components/search/SemanticSearch';

function DocumentLibrary() {
  const handleNavigateToDocument = (pdfName, page, heading) => {
    // Navigate to specific PDF page with highlighting
    console.log(`Navigate to ${pdfName}, page ${page}, highlight: ${heading}`);
  };

  return (
    <SemanticSearch
      onNavigateToDocument={handleNavigateToDocument}
      leftPanelCollapsed={false}
      // ... other props
    />
  );
}
```

### 🔄 Migration Notes

This organized version maintains 100% backward compatibility with the original 506-line monolithic component:
- All original functionality preserved
- Same props interface
- Identical PDF navigation behavior
- Enhanced with professional design and better maintainability

### 📈 Metrics

- **Code Reduction**: 506 lines → ~150 lines main component (70% reduction)
- **Modularity**: 8 separate focused modules
- **Maintainability**: Clear separation of concerns
- **Reusability**: Individual components can be reused
- **Bundle Size**: Optimized for tree-shaking
