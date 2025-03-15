"use client";

import React from "react";
import { useRouter } from "next/navigation";

const FeaturedContests = ({ styles, contests }) => {
  const router = useRouter();
  const backgroundMap = {
    easy: "/nen1.jpg",
    medium: "/nen2.jpg",
    hard: "/nen3.jpg",
  };

  if (!contests || contests.length === 0) {
    return <p className="text-center text-gray-500">No featured contests available.</p>;
  }

  const formatDate = (isoDate) => {
    if (!isoDate) return "Unknown date";
    const date = new Date(isoDate);
    return date.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">Featured Contests</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {contests.map((contest) => {
          const rank = contest.rankDifficulty?.[0]?.toLowerCase();
          const backgroundImage = backgroundMap[rank] || "/nen1.jpg";

          return (
            <div
              key={contest._id}
              className={`bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer ${styles?.contestCard}`}
            >
              <img
                src={backgroundImage}
                alt={contest.title}
                className="w-full h-40 object-cover"
                onClick={() => router.push(`/contest/${contest._id}`)}
              />

              <div className="p-2 text-left">
                <h3
                  className="font-semibold text-base text-black hover:underline cursor-pointer"
                  onClick={() => router.push(`/contest/${contest._id}`)}
                >
                  {contest.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  📅 Start Date: {formatDate(contest.startDate)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturedContests;
