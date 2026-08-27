import React, { Component } from 'react';
import axios from 'axios';
import MyContext from '../contexts/MyContext';
import { Link } from 'react-router-dom';
import { withRouter } from '../utils/withRouter';

class Signup extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      txtUsername: '',
      txtPassword: '',
      txtName: '',
      txtPhone: '',
      txtEmail: '',
      loading: false,
      errorMsg: '',
      successMsg: ''
    };
  }

  handleSignup = (e) => {
    e.preventDefault();
    const { txtUsername, txtPassword, txtName, txtPhone, txtEmail } = this.state;

    if (!txtUsername || !txtPassword || !txtName || !txtPhone || !txtEmail) {
      this.setState({ errorMsg: 'Vui lòng điền đầy đủ tất cả các trường thông tin!' });
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

    axios.post('/api/customer/signup', body)
      .then(res => {
        this.setState({ loading: false });
        if (res.data && res.data.success) {
          alert("Đăng ký thành công! Một mã kích hoạt đã được gửi tới email của bạn. Vui lòng kiểm tra hộp thư.");
          this.setState({ successMsg: res.data.message || 'Đăng ký thành công! Hãy kiểm tra hòm thư email của bạn.' });
          this.props.router.navigate('/active');
        } else {
          this.setState({ errorMsg: res.data.message || 'Đăng ký thất bại. Tên đăng nhập hoặc email đã tồn tại!' });
        }
      })
      .catch(err => {
        this.setState({ loading: false, errorMsg: 'Có lỗi xảy ra kết nối máy chủ. Vui lòng thử lại!' });
        console.error("Lỗi đăng ký:", err.message);
      });
  };

  render() {
    const { customer, setToken, setCustomer } = this.context;
    const { txtUsername, txtPassword, txtName, txtPhone, txtEmail, loading, errorMsg, successMsg } = this.state;

    if (customer) {
      return (
        <div className="fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 0', minHeight: '50vh' }}>
          <div style={{ width: '100%', maxWidth: '480px', backgroundColor: 'white', border: '3px solid #ff0000', borderRadius: '16px', padding: '40px 30px', textAlign: 'center', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}>
            <span style={{ fontSize: '48px' }}>👤</span>
            <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#000000', marginTop: '10px' }}>BẠN ĐÃ LÀ THÀNH VIÊN</h2>
            <p style={{ fontSize: '15px', color: '#000000', fontWeight: 'bold', marginTop: '8px' }}>
              Tài khoản hiện tại: <strong style={{ color: '#ff0000' }}>{customer.name || customer.username}</strong>
            </p>
            <p style={{ fontSize: '13px', color: '#000000', marginTop: '4px' }}>
              Bạn không cần đăng ký tài khoản mới vì đã có sẵn tài khoản hội viên Hạng <strong style={{ color: '#ff0000' }}>{customer.membershipTier || 'Đồng'}</strong>.
            </p>

            <div style={{ display: 'flex', gap: '10px', marginTop: '25px', flexDirection: 'column' }}>
              <Link to="/home" style={{ backgroundColor: '#ff0000', color: 'white', padding: '12px', borderRadius: '30px', fontWeight: '900', textDecoration: 'none', fontSize: '14px' }}>
                🏠 Mua Sắm Ngay Tại Trang Chủ
              </Link>
              <button 
                onClick={() => {
                  setToken('');
                  setCustomer(null);
                  alert("Đã đăng xuất tài khoản!");
                }}
                style={{ backgroundColor: '#ffffff', color: '#ff0000', border: '2px solid #ff0000', padding: '10px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', marginTop: '5px' }}
              >
                🚪 Đăng Xuất Để Đăng Ký Tài Khoản Khác
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 0', minHeight: '80vh' }}>
        <div style={{ width: '100%', maxWidth: '500px', backgroundColor: 'white', border: '2px solid #000000', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.1)', padding: '40px 35px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '25px' }}>
            <span style={{ fontSize: '40px' }}>📝</span>
            <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#000000', marginTop: '10px' }}>ĐĂNG KÝ TÀI KHOẢN</h2>
            <p style={{ fontSize: '13px', color: '#000000', fontWeight: '600', marginTop: '5px' }}>Trở thành thành viên AutoGear để nhận nhiều ưu đãi</p>
          </div>

          {errorMsg && (
            <div style={{ backgroundColor: '#fff5f5', border: '2px solid #ff0000', color: '#ff0000', padding: '12px 15px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', fontWeight: 'bold' }}>
              ⚠️ {errorMsg}
            </div>
          )}
          {successMsg && (
            <div style={{ backgroundColor: '#f0fdf4', border: '2px solid #16a34a', color: '#16a34a', padding: '12px 15px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', fontWeight: 'bold' }}>
              ✅ {successMsg}
            </div>
          )}

          <form onSubmit={this.handleSignup}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '900', color: '#000000', marginBottom: '6px' }}>Tên đăng nhập</label>
              <input 
                type="text" 
                placeholder="Nhập tên đăng nhập" 
                value={txtUsername}
                onChange={(e) => this.setState({ txtUsername: e.target.value })}
                style={{ width: '100%', padding: '10px 16px', borderRadius: '30px', border: '2px solid #000000', fontSize: '14px', color: '#000000', fontWeight: 'bold', boxSizing: 'border-box' }}
                required
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '900', color: '#000000', marginBottom: '6px' }}>Mật khẩu</label>
              <input 
                type="password" 
                placeholder="Nhập mật khẩu" 
                value={txtPassword}
                onChange={(e) => this.setState({ txtPassword: e.target.value })}
                style={{ width: '100%', padding: '10px 16px', borderRadius: '30px', border: '2px solid #000000', fontSize: '14px', color: '#000000', fontWeight: 'bold', boxSizing: 'border-box' }}
                required
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '900', color: '#000000', marginBottom: '6px' }}>Họ và tên</label>
              <input 
                type="text" 
                placeholder="Nhập họ và tên đầy đủ" 
                value={txtName}
                onChange={(e) => this.setState({ txtName: e.target.value })}
                style={{ width: '100%', padding: '10px 16px', borderRadius: '30px', border: '2px solid #000000', fontSize: '14px', color: '#000000', fontWeight: 'bold', boxSizing: 'border-box' }}
                required
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '900', color: '#000000', marginBottom: '6px' }}>Số điện thoại</label>
              <input 
                type="tel" 
                placeholder="Nhập số điện thoại liên hệ" 
                value={txtPhone}
                onChange={(e) => this.setState({ txtPhone: e.target.value })}
                style={{ width: '100%', padding: '10px 16px', borderRadius: '30px', border: '2px solid #000000', fontSize: '14px', color: '#000000', fontWeight: 'bold', boxSizing: 'border-box' }}
                required
              />
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '900', color: '#000000', marginBottom: '6px' }}>Email</label>
              <input 
                type="email" 
                placeholder="Nhập email để nhận mã kích hoạt" 
                value={txtEmail}
                onChange={(e) => this.setState({ txtEmail: e.target.value })}
                style={{ width: '100%', padding: '10px 16px', borderRadius: '30px', border: '2px solid #000000', fontSize: '14px', color: '#000000', fontWeight: 'bold', boxSizing: 'border-box' }}
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                width: '100%', 
                backgroundColor: '#ff0000', 
                color: 'white', 
                border: 'none', 
                padding: '14px', 
                borderRadius: '30px', 
                fontWeight: '900', 
                cursor: 'pointer', 
                fontSize: '15px'
              }}
            >
              {loading ? 'ĐANG ĐĂNG KÝ TÀI KHOẢN...' : '📝 ĐĂNG KÝ'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '25px', fontSize: '13px', color: '#000000', fontWeight: '600' }}>
            Đã có tài khoản khách hàng?{' '}
            <Link to="/login" style={{ color: '#ff0000', fontWeight: '900' }}>
              Đăng nhập tại đây
            </Link>
          </div>

        </div>
      </div>
    );
  }
}

export default withRouter(Signup);
