'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'react-toastify';

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
            likeArray: discussion.like || []
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
  }, []);
  
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
      setLikeStatus(!likeStatus);
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
        
        setPost(prevPost => ({
          ...prevPost,
          likes: favouriteCount,
          isFavourited: isFavourited
        }));
      
        setLikeStatus(isFavourited);
      } else {
        setLikeStatus(previousLikeStatus);
        setPost(prevPost => ({
          ...prevPost,
          likes: prevPost.likes + (previousLikeStatus ? 1 : -1),
          isFavourited: previousLikeStatus
        }));
        toast.error('Failed to update like status');
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      toast.error('Failed to update like status');
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
        toast.success('Posted successfully');

        const newComment = response.data.data;
        
        if (newComment && newComment.author) {

          setComments(prev => [...prev, newComment]);
        } else {
          fetchLatestComments();
        }
        
        setPost(prevPost => ({
          ...prevPost,
          commentsCount: prevPost.commentsCount + 1
        }));
        
        setCommentText('');
        window.location.reload();
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

  // Helper function to fetch latest comments after posting
  const fetchLatestComments = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/v1/discussion/comments/${postId}`);
      
      if (response.data.status === "success") {
        const { comments } = response.data.data;
        setComments(comments);
      }
    } catch (err) {
      console.error("Error fetching updated comments:", err);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
          <p className="text-gray-700">{error || "Post not found"}</p>
          <Link href="/home">
            <div className="mt-6 inline-block text-blue-500 hover:underline">
              Return to Home
            </div>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
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

      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header with back button */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={() => router.back()} 
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
          </div>
          
          {/* Post title and content */}
          <h2 className="text-2xl font-bold mb-4">{post.title}</h2>
          <div 
            className="prose max-w-none mb-6" 
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          
          {/* Interaction bar */}
          <div className="flex items-center justify-between py-4 border-t border-b border-gray-200 mb-4">
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => handleToggleLike(post.id)}
                className={`flex items-center space-x-1 ${likeStatus ? 'text-blue-600' : 'text-gray-500'}`}
              >
                {/* Thumbs up icon for likes */}
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  fill={likeStatus ? "currentColor" : "none"} 
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
                <span>{post.likes} {post.likes === 1 ? 'like' : 'likes'}</span>
              </button>
            </div>
            <div>
              <span className="text-gray-500">{post.commentsCount} {post.commentsCount === 1 ? 'comment' : 'comments'}</span>
            </div>
          </div>
          
          {/* Comments Section */}
          <div className="mb-4">
            <h3 className="font-bold text-lg mb-2">Comments</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
                {comments && comments.length > 0 ? (
                  comments.map(comment => (
                    <div key={comment._id} className="bg-gray-50 p-3 rounded-lg shadow-sm border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={comment.author?.avtImage || '/user_1.png'} 
                            className="w-7 h-7 rounded-full object-cover border-2 border-gray-300" 
                            alt="User Avatar" 
                          />
                          <span className="text-orange-500 font-bold">
                            {comment.author?.username}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs text-gray-500 mr-2">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                          
                          {/* Show menu button only for current user's comments */}
                          {currentUser && comment.author && comment.author._id === currentUser._id && (
                            <div className="relative comment-menu-container">
                              <button 
                                onClick={() => toggleCommentMenu(comment._id)} 
                                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                </svg>
                              </button>
                            
                            {/* Dropdown menu */}
                            {openMenuCommentId === comment._id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1">
                                <button
                                  onClick={() => {
                                    setEditingCommentId(comment._id);
                                    setEditCommentText(comment.content);
                                    setOpenMenuCommentId(null);
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    handleDeleteComment(comment._id);
                                    setOpenMenuCommentId(null);
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Show edit form or content */}
                    {editingCommentId === comment._id ? (
                      <div className="mt-2">
                        <textarea
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                          rows="2"
                        />
                        <div className="flex justify-end mt-2 space-x-2">
                          <button
                            onClick={() => {
                              setEditingCommentId(null);
                              setEditCommentText('');
                            }}
                            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleEditComment(comment._id)}
                            className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-700 mt-1">{comment.content}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No comments yet. Be the first to comment!</p>
              )}
            </div>
            
            {/* Add Comment Form */}
            <div className="flex space-x-2">
              <img 
                src={userAvatar} 
                className="w-8 h-8 rounded-full object-cover" 
                alt="Your Avatar" 
              />
              <form className="flex-grow" onSubmit={handleAddComment}>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="flex-grow rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Write a comment..."
                  />
                  <button 
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    Comment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}