'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useRouter } from 'next/navigation';

// Tạo một kết nối socket duy nhất
let socket;

const RoomBattle = ({ roomId }) => {
    const router = useRouter();
    const [roomData, setRoomData] = useState(null);
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const [notifications, setNotifications] = useState([]);

    // Khởi tạo socket connection
    useEffect(() => {
        if (!socket) {
            socket = io('http://localhost:8080');
        }
        
        return () => {
            // Không đóng socket khi unmount component vì có thể dùng lại
        };
    }, []);

    // Lấy username từ localStorage
    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
        } else {
            router.push('/create-room');
        }
    }, [router]);

    // Hàm thêm thông báo
    const addNotification = (message, type = 'info') => {
        const id = Date.now();
        setNotifications((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setNotifications((prev) => prev.filter((item) => item.id !== id));
        }, 5000);
    };

    // Lấy dữ liệu phòng
    const fetchRoomData = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`http://localhost:8080/api/v1/room/roomId/${roomId}`);
            const data = response.data.data;
            
            setRoomData(data);
            
            // Kiểm tra chủ phòng
            const roomOwner = data.createdBy || (data.players.length > 0 ? data.players[0] : null);
            setIsOwner(username === roomOwner);
            
            // Kiểm tra nếu người dùng chưa trong phòng
            if (username && !data.players.includes(username)) {
                joinRoom();
            }
        } catch (error) {
            console.error('Error fetching room:', error);
            setError('Không thể tải dữ liệu phòng. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    // Tham gia phòng
    const joinRoom = async () => {
        try {
            await axios.post('http://localhost:8080/api/v1/room/join', {
                roomId,
                username
            });
            
            // Thông báo qua socket
            socket.emit('join-room', { roomId, username });
            
            addNotification('Tham gia phòng thành công', 'success');
            fetchRoomData();
        } catch (error) {
            console.error('Error joining room:', error);
            if (error.response?.status === 401) {
                router.push(`/join-room/${roomId}`);
            } else {
                addNotification('Không thể tham gia phòng', 'error');
            }
        }
    };

    // Rời phòng
    const handleLeaveRoom = async () => {
        try {
            await axios.post('http://localhost:8080/api/v1/room/leave', {
                roomId,
                username
            });
            
            socket.emit('leave-room', { roomId, username });
            
            addNotification('Đã rời phòng thành công', 'success');
            router.push('/create-room');
        } catch (error) {
            console.error('Error leaving room:', error);
            addNotification('Có lỗi xảy ra khi rời phòng', 'error');
        }
    };

    // Bắt đầu trận đấu
    const handleStartGame = async () => {
        try {
            await axios.post('http://localhost:8080/api/v1/room/start', {
                roomId,
                username
            });
            
            socket.emit('start-game', { roomId, username });
            
            addNotification('Trận đấu đã bắt đầu!', 'success');
        } catch (error) {
            console.error('Error starting game:', error);
            addNotification('Có lỗi xảy ra khi bắt đầu trận đấu', 'error');
        }
    };

    // Copy ID phòng
    const copyRoomId = () => {
        navigator.clipboard.writeText(roomId)
            .then(() => addNotification('Đã sao chép ID phòng', 'success'))
            .catch(() => addNotification('Không thể sao chép ID phòng', 'error'));
    };

    // Lắng nghe sự kiện socket và fetch dữ liệu ban đầu
    useEffect(() => {
        if (username && roomId) {
            // Fetch dữ liệu ban đầu
            fetchRoomData();
            
            // Tham gia phòng qua socket
            socket.emit('join-room', { roomId, username });
            
            // Lắng nghe cập nhật phòng
            socket.on('room-updated', (updatedRoom) => {
                setRoomData(updatedRoom);
                const roomOwner = updatedRoom.createdBy || (updatedRoom.players.length > 0 ? updatedRoom.players[0] : null);
                setIsOwner(username === roomOwner);
            });
            
            // Lắng nghe người rời phòng
            socket.on('player-left', ({ username: leftUser, room }) => {
                setRoomData(room);
                addNotification(`${leftUser} đã rời phòng`, 'warning');
                const roomOwner = room.createdBy || (room.players.length > 0 ? room.players[0] : null);
                setIsOwner(username === roomOwner);
            });
            
            // Lắng nghe người tham gia
            socket.on('player-joined', ({ username: joinedUser, room }) => {
                setRoomData(room);
                addNotification(`${joinedUser} đã tham gia phòng`, 'success');
            });
            
            // Lắng nghe bắt đầu trận đấu
            socket.on('game-started', (room) => {
                setRoomData(room);
                addNotification('Trận đấu đã bắt đầu!', 'success');
                router.push(`/game/${roomId}`);
            });
            
            // Lắng nghe lỗi
            socket.on('error', (errorMessage) => {
                setError(errorMessage);
                addNotification(errorMessage, 'error');
            });
        }
        
        return () => {
            // Hủy đăng ký các event
            socket.off('room-updated');
            socket.off('player-left');
            socket.off('player-joined');
            socket.off('game-started');
            socket.off('error');
        };
    }, [roomId, username, router]);

    // UI loading
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-lg text-gray-600">Đang tải dữ liệu phòng...</p>
                    <button
                        onClick={fetchRoomData}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    // UI lỗi
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    <strong className="font-bold">Lỗi! </strong>
                    <span className="block sm:inline">{error}</span>
                    <div className="mt-4 flex space-x-4">
                        <button
                            onClick={fetchRoomData}
                            className="px-4 py-2 bg-blue-500 text-white rounded"
                        >
                            Thử lại
                        </button>
                        <button
                            onClick={() => router.push('/create-room')}
                            className="px-4 py-2 bg-gray-500 text-white rounded"
                        >
                            Quay lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!roomData) {
        return null;
    }

    // UI chính
    return (
        <div className="min-h-screen bg-gray-100 py-8">
            {/* Thông báo */}
            <div className="fixed top-4 right-4 z-50 space-y-2 w-72">
                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className={`p-3 rounded-lg shadow-lg 
                            ${
                                notification.type === 'success'
                                    ? 'bg-green-100 text-green-800 border-l-4 border-green-500'
                                    : notification.type === 'error'
                                      ? 'bg-red-100 text-red-800 border-l-4 border-red-500'
                                      : notification.type === 'warning'
                                        ? 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500'
                                        : 'bg-blue-100 text-blue-800 border-l-4 border-blue-500'
                            }`}
                    >
                        {notification.message}
                    </div>
                ))}
            </div>

            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    {/* Header phòng */}
                    <div className="bg-blue-600 text-white px-6 py-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <h1 className="text-2xl font-bold">Phòng: {roomData.roomId}</h1>
                                <button onClick={copyRoomId} className="ml-2 p-1 bg-blue-700 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </button>
                            </div>
                            <div className="flex items-center space-x-2">
                                {roomData.isPrivate && (
                                    <span className="bg-purple-700 px-3 py-1 rounded-full text-sm">
                                        Phòng riêng tư
                                    </span>
                                )}
                                <span
                                    className={`px-3 py-1 rounded-full text-sm font-semibold
                                    ${
                                        roomData.status === 'waiting' 
                                            ? 'bg-yellow-500' 
                                            : roomData.status === 'ongoing' 
                                                ? 'bg-green-500' 
                                                : 'bg-gray-500'
                                    }`}
                                >
                                    {roomData.status === 'waiting' 
                                        ? 'Đang chờ' 
                                        : roomData.status === 'ongoing' 
                                            ? 'Đang chơi' 
                                            : 'Đã kết thúc'}
                                </span>
                                <span className="bg-blue-800 px-3 py-1 rounded-full text-sm">
                                    {roomData.players.length}/{roomData.maxPlayers} người chơi
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Danh sách người chơi */}
                    <div className="px-6 py-4">
                        <h2 className="text-xl font-semibold mb-4">Danh sách người chơi:</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {roomData.players.map((player, index) => (
                                <div
                                    key={index}
                                    className={`p-3 rounded-lg flex items-center space-x-3
                                    ${player === username ? 'bg-blue-100 border border-blue-300' : 'bg-gray-100'}`}
                                >
                                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                        {player.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium">{player}</p>
                                        <div className="flex space-x-1 mt-1">
                                            {((roomData.createdBy && roomData.createdBy === player) || 
                                              (!roomData.createdBy && index === 0)) && (
                                                <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded">
                                                    Chủ phòng
                                                </span>
                                            )}
                                            {player === username && (
                                                <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                                                    Bạn
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Vị trí trống */}
                            {Array(roomData.maxPlayers - roomData.players.length)
                                .fill(0)
                                .map((_, index) => (
                                    <div
                                        key={`empty-${index}`}
                                        className="p-3 rounded-lg bg-gray-50 border border-gray-300 flex items-center space-x-3"
                                    >
                                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
                                            ?
                                        </div>
                                        <p>Chỗ trống</p>
                                    </div>
                                ))}
                        </div>

                        {/* Nút chức năng */}
                        <div className="flex justify-center space-x-4">
                            {isOwner && roomData.status === 'waiting' && roomData.players.length >= 2 && (
                                <button
                                    onClick={handleStartGame}
                                    className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold"
                                >
                                    Bắt đầu trận đấu
                                </button>
                            )}
                            
                            {roomData.status === 'waiting' && (
                                <button
                                    onClick={handleLeaveRoom}
                                    className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold"
                                >
                                    Rời phòng
                                </button>
                            )}
                            
                            {roomData.status !== 'waiting' && (
                                <button
                                    onClick={() => router.push(`/game/${roomId}`)}
                                    className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold"
                                >
                                    Vào trận đấu
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomBattle;
