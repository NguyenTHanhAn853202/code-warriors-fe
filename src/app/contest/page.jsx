"use client";

import React, { useState, useEffect } from "react";
import FeaturedContests from "../../components/contest/FeaturedContests";
import ContestList from "../../components/contest/ContestList";
import GlobalRanking from "../../components/contest/GlobalRanking";
import request from "../../utils/server";
import styles from "./page.module.css";
import axios from "axios";

const Page = () => {
  const [activeTab, setActiveTab] = useState("global");
  const [contests, setContests] = useState([]);
  const [featuredContests, setFeaturedContests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingFeatured, setLoadingFeatured] = useState(false);

  const fetchContests = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("http://localhost:8080/api/v1/contest/viewAllContest");
      console.log("Fetched Contests:", data?.data?.contests);
      setContests(data?.data?.contests || []);
    } catch (error) {
      console.error("Error fetching contests:", error);
    }
    setLoading(false);
  };

  const fetchFeaturedContests = async () => {
    setLoadingFeatured(true);
    try {
      const { data } = await request.get("http://localhost:8080/api/v1/contest/FeaturedContest");
      console.log("Fetched Featured Contests:", data?.data?.contests);
      setFeaturedContests(data?.data?.contests || []);
    } catch (error) {
      console.error("Error fetching featured contests:", error);
    }
    setLoadingFeatured(false);
  };

  useEffect(() => {
    fetchContests();
    fetchFeaturedContests();
  }, []);

  return (
    <div className="bg-white min-h-screen text-gray-800">
      {/* Header Banner */}
      <div className="bg-gray-800 py-10 text-center text-white relative">
        <div className={`${styles.trophyIcon} mb-2`}>
          <img src="/cup.png" alt="Trophy" className="w-35 h-40 mx-auto" />
        </div>
        <h1 className="text-2xl font-semibold mb-1">CodeWars Contest</h1>
        <p className="text-gray-300 text-sm">Challenge yourself every week and rise in the rankings!</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Featured Contests */}
        {loadingFeatured ? (
          <p className="text-center p-4">Loading featured contests...</p>
        ) : (
          <FeaturedContests styles={styles} contests={featuredContests} />
        )}

        {/* Contest List and Rankings */}
        <div className="flex flex-col md:flex-row gap-4 mt-8">
          <div className="w-full md:w-2/3">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow">
              <div className="border-b border-gray-200 flex relative">
                <button
                  className={`py-3 px-6 text-sm font-medium flex-1 text-center transition-colors duration-300 ${
                    activeTab === "global" ? "text-orange-500 font-bold" : "text-gray-500"
                  } hover:text-orange-600`}
                  onClick={() => setActiveTab("global")}
                >
                  Global Contests
                </button>
                <button
                  className={`py-3 px-6 text-sm font-medium flex-1 text-center transition-colors duration-300 ${
                    activeTab === "my" ? "text-orange-500 font-bold" : "text-gray-500"
                  } hover:text-orange-600`}
                  onClick={() => setActiveTab("my")}
                >
                  My Contests
                </button>
              </div>
              {/* Danh sách contest */}
              {loading ? (
                <p className="text-center p-4">Loading contests...</p>
              ) : (
                <ContestList styles={styles} contests={contests} />
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
