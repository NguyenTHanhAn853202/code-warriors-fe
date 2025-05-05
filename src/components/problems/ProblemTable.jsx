'use client';

import React, { useState } from 'react';
import { FaCheck, FaLock, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

const ProblemsTable = ({ problems, loading, getDifficultyColor, filteredDifficulty }) => {
    const router = useRouter();
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');

    const getDifficultyName = (difficulty) => {
        if (!difficulty) return 'Unknown';
        if (Array.isArray(difficulty) && difficulty.length > 0) {
            return difficulty[0].name || 'Unknown';
        }
        if (typeof difficulty === 'object') {
            return difficulty.name || 'Unknown';
        }
        return difficulty;
    };

    const getStatusIcon = (problem, index) => {
        if (problem.completed) {
            return <FaCheck className="text-green-500" />;
        } else if (problem.locked) {
            return <FaLock className="text-gray-400" />;
        } else if (index % 3 === 0) {
            return <FaCheck className="text-green-500" />;
        }
        return null;
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (field) => {
        if (sortField !== field) return <FaSort className="ml-1 text-gray-300" />;
        return sortDirection === 'asc'
            ? <FaSortUp className="ml-1 text-blue-500" />
            : <FaSortDown className="ml-1 text-blue-500" />;
    };

    const handleProblemClick = (problemId) => {
        router.push(`/submit/${problemId}`);
    };

    // Lọc theo độ khó
    const filteredProblems = filteredDifficulty
        ? problems.filter((p) => getDifficultyName(p.difficulty) === filteredDifficulty)
        : problems;

    // Sắp xếp
    const sortedProblems = [...filteredProblems].sort((a, b) => {
        if (sortField === 'title') {
            return sortDirection === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
        } else if (sortField === 'difficulty') {
            const diffA = getDifficultyName(a.difficulty);
            const diffB = getDifficultyName(b.difficulty);
            const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };
            const valueA = difficultyOrder[diffA] || 0;
            const valueB = difficultyOrder[diffB] || 0;
            return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
        }
        return 0;
    });

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden z-0">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                            Status
                        </th>
                        <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group"
                            onClick={() => handleSort('title')}
                        >
                            <div className="flex items-center">
                                Title {getSortIcon('title')}
                            </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                            Solution
                        </th>
                        <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 cursor-pointer"
                            onClick={() => handleSort('difficulty')}
                        >
                            <div className="flex items-center">
                                Difficulty {getSortIcon('difficulty')}
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                        <tr>
                            <td colSpan={4} className="px-6 py-4">
                                <div className="flex justify-center items-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                    <span className="ml-2 text-gray-500">Loading problems...</span>
                                </div>
                            </td>
                        </tr>
                    ) : sortedProblems.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                                No problems found
                            </td>
                        </tr>
                    ) : (
                        sortedProblems.map((problem, index) => (
                            <tr key={problem._id} className="hover:bg-gray-50 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center justify-center">
                                        {getStatusIcon(problem, index)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div
                                        onClick={() => handleProblemClick(problem._id)}
                                        className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                                    >
                                        {index + 1}. {problem.title}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                    {problem.source_code ? (
                                        <button
                                            className="text-blue-500 hover:text-blue-700 transition-colors"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            📄 View
                                        </button>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </td>
                                <td
                                    className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getDifficultyColor(
                                        getDifficultyName(problem.difficulty)
                                    )}`}
                                >
                                    {getDifficultyName(problem.difficulty)}
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
