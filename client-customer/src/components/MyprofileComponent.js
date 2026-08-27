import React, { Component } from 'react';
import axios from 'axios';
import MyContext from '../contexts/MyContext';
import { withRouter } from '../utils/withRouter';

class Myprofile extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      txtUsername: '',
      txtPassword: '',
      txtName: '',
      txtPhone: '',
      txtEmail: '',
      points: 0,
      membershipTier: 'Đồng',
      walletBalance: 1000000,
      selectedExplorerTier: 'Đồng',
      vouchers: [],
      showDepositModal: false,
      depositAmount: 500000,
      isDepositing: false,
      loading: false,
      errorMsg: '',
      successMsg: ''
    };
  }

  componentDidMount() {
    this.checkAuthAndPopulate();
    this.apiGetVouchers();
  }

  apiGetVouchers() {
    axios.get('/api/customer/vouchers')
      .then(res => {
        this.setState({ vouchers: res.data || [] });
      })
      .catch(err => console.error("Lỗi lấy danh sách voucher:", err.message));
  }

  checkAuthAndPopulate() {
    const { customer } = this.context;
    if (!customer) {
      alert("Vui lòng đăng nhập trước khi xem trang cá nhân!");
      this.props.router.navigate('/login');
      return;
    }

    axios.get(`/api/customer/profile/${customer._id}`)
      .then(res => {
        const c = (res.data && res.data.customer) ? res.data.customer : customer;
        const userTier = c.membershipTier || 'Đồng';
        this.setState({
          txtUsername: c.username || '',
          txtPassword: '',
          txtName: c.name || '',
          txtPhone: c.phone || '',
          txtEmail: c.email || '',
          points: c.points || 0,
          membershipTier: userTier,
          selectedExplorerTier: userTier,
          walletBalance: c.walletBalance !== undefined ? c.walletBalance : 1000000
        });
      })
      .catch(err => {
        console.error("Lỗi tải thông tin cá nhân:", err.message);
        this.setState({
          txtUsername: customer.username || '',
          txtName: customer.name || '',
          txtPhone: customer.phone || '',
          txtEmail: customer.email || '',
          points: customer.points || 0,
          membershipTier: customer.membershipTier || 'Đồng',
          selectedExplorerTier: customer.membershipTier || 'Đồng',
          walletBalance: customer.walletBalance !== undefined ? customer.walletBalance : 1000000
        });
      });
  }

  handleUpdateProfile = (e) => {
    e.preventDefault();
    const { customer, token, setCustomer } = this.context;
    const { txtUsername, txtPassword, txtName, txtPhone, txtEmail } = this.state;

    if (!txtName || !txtPhone || !txtEmail) {
      this.setState({ errorMsg: 'Họ tên, Số điện thoại và Email không được để trống!' });
      return;
    }

    this.setState({ loading: true, errorMsg: '', successMsg: '' });

    const body = {
      username: txtUsername,
      password: txtPassword,
      name: txtName,
      phone: txtPhone,
      email: txtEmail
    };

    const config = {
      headers: {
        'x-access-token': token,
        'Authorization': `Bearer ${token}`
      }
    };

    axios.put(`/api/customer/customers/${customer._id}`, body, config)
      .then(res => {
        this.setState({ loading: false });
        if (res.data) {
          const updatedCust = {
            ...customer,
            name: txtName,
            phone: txtPhone,
            email: txtEmail
          };
          if (txtPassword) {
            updatedCust.password = txtPassword;
          }
          setCustomer(updatedCust);
          this.setState({ successMsg: 'Đã cập nhật thông tin cá nhân thành công!' });
          alert("Cập nhật thông tin tài khoản thành công!");
        } else {
          this.setState({ errorMsg: 'Cập nhật thất bại. Vui lòng kiểm tra lại!' });
        }
      })
      .catch(err => {
        this.setState({ loading: false, errorMsg: 'Lỗi kết nối máy chủ khi cập nhật thông tin.' });
        console.error("Lỗi cập nhật profile:", err.message);
      });
  };

  executeWalletDeposit = () => {
    const { customer, token } = this.context;
    const { depositAmount } = this.state;

    if (!depositAmount || depositAmount <= 0) {
      alert("Vui lòng nhập số tiền nạp hợp lệ!");
      return;
    }

    this.setState({ isDepositing: true });

    const config = {
      headers: {
        'x-access-token': token,
        'Authorization': `Bearer ${token}`
      }
    };

    const body = {
      customerId: customer._id,
      amount: depositAmount
    };

    axios.post('/api/customer/wallet/deposit', body, config)
      .then(res => {
        this.setState({ isDepositing: false, showDepositModal: false });
        if (res.data && res.data.success) {
          alert(`🎉 ${res.data.message}`);
          this.setState({ walletBalance: res.data.walletBalance });
        } else {
          alert(res.data.message || "Nạp tiền thất bại!");
        }
      })
      .catch(err => {
        this.setState({ isDepositing: false });
        console.error("Lỗi nạp tiền ví:", err.message);
        alert("Lỗi nạp tiền ví. Vui lòng thử lại sau!");
      });
  };

  getTierDetails(tier) {
    switch (tier) {
      case 'Huyền Thoại':
        return { name: 'Huyền Thoại', color: '#ff0000', minPts: 10000, discount: 50, voucher: 'LEGEND50', perk: 'Giảm 50% tất cả phụ tùng + Đặc quyền mua hàng VIP giá sỉ + Hỗ trợ kỹ thuật viên ưu tiên số 1', icon: '👑' };
      case 'Tinh Anh':
        return { name: 'Tinh Anh', color: '#ff0000', minPts: 5000, discount: 45, voucher: 'ELITE45', perk: 'Giảm 45% + Hỗ trợ kỹ thuật viên sửa chữa tận nhà miễn phí 24/7', icon: '⚡' };
      case 'Kim Cương':
        return { name: 'Kim Cương', color: '#ff0000', minPts: 2000, discount: 40, voucher: 'DIAMOND40', perk: 'Giảm 40% + Tặng gói bảo dưỡng phụ tùng xe 1 năm miễn phí', icon: '💎' };
      case 'Bạch Kim':
        return { name: 'Bạch Kim', color: '#ff0000', minPts: 1000, discount: 35, voucher: 'PLATINUM35', perk: 'Giảm 35% + Ưu tiên giao hàng hỏa tốc trong vòng 24 giờ', icon: '🏆' };
      case 'Vàng':
        return { name: 'Vàng', color: '#ff0000', minPts: 500, discount: 30, voucher: 'GOLD30', perk: 'Giảm 30% + Miễn phí hoàn toàn cước vận chuyển hỏa tốc toàn quốc', icon: '🥇' };
      case 'Bạc':
        return { name: 'Bạc', color: '#ff0000', minPts: 100, discount: 25, voucher: 'SILVER25', perk: 'Giảm 25% + Đơn hàng trên 500.000đ tặng 1 phụ tùng đi kèm chính hãng', icon: '🥈' };
      default:
        return { name: 'Đồng', color: '#ff0000', minPts: 0, discount: 20, voucher: 'COPPER20', perk: 'Giảm 20% giá phụ tùng cho tất cả đơn hàng đầu tiên', icon: '🥉' };
    }
  }

  render() {
    const { txtUsername, txtPassword, txtName, txtPhone, txtEmail, points, membershipTier, walletBalance, selectedExplorerTier, vouchers, showDepositModal, depositAmount, isDepositing, loading, errorMsg, successMsg } = this.state;
    const { customer } = this.context;

    if (!customer) {
      return null;
    }

    const currentTierInfo = this.getTierDetails(membershipTier);
    const explorerTierInfo = this.getTierDetails(selectedExplorerTier);

    const allTiers = [
      { name: 'Đồng', pts: 0 },
      { name: 'Bạc', pts: 100 },
      { name: 'Vàng', pts: 500 },
      { name: 'Bạch Kim', pts: 1000 },
      { name: 'Kim Cương', pts: 2000 },
      { name: 'Tinh Anh', pts: 5000 },
      { name: 'Huyền Thoại', pts: 10000 }
    ];

    return (
      <div className="fade-in" style={{ maxWidth: '1000px', margin: '30px auto', padding: '0 20px' }}>
        {/* Top Wallet & Membership Banner */}
        <div style={{ backgroundColor: '#000000', borderRadius: '20px', padding: '30px', color: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', border: '3px solid #ff0000' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '36px' }}>👑</span>
              <div>
                <span style={{ fontSize: '12px', letterSpacing: '1px', opacity: 0.9, textTransform: 'uppercase', fontWeight: 'bold', color: '#ffffff' }}>HẠNG HỘI VIÊN CAO CẤP</span>
                <h2 style={{ fontSize: '28px', fontWeight: '900', margin: 0, textTransform: 'uppercase', color: '#ff0000' }}>HẠNG {membershipTier.toUpperCase()}</h2>
              </div>
            </div>
            <p style={{ margin: '12px 0 0 0', fontSize: '14px', fontWeight: '600', maxWidth: '500px', color: '#ffffff' }}>
              🎁 <strong>Đặc quyền hiện tại:</strong> {currentTierInfo.perk}
            </p>
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: '20px 25px', borderRadius: '16px', border: '2px solid #ff0000', minWidth: '260px' }}>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', color: '#000000', fontWeight: '900' }}>💳 Số Dư Ví MPS Wallet:</span>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#ff0000' }}>
                {walletBalance.toLocaleString('vi-VN')} đ
              </div>
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', color: '#000000', fontWeight: '900' }}>💎 Điểm Thưởng (10% đơn mua):</span>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#000000' }}>
                {points.toLocaleString('vi-VN')} pts
              </div>
            </div>

            <button
              onClick={() => this.setState({ showDepositModal: true })}
              style={{ width: '100%', padding: '10px', borderRadius: '20px', border: 'none', backgroundColor: '#ff0000', color: 'white', fontWeight: '900', cursor: 'pointer', fontSize: '13px', boxShadow: '0 4px 10px rgba(255,0,0,0.4)' }}
            >
              ➕ NẠP TIỀN VÀO VÍ MPS WALLET
            </button>
          </div>
        </div>

        {/* 7-Tier Interactive Explorer */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '2px solid #000000', padding: '25px', marginBottom: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#000000', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase' }}>
            📊 SƠ ĐỒ &amp; ĐẶC QUYỀN 7 HẠNG HỘI VIÊN (NHẤN ĐỂ XEM CHI TIẾT)
          </h3>
          <p style={{ fontSize: '12px', color: '#000000', fontWeight: '600', marginBottom: '15px' }}>Bấm vào bất kỳ hạng hội viên nào dưới đây để xem yêu cầu điểm tích lũy và đặc quyền Voucher đi kèm.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', textAlign: 'center', marginBottom: '20px' }}>
            {allTiers.map(t => {
              const isAchieved = points >= t.pts;
              const isCurrent = membershipTier === t.name;
              const isSelected = selectedExplorerTier === t.name;
              return (
                <div 
                  key={t.name} 
                  onClick={() => this.setState({ selectedExplorerTier: t.name })}
                  style={{ 
                    padding: '12px 8px', 
                    borderRadius: '10px', 
                    backgroundColor: isSelected ? '#fff1f2' : isAchieved ? '#ffffff' : '#f8fafc', 
                    border: isSelected ? '3px solid #ff0000' : isCurrent ? '2px solid #000000' : '1px solid #cbd5e1',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: isSelected ? '0 4px 10px rgba(255,0,0,0.2)' : 'none'
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: '900', color: isSelected || isCurrent ? '#ff0000' : '#000000' }}>
                    {isCurrent ? '⭐ ' + t.name : t.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#000000', fontWeight: 'bold', marginTop: '4px' }}>
                    {t.pts === 0 ? '0 pts' : `>= ${t.pts.toLocaleString('vi-VN')} pts`}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Perk Card for Selected Explorer Tier */}
          <div style={{ padding: '20px', backgroundColor: '#fff5f5', borderRadius: '12px', border: '2px solid #ff0000', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '24px' }}>{explorerTierInfo.icon}</span>
                <h4 style={{ fontSize: '18px', fontWeight: '900', color: '#ff0000', margin: 0 }}>
                  HẠNG {explorerTierInfo.name.toUpperCase()} (Yêu cầu: {explorerTierInfo.minPts.toLocaleString('vi-VN')} pts)
                </h4>
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: '13.5px', color: '#000000', fontWeight: 'bold' }}>
                🎁 <strong>Đặc quyền:</strong> {explorerTierInfo.perk}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '12px', color: '#000000', fontWeight: 'bold', display: 'block' }}>Mức Giảm Giá: <strong style={{ color: '#ff0000', fontSize: '16px' }}>-{explorerTierInfo.discount}%</strong></span>
              <span style={{ fontSize: '12px', color: '#000000', fontWeight: 'bold' }}>Mã Voucher: <strong style={{ color: '#ff0000', fontFamily: 'monospace' }}>{explorerTierInfo.voucher}</strong></span>
            </div>
          </div>
        </div>

        {/* 2 Grid Columns: Form & Vouchers */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          {/* Profile Edit Form */}
          <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '2px solid #000000', padding: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#000000', marginBottom: '20px', borderBottom: '2px solid #000000', paddingBottom: '10px', textTransform: 'uppercase' }}>
              👤 THÔNG TIN TÀI KHOẢN
            </h3>

            {errorMsg && (
              <div style={{ backgroundColor: '#fff5f5', border: '2px solid #ff0000', color: '#ff0000', padding: '10px 14px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px', fontWeight: 'bold' }}>
                ⚠️ {errorMsg}
              </div>
            )}
            {successMsg && (
              <div style={{ backgroundColor: '#f0fdf4', border: '2px solid #16a34a', color: '#16a34a', padding: '10px 14px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px', fontWeight: 'bold' }}>
                ✅ {successMsg}
              </div>
            )}

            <form onSubmit={this.handleUpdateProfile}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '900', color: '#000000', marginBottom: '4px' }}>Tên đăng nhập (Username)</label>
                <input 
                  type="text" 
                  value={txtUsername}
                  disabled
                  style={{ width: '100%', padding: '8px 14px', borderRadius: '8px', border: '2px solid #000000', fontSize: '13px', backgroundColor: '#f1f5f9', color: '#000000', fontWeight: 'bold', cursor: 'not-allowed' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '900', color: '#000000', marginBottom: '4px' }}>Mật khẩu mới (bỏ trống nếu giữ nguyên)</label>
                <input 
                  type="password" 
                  placeholder="Mật khẩu mới..."
                  value={txtPassword}
                  onChange={(e) => this.setState({ txtPassword: e.target.value })}
                  style={{ width: '100%', padding: '8px 14px', borderRadius: '8px', border: '2px solid #000000', fontSize: '13px', color: '#000000', fontWeight: 'bold' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '900', color: '#000000', marginBottom: '4px' }}>Họ và tên</label>
                <input 
                  type="text" 
                  value={txtName}
                  onChange={(e) => this.setState({ txtName: e.target.value })}
                  style={{ width: '100%', padding: '8px 14px', borderRadius: '8px', border: '2px solid #000000', fontSize: '13px', color: '#000000', fontWeight: 'bold' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '900', color: '#000000', marginBottom: '4px' }}>Số điện thoại</label>
                <input 
                  type="tel" 
                  value={txtPhone}
                  onChange={(e) => this.setState({ txtPhone: e.target.value })}
                  style={{ width: '100%', padding: '8px 14px', borderRadius: '8px', border: '2px solid #000000', fontSize: '13px', color: '#000000', fontWeight: 'bold' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '900', color: '#000000', marginBottom: '4px' }}>Email</label>
                <input 
                  type="email" 
                  value={txtEmail}
                  onChange={(e) => this.setState({ txtEmail: e.target.value })}
                  style={{ width: '100%', padding: '8px 14px', borderRadius: '8px', border: '2px solid #000000', fontSize: '13px', color: '#000000', fontWeight: 'bold' }}
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={{ width: '100%', backgroundColor: '#ff0000', color: 'white', border: 'none', padding: '12px', borderRadius: '30px', fontWeight: '900', cursor: 'pointer', fontSize: '14px' }}
              >
                {loading ? 'ĐANG LƯU...' : '💾 CẬP NHẬT THÔNG TIN'}
              </button>
            </form>
          </div>

          {/* Member Vouchers List */}
          <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '2px solid #000000', padding: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#000000', marginBottom: '20px', borderBottom: '2px solid #000000', paddingBottom: '10px', textTransform: 'uppercase' }}>
              🎟️ KHO VOUCHER ƯU ĐÃI THEO HẠNG
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto' }}>
              {vouchers.map(v => (
                <div key={v._id} style={{ padding: '14px', borderRadius: '12px', border: '2px dashed #ff0000', backgroundColor: '#fff5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '15px', fontWeight: '900', color: '#ff0000', fontFamily: 'monospace' }}>🎟️ {v.code}</span>
                    <span style={{ fontSize: '12px', fontWeight: '900', color: '#000000', marginLeft: '10px' }}>Giảm {v.discountPercent}% (Yêu cầu: Hạng {v.minTier || 'Đồng'})</span>
                    <p style={{ fontSize: '12px', color: '#000000', fontWeight: '600', margin: '4px 0 0 0' }}>{v.description}</p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(v.code);
                      alert(`Đã sao chép mã giảm giá: ${v.code}! Dán vào giỏ hàng để áp dụng.`);
                    }}
                    style={{ padding: '6px 12px', borderRadius: '20px', border: 'none', backgroundColor: '#000000', color: 'white', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    Sao chép
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* QR Code Wallet Deposit Top-Up Modal */}
        {showDepositModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', maxWidth: '480px', width: '100%', textAlign: 'center', border: '3px solid #ff0000' }}>
              <span style={{ fontSize: '40px' }}>💳</span>
              <h3 style={{ margin: '10px 0 5px 0', fontSize: '22px', color: '#000000', fontWeight: '900' }}>NẠP TIỀN VÀO VÍ MPS WALLET</h3>
              <p style={{ fontSize: '13px', color: '#000000', marginBottom: '15px', fontWeight: '600' }}>Quét mã QR dưới đây và nhập số tiền nạp để bổ sung số dư ví thanh toán.</p>

              <div style={{ padding: '15px', backgroundColor: '#fff5f5', borderRadius: '12px', border: '2px solid #000000', marginBottom: '15px' }}>
                <img 
                  src="/img/qr.png" 
                  alt="Mã QR Nạp Tiền" 
                  style={{ width: '200px', height: '200px', objectFit: 'contain', borderRadius: '8px', margin: '0 auto 10px auto', display: 'block' }}
                />

                <div style={{ textAlign: 'left', marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '900', color: '#000000', marginBottom: '4px' }}>
                    💵 Số tiền muốn nạp (VNĐ):
                  </label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => this.setState({ depositAmount: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #000000', fontSize: '15px', color: '#ff0000', fontWeight: '900', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ fontSize: '12px', color: '#000000', fontWeight: 'bold' }}>
                  Nội dung CK: <strong style={{ color: '#ff0000' }}>NAP {customer.username} - Ví MPS Wallet</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                <button
                  onClick={this.executeWalletDeposit}
                  disabled={isDepositing}
                  style={{
                    backgroundColor: '#ff0000',
                    color: 'white',
                    border: 'none',
                    padding: '14px',
                    borderRadius: '30px',
                    fontWeight: '900',
                    cursor: 'pointer',
                    fontSize: '15px',
                    width: '100%'
                  }}
                >
                  {isDepositing ? 'ĐANG XỬ LÝ...' : `✅ XÁC NHẬN NẠP ${(parseInt(depositAmount) || 0).toLocaleString('vi-VN')} Đ`}
                </button>
                <button
                  onClick={() => this.setState({ showDepositModal: false })}
                  style={{
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '30px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  Hủy / Quay lại
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default withRouter(Myprofile);
