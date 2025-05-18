'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSearch, FiChevronLeft, FiChevronRight, FiClock } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { motion } from 'framer-motion';
import request from '@/utils/server';
import { Avatar, Button, Card, Input, Table, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const API_URL = 'http://localhost:8080/api/v1';

const RANKS = [
    { name: 'Bronze', minElo: 0, maxElo: 999, badge: '/images/bronze.png' },
    { name: 'Silver', minElo: 1000, maxElo: 1999, badge: '/images/silver.png' },
    { name: 'Gold', minElo: 2000, maxElo: 2999, badge: '/images/gold.png' },
    { name: 'Platinum', minElo: 3000, maxElo: 3999, badge: '/images/platinum.png' },
];

function getRank(elo) {
    console.log('elo:', elo);
    const a = RANKS.find((r) => elo >= r.minElo && elo <= r.maxElo) || {
        name: 'Unranked',
        badge: null,
    };
    console.log(a);

    return (
        RANKS.find((r) => elo >= r.minElo && elo <= r.maxElo) || {
            name: 'Unranked',
            badge: null,
        }
    );
}

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
        totalProblemsSolvedAllUsers: 0,
        newUsersLast15Days: 0,
        totalUsersExcludingAdmin: 0,
    });
    const [rank, setRank] = useState([
        {
            rankName: 'Bronze',
            userCount: 0,
        },
        {
            rankName: 'Silver',
            userCount: 0,
        },
        {
            rankName: 'Gold',
            userCount: 0,
        },
        {
            rankName: 'Platinum',
            userCount: 0,
        },
    ]);

    const columns = [
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
            onFilter: (value, record) => record.email?.toString()?.toLowerCase()?.includes(value?.toLowerCase()),
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
                <div className="px-3 py-1">
                    <Input
                        placeholder="Search username"
                        value={selectedKeys[0]}
                        onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        className="!w-[300] h-[35] !mb-1"
                    />
                    <div className="flex gap-1">
                        <Button onClick={() => confirm()} className="!bg-blue-200 border-none">
                            Search
                        </Button>
                        <Button
                            onClick={() => {
                                setSelectedKeys([]);
                                confirm();
                            }}
                        >
                            Clear
                        </Button>
                    </div>
                </div>
            ),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
            onFilter: (value, record) => record.email?.toString()?.toLowerCase()?.includes(value?.toLowerCase()),
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
                <div className="px-3 py-1">
                    <Input
                        placeholder="Search email"
                        value={selectedKeys[0]}
                        onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        className="!w-[300] h-[35] !mb-1"
                    />
                    <div className="flex gap-1">
                        <Button onClick={() => confirm()} className="!bg-blue-200 border-none">
                            Search
                        </Button>
                        <Button
                            onClick={() => {
                                setSelectedKeys([]);
                                confirm();
                            }}
                        >
                            Clear
                        </Button>
                    </div>
                </div>
            ),
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role) => <Tag color={role === 'admin' ? 'red' : 'blue'}>{role}</Tag>,
            filters: [
                { text: 'User', value: 'user' },
                { text: 'Admin', value: 'admin' },
            ],
            onFilter: (value, record) => record.role === value,
        },
        {
            title: 'XP',
            dataIndex: 'xp',
            key: 'xp',
            sorter: (a, b) => a.xp - b.xp,
            align: 'right',
        },
        {
            title: 'Rank',
            key: 'rank',
            sorter: (a, b) => a.elo - b.elo,
            render: (_, record) => {
                const rank = getRank(record.elo);
                return rank.name;
            },
            filters: RANKS.map((r) => ({ text: r.name, value: r.name })),
            onFilter: (value, record) => getRank(record.elo).name === value,
        },
        {
            title: 'Solved',
            dataIndex: 'problemsSolved',
            key: 'problemsSolved',
            sorter: (a, b) => a.problemsSolved - b.problemsSolved,
            align: 'right',
        },
        {
            title: 'Status',
            key: 'status',
            render: (_, record) => {
                const active = !record.deleted;
                return <Tag color={active ? 'green' : 'volcano'}>{active ? 'Active' : 'Disabled'}</Tag>;
            },
            filters: [
                { text: 'Active', value: true },
                { text: 'Disabled', value: false },
            ],
            onFilter: (value, record) => !record.deleted === value,
        },
        {
            title: 'Joined',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString(),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        },
    ];

    const fetchCountRank = async () => {
        const res = await request.get('/user/getUserforRank');
        if (res.status === 200) {
            console.log(res.data);
            setRank(res.data?.data);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchCountRank();
    }, [pagination.page, search]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/user/getAllUsers`, {
                params: {
                    page: pagination.page,
                    limit: pagination.limit,
                    search,
                },
            });

            if (response.data.status === 'success') {
                const { users, totalProblemsSolvedAllUsers, newUsersLast15Days, totalUsersExcludingAdmin } =
                    response.data.data;

                setUsers(users);
                if (stats)
                    setStats({
                        totalProblemsSolvedAllUsers,
                        newUsersLast15Days,
                        totalUsersExcludingAdmin,
                    });
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

    const COLORS = ['#CD7F32', '#C0C0C0', '#FFD700', '#5D7B6F'];

    return (
        <div className="p-6 max-w-full mx-auto  min-h-screen flex flex-col gap-[30] ">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-200 p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
                    <p className="text-3xl ">{stats.totalUsersExcludingAdmin}</p>
                </div>
                <div className="bg-[#EAE7D6] p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-700">Total Submissions</h3>
                    <p className="text-3xl">{stats.totalProblemsSolvedAllUsers}</p>
                </div>
                <div className="bg-[#D7F9FA] p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-700">New Users</h3>
                    <p className="text-3xl">{stats.newUsersLast15Days}</p>
                </div>
            </div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid gap-6 md:grid-cols-2"
            >
                {/* Biểu đồ cột */}
                <div className="rounded-2xl  p-4 bg-white dark:bg-zinc-900">
                    <h2 className="text-xl font-semibold mb-4 text-center">Number of Users by Rating</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={rank} barCategoryGap={30}>
                            <XAxis dataKey="rankName" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="userCount" name="Số người dùng">
                                {rank.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Biểu đồ tròn */}
                <div className="rounded-2xl  p-4 bg-white dark:bg-zinc-900">
                    <h2 className="text-xl font-semibold mb-4 text-center">User Rate by Rank</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={rank}
                                dataKey="userCount"
                                nameKey="rankName"
                                outerRadius={100}
                                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                            >
                                {rank.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                                ))}
                            </Pie>
                            <Legend verticalAlign="bottom" height={36} />
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
            <div>
                <Table rowKey="_id" columns={columns} dataSource={users} pagination={{ pageSize: 10 }} bordered />
            </div>
        </div>
    );
}
