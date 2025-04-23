'use client';
import { useEffect, useState } from 'react';

export default function RoomInfo({ roomData }) {
    return (
        <div className="room-info bg-indigo-800 bg-opacity-40 rounded-lg p-4 mb-6 border border-indigo-500">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                    <span className="text-yellow-300">Phòng:</span> {roomData.roomId}
                </h2>
                {roomData?.isPrivate && (
                    <div className="bg-yellow-600 text-white text-sm px-3 py-1 rounded-full">
                        {roomData?.password ? '🔒 Phòng riêng tư' : '🔓 Phòng công khai'}
                    </div>
                )}
            </div>
            
            <div className="players-list">
                <p className="text-lg font-semibold mb-3 text-gray-300">Người chơi:</p>
                <div className="grid grid-cols-2 gap-3">
                    {roomData?.players?.map((player, index) => (
                        <div 
                            key={index} 
                            className={`player-card p-3 rounded-lg border border-indigo-400 flex items-center ${
                                roomData.createdBy === player ? 'bg-purple-700' : 'bg-indigo-700'
                            }`}
                        >
                            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center mr-3">
                                {index + 1}
                            </div>
                            <div>
                                <p className="font-medium">{player}</p>
                                {roomData.createdBy === player && (
                                    <span className="text-xs text-yellow-300">Chủ phòng</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}