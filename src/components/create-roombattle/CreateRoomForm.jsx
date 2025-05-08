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
        const fetchUserDate = async () => {
            try {
                const res = await axios.get(`${API_URL}/user/info`, { withCredentials: true });
                console.log('Dữ liệu API:', res);
                const username = res.data.data.username;
                setFormData((pre) => ({ ...pre, username: username }));
            } catch (err) {
                console.error('Lỗi khi lấy thông tin người dùng:', err);
                onError('Không thể lấy thông tin người dùng');
            }
        };
        fetchUserDate();
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

            // Lưu thông tin vào localStorage
            localStorage.setItem('username', formData.username);
            localStorage.setItem('roomId', roomId);

            // Log để kiểm tra giá trị đã lưu
            console.log('Đã lưu vào localStorage:', {
                username: formData.username,
                roomId: roomId,
            });

            console.log('Đang chuyển hướng đến phòng có ID:', roomId);
            router.push(`/roombattle/${roomId}`);
        } catch (err) {
            console.error('Lỗi khi tạo phòng:', err);
            onError(err.response?.data?.message || 'Tạo phòng thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-blue-900 to-indigo-800 p-8 rounded-xl shadow-2xl max-w-md mx-auto border border-blue-700">
            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-white">Create New Room</h2>
                <div className="h-1 w-16 bg-blue-400 mx-auto mt-2 rounded-full"></div>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-5">
                <div className="bg-blue-800 bg-opacity-40 p-5 rounded-lg backdrop-blur-sm border border-blue-600">
                    <label className="block text-blue-200 text-sm font-medium mb-2">Player Name</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-blue-50 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-900"
                        placeholder="Tên người chơi"
                        disabled
                    />
                </div>

                <div className="bg-blue-800 bg-opacity-40 p-5 rounded-lg backdrop-blur-sm border border-blue-600">
                    <label className="block text-blue-200 text-sm font-medium mb-2">Maximum Number of Players</label>
                    <div className="relative">
                        <select
                            name="maxPlayers"
                            value={formData.maxPlayers}
                            onChange={handleInputChange}
                            className="appearance-none w-full px-4 py-3 bg-blue-50 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-900 pr-10"
                        >
                            <option value="2">2 players</option>
                            <option value="3">3 players</option>
                            <option value="4">	4 players</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-blue-700">
                            <svg
                                className="fill-current h-4 w-4"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                            >
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-blue-800 bg-opacity-40 p-5 rounded-lg backdrop-blur-sm border border-blue-600">
                    <label className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input
                                type="checkbox"
                                name="isPrivate"
                                checked={formData.isPrivate}
                                onChange={handleInputChange}
                                className="sr-only"
                            />
                            <div
                                className={`block w-14 h-8 rounded-full ${formData.isPrivate ? 'bg-green-400' : 'bg-gray-400'} transition-colors duration-200`}
                            ></div>
                            <div
                                className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200 transform ${formData.isPrivate ? 'translate-x-6' : ''}`}
                            ></div>
                        </div>
                        <span className="ml-3 text-blue-200 font-medium">Private Room</span>
                    </label>
                </div>

                {formData.isPrivate && (
                    <div className="bg-blue-800 bg-opacity-40 p-5 rounded-lg backdrop-blur-sm border border-blue-600 animate-fadeIn">
                        <label className="block text-blue-200 text-sm font-medium mb-2">Room Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-blue-50 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-900"
                            placeholder="Set room password"
                            required
                        />
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-6 rounded-lg font-bold shadow-lg hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-6"
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
                            Creating Room...
                        </div>
                    ) : (
                        <>
                            <span className="inline-block mr-2">✨</span>
                            Create New Room
                        </>
                    )}
                </button>
            </form>

            <div className="mt-6 text-center text-blue-200 text-sm">Once created, you will become the host</div>
        </div>
    );
}
