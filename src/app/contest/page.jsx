'use client';

import React, { useState } from 'react';
import Description from './Description';
import { DatePicker, Input, Select } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

const rankOptions = [
    { label: 'Bronze', value: 'bronze' },
    { label: 'Silver', value: 'silver' },
    { label: 'Gold', value: 'gold' },
    { label: 'Platinum', value: 'platinum' },
    { label: 'Diamond', value: 'diamond' },
    { label: 'Master', value: 'master' },
    { label: 'Grandmaster', value: 'grandmaster' },
];

const difficultyOptions = [
    { label: 'Easy', value: 'easy' },
    { label: 'Medium', value: 'medium' },
    { label: 'Hard', value: 'hard' },
];

const Contest = () => {
    const [selectedRank, setSelectedRank] = useState(null);
    const [selectedDifficulty, setSelectedDifficulty] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [testCases, setTestCases] = useState([]);
    const [selectedTime, setSelectedTime] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    const handleAddTestCase = () => {
        setTestCases([...testCases, { key: testCases.length, input: '', output: '' }]);
    };

    const handleEditTestCase = (key, field, value) => {
        setTestCases((prev) => prev.map((tc) => (tc.key === key ? { ...tc, [field]: value } : tc)));
    };

    const handleDeleteTestCase = (key) => {
        setTestCases((prev) => prev.filter((tc) => tc.key !== key));
    };

    const handleSubmit = () => {
        setSubmitted(true);
        console.log(description);
    };

    return (
        <div className="p-6 max-w-3xl mx-auto bg-white  rounded-lg">
            <h2 className="text-3xl font-normal mb-4 w-full text-center">Đăng thử thách</h2>
            <h3 className="text-xl font-normal mb-4">Nhập Tiêu Đề</h3>
            <Input placeholder="Nhập tiêu đề" value={title} onChange={(e) => setTitle(e.target.value)} size="large" />
            <h3 className="text-xl font-normal mt-4 mb-4">Nhập Mô Tả</h3>
            <Description value={description} setValue={setDescription} />

            <div className="flex justify-between">
                <div className="">
                    <h3 className="text-xl font-normal mt-4 mb-1">Chọn Rank:</h3>
                    <Select
                        placeholder="Chọn rank"
                        options={rankOptions}
                        style={{ width: 300 }}
                        onChange={setSelectedRank}
                        size="large"
                    />
                </div>

                <div className="">
                    <h3 className="text-xl font-normal mt-4 mb-1">Chọn Mức Độ:</h3>

                    <Select
                        placeholder="Chọn mức độ"
                        options={difficultyOptions}
                        style={{ width: 300 }}
                        onChange={setSelectedDifficulty}
                        size="large"
                    />
                </div>
            </div>

            <div className="mt-4">
                <h3 className="text-xl font-normal mb-1">Chọn Thời Gian:</h3>
                <RangePicker
                    showTime
                    style={{ width: 360 }}
                    size="large"
                    onChange={(value) => setSelectedTime(value)}
                />
            </div>

            <h3 className="text-xl font-normal mt-4">Danh Sách Test Cases</h3>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-2" onClick={handleAddTestCase}>
                Thêm Test Case
            </button>

            <div className="mt-4 space-y-3">
                {testCases.map((testCase) => (
                    <div key={testCase.key} className="flex gap-2 items-center">
                        <input
                            type="text"
                            className="w-1/2 p-2 border rounded-lg"
                            placeholder="📥 Input"
                            value={testCase.input}
                            onChange={(e) => handleEditTestCase(testCase.key, 'input', e.target.value)}
                        />
                        <input
                            type="text"
                            className="w-1/2 p-2 border rounded-lg"
                            placeholder="📤 Output"
                            value={testCase.output}
                            onChange={(e) => handleEditTestCase(testCase.key, 'output', e.target.value)}
                        />
                        <button className="text-red-500" onClick={() => handleDeleteTestCase(testCase.key)}>
                            <DeleteOutlined />
                        </button>
                    </div>
                ))}
            </div>

            <button className="bg-green-500 text-white px-4 py-2 rounded-lg mt-6 w-full" onClick={handleSubmit}>
                Đăng Thử Thách
            </button>
        </div>
    );
};

export default Contest;
