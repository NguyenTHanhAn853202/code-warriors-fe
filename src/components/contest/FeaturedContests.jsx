'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const FeaturedContests = ({ styles, contests }) => {
    const router = useRouter();

    const getBackgroundImage = (rank) => {
        const backgroundMap = {
            bronze: '/nen1.jpg',
            silver: '/nen2.jpg',
            gold: '/nen3.jpg',
            platinum: '/nen1.jpg',
            diamond: '/nen2.jpg',
            master: '/nen3.jpg',
            grandmaster: '/nen2.jpg',
        };
        return backgroundMap[rank] || '/nen1.jpg';
    };

    const useCountdown = (endDate) => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const end = new Date(endDate).getTime();
            const diff = Math.max(0, end - now);

            return {
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((diff % (1000 * 60)) / 1000),
            };
        };

        const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

        useEffect(() => {
            if (Object.values(timeLeft).every((val) => val === 0)) return;

            const timer = setInterval(() => {
                setTimeLeft(calculateTimeLeft());
            }, 1000);

            return () => clearInterval(timer);
        }, [timeLeft]);

        return timeLeft;
    };

    if (!contests || contests.length === 0) {
        return <p className="text-center text-gray-500">No featured contests available.</p>;
    }

    // Filter contests that have not ended yet
    const upcomingContests = contests.filter((contest) => {
        const now = new Date().getTime();
        const endTime = new Date(contest.endDate).getTime();
        return endTime > now;
    });

    if (upcomingContests.length === 0) {
        return <p className="text-center text-gray-500">No upcoming contests available.</p>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium">Featured Contests</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {upcomingContests.map((contest) => {
                    const rank = contest.difficulty?.[0]?.name?.toLowerCase();
                    const backgroundImage = getBackgroundImage(rank);
                    const { days, hours, minutes, seconds } = useCountdown(contest.endDate);
                    
                    // Check if contest has started
                    const now = new Date().getTime();
                    const startTime = new Date(contest.startDate).getTime();
                    const hasStarted = startTime <= now;
                    
                    return (
                        <div
                            key={contest._id}
                            className={`bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 ${hasStarted ? 'cursor-pointer' : 'cursor-default'} ${styles?.contestCard}`}
                        >
                            <div className="relative">
                                <img
                                    src={backgroundImage}
                                    alt={contest.title}
                                    className={`w-full h-40 object-cover ${hasStarted ? '' : 'opacity-80'}`}
                                    onClick={() => {
                                        if (hasStarted) {
                                            router.push(`/contest/${contest._id}`);
                                        }
                                    }}
                                />
                                {!hasStarted && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="bg-black bg-opacity-50 text-white font-bold py-2 px-4 rounded-lg">
                                            COMING SOON
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="p-2 text-left bg-white bg-opacity-50 text-black">
                               <h3 className={`font-semibold text-base ${hasStarted ? 'hover:underline cursor-pointer' : 'cursor-default'} overflow-hidden text-ellipsis`}
                                    style={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 4,
                                        WebkitBoxOrient: 'vertical',
                                    }}
                                    onClick={() => {
                                        if (hasStarted) {
                                        router.push(`/contest/${contest._id}`);
                                        }
                                    }}
                                    >
                                    {contest.title}
                                </h3>

                                {hasStarted ? (
                                    <p className="text-sm">
                                        ⌛ Time remaining: {days}d {hours}h {minutes}m {seconds}s
                                    </p>
                                ) : (
                                    <p className="text-sm">
                                        🕒 Starts in: {Math.floor((startTime - now) / (1000 * 60 * 60 * 24))}d {Math.floor(((startTime - now) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))}h
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FeaturedContests;