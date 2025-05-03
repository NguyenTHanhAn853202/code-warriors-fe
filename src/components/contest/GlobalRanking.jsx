'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const GlobalRanking = ({ styles }) => {
    const router = useRouter();
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTopUsers = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:8080/api/v1/user/topUser');
                
                if (response.data.status === 'success' && response.data.data && response.data.data.topUsers) {
                    // Map the API response to our ranking format
                    const formattedRankings = response.data.data.topUsers.map((user, index) => ({
                        rank: index + 1,
                        name: user.username,
                        avatar: user.avtImage && user.avtImage !== "" ? user.avtImage : '/user_1.png',
                        score: user.elo
                    }));
                    
                    setRankings(formattedRankings);
                } else {
                    throw new Error('Invalid data format received from API');
                }
            } catch (err) {
                console.error('Error fetching top users:', err);
                setError(err.message);
                setRankings([]); // Set empty rankings on error
            } finally {
                setLoading(false);
            }
        };

        fetchTopUsers();
    }, []);

    const getRankNumberStyle = (rank) => {
        switch (rank) {
            case 1:
                return 'text-blue-700 font-extrabold text-xl';
            case 2:
                return 'text-gray-700 font-extrabold text-xl';
            case 3:
                return 'text-orange-700 font-extrabold text-xl';
            default:
                return 'text-black text-lg';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border-1-4 border-yellow-500 ">
            {/* Tiêu đề */}
            <div className="p-3 border-b border-yellow-500 flex items-center bg-yellow-500 text-white font-bold">
                <span className="flex items-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M12 2l3 6 7 .9-5 4.9 1.2 6.2L12 16l-6.2 3.1L7 13 2 8.9 9 8z" />
                    </svg>
                    <span className="text-lg">Global Ranking</span>
                </span>
            </div>

            {/* Loading state */}
            {loading && (
                <div className="p-4 text-center">
                    <div className="animate-pulse flex justify-center">
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    </div>
                </div>
            )}

            {/* Error state */}
            {!loading && error && (
                <div className="p-4 text-center text-red-500">
                    Failed to load rankings. Using fallback data.
                </div>
            )}

            {/* Danh sách ranking */}
            {!loading && (
                <div>
                    {rankings.map((user) => (
                        <div
                            key={`${user.rank}-${user.name}`}
                            className={`flex items-center p-3 border-b transition-all hover:bg-gray-100 border-l-4 border-yellow-500`}
                        >
                            {/* Xếp hạng (số thứ tự) */}
                            <div className={`w-15 ${getRankNumberStyle(user.rank)}`}>
                                {user.rank === 1 ? '🥇' : 
                                 user.rank === 2 ? '🥈' : 
                                 user.rank === 3 ? '🥉' :
                                 user.rank === 4 ? '4️⃣' :
                                 user.rank === 5 ? '5️⃣' : 
                                 user.rank === 6 ? '6️⃣' : 
                                 user.rank === 7 ? '7️⃣' : 
                                 user.rank === 8 ? '8️⃣' : 
                                 user.rank === 9 ? '9️⃣' : 
                                 user.rank === 10? '🔟' :  
                                 user.rank }
                            </div>

                            {/* Avatar */}
                            <div className="flex-1 flex items-center">
                                <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden mr-2">
                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                </div>

                                {/* Tên */}
                                <span className="text-base mr-3">
                                    {user.name.length > 15 ? user.name.slice(0, 12) + '...' : user.name}
                                </span>
                            </div>

                            {/* Điểm số và số cuộc thi */}
                            <div className="text-right">
                                <div className="text-lg font-bold text-gray-900">{user.score} 🏆</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GlobalRanking;