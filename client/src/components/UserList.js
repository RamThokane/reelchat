import React from 'react';
import { useAuth } from '../context/AuthContext';

const UserList = ({ users, selectedUser, onSelectUser }) => {
  const { user: currentUser } = useAuth();

  return (
    <div className="user-list">
      <div className="user-list-header">
        <h3>Online Users ({users.length})</h3>
      </div>
      
      <div className="user-list-content">
        {/* General Chat Option */}
        <div 
          className={`user-item ${!selectedUser ? 'active' : ''}`}
          onClick={() => onSelectUser(null)}
        >
          <div className="user-avatar general">🌐</div>
          <div className="user-info">
            <span className="username">General Chat</span>
            <span className="user-status">Public room</span>
          </div>
        </div>

        <div className="user-list-divider">
          <span>Direct Messages</span>
        </div>

        {/* Online Users */}
        {users
          .filter(u => u._id !== currentUser?.id)
          .map(user => (
            <div 
              key={user._id}
              className={`user-item ${selectedUser?._id === user._id ? 'active' : ''}`}
              onClick={() => onSelectUser(user)}
            >
              <div className="user-avatar">
                {user.avatar || user.username.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <span className="username">{user.username}</span>
                <span className="user-status online">● Online</span>
              </div>
            </div>
          ))}
        
        {users.filter(u => u._id !== currentUser?.id).length === 0 && (
          <div className="no-users">
            <p>No other users online</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;
