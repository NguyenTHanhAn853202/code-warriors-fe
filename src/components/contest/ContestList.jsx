'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const ContestList = ({ contests: initialContests }) => {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRank, setSelectedRank] = useState('');
    const [rankOptions, setRankOptions] = useState([]);
    const [contests, setContests] = useState(initialContests);
    const [loading, setLoading] = useState(false);
    const [now, setNow] = useState(new Date());

    // Fetch rank options
    useEffect(() => {
        const fetchRanks = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/v1/rank/viewAllRanks');
                if (response.status === 200) {
                    const rankData = response.data.data.ranks.map((rank) => ({
                        value: rank._id,
                        label: rank.name,
                    }));
                    setRankOptions(rankData);
                }
            } catch (error) {
                console.error('Error when getting ranks:', error);
            }
        };
        fetchRanks();
    }, []);

    // Search and filter contests
    useEffect(() => {
        const fetchFilteredContests = async () => {
            setLoading(true);
            try {
                let url = 'http://localhost:8080/api/v1/contest/viewAllContest?';

                if (searchTerm) {
                    url += `title=${searchTerm}&`;
                }

                if (selectedRank) {
                    url += `difficulty=${selectedRank}`;
                }

                const response = await axios.get(url);
                if (response.status === 200) {
                    const data = response.data.data.contests;
                    const isContestVisibleToUser = (contest) => {
                        if (!contest.difficulty || contest.difficulty.length === 0) return true;
                        if (!userRank) return false;

                        const contestRank = contest.difficulty[0]?.name || null;
                        if (!contestRank) return true;

                        const userRankIndex = rankOrder.indexOf(userRank);
                        const contestRankIndex = rankOrder.indexOf(contestRank);

                        if (userRankIndex === -1 || contestRankIndex === -1) return true;

                        return contestRankIndex <= userRankIndex;
                    };
                    const newData = data.filter(isContestVisibleToUser);
                    setContests(newData || []);
                }
            } catch (error) {
                console.error('Error fetching filtered contests:', error);
                setContests(initialContests);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchFilteredContests();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, selectedRank, initialContests]);

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date());
        }, 5000); // cập nhật mỗi 5 giây

        return () => clearInterval(interval);
    }, []);

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

    const itemsPerPage = 5;
    const [currentPage, setCurrentPage] = useState(1);

    // Filter upcoming contests
    const upcomingContests = useMemo(() => {
        return contests.filter((contest) => new Date(contest.endDate) >= new Date());
    }, [contests]);

    const totalPages = Math.ceil(upcomingContests.length / itemsPerPage);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedRank]);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentContests = upcomingContests.slice(startIndex, endIndex);

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const formatDate = (isoDate) => {
        if (!isoDate) return 'Unknown date';
        const date = new Date(isoDate);
        return date.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleRankChange = (e) => {
        setSelectedRank(e.target.value);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedRank('');
    };
    console.log('All contests:', contests);

    return (
        <div className="p-4">
            {/* Search and Filter Section */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="search by title..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="w-full md:w-35">
                    <select
                        value={selectedRank}
                        onChange={handleRankChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Ranks</option>
                        {rankOptions.map((rank) => (
                            <option key={rank.value} value={rank.value}>
                                {rank.label}
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={clearFilters}
                    className="px-1 py-2 text-red-600 border border-gray-600 rounded-lg hover:bg-blue-50"
                >
                    Clear Filters
                </button>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <>
                    {/* Contest List */}
                    <div className="space-y-4">
                        {currentContests.length > 0 ? (
                            currentContests.map((contest, index) => {
                                const rank = contest.difficulty?.[0]?.name?.toLowerCase();
                                const backgroundImage = getBackgroundImage(rank);

                                return (
                                    <div
                                        key={contest._id || index}
                                        onClick={() => {
                                            if (new Date(contest.startDate) <= now) {
                                                router.push(`/contest/${contest._id}`);
                                            }
                                        }}
                                        className="border border-gray-400 overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer p-4 flex flex-col md:flex-row items-center gap-4 rounded-lg"
                                    >
                                        <div
                                            className="w-full md:w-40 h-30 bg-gray-300 rounded-lg"
                                            style={{
                                                backgroundImage: `url(${backgroundImage})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                minHeight: '120px',
                                            }}
                                        ></div>

                                        <div className="flex-1 space-y-2">
                                            <h3 className="text-lg font-semibold">
                                                {contest.title.length > 25
                                                    ? `${contest.title.substring(0, 25)}...`
                                                    : contest.title}
                                            </h3>

                                            <p className="text-sm">
                                                ⏲️ Start Date:{' '}
                                                <span className="rounded">{formatDate(contest.startDate)}</span>
                                            </p>
                                            <p className="text-sm">
                                                ⏲️ End Date:{' '}
                                                <span className="rounded">{formatDate(contest.endDate)}</span>
                                            </p>
                                            <p className="text-sm">
                                                🔥 Rank:
                                                {contest.difficulty && contest.difficulty.length > 0 ? (
                                                    <span className="font-medium"> {contest.difficulty[0].name}</span>
                                                ) : (
                                                    <span className="text-gray-500"> Unknown</span>
                                                )}
                                            </p>
                                        </div>
                                        {new Date(contest.startDate) <= now ? (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/contest/${contest._id}`);
                                                }}
                                                className="px-4 py-2 rounded-lg font-medium transition-all duration-200 
            bg-blue-500 text-white border border-blue-600 
            hover:bg-blue-600 hover:border-blue-700 hover:shadow-md"
                                            >
                                                Join
                                            </button>
                                        ) : (
                                            <span className="px-4 py-2 text-sm font-medium text-gray-500 border border-gray-300 rounded-lg">
                                                ⏳ Coming soon
                                            </span>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                No contests found matching your criteria.
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {upcomingContests.length > 0 && (
                        <div className="flex justify-center items-center py-6 space-x-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`px-3 py-1 border border-black rounded-md ${
                                    currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-200'
                                }`}
                            >
                                Prev
                            </button>
                            <span className="px-3 py-1 border border-black rounded-md">{currentPage}</span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className={`px-3 py-1 border border-black rounded-md ${
                                    currentPage === totalPages || totalPages === 0
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'hover:bg-gray-200'
                                }`}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ContestList;
