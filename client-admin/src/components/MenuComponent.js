import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import { Link } from 'react-router-dom';

class Menu extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      activeTab: 'home'
    };
  }

  render() {
    return (
      <div className="admin-navbar">
        <div className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/img/logo.png" alt="MPS Logo" style={{ height: '32px', width: '32px', borderRadius: '50%', border: '1px solid #ffffff', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
          <span>ADMIN</span>
        </div>
        <div>
          <ul className="menu-list">
            <li className="menu-item">
              <Link 
                to="/admin/home" 
                className={this.state.activeTab === 'home' ? 'active-link' : ''}
                onClick={() => this.setState({ activeTab: 'home' })}
              >
                Trang chủ
              </Link>
            </li>
            <li className="menu-item">
              <Link 
                to="/admin/category" 
                className={this.state.activeTab === 'category' ? 'active-link' : ''}
                onClick={() => this.setState({ activeTab: 'category' })}
              >
                Danh mục
              </Link>
            </li>
            <li className="menu-item">
              <Link 
                to="/admin/product" 
                className={this.state.activeTab === 'product' ? 'active-link' : ''}
                onClick={() => this.setState({ activeTab: 'product' })}
              >
                Sản phẩm
              </Link>
            </li>
            <li className="menu-item">
              <Link 
                to="/admin/order" 
                className={this.state.activeTab === 'order' ? 'active-link' : ''}
                onClick={() => this.setState({ activeTab: 'order' })}
              >
                Đơn hàng
              </Link>
            </li>
            <li className="menu-item">
              <Link 
                to="/admin/customer" 
                className={this.state.activeTab === 'customer' ? 'active-link' : ''}
                onClick={() => this.setState({ activeTab: 'customer' })}
              >
                Khách hàng
              </Link>
            </li>
            <li className="menu-item">
              <Link 
                to="/admin/members" 
                className={this.state.activeTab === 'members' ? 'active-link' : ''}
                onClick={() => this.setState({ activeTab: 'members' })}
              >
                Hội viên
              </Link>
            </li>
            <li className="menu-item">
              <Link 
                to="/admin/vouchers" 
                className={this.state.activeTab === 'vouchers' ? 'active-link' : ''}
                onClick={() => this.setState({ activeTab: 'vouchers' })}
              >
                Mã giảm giá
              </Link>
            </li>
            <li className="menu-item">
              <Link 
                to="/admin/support" 
                className={this.state.activeTab === 'support' ? 'active-link' : ''}
                onClick={() => this.setState({ activeTab: 'support' })}
              >
                Hỗ trợ
              </Link>
            </li>
          </ul>
        </div>
        <div className="user-badge">
          <span>Xin chào, <b style={{ color: '#ff0000' }}>{this.context.username}</b></span>
          <button
            onClick={() => this.lnkLogoutClick()}
            className="logout-btn"
          >
            Thoát
          </button>
        </div>
      </div>
    );
  }

  lnkLogoutClick() {
    this.context.setToken('');
    this.context.setUsername('');
  }
}

export default Menu;
