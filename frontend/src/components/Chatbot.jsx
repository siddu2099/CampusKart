import React, { useState, useRef, useEffect } from 'react';
import api from '../api/axios';
import './Chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hi! I'm your CampusKart AI Assistant. How can I help you today?", isUser: false }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const toggleChat = () => setIsOpen(!isOpen);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input.trim();
        setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
        setInput('');
        setIsLoading(true);

        try {
            // The custom api instance automatically handles the base URL
            const response = await api.post('/chat', {
                message: userMessage
            });

            setMessages(prev => [...prev, { text: response.data.reply, isUser: false }]);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting right now. Please try again later.", isUser: false }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chatbot-container">
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <h3>AI Assistant</h3>
                        <button className="close-btn" onClick={toggleChat}>&times;</button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.isUser ? 'user-message' : 'bot-message'}`}>
                                {msg.text}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message bot-message loading">
                                <span className="dot"></span>
                                <span className="dot"></span>
                                <span className="dot"></span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chatbot-input-area" onSubmit={sendMessage}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask me anything..."
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading || !input.trim()}>
                            Send
                        </button>
                    </form>
                </div>
            )}

            {!isOpen && (
                <button className="chatbot-toggle-btn" onClick={toggleChat}>
                    💬 Chat
                </button>
            )}
        </div>
    );
};

export default Chatbot;
