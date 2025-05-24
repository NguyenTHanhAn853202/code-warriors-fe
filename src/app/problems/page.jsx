'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './page.css';
import FilterBar from '@/components/problems/FilterBar';
import Pagination from '@/components/problems/Pagination';
import ProblemsTable from '@/components/problems/ProblemTable';
import AlgorithmType from '@/components/problems/AlgorithmType';
import CodingPlatformSlider from '@/components/problems/CodingPlatformSlider';

const ProblemList = () => {
    const [algorithmTypes, setAlgorithmTypes] = useState([]);
    const [problems, setProblems] = useState([]);
    const [displayedProblems, setDisplayedProblems] = useState([]);
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
        limit: 10,
        algorithmTypes: [],
        status: '',
    });

    useEffect(() => {
        fetchAlgorithmTypes();
    }, []);

    useEffect(() => {
        fetchProblems();
    }, [filters.page, filters.limit, filters.difficulty, filters.title]);

    useEffect(() => {
        applyClientSideFilters();
    }, [filters.algorithmTypes, filters.status, problems]);

    const fetchProblems = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8080/api/v1/problems/viewAllProblems', {
                params: {
                    page: filters.page,
                    limit: filters.limit,
                    difficulty: filters.difficulty || undefined,
                    title: filters.title || undefined,
                    userId: localStorage.getItem('userId') || undefined,
                },
            });
            
            const responseData = response.data;
            setProblems(responseData.problems || []);
            
            if (filters.algorithmTypes.length === 0 && !filters.status) {
                setDisplayedProblems(responseData.problems || []);
            }
            
            setPagination(responseData.pagination || {
                currentPage: 1,
                totalPages: 1,
                totalProblems: 0,
            });
        } catch (error) {
            console.error('Error fetching problems:', error);
            setProblems([]);
            setDisplayedProblems([]);
            setPagination({
                currentPage: 1,
                totalPages: 1,
                totalProblems: 0,
            });
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

    const applyClientSideFilters = () => {
        let filtered = [...problems];

        if (filters.algorithmTypes.length === 0 && !filters.status) {
            setDisplayedProblems(problems);
            return;
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
                    return problem.algorithmTypes.some((type) => 
                        filters.algorithmTypes.includes(type.name || type)
                    );
                } else if (problem.algorithmType && typeof problem.algorithmType === 'object') {
                    return filters.algorithmTypes.includes(problem.algorithmType.name);
                } else if (problem.categories && Array.isArray(problem.categories)) {
                    return problem.categories.some((cat) => 
                        filters.algorithmTypes.includes(cat.name || cat)
                    );
                }
                return false;
            });
        }

        console.log('Client-side filtered problems:', filtered);
        setDisplayedProblems(filtered);
    };

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
            page: ['difficulty', 'title'].includes(key) ? 1 : (key === 'page' ? value : prev.page),
        }));
    };

    const handleAlgorithmTypeFilter = (selectedTypes) => {
        setFilters((prev) => ({
            ...prev,
            algorithmTypes: selectedTypes,
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
                problems={displayedProblems}
                loading={loading}
                getDifficultyColor={getDifficultyColor}
                filteredDifficulty={filters.difficulty}
                currentPage={pagination.currentPage}
                limit={filters.limit}
            />

            <Pagination 
                pagination={pagination} 
                filters={filters} 
                handleFilterChange={handleFilterChange} 
            />
        </div>
    );
};

export default ProblemList;