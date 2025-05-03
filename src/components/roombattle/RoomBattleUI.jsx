import { useEffect } from 'react';
import GameStatus from './GameStatus';
import ErrorDisplay from './ErrorDisplay';
import LeaveRoomButton from './LeaveRoomButton';
import RoomInfo from './RoomInfor';

export default function RoomBattleUI({
    roomId,
    room,
    players = [],
    gameStatus,
    username,
    error,
    handleStartBattle,
    handleLeaveRoom,
}) {
    useEffect(() => {
        console.log('RoomBattleUI rendering players:', players);
    }, [players]);

    useEffect(() => {
        if (room && room.status === 'ongoing' && typeof window !== 'undefined') {
            const battleRoomId = room.roomId || roomId;
            window.open(`/battleOngoing/${battleRoomId}`, '_blank');
        }
    }, [room?.status, roomId]);

    return (
        <div className="bg-gradient-to-br from-indigo-900 to-purple-800 rounded-lg shadow-xl p-6 max-w-4xl mx-auto text-white">
            {room && room.roomId ? (
                <RoomInfo roomData={room} />
            ) : (
                <div className="flex justify-center items-center p-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
                    <p className="ml-3 text-gray-300">Đang tải thông tin phòng...</p>
                </div>
            )}

            <GameStatus
                gameStatus={gameStatus}
                username={username}
                players={players}
                room={room}
                handleStartBattle={handleStartBattle}
            />
            <ErrorDisplay error={error} />
            <LeaveRoomButton handleLeaveRoom={handleLeaveRoom} />
        </div>
    );
}
