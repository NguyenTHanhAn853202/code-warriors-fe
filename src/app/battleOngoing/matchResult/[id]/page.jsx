'use client';
import { toastError } from '@/utils/toasty';
import request from '@/utils/server';
import React, { useEffect, useState } from 'react';
import { FaTrophy, FaClock, FaMemory, FaStopwatch, FaMedal, FaUser, FaSpinner } from 'react-icons/fa6';
import { useRouter, useSearchParams } from 'next/navigation';
import { use } from 'react';

import axios from 'axios';

function calculateSolvingTime(startedAt, submissionTime) {
    const start = new Date(startedAt).getTime();
    const submit = new Date(submissionTime).getTime();
    if (isNaN(start) || isNaN(submit)) return 'N/A';
    const diffMs = submit - start;
    if (diffMs < 0) return 'N/A';
    const diffSec = Math.floor(diffMs / 1000);
    const hours = Math.floor(diffSec / 3600);
    const minutes = Math.floor((diffSec % 3600) / 60);
    const seconds = diffSec % 60;
    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export default function BattleResult({ params }) {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { id: roomId } = use(params);
    // const roomId = params?.id;
    // const searchParams = useSearchParams();
    // const roomId = searchParams.get('id');

    const fetchBattleResult = async () => {
        try {
            const response = await request.get(`/rooms/${roomId}`);
            if (response.data.status === 'success') {
                const room = response.data.data;

                const results = room.rankings?.length > 0 ? room.rankings : room.submissions;

                const playerSubmissions = room.players.map((playerName) => {
                    const result = results?.find((r) => r.username === playerName);

                    if (result) {
                        const resultData = result.submission || result;
                        // Ưu tiên lấy theo thứ tự: timeSubmission -> submittedAt -> endedAt (nếu có)
                        const submissionTime = result.timeSubmission || result.executionTime|| result.memoryUsage
                        return {
                            username: playerName,
                            status: resultData.status || 'Waiting',
                            grade: resultData.grade || 0,
                            executionTime: resultData.executionTime || 0,
                            memoryUsage: resultData.memoryUsage || 0,
                            submittedAt: submissionTime,
                            solvingTime: submissionTime ? calculateSolvingTime(room.startedAt, submissionTime) : 'N/A',
                            rank: result.rank || 0,
                            hasSubmitted: true,
                        };
                    } else {
                        return {
                            username: playerName,
                            status: 'Waiting',
                            grade: 0,
                            executionTime: 0,
                            memoryUsage: 0,
                            submittedAt: null,
                            solvingTime: 'N/A',
                            rank: 0,
                            hasSubmitted: false,
                        };
                    }
                });

                setResult({
                    roomId: room.roomId,
                    submissions: playerSubmissions.sort((a, b) => b.grade - a.grade),
                    winner: room.winner,
                    startedAt: new Date(room.startedAt).toLocaleString('vi-VN'),
                    endedAt: room.endedAt ? new Date(room.endedAt).toLocaleString('vi-VN') : null,
                    status: room.status,
                    maxPlayers: room.maxPlayers,
                    totalPlayers: room.players.length,
                });
            }
            setLoading(false);
        } catch (error) {
            console.error('Error:', error);
            toastError('Error');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBattleResult();
        const interval = setInterval(fetchBattleResult, 1000);
        return () => clearInterval(interval);
    }, [roomId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600">Loading battle results...</p>
                </div>
            </div>
        );
    }

    if (!result) return null;

    const getRankIcon = (submission) => {
        if (!submission.hasSubmitted) return <FaUser className="text-gray-400 text-xl" />;
        if (submission.rank === 1) return <FaTrophy className="text-yellow-400 text-2xl" />;
        if (submission.rank === 2) return <FaMedal className="text-gray-400 text-2xl" />;
        if (submission.rank === 3) return <FaMedal className="text-amber-600 text-2xl" />;
        return <span className="text-lg font-semibold text-gray-600">#{submission.rank}</span>;
    };

    const getCardStyle = (submission) => {
        if (!submission.hasSubmitted) return 'border-gray-200 bg-gray-50';
        if (result.winner === submission.username) return 'border-yellow-400 bg-yellow-50 shadow-lg';
        if (submission.status === 'Accepted') return 'border-green-200 bg-green-50';
        return 'border-red-200 bg-red-50';
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'Accepted':
                return 'Accepted';
            case 'Wrong Answer':
                return 'Wrong Answer';
            case 'Time Limit Exceeded':
                return 'Time Limit Exceeded';
            case 'Memory Limit Exceeded':
                return 'Memory Limit Exceeded';
            case 'Runtime Error':
                return 'Runtime Error';
            case 'Compile Error':
                return 'Compile Error';
            case 'Waiting':
                return 'Waiting...';
            default:
                return status;
        }
    };

    const getStatusBadge = () => {
        switch (result.status) {
            case 'waiting':
                return 'bg-yellow-100 text-yellow-800';
            case 'ongoing':
                return 'bg-blue-100 text-blue-800';
            case 'finished':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-white">Battle Results</h1>
                                <p className="text-blue-100">Room: {result.roomId}</p>
                            </div>
                            <div className="text-right">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge()}`}>
                                    {result.status === 'finished'
                                        ? 'Finished'
                                        : result.status === 'finished'
                                          ? 'Đang diễn ra'
                                          : 'Ongoing'}
                                </span>
                                <p className="text-blue-100 text-sm mt-1">
                                    {result.totalPlayers}/{result.maxPlayers} players
                                </p>
                            </div>
                        </div>
                        <div className="mt-2 text-blue-100 text-sm">
                            <p>Started at: {result.startedAt}</p>
                            <p>Ended at: {result.endedAt || 'In progress'}</p>
                        </div>
                    </div>

                    <div className="grid gap-6 p-6">
                        {result.submissions.map((submission) => (
                            <div
                                key={submission.username}
                                className={`p-6 rounded-lg border transition-all duration-300 ${getCardStyle(submission)}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center min-w-[80px]">{getRankIcon(submission)}</div>
                                        <div>
                                            <h2 className="text-xl font-semibold flex items-center">
                                                <span className="max-w-[200px] truncate" title={submission.username}>
                                                    {submission.username}
                                                </span>
                                                {result.winner === submission.username && (
                                                    <span className="ml-2 px-2 py-1 bg-yellow-400 text-yellow-900 text-xs rounded-full font-medium">
                                                        🏆 Winner
                                                    </span>
                                                )}
                                                {!submission.hasSubmitted && (
                                                    <span className="ml-2 px-2 py-1 bg-gray-400 text-white text-xs rounded-full font-medium">
                                                        Not submitted
                                                    </span>
                                                )}
                                            </h2>
                                            <p
                                                className={`text-sm font-medium ${
                                                    submission.status === 'Accepted'
                                                        ? 'text-green-600'
                                                        : submission.status === 'Waiting'
                                                          ? 'text-gray-500'
                                                          : 'text-red-600'
                                                }`}
                                            >
                                                {getStatusText(submission.status)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p
                                            className={`text-2xl font-bold ${
                                                submission.grade === 0
                                                    ? 'text-gray-400'
                                                    : submission.grade >= 80
                                                      ? 'text-green-600'
                                                      : 'text-blue-600'
                                            }`}
                                        >
                                            {submission.grade} pts
                                        </p>
                                        {/* <p className="text-sm text-gray-600">
                                            {submission.submittedAt
                                                ? new Date(submission.submittedAt).toLocaleString('vi-VN')
                                                : 'Chưa nộp bài'}
                                        </p> */}
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-3 gap-4">
                                    <div className="flex items-center space-x-2">
                                        <FaClock
                                            className={submission.hasSubmitted ? 'text-blue-400' : 'text-gray-300'}
                                        />
                                        <div>
                                            <span className="text-sm font-semibold">Execution time</span>
                                            <p className="text-sm text-gray-700">{submission.executionTime}s</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <FaMemory
                                            className={submission.hasSubmitted ? 'text-purple-400' : 'text-gray-300'}
                                        />
                                        <div>
                                            <span className="text-sm font-semibold">Memory</span>
                                            <p className="text-sm text-gray-700">{submission.memoryUsage}MB</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <FaStopwatch
                                            className={submission.hasSubmitted ? 'text-green-400' : 'text-gray-300'}
                                        />
                                        <div>
                                            <span className="text-sm font-semibold">Solving time</span>
                                            <p className="text-sm text-gray-700">{submission.solvingTime}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
