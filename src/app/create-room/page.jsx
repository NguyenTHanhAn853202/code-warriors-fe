'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1/room';

export default function CreateJoinRoom() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [maxPlayers, setMaxPlayers] = useState(4);
    const [isPrivate, setIsPrivate] = useState(false);
    const [password, setPassword] = useState('');
    const [joinRoomId, setJoinRoomId] = useState('');
    const [joinPassword, setJoinPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Lấy username từ localStorage
    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);

    // Lưu username vào localStorage
    const saveUsername = (name) => {
        localStorage.setItem('username', name);
    };

    // Tạo phòng mới
    const handleCreateRoom = async (e) => {
        e.preventDefault();

        if (!username) {
            setError('Vui lòng nhập tên người dùng');
            return;
        }

        if (isPrivate && !password) {
            setError('Phòng riêng tư cần có mật khẩu');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Lưu username
            saveUsername(username);

            const response = await axios.post(`${API_URL}/create`, {
                username,
                maxPlayers,
                isPrivate,
                password: isPrivate ? password : undefined,
            });

            const { roomId } = response.data.data;
            router.push(`/roombattle/${roomId}`);
        } catch (error) {
            console.error('Error creating room:', error);
            setError(error.response?.data?.message || 'Không thể tạo phòng');
        } finally {
            setLoading(false);
        }
    };

    // Tham gia phòng
    const handleJoinRoom = async (e) => {
        e.preventDefault();

        if (!username) {
            setError('Vui lòng nhập tên người dùng');
            return;
        }

        if (!joinRoomId) {
            setError('Vui lòng nhập ID phòng');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Lưu username
            saveUsername(username);

            // Kiểm tra phòng có tồn tại không
            await axios.get(`${API_URL}/roomId/${joinRoomId}`);

            // Chuyển đến trang phòng
            router.push(`/roombattle/${joinRoomId}`);
        } catch (error) {
            console.error('Error joining room:', error);
            setError(error.response?.data?.message || 'Không thể tham gia phòng');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '20px', textAlign: 'center' }}>Phòng Đấu</h1>

            {error && (
                <div
                    style={{
                        backgroundColor: '#FFEBEE',
                        color: '#C62828',
                        padding: '10px',
                        borderRadius: '4px',
                        marginBottom: '20px',
                    }}
                >
                    {error}
                </div>
            )}

            <div
                style={{
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    padding: '20px',
                    marginBottom: '20px',
                }}
            >
                <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>Tạo phòng mới</h2>

                <form onSubmit={handleCreateRoom}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Tên người dùng:</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                            }}
                            placeholder="Nhập tên của bạn"
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Số người chơi tối đa:</label>
                        <select
                            value={maxPlayers}
                            onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                            }}
                        >
                            <option value={2}>2 người chơi</option>
                            <option value={3}>3 người chơi</option>
                            <option value={4}>4 người chơi</option>
                            <option value={5}>5 người chơi</option>
                            <option value={6}>6 người chơi</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                                type="checkbox"
                                checked={isPrivate}
                                onChange={(e) => setIsPrivate(e.target.checked)}
                                style={{ marginRight: '8px' }}
                            />
                            Phòng riêng tư (cần mật khẩu)
                        </label>
                    </div>

                    {isPrivate && (
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Mật khẩu phòng:</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                }}
                                placeholder="Nhập mật khẩu phòng"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            backgroundColor: '#2196F3',
                            color: 'white',
                            padding: '10px 15px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                        }}
                    >
                        {loading ? 'Đang tạo...' : 'Tạo phòng'}
                    </button>
                </form>
            </div>

            <div
                style={{
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    padding: '20px',
                }}
            >
                <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>Tham gia phòng</h2>

                <form onSubmit={handleJoinRoom}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Tên người dùng:</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                            }}
                            placeholder="Nhập tên của bạn"
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>ID Phòng:</label>
                        <input
                            type="text"
                            value={joinRoomId}
                            onChange={(e) => setJoinRoomId(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                            }}
                            placeholder="Nhập ID phòng cần tham gia"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            padding: '10px 15px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                        }}
                    >
                        {loading ? 'Đang xử lý...' : 'Tham gia phòng'}
                    </button>
                </form>
            </div>
        </div>
    );
}
