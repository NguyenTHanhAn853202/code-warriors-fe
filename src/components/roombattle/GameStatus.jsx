export default function GameStatus({ gameStatus, room, username, players, handleStartBattle }) {
    return (
        <div className="game-status my-6 p-4 bg-indigo-800 bg-opacity-50 rounded-lg">
            {gameStatus === 'waiting' && (
                <div className="text-center">
                    {room?.createdBy === username && players.length >= 2 && (
                        <button 
                            onClick={handleStartBattle}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg"
                        >
                            Bắt đầu trận đấu
                        </button>
                    )}
                    {room?.createdBy !== username && players.length >= 2 && (
                        <div className="bg-yellow-600 bg-opacity-30 p-4 rounded-lg border border-yellow-500">
                            <span className="animate-pulse inline-block mr-2">⌛</span>
                            Chờ chủ phòng bắt đầu trận đấu...
                        </div>
                    )}
                    {players.length < 2 && (
                        <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                            <span className="inline-block mr-2">👥</span>
                            Cần ít nhất 2 người chơi để bắt đầu
                        </div>
                    )}
                </div>
            )}

            {gameStatus === 'ongoing' && (
                <div className="text-center animate-pulse bg-blue-700 bg-opacity-30 p-4 rounded-lg border border-blue-500">
                    <span className="inline-block mr-2">🔥</span>
                    Trận đấu đang diễn ra...
                </div>
            )}

            {gameStatus === 'finished' && (
                <div className="text-center bg-green-700 bg-opacity-30 p-6 rounded-lg border border-green-500">
                    <h3 className="text-xl font-bold mb-2">
                        <span className="inline-block mr-2">🏆</span>
                        Người chiến thắng: {room?.winner}
                    </h3>
                </div>
            )}
        </div>
    );
}