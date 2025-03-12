import React from 'react';
import { FaChevronDown, FaSearch, FaCog, FaRandom } from 'react-icons/fa';

const FilterBar = ({ filters, handleFilterChange }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6 items-center">
      <div className="relative">
        <button className="flex items-center px-4 py-2 border rounded-md">
          Lists <FaChevronDown className="ml-2" />
        </button>
      </div>

      <div className="relative">
        <button
          className="flex items-center px-4 py-2 border rounded-md"
          onClick={() => {
            const nextDifficulty =
              filters.difficulty === 'easy'
                ? 'medium'
                : filters.difficulty === 'medium'
                  ? 'hard'
                  : filters.difficulty === 'hard'
                    ? ''
                    : 'easy';
            handleFilterChange('difficulty', nextDifficulty);
          }}
        >
          Difficulty:{' '}
          {filters.difficulty
            ? filters.difficulty.charAt(0).toUpperCase() + filters.difficulty.slice(1)
            : 'All'}{' '}
          <FaChevronDown className="ml-2" />
        </button>
      </div>

      <div className="relative">
        <button className="flex items-center px-4 py-2 border rounded-md">
          Status <FaChevronDown className="ml-2" />
        </button>
      </div>

      <div className="relative">
        <button className="flex items-center px-4 py-2 border rounded-md">
          Tags <FaChevronDown className="ml-2" />
        </button>
      </div>

      <div className="flex-grow relative">
        <div className="flex items-center border rounded-md px-3 py-2 bg-white">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search questions"
            className="w-full outline-none"
            value={filters.title}
            onChange={(e) => handleFilterChange('title', e.target.value)}
          />
        </div>
      </div>

      <button className="p-2 border rounded-md">
        <FaCog />
      </button>

      <button className="flex items-center bg-green-500 text-white px-4 py-2 rounded-md">
        <FaRandom className="mr-2" />
        Pick One
      </button>
    </div>
  );
};

export default FilterBar;