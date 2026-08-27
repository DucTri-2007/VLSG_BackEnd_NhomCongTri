const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8005;

// Tự động copy ảnh QR Code thanh toán nếu tìm thấy
const sourceQR = 'C:\\Users\\DELL\\.gemini\\antigravity-ide\\brain\\12e2a1c5-174f-41a1-8eed-f3490c3e98bb\\qr_code_1786797082352.png';
const targetDir = path.join(__dirname, '../client-customer/public/img');
const targetQR = path.join(targetDir, 'qr.png');

try {
  if (fs.existsSync(sourceQR)) {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    fs.copyFileSync(sourceQR, targetQR);
    console.log('✅ Đã copy thành công mã QR thanh toán vào thư mục client-customer/public/img/qr.png');
  }
} catch (err) {
  console.error('❌ Lỗi tự động sao chép mã QR:', err.message);
}

// Body Parser Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: system-ui, sans-serif; text-align: center; padding: 50px; background-color: #0f111a; color: #fff; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
      <h1 style="color: #00f2fe; margin-bottom: 10px;">🚗 AutoGear Backend API</h1>
      <p style="color: #94a3b8; font-size: 18px; max-width: 600px; line-height: 1.6;">
        Máy chủ API của bạn đang hoạt động bình thường và kết nối thành công với MongoDB Atlas!
      </p>
      <div style="margin-top: 30px; background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; border: 1px solid rgba(102, 252, 241, 0.2); max-width: 500px; text-align: left;">
        <h3 style="margin-top: 0; color: #9d4edd;">🚀 Đường dẫn truy cập giao diện:</h3>
        <ul style="padding-left: 20px; line-height: 1.8;">
          <li><b>Giao diện Admin (Quản trị):</b> Mở cổng <a href="http://localhost:8011" style="color: #00f2fe; text-decoration: none; font-weight: bold;">http://localhost:8011</a> trong trình duyệt.</li>
          <li><b>Giao diện Customer (Mua hàng):</b> Mở cổng <a href="http://localhost:8010" style="color: #00f2fe; text-decoration: none; font-weight: bold;">http://localhost:8010</a> trong trình duyệt.</li>
        </ul>
      </div>
    </div>
  `);
});

app.use('/api/admin', require('./api/admin'));
app.use('/api/customer', require('./api/customer'));

const seedDatabase = require('./utils/SeedData');

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  seedDatabase();
});
