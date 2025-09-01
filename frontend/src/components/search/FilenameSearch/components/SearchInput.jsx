/**
 * Search Input Component - Minimal Professional Design
 * Clean search input with subtle styling
 */

import React from 'react';
import { Search } from 'lucide-react';

const SearchInput = ({ searchTerm, onSearchChange, leftPanelCollapsed }) => {
  if (leftPanelCollapsed) return null;

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        placeholder="Search documents..."
        value={searchTerm}
        onChange={onSearchChange}
        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm placeholder-gray-500"
      />
    </div>
  );
};

export default SearchInput;
