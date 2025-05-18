import { useEffect } from 'react';
import GameStatus from './GameStatus';
import ErrorDisplay from './ErrorDisplay';
import LeaveRoomButton from './LeaveRoomButton';
import RoomInfo from './RoomInfor';
import { useRouter } from 'next/router';

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-purple-100 overflow-hidden">
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSgzMCkiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIyIiBoZWlnaHQ9IjIiIGZpbGw9IiNmZmZmZmYxMCIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')]"></div>
                    <h2 className="text-2xl font-extrabold text-white text-center relative z-10 drop-shadow-md">
                        Battle Room
                    </h2>
                </div>

                <div className="p-8 space-y-6">
                    {room && room.roomId ? (
                        <RoomInfo roomData={room} />
                    ) : (
                        <div className="flex justify-center items-center p-8">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
                            <p className="ml-3 text-gray-600">Loading room information...</p>
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
            </div>
        </div>
    );
}
