'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function BattlePage() {
    const [rooms, setRooms] = useState([]);
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');
    const [joinedRoom, setJoinedRoom] = useState(null);

    useEffect(() => {
        axios
            .get('http://localhost:8080/api/v1/room/rooms')
            .then((response) => {
                console.log("Tất cả các loại thuật toán:", response.data);
                setRooms(response.data.data);
            })
            .catch((error) => {
                console.error('Error fetching algorithm types:', error);
            });
    }, []);

    // Tạo phòng
    const createRoom = async () => {
        if (!username.trim()) return alert('Nhập tên!');
        const res = await axios.post('http://localhost:8080/api/v1/room/create', {
            username,
        });
        setJoinedRoom(res.data.roomId);
        alert(`Phòng tạo thành công! Mã phòng: ${res.data.roomId}`);
    };

    // Tham gia phòng
    const joinRoom = async () => {
        if (!username.trim() || !roomId.trim()) return alert('Nhập đủ thông tin!');
        const res = await axios.post('http://localhost:8080/api/v1/room/join', {
            roomId,
            username,
        });
        setJoinedRoom(res.data.roomId);
        alert('Tham gia phòng thành công!');
    };

    // Bắt đầu trận đấu
    const startBattle = async () => {
        if (!joinedRoom) return alert('Bạn chưa ở trong phòng!');
        await axios.post('http://localhost:8080/api/room/start', { roomId });
        alert('Trận đấu bắt đầu!');
    };

    return (
        <div className="flex flex-col items-center p-4">
            <h1 className="text-xl font-bold">Hệ thống phòng đấu</h1>

            <input
                type="text"
                placeholder="Tên của bạn"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border p-2 m-2"
            />

            <button onClick={createRoom} className="bg-blue-500 text-white px-4 py-2 rounded">
                Tạo phòng
            </button>

            <input
                type="text"
                placeholder="Nhập mã phòng"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="border p-2 m-2"
            />

            <button onClick={joinRoom} className="bg-green-500 text-white px-4 py-2 rounded">
                Tham gia phòng
            </button>

            {joinedRoom && (
                <button onClick={startBattle} className="bg-red-500 text-white px-4 py-2 rounded">
                    Bắt đầu trận đấu
                </button>
            )}

            <h2 className="mt-4 text-lg font-bold">Danh sách phòng</h2>
            <ul>
                {(Array.isArray(rooms) ? rooms : []).map((room) => (
                    <li key={room.roomId} className="border p-2 m-2">
                        {room.roomId} - {room.status}
                    </li>
                ))}
            </ul>
        </div>
    );
}
