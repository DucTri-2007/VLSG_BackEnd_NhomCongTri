import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { withRouter } from '../utils/withRouter';

class Active extends Component {
  constructor(props) {
    super(props);
    this.state = {
      txtID: '',
      txtToken: '',
      loading: false,
      errorMsg: '',
      successMsg: ''
    };
  }

  componentDidMount() {
    // Tự động phân tách query parameters nếu có (ví dụ: ?id=xxx&token=yyy)
    const searchParams = new URLSearchParams(this.props.router.location.search);
    const id = searchParams.get('id');
    const token = searchParams.get('token');
    
    if (id && token) {
      this.setState({ txtID: id, txtToken: token }, () => {
        this.handleActiveAuto();
      });
    }
  }

  handleActiveAuto() {
    this.setState({ loading: true, errorMsg: '', successMsg: '' });
    const body = {
      id: this.state.txtID,
      token: this.state.txtToken
    };
    axios.post('/api/customer/active', body)
      .then(res => {
        this.setState({ loading: false });
        if (res.data && res.data.success) {
          this.setState({ successMsg: res.data.message || 'Kích hoạt tài khoản thành công!' });
          alert("Kích hoạt tài khoản thành công! Bạn có thể đăng nhập để mua hàng ngay bây giờ.");
          this.props.router.navigate('/login');
        } else {
          this.setState({ errorMsg: res.data.message || 'Mã kích hoạt không đúng hoặc tài khoản của bạn đã được kích hoạt!' });
        }
      })
      .catch(err => {
        this.setState({ loading: false, errorMsg: 'Có lỗi xảy ra kết nối máy chủ khi kích hoạt tài khoản.' });
        console.error("Lỗi kích hoạt:", err.message);
      });
  }

  handleActiveManual = (e) => {
    e.preventDefault();
    const { txtID, txtToken } = this.state;
    if (!txtID || !txtToken) {
      this.setState({ errorMsg: 'Vui lòng điền đầy đủ cả ID tài khoản và Mã kích hoạt!' });
      return;
    }
    this.handleActiveAuto();
  };

  render() {
    const { txtID, txtToken, loading, errorMsg, successMsg } = this.state;

    return (
      <div className="fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 0', minHeight: '60vh' }}>
        <div style={{ width: '100%', maxWidth: '450px', backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-lg)', padding: '40px 35px' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <span style={{ fontSize: '40px' }}>🔑</span>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-dark)', marginTop: '10px' }}>KÍCH HOẠT TÀI KHOẢN</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '5px' }}>Nhập mã kích hoạt được gửi trong email đăng ký</p>
          </div>

          {/* Feedback */}
          {errorMsg && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 15px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', fontWeight: '500' }}>
              ⚠️ {errorMsg}
            </div>
          )}
          {successMsg && (
            <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '12px 15px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', fontWeight: '500' }}>
              ✅ {successMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={this.handleActiveManual}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-dark)', marginBottom: '8px' }}>ID tài khoản (Account ID)</label>
              <input 
                type="text" 
                placeholder="Nhập ID tài khoản của bạn" 
                value={txtID}
                onChange={(e) => this.setState({ txtID: e.target.value })}
                style={{ width: '100%', padding: '10px 16px', borderRadius: '30px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '14px' }}
                required
              />
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-dark)', marginBottom: '8px' }}>Mã kích hoạt (Token)</label>
              <input 
                type="text" 
                placeholder="Nhập mã token kích hoạt" 
                value={txtToken}
                onChange={(e) => this.setState({ txtToken: e.target.value })}
                style={{ width: '100%', padding: '10px 16px', borderRadius: '30px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '14px' }}
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                width: '100%', 
                backgroundColor: 'var(--primary-color)', 
                color: 'white', 
                border: 'none', 
                padding: '12px', 
                borderRadius: '30px', 
                fontWeight: '700', 
                cursor: 'pointer', 
                boxShadow: 'var(--shadow-md)', 
                fontSize: '15px', 
                transition: 'var(--transition)' 
              }}
            >
              {loading ? 'ĐANG KÍCH HOẠT...' : '⚡ KÍCH HOẠT NGAY'}
            </button>
          </form>

          {/* Redirect to Login */}
          <div style={{ textAlign: 'center', marginTop: '25px', fontSize: '13px', color: 'var(--text-light)' }}>
            Quay lại trang{' '}
            <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: '600' }}>
              Đăng nhập khách hàng
            </Link>
          </div>

        </div>
      </div>
    );
  }
}

export default withRouter(Active);
