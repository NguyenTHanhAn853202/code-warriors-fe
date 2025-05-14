'use client';

import request from '@/utils/server';
import { Tooltip } from 'antd';
import { MessageSquare } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const MatchResult = () => {
    const params = useParams();
    const [data, setData] = useState({});
    const matchId = params.id;
    useEffect(() => {
        (async () => {
            try {
                const response = await request.get('/match/result/' + matchId);
                if (response.status === 200) {
                    setData(response.data.data);
                }
            } catch (error) {
                console.log(error);
            }
        })();
    }, [matchId]);
    console.log(data);

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">
            {/* Header */}
            <h1 className="text-xl font-bold text-center">Match Result</h1>

            {/* Match Overview */}
            <div className="bg-white p-4 shadow-lg rounded-lg text-center">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col items-center">
                        <img className="w-16 h-16" src="/user_1.png" alt="Team 1" />
                        <Tooltip title={data?.player1?.username}>
                            <span className="text-md truncate font-light block max-w-[200px]  overflow-hidden">
                                {data?.player1?.username}
                            </span>
                        </Tooltip>
                    </div>
                    <div className="text-3xl font-bold">
                        {data?.winner ? (
                            <>
                                <span
                                    className={`${data?.winner === data?.player1?._id ? 'text-green-600' : 'text-red-600'}`}
                                >
                                    {data?.winner === data?.player1?._id ? 'Win' : 'Lose'}
                                </span>{' '}
                                -{' '}
                                <span
                                    className={`${data?.winner === data?.player2?._id ? 'text-green-600' : 'text-red-600'}`}
                                >
                                    {data?.winner === data?.player2?._id ? 'Win' : 'Lose'}
                                </span>
                            </>
                        ) : (
                            <span className="text-orange-600">Drew</span>
                        )}
                    </div>
                    <div className="flex flex-col items-center">
                        <img className="w-16 h-16" src="/user_1.png" alt="Team 2" />
                        <Tooltip title={data?.player2?.username}>
                            <span className="text-md truncate font-light block max-w-[200px]  overflow-hidden">
                                {data?.player2?.username}
                            </span>
                        </Tooltip>
                    </div>
                </div>
            </div>

            {/* Match Stats */}
            <div className="bg-white p-4 shadow-lg rounded-lg">
                <h2 className="text-lg font-semibold mb-3">Match statistic</h2>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span>Point</span>
                        <span>
                            {data?.player1Submissions?.grade} - {data?.player2Submissions?.grade}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded mb-7">
                        <div
                            className="bg-blue-500 h-2 rounded"
                            style={{
                                width:
                                    Math.floor(
                                        (data?.player1Submissions?.grade /
                                            (data?.player1Submissions?.grade + data?.player2Submissions?.grade)) *
                                            100,
                                    ) + '%',
                            }}
                        ></div>
                    </div>
                    <div className="flex justify-between">
                        <span>Execute time</span>
                        <span>
                            {data?.player1Submissions?.executionTime?.toFixed(3)}(ms) -{' '}
                            {data?.player2Submissions?.executionTime?.toFixed(3)}(ms)
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded mb-7">
                        <div
                            className="bg-blue-500 h-2 rounded"
                            style={{
                                width:
                                    Math.floor(
                                        (data?.player1Submissions?.executionTime /
                                            (data?.player1Submissions?.executionTime +
                                                data?.player2Submissions?.executionTime)) *
                                            100,
                                    ) + '%',
                            }}
                        ></div>
                    </div>
                    <div className="flex justify-between">
                        <span>Memory</span>
                        <span>
                            {data?.player1Submissions?.memoryUsage?.toFixed(3)}(B) -{' '}
                            {data?.player2Submissions?.memoryUsage?.toFixed(3)}(B)
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded mb-7">
                        <div
                            className="bg-blue-500 h-2 rounded"
                            style={{
                                width:
                                    Math.floor(
                                        (data?.player1Submissions?.memoryUsage /
                                            (data?.player1Submissions?.memoryUsage +
                                                data?.player2Submissions?.memoryUsage)) *
                                            100,
                                    ) + '%',
                            }}
                        ></div>
                    </div>
                    <div className="flex justify-between">
                        <span>submission time</span>
                        <span>
                            {data?.player1Submissions?.timeSubmission?.toFixed(0)}(s) -{' '}
                            {data?.player2Submissions?.timeSubmission?.toFixed(0)}(s)
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded mb-7">
                        <div
                            className="bg-blue-500 h-2 rounded"
                            style={{
                                width:
                                    Math.floor(
                                        (data?.player1Submissions?.timeSubmission /
                                            (data?.player1Submissions?.timeSubmission +
                                                data?.player2Submissions?.timeSubmission)) *
                                            100,
                                    ) + '%',
                            }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Comments Section */}
            {/* <div className="bg-white p-4 shadow-lg rounded-lg">
                <h2 className="text-lg font-semibold mb-3">Bình luận</h2>
                <div className="flex items-center space-x-2">
                    <MessageSquare size={20} />
                    <span className="text-sm text-gray-500">Chưa có bình luận nào</span>
                </div>
            </div> */}
        </div>
    );
};

export default MatchResult;