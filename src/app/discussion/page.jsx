'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import PostForm from '../../components/discussion/post';
import SearchComponent from '../../components/discussion/search';
import PostComponent from '../../components/discussion/discussion';
import {
    ChevronLeft,
    ChevronRight,
    Code,
    MessageSquare,
    Search,
    PlusCircle,
    Github,
    FileCode2,
    Brain,
    Laptop,
    Edit3,
} from 'lucide-react';

export default function SocialMediaPage() {
    const router = useRouter();
    const [likeStatus, setLikeStatus] = useState({});
    const [showPostForm, setShowPostForm] = useState(false);
    const [userInfo, setUserInfo] = useState({
        avtImage: '',
        username: '',
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
        total: 0,
    });

    // Initialize the search component
    const search = SearchComponent();

    // Fetch user info from API using axios
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/v1/user/info', {
                    withCredentials: true,
                });

                if (response.data && response.data.status === 'success') {
                    const userData = response.data.data;
                    setUserInfo({
                        avtImage: userData.avtImage || '/user_1.png',
                        username: userData.username,
                    });
                    setCurrentUser(userData);
                } else {
                    setUserInfo({
                        avtImage: '/user_1.png',
                        username: 'Guest',
                    });
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
                setUserInfo({
                    avtImage: '/user_1.png',
                    username: 'Guest',
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
                            limit: pagination.limit,
                        },
                    });

                    if (response.data && response.data.status === 'success' && response.data.data) {
                        const postsData = response.data.data.result;

                        // Initialize like status for each post
                        const initialLikeStatus = {};

                        // Process each post
                        const processedPosts = postsData.map((post) => {
                            // Check if current user has liked this post
                            const isLiked = currentUser && post.favourite && post.favourite.includes(currentUser._id);

                            // Store like status for this post
                            if (currentUser) {
                                initialLikeStatus[post._id] = isLiked;
                            }

                            return {
                                ...post,
                                commentsCount: post.comments ? post.comments.length : 0,
                                avatar: post.author && post.author.avtImage ? post.author.avtImage : '/user_1.png',
                                likes: post.favourite ? post.favourite.length : 0,
                                isLiked: isLiked,
                            };
                        });

                        setPosts(processedPosts);
                        setLikeStatus(initialLikeStatus);

                        setPagination({
                            page: response.data.data.page,
                            limit: response.data.data.limit,
                            total: response.data.data.total,
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
        router.push(`/discussion/${postId}`);
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
            setLikeStatus((prev) => ({
                ...prev,
                [postId]: !previousLikeState,
            }));

            setPosts((prevPosts) =>
                prevPosts.map((post) => {
                    if (post._id === postId) {
                        const increment = previousLikeState ? -1 : 1;
                        return {
                            ...post,
                            likes: Math.max(0, post.likes + increment),
                            isLiked: !previousLikeState,
                        };
                    }
                    return post;
                }),
            );

            // Make API call to update like status
            const response = await axios.put(
                `http://localhost:8080/api/v1/discussion/${postId}/favourite`,
                {},
                { withCredentials: true },
            );

            if (response.data.status === 'success') {
                const { favouriteCount, isFavourited } = response.data.data;

                // Update with actual server data
                setPosts((prevPosts) =>
                    prevPosts.map((post) => {
                        if (post._id === postId) {
                            return {
                                ...post,
                                likes: favouriteCount,
                                isLiked: isFavourited,
                            };
                        }
                        return post;
                    }),
                );

                setLikeStatus((prev) => ({
                    ...prev,
                    [postId]: isFavourited,
                }));
            } else {
                // Revert to previous state if failed
                setLikeStatus((prev) => ({
                    ...prev,
                    [postId]: previousLikeState,
                }));

                setPosts((prevPosts) =>
                    prevPosts.map((post) => {
                        if (post._id === postId) {
                            const increment = !previousLikeState ? -1 : 1;
                            return {
                                ...post,
                                likes: Math.max(0, post.likes + increment),
                                isLiked: previousLikeState,
                            };
                        }
                        return post;
                    }),
                );

                console.error('Failed to update like status');
            }
        } catch (err) {
            console.error('Error toggling like:', err);

            // Revert to previous state
            setLikeStatus((prev) => ({
                ...prev,
                [postId]: likeStatus[postId] || false,
            }));

            console.error('Failed to update like status');
        }
    };

    const handleClearSearch = () => {
        setIsSearchMode(false);
        setPagination({
            page: 1,
            limit: 10,
            total: 0,
        });
    };

    // Handle page change - using regular posts pagination
    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= Math.ceil(pagination.total / pagination.limit)) {
            setPagination((prev) => ({
                ...prev,
                page: newPage,
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
    const avatarSrc = userInfo.avtImage || '/user_1.png';

    // Language categories for display
    const languageCategories = [
        {
            name: 'JavaScript',
            icon: <Code className="w-5 h-5 text-yellow-500" />,
            color: 'bg-yellow-100 text-yellow-800',
        },
        { name: 'Python', icon: <FileCode2 className="w-5 h-5 text-blue-500" />, color: 'bg-blue-100 text-blue-800' },
        { name: 'Ruby', icon: <FileCode2 className="w-5 h-5 text-red-500" />, color: 'bg-red-100 text-red-800' },
        {
            name: 'Java',
            icon: <FileCode2 className="w-5 h-5 text-orange-500" />,
            color: 'bg-orange-100 text-orange-800',
        },
        { name: 'C++', icon: <FileCode2 className="w-5 h-5 text-blue-600" />, color: 'bg-blue-100 text-blue-800' },
        { name: 'C#', icon: <FileCode2 className="w-5 h-5 text-green-600" />, color: 'bg-green-100 text-green-800' },
        {
            name: 'PHP',
            icon: <FileCode2 className="w-5 h-5 text-purple-600" />,
            color: 'bg-purple-100 text-purple-800',
        },
    ];

    return (
        <div className="bg-gray-50 min-h-screen text-gray-900">
            {/* Login Modal */}
            {showLoginModal && (
                <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-gray-100">
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Login Required</h3>
                        <p className="mb-6 text-gray-600">You need to login to perform this action.</p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={handleCloseLoginModal}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRedirectToLogin}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                            >
                                Go to Login
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modern CodeWars Forum Header Banner */}
            <div className="relative bg-gradient-to-r from-blue-800 via-indigo-700 to-blue-900 overflow-hidden">
                <div className="absolute inset-0">
                    <svg
                        className="absolute bottom-0 opacity-10"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 1440 320"
                    >
                        <path
                            fill="#ffffff"
                            fillOpacity="1"
                            d="M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,186.7C672,203,768,181,864,154.7C960,128,1056,96,1152,101.3C1248,107,1344,149,1392,170.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                        ></path>
                    </svg>
                    <div className="absolute top-0 left-0 right-0 bottom-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNGMwLTIuMi0xLjgtNC00LTRzLTQgMS44LTQgNCAxLjggNCA0IDQgNC0xLjggNC00bTAtN2MwLTIuMi0xLjgtNC00LTRzLTQgMS44LTQgNCAxLjggNCA0IDQgNC0xLjggNC00bTctN2MwLTIuMi0xLjgtNC00LTRzLTQgMS44LTQgNCAxLjggNCA0IDQgNC0xLjggNC00bS03LTdjMC0yLjItMS44LTQtNC00cy00IDEuOC00IDQgMS44IDQgNCA0IDQtMS44IDQtNG0tNyA3YzAtMi4yLTEuOC00LTQtNHMtNCAxLjgtNCA0IDEuOCA0IDQgNCA0LTEuOCA0LTRtLTcgN2MwLTIuMi0xLjgtNC00LTRzLTQgMS44LTQgNCAxLjggNCA0IDQgNC0xLjggNC00bS03IDdjMC0yLjItMS44LTQtNC00cy00IDEuOC00IDQgMS44IDQgNCA0IDQtMS44IDQtNCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjEiIHN0cm9rZS13aWR0aD0iMiIvPjxwYXRoIGQ9Ik0yOSAyOWMwLTIuMi0xLjgtNC00LTRzLTQgMS44LTQgNCAxLjggNCA0IDQgNC0xLjggNC00bTctN2MwLTIuMi0xLjgtNC00LTRzLTQgMS44LTQgNCAxLjggNCA0IDQgNC0xLjggNC00bS03LTdjMC0yLjItMS44LTQtNC00cy00IDEuOC00IDQgMS44IDQgNCA0IDQtMS44IDQtNCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjEiIHN0cm9rZS13aWR0aD0iMiIvPjxwYXRoIGQ9Ik0yMiAyMmMwLTIuMi0xLjgtNC00LTRzLTQgMS44LTQgNCAxLjggNCA0IDQgNC0xLjggNC00IiBzdHJva2U9IiNmZmYiIHN0cm9rZS1vcGFjaXR5PSIuMSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-20"></div>
                </div>

                <div className="container mx-auto px-4 py-16 relative z-10">
                    <div className="max-w-5xl mx-auto text-center">
                        <div className="flex items-center justify-center mb-4">
                            <div className="bg-white bg-opacity-20 p-3 rounded-xl shadow-lg backdrop-blur-md">
                                <img src="/logoCode.png" alt="CodeWars Logo" className="h-14 w-14 object-contain" />
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4 drop-shadow-md">
                            CodeWars Forum
                        </h1>

                        <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                            Join our community of coders to solve challenges, share solutions, and elevate your
                            programming skills.
                        </p>

                        {/* Language categories in a clean horizontal row */}
                        <div className="flex flex-wrap justify-center gap-2 mb-2">
                            {languageCategories.map((lang, index) => (
                                <div
                                    key={index}
                                    className={`${lang.color} flex items-center px-4 py-2 rounded-full shadow-md transition-transform hover:scale-105`}
                                >
                                    {lang.icon}
                                    <span className="ml-2 font-medium text-sm">{lang.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Clean bottom border with slight curve */}
                <div className="h-16 bg-white relative -mb-8 rounded-t-3xl shadow-inner"></div>
            </div>

            {/* Main Content - Elegant card design */}
            <div className="container mx-auto px-4 max-w-5xl pt-4 pb-12">
                <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100">
                    {/* Status Update Input - Modern clean design */}
                    <div className="flex items-center space-x-4 px-6 py-5 border-b border-gray-100">
                        {isLoading ? (
                            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                        ) : (
                            <img
                                src={avatarSrc}
                                className="w-10 h-10 rounded-full object-cover border-2 border-blue-100 shadow-sm"
                                alt="Avatar"
                            />
                        )}
                        <div
                            onClick={handleOpenPostForm}
                            className="bg-gray-50 flex-grow py-3 px-5 rounded-full text-gray-500 cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 border border-gray-200 shadow-sm flex items-center"
                        >
                            <Edit3 className="w-4 h-4 mr-2 text-gray-400" />
                            <span>What are you thinking?</span>
                        </div>
                        <button
                            onClick={handleOpenPostForm}
                            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-md flex-shrink-0"
                        >
                            <PlusCircle className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Post Form Modal */}
                    {showPostForm && <PostForm onClose={handleClosePostForm} />}

                    {/* Feed Header with Search bar */}
                    <div className="flex justify-between items-center border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4">
                        <div className="flex items-center text-gray-700 font-medium">
                            <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
                            <span>Recent Discussions</span>
                        </div>
                        <div className="flex-shrink-0 w-64 relative">{search.renderSearchInput()}</div>
                    </div>

                    {/* Search Status - Only shown when in search mode */}
                    {isSearchMode && (
                        <div className="bg-blue-50 px-6 py-3 border-b border-blue-100 flex justify-between items-center">
                            <div className="flex items-center text-blue-700">
                                <Search className="w-4 h-4 mr-2" />
                                <span className="text-sm font-medium">Search Results</span>
                            </div>
                            <button
                                onClick={handleClearSearch}
                                className="text-xs px-3 py-1 bg-white text-blue-700 hover:text-blue-900 rounded-full border border-blue-200 shadow-sm"
                            >
                                Clear Search
                            </button>
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <div className="p-12 text-center">
                            <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent"></div>
                            <p className="mt-4 text-gray-600 font-medium">Loading discussions...</p>
                        </div>
                    )}

                    {/* Forum Posts - Now using PostComponent */}
                    {!isLoading && (
                        <div className="p-6 space-y-5">
                            {posts.length > 0 ? (
                                posts.map((post) => (
                                    <PostComponent
                                        key={post._id}
                                        post={post}
                                        currentUser={currentUser}
                                        onToggleLike={handleToggleLike}
                                        onPostClick={handleNavigateToPostDetail}
                                    />
                                ))
                            ) : (
                                <div className="py-16 text-center text-gray-500">
                                    <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
                                        <MessageSquare className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <p className="text-lg font-medium">
                                        {isSearchMode
                                            ? 'No results found for your search query.'
                                            : 'No discussions found.'}
                                    </p>
                                    <p className="mt-2 text-sm text-gray-400">
                                        {isSearchMode
                                            ? 'Try using different keywords'
                                            : 'Be the first to start a discussion!'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Enhanced Pagination Controls */}
                    {!isLoading &&
                        posts.length > 0 &&
                        (isSearchMode ? (
                            search.renderPagination()
                        ) : (
                            <div className="px-6 py-5 border-t border-gray-100 bg-gray-50">
                                <div className="flex justify-center items-center">
                                    <nav
                                        className="relative z-0 inline-flex shadow-sm rounded-md overflow-hidden"
                                        aria-label="Pagination"
                                    >
                                        {/* Previous Page Button */}
                                        <button
                                            onClick={() => handlePageChange(pagination.page - 1)}
                                            disabled={pagination.page === 1}
                                            className={`relative inline-flex items-center px-3 py-2 border-r ${
                                                pagination.page === 1
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-800'
                                            } text-sm font-medium transition-colors`}
                                        >
                                            <span className="sr-only">Previous</span>
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>

                                        {/* First Page */}
                                        {pagination.page > 2 && (
                                            <button
                                                onClick={() => handlePageChange(1)}
                                                className="relative inline-flex items-center px-4 py-2 border-r bg-white text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                                            >
                                                1
                                            </button>
                                        )}

                                        {/* Ellipsis if needed */}
                                        {pagination.page > 3 && (
                                            <span className="relative inline-flex items-center px-4 py-2 border-r bg-white text-sm font-medium text-gray-700">
                                                ...
                                            </span>
                                        )}

                                        {/* Page before current */}
                                        {pagination.page > 1 && (
                                            <button
                                                onClick={() => handlePageChange(pagination.page - 1)}
                                                className="relative inline-flex items-center px-4 py-2 border-r bg-white text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                                            >
                                                {pagination.page - 1}
                                            </button>
                                        )}

                                        {/* Current Page */}
                                        <button
                                            className="relative inline-flex items-center px-4 py-2 border-r bg-blue-600 text-sm font-medium text-white"
                                            aria-current="page"
                                        >
                                            {pagination.page}
                                        </button>

                                        {/* Page after current */}
                                        {pagination.page < totalPages && (
                                            <button
                                                onClick={() => handlePageChange(pagination.page + 1)}
                                                className="relative inline-flex items-center px-4 py-2 border-r bg-white text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                                            >
                                                {pagination.page + 1}
                                            </button>
                                        )}

                                        {/* Ellipsis if needed */}
                                        {pagination.page < totalPages - 2 && (
                                            <span className="relative inline-flex items-center px-4 py-2 border-r bg-white text-sm font-medium text-gray-700">
                                                ...
                                            </span>
                                        )}

                                        {/* Last Page */}
                                        {pagination.page < totalPages - 1 && totalPages > 1 && (
                                            <button
                                                onClick={() => handlePageChange(totalPages)}
                                                className="relative inline-flex items-center px-4 py-2 border-r bg-white text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                                            >
                                                {totalPages}
                                            </button>
                                        )}

                                        {/* Next Page Button */}
                                        <button
                                            onClick={() => handlePageChange(pagination.page + 1)}
                                            disabled={pagination.page >= totalPages}
                                            className={`relative inline-flex items-center px-3 py-2 ${
                                                pagination.page >= totalPages
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-800'
                                            } text-sm font-medium transition-colors`}
                                        >
                                            <span className="sr-only">Next</span>
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </nav>
                                </div>

                                {/* Page info */}
                                <div className="mt-3 text-center text-sm text-gray-500">
                                    Page {pagination.page} of {totalPages} • Showing {posts.length} of{' '}
                                    {pagination.total} discussions
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}
