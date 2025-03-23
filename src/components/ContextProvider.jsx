'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const ContextGlobal = createContext();

function ContextProvider({ children }) {
    const [socket, setSocket] = useState();

    useEffect(() => {
        const socketInstance = io('http://localhost:8080', {
            withCredentials: true,
        });
        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return <ContextGlobal.Provider value={{ socket: socket }}>{children}</ContextGlobal.Provider>;
}

export default ContextProvider;

export const useSocket = () => {
    return useContext(ContextGlobal).socket;
};
