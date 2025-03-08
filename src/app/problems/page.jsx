'use client';

import { useState, useEffect } from 'react';

export default function Problems() {
    const [problems, setProblems] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const limit = 10;

    useEffect(() => {
        fetchProblems(currentPage, search);
    }, [currentPage, search]);

    async function fetchProblems(page, title) {
        try {
            const res = await fetch(`http://localhost:8080/v1/api/problems?page=${page}&limit=${limit}&title=${title}`);
            const data = await res.json();
            if (res.ok) {
                setProblems(data.problems);
                setTotalPages(data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Error fetching problems:', error);
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Problems</h1>
            <input
                type="text"
                placeholder="Search by title..."
                className="border p-2 w-full mb-4"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <div className="space-y-4">
                {problems.map((problem) => (
                    <div key={problem._id} className="border p-4 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold">{problem.title}</h3>
                        <p className="text-gray-600">{problem.description}</p>
                        <p className="text-sm text-blue-600">Difficulty: {problem.difficulty.name}</p>
                        <p className="text-sm text-gray-500">Author: {problem.author.username}</p>
                    </div>
                ))}
            </div>
            <div className="flex justify-between mt-6">
                <button
                    className="px-4 py-2 bg-gray-300 rounded-md"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                > Previous
                </button>
                <span className="px-4 py-2">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    className="px-4 py-2 bg-gray-300 rounded-md"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                > Next
                </button>
            </div>
        </div>
    );
}
