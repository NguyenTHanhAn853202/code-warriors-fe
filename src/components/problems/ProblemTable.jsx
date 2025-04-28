'use client';

import React from 'react';
import { FaCheck } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

const ProblemsTable = ({ problems, loading, getDifficultyColor, getAcceptanceRate, getFrequencyBar }) => {
    const router = useRouter();
    // Helper function to get difficulty name from difficulty array or object
    const getDifficultyName = (difficulty) => {
        if (!difficulty) return '???';

        // If difficulty is an array of objects
        if (Array.isArray(difficulty) && difficulty.length > 0) {
            return difficulty[0].name || '???';
        }

        // If difficulty is a single object
        if (typeof difficulty === 'object') {
            return difficulty.name || '???';
        }

        // If difficulty is a string
        return difficulty;
    };

    const handleTakeExam = (problemId) => {
        router.push('/submit/' + problemId);
    };

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
                                    <div
                                        onClick={() => handleTakeExam(problem._id)}
                                        className="text-sm font-medium text-gray-900 cursor-pointer"
                                    >
                                        {index + 1}. {problem.title}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-blue-500 flex justify-center">
                                        {problem.source_code ? (
                                            <span className="text-blue-500 cursor-pointer">📄</span>
                                        ) : (
                                            'OK'
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {getAcceptanceRate(problem)}
                                </td>
                                <td
                                    className={`px-6 py-4 whitespace-nowrap text-sm ${getDifficultyColor(
                                        getDifficultyName(problem.difficulty),
                                    )}`}
                                >
                                    {getDifficultyName(problem.difficulty)}
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
