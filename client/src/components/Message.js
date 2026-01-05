import React from 'react';

const Message = ({ message, isOwn }) => {
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`message ${isOwn ? 'own' : ''}`}>
      {!isOwn && (
        <div className="message-avatar">
          {message.sender.avatar || message.sender.username.charAt(0).toUpperCase()}
        </div>
      )}
      
      <div className="message-content">
        {!isOwn && (
          <span className="message-sender">{message.sender.username}</span>
        )}
        <div className="message-bubble">
          <p>{message.content}</p>
        </div>
        <span className="message-time">{formatTime(message.createdAt)}</span>
      </div>
    </div>
  );
};

export default Message;
