'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import PostForm from '../../components/discussion/post';
import SearchComponent from '../../components/discussion/search'; // Import the search component

export default function SocialMediaPage() {
  const router = useRouter();
  const [likeStatus, setLikeStatus] = useState({});
  const [showPostForm, setShowPostForm] = useState(false);
  const [userInfo, setUserInfo] = useState({
    avtImage: "",
    username: ""
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  // Initialize the search component
  const search = SearchComponent();

  // Fetch user info from API using axios
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/v1/user/info', {
          withCredentials: true
        });
        
        if (response.data && response.data.status === "success") {
          const userData = response.data.data;
          setUserInfo({
            avtImage: userData.avtImage || "/user_1.png",
            username: userData.username
          });
          setCurrentUser(userData);
        } else {
          setUserInfo({
            avtImage: "/user_1.png",
            username: "Guest"
          });
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        setUserInfo({
          avtImage: "/user_1.png",
          username: "Guest"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserInfo();
  }, []);

  // Fetch posts data from API with pagination
  useEffect(() => {
    if (!isSearchMode) {
      const fetchPosts = async () => {
        try {
          setIsLoading(true);
          const response = await axios.get('http://localhost:8080/api/v1/discussion', {
            params: {
              page: pagination.page,
              limit: pagination.limit
            }
          });

          if (response.data && response.data.status === "success" && response.data.data) {
            const postsData = response.data.data.result;
            
            // Initialize like status for each post
            const initialLikeStatus = {};
            
            // Process each post
            const processedPosts = postsData.map(post => {
              // Check if current user has liked this post
              const isLiked = currentUser && 
                post.favourite && 
                post.favourite.includes(currentUser._id);
                
              // Store like status for this post
              if (currentUser) {
                initialLikeStatus[post._id] = isLiked;
              }
              
              return {
                ...post,
                commentsCount: post.comments ? post.comments.length : 0,
                avatar: post.author && post.author.avtImage ? post.author.avtImage : "/user_1.png",
                likes: post.favourite ? post.favourite.length : 0,
                isLiked: isLiked
              };
            });
            
            setPosts(processedPosts);
            setLikeStatus(initialLikeStatus);
            
            setPagination({
              page: response.data.data.page,
              limit: response.data.data.limit,
              total: response.data.data.total
            });
          }
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching posts:', error);
          setIsLoading(false);
        }
      };
      
      fetchPosts();
    }
  }, [pagination.page, pagination.limit, isSearchMode, currentUser]); 

  useEffect(() => {
    if (search.searchResults && search.searchResults.length > 0) {
      setPosts(search.searchResults);
      setPagination(search.searchPagination);
      setIsSearchMode(true);
    }
  }, [search.searchResults, search.searchPagination]);

  const handleOpenPostForm = () => {
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    setShowPostForm(true);
  };

  const handleClosePostForm = () => {
    setShowPostForm(false);
  };

  const handleNavigateToPostDetail = (postId) => {
    router.push(`/home/${postId}`);
  };

  const handleToggleLike = async (postId, e) => {
    if (e) {
      e.stopPropagation(); 
    }
    
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    
    try {
      const previousLikeState = likeStatus[postId] || false;
      
      // Optimistically update UI
      setLikeStatus(prev => ({
        ...prev,
        [postId]: !previousLikeState
      }));
      
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post._id === postId) {
            const increment = previousLikeState ? -1 : 1;
            return {
              ...post,
              likes: Math.max(0, post.likes + increment),
              isLiked: !previousLikeState
            };
          }
          return post;
        })
      );
      
      // Make API call to update like status
      const response = await axios.put(
        `http://localhost:8080/api/v1/discussion/${postId}/favourite`,
        {},
        { withCredentials: true }
      );
      
      if (response.data.status === "success") {
        const { favouriteCount, isFavourited } = response.data.data;
        
        // Update with actual server data
        setPosts(prevPosts => 
          prevPosts.map(post => {
            if (post._id === postId) {
              return {
                ...post,
                likes: favouriteCount,
                isLiked: isFavourited
              };
            }
            return post;
          })
        );
        
        setLikeStatus(prev => ({
          ...prev,
          [postId]: isFavourited
        }));
      } else {
        // Revert to previous state if failed
        setLikeStatus(prev => ({
          ...prev,
          [postId]: previousLikeState
        }));
        
        setPosts(prevPosts => 
          prevPosts.map(post => {
            if (post._id === postId) {
              const increment = !previousLikeState ? -1 : 1;
              return {
                ...post,
                likes: Math.max(0, post.likes + increment),
                isLiked: previousLikeState
              };
            }
            return post;
          })
        );
        
        console.error('Failed to update like status');
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      
      // Revert to previous state
      setLikeStatus(prev => ({
        ...prev,
        [postId]: likeStatus[postId] || false
      }));
      
      console.error('Failed to update like status');
    }
  };

  const handleClearSearch = () => {
    setIsSearchMode(false);
    setPagination({
      page: 1,
      limit: 10,
      total: 0
    });
  };

  // Handle page change - using regular posts pagination
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= Math.ceil(pagination.total / pagination.limit)) {
      setPagination(prev => ({
        ...prev,
        page: newPage
      }));
    }
  };

  // Redirect to login page
  const handleRedirectToLogin = () => {
    router.push('/account/signin');
  };
  
  // Close login modal
  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
  };

  // Calculate the total number of pages
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  // Determine avatar image source
  const avatarSrc = userInfo.avtImage || "/user_1.png";

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Login Required</h3>
            <p className="mb-6">You need to login to perform this action.</p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={handleCloseLoginModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button 
                onClick={handleRedirectToLogin}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Increased max width */}
      <div className="container mx-auto px-4 py-6 max-w-full">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden max-w-full mx-auto">
          
          {/* Banner Image */}
          <Link href="/contest">
            <div className="w-full cursor-pointer relative">
              <img 
                src="/banner.png" 
                alt="Contest Banner" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-blue-900/30 flex flex-col justify-center px-16">
                <div className="absolute bottom-6 right-6">
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium text-sm">
                    Click to join contest
                  </button>
                </div>
              </div>
            </div>
          </Link>

          {/* Two Images Side by Side Section with Spacing */}
          <div className="flex flex-row justify-between w-full px-6 py-4 gap-4">
            {/* RoomWar Image - Left */}
            <Link href="/create-room">
              <div className="w-full cursor-pointer relative group rounded-lg overflow-hidden shadow-md">
                <img 
                  src="/roomWar.png" 
                  alt="Create Room" 
                  className="w-full h-90 object-cover transition-all duration-300 group-hover:brightness-90"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-blue-600 text-white px-4 py-2 rounded font-medium text-sm">
                    Create a Room
                  </div>
                </div>
              </div>
            </Link>
            
            {/* MatchWar Image - Right */}
            <Link href="/room">
              <div className="w-full cursor-pointer relative group rounded-lg overflow-hidden shadow-md">
                <img 
                  src="/matchWar.png" 
                  alt="Join Room" 
                  className="w-full h-90 object-cover transition-all duration-300 group-hover:brightness-90"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-green-600 text-white px-4 py-2 rounded font-medium text-sm">
                    Join a Room
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Status Update Input - Only the input area opens PostForm */}
          <div
            className="flex items-center space-x-4 px-6 py-4 border-b border-gray-200"
          >
            {isLoading ? (
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
            ) : (
              <img src={avatarSrc} className="w-10 h-10 rounded-full object-cover" alt="Avatar" />
            )}
            <div 
              onClick={handleOpenPostForm}
              className="bg-gray-100 flex-grow py-2 px-4 rounded-full text-gray-500 cursor-pointer hover:bg-gray-200 transition"
            >
              What are you thinking?
            </div>
          </div>

          {/* Post Form Modal */}
          {showPostForm && <PostForm onClose={handleClosePostForm} />}

          {/* Feed Tabs with Search bar */}
          <div className="flex justify-between items-center border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3">
            <div className="flex-grow overflow-hidden mr-4">
              <div className="whitespace-nowrap overflow-hidden relative">
                <div className="animate-marquee inline-block">
                  <span className="font-medium text-base text-blue-700">
                    Welcome to the Codewars Forum - Solve challenges 🔎, share solutions 😉, and improve your coding skills 👨🏻‍💻.
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 w-64">
              {search.renderSearchInput()}
            </div>
          </div>

          {/* Search Status - Only shown when in search mode */}
          {isSearchMode && (
            <div className="bg-blue-50 px-6 py-2 border-b border-blue-100 flex justify-between items-center">
              <div className="text-sm text-blue-700">
                Showing results for search query
              </div>
              <button 
                onClick={handleClearSearch}
                className="text-xs text-blue-700 hover:text-blue-900 underline"
              >
                Clear search and return to Forum
              </button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="p-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">Loading discussions...</p>
            </div>
          )}

          {/* Forum Posts */}
          {!isLoading && (
            <div className="divide-y divide-gray-200">
              {posts.length > 0 ? (
                posts.map(post => (
                  <div 
                    key={post._id} 
                    className="p-4 hover:bg-gray-50 transition duration-150 cursor-pointer" 
                    onClick={() => handleNavigateToPostDetail(post._id)}
                  >
                    <div className="flex space-x-3">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
                          <img src={post.avatar} alt={post.author ? post.author.username : "User"} className="w-full h-full object-cover" />
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-grow">
                        {/* Header */}
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-600">{post.author ? post.author.username : "Anonymous User"}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        {/* Title */}
                        <h3 className="text-xl font-bold mb-2 text-gray-900">{post.title}</h3>
                        
                        {/* Preview Text */}
                        <div className="text-gray-600 mb-3 line-clamp-3" dangerouslySetInnerHTML={{ __html: post.content }} />
                        
                        {/* Post Stats */}
                        <div className="flex items-center space-x-6 text-gray-500">
                          <div 
                            className={`flex items-center space-x-1 ${post.isLiked ? 'text-blue-600' : 'text-gray-500'}`}
                            onClick={(e) => handleToggleLike(post._id, e)}
                          >
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              className="h-5 w-5" 
                              fill={post.isLiked ? "currentColor" : "none"} 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" 
                              />
                            </svg>
                            <span>{post.likes}</span>
                          </div>

                          <div className="flex items-center space-x-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>{post.commentsCount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-gray-500">
                  {isSearchMode ? 'No results found for your search query.' : 'No discussions found.'}
                </div>
              )}
            </div>
          )}

          {/* Pagination Controls */}
          {!isLoading && posts.length > 0 && (
            isSearchMode ? 
            search.renderPagination() : 
            <div className="flex justify-center items-center px-6 py-4 border-t border-gray-200">
              <button 
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`px-3 py-1 rounded-md mr-2 ${
                  pagination.page === 1 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                Previous
              </button>
              
              <div className="flex space-x-1">
                {/* Current page indicator */}
                <span className="px-3 py-1 bg-blue-500 text-white rounded-md">
                  {pagination.page}
                </span>
                
                {/* Total pages indicator */}
                <span className="px-3 py-1 text-gray-600">
                  of {totalPages}
                </span>
              </div>
              
              <button 
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= totalPages}
                className={`px-3 py-1 rounded-md ml-2 ${
                  pagination.page >= totalPages 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                Next
              </button>
            </div>
          )}
          
          {/* Add CSS for the marquee animation */}
          <style jsx>{`
            @keyframes marquee {
              0% { transform: translateX(100%); }
              100% { transform: translateX(-100%); }
            }
            .animate-marquee {
              animation: marquee 15s linear infinite;
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}