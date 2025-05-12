export default function GameStatus({ gameStatus, room, username, players, handleStartBattle }) {
    return (
        <div className="game-status space-y-4">
            {gameStatus === 'waiting' && (
                <div className="text-center space-y-4">
                    {room?.createdBy === username && players.length >= 2 && (
                        <button
                            onClick={handleStartBattle}
                            className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-400 text-white font-semibold rounded-xl 
                                    hover:from-orange-600 hover:to-pink-700 transform hover:translate-y-[-2px]
                                    focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
                                    transition-all duration-300 shadow-lg shadow-orange-500/20"
                        >
                            <span className="flex items-center justify-center gap-2">Start Match</span>
                        </button>
                    )}
                    {room?.createdBy !== username && players.length >= 2 && (
                        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-xl border border-yellow-200 text-yellow-800 flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-2 animate-pulse"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            Waiting for host to start the match...
                        </div>
                    )}
                    {players.length < 2 && (
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-gray-600 flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                            Waiting for more players (minimum 2 required)
                        </div>
                    )}
                </div>
            )}

            {gameStatus === 'ongoing' && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 text-blue-800 flex items-center justify-center animate-pulse">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                    </svg>
                    Match in progress...
                </div>
            )}

            {gameStatus === 'finished' && (
                <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-xl border border-green-200 text-center">
                    <h3 className="text-xl font-bold text-green-800 mb-2 flex items-center justify-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                            />
                        </svg>
                        Winner: {room?.winner}
                    </h3>
                </div>
            )}
        </div>
    );
}
