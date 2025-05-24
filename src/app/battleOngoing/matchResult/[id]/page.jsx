'use client';
import React, { use, useEffect, useState } from 'react';
import { FaTrophy, FaClock, FaMemory, FaStopwatch, FaMedal } from 'react-icons/fa6';
import { useRouter } from 'next/navigation';
import { toastError } from '@/utils/toasty';
import request from '@/utils/server';

function calculateSolvingTime(startedAt, timeSubmission) {
    const start = new Date(startedAt).getTime();
    const submit = new Date(timeSubmission).getTime();

    if (isNaN(start) || isNaN(submit) || submit < start) return 'N/A';

    const diffMs = submit - start;
    const diffSec = Math.floor(diffMs / 1000);

    const hours = Math.floor(diffSec / 3600);
    const minutes = Math.floor((diffSec % 3600) / 60);
    const seconds = diffSec % 60;

    const pad = (n) => n.toString().padStart(2, '0');

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export default function BattleResult({ params }) {
    const [result, setResult] = useState(null);
    const router = useRouter();
    const { id: roomId } = use(params);

    const fetchBattleResult = async () => {
        try {
            const response = await request.get(`/rooms/${roomId}`);
            if (response.data.status === 'success') {
                const room = response.data.data;

                setResult({
                    roomId: room.roomId,
                    submissions: room.submissions.map((sub) => ({
                        username: sub.username,
                        status: sub.status || 'Waiting',
                        grade: sub.grade ?? 0,
                        executionTime: sub.executionTime ?? 0,
                        memoryUsage: sub.memoryUsage ?? 0,
                        submittedAt: sub.timeSubmission || null,
                        solvingTime: sub.timeSubmission
                            ? calculateSolvingTime(room.startedAt, sub.timeSubmission)
                            : 'N/A',
                        rank: sub.rank || 0,
                    })),
                    winner: room.submissions[0]?.username || null,
                    startedAt: new Date(room.startedAt).toLocaleString('en-US'),
                    endedAt: room.endedAt ? new Date(room.endedAt).toLocaleString('en-US') : null,
                });
            }
        } catch (error) {
            console.error('Error fetching battle result:', error);
            toastError('Could not fetch battle results');
        }
    };

    useEffect(() => {
        fetchBattleResult();
        const interval = setInterval(fetchBattleResult, 3000);
        return () => clearInterval(interval);
    }, [roomId]);

    if (!result) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
                        <h1 className="text-2xl font-bold text-white">Battle Results</h1>
                        <p className="text-blue-100">Room: {roomId}</p>
                        <div className="mt-2 text-blue-100 text-sm">
                            <p>Started: {result.startedAt}</p>
                            <p>Ended: {result.endedAt || 'Ongoing'}</p>
                        </div>
                    </div>

                    <div className="grid gap-6 p-6">
                        {result.submissions
                            .sort((a, b) => a.rank - b.rank)
                            .map((submission, index) => (
                                <div
                                    key={submission.username}
                                    className={`p-6 rounded-lg border ${
                                        result.winner === submission.username
                                            ? 'border-yellow-400 bg-yellow-50'
                                            : 'border-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center">
                                                {index === 0 && <FaTrophy className="text-yellow-400 text-2xl" />}
                                                {index === 1 && <FaMedal className="text-gray-400 text-2xl" />}
                                                {index === 2 && <FaMedal className="text-amber-600 text-2xl" />}
                                                <span className="ml-2 text-lg font-semibold text-gray-600">
                                                    #{submission.rank}
                                                </span>
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-semibold">
                                                    {submission.username}
                                                    {result.winner === submission.username && ' (Winner)'}
                                                </h2>
                                                <p
                                                    className={`text-sm ${
                                                        submission.status === 'Accepted'
                                                            ? 'text-green-600'
                                                            : 'text-red-600'
                                                    }`}
                                                >
                                                    {submission.status}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p
                                                className={`text-2xl font-bold ${
                                                    submission.grade === 0 ? 'text-red-500' : 'text-blue-600'
                                                }`}
                                            >
                                                {submission.grade} points
                                            </p>
                                            <p
                                                className={`text-sm ${
                                                    submission.status === 'Accepted'
                                                        ? 'text-green-600'
                                                        : 'text-gray-600'
                                                }`}
                                            >
                                                {submission.status || 'Waiting'}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {submission.submittedAt
                                                    ? new Date(submission.submittedAt).toLocaleString('en-US')
                                                    : 'Not submitted'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid grid-cols-3 gap-4">
                                        <div className="flex items-center space-x-2">
                                            <FaClock className="text-gray-400" />
                                            <div>
                                                <span className="text-sm font-semibold">Execution Time</span>
                                                <p className="text-sm text-gray-600">{submission.executionTime} ms</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <FaMemory className="text-gray-400" />
                                            <div>
                                                <span className="text-sm font-semibold">Memory Usage</span>
                                                <p className="text-sm text-gray-600">{submission.memoryUsage} KB</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <FaStopwatch className="text-gray-400" />
                                            <div>
                                                <span className="text-sm font-semibold">Solving Time</span>
                                                <p className="text-sm text-gray-600">{submission.solvingTime}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>

                    <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-4">
                        <button
                            onClick={() => router.push('/create-room')}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >
                            Back to Room Battle
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
