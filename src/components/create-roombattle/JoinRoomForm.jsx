'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';

const socket = io('http://localhost:8080');

export default function JoinRoomForm({ onError, loading, setLoading }) {
    const router = useRouter();
    const [formData, setFormData] = useState({ 
        username: '', 
        roomId: '', 
        password: '' 
    });
    const [isPrivateRoom, setIsPrivateRoom] = useState(false);

    socket.on('connect_error', (error) => {
        console.error('Lỗi kết nối:', error);
    });
    
    socket.on('room_joined', (room) => {
        router.push(`/roombattle/${room.roomId}`);
    });

    // Handle room join error
    socket.on('room_join_error', (data) => {
        onError(data.message || 'Không thể tham gia phòng');
        setLoading(false);
    });

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Toggle private room
    const handleTogglePrivate = () => {
        setIsPrivateRoom(!isPrivateRoom);
        if (!isPrivateRoom === false) {
            setFormData(prev => ({ ...prev, password: '' }));
        }
    };

    // Handle room join
    const handleJoinRoom = async (e) => {
        e.preventDefault();
        onError(null); // Reset any previous error messages
        setLoading(true); // Start loading

        // Validation for empty fields
        if (!formData.username || !formData.roomId) {
            onError('Tên người chơi và ID phòng là bắt buộc!');
            setLoading(false);
            return;
        }

        // Store data in localStorage
        localStorage.setItem('username', formData.username);
        localStorage.setItem('roomId', formData.roomId);

        // Emit join room event
        socket.emit('join_room', {
            username: formData.username,
            roomId: formData.roomId,
            password: isPrivateRoom ? formData.password : '',
            isPrivate: isPrivateRoom
        });
    };

    useEffect(() => {
        // Clean up listeners on component unmount
        return () => {
            socket.off('room_joined');
            socket.off('room_join_error');
        };
    }, [onError, setLoading, router]);

    return (
        <div className="bg-gradient-to-r from-indigo-800 to-purple-700 p-8 rounded-xl shadow-2xl max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-white text-center">Tham gia phòng</h2>
            
            <form onSubmit={handleJoinRoom} className="space-y-5">
                <div className="bg-white bg-opacity-10 p-5 rounded-lg backdrop-blur-sm">
                    <label className="block text-white text-sm font-medium mb-2">
                        Tên người chơi
                    </label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-indigo-100 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-indigo-900"
                        placeholder="Nhập tên của bạn"
                        required
                    />
                </div>

                <div className="bg-white bg-opacity-10 p-5 rounded-lg backdrop-blur-sm">
                    <label className="block text-white text-sm font-medium mb-2">
                        ID Phòng
                    </label>
                    <input
                        type="text"
                        name="roomId"
                        value={formData.roomId}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-indigo-100 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-indigo-900"
                        placeholder="Nhập ID phòng"
                        required
                    />
                </div>
                
                <div className="flex items-center mb-2">
                    <input
                        type="checkbox"
                        id="privateRoom"
                        checked={isPrivateRoom}
                        onChange={handleTogglePrivate}
                        className="w-4 h-4 text-indigo-600 border-indigo-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="privateRoom" className="ml-2 text-sm font-medium text-white">
                        Phòng riêng tư (có mật khẩu)
                    </label>
                </div>

                {isPrivateRoom && (
                    <div className="bg-white bg-opacity-10 p-5 rounded-lg backdrop-blur-sm">
                        <label className="block text-white text-sm font-medium mb-2">
                            Mật khẩu phòng
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-indigo-100 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-indigo-900"
                            placeholder="Nhập mật khẩu phòng"
                        />
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg font-bold shadow-lg hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {loading ? (
                        <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Đang tham gia...
                        </div>
                    ) : (
                        'Tham gia phòng'
                    )}
                </button>
            </form>
            
            <div className="mt-6 text-center text-indigo-200 text-sm">
                Chưa có phòng? Bạn có thể tạo phòng mới.
            </div>
        </div>
    );
}