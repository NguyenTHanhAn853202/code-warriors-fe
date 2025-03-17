'use client';

import { useSocket } from '@/components/ContextProvider';
import { useEffect, useState } from 'react';

function Test() {
    const socket = useSocket();
    const [data, setData] = useState();

    useEffect(() => {
        if (socket) {
            socket.on('found_competitor', (data) => {
                console.log(data);
                if (data) {
                    setData(data);
                }
            });
            socket.on('message', (data) => {
                console.log(data);
            });
        }
    }, [socket]);
    const handelSend = () => {
        socket.emit('find_match', {
            userId: '67c515ad7893bdb73c6a1370',
            rank: 30,
        });
    };

    const handleJoin = () => {
        socket.emit('accept_match', {
            userId: '67c515ad7893bdb73c6a1370',
            matchId: data?.matchId,
            roomId: data?.roomId,
        });
    };

    const handleReject = () => {
        socket.emit('reject_match', {
            userId: '67c515ad7893bdb73c6a1370',
            matchId: data?.matchId,
            roomId: data?.roomId,
        });
    };

    return (
        <div>
            <button onClick={handelSend}>Send</button>
            <p>Match ID: {data?.matchId}</p>
            <button onClick={handleJoin}>Join</button>
            <button onClick={handleReject}>Reject</button>
        </div>
    );
}

export default Test;
