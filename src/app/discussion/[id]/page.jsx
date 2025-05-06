'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { 
  ThumbsUp, MessageCircle, ChevronLeft, MoreVertical, 
  Edit2, Trash2, Send, X, LogIn
} from 'lucide-react';

// Custom tooltip component to replace Tippy
const Tooltip = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef(null);
  
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-block"
      >
        {children}
      </div>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded -left-2 -top-8 whitespace-nowrap"
          >
            {content}
            <div className="absolute w-2 h-2 bg-gray-900 rotate-45 -bottom-1 left-4"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params?.id;
  
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likeStatus, setLikeStatus] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [userAvatar, setUserAvatar] = useState('/user_1.png');
  const [username, setUsername] = useState('');
  const [comments, setComments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [openMenuCommentId, setOpenMenuCommentId] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);

  // Fetch post data from API
  useEffect(() => {
    if (!postId) return;

    const fetchPostDetails = async () => {
      setIsLoading(true);
      try {
        // First get the current user info
        let userId = null;
        try {
          const userResponse = await axios.get('http://localhost:8080/api/v1/user/info', {
            withCredentials: true
          });
          
          if (userResponse.data && userResponse.data.status === "success") {
            const userData = userResponse.data.data;
            setCurrentUser(userData);
            setUsername(userData.username);
            setUserAvatar(userData.avtImage || '/user_1.png');
            userId = userData._id;
          }
        } catch (userErr) {
          console.error("Could not fetch current user:", userErr);
        }

        // Then get the post details
        const detailsResponse = await axios.get(`http://localhost:8080/api/v1/discussion/comments/${postId}`);
        
        if (detailsResponse.data.status === "success") {
          const { discussion, comments } = detailsResponse.data.data;
          
          // Check if the current user's ID is in the like array
          const isLiked = userId && discussion.like && discussion.like.includes(userId);
          
          setPost({
            id: postId,
            title: discussion.title,
            content: discussion.content,
            likes: discussion.likeCount || 0,
            commentsCount: discussion.commentCount,
            isFavourited: isLiked,
            likeArray: discussion.like || [],
            createdAt: discussion.createdAt,
            author: discussion.author || { username: 'Anonymous', avtImage: '/user_1.png' }
          });
          
          setLikeStatus(isLiked);
          setComments(comments);
        } else {
          setError("Failed to load post data");
        }
      } catch (err) {
        console.error("API Error:", err);
        setError("Failed to load post data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostDetails();
  }, [postId]);

  // Fetch current user info
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/v1/user/info', {
          withCredentials: true
        });
        
        if (response.data && response.data.status === "success") {
          const userData = response.data.data;
          setCurrentUser(userData);
          setUsername(userData.username);
          setUserAvatar(userData.avtImage || '/user_1.png');
          
          // If post is already loaded, check if this user has liked it
          if (post && post.likeArray) {
            const isLiked = post.likeArray.includes(userData._id);
            setLikeStatus(isLiked);
            setPost(prevPost => ({
              ...prevPost,
              isFavourited: isLiked
            }));
          }
        }
      } catch (err) {
        console.log("Could not fetch current user, using default values");
        setUsername('Guest');
        setUserAvatar('/user_1.png');
      }
    };

    fetchCurrentUser();
  }, [post?.likeArray]);
  
  // Close comment menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuCommentId && !event.target.closest('.comment-menu-container')) {
        setOpenMenuCommentId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuCommentId]);

  const handleToggleLike = async (postId) => {
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }

    try {
      const previousLikeStatus = likeStatus;
      
      // Optimistic UI update with animation
      setLikeStatus(!likeStatus);
      setIsLikeAnimating(true);
      
      setPost(prevPost => ({
        ...prevPost,
        likes: prevPost.likes + (likeStatus ? -1 : 1),
        isFavourited: !likeStatus
      }));
      
      // Make API call to toggle favorite status
      const response = await axios.put(
        `http://localhost:8080/api/v1/discussion/${postId}/favourite`,
        {}, // Empty body for PUT request
        { withCredentials: true }
      );
      
      if (response.data.status === "success") {
        const { favouriteCount, isFavourited } = response.data.data;
        
        // Update with actual server response
        setPost(prevPost => ({
          ...prevPost,
          likes: favouriteCount,
          isFavourited: isFavourited,
          likeArray: prevPost.likeArray ? 
            (isFavourited ? 
              [...prevPost.likeArray.filter(id => id !== currentUser._id), currentUser._id] : 
              prevPost.likeArray.filter(id => id !== currentUser._id)
            ) : []
        }));
      
        setLikeStatus(isFavourited);
      } else {
        // Revert changes if API call fails
        setLikeStatus(previousLikeStatus);
        setPost(prevPost => ({
          ...prevPost,
          likes: prevPost.likes + (previousLikeStatus ? 1 : -1),
          isFavourited: previousLikeStatus
        }));
        toast.error('Failed to update like status');
      }
      
      // Reset animation state after animation completes
      setTimeout(() => setIsLikeAnimating(false), 1000);
    } catch (err) {
      console.error("Error toggling like:", err);
      toast.error('Failed to update like status');
      setIsLikeAnimating(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    
    if (!commentText.trim() || !post) return;

    const requestData = {
      discussionId: postId,
      content: commentText
    };

    try {
      const response = await axios.post(`http://localhost:8080/api/v1/discussion/comment`, requestData, {
        withCredentials: true,
      });
      
      if (response.data.status === "success") {
        // Get the new comment data from the API response
        const newCommentData = response.data.data.comment;
        
        // Create a properly formatted comment object with current user's information
        const newComment = {
          ...newCommentData,
          author: {
            _id: currentUser._id,
            username: currentUser.username,
            avtImage: currentUser.avtImage || '/user_1.png'
          }
        };
        
        // Add the new comment to the list
        setComments(prev => [...prev, newComment]);
        
        // Update comment count
        setPost(prevPost => ({
          ...prevPost,
          commentsCount: prevPost.commentsCount + 1
        }));
        
        setCommentText('');
        toast.success('Comment posted successfully');
        
        // No need to reload the page - this improves user experience
        // window.location.reload();
        // window.scrollTo(0, 0);
      } else {
        toast.error('Failed to post comment');
      }
    } catch (err) {
      console.error("Error adding comment:", err);
      toast.error('Failed to post comment');
    }
  };
  
  const handleEditComment = async (commentId) => {
    if (!editCommentText.trim()) return;
    
    try {
      const response = await axios.put(
        `http://localhost:8080/api/v1/discussion/comment/${commentId}`,
        { content: editCommentText },
        { withCredentials: true }
      );
      
      if (response.data.status === "success") {
        toast.success('Comment updated successfully');
        
        // Update the comment in the state
        setComments(prev => 
          prev.map(comment => 
            comment._id === commentId 
              ? { ...comment, content: editCommentText } 
              : comment
          )
        );
        
        // Reset editing state
        setEditingCommentId(null);
        setEditCommentText('');
      } else {
        toast.error('Failed to update comment');
      }
    } catch (err) {
      console.error("Error updating comment:", err);
      toast.error('Failed to update comment');
    }
  };
  
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      const response = await axios.delete(
        `http://localhost:8080/api/v1/discussion/comment/${commentId}`,
        { withCredentials: true }
      );
      
      if (response.data.status === "success") {
        toast.success('Comment deleted successfully');
        
        // Remove the comment from state
        setComments(prev => prev.filter(comment => comment._id !== commentId));
        
        // Update comment count
        setPost(prevPost => ({
          ...prevPost,
          commentsCount: Math.max(0, prevPost.commentsCount - 1)
        }));
      } else {
        toast.error('Failed to delete comment');
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
      toast.error('Failed to delete comment');
    }
  };
  
  const toggleCommentMenu = (commentId) => {
    if (openMenuCommentId === commentId) {
      setOpenMenuCommentId(null);
    } else {
      setOpenMenuCommentId(commentId);
    }
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/v1/discussion/comments/${postId}`);
  
        if (response.data.status === "success") {
          const { discussion, comments } = response.data.data;
  
          // Kiểm tra người dùng đã like chưa
          const isLiked = currentUser && discussion.favourite.includes(currentUser._id);
  
          setPost({
            ...discussion,
            isLiked,
            likes: discussion.favourite.length
          });
          setLikeStatus(isLiked);
          setComments(comments);
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
  
    if (postId && currentUser) {
      fetchPost();
    }
  }, [postId, currentUser]);  
  

  // Redirect to login page
  const handleRedirectToLogin = () => {
    router.push('/account/signin');
  };
  
  // Close login modal
  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
  };
  
  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'some time ago';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
          <p className="text-indigo-600 mt-4 font-medium">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-xl p-8 border border-red-100">
          <div className="flex items-center space-x-3 text-red-500 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h1 className="text-2xl font-bold">Error</h1>
          </div>
          <p className="text-gray-700 mb-6">{error || "Post not found. It may have been deleted or moved."}</p>
          <Link href="/discussion">
            <div className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Return to Discussion
            </div>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4 sm:px-6">
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Login Required</h3>
                <button 
                  onClick={handleCloseLoginModal}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="mb-6">
                <div className="flex items-center justify-center bg-amber-50 text-amber-700 p-4 rounded-lg mb-6">
                  <LogIn className="h-5 w-5 mr-3 flex-shrink-0" />
                  <p>You need to login to perform this action.</p>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={handleCloseLoginModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleRedirectToLogin}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium flex items-center"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Go to Login
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto">
        {/* Back navigation */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <button 
            onClick={() => router.back()} 
            className="group mb-6 flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors duration-200"
          >
            <div className="bg-white p-2 rounded-full shadow-sm group-hover:shadow-md transition-all duration-200">
              <ChevronLeft className="h-5 w-5" />
            </div>
            <span className="font-medium">Back to discussions</span>
          </button>
        </motion.div>

        {/* Main content card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl overflow-hidden border border-gray-100"
        >

          {/* Post header with enhanced styling */}
          <div className="bg-gradient-to-r from-blue-400 to-indigo-500 p-8 rounded-t-2xl border-b border-gray-200 relative overflow-hidden">
            {/* Background pattern overlay */}
            <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMyAwLTYgMy0zIDEybS0xOCA2YzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02Yy0zIDAtNiAzLTMgMTIiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')]"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img 
                    src={post.author?.avtImage || '/user_1.png'} 
                    className="w-13 h-13 rounded-full object-cover border-4 border-white" 
                    alt="Author Avatar" 
                  />
                </div>
                <div>
                  <div className="font-bold text-white text-lg flex items-center space-x-2">
                    {post.author?.username}
                  </div>
                  <div className="text-gray-200 text-sm">
                    {formatDate(post.createdAt)}
                  </div>
                </div>
              </div>
              <h1 className="text-3xl md:text-3xl font-bold mt-6 text-white tracking-tight">{post.title}</h1>
            </div>
          </div>
          
          {/* Post content */}
          <div className="p-6">
            <div 
              className="prose prose-lg max-w-none mb-8" 
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            
            {/* Interaction bar */}
            {post && (
            <div className="flex items-center py-4 border-t border-b border-gray-200 mb-6">
              <div className="flex items-center space-x-4">
                <motion.button 
                
                  onClick={() => handleToggleLike(post._id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                    post.isLiked ? 'text-blue-600 bg-blue-50' : 'text-gray-600 bg-gray-50 hover:bg-gray-100'
                  } transition-all duration-200`}
                  whileTap={{ scale: 0.95 }}
                  aria-label={post.isLiked ? "Unlike this post" : "Like this post"}
                >
                  <motion.div
                    animate={isLikeAnimating ? {
                      scale: [1, 1.5, 1],
                      transition: { duration: 0.5 }
                    } : {}}
                  >
                    <ThumbsUp 
                      className={`h-5 w-5 ${post.isLiked ? 'fill-current' : ''}`} 
                    />
                  </motion.div>
                  <span className="font-medium">{post.likes}</span>
                </motion.button>

                <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-50 text-gray-600">
                  <MessageCircle className="h-5 w-5" />
                  <span className="font-medium">{post.commentCount || comments.length}</span>
                </div>
              </div>
            </div>
          )}

            
            {/* Comments Section */}
            <div className="mb-6">
              <h3 className="font-bold text-xl mb-4 text-gray-800 flex items-center">
                <MessageCircle className="h-5 w-5 mr-2 text-indigo-600" />
                Comments
              </h3>

              {/* Comment list */}
              <div className="space-y-4 max-h-96 overflow-y-auto mb-6 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {comments && comments.length > 0 ? (
                  comments.map((comment) => (
                    <motion.div 
                      key={comment._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`bg-white p-4 rounded-xl ${
                        currentUser && comment.author && comment.author._id === currentUser._id 
                          ? 'border-l-4 border-indigo-400' 
                          : 'border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={comment.author?.avtImage || '/user_1.png'} 
                            className="w-10 h-10 rounded-full object-cover border-2 border-white" 
                            alt="User Avatar" 
                          />
                          <div>
                            <span className="font-semibold text-gray-800">
                            {comment.author?.username || 'Unknown User'}
                            </span>
                            <p className="text-xs text-gray-500">
                              {formatDate(comment.createdAt)}
                            </p>
                          </div>
                        </div>
                        
                        {/* Comment menu for author */}
                        {currentUser && comment.author && comment.author._id === currentUser._id && (
                          <div className="relative comment-menu-container">
                            <Tooltip content="Options">
                              <button 
                                onClick={() => toggleCommentMenu(comment._id)} 
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                              >
                                <MoreVertical className="h-5 w-5 text-gray-500" />
                              </button>
                            </Tooltip>
                            
                            {/* Dropdown menu */}
                            <AnimatePresence>
                              {openMenuCommentId === comment._id && (
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                  transition={{ duration: 0.15 }}
                                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg z-10 overflow-hidden border border-gray-200"
                                >
                                  <button
                                    onClick={() => {
                                      setEditingCommentId(comment._id);
                                      setEditCommentText(comment.content);
                                      setOpenMenuCommentId(null);
                                    }}
                                    className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                                  >
                                    <Edit2 className="h-4 w-4 mr-2 text-indigo-500" />
                                    Edit Comment
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleDeleteComment(comment._id);
                                      setOpenMenuCommentId(null);
                                    }}
                                    className="flex items-center w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Comment
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                      
                      {/* Comment content or edit form */}
                      <div className="mt-3">
                        {editingCommentId === comment._id ? (
                          <div className="mt-2">
                            <textarea
                              value={editCommentText}
                              onChange={(e) => setEditCommentText(e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                              rows="3"
                              placeholder="Edit your comment..."
                            />
                            <div className="flex justify-end mt-2 space-x-2">
                              <button
                                onClick={() => {
                                  setEditingCommentId(null);
                                  setEditCommentText('');
                                }}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 flex items-center"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Cancel
                              </button>
                              <button
                                onClick={() => handleEditComment(comment._id)}
                                className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                              >
                                <Edit2 className="h-4 w-4 mr-1" />
                                Save Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-700">{comment.content}</p>
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="bg-gray-50 rounded-xl p-8 text-center">
                    <div className="flex justify-center mb-3">
                      <MessageCircle className="h-12 w-12 text-gray-300" />
                    </div>
                    <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
                  </div>
                )}
              </div>
              
              {/* Add Comment Form */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl p-4 border border-gray-200"
              >
                <h4 className="font-medium text-gray-700 mb-3">Add your comment</h4>
                <form onSubmit={handleAddComment}>
                  <div className="flex items-start space-x-3">
                    <img 
                      src={userAvatar} 
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200" 
                      alt="Your Avatar" 
                    />
                    <div className="flex-grow">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="w-full p-3 min-h-[100px] bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                        placeholder={currentUser ? "Add your thoughts..." : "Login to comment"}
                        disabled={!currentUser}
                      />
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          {!currentUser && "You need to be logged in to comment"}
                        </span>
                        <motion.button 
                          type="submit"
                          className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          disabled={!currentUser || !commentText.trim()}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Post Comment
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}