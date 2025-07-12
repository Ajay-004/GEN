import React, { useEffect, useRef } from 'react';
import '../style/ChatWindow.css';

const ChatWindow = ({ messages, isLoading }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="chat-window">
      <div className="chat-messages-container">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-bubble ${msg.sender}-bubble`}>
            <div className="chat-avatar">
              {msg.sender === 'user' ? (
                <i className="fas fa-user"></i>
              ) : (
                <i className="fas fa-robot"></i>
              )}
            </div>
            <div className="chat-content">
              <div className="chat-name">
                {msg.sender === 'user' ? 'You' : 'PicoBot'}
              </div>
              {msg.text && (
                <div className="chat-text">
                  {msg.text.split('\n').map((line, i) => (
                    <div
                      key={i}
                      style={{
                        marginBottom: line.toLowerCase().includes('day')
                          ? '1rem'
                          : '0.25rem',
                      }}
                    >
                      {line}
                    </div>
                  ))}
                </div>
              )}
              {msg.fileData && msg.fileMimeType && (
                <img
                  src={`data:${msg.fileMimeType};base64,${msg.fileData}`}
                  alt="Uploaded content"
                  className="uploaded-image"
                />
              )}
              <span className="timestamp">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="chat-bubble bot-bubble loading">
            <div className="chat-avatar">
              <i className="fas fa-robot"></i>
            </div>
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
