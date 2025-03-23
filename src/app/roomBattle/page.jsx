'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:8080');

export default function BattlePage() {
    const [roomId, setRoomId] = useState(null);
    const [username, setUsername] = useState('');
    const [opponent, setOpponent] = useState(null);
    const [code, setCode] = useState('');
    const [battleStarted, setBattleStarted] = useState(false);

    useEffect(() => {
        socket.on('room-created', (id) => {
            setRoomId(id);
        });

        socket.on('room-joined', (players) => {
            setOpponent(players.find((p) => p !== username));
        });

        socket.on('start-timer', ({ time }) => {
            setBattleStarted(true);
        });

        socket.on('code-submitted', ({ username, code }) => {
            console.log(`Đối thủ ${username} đã gửi code:`, code);
        });

        return () => {
            socket.disconnect();
        };
    }, []);
    const createRoom = () => {
        if (!username.trim()) {
            alert('Vui lòng nhập tên trước khi tạo phòng!');
            return;
        }
        socket.emit('create-room', username);
    };

    // const createRoom = () => {
    //     socket.emit('create-room', username);
    // };

    const joinRoom = () => {
        socket.emit('join-room', { roomId, username });
    };

    const startBattle = () => {
        socket.emit('start-battle', roomId);
    };

    const submitCode = () => {
        socket.emit('submit-code', { roomId, username, code });
    };

    return (
        <div className="flex flex-col items-center p-4">
            <input
                type="text"
                placeholder="Tên của bạn"
                onChange={(e) => setUsername(e.target.value)}
                className="border p-2 m-2"
            />
            <button onClick={createRoom} className="bg-blue-500 text-white px-4 py-2 rounded">
                Tạo phòng
            </button>

            <input
                type="text"
                placeholder="Nhập mã phòng"
                onChange={(e) => setRoomId(e.target.value)}
                className="border p-2 m-2"
            />
            <button onClick={joinRoom} className="bg-green-500 text-white px-4 py-2 rounded">
                Tham gia phòng
            </button>

            {roomId && <p>🔹 Đang ở phòng: {roomId}</p>}
            {opponent && <p>🎯 Đối thủ: {opponent}</p>}

            {roomId && !battleStarted && (
                <button onClick={startBattle} className="bg-red-500 text-white px-4 py-2 rounded">
                    Bắt đầu đấu
                </button>
            )}

            {battleStarted && (
                <div className="mt-4">
                    <textarea
                        placeholder="Nhập code tại đây..."
                        onChange={(e) => setCode(e.target.value)}
                        className="border p-2 w-full h-32"
                    />
                    <button onClick={submitCode} className="bg-purple-500 text-white px-4 py-2 rounded mt-2">
                        Nộp code
                    </button>
                </div>
            )}
        </div>
    );
}
