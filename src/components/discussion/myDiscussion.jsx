'use client';
import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Eye } from 'lucide-react';
import axios from 'axios';
import EditPage from '../../components/discussion/editPage';
import truncateHTML from '@/utils/truncateHTML';
import Link from 'next/link';
import { toastError, toastSuccess } from '@/utils/toasty';
const MyDiscussions = () => {
    const [discussions, setDiscussions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingDiscussionId, setEditingDiscussionId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchDiscussions();
    }, []);

    const fetchDiscussions = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8080/api/v1/discussion/me', {
                withCredentials: true,
            });

            if (response.data.status === 'success') {
                setDiscussions(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching discussions:', err);
            setError('Failed to load discussions');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (id) => {
        setEditingDiscussionId(id);
    };

    const handleCloseEdit = () => {
        setEditingDiscussionId(null);
        // Refresh discussions after editing
        fetchDiscussions();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this discussion?')) {
            return;
        }

        try {
            setIsDeleting(true);
            // Use the exact API endpoint as shown in the screenshot
            const response = await axios.delete(`http://localhost:8080/api/v1/discussion/${id}`, {
                withCredentials: true,
            });

            if (response.data.status === 'success') {
                // Remove the deleted discussion from state
                setDiscussions((prevDiscussions) => prevDiscussions.filter((discussion) => discussion._id !== id));
                // Optional: Show success message to user
                toastSuccess('Discussion deleted successfully');
            }
        } catch (err) {
            console.error('Error deleting discussion:', err);
            // Show more specific error message if available
            if (err.response && err.response.data && err.response.data.message) {
                toastError(`Failed to delete discussion: ${err.response.data.message}`);
            } else {
                toastError('Failed to delete discussion. Please try again.');
            }
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading discussions...</div>;
    }

    if (error) {
        return <div className="text-center py-8 text-red-500">{error}</div>;
    }

    if (discussions.length === 0) {
        return <div className="text-center py-8 text-gray-500">You haven't created any discussions yet.</div>;
    }

    return (
        <>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="py-3 px-4 text-left font-medium text-sm text-blue-700">Title</th>
                            <th className="py-3 px-4 text-left font-medium text-sm text-blue-700">Content</th>
                            <th className="py-3 px-4 text-center font-medium text-sm text-blue-700">Likes</th>
                            <th className="py-3 px-4 text-center font-medium text-sm text-blue-700">Comments</th>
                            <th className="py-3 px-4 text-center font-medium text-sm text-blue-700">Created</th>
                            <th className="py-3 px-4 text-center font-medium text-sm text-blue-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {discussions.map((discussion) => (
                            <tr key={discussion._id} className="hover:bg-gray-50">
                                <td className="py-3 px-4 text-sm text-gray-800 font-medium">
                                    <div className="max-w-xs truncate" title={discussion.title}>
                                        {truncateHTML(discussion.title, 20)}
                                    </div>
                                </td>

                                <td className="py-3 px-4 text-sm text-gray-600">
                                    <div
                                        className="max-w-xs w-full h-6 overflow-hidden whitespace-nowrap text-ellipsis"
                                        title={discussion.content}
                                        dangerouslySetInnerHTML={{
                                            __html: truncateHTML(
                                                discussion.content || 'This CodeWars contest is sponsored by FunPlus.',
                                                25,
                                            ),
                                        }}
                                    ></div>
                                </td>
                                <td className="py-3 px-4 text-center text-sm text-gray-600">
                                    {discussion.favourite ? discussion.favourite.length : 0}
                                </td>
                                <td className="py-3 px-4 text-center text-sm text-gray-600">{discussion.comments}</td>
                                <td className="py-3 px-4 text-center text-sm text-gray-600">
                                    {new Date(discussion.createdAt).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-4 text-center">
                                    <div className="flex justify-center space-x-2">
                                        <Link
                                            href={`/home/${discussion._id}`}
                                            className="text-blue-500 hover:text-blue-700"
                                            title="View"
                                        >
                                            <Eye size={18} />
                                        </Link>
                                        <button
                                            onClick={() => handleEdit(discussion._id)}
                                            className="text-green-500 hover:text-green-700"
                                            title="Edit"
                                            disabled={isDeleting}
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(discussion._id)}
                                            className="text-red-500 hover:text-red-700"
                                            title="Delete"
                                            disabled={isDeleting}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Discussion Modal */}
            {editingDiscussionId && <EditPage discussionId={editingDiscussionId} onClose={handleCloseEdit} />}
        </>
    );
};

export default MyDiscussions;
