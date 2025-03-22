'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, message, Modal, Form, Input, Select, DatePicker } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const ContestUpdate = () => {
    const [contests, setContests] = useState([]);
    const [ranks, setRanks] = useState([]); // Danh sách rank
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedContest, setSelectedContest] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchContests();
        fetchRanks();
    }, []);

    // Lấy danh sách contest
    const fetchContests = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8080/api/v1/contest/viewAllContest');
            setContests(response.data.data.contests || []);
        } catch (error) {
            message.error('Không thể tải danh sách contest!');
        } finally {
            setLoading(false);
        }
    };

    // Lấy danh sách rank
    const fetchRanks = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/v1/rank/viewAllRanks');
            setRanks(response.data.data.ranks || []);
        } catch (error) {
            message.error('Không thể tải danh sách rank!');
        }
    };

    // Mở modal cập nhật
    const handleEdit = (record) => {
        setSelectedContest(record);
        form.setFieldsValue({
            title: record.title,
            rank: record.difficulty.length > 0 ? record.difficulty[0]._id : undefined,
            dateRange: [dayjs(record.startDate), dayjs(record.endDate)],
        });
        setIsModalOpen(true);
    };

    // Gửi dữ liệu cập nhật
    const handleUpdateContest = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                title: values.title,
                difficulty: values.rank, // Chỉ gửi _id thay vì { _id: values.rank }
                startDate: values.dateRange[0].toISOString(),
                endDate: values.dateRange[1].toISOString(),
            };

            const response = await axios.patch(
                `http://localhost:8080/api/v1/contest/updateContest/${selectedContest._id}`,
                payload,
            );

            if (response.status === 200) {
                message.success(`Contest "${values.title}" đã được cập nhật!`);
                setIsModalOpen(false);
                fetchContests();
            } else {
                message.error('Không thể cập nhật contest!');
            }
        } catch (error) {
            message.error('Cập nhật thất bại, vui lòng thử lại!');
        }
    };

    const columns = [
        { title: 'Tiêu đề', dataIndex: 'title', key: 'title' },
        {
            title: 'Rank',
            dataIndex: 'difficulty',
            key: 'difficulty',
            render: (diff) => diff.map((d) => d.name).join(', '),
        },
        {
            title: 'Ngày bắt đầu',
            dataIndex: 'startDate',
            key: 'startDate',
            render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
        },
        {
            title: 'Ngày kết thúc',
            dataIndex: 'endDate',
            key: 'endDate',
            render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Button type="primary" onClick={() => handleEdit(record)}>
                    Cập nhật
                </Button>
            ),
        },
    ];

    return (
        <div className="p-6 max-w-3xl mx-auto bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-medium text-center mb-4">Danh sách Contest</h2>

            <Table
                dataSource={contests}
                columns={columns}
                rowKey="_id"
                loading={loading}
                pagination={{ pageSize: 5 }}
            />

            {/* Modal cập nhật */}
            <Modal
                title="Cập nhật Contest"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={handleUpdateContest}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Tiêu đề"
                        name="title"
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item label="Rank" name="rank" rules={[{ required: true, message: 'Vui lòng chọn rank!' }]}>
                        <Select>
                            {ranks.map((rank) => (
                                <Option key={rank._id} value={rank._id}>
                                    {rank.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="Chọn ngày"
                        name="dateRange"
                        rules={[{ required: true, message: 'Vui lòng chọn khoảng thời gian!' }]}
                    >
                        <RangePicker showTime format="DD/MM/YYYY HH:mm" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ContestUpdate;
