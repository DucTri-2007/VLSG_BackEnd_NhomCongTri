import React, { Component } from 'react';
import axios from 'axios';
import MyContext from '../contexts/MyContext';
import { Link } from 'react-router-dom';
import { withRouter } from '../utils/withRouter';

class Login extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      txtUsername: '',
      txtPassword: '',
      loading: false,
      errorMsg: ''
    };
  }

  handleLogin = (e) => {
    e.preventDefault();
    const { txtUsername, txtPassword } = this.state;

    if (!txtUsername || !txtPassword) {
      this.setState({ errorMsg: 'Vui lòng điền đầy đủ tên đăng nhập và mật khẩu!' });
      return;
    }

    this.setState({ loading: true, errorMsg: '' });

    const body = {
      username: txtUsername,
      password: txtPassword
    };

    axios.post('/api/customer/login', body)
      .then(res => {
        this.setState({ loading: false });
        if (res.data && res.data.success) {
          this.context.setToken(res.data.token);
          this.context.setCustomer(res.data.customer);
          alert("Đăng nhập thành công! Chào mừng bạn quay trở lại với MPS AutoGear.");
          this.props.router.navigate('/home');
        } else {
          this.setState({ errorMsg: res.data.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại!' });
        }
      })
      .catch(err => {
        this.setState({ loading: false, errorMsg: 'Không thể kết nối tới máy chủ. Vui lòng thử lại sau!' });
        console.error("Lỗi đăng nhập:", err.message);
      });
  };

  render() {
    const { customer, setToken, setCustomer } = this.context;
    const { txtUsername, txtPassword, loading, errorMsg } = this.state;

    if (customer) {
      return (
        <div className="fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 0', minHeight: '50vh' }}>
          <div style={{ width: '100%', maxWidth: '480px', backgroundColor: 'white', border: '3px solid #ff0000', borderRadius: '16px', padding: '40px 30px', textAlign: 'center', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}>
            <span style={{ fontSize: '48px' }}>👤</span>
            <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#000000', marginTop: '10px' }}>BẠN ĐÃ ĐĂNG NHẬP</h2>
            <p style={{ fontSize: '15px', color: '#000000', fontWeight: 'bold', marginTop: '8px' }}>
              Xin chào, <strong style={{ color: '#ff0000' }}>{customer.name || customer.username}</strong>!
            </p>
            <p style={{ fontSize: '13px', color: '#000000', marginTop: '4px' }}>
              Email: <strong>{customer.email}</strong> | Hạng: <span style={{ color: '#ff0000', fontWeight: 'bold' }}>{customer.membershipTier || 'Đồng'}</span>
            </p>

            <div style={{ display: 'flex', gap: '10px', marginTop: '25px', flexDirection: 'column' }}>
              <Link to="/home" style={{ backgroundColor: '#ff0000', color: 'white', padding: '12px', borderRadius: '30px', fontWeight: '900', textDecoration: 'none', fontSize: '14px' }}>
                🏠 Mua Sắm Ngay Tại Trang Chủ
              </Link>
              <Link to="/myprofile" style={{ backgroundColor: '#000000', color: 'white', padding: '12px', borderRadius: '30px', fontWeight: '900', textDecoration: 'none', fontSize: '14px' }}>
                💳 Xem Cá Nhân &amp; Ví MPS Wallet
              </Link>
              <button 
                onClick={() => {
                  setToken('');
                  setCustomer(null);
                  alert("Đã đăng xuất tài khoản!");
                }}
                style={{ backgroundColor: '#ffffff', color: '#ff0000', border: '2px solid #ff0000', padding: '10px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', marginTop: '5px' }}
              >
                🚪 Đăng Xuất Tài Khoản
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 0', minHeight: '60vh' }}>
        <div style={{ width: '100%', maxWidth: '450px', backgroundColor: 'white', border: '2px solid #000000', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.1)', padding: '40px 35px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '25px' }}>
            <span style={{ fontSize: '40px' }}>🏍️</span>
            <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#000000', marginTop: '10px' }}>ĐĂNG NHẬP KHÁCH HÀNG</h2>
            <p style={{ fontSize: '13px', color: '#000000', fontWeight: '600', marginTop: '5px' }}>Đăng nhập tài khoản AutoGear để tiếp tục mua sắm</p>
          </div>

          {errorMsg && (
            <div style={{ backgroundColor: '#fff5f5', border: '2px solid #ff0000', color: '#ff0000', padding: '12px 15px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', fontWeight: 'bold' }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={this.handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '900', color: '#000000', marginBottom: '6px' }}>Tên đăng nhập</label>
              <input 
                type="text" 
                placeholder="Nhập username" 
                value={txtUsername}
                onChange={(e) => this.setState({ txtUsername: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '30px', border: '2px solid #000000', fontSize: '14px', color: '#000000', fontWeight: 'bold', boxSizing: 'border-box' }}
                required
              />
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '900', color: '#000000', marginBottom: '6px' }}>Mật khẩu</label>
              <input 
                type="password" 
                placeholder="Nhập mật khẩu" 
                value={txtPassword}
                onChange={(e) => this.setState({ txtPassword: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '30px', border: '2px solid #000000', fontSize: '14px', color: '#000000', fontWeight: 'bold', boxSizing: 'border-box' }}
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
              {loading ? 'ĐANG ĐĂNG NHẬP...' : '🔑 ĐĂNG NHẬP'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '25px', fontSize: '13px', color: '#000000', fontWeight: '600' }}>
            Chưa có tài khoản?{' '}
            <Link to="/signup" style={{ color: '#ff0000', fontWeight: '900' }}>
              Đăng ký tài khoản mới
            </Link>
          </div>

          <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '12px' }}>
            <Link to="/active" style={{ color: '#000000', fontWeight: 'bold', textDecoration: 'underline' }}>
              Nhập mã kích hoạt tài khoản
            </Link>
          </div>

        </div>
      </div>
    );
  }
}

export default withRouter(Login);
