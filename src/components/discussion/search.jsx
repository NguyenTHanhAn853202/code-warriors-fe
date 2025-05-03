'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

const SearchComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchPagination, setSearchPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });
  useEffect(() => {
    if (!searchQuery) return;
    
    const timer = setTimeout(() => {
      handleSearch();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle search function
  const handleSearch = async (e) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      const response = await axios.get('http://localhost:8080/api/v1/discussion', {
        params: {
          search: searchQuery,
          page: searchPagination.page,
          limit: searchPagination.limit
        }
      });
      
      if (response.data && response.data.status === "success" && response.data.data) {
        const formattedResults = response.data.data.result.map(post => ({
          ...post,
          commentsCount: post.comments ? post.comments.length : 0,
          avatar: post.author && post.author.avtImage ? post.author.avtImage : "/user_1.png",
          likes: post.favourite ? post.favourite.length : 0
        }));
        
        setSearchResults(formattedResults);
        setSearchPagination({
          page: response.data.data.page,
          limit: response.data.data.limit,
          total: response.data.data.total
        });
      }
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePageChange = (newPage) => {
    setSearchPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch();
    }
  }, [searchPagination.page]);

  return {
    searchQuery,
    setSearchQuery,
    isSearching,
    handleSearch,
    searchResults,
    searchPagination,
    
    // Render search input
    renderSearchInput: () => (
      <div className="relative">
        <form onSubmit={handleSearch}>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Feed 🔎..." 
            className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm w-full" 
          />
          <button type="submit" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            </div>
          )}
        </form>
      </div>
    ),
    
    // Render pagination controls
    renderPagination: () => {
      const totalPages = Math.ceil(searchPagination.total / searchPagination.limit);
      
      return (
        <div className="flex justify-center items-center px-6 py-4 mt-4">
          <button 
            onClick={() => handlePageChange(searchPagination.page - 1)}
            disabled={searchPagination.page === 1}
            className={`px-3 py-1 rounded-md mr-2 ${
              searchPagination.page === 1 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            Previous
          </button>
          
          <div className="flex space-x-1">
            <span className="px-3 py-1 bg-blue-500 text-white rounded-md">
              {searchPagination.page}
            </span>
            
            <span className="px-3 py-1 text-gray-600">
              of {totalPages}
            </span>
          </div>
          
          <button 
            onClick={() => handlePageChange(searchPagination.page + 1)}
            disabled={searchPagination.page >= totalPages}
            className={`px-3 py-1 rounded-md ml-2 ${
              searchPagination.page >= totalPages 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            Next
          </button>
        </div>
      );
    }
  };
};

export default SearchComponent;