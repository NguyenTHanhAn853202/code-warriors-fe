'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSearch, FiChevronLeft, FiChevronRight, FiClock } from 'react-icons/fi';

const API_URL = 'http://localhost:8080/api/v1';

export default function UserDashboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
    });
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalSubmissions: 0,
        newUsers: 0,
    });

    useEffect(() => {
        fetchUsers();
    }, [pagination.page, search]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/user/getAllUsers`, {
                params: {
                    page: pagination.page,
                    limit: pagination.limit,
                    search: search,
                },
            });

            if (response.data.status === 'success') {
                setUsers(response.data.data.users);
                setPagination(response.data.data.pagination);
                // Update stats if available in response
                if (response.data.data.stats) {
                    setStats(response.data.data.stats);
                }
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setSearch(searchInput);
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    return (
        <div className="p-6 max-w-full mx-auto bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Quản lý người dùng</h1>

            {/* Statistics cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-700">Tổng số người dùng</h3>
                    <p className="text-3xl font-bold text-blue-600">{pagination.total}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-700">Tổng số bài nộp</h3>
                    <p className="text-3xl font-bold text-green-600">{stats.totalSubmissions}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-700">Người dùng mới</h3>
                    <p className="text-3xl font-bold text-purple-600">{stats.newUsers}</p>
                </div>
            </div>

            {/* User table section */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {/* Search bar */}
                <div className="p-4 flex flex-col sm:flex-row justify-between items-center border-b">
                    <h2 className="text-lg font-semibold text-gray-700 mb-2 sm:mb-0">Danh sách người dùng</h2>
                    <div className="flex">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Tìm kiếm người dùng..."
                            className="border rounded-l px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button
                            onClick={handleSearch}
                            className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700"
                        >
                            <FiSearch size={20} />
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tên người dùng
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Số bài đã làm
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ngày tạo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center">
                                        <div className="flex justify-center items-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                        Không tìm thấy người dùng nào
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                    <span className="text-gray-600 font-medium">
                                                        {user.username.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.username}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{user.problemsSolved || 0}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <FiClock size={16} className="mr-1" />
                                                {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button className="text-blue-600 hover:text-blue-900 mr-3">Chi tiết</button>
                                            <button className="text-red-600 hover:text-red-900">Xóa</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t flex justify-between items-center">
                    <div className="text-sm text-gray-700">
                        Hiển thị <span className="font-medium">{users.length}</span> trong tổng số{' '}
                        <span className="font-medium">{pagination.total}</span> người dùng
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                            disabled={pagination.page === 1}
                            className={`px-3 py-1 rounded flex items-center ${
                                pagination.page === 1
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                            }`}
                        >
                            <FiChevronLeft size={16} className="mr-1" />
                            Trước
                        </button>
                        <div className="px-3 py-1 bg-gray-100 rounded">
                            Trang {pagination.page} / {pagination.totalPages}
                        </div>
                        <button
                            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                            disabled={pagination.page === pagination.totalPages}
                            className={`px-3 py-1 rounded flex items-center ${
                                pagination.page === pagination.totalPages
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                            }`}
                        >
                            Sau
                            <FiChevronRight size={16} className="ml-1" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
