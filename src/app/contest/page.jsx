'use client';

import React, { useState, useEffect } from 'react';
import FeaturedContests from '../../components/contest/FeaturedContests';
import ContestList from '../../components/contest/ContestList';
import GlobalRanking from '../../components/contest/GlobalRanking';
import axios from 'axios';
import styles from './page.module.css';
import Link from 'next/link';

const rankOrder = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];

const Page = () => {
    const [activeTab, setActiveTab] = useState('global');
    const [contests, setContests] = useState([]);
    const [featuredContests, setFeaturedContests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingFeatured, setLoadingFeatured] = useState(false);
    const [userRank, setUserRank] = useState(null);
    const [loadingUserRank, setLoadingUserRank] = useState(false);

    // get rank user
    const fetchUserRank = async () => {
        setLoadingUserRank(true);
        try {
            const res = await axios.get('http://localhost:8080/api/v1/user/rank', {
                withCredentials: true,
            });
            const rankName = res.data.data.name || null;
            setUserRank(rankName);
            console.log('User Rank:', rankName);
        } catch (error) {
            console.error('Error fetching user rank:', error);
            setUserRank(null);
        }
        setLoadingUserRank(false);
    };

    // get all contest
    const fetchContests = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('http://localhost:8080/api/v1/contest/viewAllContest');
            setContests(data?.data?.contests || []);
            console.log('Fetched Contests:', data?.data?.contests);
        } catch (error) {
            console.error('Error fetching contests:', error);
        }
        setLoading(false);
    };

    const fetchFeaturedContests = async () => {
        setLoadingFeatured(true);
        try {
            const { data } = await axios.get('http://localhost:8080/api/v1/contest/FeaturedContest');
            setFeaturedContests(data?.data?.contests || []);
            console.log('Fetched Featured Contests:', data?.data?.contests);
        } catch (error) {
            console.error('Error fetching featured contests:', error);
        }
        setLoadingFeatured(false);
    };

    useEffect(() => {
        fetchUserRank();
        fetchContests();
        fetchFeaturedContests();
    }, []);

    // filtter contest folllow rank user
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

    const filteredContests = contests.filter(isContestVisibleToUser);
    const filteredFeaturedContests = featuredContests.filter(isContestVisibleToUser);

    return (
        <div className="bg-white min-h-screen text-gray-800">
            {/* Header Banner */}
            <Link href="/contest" className="block">
                <div className="bg-gray-800 py-10 text-center text-white relative hover:bg-gray-700 transition cursor-pointer">
                    <div className="mb-2">
                        <img src="/cup.png" alt="Trophy" className="w-35 h-40 mx-auto" />
                    </div>
                    <h1 className="text-2xl font-semibold mb-1">CodeWars Contest</h1>
                    <p className="text-gray-300 text-sm">Challenge yourself every week and rise in the rankings!</p>
                </div>
            </Link>

            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Featured Contests */}
                {loadingFeatured ? (
                    <p className="text-center p-4">Loading featured contests...</p>
                ) : (
                    <FeaturedContests styles={styles} contests={filteredFeaturedContests} />
                )}

                {/* Contest List and Rankings */}
                <div className="flex flex-col md:flex-row gap-4 mt-8">
                    <div className="w-full md:w-2/3">
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow">
                            <div className="border-b border-gray-200 flex justify-start">
                                <button
                                    className={`py-3 px-6 text-lg font-bold flex-1 text-left transition-colors duration-300 ${
                                        activeTab === 'global' ? 'text-black-500 font-bold' : 'text-gray-500'
                                    } hover:text-orange-600`}
                                    onClick={() => setActiveTab('global')}
                                >
                                    Global Contests
                                </button>
                            </div>
                            {loading || loadingUserRank ? (
                                <p className="text-center p-4">Loading contests...</p>
                            ) : filteredContests.length === 0 ? (
                                <p className="text-center p-4">No contests available for your rank.</p>
                            ) : (
                                <ContestList styles={styles} contests={filteredContests} />
                            )}
                        </div>
                    </div>
                    <div className="w-full md:w-1/3">
                        <GlobalRanking styles={styles} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;
