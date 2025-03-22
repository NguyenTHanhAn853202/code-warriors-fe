'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, message } from 'antd';

const Contest = () => {
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        fetchContests();
    }, []);

    const fetchContests = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8080/api/v1/contest/viewAllContest');
            setContests(response.data.data.contests || []);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách contest:', error);
            message.error('Không thể tải danh sách contest!');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteContest = async (id) => {
        try {
            const response = await axios.delete(`http://localhost:8080/api/v1/contest/deleteContest/${id}`);

            if (response.status === 200) {
                message.success(`Contest "${id}" đã được xóa!`);
                fetchContests();
            } else {
                message.error('Không thể xóa contest!');
            }
        } catch (error) {
            console.error(`Lỗi khi xóa contest "${id}":`, error);
            message.error('Không thể xóa contest, vui lòng kiểm tra server!');
        }
    };

    const columns = [
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Button type="primary" danger onClick={() => handleDeleteContest(record._id)}>
                    Xóa
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
        </div>
    );
};

export default Contest;
