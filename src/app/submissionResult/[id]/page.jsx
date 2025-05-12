import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSocket } from '@/components/ContextProvider'; // Hook để sử dụng socket
import { Spin } from 'antd';

const SubmissionResult = () => {
    const router = useRouter();
    const { id: roomId } = router.query; // Lấy roomId từ URL
    const socket = useSocket(); // Kết nối socket
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (socket && roomId) {
            // Gửi yêu cầu lấy kết quả phòng
            socket.emit('get_room_results', { roomId });

            // Lắng nghe sự kiện trả về kết quả
            socket.on('room_results', (data) => {
                setResults(data.results);
                setLoading(false);
            });

            // Lắng nghe lỗi
            socket.on('error', (message) => {
                console.error('Error:', message);
                setLoading(false);
            });

            // Cleanup khi component unmount
            return () => {
                socket.off('room_results');
                socket.off('error');
            };
        }
    }, [socket, roomId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">
            <h1 className="text-xl font-bold text-center">Room Results</h1>
            <div className="bg-white p-4 shadow-lg rounded-lg">
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 p-2">Player</th>
                            <th className="border border-gray-300 p-2">Status</th>
                            <th className="border border-gray-300 p-2">Grade</th>
                            <th className="border border-gray-300 p-2">Execution Time</th>
                            <th className="border border-gray-300 p-2">Memory Usage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((result, index) => (
                            <tr key={index}>
                                <td className="border border-gray-300 p-2">{result.username}</td>
                                <td className="border border-gray-300 p-2">
                                    {result.grade !== null ? 'Submitted' : 'Waiting'}
                                </td>
                                <td className="border border-gray-300 p-2">
                                    {result.grade !== null ? result.grade : '-'}
                                </td>
                                <td className="border border-gray-300 p-2">
                                    {result.executionTime !== null ? `${result.executionTime} ms` : '-'}
                                </td>
                                <td className="border border-gray-300 p-2">
                                    {result.memoryUsage !== null ? `${result.memoryUsage} KB` : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SubmissionResult;