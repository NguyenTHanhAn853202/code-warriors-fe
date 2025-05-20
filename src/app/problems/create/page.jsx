'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Input, Select, message } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import Link from 'next/link';
import '@ant-design/v5-patch-for-react-19';
import Description from '@/app/contest/create/Description';
import { useRouter } from 'next/navigation';
const CreateProblems = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [sourceCode, setSourceCode] = useState('');
    const [testCases, setTestCases] = useState([]);
    const [rankOptions, setRankOptions] = useState([]);
    const [selectedRank, setSelectedRank] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const router = useRouter();

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

    const extractTextFromHtml = (html) => {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || '';
    };

    const validateFields = () => {
        const newErrors = {};

        if (!title.trim()) newErrors.title = 'Please enter a title';
        const plainDescription = extractTextFromHtml(description);
        if (!plainDescription.trim()) newErrors.description = 'Please enter a description';
        if (!selectedRank) newErrors.selectedRank = 'Please select a rank';

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

        let updatedDescription = description;

        if (testCases && testCases.length > 0) {
            const firstTestCase = testCases[0];
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
        setLoading(true);
        const requestData = {
            title,
            description: updatedDescription,
            difficulty: [selectedRank],
            testCases: testCases.map((tc) => ({
                input: tc.input,
                expectedOutput: tc.expectedOutput,
            })),
            source_code: sourceCode,
            author: '',
        };

        try {
            const response = await axios.post('http://localhost:8080/api/v1/problems/createProblems', requestData);
            if (response.status === 200) {
                message.success('Problem created successfully!');
            } else {
                message.error('An error occurred, please try again!');
            }
            router.push('/problems/manageProblems');
        } catch (error) {
            console.error('Error:', error);
            message.error('Failed to send data, please check the server!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-semibold text-gray-800">Post CreateProblems</h2>
                <Link href="/CreateProblems/myCreateProblems">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center">
                        List My CreateProblems
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
                {/* Rank Section */}
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
                {/* Test Cases Section */}
                <div className="form-group mt-6">
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
                                <div key={testCase.key} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg">
                                    <div className="font-medium text-gray-500 w-8 mt-2">{index + 1}</div>
                                    <div className="w-full">
                                        <div className="mb-2">
                                            <label className="block text-gray-700 font-medium">Input</label>
                                            <Input.TextArea
                                                value={testCase.input}
                                                onChange={(e) =>
                                                    handleEditTestCase(testCase.key, 'input', e.target.value)
                                                }
                                                rows={4}
                                                className="rounded-lg"
                                            />
                                        </div>
                                        <div className="mb-2">
                                            <label className="block text-gray-700 font-medium">Expected Output</label>
                                            <Input.TextArea
                                                value={testCase.expectedOutput}
                                                onChange={(e) =>
                                                    handleEditTestCase(testCase.key, 'expectedOutput', e.target.value)
                                                }
                                                rows={4}
                                                className="rounded-lg"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <button
                                            className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                            onClick={() => handleDeleteTestCase(testCase.key)}
                                        >
                                            <DeleteOutlined />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                {/* Submit Button */}
                <div className="mt-6">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg w-full disabled:bg-gray-400 disabled:hover:bg-gray-400 transition-colors"
                    >
                        {loading ? 'Submitting...' : 'Create'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateProblems;
