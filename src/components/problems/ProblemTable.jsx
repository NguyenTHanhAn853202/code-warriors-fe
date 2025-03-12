import React from 'react';
import { FaCheck } from 'react-icons/fa';

const ProblemsTable = ({ problems, loading, getDifficultyColor, getAcceptanceRate, getFrequencyBar }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
              Solution
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
              Acceptance
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
              Difficulty
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
              Frequency
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                Loading problems...
              </td>
            </tr>
          ) : problems.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                No problems found
              </td>
            </tr>
          ) : (
            problems.map((problem, index) => (
              <tr key={problem._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-center">
                    {index % 3 === 0 ? <FaCheck className="text-green-500" /> : null}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {index + 1}. {problem.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-blue-500 flex justify-center">
                    {problem.source_code ? (
                      <span className="text-blue-500 cursor-pointer">📄</span>
                    ) : null}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getAcceptanceRate(problem)}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm ${getDifficultyColor(problem.rankDifficulty || problem.difficulty)}`}
                >
                  {problem.rankDifficulty
                    ? problem.rankDifficulty[0]?.charAt(0).toUpperCase() +
                      problem.rankDifficulty[0]?.slice(1)
                    : problem.difficulty?.name || 'Medium'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gray-400 h-2 rounded-full"
                      style={{ width: `${getFrequencyBar(problem)}%` }}
                    ></div>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProblemsTable;