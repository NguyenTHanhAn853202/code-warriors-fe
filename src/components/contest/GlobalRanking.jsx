"use client";
import React from "react";
import { useRouter } from "next/navigation"; // Import đúng thư viện của Next.js 13+

const GlobalRanking = ({ styles }) => {
  const router = useRouter(); // Sử dụng useRouter để điều hướng

  const rankings = [
    { rank: 1, name: "thinh", score: 3845, contests: 24 },
    { rank: 2, name: "Neal Wu", avatar: "/user.png", score: 3830, contests: 53 },
    { rank: 3, name: "jiangly", avatar: "/user.png", score: 3740, contests: 46 },
    { rank: 4, name: "ecnerwala", avatar: "/user.png", score: 3658, contests: 36 },
    { rank: 5, name: "hsdgjsahd", avatar: "/user.png", score: 3547, contests: 102 },
    { rank: 6, name: "cdjcd", avatar: "/user.png", score: 3546, contests: 36 },
    { rank: 7, name: "Heltion", avatar: "/user.png", score: 3490, contests: 204 },
    { rank: 8, name: "dchjbhsd", avatar: "/user.png", score: 3444, contests: 445 },
    { rank: 9, name: "cdsjk", avatar: "/user.png", score: 3440, contests: 265 },
  ];

  // Hàm điều hướng khi bấm nút "View More"
  const handleViewMore = () => {
    router.push("/contest/rankGlobal"); // Điều hướng đến trang ranking
  };

  // Hàm chọn màu cho số hạng
  const getRankNumberStyle = (rank) => {
    switch (rank) {
      case 1:
        return "text-blue-700 font-extrabold text-xl";
      case 2:
        return "text-gray-700 font-extrabold text-xl";
      case 3:
        return "text-orange-700 font-extrabold text-xl";
      default:
        return "text-black text-lg";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border-1-4 border-yellow-500">
      {/* Tiêu đề */}
      <div className="p-3 border-b border-yellow-500 flex items-center bg-yellow-500 text-white font-bold">
        <span className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2l3 6 7 .9-5 4.9 1.2 6.2L12 16l-6.2 3.1L7 13 2 8.9 9 8z" />
          </svg>
          <span className="text-lg">Global Ranking</span>
        </span>
      </div>

      {/* Danh sách ranking */}
      <div>
        {rankings.map((user) => (
          <div
            key={`${user.rank}-${user.name}`} 
            className={`flex items-center p-3 border-b transition-all hover:bg-gray-100 border-l-4 border-yellow-500`}
          >
            {/* Xếp hạng (số thứ tự) */}
            <div className={`w-8 ${getRankNumberStyle(user.rank)}`}>
              {user.rank}
            </div>

            {/* Avatar */}
            <div className="flex-1 flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden mr-3">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Tên */}
              <span className="text-base">{user.name}</span>
            </div>

            {/* Điểm số và số cuộc thi */}
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {user.score}
              </div>
              <div className="text-sm text-gray-500">Contests: {user.contests}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Nút xem thêm */}
      <div className="p-3 text-center">
        <button
          onClick={handleViewMore}
          className="text-blue-600 text-sm hover:text-blue-400 transition"
        >
          View More
        </button>
      </div>
    </div>
  );
};

export default GlobalRanking;
