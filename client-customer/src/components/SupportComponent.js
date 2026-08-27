import React, { Component } from 'react';

class Support extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 'baohanh',
      fbName: '',
      fbPhone: '',
      fbTopic: 'Bảo hành & Đổi trả',
      fbMessage: ''
    };
  }

  componentDidMount() {
    this.checkHash();
  }

  componentDidUpdate() {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['baohanh', 'hoantien', 'dieukhoan', 'trogiup'].includes(hash) && hash !== this.state.activeTab) {
      this.setState({ activeTab: hash });
    }
  }

  checkHash() {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['baohanh', 'hoantien', 'dieukhoan', 'trogiup'].includes(hash)) {
      this.setState({ activeTab: hash });
    }
  }

  handleFeedbackSubmit = (e) => {
    e.preventDefault();
    const { fbName, fbPhone, fbTopic, fbMessage } = this.state;
    if (!fbName || !fbPhone || !fbMessage) {
      alert("Vui lòng điền đầy đủ thông tin gửi ý kiến!");
      return;
    }
    alert(`🎉 Cảm ơn ${fbName} đã gửi phản hồi về chủ đề "${fbTopic}"!\nĐội ngũ chăm sóc khách hàng MPS sẽ liên hệ với bạn qua SĐT ${fbPhone} trong vòng 15 phút.`);
    this.setState({
      fbName: '',
      fbPhone: '',
      fbTopic: 'Bảo hành & Đổi trả',
      fbMessage: ''
    });
  };

  render() {
    const { activeTab, fbName, fbPhone, fbTopic, fbMessage } = this.state;

    return (
      <div className="fade-in" style={{ maxWidth: '1000px', margin: '30px auto', padding: '30px', backgroundColor: '#ffffff', border: '2px solid #000000', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
        {/* Header Title */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#ff0000', fontWeight: '900', fontSize: '28px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            🎧 TRUNG TÂM HỖ TRỢ &amp; DỊCH VỤ KHÁCH HÀNG MPS
          </h1>
          <p style={{ color: '#000000', fontSize: '15px', fontWeight: 'bold', maxWidth: '750px', margin: '0 auto', lineHeight: '1.6' }}>
            Hệ thống phân phối linh kiện phụ tùng xe máy chính hãng MPS cam kết hỗ trợ toàn diện, minh bạch chính sách bảo hành, hoàn tiền và bảo mật thông tin tuyệt đối cho quý khách hàng.
          </p>
        </div>

        {/* Support Navigation Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '30px' }}>
          {[
            { id: 'baohanh', icon: '🛡️', title: 'Chính Sách Bảo Hành' },
            { id: 'hoantien', icon: '💸', title: 'Chính Sách Hoàn Tiền' },
            { id: 'dieukhoan', icon: '🔒', title: 'Điều Khoản & Bảo Mật' },
            { id: 'trogiup', icon: '📞', title: 'Trung Tâm Trợ Giúp 24/7' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                this.setState({ activeTab: tab.id });
                window.location.hash = tab.id;
              }}
              style={{
                padding: '14px 18px',
                borderRadius: '12px',
                border: activeTab === tab.id ? '3px solid #ff0000' : '2px solid #000000',
                backgroundColor: activeTab === tab.id ? '#ff0000' : '#ffffff',
                color: activeTab === tab.id ? '#ffffff' : '#000000',
                fontWeight: '900',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(255,0,0,0.25)' : 'none'
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.title}</span>
            </button>
          ))}
        </div>

        {/* Tab Content 1: Chính Sách Bảo Hành */}
        {activeTab === 'baohanh' && (
          <div className="tab-pane fade-in" style={{ backgroundColor: '#fff5f5', padding: '25px', borderRadius: '12px', border: '2px solid #ff0000' }}>
            <h3 style={{ color: '#ff0000', marginBottom: '15px', fontWeight: '900', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              🛡️ CHÍNH SÁCH BẢO HÀNH LINH KIỆN &amp; PHỤ TÙNG XE MÁY
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14.5px', color: '#000000', lineHeight: '1.7', fontWeight: '500' }}>
              <div style={{ padding: '12px 16px', backgroundColor: '#ffffff', borderRadius: '8px', borderLeft: '4px solid #ff0000', border: '1px solid #000000' }}>
                <strong>1. Thời Gian Bảo Hành:</strong> Tất cả sản phẩm chính hãng (Honda, Yamaha, Suzuki, Vespa, Ohlins, NGK, Bando...) phân phối bởi MPS được bảo hành <strong>từ 6 đến 12 tháng</strong> theo tiêu chuẩn niêm yết của nhà sản xuất.
              </div>
              <div style={{ padding: '12px 16px', backgroundColor: '#ffffff', borderRadius: '8px', borderLeft: '4px solid #ff0000', border: '1px solid #000000' }}>
                <strong>2. Điều Kiện 1 Đổi 1 Trong 30 Ngày:</strong> Sản phẩm được đổi mới 100% không mất phí nếu phát sinh lỗi kỹ thuật từ nhà sản xuất (nứt vỡ cong vênh nguyên đai nguyên kiện, bố thắng lỗi tiếng kêu rít rít, bugi đánh lửa chập chờn...).
              </div>
              <div style={{ padding: '12px 16px', backgroundColor: '#ffffff', borderRadius: '8px', borderLeft: '4px solid #ff0000', border: '1px solid #000000' }}>
                <strong>3. Quy Trình Bảo Hành Nhanh Chóng:</strong> Quý khách chỉ cần liên hệ Hotline <strong>1900 8888</strong> hoặc nhắn tin góc chat hỗ trợ, cung cấp Số điện thoại đặt hàng. Kỹ thuật viên MPS sẽ hỗ trợ thu hồi phụ tùng lỗi và đổi phụ tùng mới tận nhà.
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: Chính Sách Hoàn Tiền */}
        {activeTab === 'hoantien' && (
          <div className="tab-pane fade-in" style={{ backgroundColor: '#fff5f5', padding: '25px', borderRadius: '12px', border: '2px solid #ff0000' }}>
            <h3 style={{ color: '#ff0000', marginBottom: '15px', fontWeight: '900', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              💸 CHÍNH SÁCH HOÀN TIỀN &amp; ĐỔI TRẢ MẠNH MẸ
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14.5px', color: '#000000', lineHeight: '1.7', fontWeight: '500' }}>
              <div style={{ padding: '12px 16px', backgroundColor: '#ffffff', borderRadius: '8px', borderLeft: '4px solid #ff0000', border: '1px solid #000000' }}>
                <strong>1. Cam Kết Hoàn Tiền 100%:</strong> MPS cam kết hoàn trả <strong>100% số tiền + bồi thường gấp 10 lần</strong> nếu khách hàng phát hiện hàng giả, hàng nhái kém chất lượng không đúng mô tả sản phẩm.
              </div>
              <div style={{ padding: '12px 16px', backgroundColor: '#ffffff', borderRadius: '8px', borderLeft: '4px solid #ff0000', border: '1px solid #000000' }}>
                <strong>2. Hoàn Tiền Do Lỗi Vận Chuyển:</strong> Nếu sản phẩm bị hư hỏng, cong vỡ đĩa phanh/phuộc nhún trong quá trình vận chuyển, quý khách được từ chối nhận hàng hoặc nhận hoàn tiền 100% chuyển khoản qua QR trong 24 giờ.
              </div>
              <div style={{ padding: '12px 16px', backgroundColor: '#ffffff', borderRadius: '8px', borderLeft: '4px solid #ff0000', border: '1px solid #000000' }}>
                <strong>3. Thời Gian Xử Lý Hoàn Tiền:</strong> Tiền được chuyển trả lại tài khoản ngân hàng của quý khách ngay trong vòng <strong>2 đến 4 giờ làm việc</strong> sau khi xác nhận yêu cầu hoàn trả.
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 3: Điều Khoản & Bảo Mật */}
        {activeTab === 'dieukhoan' && (
          <div className="tab-pane fade-in" style={{ backgroundColor: '#fff5f5', padding: '25px', borderRadius: '12px', border: '2px solid #ff0000' }}>
            <h3 style={{ color: '#ff0000', marginBottom: '15px', fontWeight: '900', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              🔒 ĐIỀU KHOẢN DỊCH VỤ &amp; BẢO MẬT THÔNG TIN
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14.5px', color: '#000000', lineHeight: '1.7', fontWeight: '500' }}>
              <div style={{ padding: '12px 16px', backgroundColor: '#ffffff', borderRadius: '8px', borderLeft: '4px solid #ff0000', border: '1px solid #000000' }}>
                <strong>1. Bảo Mật Thông Tin Khách Hàng:</strong> Mọi thông tin cá nhân (Tên, Số điện thoại, Địa chỉ giao hàng) đều được mã hóa chuẩn SSL 256-bit. MPS tuyệt đối không chia sẻ thông tin khách hàng cho bất kỳ bên thứ ba nào.
              </div>
              <div style={{ padding: '12px 16px', backgroundColor: '#ffffff', borderRadius: '8px', borderLeft: '4px solid #ff0000', border: '1px solid #000000' }}>
                <strong>2. An Toàn Thanh Toán QR:</strong> Giao dịch quét mã QR Code chuyển khoản trực tiếp được ngân hàng mã hóa bảo mật, đảm bảo đúng số tiền và không lưu trữ thông tin thẻ hay tài khoản mật của khách hàng.
              </div>
              <div style={{ padding: '12px 16px', backgroundColor: '#ffffff', borderRadius: '8px', borderLeft: '4px solid #ff0000', border: '1px solid #000000' }}>
                <strong>3. Quyền Đồng Kiểm Sản Phẩm:</strong> Khách hàng được phép mở niêm phong hộp carton đồng kiểm số lượng và chủng loại phụ tùng trước khi ký nhận với bưu tá.
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 4: Trung Tâm Trợ Giúp 24/7 */}
        {activeTab === 'trogiup' && (
          <div className="tab-pane fade-in" style={{ backgroundColor: '#fff5f5', padding: '25px', borderRadius: '12px', border: '2px solid #ff0000' }}>
            <h3 style={{ color: '#ff0000', marginBottom: '15px', fontWeight: '900', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              📞 TRUNG TÂM TRỢ GIÚP &amp; HỖ TRỢ KỸ THUẬT 24/7
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '10px', border: '2px solid #000000', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📞</div>
                <h4 style={{ color: '#000000', margin: '4px 0', fontWeight: '900' }}>Hotline Trực Tuyến</h4>
                <p style={{ fontSize: '22px', fontWeight: '900', color: '#ff0000', margin: '6px 0' }}>1900 8888</p>
                <span style={{ fontSize: '12px', color: '#000000', fontWeight: 'bold' }}>Hỗ trợ 24/7 (Cả T7, CN &amp; Ngày lễ)</span>
              </div>

              <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '10px', border: '2px solid #000000', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📧</div>
                <h4 style={{ color: '#000000', margin: '4px 0', fontWeight: '900' }}>Email Tư Vấn Kỹ Thuật</h4>
                <p style={{ fontSize: '16px', fontWeight: '900', color: '#ff0000', margin: '6px 0' }}>support@mps.vn</p>
                <span style={{ fontSize: '12px', color: '#000000', fontWeight: 'bold' }}>Phản hồi email trong 15 phút</span>
              </div>

              <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '10px', border: '2px solid #000000', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
                <h4 style={{ color: '#000000', margin: '4px 0', fontWeight: '900' }}>Live Chat Realtime</h4>
                <p style={{ fontSize: '14px', fontWeight: '900', color: '#ff0000', margin: '6px 0' }}>Bóng chat góc phải màn hình</p>
                <span style={{ fontSize: '12px', color: '#000000', fontWeight: 'bold' }}>Kết nối trực tiếp với Quản trị viên</span>
              </div>
            </div>
          </div>
        )}

        {/* Feedback & Contact Form Section (Present on all Support tabs) */}
        <div style={{ marginTop: '35px', padding: '25px', backgroundColor: '#ffffff', borderRadius: '14px', border: '2px solid #000000', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: '#ff0000', fontWeight: '900', fontSize: '18px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📝 GỬI Ý KIẾN &amp; PHẢN HỒI DỊCH VỤ DÀNH CHO KHÁCH HÀNG
          </h3>
          <p style={{ fontSize: '13px', color: '#000000', fontWeight: '600', marginBottom: '20px' }}>
            Ý kiến của bạn là động lực để MPS AutoGear không ngừng nâng cao chất lượng dịch vụ và sản phẩm phụ tùng xe máy.
          </p>

          <form onSubmit={this.handleFeedbackSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '900', color: '#000000', marginBottom: '4px' }}>Họ và tên *</label>
              <input 
                type="text" 
                placeholder="Nhập họ và tên..." 
                value={fbName}
                onChange={(e) => this.setState({ fbName: e.target.value })}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #000000', fontSize: '13px', color: '#000000', fontWeight: 'bold', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '900', color: '#000000', marginBottom: '4px' }}>Số điện thoại liên hệ *</label>
              <input 
                type="tel" 
                placeholder="Nhập số điện thoại..." 
                value={fbPhone}
                onChange={(e) => this.setState({ fbPhone: e.target.value })}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #000000', fontSize: '13px', color: '#000000', fontWeight: 'bold', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '900', color: '#000000', marginBottom: '4px' }}>Chủ đề phản hồi</label>
              <select
                value={fbTopic}
                onChange={(e) => this.setState({ fbTopic: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #000000', fontSize: '13px', color: '#000000', fontWeight: 'bold' }}
              >
                <option value="Bảo hành &amp; Đổi trả">🛡️ Bảo hành &amp; Đổi trả sản phẩm</option>
                <option value="Ví MPS Wallet &amp; Tích điểm">💳 Ví MPS Wallet &amp; Tích điểm hội viên</option>
                <option value="Chất lượng sản phẩm &amp; Giá cả">📦 Chất lượng phụ tùng &amp; Giá cả</option>
                <option value="Ý kiến góp ý khác">💡 Ý kiến góp ý khác</option>
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '900', color: '#000000', marginBottom: '4px' }}>Nội dung góp ý / phản hồi *</label>
              <textarea 
                placeholder="Nhập chi tiết nội dung ý kiến phản hồi của bạn..." 
                rows={3}
                value={fbMessage}
                onChange={(e) => this.setState({ fbMessage: e.target.value })}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #000000', fontSize: '13px', color: '#000000', fontWeight: 'bold', boxSizing: 'border-box', resize: 'vertical' }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <button 
                type="submit" 
                style={{ width: '100%', padding: '12px', backgroundColor: '#ff0000', color: 'white', border: 'none', borderRadius: '30px', fontWeight: '900', fontSize: '14px', cursor: 'pointer' }}
              >
                🚀 GỬI Ý KIẾN PHẢN HỒI VỀ MPS
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default Support;
