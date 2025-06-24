import React, { useState, useEffect, useRef } from 'react';
import './ChatApp.css';

const ChatApp = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState('');
  const [username, setUsername] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize WebSocket connection
  const connectToServer = () => {
    try {
      const ws = new WebSocket('ws://localhost:7070');
      
      ws.onopen = () => {
        setSocket(ws);
        setIsConnected(true);
        setConnectionStatus('connected');
        console.log('Connected to WebSocket server');
      };

      ws.onmessage = (event) => {
        const messageData = {
          id: Date.now() + Math.random(),
          text: event.data,
          timestamp: new Date().toLocaleTimeString(),
          sender: 'other'
        };
        setMessages(prevMessages => [...prevMessages, messageData]);
      };

      ws.onclose = () => {
        setSocket(null);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        setIsJoined(false);
        console.log('Disconnected from WebSocket server');
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
      };

    } catch (error) {
      console.error('Failed to connect:', error);
      setConnectionStatus('error');
    }
  };

  // Join a chat room
  const handleJoinRoom = () => {
    if (!socket || !currentRoom.trim() || !username.trim()) {
      alert('Please enter both username and room ID');
      return;
    }

    const joinMessage = {
      type: 'join',
      payload: {
        roomId: currentRoom.trim()
      }
    };

    socket.send(JSON.stringify(joinMessage));
    setIsJoined(true);
    setMessages([]);
    
    // Add welcome message
    const welcomeMessage = {
      id: Date.now(),
      text: `Welcome to room: ${currentRoom}`,
      timestamp: new Date().toLocaleTimeString(),
      sender: 'system'
    };
    setMessages([welcomeMessage]);
  };

  // Send chat message
  const handleSendMessage = () => {
    if (!socket || !newMessage.trim() || !isJoined) return;

    const chatMessage = {
      type: 'chat',
      payload: {
        message: `${username}: ${newMessage.trim()}`
      }
    };

    // Add message to local state immediately
    const localMessage = {
      id: Date.now(),
      text: `${username}: ${newMessage.trim()}`,
      timestamp: new Date().toLocaleTimeString(),
      sender: 'self'
    };
    setMessages(prevMessages => [...prevMessages, localMessage]);

    socket.send(JSON.stringify(chatMessage));
    setNewMessage('');
    messageInputRef.current?.focus();
  };

  // Handle Enter key press
  const handleKeyPress = (event, action) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      action();
    }
  };

  // Leave room
  const handleLeaveRoom = () => {
    setIsJoined(false);
    setCurrentRoom('');
    setMessages([]);
  };

  // Disconnect from server
  const handleDisconnect = () => {
    if (socket) {
      socket.close();
    }
    setSocket(null);
    setIsConnected(false);
    setIsJoined(false);
    setMessages([]);
    setConnectionStatus('disconnected');
  };

  const renderConnectionPanel = () => {
    return (
      <div className="connection-panel">
        <div className="connection-card">
          <h2 className="connection-title">Connect to Chat Server</h2>
          <div className="status-indicator">
            <div className={`status-dot ${connectionStatus}`}></div>
            <span className="status-text">
              {connectionStatus === 'connected' ? 'Connected' : 
               connectionStatus === 'error' ? 'Connection Error' : 'Disconnected'}
            </span>
          </div>
          
          {!isConnected ? (
            <button 
              className="connect-btn primary-btn"
              onClick={connectToServer}
            >
              Connect to Server
            </button>
          ) : (
            <div className="join-form">
              <div className="input-group">
                <label className="input-label">Username</label>
                <input
                  type="text"
                  className="chat-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username..."
                  onKeyPress={(e) => handleKeyPress(e, handleJoinRoom)}
                />
              </div>
              
              <div className="input-group">
                <label className="input-label">Room ID</label>
                <input
                  type="text"
                  className="chat-input"
                  value={currentRoom}
                  onChange={(e) => setCurrentRoom(e.target.value)}
                  placeholder="Enter room ID..."
                  onKeyPress={(e) => handleKeyPress(e, handleJoinRoom)}
                />
              </div>
              
              <div className="button-group">
                <button 
                  className="join-btn primary-btn"
                  onClick={handleJoinRoom}
                  disabled={!username.trim() || !currentRoom.trim()}
                >
                  Join Room
                </button>
                <button 
                  className="disconnect-btn secondary-btn"
                  onClick={handleDisconnect}
                >
                  Disconnect
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderChatInterface = () => {
    return (
      <div className="chat-interface">
        <div className="chat-header">
          <div className="room-info">
            <h3 className="room-title">Room: {currentRoom}</h3>
            <span className="username-display">@{username}</span>
          </div>
          <div className="header-actions">
            <button 
              className="leave-btn secondary-btn"
              onClick={handleLeaveRoom}
            >
              Leave Room
            </button>
            <button 
              className="disconnect-btn danger-btn"
              onClick={handleDisconnect}
            >
              Disconnect
            </button>
          </div>
        </div>

        <div className="messages-container">
          <div className="messages-list">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message-item ${message.sender}`}
              >
                <div className="message-content">
                  <span className="message-text">{message.text}</span>
                  <span className="message-time">{message.timestamp}</span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="message-input-container">
          <div className="input-wrapper">
            <input
              ref={messageInputRef}
              type="text"
              className="message-input"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => handleKeyPress(e, handleSendMessage)}
            />
            <button 
              className="send-btn primary-btn"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="chat-app">
      <div className="app-header">
        <h1 className="app-title">ChatApp</h1>
        <p className="app-subtitle">Real-time messaging application</p>
      </div>

      <div className="app-content">
        {!isJoined ? renderConnectionPanel() : renderChatInterface()}
      </div>
    </div>
  );
};

export default ChatApp;