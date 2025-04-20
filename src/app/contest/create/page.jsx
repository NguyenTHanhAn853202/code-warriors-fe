'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Description from './Description';
import { DatePicker, Input, Select, message } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import Link from 'next/link';
import '@ant-design/v5-patch-for-react-19';
const { RangePicker } = DatePicker;

const Contest = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [sourceCode, setSourceCode] = useState('');
    const [testCases, setTestCases] = useState([]);
    const [rankOptions, setRankOptions] = useState([]);
    const [selectedRank, setSelectedRank] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Fetch ranks from API
    useEffect(() => {
        const fetchRanks = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/v1/rank/viewAllRanks');
                if (response.status === 200) {
                    const rankData = response.data.data.ranks.map((rank) => ({
                        value: rank.name,
                        label: rank.name,
                    }));
                    setRankOptions(rankData);
                }
            } catch (error) {
                message.error('Cannot load rank list!');
                console.error('Error when getting ranks:', error);
            }
        };

        fetchRanks();
    }, []);

    const handleAddTestCase = () => {
        setTestCases([...testCases, { key: Date.now(), input: '', expectedOutput: '' }]);
    };

    const handleEditTestCase = (key, field, value) => {
        setTestCases((prev) => prev.map((tc) => (tc.key === key ? { ...tc, [field]: value } : tc)));
    };

    const handleDeleteTestCase = (key) => {
        setTestCases((prev) => prev.filter((tc) => tc.key !== key));
    };

    const validateFields = () => {
        const newErrors = {};
        const currentDate = new Date();

        if (!title.trim()) newErrors.title = 'Please enter a title';
        if (!description.trim()) newErrors.description = 'Please enter a description';
        if (!sourceCode.trim()) newErrors.sourceCode = 'Please enter source code';
        if (!selectedRank) newErrors.selectedRank = 'Please select a rank';

        if (!selectedTime || selectedTime.length !== 2) {
            newErrors.selectedTime = 'Please select a valid time';
        } else {
            const startTime = selectedTime[0].toDate();
            const endTime = selectedTime[1].toDate();

            if (startTime >= endTime) {
                newErrors.selectedTime = 'Start time must be before end time';
            } else if (startTime < currentDate) {
                newErrors.selectedTime = 'Start time must be from now onwards';
            }
        }

        if (testCases.length === 0) {
            newErrors.testCases = 'Please add at least one test case';
        } else {
            testCases.forEach((tc, index) => {
                if (!tc.input.trim() || !tc.expectedOutput.trim()) {
                    newErrors[`testCase-${index}`] = 'Test case cannot be empty';
                }
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateFields()) {
            message.error('Please fill in all the information!');
            return;
        }

        setLoading(true);

        const requestData = {
            title,
            description,
            difficulty: [selectedRank],
            startDate: selectedTime[0].toISOString(),
            endDate: selectedTime[1].toISOString(),
            testCases: testCases.map((tc) => ({
                input: tc.input,
                expectedOutput: tc.expectedOutput,
            })),
            source_code: sourceCode,
        };

        try {
            const response = await axios.post('http://localhost:8080/api/v1/contest/createContest', requestData, {
                withCredentials: true,
            });
            if (response.status === 200) {
                message.success('Contest has been posted successfully!');
                setTitle('');
                setDescription('');
                setSourceCode('');
                setTestCases([]);
                setSelectedRank(null);
                setSelectedTime(null);
            } else {
                message.error('An error occurred, please try again!');
            }
        } catch (error) {
            console.error('Error when sending data:', error);
            message.error('Cannot send data, please check the server!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-semibold text-gray-800">Post Contest</h2>
                <Link href="/contest/myContest">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center">
                        List My Contest
                    </button>
                </Link>
            </div>

            <div className="space-y-6">
                {/* Title Section */}
                <div className="form-group">
                    <label className="block text-gray-700 font-medium mb-2">Title</label>
                    <Input
                        placeholder="Enter title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        size="large"
                        className="rounded-lg"
                    />
                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>

                {/* Description Section */}
                <div className="form-group">
                    <label className="block text-gray-700 font-medium mb-2">Description</label>
                    <Description value={description} setValue={setDescription} />
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>

                {/* Rank & Time Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                        <label className="block text-gray-700 font-medium mb-2">Select Rank:</label>
                        <Select
                            placeholder="Select rank"
                            options={rankOptions}
                            value={selectedRank || undefined}
                            style={{ width: '100%' }}
                            size="large"
                            onChange={setSelectedRank}
                            className="rounded-lg"
                        />
                        {errors.selectedRank && <p className="text-red-500 text-sm mt-1">{errors.selectedRank}</p>}
                    </div>

                    <div className="form-group">
                        <label className="block text-gray-700 font-medium mb-2">Select Time:</label>
                        <RangePicker
                            showTime
                            style={{ width: '100%' }}
                            size="large"
                            onChange={(value) => setSelectedTime(value)}
                            className="rounded-lg"
                        />
                        {errors.selectedTime && <p className="text-red-500 text-sm mt-1">{errors.selectedTime}</p>}
                    </div>
                </div>

                {/* Source Code Section */}
                <div className="form-group">
                    <label className="block text-gray-700 font-medium mb-2">Source Code</label>
                    <Description value={sourceCode} setValue={setSourceCode} />
                    {errors.sourceCode && <p className="text-red-500 text-sm mt-1">{errors.sourceCode}</p>}
                </div>

                {/* Test Cases Section */}
                <div className="form-group mt-30">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-gray-700 font-medium">Test Cases List</label>
                        <button
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg transition-colors flex items-center"
                            onClick={handleAddTestCase}
                        >
                            <PlusOutlined className="mr-1" /> Add Test Case
                        </button>
                    </div>
                    {errors.testCases && <p className="text-red-500 text-sm">{errors.testCases}</p>}

                    <div className="mt-2 space-y-3">
                        {testCases.length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed rounded-lg text-gray-500">
                                No test cases yet. Click "Add Test Case" to start.
                            </div>
                        ) : (
                            testCases.map((testCase, index) => (
                                <div key={testCase.key} className="flex gap-2 items-center bg-gray-50 p-3 rounded-lg">
                                    <div className="font-medium text-gray-500 w-8">{index + 1}.</div>
                                    <input
                                        type="text"
                                        className="flex-1 p-2 border rounded-lg"
                                        placeholder="📥 Input"
                                        value={testCase.input}
                                        onChange={(e) => handleEditTestCase(testCase.key, 'input', e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        className="flex-1 p-2 border rounded-lg"
                                        placeholder="📤 Expected Output"
                                        value={testCase.expectedOutput}
                                        onChange={(e) =>
                                            handleEditTestCase(testCase.key, 'expectedOutput', e.target.value)
                                        }
                                    />
                                    <button
                                        className="p-2 text-red-500 hover:text-red-700 transition-colors"
                                        onClick={() => handleDeleteTestCase(testCase.key)}
                                    >
                                        <DeleteOutlined />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    className={`${loading ? 'bg-green-400' : 'bg-green-500 hover:bg-green-600'} text-white px-4 py-3 rounded-lg mt-6 w-full transition-colors font-medium`}
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? 'Processing...' : 'Post Contest'}
                </button>
            </div>
        </div>
    );
};

export default Contest;
