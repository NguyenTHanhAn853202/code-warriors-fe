'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheck, FaRegCalendarCheck, FaChevronDown, FaSearch, FaCog, FaRandom } from 'react-icons/fa';
import './page.css';
import TopicFilters from '@/components/problems/TopicFilters';
import FilterBar from '@/components/problems/FilterBar';
import Pagination from '@/components/problems/Pagination';
import ProblemsTable from '@/components/problems/ProblemTable';
import CourseSlider from '@/components/problems/CodingPlatformSlider';
import AlgorithmType from '@/components/problems/AlgorithmType';
import CodingPlatformSlider from '@/components/problems/CodingPlatformSlider';

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
        fetchProblems();
        fetchAlgorithmTypes();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters, problems]);

    const fetchProblems = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8080/api/v1/problems/viewAllProblems', {
                params: {
                    page: filters.page,
                    limit: filters.limit,
                    difficulty: filters.difficulty || undefined,
                    title: filters.title || undefined,
                    userId: localStorage.getItem('userId') || undefined, // Lấy userId từ localStorage hoặc context
                    // algorithmTypes: filters.algorithmTypes.join(',') || undefined, // Nếu backend hỗ trợ lọc theo algorithmTypes
                },
            });
            const allProblems = response.data.problems || [];

            setProblems(allProblems);
            setFilteredProblems(allProblems);
            setPagination({
                currentPage: 1,
                totalPages: Math.ceil(allProblems.length / filters.limit),
                totalProblems: allProblems.length,
            });
        } catch (error) {
            console.error('Error fetching problems:', error);
        } finally {
            setLoading(false);
        }
    };
    const fetchAlgorithmTypes = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/v1/algorithmTypes/ViewalgorithmTypes');
            const allAlgorithmTypes = response.data.data || [];
            setAlgorithmTypes(allAlgorithmTypes);
        } catch (error) {
            console.error('Error fetching algorithm types:', error);
        }
    };

    const applyFilters = () => {
        let filtered = [...problems];

        if (filters.difficulty) {
            filtered = filtered.filter((problem) => {
                const difficulties = problem.difficulty.map((d) => d.name.toLowerCase());
                return difficulties.includes(filters.difficulty.toLowerCase());
            });
        }

        if (filters.title) {
            filtered = filtered.filter((problem) => problem.title.toLowerCase().includes(filters.title.toLowerCase()));
        }

        if (filters.status) {
            filtered = filtered.filter((problem) => {
                const isSolved = problem.isSolved;
                return filters.status === 'Solved' ? isSolved : !isSolved;
            });
        }

        if (filters.algorithmTypes.length > 0) {
            filtered = filtered.filter((problem) => {
                if (problem.algorithmTypes && Array.isArray(problem.algorithmTypes)) {
                    return problem.algorithmTypes.some((type) => filters.algorithmTypes.includes(type.name || type));
                } else if (problem.algorithmType && typeof problem.algorithmType === 'object') {
                    return filters.algorithmTypes.includes(problem.algorithmType.name);
                } else if (problem.categories && Array.isArray(problem.categories)) {
                    return problem.categories.some((cat) => filters.algorithmTypes.includes(cat.name || cat));
                }
                return false;
            });
        }

        const start = (filters.page - 1) * filters.limit;
        const end = start + filters.limit;
        console.log('Filtered problems:', filtered);

        setFilteredProblems(filtered.slice(start, end));
        setPagination({
            currentPage: filters.page,
            totalPages: Math.ceil(filtered.length / filters.limit),
            totalProblems: filtered.length,
        });
    };

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
            page: key === 'page' ? value : 1,
        }));
    };

    const handleAlgorithmTypeFilter = (selectedTypes) => {
        setFilters((prev) => ({
            ...prev,
            algorithmTypes: selectedTypes,
            page: 1,
        }));
    };

    const getDifficultyColor = (difficulty) => {
        if (!difficulty) return '';
        let level;
        if (Array.isArray(difficulty) && difficulty.length > 0) {
            level = difficulty[0].name?.toLowerCase();
        } else if (typeof difficulty === 'object') {
            level = difficulty.name?.toLowerCase();
        } else {
            level = String(difficulty).toLowerCase();
        }

        switch (level) {
            case 'bronze':
                return 'text-orange-500';
            case 'silver':
                return 'text-gray-400';
            case 'gold':
                return 'text-yellow-500';
            case 'platinum':
                return 'text-blue-500';
            default:
                return '';
        }
    };

    return (
        <div className="container mx-auto px-4 py-6 bg-gray-50">
            <CodingPlatformSlider />

            <AlgorithmType
                algorithmType={algorithmTypes}
                loading={loading}
                onFilterSelect={handleAlgorithmTypeFilter}
            />

            <FilterBar filters={filters} handleFilterChange={handleFilterChange} />

            {filters.algorithmTypes.length > 0 && (
                <div className="mb-4 bg-blue-50 p-3 rounded-md border border-blue-200 text-blue-800 text-sm">
                    <strong>Filtered by Algorithm Types:</strong> {filters.algorithmTypes.join(', ')}
                </div>
            )}

            

            <ProblemsTable
                problems={filteredProblems}
                loading={loading}
                getDifficultyColor={getDifficultyColor}
                filteredDifficulty={filters.difficulty}
            />

            <Pagination pagination={pagination} filters={filters} handleFilterChange={handleFilterChange} />
        </div>
    );
};

export default ProblemList;
