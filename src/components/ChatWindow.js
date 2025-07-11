import React, { useEffect, useRef } from 'react';
import '../style/ChatWindow.css';
// Assuming you have Font Awesome installed for icons, or use local images/SVGs
// import '@fortawesome/fontawesome-free/css/all.min.css'; 

const ChatWindow = ({ messages, isLoading }) => {
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    return (
        <div className="chat-window">
            <div className="chat-messages-container">
                {messages.map((msg, index) => (
                    // Use chat-bubble and dynamic class for sender (user or bot)
                    <div key={index} className={`chat-bubble ${msg.sender}-bubble`}> 
                        {/* Avatar based on sender */}
                        <div className="chat-avatar">
                            {msg.sender === 'user' ? (
                                <i className="fas fa-user"></i> // User icon
                            ) : (
                                <i className="fas fa-robot"></i> // Bot icon
                            )}
                        </div>
                        {/* Message content wrapper */}
                        <div className="chat-content">
                            {/* Sender's Name */}
                            <div className="chat-name">
                                {msg.sender === 'user' ? 'You' : 'PicoBot'}
                            </div>
                            {/* Message text */}
                            {msg.text && <div className="chat-text"><p>{msg.text}</p></div>} 
                            {/* Uploaded file/image */}
                            {msg.fileData && msg.fileMimeType && (
                                <img
                                    src={`data:${msg.fileMimeType};base64,${msg.fileData}`}
                                    alt="Uploaded content"
                                    className="uploaded-image"
                                />
                            )}
                            {/* Timestamp */}
                            <span className="timestamp">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="chat-bubble bot-bubble loading"> {/* Align loading spinner with bot messages */}
                        <div className="chat-avatar"><i className="fas fa-robot"></i></div> {/* Optional: Add bot avatar to loading bubble */}
                        <div className="chat-content">
                            <div className="chat-name">PicoBot</div>
                            <div className="chat-text">
                                <div className="loading-spinner"></div>
                                <span>PicoBot is typing...</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
};

export default ChatWindow;