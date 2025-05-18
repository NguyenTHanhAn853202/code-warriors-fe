export default function LeaveRoomButton({ handleLeaveRoom }) {
    return (
        <div className="text-center">
            <button 
                onClick={handleLeaveRoom} 
                className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-xl 
                hover:from-red-600 hover:to-pink-700 transform hover:-translate-y-0.5
                focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                transition-all duration-300 shadow-lg shadow-red-500/20 flex justify-center items-center"
            >
                <span className="mr-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </span>
                Leave Room
            </button>
        </div>
    );
}
