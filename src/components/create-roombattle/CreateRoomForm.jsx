'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const API_URL = 'http://localhost:8080/api/v1';

export default function CreateRoomForm({ onError, loading, setLoading }) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        maxPlayers: 2,
        isPrivate: false,
        password: '',
        roomId: '',
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await axios.get(`${API_URL}/user/info`, { withCredentials: true });
                const username = res.data.data.username;
                setFormData((prev) => ({ ...prev, username: username }));
            } catch (err) {
                console.error('Error fetching user info:', err);
                onError('Unable to fetch user information');
            }
        };
        fetchUserData();
    }, [onError]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        onError(null);
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/rooms`, {
                username: formData.username,
                maxPlayers: parseInt(formData.maxPlayers),
                isPrivate: formData.isPrivate,
                password: formData.isPrivate ? formData.password : undefined,
            });
            const roomId = res.data.data.roomId;

            localStorage.setItem('username', formData.username);
            localStorage.setItem('roomId', roomId);

            router.push(`/roombattle/${roomId}`);
        } catch (err) {
            console.error('Room creation error:', err);
            onError(err.response?.data?.message || 'Failed to create room');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center p-4 rounded-md">
            <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-purple-100 transform hover:scale-[1.01] transition-all duration-300 overflow-hidden">
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-orange-500 to-red-400 p-6 relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSgzMCkiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIyIiBoZWlnaHQ9IjIiIGZpbGw9IiNmZmZmZmYxMCIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')]"></div>
                    <h2 className="text-3xl font-extrabold text-white text-center relative z-10 drop-shadow-md">
                        Create Room
                    </h2>

                    {/* Decorative elements */}
                    {/* <div className="absolute -bottom-5 right-10 w-10 h-10 bg-yellow-300 rounded-full opacity-30"></div> */}
                    {/* <div className="absolute -top-3 left-10 w-6 h-6 bg-blue-400 rounded-full opacity-20"></div> */}
                </div>

                <div className="p-8 space-y-6">
                    <form onSubmit={handleCreateRoom} className="space-y-5">
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
                                    onChange={handleInputChange}
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

                        {/* Number of Players */}
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
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                                Number of Players
                            </label>
                            <div className="relative">
                                <select
                                    name="maxPlayers"
                                    value={formData.maxPlayers}
                                    onChange={handleInputChange}
                                    className="w-full appearance-none px-4 py-3 bg-gray-50 text-gray-800 rounded-xl border border-gray-200
                                    focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
                                    shadow-sm transition-all duration-200 pr-10"
                                >
                                    <option value="2">2 players</option>
                                    <option value="3">3 players</option>
                                    <option value="4">4 players</option>
                                </select>
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 text-gray-500"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
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
                                    name="isPrivate"
                                    checked={formData.isPrivate}
                                    onChange={handleInputChange}
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
                        {formData.isPrivate && (
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
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-xl border border-gray-200
                                        focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
                                        shadow-sm transition-all duration-200"
                                        placeholder="Enter password"
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

                        {/* Create Room Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-6 py-3.5 bg-gradient-to-r from-orange-500 to-red-400 text-white font-semibold rounded-xl 
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
                                    <span className="font-medium">Creating...</span>
                                </div>
                            ) : (
                                <>
                                    {/* <span className="flex items-center justify-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        Create Room
                                    </span> */}
                                    <span className="flex items-center justify-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 mr-2"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        Create Room
                                    </span>
                                </>
                            )}
                        </button>

                        {/* Decorative element */}
                        <div className="w-full flex justify-center pt-2">
                            <div className="h-1 w-16 bg-gradient-to-r from-orange-300 to-pink-300 rounded-full opacity-50"></div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
