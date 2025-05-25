'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, PlayCircle, MessageSquare, Share2 } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';

export default function ContestDetail() {
    const [contestData, setContestData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [top3, setTop3] = useState([]);
    const [error, setError] = useState(null);
    const [isContestActive, setIsContestActive] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const id = pathname ? pathname.split('/').pop() : null;

    useEffect(() => {
        const fetchContestDetails = async () => {
            if (!id) {
                setError('Contest ID not found');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:8080/api/v1/contest/viewDetailContest/${id}`);
                setContestData(response.data.data.contest);

                if (response.data.data.contest.endDate) {
                    const currentDate = new Date();
                    const endDate = new Date(response.data.data.contest.endDate);
                    setIsContestActive(currentDate <= endDate);
                }

                const top3Response = await axios.get(`http://localhost:8080/api/v1/submission/top3/${id}`);
                setTop3(top3Response.data.data);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                console.error('Error fetching contest details:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchContestDetails();
    }, [id]);

    console.log(top3);

    const handleBackToContests = () => {
        router.push('/contest');
    };

    const handleStartChallenge = () => {
        if (isContestActive) {
            router.push(`/submit/${id}`);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p>Error: {error}</p>
                    <p>Please try again later.</p>
                </div>
            </div>
        );
    }

    if (!contestData) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                    <p>No contest data found.</p>
                </div>
            </div>
        );
    }

    const contestDate = new Date(contestData.startDate);
    const formattedDate = contestDate.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
    });

    let formattedEndDate = '';
    if (contestData.endDate) {
        const endDate = new Date(contestData.endDate);
        formattedEndDate = endDate.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short',
        });
    }

    return (
        <div className="bg-gray-100 min-h-screen p-4">
            {/* Header */}
            <div className="bg-white rounded-lg p-4 shadow-sm ">
                {/* Back button */}
                <div className="mb-4">
                    <button
                        onClick={handleBackToContests}
                        className="text-gray-500 hover:text-gray-700 flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={18} />
                        <span>Back to Contests</span>
                    </button>
                </div>

                {/* Contest Title */}
                <h1
                    className="text-3xl font-bold text-orange-500 mb-2 overflow-hidden text-ellipsis"
                    style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                    }}
                >
                    {contestData.title}
                </h1>
                <div className="rounded-lg p-4 mb-6">
                    {/* Start date on timeline */}
                    <div className="relative border-l-2 border-blue-400 pl-6 pb-2">
                        <div className="absolute -left-2 top-0">
                            <div className="bg-blue-500 rounded-full w-4 h-4"></div>
                        </div>
                        <span className="text-sm text-gray-500">Start</span>
                        <div className="font-medium">{formattedDate}</div>
                    </div>

                    {/* End date on timeline */}
                    {contestData.endDate && (
                        <div className="relative border-l-2 border-purple-400 pl-6 mt-4">
                            <div className="absolute -left-2 top-0">
                                <div className="bg-purple-500 rounded-full w-4 h-4"></div>
                            </div>
                            <span className="text-sm text-gray-500">End</span>
                            <div className="font-medium">{formattedEndDate}</div>
                        </div>
                    )}

                    {/* Contest ended notice */}
                    {!isContestActive && contestData.endDate && (
                        <div className="mt-4 bg-red-50 p-2 rounded-md border border-red-100 flex items-center">
                            <AlertCircle size={16} className="text-red-500 mr-2" />
                            <span className="text-red-600 text-sm">This contest has ended</span>
                        </div>
                    )}
                </div>

                {/* Contest Type and Action Buttons */}
                <div className="mb-6 flex gap-3">
                    <button
                        onClick={handleStartChallenge}
                        className={`${
                            isContestActive ? 'bg-blue-600 hover:bg-green-500' : 'bg-gray-400 cursor-not-allowed'
                        } text-white rounded-full px-4 py-2 flex items-center transition-colors`}
                        disabled={!isContestActive}
                    >
                        <PlayCircle size={18} className="mr-2" />
                        <span>{isContestActive ? 'Start Contest' : 'Contest Ended'}</span>
                    </button>
                    {/* <button className="p-2 rounded-full hover:bg-gray-100">
            <MessageSquare size={20} className="text-gray-500" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100">
            <Share2 size={20} className="text-gray-500" />
          </button> */}
                </div>

                {/* TOP 3 Ranking */}
                <div className="flex items-end gap-6 max-w-md w-full justify-center">
                    {(() => {
                        const actualTop3 = top3.filter(Boolean);
                        const sortedTop3 = [...actualTop3].sort((a, b) => b.score - a.score);

                        let displayOrder = [];
                        if (sortedTop3.length === 1) {
                            displayOrder = [null, sortedTop3[0], null];
                        } else if (sortedTop3.length === 2) {
                            displayOrder = [sortedTop3[1], sortedTop3[0], null]; // người điểm cao đứng giữa
                        } else {
                            displayOrder = [sortedTop3[1], sortedTop3[0], sortedTop3[2]]; // 2 - 1 - 3
                        }

                        return displayOrder.map((participant, index) => {
                            if (!participant) return null;

                            const rankMap = [2, 1, 3]; // giữa là hạng 1
                            const rank = rankMap[index];

                            let colorRank;
                            if (sortedTop3.length === 1) {
                                colorRank = 2;
                            } else if (sortedTop3.length === 2) {
                                colorRank = index === 1 ? 2 : 1;
                            } else {
                                colorRank = rank;
                            }

                            const baseHeight = { 1: 180, 2: 160, 3: 140 }[rank];
                            const baseBarHeight = { 1: 110, 2: 100, 3: 90 }[rank];
                            const bgColor = {
                                3: 'bg-yellow-800 bg-opacity-80',
                                2: 'bg-yellow-400',
                                1: 'bg-gray-300 bg-opacity-30',
                            }[colorRank];
                            const circleBg = {
                                3: 'bg-yellow-900 text-yellow-300',
                                2: 'bg-yellow-300 text-yellow-900',
                                1: 'bg-gray-400 text-gray-900',
                            }[colorRank];
                            const fontSize = {
                                1: 'text-2xl',
                                2: 'text-xl',
                                3: 'text-lg',
                            }[colorRank];

                            return (
                                <div
                                    key={participant.user.id || rank}
                                    className={`flex flex-col items-center ${bgColor} rounded-t-xl shadow-lg`}
                                    style={{ height: `${baseHeight}px`, width: '96px' }}
                                >
                                    <div
                                        className={`${circleBg} ${fontSize} font-bold rounded-full w-12 h-12 flex items-center justify-center -mt-6 shadow-md select-none`}
                                    >
                                        {rank}
                                    </div>
                                    <div className="mt-auto mb-4 font-semibold text-center">
                                        {participant.user.username.length > 10
                                            ? participant.user.username.slice(0, 7) + '...'
                                            : participant.user.username}
                                    </div>
                                    <div
                                        className={`${circleBg.split(' ')[0]} rounded-t-xl w-full`}
                                        style={{ height: `${baseBarHeight}px` }}
                                    ></div>
                                </div>
                            );
                        });
                    })()}
                </div>

                {/* Contest Description */}
                <div className="mb-6 mt-6">
                    <div className="mb-6">
                        <div
                            className="text-gray-700 mb-4 overflow-hidden text-ellipsis"
                            style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 100,
                                WebkitBoxOrient: 'vertical',
                            }}
                            dangerouslySetInnerHTML={{
                                __html: contestData.description || 'This CodeWars contest is sponsored by FunPlus.',
                            }}
                        />
                    </div>

                    {/* Difficulty and Author Info */}
                    <div className="flex gap-4 mb-4">
                        <div className="bg-blue-100 px-3 py-1 rounded-full text-blue-700">
                            Rank: {contestData.difficulty[0].name || ''}
                        </div>
                        <div className="bg-green-100 px-3 py-1 rounded-full text-green-700">
                            Author: {contestData.author?.username || 'CodeWars'}
                        </div>
                    </div>
                </div>

                {/* Test Cases Preview (if available) */}
                {contestData.testCases && contestData.testCases.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-medium mb-3">Sample Test Cases</h3>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            {contestData.testCases.slice(0, 2).map((testCase, index) => (
                                <div key={index} className="mb-4 last:mb-0">
                                    <div className="font-medium text-gray-700 mb-1">Test Case {index + 1}</div>
                                    <div className="mb-2">
                                        <span className="text-gray-600 mr-2">Input:</span>
                                        <code className="bg-gray-100 px-2 py-1 rounded text-gray-800">
                                            {testCase.input}
                                        </code>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 mr-2">Expected Output:</span>
                                        <code className="bg-gray-100 px-2 py-1 rounded text-gray-800">
                                            {testCase.expectedOutput}
                                        </code>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Remaining content stays the same */}
                {/* Bonus Prizes */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium flex items-center mb-2">
                        <span className="text-yellow-500 mr-1">★</span>
                        Bonus Prizes
                        <span className="text-yellow-500 ml-1">★</span>
                    </h3>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>
                            Contestants ranked <span className="font-medium">1st-5th</span> will win a FunPlus
                            Customized T-shirt
                        </li>
                        <li>
                            Contestants ranked <span className="font-medium">6th - 10th</span> will win a FunPlus
                            Customized Bag
                        </li>
                        <li>
                            Contestants ranked <span className="font-medium">11th - 15th</span> will win a FunPlus
                            Storage Box
                        </li>
                        <li>
                            Contestants ranked <span className="font-medium">66th, 166th, 266th, 366th, 666th</span>{' '}
                            will win a FPX Champion Cap
                        </li>
                    </ul>
                    <p className="mt-4 text-gray-700">
                        Only CW(US)(codewars.com) accounts are eligible for the bonus rewards. After the ranking is
                        finalized, a CodeWars team member will reach out to you through email regarding the gift!
                    </p>
                </div>

                {/* Important Notes */}
                <div className="mb-6">
                    <h3 className="text-xl font-medium text-gray-800 mb-3">Important Note</h3>
                    <ol className="list-decimal pl-6 space-y-4">
                        <li>
                            To provide a better contest and ensure fairness, we listened to CodeWars users' feedback and
                            put in lots of thoughts behind the updated contest rule. Please check out our new contest
                            <a href="#" className="text-blue-600 hover:underline">
                                {' '}
                                rule{' '}
                            </a>
                            which covers more scenarios with details explained.
                        </li>
                        <li>The penalty time of 5 minutes will be applied for each wrong submission.</li>
                        <li>
                            To ensure the fairness of the contest, CodeWars will hide some test cases during the
                            contest. When users submit incorrect submissions, CodeWars will not show the hidden test
                            cases to the users.
                        </li>
                        <li>
                            The final rating of the contest will be updated within 5 working days after the contest.
                        </li>
                    </ol>
                </div>

                {/* Contest Violations */}
                <div className="border-t border-gray-200 pt-4 mb-6">
                    <p className="font-medium mb-3">Below actions are deemed contest violations:</p>
                    <ul className="list-disc space-y-3 pl-6">
                        <li className="text-gray-800">
                            One user submitting with multiple accounts during a contest. CWUS (codewars.com) account and
                            CWCN (codewars-cn.com) account are considered to be separate accounts, even if both accounts
                            belong to the same user.
                        </li>
                        <li className="text-gray-800">
                            Multiple accounts submitting similar code for the same problem.
                        </li>
                        <li className="text-gray-800">
                            Creating unwanted discussions which interrupt other users' participation in a contest.
                        </li>
                        <li className="text-gray-800">
                            Disclosing contest solutions in public discuss posts before the end of a contest.
                        </li>
                    </ul>
                </div>

                {/* Zero Tolerance Policy */}
                <div className="mb-6">
                    <p className="text-gray-800 mb-3">
                        CodeWars heavily emphasizes on the justice and fairness of our contests. We have absolutely
                        <span className="font-bold"> ZERO TOLERANCE </span>
                        for violation behaviors (such as plagiarism, cheating, etc). When a user is deemed violating
                        contest rules, we will apply the following penalties on this user:
                    </p>
                    <ul className="list-disc space-y-3 pl-6">
                        <li className="text-gray-800">
                            <span className="font-medium">First violation:</span> CodeCoin amount resets to zero and a
                            contest and discuss ban for 1 month.
                        </li>
                        <li className="text-gray-800">
                            <span className="font-medium">Second violation:</span> Permanent account deactivation
                            without appeal.
                        </li>
                    </ul>
                </div>

                {/* Participation Encouragement */}
                <div className="mb-6">
                    <p className="text-gray-800 mb-3">
                        Furthermore, we encourage all participants to contribute to maintaining the justice and fairness
                        of our contest. Users who submit valid violation report(s) will earn additional CodeCoins:
                    </p>
                    <ul className="list-disc space-y-3 pl-6">
                        <li className="text-gray-800">
                            For each violating participant, the first 10 users who submit the violation report towards
                            this participant will each earn 200 CodeCoins.
                        </li>
                        <li className="text-gray-800">
                            Each user can earn up to 100 CodeCoins for reporting violations in a contest.
                        </li>
                        <li className="text-gray-800">
                            Users will not be rewarded CodeCoins for reports on CWCN users.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
