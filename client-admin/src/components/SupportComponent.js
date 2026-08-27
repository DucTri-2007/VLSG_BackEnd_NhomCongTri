import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';

class Support extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      connected: false,
      messages: [
        { system: true, text: '💬 Kênh Hỗ Trợ Trực Tuyến MPS đã sẵn sàng. Đang kết nối với khách hàng...' }
      ],
      inputText: '',
      onlineUsers: []
    };
    this.socket = null;
    this.messagesEndRef = React.createRef();
  }

  componentDidMount() {
    this.initSocket();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.messages.length !== this.state.messages.length) {
      this.scrollToBottom();
    }
  }

  componentWillUnmount() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  initSocket() {
    if (this.socket && this.socket.connected) return;
    if (this.socket && !this.socket.connected) {
      this.socket.connect();
      return;
    }

    const tryConnect = () => {
      if (this.socket && this.socket.connected) return;
      if (window.io) {
        this.socket = window.io('http://localhost:8006', {
          transports: ['polling', 'websocket'],
          reconnection: true,
          reconnectionAttempts: 20,
          reconnectionDelay: 1000
        });

        this.socket.on('connect', () => {
          console.log('✅ Admin Socket connected!');
          this.setState({ connected: true });
          this.socket.emit('join', { 
            username: this.context.username || 'Quản trị viên', 
            role: 'admin' 
          });
        });

        this.socket.on('disconnect', () => {
          console.log('❌ Admin Socket disconnected!');
          this.setState({ connected: false });
        });

        this.socket.on('messageHistory', (history) => {
          if (history && Array.isArray(history) && history.length > 0) {
            this.setState({ messages: history });
          }
        });

        this.socket.on('message', (msg) => {
          this.setState(prevState => ({
            messages: [...prevState.messages, msg]
          }));
        });

        this.socket.on('systemMessage', (sysMsg) => {
          this.setState(prevState => ({
            messages: [...prevState.messages, {
              system: true,
              text: sysMsg.text
            }]
          }));
        });

        this.socket.on('updateUserList', (users) => {
          this.setState({ onlineUsers: users || [] });
        });
      }
    };

    tryConnect();
    if (!this.socket) {
      const interval = setInterval(() => {
        if (window.io) {
          clearInterval(interval);
          tryConnect();
        }
      }, 200);
    }
  }

  scrollToBottom() {
    this.messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  handleSendMessage(e) {
    if (e && e.preventDefault) e.preventDefault();
    const text = this.state.inputText.trim();
    if (!text) return;

    if (this.socket) {
      this.socket.emit('chatMessage', {
        text: text,
        username: this.context.username || 'Quản trị viên',
        role: 'admin'
      });
      this.setState({ inputText: '' });
    }
  }

  render() {
    const { messages, inputText, onlineUsers, connected } = this.state;

    const userListItems = onlineUsers.map((user, idx) => (
      <li 
        key={idx} 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 15px',
          borderBottom: '1px solid #333',
          fontSize: '14px'
        }}
      >
        <span style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: user.role === 'admin' ? '#00f2fe' : '#10b981',
          boxShadow: user.role === 'admin' ? '0 0 8px #00f2fe' : '0 0 8px #10b981'
        }}></span>
        <span style={{ fontWeight: user.role === 'admin' ? 'bold' : '500', color: '#fff' }}>
          {user.username}
        </span>
        <span style={{
          fontSize: '11px',
          fontWeight: 'bold',
          color: user.role === 'admin' ? '#000000' : '#ffffff',
          backgroundColor: user.role === 'admin' ? '#00f2fe' : '#10b981',
          padding: '3px 8px',
          borderRadius: '12px',
          marginLeft: 'auto',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          border: user.role === 'admin' ? '1px solid #00f2fe' : '1px solid #10b981'
        }}>
          {user.role === 'admin' ? 'Admin' : 'Khách'}
        </span>
      </li>
    ));

    const chatMessages = messages.map((msg, idx) => {
      if (msg.system) {
        return (
          <div key={idx} style={{
            alignSelf: 'center',
            fontSize: '12px',
            color: '#aaa',
            backgroundColor: '#333',
            padding: '4px 12px',
            borderRadius: '12px',
            margin: '5px 0'
          }}>
            {msg.text}
          </div>
        );
      }

      const isSelf = msg.role === 'admin';

      return (
        <div 
          key={idx} 
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignSelf: isSelf ? 'flex-end' : 'flex-start',
            maxWidth: '70%',
            marginBottom: '10px',
            alignItems: isSelf ? 'flex-end' : 'flex-start'
          }}
        >
          <span style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '3px', padding: '0 5px' }}>
            {msg.username} ({msg.role === 'admin' ? 'Admin' : 'Khách hàng'})
          </span>
          <div style={{
            padding: '10px 15px',
            borderRadius: '12px',
            fontSize: '13.5px',
            backgroundColor: isSelf ? '#00f2fe' : '#222',
            color: isSelf ? '#000' : '#fff',
            borderTopRightRadius: isSelf ? '2px' : '12px',
            borderTopLeftRadius: isSelf ? '12px' : '2px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
            border: isSelf ? 'none' : '1px solid #444',
            fontWeight: isSelf ? 'bold' : 'normal'
          }}>
            {msg.text}
          </div>
          <span style={{ fontSize: '10px', color: '#777', marginTop: '3px', padding: '0 5px' }}>
            {msg.timestamp}
          </span>
        </div>
      );
    });

    return (
      <div style={{
        display: 'flex',
        gap: '20px',
        height: 'calc(80vh - 50px)',
        backgroundColor: 'rgba(30, 34, 51, 0.6)',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        border: '1px solid rgba(102, 252, 241, 0.15)',
        backdropFilter: 'blur(8px)',
        overflow: 'hidden'
      }}>
        {/* Sidebar: Online users */}
        <div style={{
          width: '280px',
          borderRight: '1px solid #444',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'rgba(15, 17, 26, 0.85)'
        }}>
          <div style={{
            padding: '20px 15px',
            borderBottom: '1px solid #444',
            fontWeight: 'bold',
            color: '#fff'
          }}>
            🟢 ĐANG TRỰC TUYẾN ({onlineUsers.length})
          </div>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            overflowY: 'auto',
            flex: 1
          }}>
            {userListItems}
          </ul>
        </div>

        {/* Chat Pane */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'rgba(30, 34, 51, 0.3)'
        }}>
          {/* Header */}
          <div style={{
            padding: '15px 25px',
            borderBottom: '1px solid #444',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'rgba(15, 17, 26, 0.5)'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#fff' }}>
                💬 Kênh Hỗ Trợ Trực Tuyến
              </h3>
              <span style={{ fontSize: '12px', color: connected ? '#10b981' : '#ef4444' }}>
                {connected ? '● Đã kết nối với dịch vụ chat ho_tro' : '● Mất kết nối'}
              </span>
            </div>
          </div>

          {/* Messages view */}
          <div style={{
            flex: 1,
            padding: '20px 25px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            backgroundColor: 'rgba(8, 9, 12, 0.5)'
          }}>
            {chatMessages}
            <div ref={this.messagesEndRef} />
          </div>

          {/* Input field */}
          <form 
            onSubmit={(e) => this.handleSendMessage(e)}
            style={{
              padding: '15px 25px',
              borderTop: '1px solid #444',
              display: 'flex',
              gap: '12px',
              backgroundColor: 'rgba(15, 17, 26, 0.85)'
            }}
          >
            <input 
              type="text"
              value={inputText}
              onChange={(e) => this.setState({ inputText: e.target.value })}
              placeholder="Nhập tin nhắn trả lời hỗ trợ..."
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #555',
                backgroundColor: '#222',
                color: '#fff',
                outline: 'none',
                fontSize: '14px'
              }}
            />
            <button 
              type="submit"
              style={{
                padding: '0 24px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#00f2fe',
                color: '#000',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Gửi đi
            </button>
          </form>
        </div>
      </div>
    );
  }
}

export default Support;
