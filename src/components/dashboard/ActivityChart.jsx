'use client';

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export default function ActivityChart({ username }) {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivityData = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/v1/user/activity/${username}`);
                if (response.data.status === 'success') {
                    const data = response.data.data;
                    setChartData({
                        labels: data.dates,
                        datasets: [
                            {
                                label: 'Problems Solved',
                                data: data.problemsSolved,
                                borderColor: 'rgb(75, 192, 192)',
                                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                tension: 0.3
                            },
                            {
                                label: 'Battles Won',
                                data: data.battlesWon,
                                borderColor: 'rgb(255, 99, 132)',
                                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                                tension: 0.3
                            }
                        ]
                    });
                }
            } catch (error) {
                console.error('Error fetching activity data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (username) {
            fetchActivityData();
        }
    }, [username]);

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top'
            },
            title: {
                display: true,
                text: 'Weekly Activity'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        }
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow animate-pulse">
                <div className="h-[300px] bg-gray-200 rounded"></div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Activity Overview</h2>
            <div className="h-[300px]">
                <Line options={options} data={chartData} />
            </div>
        </div>
    );
}