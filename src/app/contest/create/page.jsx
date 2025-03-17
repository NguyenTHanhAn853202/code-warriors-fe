'use client';

import React, { useState } from 'react';
import axios from 'axios';
import Description from './Description';
import { DatePicker, Input, Select, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

const rankOptions = [
    { label: 'Bronze', value: 'Bronze' },
    { label: 'Silver', value: 'Silver' },
    { label: 'Gold', value: 'Gold' },
    { label: 'Platinum', value: 'Platinum' },
    { label: 'Diamond', value: 'Diamond' },
    { label: 'Master', value: 'Master' },
    { label: 'Grandmaster', value: 'Grandmaster' },
];

const Contest = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [sourceCode, setSourceCode] = useState('');
    const [testCases, setTestCases] = useState([]);
    const [selectedRank, setSelectedRank] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [errors, setErrors] = useState({});

    const handleAddTestCase = () => {
        setTestCases([...testCases, { key: testCases.length, input: '', expectedOutput: '' }]);
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

        if (!title.trim()) newErrors.title = 'Vui lòng nhập tiêu đề';
        if (!description.trim()) newErrors.description = 'Vui lòng nhập mô tả';
        if (!sourceCode.trim()) newErrors.sourceCode = 'Vui lòng nhập source code';
        if (!selectedRank) newErrors.selectedRank = 'Vui lòng chọn rank';

        if (!selectedTime || selectedTime.length !== 2) {
            newErrors.selectedTime = 'Vui lòng chọn thời gian hợp lệ';
        } else {
            const startTime = selectedTime[0].toDate();
            const endTime = selectedTime[1].toDate();

            if (startTime >= endTime) {
                newErrors.selectedTime = 'Thời gian bắt đầu phải trước thời gian kết thúc';
            } else if (startTime < currentDate) {
                newErrors.selectedTime = 'Thời gian bắt đầu phải từ hiện tại trở đi';
            }
        }

        if (testCases.length === 0) {
            newErrors.testCases = 'Vui lòng thêm ít nhất một test case';
        } else {
            testCases.forEach((tc, index) => {
                if (!tc.input.trim() || !tc.expectedOutput.trim()) {
                    newErrors[`testCase-${index}`] = 'Test case không được để trống';
                }
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateFields()) {
            message.error('Vui lòng nhập đầy đủ thông tin!');
            return;
        }

        const requestData = {
            title,
            description,
            difficulty: [selectedRank], // Đúng với JSON mẫu
            startDate: selectedTime[0].toISOString(),
            endDate: selectedTime[1].toISOString(),
            testCases: testCases.map((tc) => ({
                input: tc.input,
                expectedOutput: tc.expectedOutput,
            })),
            source_code: sourceCode,
        };

        try {
            const response = await axios.post('http://localhost:8080/api/v1/contest/createContest', requestData);
            if (response.status === 200) {
                message.success('Thử thách đã được đăng thành công!');
                setTitle('');
                setDescription('');
                setSourceCode('');
                setTestCases([]);
                setSelectedRank(null);
                setSelectedTime(null);
            } else {
                message.error('Có lỗi xảy ra, vui lòng thử lại!');
            }
        } catch (error) {
            console.error('Lỗi khi gửi dữ liệu:', error);
            message.error('Không thể gửi dữ liệu, vui lòng kiểm tra server!');
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto bg-white rounded-lg">
            <h2 className="text-3xl font-normal mb-4 w-full text-center">Đăng thử thách</h2>

            <h3 className="text-xl font-normal mb-2">Nhập Tiêu Đề</h3>
            <Input placeholder="Nhập tiêu đề" value={title} onChange={(e) => setTitle(e.target.value)} size="large" />
            {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}

            <h3 className="text-xl font-normal mt-4 mb-2">Nhập Mô Tả</h3>
            <Description value={description} setValue={setDescription} />
            {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}

            <h3 className="text-xl font-normal mt-4 mb-1">Chọn Rank:</h3>
            <Select
                placeholder="Chọn rank"
                options={rankOptions}
                style={{ width: 300 }}
                size="large"
                onChange={setSelectedRank}
            />
            {errors.selectedRank && <p className="text-red-500 text-sm">{errors.selectedRank}</p>}

            <h3 className="text-xl font-normal mt-4 mb-1">Chọn Thời Gian:</h3>
            <RangePicker showTime style={{ width: 360 }} size="large" onChange={(value) => setSelectedTime(value)} />
            {errors.selectedTime && <p className="text-red-500 text-sm">{errors.selectedTime}</p>}

            <h3 className="text-xl font-normal mt-4 mb-2">Nhập Source Code</h3>
            <Description value={sourceCode} setValue={setSourceCode} />
            {errors.sourceCode && <p className="text-red-500 text-sm">{errors.sourceCode}</p>}

            <h3 className="text-xl font-normal mt-4">Danh Sách Test Cases</h3>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-2" onClick={handleAddTestCase}>
                Thêm Test Case
            </button>
            {errors.testCases && <p className="text-red-500 text-sm">{errors.testCases}</p>}

            <div className="mt-4 space-y-3">
                {testCases.map((testCase, index) => (
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
                            value={testCase.expectedOutput}
                            onChange={(e) => handleEditTestCase(testCase.key, 'expectedOutput', e.target.value)}
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
