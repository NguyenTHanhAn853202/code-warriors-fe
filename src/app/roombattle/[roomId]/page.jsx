'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import io from 'socket.io-client';

// Khởi tạo socket
let socket;
const API_URL = 'http://localhost:8080/api/v1/room';

export default function RoomDetail({ params }) {
    const router = useRouter();
    const [roomId, setRoomId] = useState('');

    // Cập nhật roomId khi params thay đổi
    useEffect(() => {
        if (params && params.roomId) {
            setRoomId(params.roomId);
        }
    }, [params]);

    const [username, setUsername] = useState('');
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const [password, setPassword] = useState('');
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [notification, setNotification] = useState(null);
    const [isConnected, setIsConnected] = useState(false); // Thêm state để theo dõi trạng thái kết nối

    // Khởi tạo socket và lấy username
    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
        } else {
            router.push('/');
            return;
        }

        if (!socket) {
            console.log('Initializing socket connection');
            socket = io('http://localhost:8080');

            // Thêm event listeners cho kết nối socket
            socket.on('connect', () => {
                console.log('Socket connected, ID:', socket.id);
                setIsConnected(true);
            });

            socket.on('disconnect', () => {
                console.log('Socket disconnected');
                setIsConnected(false);
            });

            socket.on('connect_error', (err) => {
                console.error('Socket connection error:', err);
                setError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
            });
        }
    }, [router]);

    // Hiển thị thông báo
    const showNotification = useCallback((message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    }, []);

    // Lấy thông tin phòng
    const fetchRoomData = useCallback(async () => {
        if (!roomId) return;

        try {
            setLoading(true);
            console.log('Fetching room data for roomId:', roomId);
            const response = await axios.get(`${API_URL}/roomId/${roomId}`);
            const roomData = response.data.data;
            console.log('Room data received:', roomData);

            setRoom(roomData);

            // Kiểm tra chủ phòng
            const owner = roomData.createdBy || (roomData.players.length > 0 ? roomData.players[0] : null);
            setIsOwner(username === owner);

            // Xử lý tham gia phòng
            if (roomData.isPrivate && !roomData.players.includes(username)) {
                setShowPasswordForm(true);
            } else if (!roomData.players.includes(username)) {
                joinRoom();
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching room:', error);
            setError('Không thể tải thông tin phòng');
            setLoading(false);
        }
    }, [roomId, username]);

    // Tham gia phòng
    const joinRoom = useCallback(
        async (e) => {
            if (e) e.preventDefault();

            try {
                setLoading(true);

                const payload = { roomId, username };
                if (room?.isPrivate && showPasswordForm) {
                    payload.password = password;
                }

                console.log('Joining room with payload:', payload);
                await axios.post(`${API_URL}/join`, payload);
                socket.emit('join-room', payload);

                setShowPasswordForm(false);
                showNotification('Đã tham gia phòng thành công!');
                fetchRoomData();
            } catch (error) {
                console.error('Error joining room:', error);
                setError(error.response?.data?.message || 'Không thể tham gia phòng');
            } finally {
                setLoading(false);
            }
        },
        [roomId, username, room, showPasswordForm, password, showNotification, fetchRoomData],
    );

    // Rời phòng
    const leaveRoom = useCallback(async () => {
        try {
            setLoading(true);

            console.log('Leaving room with data:', { roomId, username });

            // Đảm bảo cả roomId và username đều có giá trị
            if (!roomId || !username) {
                setError('RoomId và username là bắt buộc');
                setLoading(false);
                return;
            }

            // Gọi API để rời phòng
            const response = await axios.post(`${API_URL}/leave`, { roomId, username });
            console.log('Leave room response:', response.data);

            // Emit sự kiện rời phòng qua socket
            socket.emit('leave-room');

            showNotification('Đã rời phòng thành công');
            router.push('/home');
        } catch (error) {
            console.error('Error leaving room:', error);
            if (error.response) {
                console.error('Server response:', error.response.data);
            }
            setError(error.response?.data?.message || 'Có lỗi xảy ra khi rời phòng');
        } finally {
            setLoading(false);
        }
    }, [roomId, username, router, showNotification]);

    // Bắt đầu trận đấu
    const startBattle = useCallback(async () => {
        try {
            setLoading(true);
            await axios.post(`${API_URL}/start`, { roomId, username });
            socket.emit('start-game', { roomId, username });
            showNotification('Trận đấu đã bắt đầu!');
        } catch (error) {
            console.error('Error starting battle:', error);
            setError(error.response?.data?.message || 'Không thể bắt đầu trận đấu');
        } finally {
            setLoading(false);
        }
    }, [roomId, username, showNotification]);

    // Sao chép ID phòng
    const copyRoomId = useCallback(() => {
        navigator.clipboard
            .writeText(roomId)
            .then(() => showNotification('Đã sao chép ID phòng'))
            .catch(() => setError('Không thể sao chép ID phòng'));
    }, [roomId, showNotification, setError]);

    // Xử lý sự kiện socket
    useEffect(() => {
        if (!socket || !roomId || !username) return;

        console.log('Setting up socket listeners for room:', roomId, 'username:', username);

        // Tham gia phòng qua socket
        socket.emit('join-room', { roomId, username });

        // Lắng nghe cập nhật phòng
        const handleRoomUpdated = (updatedRoom) => {
            console.log('Room updated:', updatedRoom);
            console.log('Players in room:', updatedRoom.players);
            setRoom(updatedRoom);
            const owner = updatedRoom.createdBy || (updatedRoom.players.length > 0 ? updatedRoom.players[0] : null);
            setIsOwner(username === owner);
        };

        // Người chơi mới tham gia
        const handlePlayerJoined = ({ username: joinedUser, room: updatedRoom }) => {
            console.log('Player joined:', joinedUser, 'Current players:', updatedRoom.players);
            setRoom(updatedRoom);
            showNotification(`${joinedUser} đã tham gia phòng`);
        };

        // Người chơi rời phòng
        const handlePlayerLeft = ({ username: leftUser, room: updatedRoom }) => {
            console.log('Player left:', leftUser, 'Remaining players:', updatedRoom.players);
            setRoom(updatedRoom);
            showNotification(`${leftUser} đã rời phòng`);
            const owner = updatedRoom.createdBy || (updatedRoom.players.length > 0 ? updatedRoom.players[0] : null);
            setIsOwner(username === owner);
        };

        // Trận đấu bắt đầu
        const handleGameStarted = (updatedRoom) => {
            console.log('Game started');
            setRoom(updatedRoom);
            showNotification('Trận đấu đã bắt đầu!');
        };

        // Xử lý lỗi
        const handleError = (errorMessage) => {
            console.error('Socket error:', errorMessage);
            setError(errorMessage);
        };

        // Đăng ký các event handler
        socket.on('room-updated', handleRoomUpdated);
        socket.on('player-joined', handlePlayerJoined);
        socket.on('player-left', handlePlayerLeft);
        socket.on('game-started', handleGameStarted);
        socket.on('error', handleError);

        // Fetch dữ liệu phòng khi component mount
        fetchRoomData();

        // Thiết lập interval để refresh phòng định kỳ (backup cho real-time)
        const refreshInterval = setInterval(() => {
            console.log('Auto refreshing room data');
            fetchRoomData();
        }, 5000); // Refresh mỗi 10 giây

        // Cleanup
        return () => {
            console.log('Cleaning up socket listeners');
            clearInterval(refreshInterval);
            socket.off('room-updated', handleRoomUpdated);
            socket.off('player-joined', handlePlayerJoined);
            socket.off('player-left', handlePlayerLeft);
            socket.off('game-started', handleGameStarted);
            socket.off('error', handleError);
        };
    }, [roomId, username, fetchRoomData, showNotification]);

    // Form nhập mật khẩu cho phòng riêng tư
    if (showPasswordForm) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                {renderConnectionStatus()}
                <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                    <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Nhập mật khẩu phòng</h1>

                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                            {error}
                        </div>
                    )}

                    <form onSubmit={joinRoom} className="space-y-6">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Mật khẩu phòng:</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Nhập mật khẩu phòng"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                            />
                        </div>

                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Đang xử lý...' : 'Tham gia phòng'}
                            </button>

                            <button
                                type="button"
                                onClick={() => router.push('/')}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                            >
                                Quay lại
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // Hiển thị trạng thái loading
    if (loading && !room) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-lg text-gray-700">Đang tải thông tin phòng...</p>
                </div>
            </div>
        );
    }

    // Hiển thị lỗi
    if (error && !room) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
                    <div className="text-red-500 text-center mb-6">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 mx-auto"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <h2 className="text-xl font-bold mt-2">Đã xảy ra lỗi</h2>
                        <p className="text-gray-700 mt-2">{error}</p>
                    </div>

                    <div className="flex space-x-4 justify-center">
                        <button
                            onClick={fetchRoomData}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                            Thử lại
                        </button>

                        <button
                            onClick={() => router.push('/')}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                            Quay lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Nếu không có dữ liệu phòng
    if (!room) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            {/* Thông báo */}
            {notification && (
                <div className="fixed top-4 right-4 z-50 bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded shadow-lg max-w-sm">
                    {notification}
                </div>
            )}

            <div className="max-w-4xl mx-auto">
                {/* Header phòng */}
                <div className="bg-white rounded-t-lg shadow-md p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                                Phòng: {room.roomId.substring(0, 8)}...
                                <button
                                    onClick={copyRoomId}
                                    className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                    title="Sao chép ID phòng"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                        />
                                    </svg>
                                </button>
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Chủ phòng: <span className="font-medium">{room.createdBy}</span>
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {room.isPrivate && (
                                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                                    Phòng riêng tư
                                </span>
                            )}
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-medium text-white
                ${
                    room.status === 'waiting'
                        ? 'bg-yellow-500'
                        : room.status === 'ongoing'
                          ? 'bg-green-600'
                          : 'bg-gray-600'
                }`}
                            >
                                {room.status === 'waiting'
                                    ? 'Đang chờ'
                                    : room.status === 'ongoing'
                                      ? 'Đang diễn ra'
                                      : 'Đã kết thúc'}
                            </span>
                            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                                {room.players.length}/{room.maxPlayers} người chơi
                            </span>
                        </div>
                    </div>
                </div>

                {/* Danh sách người chơi */}
                <div className="bg-white rounded-b-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Danh sách người chơi</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        {/* Hiển thị người chơi */}
                        {room.players.map((player, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-lg flex items-center ${
                                    player === username ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                                }`}
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold mr-3">
                                    {player.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">{player}</p>
                                    <div className="flex gap-1 mt-1">
                                        {/* Chủ phòng */}
                                        {((room.createdBy && room.createdBy === player) ||
                                            (!room.createdBy && index === 0)) && (
                                            <span className="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded">
                                                Chủ phòng
                                            </span>
                                        )}
                                        {/* Người chơi hiện tại */}
                                        {player === username && (
                                            <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded">
                                                Bạn
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Hiển thị vị trí trống */}
                        {Array(room.maxPlayers - room.players.length)
                            .fill(0)
                            .map((_, index) => (
                                <div
                                    key={`empty-${index}`}
                                    className="p-4 rounded-lg bg-gray-50 border border-gray-200 flex items-center opacity-60"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold mr-3">
                                        ?
                                    </div>
                                    <p className="text-gray-500">Đang chờ người chơi...</p>
                                </div>
                            ))}
                    </div>

                    {/* Các nút chức năng */}
                    <div className="flex flex-wrap justify-center gap-3">
                        {/* Nút bắt đầu trận đấu (chỉ chủ phòng) */}
                        {isOwner && room.status === 'waiting' && room.players.length >= 2 && (
                            <button
                                onClick={startBattle}
                                disabled={loading}
                                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Đang xử lý...' : 'Bắt đầu trận đấu'}
                            </button>
                        )}

                        {/* Nút rời phòng */}
                        {room.status === 'waiting' && (
                            <button
                                onClick={leaveRoom}
                                disabled={loading}
                                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Đang xử lý...' : 'Rời phòng'}
                            </button>
                        )}

                        {/* Nút vào trận đấu */}
                        {room.status === 'ongoing' && (
                            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                                Vào trận đấu
                            </button>
                        )}

                        {/* Nút quay lại */}
                        <button
                            onClick={() => router.push('/')}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                            Quay lại
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
