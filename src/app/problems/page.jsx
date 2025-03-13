'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheck, FaRegCalendarCheck, FaChevronDown, FaSearch, FaCog, FaRandom } from 'react-icons/fa';
import './page.css';
import TopicFilters from '@/components/problems/TopicFilters';
import FilterBar from '@/components/problems/FilterBar';
import Pagination from '@/components/problems/Pagination';
import ProblemsTable from '@/components/problems/ProblemTable';
import CourseSlider from '@/components/problems/SlideProblemPage';
import AlgorithmType from '@/components/problems/AlgorithmType';

const ProblemList = () => {
    const [algorithmTypes, setAlgorithmTypes] = useState([]);
    const [problems, setProblems] = useState([]);
    const [filteredProblems, setFilteredProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalProblems: 0,
    });
    const [filters, setFilters] = useState({
        difficulty: '',
        title: '',
        page: 1,
        limit: 5,
        algorithmTypes: [],
    });

    useEffect(() => {
        axios
            .get('http://localhost:8080/api/v1/algorithmTypes/viewalgorithmTypes')
            .then((response) => {
                console.log("Tất cả các loại thuật toán:", response.data);
                setAlgorithmTypes(response.data.data);
            })
            .catch((error) => {
                console.error('Error fetching algorithm types:', error);
            });
    }, []);

    // Topic filters
    const topics = [
        { name: 'All Topics', icon: 'list' },
        { name: 'Algorithms', icon: 'network' },
        { name: 'Database', icon: 'database' },
        { name: 'Shell', icon: 'terminal' },
        { name: 'Concurrency', icon: 'threads' },
        { name: 'JavaScript', icon: 'js' },
    ];

    useEffect(() => {
        fetchProblems();
    }, [filters]);
    
    const fetchProblems = async () => {
        setLoading(true);
        try {
            // Tạo URL params cho API call
            const response = await axios.get('http://localhost:8080/api/v1/problems/viewAllProblems', {
                params: {
                    ...filters,
                    algorithmTypes: filters.algorithmTypes.length > 0 ? filters.algorithmTypes.join(',') : undefined,
                },
            });

            console.log('API response:', response.data);
            const problemsData = response.data.problems || [];

            // In cấu trúc chi tiết của bài toán đầu tiên để debug
            if (problemsData.length > 0) {
                console.log('Cấu trúc chi tiết của bài toán đầu tiên:', JSON.stringify(problemsData[0], null, 2));
            }

            console.log('Đang lọc theo thuật toán:', filters.algorithmTypes);

            let filtered = problemsData;

            // Chỉ lọc client-side nếu có lọc thuật toán được chọn
            if (filters.algorithmTypes.length > 0) {
                filtered = problemsData.filter((problem) => {
                    console.log('Kiểm tra bài toán:', problem.title);
                    
                    // Kiểm tra algorithmTypes là mảng các đối tượng
                    if (problem.algorithmTypes && Array.isArray(problem.algorithmTypes)) {
                        console.log('algorithmTypes là mảng:', problem.algorithmTypes);
                        
                        // Trường hợp mảng các đối tượng có thuộc tính name
                        if (problem.algorithmTypes.length > 0 && problem.algorithmTypes[0].name) {
                            const hasMatch = problem.algorithmTypes.some((type) =>
                                filters.algorithmTypes.includes(type.name)
                            );
                            console.log('Kiểm tra theo type.name:', hasMatch);
                            return hasMatch;
                        }
                        
                        // Trường hợp mảng các chuỗi
                        else if (problem.algorithmTypes.length > 0 && typeof problem.algorithmTypes[0] === 'string') {
                            const hasMatch = problem.algorithmTypes.some((type) =>
                                filters.algorithmTypes.includes(type)
                            );
                            console.log('Kiểm tra theo chuỗi thuần:', hasMatch);
                            return hasMatch;
                        }
                    }
                    
                    // Trường hợp algorithmType (không có s) là một đối tượng
                    else if (problem.algorithmType && typeof problem.algorithmType === 'object') {
                        const hasMatch = filters.algorithmTypes.includes(problem.algorithmType.name);
                        console.log('Kiểm tra algorithmType (số ít):', hasMatch);
                        return hasMatch;
                    }
                    
                    // Kiểm tra trường hợp thuật toán được lưu dưới tên khác
                    else if (problem.categories && Array.isArray(problem.categories)) {
                        const hasMatch = problem.categories.some(cat => 
                            filters.algorithmTypes.includes(cat.name || cat)
                        );
                        console.log('Kiểm tra theo categories:', hasMatch);
                        return hasMatch;
                    }
                    
                    return false;
                });
            }

            console.log('Dữ liệu bài toán sau khi lọc:', filtered);
            console.log('Số lượng bài toán sau khi lọc:', filtered.length);
            
            setProblems(filtered);
            setFilteredProblems(filtered);
            
            // Cập nhật pagination
            if (response.data.pagination) {
                setPagination(response.data.pagination);
            } else {
                // Tự tạo pagination nếu API không trả về
                setPagination({
                    currentPage: filters.page,
                    totalPages: Math.ceil(filtered.length / filters.limit),
                    totalProblems: filtered.length
                });
            }
        } catch (error) {
            console.error('Error fetching problems:', error);
            setProblems([]);
            setFilteredProblems([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
            page: key === 'page' ? value : 1, // Reset trang về 1 khi filter thay đổi
        }));
    };

    const handleAlgorithmTypeFilter = (selectedTypes) => {
        console.log("Đã chọn các loại thuật toán:", selectedTypes);
        setFilters((prev) => ({
            ...prev,
            algorithmTypes: selectedTypes,
            page: 1, // Reset to first page when filter changes
        }));
    };

    const getDifficultyColor = (difficulty) => {
        if (!difficulty) return '';

        if (Array.isArray(difficulty)) {
            const level = difficulty[0]?.toLowerCase();
            switch (level) {
                case 'easy':
                    return 'text-green-500';
                case 'medium':
                    return 'text-yellow-500';
                case 'hard':
                    return 'text-red-500';
                default:
                    return '';
            }
        }

        if (typeof difficulty === 'object' && difficulty.name) {
            const level = difficulty.name.toLowerCase();
            switch (level) {
                case 'easy':
                    return 'text-green-500';
                case 'medium':
                    return 'text-yellow-500';
                case 'hard':
                    return 'text-red-500';
                default:
                    return '';
            }
        }

        return '';
    };

    const getAcceptanceRate = (problem) => {
        const id = typeof problem._id === 'string' ? problem._id : String(problem._id);
        const hashCode = id.split('').reduce((a, b) => {
            a = (a << 5) - a + b.charCodeAt(0);
            return a & a;
        }, 0);
        return ((Math.abs(hashCode) % 60) + 15).toFixed(1) + '%';
    };

    const getFrequencyBar = (problem) => {
        const id = typeof problem._id === 'string' ? problem._id : String(problem._id);
        const hashCode = id.split('').reduce((a, b) => {
            a = (a << 5) - a + b.charCodeAt(0);
            return a & a;
        }, 0);

        return (Math.abs(hashCode) % 90) + 10;
    };

    return (
        <div className="container mx-auto px-4 py-6 bg-gray-50">
            <CourseSlider />

            <AlgorithmType
                algorithmType={algorithmTypes}
                loading={loading}
                onFilterSelect={handleAlgorithmTypeFilter}
            />

            <TopicFilters topics={topics} />

            <FilterBar filters={filters} handleFilterChange={handleFilterChange} />

            <div className="mb-4">
                {filters.algorithmTypes.length > 0 && (
                    <div className="bg-blue-50 p-3 rounded-md border border-blue-200 text-blue-800 text-sm">
                        <strong>Filtered by Algorithm Types:</strong> {filters.algorithmTypes.join(', ')}
                    </div>
                )}
            </div>

            <ProblemsTable
                problems={problems}
                loading={loading}
                getDifficultyColor={getDifficultyColor}
                getAcceptanceRate={getAcceptanceRate}
                getFrequencyBar={getFrequencyBar}
            />

            <Pagination pagination={pagination} filters={filters} handleFilterChange={handleFilterChange} />
        </div>
    );
};

export default ProblemList;