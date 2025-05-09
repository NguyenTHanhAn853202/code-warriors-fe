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
                            Start match
                        </button>
                    )}
                    {room?.createdBy !== username && players.length >= 2 && (
                        <div className="bg-yellow-600 bg-opacity-30 p-4 rounded-lg border border-yellow-500">
                            <span className="animate-pulse inline-block mr-2">⌛</span>
                            Waiting for the host to start the match...
                        </div>
                    )}
                    {players.length < 2 && (
                        <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                            <span className="inline-block mr-2">👥</span>
                            At least 2 players are required to start
                        </div>
                    )}
                </div>
            )}

            {gameStatus === 'ongoing' && (
                <div className="text-center animate-pulse bg-blue-700 bg-opacity-30 p-4 rounded-lg border border-blue-500">
                    <span className="inline-block mr-2">🔥</span>
                    Match in progress...
                </div>
            )}

            {gameStatus === 'finished' && (
                <div className="text-center bg-green-700 bg-opacity-30 p-6 rounded-lg border border-green-500">
                    <h3 className="text-xl font-bold mb-2">
                        <span className="inline-block mr-2">🏆</span>
                        The winner is: {room?.winner}
                    </h3>
                </div>
            )}
        </div>
    );
}