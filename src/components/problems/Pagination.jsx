import React from 'react';

const Pagination = ({ pagination, filters, handleFilterChange }) => {
  return (
    <div className="flex justify-between items-center mt-4">
      <div className="text-sm text-gray-700">
        Showing {(pagination.currentPage - 1) * filters.limit + 1} to{' '}
        {Math.min(pagination.currentPage * filters.limit, pagination.totalProblems)} of{' '}
        {pagination.totalProblems} problems
      </div>
      <div className="flex gap-2">
        <button
          className="px-3 py-1 border rounded disabled:opacity-50 cursor-pointer"
          disabled={pagination.currentPage === 1}
          onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
        >
          Previous
        </button>
        {[...Array(Math.min(5, pagination.totalPages))].map((_, index) => {
          const pageNum = pagination.currentPage <= 3 ? index + 1 : pagination.currentPage + index - 2;

          if (pageNum > pagination.totalPages) return null;

          return (
            <button
              key={pageNum}
              className={`px-3 py-1 border rounded cursor-pointer ${pagination.currentPage === pageNum ? 'bg-blue-500 text-white' : ''}`}
              onClick={() => handleFilterChange('page', pageNum)}
            >
              {pageNum}
            </button>
          );
        })}
        <button
          className="px-3 py-1 border rounded disabled:opacity-50 cursor-pointer"
          disabled={pagination.currentPage === pagination.totalPages}
          onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;