'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trash2, Plus } from 'lucide-react';
import axios from 'axios';
import { Button, message } from 'antd';
import { useRouter } from 'next/navigation';

export default function ManageProblems() {
    const [problems, setProblems] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const router = useRouter();

    useEffect(() => {
        fetchProblems();
    }, []);

    const fetchProblems = async () => {
        try {
            const { data } = await axios.get('http://localhost:8080/api/v1/problems/viewAllProblems');
            setProblems(data.problems);
        } catch (err) {
            message.error('Failed to fetch problems');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this problem?')) return;

        try {
            await axios.delete(`http://localhost:8080/api/v1/problems/deleteProblems/${id}`);
            setProblems(problems.filter((problem) => problem._id !== id));
            message.success('Deleted successfully!');
        } catch (error) {
            message.error('Error deleting problem');
        }
    };

    const currentProblems = problems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(problems.length / itemsPerPage);

    return (
        <div className="max-w-7xl mx-auto px-4 py-10">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">🧠 Problem Management</h1>
                <Link href="/problems/create">
                    <Button type="primary" icon={<Plus size={16} />}>
                        Create New Problem
                    </Button>
                </Link>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Title</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Difficulty</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Test Cases</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {currentProblems.map((problem) => (
                                <tr key={problem._id} className="hover:bg-gray-50 transition-all">
                                    <td className="px-6 py-4 text-sm text-gray-800">{problem.title}</td>
                                    <td className="px-6 py-4 text-sm text-gray-800">{problem.difficulty?.[0]?.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-800">{problem.testCases?.length || 0}</td>
                                    <td className="px-6 py-4 flex justify-center space-x-2">
                                        <Button
                                            onClick={() => router.push(`/problems/edit/${problem._id}`)}
                                            type="default"
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            danger
                                            icon={<Trash2 size={16} />}
                                            onClick={() => handleDelete(problem._id)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="p-4 border-t bg-gray-50 flex justify-center">
                        <div className="flex items-center space-x-4">
                            <Button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-gray-700">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
