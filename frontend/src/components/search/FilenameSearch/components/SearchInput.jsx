/**
 * Search Input Component - Minimal Professional Design
 * Clean search input with subtle styling
 */

import React from 'react';
import { Search } from 'lucide-react';

const SearchInput = ({ searchTerm, onSearchChange, leftPanelCollapsed }) => {
  if (leftPanelCollapsed) return null;

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        placeholder="Search documents..."
        value={searchTerm}
        onChange={onSearchChange}
        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg 
                   focus:ring-2 focus:ring-red-500/20 focus:border-red-500 
                   transition-all duration-200 text-sm placeholder-gray-500
                   hover:border-gray-300"
      />
    </div>
  );
};

export default SearchInput;
