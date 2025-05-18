'use client';
import { useEffect, useState } from 'react';

export default function RoomInfo({ roomData }) {
    return (
        <div className="room-info bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Room: {roomData.roomId}
                </h2>
                {roomData?.isPrivate && (
                    <span className="bg-gradient-to-r from-orange-400 to-pink-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        🔒 Private
                    </span>
                )}
            </div>
            
            <div className="players-list">
                <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Players ({roomData?.players?.length || 0}/{roomData.maxPlayers})
                </p>
                <div className="space-y-3">
                    {roomData?.players?.map((player, index) => (
                        <div 
                            key={index} 
                            className={`player-card p-4 rounded-lg border ${roomData.createdBy === player ? 
                                'bg-gradient-to-r from-orange-100 to-pink-100 border-orange-300' : 
                                'bg-white border-gray-200'} flex items-center shadow-sm`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                                roomData.createdBy === player ? 
                                'bg-gradient-to-r from-orange-400 to-pink-500 text-white' : 
                                'bg-gray-100 text-gray-600'
                            }`}>
                                {index + 1}
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-800">{player}</p>
                            </div>
                            {roomData.createdBy === player && (
                                <span className="text-xs bg-gradient-to-r from-orange-400 to-pink-500 text-white px-2 py-1 rounded-full">
                                    Host
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}