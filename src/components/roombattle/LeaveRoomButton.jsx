export default function LeaveRoomButton({ handleLeaveRoom }) {
    return (
        <div className="text-center mt-6">
            <button 
                onClick={handleLeaveRoom} 
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
                Leave Room
            </button>
        </div>
    );
}