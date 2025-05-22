import Chat, { Bubble, useMessages } from '@chatui/core';
import '@chatui/core/dist/index.css';
import { useSocket } from './ContextProvider';
import { useEffect } from 'react';
import { toastInfo } from '@/utils/toasty';

function ChatMatch({ matchId }) {
    const { messages, appendMsg } = useMessages([]);
    const socket = useSocket();

    function handleSend(type, val) {
        if (type === 'text' && val.trim()) {
            appendMsg({
                type: 'text',
                content: { text: val },
                position: 'right',
            });

            socket.emit('send_message_match', {
                matchId,
                message: val.trim(),
            });
        }
    }

    useEffect(() => {
        const handleReceiveMessage = (data) => {
            appendMsg({
                type: 'text',
                content: { text: data?.message || '' },
            });
        };

        if (socket) {
            socket.on('receive_message_match', handleReceiveMessage);
        }
        return () => {
            socket.off('receive_message_match', handleReceiveMessage);
        };
    }, [socket]);

    function renderMessageContent(msg) {
        const { type, content } = msg;
        switch (type) {
            case 'text':
                return <Bubble content={content.text} />;
            default:
                return null;
        }
    }

    return (
        <Chat
            placeholder="Entering your message"
            locale="Send"
            navbar={{ title: 'Chat' }}
            messages={messages}
            renderMessageContent={renderMessageContent}
            onSend={handleSend}
        />
    );
}

export default ChatMatch;
