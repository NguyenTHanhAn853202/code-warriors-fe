import { Table } from 'antd';
import { useEffect, useState } from 'react';
import { useSocket } from '../contexts/SocketContext';

const columns = [
  {
    title: 'Rank',
    dataIndex: 'rank',
    key: 'rank',
    width: '10%',
    render: (_, __, index) => index + 1
  },
  {
    title: 'Player',
    dataIndex: 'username',
    key: 'username',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status) => (
      <span className={
        status === 'Accepted' ? 'text-green-500' : 
        status === 'Wrong Answer' ? 'text-red-500' : 
        'text-yellow-500'
      }>
        {status}
      </span>
    )
  },
  {
    title: 'Score',
    dataIndex: 'score',
    key: 'score',
    sorter: (a, b) => b.score - a.score
  },
  {
    title: 'Time',
    dataIndex: 'time',
    key: 'time',
    render: (time) => `${time}ms`
  },
  {
    title: 'Memory',
    dataIndex: 'memory',
    key: 'memory',
    render: (memory) => `${memory}KB`
  }
];

export default function RoomLeaderboard({ roomId }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const socket = useSocket();

  useEffect(() => {
    if (socket) {
      // Lắng nghe sự kiện có người nộp bài mới
      socket.on('submission_update', (data) => {
        setLeaderboard(prev => {
          const newBoard = [...prev];
          const existingIndex = newBoard.findIndex(p => p.username === data.username);
          
          if (existingIndex !== -1) {
            newBoard[existingIndex] = data;
          } else {
            newBoard.push(data);
          }
          
          return newBoard.sort((a, b) => b.score - a.score || a.time - b.time);
        });
      });

      // Lắng nghe sự kiện kết thúc phòng
      socket.on('finish_room', ({ results }) => {
        setLeaderboard(results.sort((a, b) => b.score - a.score || a.time - b.time));
      });
    }

    return () => {
      if (socket) {
        socket.off('submission_update');
        socket.off('finish_room');
      }
    };
  }, [socket]);

  return (
    <div className="bg-white rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4">Room Rankings</h2>
      <Table 
        columns={columns} 
        dataSource={leaderboard}
        rowKey="username"
        pagination={false}
      />
    </div>
  );
}