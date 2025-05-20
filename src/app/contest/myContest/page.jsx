'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Trash2, Edit, Plus } from 'lucide-react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Modal, Form, Input, Select, DatePicker, Button, Divider, Row, Col, message } from 'antd';
const { Option } = Select;
const { RangePicker } = DatePicker;
import dayjs from 'dayjs';
import '@ant-design/v5-patch-for-react-19';
import Description from '../create/Description';
import truncateHTML from '@/utils/truncateHTML';

export default function ContestManagementPage() {
    const [contests, setContests] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [descriptions, setDescription] = useState('');
    const [itemsPerPage] = useState(10);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        closed: 0,
        byRank: [],
    });
    const [animatedStats, setAnimatedStats] = useState({
        total: 0,
        active: 0,
        closed: 0,
    });

    const animationRef = useRef(null);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedContest, setSelectedContest] = useState(null);
    const [ranks, setRanks] = useState([]);
    const [form] = Form.useForm();

    useEffect(() => {
        const fetchContests = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/v1/contest/viewAllMyContest', {
                    withCredentials: true,
                });
                const contestsData = response.data.data.contests;
                setContests(contestsData);
                calculateStats(contestsData);
                setDataLoaded(true);
            } catch (error) {
                console.error('Error fetching contests:', error);
            }
        };

        const fetchRanks = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/v1/rank/viewAllRanks');
                setRanks(response.data.data.ranks);
            } catch (error) {
                console.error('Error fetching ranks:', error);
            }
        };
        fetchRanks();
        fetchContests();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!dataLoaded) return;

        let startTime;
        const duration = 1500;

        const startTotal = animatedStats.total;
        const startActive = animatedStats.active;
        const startClosed = animatedStats.closed;

        const targetTotal = stats.total;
        const targetActive = stats.active;
        const targetClosed = stats.closed;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const easeOutQuad = (t) => t * (2 - t);
            const easedProgress = easeOutQuad(progress);

            setAnimatedStats({
                total: Math.floor(startTotal + (targetTotal - startTotal) * easedProgress),
                active: Math.floor(startActive + (targetActive - startActive) * easedProgress),
                closed: Math.floor(startClosed + (targetClosed - startClosed) * easedProgress),
            });

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            }
        };

        animationRef.current = requestAnimationFrame(animate);
    }, [stats, dataLoaded]);

    const calculateStats = (contestsData) => {
        const total = contestsData.length;
        const active = contestsData.filter((contest) => new Date(contest.endDate) > new Date()).length;
        const closed = total - active;

        const rankMap = new Map();
        contestsData.forEach((contest) => {
            const rankName = contest.difficulty?.[0]?.name || 'Unspecified';
            if (!rankMap.has(rankName)) {
                rankMap.set(rankName, 0);
            }
            rankMap.set(rankName, rankMap.get(rankName) + 1);
        });

        const byRank = Array.from(rankMap).map(([name, value]) => ({ name, value }));

        setStats({ total, active, closed, byRank });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this contest?')) return;

        try {
            await axios.delete(`http://localhost:8080/api/v1/contest/deleteContest/${id}`);
            const updatedContests = contests.filter((contest) => contest._id !== id);
            setContests(updatedContests);
            calculateStats(updatedContests);
            message.success('Deleted successfully !');
        } catch (error) {
            console.error('Error deleting contest:', error);
        }
    };

    const showEditModal = (contest) => {
        setSelectedContest(contest);

        const formattedTestCases =
            contest.testCases?.map((testCase) => ({
                input: testCase.input,
                expectedOutput: testCase.expectedOutput,
            })) || [];

        form.setFieldsValue({
            title: contest.title,
            // description: contest.description,
            rank: contest.difficulty?.[0]?._id,
            dateRange: [dayjs(contest.startDate), dayjs(contest.endDate)],
            testCases: formattedTestCases,
        });

        setIsModalOpen(true);
    };

    const handleUpdateContest = async () => {
        try {
            const values = await form.validateFields();
            let updatedDescription = descriptions;

            if (values.testCases && values.testCases.length > 0) {
                const firstTestCase = values.testCases[0];
                const testCaseText = `
<br/>
<b>Example:</b><br/>
<pre>
Input:
${firstTestCase.input}

Expected Output:
${firstTestCase.expectedOutput}
</pre>
            `;
                updatedDescription += testCaseText;
            }
            const updatedData = {
                title: values.title,
                description: updatedDescription,
                difficulty: values.rank,
                startDate: values.dateRange[0].toISOString(),
                endDate: values.dateRange[1].toISOString(),
                sourceCode: values.sourceCode,
                testCases: values.testCases || [],
            };

            const response = await axios.patch(
                `http://localhost:8080/api/v1/contest/updateContest/${selectedContest._id}`,
                updatedData,
            );

            const updatedContests = contests.map((contest) =>
                contest._id === selectedContest._id ? response.data.data.contest : contest,
            );

            setContests(updatedContests);
            calculateStats(updatedContests);
            setIsModalOpen(false);
            message.success('Updated successfully !');
        } catch (error) {
            console.error('Error updating contest:', error);
        }
    };

    const handleEdit = (contest) => {
        showEditModal(contest);
        setDescription(contest.description);
    };

    const getStatus = (startDate, endDate) => {
        return new Date(endDate) > new Date() ? 'Active' : 'Closed';
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentContests = contests.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(contests.length / itemsPerPage);

    // Colors for bar chart
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-gray-100 p-6 rounded-lg mb-8">
                <div className="flex justify-between mb-4">
                    <h1 className="text-2xl font-bold">My Contests</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="col-span-1 md:col-span-3 bg-white p-4 rounded-lg shadow-sm h-64">
                        <h2 className="text-lg font-semibold mb-2">Contest Distribution by Rank</h2>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={stats.byRank}
                                margin={{
                                    top: 5,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => [`${value} contests`, 'Count']} />
                                <Legend
                                    wrapperStyle={{ padding: '15px 15px', fontSize: '14px', letterSpacing: '2px' }}
                                />
                                <Bar dataKey="value" name="Number of Contests" fill="#8884d8" animationDuration={1500}>
                                    {stats.byRank.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="col-span-1 grid grid-cols-1 gap-4">
                        <div className="bg-blue-100 p-4 rounded-lg shadow-sm flex flex-col items-center justify-center transition-all duration-300 hover:shadow-lg hover:bg-blue-200 transform hover:-translate-y-1">
                            <span className="text-blue-800 text-sm font-semibold">Total Contests</span>
                            <div className="relative">
                                <span className="text-blue-900 text-3xl font-bold">{animatedStats.total}</span>
                            </div>
                        </div>
                        <div className="bg-green-100 p-4 rounded-lg shadow-sm flex flex-col items-center justify-center transition-all duration-300 hover:shadow-lg hover:bg-green-200 transform hover:-translate-y-1">
                            <span className="text-green-800 text-sm font-semibold">Active Contests</span>
                            <div className="relative">
                                <span className="text-green-900 text-3xl font-bold">{animatedStats.active}</span>
                            </div>
                        </div>
                        <div className="bg-red-100 p-4 rounded-lg shadow-sm flex flex-col items-center justify-center transition-all duration-300 hover:shadow-lg hover:bg-red-200 transform hover:-translate-y-1">
                            <span className="text-red-800 text-sm font-semibold">Closed Contests</span>
                            <div className="relative">
                                <span className="text-red-900 text-3xl font-bold">{animatedStats.closed}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end mb-10">
                <Link href="/contest/create">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center">
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Contest
                    </button>
                </Link>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left font-medium text-xs text-blue-500 uppercase">
                                    Title
                                </th>
                                <th className="px-6 py-3 text-left font-medium text-xs text-blue-500 uppercase">
                                    Description
                                </th>
                                <th className="px-6 py-3 text-left font-medium text-xs text-blue-500 uppercase">
                                    Rank
                                </th>
                                <th className="px-6 py-3 text-left font-medium text-xs text-blue-500 uppercase">
                                    Test Case
                                </th>
                                <th className="px-6 py-3 text-left font-medium text-xs text-blue-500 uppercase">
                                    Start Date
                                </th>
                                <th className="px-6 py-3 text-left font-medium text-xs text-blue-500 uppercase">
                                    End Date
                                </th>
                                <th className="px-6 py-3 text-left font-medium text-xs text-blue-500 uppercase">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left font-medium text-xs text-blue-500 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentContests.map((contest) => (
                                <tr key={contest._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="max-w-xs truncate" title={contest.title}>
                                            {truncateHTML(contest.title, 15)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div
                                            className="max-w-xs w-full h-6 overflow-hidden whitespace-nowrap text-ellipsis"
                                            title={contest.description}
                                            dangerouslySetInnerHTML={{
                                                __html: truncateHTML(
                                                    contest.description ||
                                                        'This CodeWars contest is sponsored by FunPlus.',
                                                    15,
                                                ),
                                            }}
                                        ></div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{contest.difficulty?.[0]?.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{contest.testCases?.length ?? 0}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {new Date(contest.startDate).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {new Date(contest.endDate).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatus(contest.startDate, contest.endDate) === 'Active' ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'}`}
                                        >
                                            {getStatus(contest.startDate, contest.endDate)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(contest)}
                                            className="text-blue-500 hover:text-blue-700 transition-colors duration-200"
                                        >
                                            <Edit className="w-5 h-5 transform hover:scale-110 transition-transform duration-200" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(contest._id)}
                                            className="text-red-500 hover:text-red-700 transition-colors duration-200"
                                        >
                                            <Trash2 className="w-5 h-5 transform hover:scale-110 transition-transform duration-200" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="px-4 py-3 border-t flex items-center justify-center">
                        <nav className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 rounded-md transition-all duration-200 font-medium flex items-center ${
                                    currentPage === 1
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:shadow-sm'
                                }`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 19l-7-7 7-7"
                                    />
                                </svg>
                                Previous
                            </button>

                            <div className="px-4 py-2 rounded-md bg-gray-50 text-gray-700 font-medium">
                                {currentPage} / {totalPages}
                            </div>

                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className={`px-4 py-2 rounded-md transition-all duration-200 font-medium flex items-center ${
                                    currentPage === totalPages
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:shadow-sm'
                                }`}
                            >
                                Next
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 ml-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </button>
                        </nav>
                    </div>
                )}
            </div>

            {/* Modal cập nhật */}
            <Modal
                title="Update Contest"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={handleUpdateContest}
                width={800}
            >
                <Form form={form} layout="vertical">
                    <Form.Item label="Title" name="title" rules={[{ required: true, message: 'Please enter title!' }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Description">
                        <Description value={descriptions} setValue={setDescription} />
                    </Form.Item>

                    <Form.Item label="Rank" name="rank" rules={[{ required: true, message: 'Please select rank!' }]}>
                        <Select>
                            {ranks.map((rank) => (
                                <Option key={rank._id} value={rank._id}>
                                    {rank.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Time Range"
                        name="dateRange"
                        rules={[{ required: true, message: 'Please select time range!' }]}
                    >
                        <RangePicker showTime format="DD/MM/YYYY HH:mm:ss" style={{ width: '100%' }} />
                    </Form.Item>

                    <Divider orientation="left">Test Cases</Divider>

                    <Form.List name="testCases">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <div
                                        key={key}
                                        style={{
                                            marginBottom: 24,
                                            border: '1px dashed #d9d9d9',
                                            padding: 16,
                                            borderRadius: 8,
                                        }}
                                    >
                                        <Row gutter={16}>
                                            <Col span={11}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'input']}
                                                    label="Input"
                                                    rules={[{ required: true, message: 'Input is required' }]}
                                                >
                                                    <Input.TextArea
                                                        autoSize={{ minRows: 3, maxRows: 6 }}
                                                        style={{ fontFamily: 'monospace' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={11}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'expectedOutput']}
                                                    label="Expected Output"
                                                    rules={[{ required: true, message: 'Expected output is required' }]}
                                                >
                                                    <Input.TextArea
                                                        autoSize={{ minRows: 3, maxRows: 6 }}
                                                        style={{ fontFamily: 'monospace' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col
                                                span={2}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Button
                                                    type="text"
                                                    danger
                                                    icon={<Trash2 size={16} />}
                                                    onClick={() => remove(name)}
                                                    style={{ marginTop: 24 }}
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                ))}

                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<Plus size={16} />}>
                                        Add Test Case
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                </Form>
            </Modal>

            <style jsx global>{`
                @keyframes pulse {
                    0% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.1);
                    }
                    100% {
                        transform: scale(1);
                    }
                }

                .animate-pulse {
                    animation: pulse 1.5s infinite;
                }
                .code-editor {
                    font-family: 'Courier New', monospace;
                    background-color: #f5f5f5;
                }
            `}</style>
        </div>
    );
}
