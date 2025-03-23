'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Trash2, Edit, Plus } from 'lucide-react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer ,Cell} from 'recharts';
import { Modal, Form, Input, Select, DatePicker } from 'antd';
const { Option } = Select;
const { RangePicker } = DatePicker;
import dayjs from 'dayjs';

export default function ContestManagementPage() {
  const [contests, setContests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    closed: 0,
    byRank: []
  });
  const [animatedStats, setAnimatedStats] = useState({
    total: 0,
    active: 0,
    closed: 0
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
        const response = await axios.get('http://localhost:8080/api/v1/contest/viewAllContest');
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
        closed: Math.floor(startClosed + (targetClosed - startClosed) * easedProgress)
      });
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  }, [stats, dataLoaded]);

  const calculateStats = (contestsData) => {
    const total = contestsData.length;
    const active = contestsData.filter(contest => new Date(contest.endDate) > new Date()).length;
    const closed = total - active;
    
    const rankMap = new Map();
    contestsData.forEach(contest => {
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
    if (!window.confirm("Are you sure you want to delete this contest?")) return;
  
    try {
      await axios.delete(`http://localhost:8080/api/v1/contest/deleteContest/${id}`);
      const updatedContests = contests.filter((contest) => contest._id !== id);
      setContests(updatedContests);
      calculateStats(updatedContests);
    } catch (error) {
      console.error("Error deleting contest:", error);
    }
  };

  const showEditModal = (contest) => {
    setSelectedContest(contest);
    form.setFieldsValue({
      title: contest.title,
      description: contest.description,
      rank: contest.difficulty?.[0]?._id,
      dateRange: [
        dayjs(contest.startDate), 
        dayjs(contest.endDate)
      ]
    });
    
    setIsModalOpen(true);
  };

  const handleUpdateContest = async () => {
    try {
      const values = await form.validateFields();
      const updatedData = {
        title: values.title,
        description: values.description,
        difficulty: values.rank,
        startDate: values.dateRange[0].toISOString(),
        endDate: values.dateRange[1].toISOString()
      };
    
      const response = await axios.patch(
        `http://localhost:8080/api/v1/contest/updateContest/${selectedContest._id}`, 
        updatedData
      );
      const updatedContests = contests.map((contest) => 
        contest._id === selectedContest._id ? response.data.data.contest : contest
      );
      
      setContests(updatedContests);
      calculateStats(updatedContests);
      setIsModalOpen(false);
      alert("Contest updated successfully!");
    } catch (error) {
      console.error("Error updating contest:", error);
    }
  };
  const handleEdit = (contest) => {
    showEditModal(contest);
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
                  wrapperStyle={{ padding: "15px 15px", fontSize: "14px", letterSpacing: "2px" }} 
                />
                <Bar dataKey="value" name="Number of Contests" fill="#8884d8" animationDuration={1500} >
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
                <span className="absolute -top-8.5 -right-30 text-xs bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {stats.total > 0 ? "📝" : ""}
                </span>
              </div>
            </div>
            <div className="bg-green-100 p-4 rounded-lg shadow-sm flex flex-col items-center justify-center transition-all duration-300 hover:shadow-lg hover:bg-green-200 transform hover:-translate-y-1">
              <span className="text-green-800 text-sm font-semibold">Active Contests</span>
              <div className="relative">
                <span className="text-green-900 text-3xl font-bold">{animatedStats.active}</span>
                {stats.active > 0 && (
                  <span className="absolute -top-8.5 -right-30 text-xs bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {stats.active > 0 ? "✅" : ""}
                  </span>
                )}
              </div>
            </div>
            <div className="bg-red-100 p-4 rounded-lg shadow-sm flex flex-col items-center justify-center transition-all duration-300 hover:shadow-lg hover:bg-red-200 transform hover:-translate-y-1">
              <span className="text-red-800 text-sm font-semibold">Closed Contests</span>
              <div className="relative">
                <span className="text-red-900 text-3xl font-bold">{animatedStats.closed}</span>
                {stats.closed > 0 && (
                  <span className="absolute -top-8.5 -right-32 text-xs bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {stats.closed > 0 ? "🔒" : ""}
                  </span>
                )}
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
                <th className="px-6 py-3 text-left font-medium text-xs text-blue-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left font-medium text-xs text-blue-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left font-medium text-xs text-blue-500 uppercase">Rank</th>
                <th className="px-6 py-3 text-left font-medium text-xs text-blue-500 uppercase">Start Date</th>
                <th className="px-6 py-3 text-left font-medium text-xs text-blue-500 uppercase">End Date</th>
                <th className="px-6 py-3 text-left font-medium text-xs text-blue-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left font-medium text-xs text-blue-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentContests.map((contest) => (
                <tr key={contest._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="max-w-xs truncate" title={contest.title}>
                      {contest.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="max-w-xs truncate" title={contest.description}>
                      {contest.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{contest.difficulty?.[0]?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(contest.startDate).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(contest.endDate).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatus(contest.startDate, contest.endDate) === 'Active' ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'}`}>
                      {getStatus(contest.startDate, contest.endDate)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap flex space-x-2">
                    <button onClick={() => handleEdit(contest)} className="text-blue-500 hover:text-blue-700 transition-colors duration-200">
                      <Edit className="w-5 h-5 transform hover:scale-110 transition-transform duration-200" />
                    </button>
                      <button onClick={() => handleDelete(contest._id)} className="text-red-500 hover:text-red-700 transition-colors duration-200">
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
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md transition-all duration-200 font-medium flex items-center ${
                currentPage === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:shadow-sm'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            
            <div className="px-4 py-2 rounded-md bg-gray-50 text-gray-700 font-medium">
              {currentPage} / {totalPages}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md transition-all duration-200 font-medium flex items-center ${
                currentPage === totalPages 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:shadow-sm'
              }`}
            >
              Next
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="title"
                        name="title"
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
                    >
                        <Input />
                        
                    </Form.Item>
                    <Form.Item
                        label="Description"
                        name="description"
                        rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
                    >
                         <Input.TextArea autoSize={{ minRows: 3, maxRows: 9 }} style={{ fontSize: "14px" }} />
                        
                    </Form.Item>
                    <Form.Item label="Rank" name="rank" rules={[{ required: true, message: 'Vui lòng chọn rank!' }]}>
                        <Select>
                            {ranks.map((rank) => (
                                <Option key={rank._id} value={rank._id}>
                                    {rank.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="Chọn ngày"
                        name="dateRange"
                        rules={[{ required: true, message: 'Vui lòng chọn khoảng thời gian!' }]}
                    >
                        <RangePicker showTime format="DD/MM/YYYY HH:mm" />
                    </Form.Item>
                </Form>
            </Modal>

      <style jsx global>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        .animate-pulse {
          animation: pulse 1.5s infinite;
        }
      `}</style>
    </div>
  );
}