import React, { Component } from 'react';

class About extends Component {
  render() {
    return (
      <div className="fade-in" style={{ maxWidth: '950px', margin: '30px auto', padding: '35px', backgroundColor: '#ffffff', border: '2px solid #000000', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#ff0000', fontWeight: '900', fontSize: '28px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
            📖 CÂU CHUYỆN THƯƠNG HIỆU - MPS AUTOGEAR
          </h1>
          <p style={{ color: '#000000', fontSize: '15px', fontWeight: 'bold', maxWidth: '750px', margin: '0 auto', lineHeight: '1.6' }}>
            Hành trình từ niềm đam mê xe máy đến Hệ thống phân phối phụ tùng xe chính hãng số 1 Việt Nam.
          </p>
        </div>

        {/* Story Section */}
        <div style={{ backgroundColor: '#fff5f5', padding: '25px', borderRadius: '14px', border: '2px solid #ff0000', marginBottom: '30px', color: '#000000', fontSize: '14.5px', lineHeight: '1.8', fontWeight: '500' }}>
          <h3 style={{ color: '#ff0000', fontWeight: '900', fontSize: '18px', marginBottom: '12px' }}>
            🏁 Khởi Nguồn Niềm Đam Mê (Năm 2018)
          </h3>
          <p style={{ marginBottom: '12px' }}>
            Thành lập vào năm 2018 bởi một nhóm các kỹ sư và biker đầy tâm huyết, <strong>MPS AutoGear</strong> ra đời với một sứ mệnh duy nhất: <i>"Xóa tan nỗi lo phụ tùng giả, mang phụ tùng chính hãng chất lượng cao đến tay mọi chủ xe Việt."</i>
          </p>
          <p style={{ marginBottom: '12px' }}>
            Khởi đầu từ một tiệm phụ tùng nhỏ, MPS đã từng bước chinh phục niềm tin của hàng trăm ngàn khách hàng nhờ sự minh bạch 100% về nguồn gốc xuất xứ sản phẩm từ <strong>Honda, Yamaha, Suzuki, Vespa, Ohlins, Bando, NGK, Motul...</strong>
          </p>
          <p style={{ margin: 0 }}>
            Đến nay, MPS AutoGear tự hào phục vụ hơn <strong>500.000 biker trên khắp 63 tỉnh thành</strong>, tích hợp công nghệ Ví MPS Wallet, Thanh toán QR Code tự động và chăm sóc khách hàng 24/7.
          </p>
        </div>

        {/* 4 Core Pillars */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '30px' }}>
          <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '2px solid #000000', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🛡️</div>
            <h4 style={{ color: '#ff0000', fontWeight: '900', fontSize: '15px', marginBottom: '6px' }}>100% CHÍNH HÃNG</h4>
            <p style={{ fontSize: '12.5px', color: '#000000', fontWeight: '600', margin: 0, lineHeight: '1.5' }}>Cam kết bồi thường x10 nếu phát hiện hàng giả, hàng kém chất lượng.</p>
          </div>

          <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '2px solid #000000', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚡</div>
            <h4 style={{ color: '#ff0000', fontWeight: '900', fontSize: '15px', marginBottom: '6px' }}>GIAO HÀNG HỎA TỐC</h4>
            <p style={{ fontSize: '12.5px', color: '#000000', fontWeight: '600', margin: 0, lineHeight: '1.5' }}>Đóng gói chống sốc chuẩn quốc tế, giao hàng trong 24h.</p>
          </div>

          <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '2px solid #000000', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>💳</div>
            <h4 style={{ color: '#ff0000', fontWeight: '900', fontSize: '15px', marginBottom: '6px' }}>VÍ MPS WALLET</h4>
            <p style={{ fontSize: '12.5px', color: '#000000', fontWeight: '600', margin: 0, lineHeight: '1.5' }}>Thanh toán 1-Click tiện lợi, nạp tiền QR Code 24/7.</p>
          </div>

          <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '2px solid #000000', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>👑</div>
            <h4 style={{ color: '#ff0000', fontWeight: '900', fontSize: '15px', marginBottom: '6px' }}>7 HẠNG HỘI VIÊN</h4>
            <p style={{ fontSize: '12.5px', color: '#000000', fontWeight: '600', margin: 0, lineHeight: '1.5' }}>Tích điểm 10% đơn mua, đặc quyền Voucher giảm đến 50%.</p>
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: '#000000', color: '#ffffff', borderRadius: '10px', textTransform: 'uppercase', textAlign: 'center', fontWeight: '900', fontSize: '13.5px', letterSpacing: '0.5px' }}>
          💡 MPS AUTOGEAR - BỰT PHÁ HÀNH TRÌNH, BẢO VỆ MỌI CUNG ĐƯỜNG!
        </div>
      </div>
    );
  }
}

export default About;
