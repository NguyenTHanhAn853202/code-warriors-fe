'use client';

import request from '@/utils/server';
import React, { useState } from 'react';
import Markdown from 'react-markdown';

export default function Chatbot() {
    const [messages, setMessages] = useState([{ sender: 'bot', text: 'Xin chào! Tôi có thể giúp gì cho bạn?' }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const sendMessage = async () => {
        if (!input.trim()) return;
        const userMessage = { sender: 'user', text: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await request.post('/user/chatbot', {
                text: input,
            });
            setMessages((prev) => [
                ...prev,
                {
                    sender: 'bot',
                    text:
                        <Markdown>{res.data.data.response.candidates[0].content.parts[0].text}</Markdown> ||
                        'Xin lỗi, có lỗi xảy ra.',
                },
            ]);
        } catch (err) {
            setMessages((prev) => [...prev, { sender: 'bot', text: 'Đã xảy ra lỗi khi gọi API.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') sendMessage();
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {isOpen ? (
                <div className="bg-white w-[500] h-[500] shadow-xl rounded-lg flex flex-col overflow-hidden border border-gray-300">
                    <div className="bg-blue-500 text-white p-3 font-bold flex justify-between items-center">
                        <span>💬 Chatbot</span>
                        <button onClick={() => setIsOpen(false)}>✖️</button>
                    </div>
                    <div className="flex-1 p-3 overflow-y-auto space-y-2 text-sm bg-gray-50">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`${
                                    msg.sender === 'user' ? 'text-right text-blue-700' : 'text-left text-gray-700'
                                }`}
                            >
                                <span
                                    className={`inline-block px-3 py-2 rounded-lg ${
                                        msg.sender === 'user' ? 'bg-blue-100' : 'bg-gray-200'
                                    }`}
                                >
                                    {msg.text}
                                </span>
                            </div>
                        ))}
                        {isLoading && <div className="text-left text-gray-400 italic">Đang suy nghĩ...</div>}
                    </div>
                    <div className="p-2 border-t flex">
                        <input
                            type="text"
                            className="flex-1 px-3 py-2 border rounded-l-md focus:outline-none"
                            placeholder="Nhập câu hỏi..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button
                            onClick={sendMessage}
                            className="bg-blue-500 text-white px-4 rounded-r-md hover:bg-blue-600"
                        >
                            Gửi
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-blue-500 text-white rounded-full p-4 shadow-lg hover:bg-blue-600"
                >
                    💬
                </button>
            )}
        </div>
    );
}
