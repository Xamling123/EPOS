
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
    const [lastMessage, setLastMessage] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const ws = useRef(null);

    useEffect(() => {
        const connect = () => {
            // Derive WS URL from API URL
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
            const wsUrl = apiUrl.replace(/^http/, 'ws').replace(/\/api\/?$/, '/ws/orders/');

            console.log('Connecting to WebSocket:', wsUrl);
            ws.current = new WebSocket(wsUrl);

            ws.current.onopen = () => {
                console.log('WebSocket Connected');
                setIsConnected(true);
            };

            ws.current.onclose = () => {
                console.log('WebSocket Disconnected');
                setIsConnected(false);
                // Reconnect after 3 seconds
                setTimeout(connect, 3000);
            };

            ws.current.onerror = (err) => {
                console.error('WebSocket Error:', err);
                ws.current.close();
            };

            ws.current.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    setLastMessage(message);
                } catch (e) {
                    console.error('Failed to parse WebSocket message:', e);
                }
            };
        };

        connect();

        return () => {
            if (ws.current) {
                ws.current.onclose = null; // Prevent reconnect on unmount
                ws.current.close();
            }
        };
    }, []);

    return (
        <WebSocketContext.Provider value={{ lastMessage, isConnected }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => useContext(WebSocketContext);
