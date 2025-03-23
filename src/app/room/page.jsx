'use client';

import { useSocket } from '@/components/ContextProvider';
import fortmantRunTime from '@/utils/fortmatRunTime';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function Room() {
    const [isFindingMatch, setIsFindingMatch] = useState(false);
    const [foundMatch, setFoundMatch] = useState(false);
    const [time, setTime] = useState(0);
    const socket = useSocket();
    const [data, setData] = useState();
    const [countdown, setCountdown] = useState(100);
    const [waitingCompetitor, setWaitingCompetitor] = useState(false);

    const router = useRouter();

    useEffect(() => {
        if (socket) {
            socket.on('found_competitor', (data) => {
                console.log('found_competitor');

                if (data) {
                    setFoundMatch(true);
                    setData(data);
                }
            });
            socket.on('reject_match', (data) => {
                const { success = null } = data;
                if (success) {
                    setWaitingCompetitor(false);
                    setFoundMatch(false);
                }
            });
            socket.on('start_match', (data) => {
                const { matchId, roomId, success } = data;
                // setWaitingCompetitor(false);
                router.push(`/match/${matchId}`);
            });
            socket.on('message', (data) => {
                console.log(data);
            });
        }
    }, [socket]);

    const handleFindMatch = async () => {
        try {
            setIsFindingMatch(true);
            socket.emit('find_match', {});
        } catch (error) {
            console.log(error);
        }
    };

    const handleCancelFindMatch = async () => {
        try {
            setIsFindingMatch(false);
            socket.emit('leave_waiting', {
                matchId: data?.matchId,
                roomId: data?.roomId,
            });
        } catch (error) {}
    };

    const hanleReject = async () => {
        try {
            socket.emit('reject_match', {
                matchId: data?.matchId,
                roomId: data?.roomId,
            });
        } catch (error) {
            console.log(error);
        }
    };

    const handleAccept = async () => {
        try {
            setWaitingCompetitor(true);
            socket.emit('accept_match', {
                matchId: data?.matchId,
                roomId: data?.roomId,
            });
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        let id;
        if (isFindingMatch) {
            id = setInterval(() => {
                setTime((prev) => prev + 1);
            }, 1000);
        } else {
            setTime(0);
        }
        return () => {
            if (id) clearInterval(id);
        };
    }, [isFindingMatch]);

    useEffect(() => {
        let id;
        if (foundMatch) {
            id = setInterval(() => {
                setCountdown((prev) => {
                    if (prev === 0) {
                        setIsFindingMatch(false);
                        socket.emit('reject_match', {
                            matchId: data?.matchId,
                            roomId: data?.roomId,
                        });
                        clearInterval(id);
                    }
                    return prev - 1;
                });
            }, 300);
        } else {
            setIsFindingMatch(false);
            setCountdown(100);
        }
        return () => {
            if (id) clearInterval(id);
        };
    }, [foundMatch]);

    return (
        <div className="bg-[url('/backgroundroom.jpg')] h-screen w-full bg-cover bg-no-repeat ">
            {foundMatch && (
                <div className="fixed z-50 inset-0 flex items-center justify-center bg-transparent bg-opacity-50">
                    <div className="bg-gray-900 border-2 border-yellow-500 rounded-lg shadow-lg p-6 w-96 text-center relative">
                        {/* Icon Checkmark */}
                        <div className="w-12 h-12 mx-auto flex items-center justify-center bg-green-500 rounded-full border-4 border-gray-800 shadow-md">
                            ✔
                        </div>

                        {/* Tiêu đề */}
                        <h2 className="text-xl text-white font-bold mt-4">Match Found</h2>

                        {/* Mô tả */}
                        <p className="text-gray-400 mt-2">
                            {waitingCompetitor
                                ? 'Wating another competitior'
                                : 'The match is ready. Get ready to enter the battle now!'}
                        </p>
                        <div
                            style={{
                                width: waitingCompetitor ? '100%' : countdown + '%',
                            }}
                            className={`h-[4px] rounded-md bg-green-500 my-3`}
                        ></div>
                        {/* Nút vào trận */}
                        {!waitingCompetitor && (
                            <div className="flex gap-10">
                                <button
                                    onClick={hanleReject}
                                    className="mt-4 w-full py-2 text-white font-semibold bg-gradient-to-r from-red-500 to-red-700 rounded-lg shadow-md hover:from-red-400 hover:to-red-600 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAccept}
                                    className="mt-4 w-full py-2 text-white font-semibold bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg shadow-md hover:from-blue-400 hover:to-blue-600 transition-all"
                                >
                                    Accept
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <div className="flex justify-center ">
                <div>
                    <div className="relative w-52 h-[500px] bg-gray-900 border rounded-b-3xl border-gray-700 flex flex-col items-center p-4">
                        {/* Summoner Name */}
                        <div className="mt-10 text-yellow-400 font-bold text-lg">Thanh An</div>

                        {/* Club Name */}
                        <div className="text-gray-400 text-sm">Vàng</div>

                        {/* Rank Icon */}
                        <div className="relative mt-4">
                            <img
                                src="/rank.jpg" // Thay bằng icon của bạn
                                alt="Rank Icon"
                                className="w-[100px] h-[100px]"
                            />
                            <img
                                src="/user_1.jpg" // Thay bằng avatar của bạn
                                alt="Avatar"
                                className="absolute inset-0 w-17 h-17 m-auto rounded-full border-4 border-gray-800"
                            />
                        </div>

                        {/* Role Selection */}
                        {isFindingMatch && (
                            <div className="mt-4">
                                <h4 className="text-gray-400 text-center">Đang tìm trận</h4>
                                <p className="text-center text-yellow-400 font-bold text-lg">{fortmantRunTime(time)}</p>
                            </div>
                        )}

                        {/* Rank Border */}
                    </div>
                    <div className="flex justify-center mt-20">
                        {!isFindingMatch ? (
                            <button
                                onClick={handleFindMatch}
                                className="relative flex items-center bg-gray-800 border-2 border-gray-600 rounded-lg px-10 py-1 text-yellow-500  uppercase tracking-widest  hover:border-yellow-500 transition-all"
                            >
                                <span>CONFIRM</span>
                            </button>
                        ) : (
                            <button
                                onClick={handleCancelFindMatch}
                                className="relative flex items-center bg-gray-800 border-2 border-gray-600 rounded-lg px-10 py-1 text-red-700  uppercase tracking-widest  hover:border-red-700 transition-all"
                            >
                                <span>Cancel</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Room;
