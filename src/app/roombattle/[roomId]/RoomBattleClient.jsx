'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import axios from 'axios';
import dynamic from 'next/dynamic';

const API_URL = 'http://localhost:8080/api/v1';
const SOCKET_URL = 'http://localhost:8080';

// Dynamic import to disable SSR for this component
const RoomBattleUI = dynamic(() => import('@/components/roombattle/RoomBattleUI'), {
    ssr: false,
});

export default function RoomBattleClient({ roomId }) {
    const router = useRouter();
    const [socket, setSocket] = useState(null);
    const [room, setRoom] = useState(null);
    const [players, setPlayers] = useState([]);
    const [username, setUsername] = useState('');
    const [gameStatus, setGameStatus] = useState('waiting');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [isClient, setIsClient] = useState(false); // Ensure client-side execution

    // Runs only on client-side
    useEffect(() => {
        setIsClient(true); // Mark as client-side

        const storedUsername = localStorage.getItem('username');
        const storedRoomId = localStorage.getItem('roomId');

        if (!storedUsername || !storedRoomId) {
            setError('Missing player information or room ID');
            setLoading(false);
            console.error('Missing player information or room ID');
            return;
        }

        setUsername(storedUsername);

        const newSocket = io(SOCKET_URL, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        setSocket(newSocket);

        const fetchRoomData = async () => {
            try {
                const response = await axios.get(`${API_URL}/rooms/${roomId}`);
                const roomData = response.data; // Assuming server returns room data
                setRoom(roomData.room);
                setPlayers(roomData.players);
                setGameStatus(roomData.status);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch room data');
                setLoading(false);
            }
        };

        fetchRoomData();

        const socketHandlers = {
            connect: () => {
                console.log('Socket connected');
                newSocket.emit('join_room', { roomId, username: storedUsername });
            },
            room_joined: (roomData) => {
                console.log('Room joined:', roomData);
                setRoom(roomData);
                setPlayers([...(roomData.players || [])]);
                setGameStatus(roomData.status);
                setLoading(false);
            },
            room_updated: (updatedRoom) => {
                console.log('Room updated:', updatedRoom);
                setRoom(updatedRoom);
                setPlayers([...(updatedRoom.players || [])]);
                setGameStatus(updatedRoom.status);
            },
            player_joined: ({ room: updatedRoom, username }) => {
                console.log('Player joined:', updatedRoom);
                setRoom(updatedRoom);
                setPlayers(updatedRoom.players || []);
            },
            player_left: ({ room: updatedRoom }) => {
                console.log('Player left:', updatedRoom);
                setRoom(updatedRoom);
                setPlayers(updatedRoom.players || []);
            },
            battle_started: (battleRoom) => {
                console.log('Battle started:', battleRoom);
                setGameStatus('ongoing');
                setRoom(battleRoom);
                router.push(`/battleOngoing/${storedRoomId}`);
            },
            battle_ended: (endedRoom) => {
                console.log('Battle ended:', endedRoom);
                setGameStatus('finished');
                setRoom(endedRoom);
            },
            room_join_error: (err) => {
                console.error('Room join error:', err);
                setError(err.message);
                setLoading(false);
            },
            error: (err) => {
                console.error('Socket error:', err);
                setError(err.message);
            },
            room_deleted: (deletedRoomId) => {
                if (deletedRoomId === roomId) {
                    console.log('Room deleted, redirecting...');
                    setError('Room has been deleted');
                    router.push('/create-room');
                }
            },
        };

        Object.entries(socketHandlers).forEach(([event, handler]) => {
            newSocket.on(event, handler);
        });

        return () => {
            if (socket) {
                Object.keys(socketHandlers).forEach((event) => {
                    socket.off(event); // dùng socket thay vì newSocket
                });
                if (roomId && username) {
                    socket.emit('leave_room', { roomId, username });
                }
                socket.disconnect();
            }
        };
    }, [roomId, router]);

    const handleStartBattle = () => {
        if (!socket || !room) return;
        if (room.createdBy === username) {
            socket.emit('start_battle', { roomId, username });
        } else {
            setError('Only room creator can start the battle');
        }
    };

    const handleLeaveRoom = async () => {
        if (isRedirecting) return;
        setIsRedirecting(true);

        try {
            if (socket) {
                socket.emit('leave_room', { roomId, username });
            }
            await axios.delete(`${API_URL}/rooms/${roomId}/leave`, {
                data: { username },
            });
            router.push('/roombattle');
        } catch (error) {
            setError('Trận đấu đang diễn ra');
            setIsRedirecting(false);
        }
    };

    if (loading || !isClient) {
        return (
            <div className="flex flex-col justify-center items-center h-screen">
                <p className="text-xl mb-4">Đang tải phòng...</p>
                <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <RoomBattleUI
            roomId={roomId}
            room={room}
            players={players}
            gameStatus={gameStatus}
            username={username}
            error={error}
            handleStartBattle={handleStartBattle}
            handleLeaveRoom={handleLeaveRoom}
        />
    );
}
