'use client';
import React, { useState, useEffect, use } from 'react';
import axios from 'axios';
import { FaCheck, FaRegCalendarCheck, FaChevronDown, FaSearch, FaCog, FaRandom } from 'react-icons/fa';
import './page.css';
import CategoryList from '@/components/problems/CategoryList';
import TopicFilters from '@/components/problems/TopicFilters';
import FilterBar from '@/components/problems/FilterBar';
import Pagination from '@/components/problems/Pagination';
import ProblemsTable from '@/components/problems/ProblemTable';
import CourseSlider from '@/components/problems/SlideProblemPage';

const ProblemList = () => {
    const [problems, setProblems] = useState([]);
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
    });

    // Categories mapped to your algorithm types
    const categories = [
        { name: 'Array', count: 1860 },
        { name: 'String', count: 771 },
        { name: 'Hash Table', count: 672 },
        { name: 'Dynamic Programming', count: 571 },
        { name: 'Math', count: 563 },
        { name: 'Sorting', count: 444 },
        { name: 'Greedy', count: 406 },
    ];

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
            const response = await axios.get('http://localhost:8080/api/v1/problems/viewAllProblems', {
                params: filters,
            });

            setProblems(response.data.problems);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Error fetching problems:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
            page: key === 'page' ? value : 1,
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
            <CourseSlider></CourseSlider>

            <CategoryList categories={categories} />

            <TopicFilters topics={topics}></TopicFilters>

            <FilterBar filters={filters} handleFilterChange={handleFilterChange}></FilterBar>

            <ProblemsTable
                problems={problems}
                loading={loading}
                getDifficultyColor={getDifficultyColor}
                getAcceptanceRate={getAcceptanceRate}
                getFrequencyBar={getFrequencyBar}
            ></ProblemsTable>

            <Pagination pagination={pagination} filters={filters} handleFilterChange={handleFilterChange}></Pagination>
        </div>
    );
};

export default ProblemList;
