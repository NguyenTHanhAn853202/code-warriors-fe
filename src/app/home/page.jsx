'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import PostForm from './post';

export default function SocialMediaPage() {
  const router = useRouter();
  const [likeStatus, setLikeStatus] = useState({});
  const [showPostForm, setShowPostForm] = useState(false);
  const [userInfo, setUserInfo] = useState({
    avtImage: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([
    {
      id: 1,
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
      id: 2,
      author: "work2play111",
      avatar: "/user_1.png",
      title: "confused creating VOIP collect call system?(ontario, Canada)",
      content: "My Project\nNeed a collect call system, voip system, in which users can be given a number generated a system that allows Canadian users to collect call that number. The number has to mimic or be land line, the numbers generated will be system numbers and I need to be able to play a message to the caller and the receiver of the call.\n\nMy main confusion is - is there a specific API or service that specializes in this kind of VOIP functionality? Has anyone implemented something similar before?",
      likes: 0,
      comments: [],
      commentsCount: 0
    }
    ,
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
  ]);

  // Fetch user info from API using axios
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // For now, we're just simulating an API call with a timeout
        // Replace this with actual API call when ready
        setTimeout(() => {
          setUserInfo({
            avtImage: "/user_1.png",
            username: "JohnDoe"
          });
          setIsLoading(false);
        }, 1000);
        
        // When ready to use real API:
        // const response = await axios.get('http://localhost:8080/api/v1/user/info');
        // setUserInfo(response.data);
      } catch (error) {
        console.error('Error fetching user info:', error);
        setIsLoading(false);
      }
    };
    
    fetchUserInfo();
  }, []);

  // Optional: Fetch posts data from API
  useEffect(() => {
    // Future implementation:
    // const fetchPosts = async () => {
    //   try {
    //     const response = await axios.get('http://localhost:8080/api/v1/posts');
    //     setPosts(response.data);
    //   } catch (error) {
    //     console.error('Error fetching posts:', error);
    //   }
    // };
    // fetchPosts();
  }, []);

  const handleOpenPostForm = () => {
    setShowPostForm(true);
  };

  const handleClosePostForm = () => {
    setShowPostForm(false);
  };

  const handleNavigateToPostDetail = (postId) => {
    router.push(`/home/${postId}`);
  };

  const handleToggleLike = (postId, e) => {
    if (e) {
      e.stopPropagation(); // Prevent navigating to the post detail
    }
    
    // Update like status for this post
    setLikeStatus(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));

    // Update post likes count in the state
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          const increment = likeStatus[postId] ? -1 : 1;
          return {
            ...post,
            likes: post.likes + increment
          };
        }
        return post;
      })
    );

    // In the future, you would make an API call here:
    // axios.post(`http://localhost:8080/api/v1/posts/${postId}/like`, { liked: !likeStatus[postId] });
  };

  // Determine avatar image source
  const avatarSrc = userInfo.avtImage === "" ? "/user_1.png" : userInfo.avtImage;

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Main Content - Increased max width */}
      <div className="container mx-auto px-4 py-6 max-w-full">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden max-w-6xl mx-auto">
          
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

          {/* Feed Tabs - Improved styling with marquee effect */}
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
            <div className="flex-shrink-0">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search Feed 🔎..." 
                  className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm" 
                />
                <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>
          </div>

          {/* Forum Posts */}
          <div className="divide-y divide-gray-200">
            {posts.map(post => (
              <div 
                key={post.id} 
                className="p-4 hover:bg-gray-50 transition duration-150 cursor-pointer" 
                onClick={() => handleNavigateToPostDetail(post.id)}
              >
                <div className="flex space-x-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
                      <img src={post.avatar} alt={post.author} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-grow">
                    {/* Header */}
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-600">{post.author}</span>
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-xl font-bold mb-2 text-gray-900">{post.title}</h3>
                    
                    {/* Preview Text */}
                    <p className="text-gray-600 mb-3 line-clamp-3">
                      {post.content}
                    </p>
                    
                    {/* Post Stats */}
                    <div className="flex items-center space-x-6 text-gray-500">
                      <div 
                        className={`flex items-center space-x-1 ${likeStatus[post.id] ? 'text-blue-600' : 'text-gray-500'}`}
                        onClick={(e) => handleToggleLike(post.id, e)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={likeStatus[post.id] ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
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
            ))}
          </div>
          
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