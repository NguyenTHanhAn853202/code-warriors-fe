'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:8080', {
    withCredentials: true,
});
const API_URL = 'http://localhost:8080/api/v1';

export default function JoinRoomForm({ onError, loading, setLoading }) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        roomId: '',
        password: '',
    });
    const [isPrivateRoom, setIsPrivateRoom] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await axios.get(`${API_URL}/user/info`, { withCredentials: true });
                setFormData((prev) => ({
                    ...prev,
                    username: res.data?.data?.username || 'Player',
                }));
            } catch (err) {
                console.error('Error fetching user info:', err);
                onError('Unable to fetch user information');
            }
        };
        fetchUserData();

        // Socket event listeners
        socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
        });

        socket.on('room_joined', (room) => {
            router.push(`/roombattle/${room.roomId}`);
        });

        socket.on('room_join_error', (data) => {
            onError(data.message || 'Failed to join room');
            setLoading(false);
        });

        // Cleanup listeners on unmount
        return () => {
            socket.off('room_joined');
            socket.off('room_join_error');
        };
    }, [onError, setLoading, router]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleTogglePrivate = () => {
        setIsPrivateRoom(!isPrivateRoom);
        if (!isPrivateRoom === false) {
            setFormData((prev) => ({ ...prev, password: '' }));
        }
    };

    const handleJoinRoom = async (e) => {
        e.preventDefault();
        onError(null);
        setLoading(true);

        // Validation
        if (!formData.username || !formData.roomId) {
            onError('Player name and Room ID are required!');
            setLoading(false);
            return;
        }

        // Store data in localStorage
        localStorage.setItem('username', formData.username);
        localStorage.setItem('roomId', formData.roomId);

        socket.emit('join_room', {
            username: formData.username,
            roomId: formData.roomId,
            password: isPrivateRoom ? formData.password : '',
            isPrivate: isPrivateRoom,
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center p-4 rounded-md">
            <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-purple-100 transform hover:scale-[1.01] transition-all duration-300 overflow-hidden border-none">
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSgzMCkiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIyIiBoZWlnaHQ9IjIiIGZpbGw9IiNmZmZmZmYxMCIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')]"></div>
                    <h2 className="text-3xl font-extrabold text-white text-center relative z-10 drop-shadow-md">
                        Join Room
                    </h2>

                    {/* Decorative elements */}
                    {/* <div className="absolute -bottom-5 left-10 w-10 h-10 bg-blue-400 rounded-full opacity-30"></div>
                    <div className="absolute -top-3 right-10 w-6 h-6 bg-yellow-300 rounded-full opacity-20"></div> */}
                </div>

                <div className="p-8 space-y-6">
                    <form onSubmit={handleJoinRoom} className="space-y-5">
                        {/* Player Name */}
                        <div className="space-y-2">
                            <label className=" text-sm font-semibold text-gray-700 mb-1.5 flex items-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-2 text-orange-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                                Player Name
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    disabled
                                    className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-xl border border-gray-200
                                    focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
                                    disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
                                    shadow-sm transition-all duration-200"
                                    placeholder="Your username"
                                />
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Room ID */}
                        <div className="space-y-2">
                            <label className=" text-sm font-semibold text-gray-700 mb-1.5 flex items-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-2 text-orange-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                    />
                                </svg>
                                Room ID
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="roomId"
                                    value={formData.roomId}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-xl border border-gray-200
                                    focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
                                    shadow-sm transition-all duration-200"
                                    placeholder="Enter Room ID"
                                />
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Private Room Toggle */}
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl border border-gray-100">
                            <span className="text-sm font-semibold text-gray-700 flex items-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-2 text-orange-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    />
                                </svg>
                                Private Room
                            </span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isPrivateRoom}
                                    onChange={handleTogglePrivate}
                                    className="sr-only peer"
                                />
                                <div
                                    className="w-12 h-6 bg-gray-200 peer-focus:outline-none 
                                    rounded-full peer peer-checked:after:translate-x-full 
                                    peer-checked:after:border-white after:content-[''] 
                                    after:absolute after:top-[2px] after:left-[2px] 
                                    after:bg-white after:border-gray-300 after:border 
                                    after:rounded-full after:h-5 after:w-5 after:transition-all 
                                    peer-checked:bg-gradient-to-r peer-checked:from-orange-400 peer-checked:to-pink-500
                                    after:shadow-md transition-all duration-300"
                                ></div>
                            </label>
                        </div>

                        {/* Password Field (if private) */}
                        {isPrivateRoom && (
                            <div className="space-y-2 animate-fadeIn">
                                <label className=" text-sm font-semibold text-gray-700 mb-1.5 flex items-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 mr-2 text-orange-500"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                                        />
                                    </svg>
                                    Room Password
                                </label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-xl border border-gray-200
                                        focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
                                        shadow-sm transition-all duration-200"
                                        placeholder="Enter room password"
                                    />
                                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 text-gray-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Join Room Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-6 py-3.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl 
                            hover:from-orange-600 hover:to-pink-700 transform hover:translate-y-[-2px]
                            focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
                            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                            transition-all duration-300 shadow-lg shadow-orange-500/20"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    <span className="font-medium">Joining...</span>
                                </div>
                            ) : (
                                <span className="flex items-center justify-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 mr-2"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Join Room
                                </span>
                            )}
                        </button>
                    </form>

                    {/* Decorative element */}
                    <div className="w-full flex justify-center pt-2">
                        <div className="h-1 w-16 bg-gradient-to-r from-orange-300 to-pink-300 rounded-full opacity-50"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
