'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params?.id;
  
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likeStatus, setLikeStatus] = useState({});
  const [commentText, setCommentText] = useState('');
  const [userAvatar, setUserAvatar] = useState('/user_1.png');
  const [username, setUsername] = useState('You');

  // Dummy posts data for demonstration
  const postsData = [
    {
      id: "1",
      author: "Anonymous User",
      avatar: "/user_1.png",
      title: "Amazon SDE-2 | Reject",
      content: "Hey Folks,I just finished my Amazon SDE-2 (Bengaluru, India) loop. Here's how it went.\n\n1. Online Assessment (8 March)\nIt was a 2.5-hour-long assessment & there were 3 types of exercises in the assessment:\nCoding Challenge – this timed section takes 90 minutes\nWork Style Assessment – this timed section takes 15 minutes\nWork Sample Simulation – this timed section takes 45 minutes\n\nThe coding challenge was a standard online assessment with two medium-level questions. I was able to solve both of them within the time limit.",
      likes: 2,
      comments: [
        { id: 1, author: "CodeMaster", content: "Sorry to hear about the rejection. Don't give up!" },
        { id: 2, author: "JavaDev", content: "Thanks for sharing your experience. Very helpful for those preparing." },
        { id: 3, author: "AlgoNinja", content: "What kind of coding problems did you face in the interview?" },
        { id: 4, author: "TechRecruiter", content: "Feel free to connect if you're looking for other opportunities!" }
      ],
      commentsCount: 4
    },
    {
      id: "3",
      author: "work2play111",
      avatar: "/user_1.png",
      title: "confused creating VOIP collect call system?(ontario, Canada)",
      content: "My Project\nNeed a collect call system, voip system, in which users can be given a number generated a system that allows Canadian users to collect call that number. The number has to mimic or be land line, the numbers generated will be system numbers and I need to be able to play a message to the caller and the receiver of the call.\n\nMy main confusion is - is there a specific API or service that specializes in this kind of VOIP functionality? Has anyone implemented something similar before?",
      likes: 0,
      comments: [],
      commentsCount: 0
    },
    {
      id: "4",
      author: "work2play111",
      avatar: "/user_1.png",
      title: "confused creating VOIP collect call system?(ontario, Canada)",
      content: "My Project\nNeed a collect call system, voip system, in which users can be given a number generated a system that allows Canadian users to collect call that number. The number has to mimic or be land line, the numbers generated will be system numbers and I need to be able to play a message to the caller and the receiver of the call.\n\nMy main confusion is - is there a specific API or service that specializes in this kind of VOIP functionality? Has anyone implemented something similar before?",
      likes: 0,
      comments: [],
      commentsCount: 0
    },

  ];

  // Fetch post data
  useEffect(() => {
    if (!postId) return;

    // Simulate API fetch
    setIsLoading(true);
    try {
      // For demo, find the post in our dummy data
      const foundPost = postsData.find(p => p.id === postId);
      
      if (foundPost) {
        setPost(foundPost);
        // Initialize like status for this post
        setLikeStatus(prev => ({
          ...prev,
          [foundPost.id]: false
        }));
      } else {
        setError("Post not found");
      }
    } catch (err) {
      setError("Failed to load post");
      console.error(err);
    } finally {
      setIsLoading(false);
    }

    // In a real application, you would fetch from API:
    // async function fetchPost() {
    //   try {
    //     const response = await fetch(`/api/posts/${postId}`);
    //     const data = await response.json();
    //     setPost(data);
    //   } catch (err) {
    //     setError("Failed to load post");
    //   } finally {
    //     setIsLoading(false);
    //   }
    // }
    // fetchPost();
  }, [postId]);

  // Fetch user info (in real app)
  useEffect(() => {
    // Simulating user info fetch
    setTimeout(() => {
      setUserAvatar('/user_1.png');
      setUsername('JohnDoe');
    }, 500);
  }, []);

  const handleToggleLike = (postId) => {
    // Update like status for this post
    setLikeStatus(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));

    // Update post likes count
    if (post && post.id === postId) {
      setPost(prevPost => ({
        ...prevPost,
        likes: prevPost.likes + (likeStatus[postId] ? -1 : 1)
      }));
    }

    // In a real app:
    // axios.post(`/api/posts/${postId}/like`, { liked: !likeStatus[postId] });
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    
    if (!commentText.trim() || !post) return;
    
    const newComment = {
      id: Date.now(), // Temporary ID
      author: username,
      content: commentText,
      timestamp: new Date()
    };

    // Update post with new comment
    setPost(prevPost => ({
      ...prevPost,
      comments: [...(prevPost.comments || []), newComment],
      commentsCount: (prevPost.commentsCount || 0) + 1
    }));

    // Reset comment input
    setCommentText('');

    // In a real app:
    // axios.post(`/api/posts/${post.id}/comments`, { content: commentText });
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
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
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
          
          {/* Author info */}
          <div className="flex items-center space-x-3 mb-4">
            <img 
              src={post.avatar} 
              alt={post.author} 
              className="w-12 h-12 rounded-full object-cover border border-gray-200"
            />
            <div>
              <h3 className="font-bold text-gray-800">{post.author}</h3>
              <p className="text-xs text-gray-500">Posted on {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          
          {/* Post title and content */}
          <h2 className="text-2xl font-bold mb-4">{post.title}</h2>
          <div className="prose max-w-none mb-6 whitespace-pre-line">
            {post.content}
          </div>
          
          {/* Interaction bar */}
          <div className="flex items-center justify-between py-4 border-t border-b border-gray-200 mb-4">
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => handleToggleLike(post.id)}
                className={`flex items-center space-x-1 ${likeStatus[post.id] ? 'text-blue-600' : 'text-gray-500'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={likeStatus[post.id] ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
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
              {post.comments && post.comments.length > 0 ? (
                post.comments.map(comment => (
                  <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-800">{comment.author}</span>
                      <span className="text-xs text-gray-500">{comment.timestamp ? new Date(comment.timestamp).toLocaleString() : 'Just now'}</span>
                    </div>
                    <p className="text-gray-700 mt-1">{comment.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No comments yet. Be the first to comment!</p>
              )}
            </div>
            
            {/* Add Comment Form */}
            <div className="flex space-x-2">
              <img src={userAvatar} className="w-8 h-8 rounded-full object-cover" alt="Your Avatar" />
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
                    Post
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