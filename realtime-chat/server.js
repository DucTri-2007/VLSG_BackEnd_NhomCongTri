const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['polling', 'websocket'],
  pingTimeout: 60000,
  pingInterval: 25000
});

let PORT = process.env.PORT || 8006;
let onlineUsers = [];
let messageHistory = [];

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.io real-time support engine
io.on('connection', (socket) => {
  console.log(`⚡ Kết nối mới: ${socket.id}`);

  // Send current message history & online users immediately on connection
  socket.emit('messageHistory', messageHistory);
  socket.emit('updateUserList', onlineUsers);

  // User join event
  socket.on('join', (data) => {
    socket.username = (data && data.username) ? data.username : 'Khách hàng';
    socket.role = (data && data.role) ? data.role : 'customer';

    // Remove old entry if same socket exists
    onlineUsers = onlineUsers.filter(u => u.id !== socket.id);
    onlineUsers.push({
      id: socket.id,
      username: socket.username,
      role: socket.role
    });

    console.log(`👤 ${socket.username} (${socket.role}) đã kết nối.`);

    // Broadcast updated user list to everyone
    io.emit('updateUserList', onlineUsers);

    // Broadcast system message
    io.emit('systemMessage', {
      text: `${socket.username} (${socket.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}) đã vào kênh tư vấn.`
    });
  });

  // Chat message event (accepts string or object)
  socket.on('chatMessage', (data) => {
    let text = typeof data === 'string' ? data : (data && data.text ? data.text : '');
    if (!text || !text.trim()) return;

    const msgObj = {
      id: socket.id + '_' + Date.now(),
      username: (typeof data === 'object' && data.username) ? data.username : (socket.username || 'Khách hàng'),
      role: (typeof data === 'object' && data.role) ? data.role : (socket.role || 'customer'),
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    console.log(`💬 [${msgObj.role.toUpperCase()}] ${msgObj.username}: ${msgObj.text}`);

    // Store in history buffer (max 50)
    messageHistory.push(msgObj);
    if (messageHistory.length > 50) messageHistory.shift();

    // Broadcast message to ALL connected clients (Admin and Customers)
    io.emit('message', msgObj);
  });

  // Disconnect event
  socket.on('disconnect', () => {
    console.log(`❌ ${socket.username || socket.id} đã rời kênh.`);
    onlineUsers = onlineUsers.filter(u => u.id !== socket.id);
    
    io.emit('updateUserList', onlineUsers);
    if (socket.username) {
      io.emit('systemMessage', {
        text: `${socket.username} đã tạm rời khỏi kênh tư vấn.`
      });
    }
  });
});

function startServer(portToUse) {
  server.listen(portToUse, () => {
    console.log(`🚀 Máy chủ Realtime Chat MPS đang chạy trên cổng ${portToUse}`);
    console.log(`👉 Truy cập giao diện chat tại: http://localhost:${portToUse}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ Cổng ${portToUse} đang bận, chuyển sang cổng dự phòng ${portToUse + 1}...`);
      startServer(portToUse + 1);
    } else {
      console.error('❌ Lỗi máy chủ chat:', err.message);
    }
  });
}

startServer(PORT);
