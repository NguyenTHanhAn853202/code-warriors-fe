'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaSearch, FaRandom } from 'react-icons/fa';

const FilterBar = ({ filters, handleFilterChange }) => {
    const [difficultyOpen, setDifficultyOpen] = useState(false);
    const [statusOpen, setStatusOpen] = useState(false);
    const difficultyRef = useRef(null);
    const statusRef = useRef(null);

    const difficultyOptions = ['All', 'Bronze', 'Silver', 'Gold', 'Platinum'];

    const statusOptions = ['All', 'Solved', 'Unsolved'];

    useEffect(() => {
        function handleClickOutside(event) {
            if (difficultyRef.current && !difficultyRef.current.contains(event.target)) {
                setDifficultyOpen(false);
            }
            if (statusRef.current && !statusRef.current.contains(event.target)) {
                setStatusOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="flex flex-wrap gap-2 mb-6 items-center mt-5">
            {/* Difficulty Filter Dropdown */}
            <div className="relative" ref={difficultyRef}>
                <button
                    className="flex items-center px-4 py-2 border rounded-md bg-white"
                    onClick={() => {
                        setDifficultyOpen(!difficultyOpen);
                        setStatusOpen(false);
                    }}
                >
                    Difficulty: {filters.difficulty || 'All'} <FaChevronDown className="ml-2" />
                </button>

                {difficultyOpen && (
                    <div className="absolute top-full left-0 mt-1 z-50 bg-white border rounded-md shadow-lg w-40">
                        {difficultyOptions.map((option) => (
                            <div
                                key={option}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                    handleFilterChange('difficulty', option === 'All' ? '' : option);
                                    setDifficultyOpen(false);
                                }}
                            >
                                {option}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="relative" ref={statusRef}>
                <button
                    className="flex items-center px-4 py-2 border rounded-md bg-white"
                    onClick={() => {
                        setStatusOpen(!statusOpen);
                        setDifficultyOpen(false);
                    }}
                >
                    Status: {filters.status || 'All'} <FaChevronDown className="ml-2" />
                </button>

                {statusOpen && (
                    <div className="absolute top-full left-0 mt-1 z-50 bg-white border rounded-md shadow-lg w-40">
                        {statusOptions.map((option) => (
                            <div
                                key={option}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                    handleFilterChange('status', option === 'All' ? '' : option);
                                    setStatusOpen(false);
                                }}
                            >
                                {option}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Search Box */}
            <div className="flex-grow relative">
                <div className="flex items-center border rounded-md px-3 py-2 bg-white">
                    <FaSearch className="text-gray-400 mr-2" />
                    <input
                        type="text"
                        placeholder="Search questions"
                        className="w-full outline-none"
                        value={filters.title || ''}
                        onChange={(e) => handleFilterChange('title', e.target.value)}
                    />
                </div>
            </div>

            {/* Random Problem Button */}
            <button className="flex items-center bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors">
                <FaRandom className="mr-2" />
                Pick One
            </button>
        </div>
    );
};

export default FilterBar;
