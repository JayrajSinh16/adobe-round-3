/**
 * Filter Controls Component - Minimal Professional Design
 * Clean sort and filter controls
 */

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { SORT_OPTIONS, FILTER_OPTIONS } from '../utils/constants.js';

const FilterControls = ({ 
  sortBy, 
  setSortBy, 
  filterBy, 
  setFilterBy, 
  leftPanelCollapsed 
}) => {
  if (leftPanelCollapsed) return null;

  const sortOptions = [
    { value: SORT_OPTIONS.RECENT, label: 'Recent' },
    { value: SORT_OPTIONS.NAME, label: 'Name' },
    { value: SORT_OPTIONS.SIZE, label: 'Size' },
    { value: SORT_OPTIONS.CONFIDENCE, label: 'Relevance' }
  ];

  const filterOptions = [
    { value: FILTER_OPTIONS.ALL, label: 'All' },
    { value: FILTER_OPTIONS.VISITED, label: 'Read' },
    { value: FILTER_OPTIONS.UNVISITED, label: 'Unread' }
  ];

  return (
    <div className="flex items-center space-x-3">
      {/* Sort Dropdown */}
      <div className="relative flex-1">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              Sort by {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      {/* Filter Buttons */}
      <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
        {filterOptions.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setFilterBy(filter.value)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors duration-200 ${
              filterBy === filter.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterControls;
