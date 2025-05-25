'use client';

import request from '@/utils/server';
import { toastInfo } from '@/utils/toasty';
import { Table } from 'antd';
import { use, useEffect, useState } from 'react';

export default function ContestListPage({ params }) {
    const { id } = use(params);
    const [data, setData] = useState([]);
    useEffect(() => {
        (async () => {
            const response = await request.get('/leaderboard/' + id);
            if (response.status !== 200) {
                toastInfo('Failed to fetch leaderboard data');
                return;
            }
            console.log(response.data.data);
            const newData = response.data.data;
            let arr = [];
            for (let i = 0; i < newData.length; i++) {
                arr.push({ ...newData[i], ...newData[i].user });
            }
            setData(arr);
        })();
    }, []);
    const defaultRanks = [
        { name: 'Bronze', minElo: 0, maxElo: 999, badge: 'bronze.png' },
        { name: 'Silver', minElo: 1000, maxElo: 1999, badge: 'silver.png' },
        { name: 'Gold', minElo: 2000, maxElo: 2999, badge: 'gold.png' },
        { name: 'Platinum', minElo: 3000, maxElo: 3999, badge: 'platinum.png' },
    ];

    // Hàm tính tên rank từ elo
    const getRankName = (elo) => {
        const rank = defaultRanks.find((r) => elo >= r.minElo && elo <= r.maxElo);
        return rank ? rank.name : 'Legend'; // Nếu trên Platinum
    };

    // Dữ liệu ví dụ

    const columns = [
        {
            title: 'Rank',
            key: 'rank',
            render: (_text, _record, index) => <span>{index + 1}</span>,
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Time',
            dataIndex: 'time',
            key: 'time',
        },
        {
            title: 'Memory',
            dataIndex: 'memory',
            key: 'memory',
        },
        {
            title: 'Score',
            dataIndex: 'score',
            key: 'score',
        },
        {
            title: 'Rank',
            key: 'elo',
            render: (_, record) => <span>{getRankName(record.elo)}</span>,
        },
        {
            title: 'Created At',
            key: 'createdAt',
            render: (_, record) => {
                const date = new Date(record.createdAt);
                return <span>{date.toLocaleString()}</span>;
            },
        },
    ];

    return (
        <div className="flex gap-5 flex-col mt-5">
            <h1 className="font-bold text-2xl">Submission List</h1>
            <Table columns={columns} dataSource={data.map((u) => ({ ...u, key: u._id }))} pagination={true} />
        </div>
    );
}
