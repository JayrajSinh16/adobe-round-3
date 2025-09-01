# API Module Documentation

## Overview
The API module has been refactored from a single 460+ line file into a modular, maintainable structure while preserving all functionality and backward compatibility.

## File Structure
```
src/services/api/
├── index.js                    # Main exports and public API
├── config.js                   # Axios configuration and interceptors
├── utils/
│   ├── errorHandler.js         # Centralized error handling
│   ├── validators.js           # Input validation utilities
│   └── transformers.js         # Response data transformation
├── endpoints/
│   ├── documents.js            # Document upload/management APIs
│   ├── insights.js             # Insights and analysis APIs
│   ├── connections.js          # Cross-document connections
│   ├── podcast.js              # Podcast generation APIs
│   ├── search.js               # Search functionality
│   └── youtube.js              # YouTube recommendations
└── README.md                   # This documentation
```

## Benefits
- **Reduced complexity**: Main file now ~10 lines vs 460+ lines (98% reduction)
- **Better maintainability**: Each file has single responsibility
- **Improved error handling**: Consistent error messages across all endpoints
- **Enhanced validation**: Input sanitization prevents backend errors
- **Professional structure**: Demonstrates software engineering best practices
- **Backward compatibility**: All existing imports continue to work

## File Descriptions

### `config.js`
Configures axios instance with interceptors for authentication, logging, and FormData handling.
Used by all endpoint modules for consistent HTTP client configuration and request/response processing.

### `utils/errorHandler.js`
Centralizes error handling logic with consistent error message extraction and user-friendly formatting.
Used by all API endpoints to provide standardized error responses and handle various error formats.

### `utils/validators.js`
Provides input validation utilities for API requests to ensure data integrity and prevent backend errors.
Used by endpoint modules to validate and sanitize data before sending requests to the backend.

### `utils/transformers.js`
Normalizes backend response data into consistent frontend-consumable formats and handles edge cases.
Used by API endpoints to transform raw backend responses into standardized data structures.

### `endpoints/documents.js`
Handles document upload, listing, deletion, and text processing with proper validation and error handling.
Used by document management components to interact with document-related backend services.

### `endpoints/insights.js`
Manages all insight-related operations including generation and individual insight types with data normalization.
Used by analysis components to generate and fetch various types of document insights.

### `endpoints/connections.js`
Finds relationships and connections between different documents with proper payload sanitization.
Used by connection discovery features to identify cross-document relationships and similarities.

### `endpoints/podcast.js`
Handles AI-generated podcast creation and management with audio blob handling and metadata extraction.
Used by podcast generation features to create, download, and manage audio content.

### `endpoints/search.js`
Provides document search and heading query functionality with parameter validation.
Used by search components to find specific content within uploaded documents.

### `endpoints/youtube.js`
Delivers video recommendations based on document content with defensive object transformation.
Used by recommendation features to suggest relevant YouTube videos based on document analysis.

## Usage Examples

### Import specific endpoints:
```javascript
import { uploadDocuments, generateInsights } from '../services/api';
```

### Import utilities:
```javascript
import { handleApiError, validateRequired } from '../services/api';
```

### Legacy compatibility (existing code unchanged):
```javascript
import { uploadDocuments, generatePodcast } from '../services/api';
```

## Migration
No migration required - all existing imports work unchanged. The original `api.js` file now serves as a compatibility layer that re-exports from the new modular structure.

## Error Handling
All endpoints now use consistent error handling with:
- Proper Pydantic validation error parsing
- User-friendly error messages
- Automatic token cleanup on 401 errors
- Server error categorization

## Data Validation
All inputs are validated and sanitized to prevent:
- Backend validation errors (422)
- Runtime type errors
- Malformed requests
- XSS vulnerabilities

This refactored structure is perfect for hackathon presentations as it demonstrates professional API architecture and engineering best practices.
