'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trash2, Plus } from 'lucide-react';
import axios from 'axios';
import { Button, message } from 'antd';
import { useRouter } from 'next/navigation';

export default function ProblemListPage() {
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

    const currentProblems = problems.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const totalPages = Math.ceil(problems.length / itemsPerPage);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Problem Management</h1>
                <Link href="/problems/create">
                    <Button type="primary" icon={<Plus size={16} />}>
                        Create New Problem
                    </Button>
                </Link>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Difficulty</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test Cases</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentProblems.map((problem) => (
                                <tr key={problem._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">{problem.title}</td>
                                    <td className="px-6 py-4">{problem.difficulty?.[0]?.name}</td>
                                    <td className="px-6 py-4">{problem.testCases?.length || 0}</td>
                                    <td className="px-6 py-4 space-x-2">
                                        <Button onClick={() => router.push(`/problems/edit/${problem._id}`)}>
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
                    <div className="px-4 py-3 border-t flex justify-center">
                        <div className="flex space-x-2">
                            <Button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <span className="flex items-center px-4">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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