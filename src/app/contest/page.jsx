'use client'; // Biến component thành Client Component

import React, { useState } from 'react';
import Description from './Description';
import { DatePicker, Select, Typography, Table, Input, Button, Flex } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Title } = Typography;

const rankOptions = [
    { label: 'Bronze', value: 'bronze' },
    { label: 'Silver', value: 'silver' },
    { label: 'Gold', value: 'gold' },
    { label: 'Platinum', value: 'platinum' },
    { label: 'Diamond', value: 'diamond' },
    { label: 'Master', value: 'master' },
    { label: 'Grandmaster', value: 'grandmaster' },
];
const Options = [
    { label: 'Easy', value: 'bronze' },
    { label: 'Silver', value: 'silver' },
    { label: 'Gold', value: 'gold' },
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
    };

    const columns = [
        {
            title: '📥 Input',
            dataIndex: 'input',
            key: 'input',
            render: (text, record) => (
                <Input value={text} onChange={(e) => handleEditTestCase(record.key, 'input', e.target.value)} />
            ),
        },
        {
            title: '📤 Output',
            dataIndex: 'output',
            key: 'output',
            render: (text, record) => (
                <Input value={text} onChange={(e) => handleEditTestCase(record.key, 'output', e.target.value)} />
            ),
        },
        {
            title: '',
            key: 'delete',
            width: 50,
            render: (_, record) => (
                <Button type="text" icon={<DeleteOutlined />} onClick={() => handleDeleteTestCase(record.key)} />
            ),
        },
    ];

    return (
        <div style={{ padding: '20px' }}>
            <Title level={3}>Nhập Tiêu Đề</Title>
            <Input placeholder="Nhập tiêu đề" value={title} onChange={(e) => setTitle(e.target.value)} size="large" />

            <Title level={3} style={{ marginTop: 20 }}>
                Nhập Mô Tả
            </Title>
            <Description onChange={setDescription} />

            <Flex gap="small" align="center" style={{ marginTop: 20 }}>
                <Title level={3}>Chọn Rank:</Title>
                <Select
                    placeholder="Chọn rank"
                    options={rankOptions}
                    style={{ width: 200 }}
                    onChange={setSelectedRank}
                    size="large"
                />
                <Title level={3}>Chọn Mức Độ:</Title>
                <Select
                    placeholder="Chọn mức độ"
                    options={Options}
                    style={{ width: 200 }}
                    onChange={setSelectedDifficulty}
                    size="large"
                />
            </Flex>

            <Flex align="center" gap="small" style={{ marginTop: 20 }}>
                <Title level={3} style={{ marginBottom: 0 }}>
                    Chọn Thời Gian:
                </Title>
                <RangePicker size="large" showTime onChange={(value) => setSelectedTime(value)} />
            </Flex>

            <Title level={3} style={{ marginTop: 20 }}>
                Danh Sách Test Cases
            </Title>
            <Button type="primary" size="large" onClick={handleAddTestCase} style={{ marginBottom: 10 }}>
                Thêm Test Case
            </Button>
            <Table bordered dataSource={testCases} columns={columns} pagination={false} />

            <Flex style={{ marginTop: 20 }}>
                <Button type="primary" size="large" onClick={handleSubmit}>
                    Đăng Thử Thách
                </Button>
            </Flex>
        </div>
    );
};

export default Contest;
