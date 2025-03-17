"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const ContestList = ({ contests }) => {
  const router = useRouter();
  const getBackgroundImage = (rank) => {
    const backgroundMap = {
      bronze: "/nen1.jpg",
      silver: "/nen2.jpg",
      gold: "/nen3.jpg",
      platinum: "/nen1.jpg",
      diamond: "/nen2.jpg",
      master: "/nen3.jpg",
      grandmaster: "/nen2.jpg",
    };
    return backgroundMap[rank] || "/nen1.jpg";
  };
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  useEffect(() => {
    if (contests.length > 0) {
      setTotalPages(Math.ceil(contests.length / itemsPerPage));
    }
  }, [contests]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentContests = contests.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return "Unknown date";
    const date = new Date(isoDate);
    return date.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
  };

  return (
    <div key={currentPage} className="p-4">
      <div className="space-y-4">
        {currentContests.map((contest, index) => {
          const rank = contest.difficulty?.[0]?.name?.toLowerCase();
          const backgroundImage = getBackgroundImage(rank);

          return (
            <div
              key={contest._id || index}
              onClick={() => router.push(`/contest/${contest._id}`)}
              className="border border-gray-400 overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer p-4 flex items-center space-x-4 rounded-lg"
            >
              <div
                className="w-40 h-30 bg-gray-300 rounded-lg"
                style={{
                  backgroundImage: `url(${backgroundImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></div>

                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-semibold">{contest.title}</h3>
                  
                  {/* Hiển thị algorithmTypes */}
                  <p className="text-sm">
                    ⏲️Start Date: <span className="rounded">{formatDate(contest.startDate)}</span>
                  </p>

                  {/* Hiển thị ngày bắt đầu */}
                  <p className="text-sm">
                    ⏲️End Date: <span className="rounded">{formatDate(contest.endDate)}</span>
                  </p>

                  {/* Hiển thị rankDifficulty */}
                  <p className="text-sm">
                    🔥 Rank:  
                    {contest.difficulty && contest.difficulty.length > 0 ? (
                      <span className="font-medium"> {contest.difficulty[0].name}</span>
                    ) : (
                      <span className="text-gray-500"> Unknown</span>
                    )}
                  </p>
                </div>
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
            </div>
          );
        })}
      </div>

      <div className="flex justify-center items-center py-4 space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1 border border-black rounded-md ${
            currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "hover:bg-gray-200"
          }`}
        >
          Prev
        </button>
        <span className="px-3 py-1 border border-black rounded-md">{currentPage}</span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 border border-black rounded-md ${
            currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "hover:bg-gray-200"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ContestList;
