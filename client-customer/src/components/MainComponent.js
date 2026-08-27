import React, { Component } from 'react';
import axios from 'axios';
import MyContext from '../contexts/MyContext';
import { Link, Routes, Route, Navigate } from 'react-router-dom';
import { withRouter } from '../utils/withRouter';

import Home from './HomeComponent';
import Product from './ProductComponent';
import ProductDetail from './ProductDetailComponent';
import Cart from './CartComponent';
import Login from './LoginComponent';
import Signup from './SignupComponent';
import Active from './ActiveComponent';
import Myprofile from './MyprofileComponent';
import Myorders from './MyordersComponent';
import Support from './SupportComponent';
import About from './AboutComponent';

class Main extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      searchKeyword: '',
      isChatOpen: false,
      connected: false,
      chatMessages: [
        { username: 'Hệ thống MPS', role: 'admin', text: '👋 Chào mừng bạn đến với Cửa hàng Phụ tùng MPS! Bạn cần tư vấn linh kiện xe máy nào hôm nay?' }
      ],
      userMsgInput: ''
    };
    this.socket = null;
  }

  componentDidMount() {
    this.apiGetCategories();
    this.initCustomerSocket();
  }

  componentWillUnmount() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  initCustomerSocket = () => {
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
          console.log('✅ Customer Socket connected!');
          this.setState({ connected: true });
          const { customer } = this.context;
          const username = customer ? customer.name : 'Khách hàng #' + Math.floor(Math.random() * 9000 + 1000);
          this.socket.emit('join', {
            username: username,
            role: 'customer'
          });
        });

        this.socket.on('disconnect', () => {
          console.log('❌ Customer Socket disconnected!');
          this.setState({ connected: false });
        });

        this.socket.on('messageHistory', (history) => {
          if (history && Array.isArray(history) && history.length > 0) {
            this.setState({ chatMessages: history });
          }
        });

        this.socket.on('message', (msg) => {
          this.setState(prevState => ({
            chatMessages: [...prevState.chatMessages, msg]
          }));
        });

        this.socket.on('systemMessage', (sysMsg) => {
          this.setState(prevState => ({
            chatMessages: [...prevState.chatMessages, {
              system: true,
              text: sysMsg.text
            }]
          }));
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
  };

  handleSendChatMessage = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const { userMsgInput } = this.state;
    if (!userMsgInput || !userMsgInput.trim()) return;

    const { customer } = this.context;
    const username = customer ? customer.name : 'Khách hàng #' + Math.floor(Math.random() * 9000 + 1000);

    if (this.socket) {
      this.socket.emit('chatMessage', {
        text: userMsgInput.trim(),
        username: username,
        role: 'customer'
      });
      this.setState({ userMsgInput: '' });
    }
  };

  apiGetCategories() {
    axios.get('/api/customer/categories')
      .then(res => {
        this.setState({ categories: res.data || [] });
      })
      .catch(err => {
        console.error("Lỗi lấy danh mục sản phẩm:", err.message);
      });
  }

  handleSearchSubmit = (e) => {
    e.preventDefault();
    const { searchKeyword } = this.state;
    if (searchKeyword.trim()) {
      this.props.router.navigate(`/products/search/${encodeURIComponent(searchKeyword.trim())}`);
    }
  };

  handleLogout = () => {
    this.context.setToken('');
    this.context.setCustomer(null);
    this.context.clearCart();
    this.props.router.navigate('/home');
  };

  render() {
    const { categories, searchKeyword } = this.state;
    const { customer, cart } = this.context;
    
    // Tổng số lượng sản phẩm trong giỏ hàng
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

    // Lấy ID danh mục đang active từ URL nếu có
    const currentPath = this.props.router.location.pathname;
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Header & Navigation */}
        <header className="header">
          <div className="container header-top">
            {/* Logo */}
            <Link to="/home" className="logo" onClick={() => { this.setState({ searchKeyword: '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src="/img/logo.png" alt="MPS Logo" style={{ height: '36px', width: '36px', borderRadius: '50%', border: '2px solid #ffffff', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
              <span>MPS</span>
            </Link>

            {/* Search Bar */}
            <form onSubmit={this.handleSearchSubmit} className="search-bar">
              <input 
                type="text" 
                placeholder="Tìm phụ kiện, đồ chơi xe..." 
                className="search-input"
                value={searchKeyword}
                onChange={(e) => this.setState({ searchKeyword: e.target.value })}
              />
              <button type="submit" className="search-btn">Tìm kiếm</button>
            </form>

            {/* User Menu & Cart */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              {/* Cart */}
              <Link to="/cart" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', position: 'relative', padding: '8px 16px', borderRadius: '8px', border: '2px solid #ffffff', background: '#000000', color: '#ffffff', transition: 'var(--transition)' }} className="cart-header-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ffffff' }}>
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
                Hộp hàng 
                <span style={{ background: '#ff0000', color: 'white', fontSize: '12px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '10px' }}>
                  {cartCount}
                </span>
              </Link>

              {/* Customer Account */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {customer ? (
                  <div className="user-profile-dropdown">
                    <div className="avatar-circle">
                      {customer.name ? customer.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <ul className="user-dropdown-menu">
                      <li style={{ padding: '8px 15px', borderBottom: '1px solid #000000', fontSize: '12px', color: '#000000', fontWeight: 'bold' }}>
                        Tài khoản: {customer.name}
                      </li>
                      <li><Link to="/myprofile">Cá nhân</Link></li>
                      <li><Link to="/myorders">Đơn hàng</Link></li>
                      <li>
                        <button onClick={this.handleLogout} className="logout-btn">
                          Đăng xuất
                        </button>
                      </li>
                    </ul>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <Link to="/login" style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>Đăng nhập</Link>
                    <Link to="/signup" style={{ fontSize: '14px', fontWeight: '600', padding: '8px 16px', borderRadius: '8px', background: '#000000', color: '#ffffff', border: '2px solid #000000' }}>Đăng ký</Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sub Navigation Bar - Categories list */}
          <nav className="nav-menu">
            <div className="container">
              <ul className="nav-list">
                <li className={`nav-item ${currentPath === '/home' || currentPath === '/' ? 'active' : ''}`}>
                  <Link to="/home">Trang Chủ</Link>
                </li>
                <li className={`nav-item has-dropdown ${currentPath.includes('/categories') || currentPath.includes('/products') ? 'active' : ''}`}>
                  <Link to="/categories">Danh Mục</Link>
                  <ul className="dropdown-menu">
                    {categories.map(cat => (
                      <li key={cat._id}>
                        <Link to={`/products/category/${cat._id}`}>{cat.name}</Link>
                      </li>
                    ))}
                  </ul>
                </li>
                <li className={`nav-item ${currentPath === '/support' ? 'active' : ''}`}>
                  <Link to="/support">Hỗ Trợ</Link>
                </li>
                <li className={`nav-item ${currentPath === '/about' ? 'active' : ''}`}>
                  <Link to="/about">Về Chúng Tôi</Link>
                </li>
              </ul>
            </div>
          </nav>
        </header>

        {/* Main Content Area */}
        <main className="container" style={{ flexGrow: 1, paddingBottom: '40px' }}>
          <Routes>
            <Route path="/" element={<Navigate replace to="/home" />} />
            <Route path="/home" element={<Home />} />
            <Route path="/categories" element={<Product />} />
            <Route path="/products" element={<Product />} />
            <Route path="/products/category/:cid" element={<Product />} />
            <Route path="/products/search/:keyword" element={<Product />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/active" element={<Active />} />
            <Route path="/myprofile" element={<Myprofile />} />
            <Route path="/myorders" element={<Myorders />} />
            <Route path="/support" element={<Support />} />
            <Route path="/about" element={<About />} />
            {/* Fallback */}
            <Route path="*" element={<Navigate replace to="/home" />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="footer">
          <div className="container">
            <div className="footer-grid">
              {/* Column 1 */}
              <div className="footer-col">
                <Link to="/home" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="footer-logo" style={{ color: '#ffffff', margin: 0, letterSpacing: '1px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <img src="/img/logo.png" alt="MPS" style={{ height: '30px', width: '30px', borderRadius: '50%', border: '1px solid #ffffff' }} onError={(e) => { e.target.style.display = 'none'; }} />
                  <span>MPS</span>
                </Link>
                <p style={{ margin: 0, marginTop: '8px' }}>
                  Cửa hàng phân phối phụ tùng xe máy chính hãng hàng đầu. Cung cấp linh kiện chất lượng cao, giao dịch an toàn và hỗ trợ kỹ thuật 24/7.
                </p>
              </div>

              {/* Column 2 */}
              <div className="footer-col">
                <h4>Khám Phá</h4>
                <ul className="footer-links">
                  <li><Link to="/home" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Trang chủ Store</Link></li>
                  <li><a href="/home#flash-sale" onClick={(e) => { e.preventDefault(); window.location.href = '/home#flash-sale'; }}>Khuyến mãi cực sốc</a></li>
                  <li><a href="/home#hot-products" onClick={(e) => { e.preventDefault(); window.location.href = '/home#hot-products'; }}>Phụ tùng bán chạy</a></li>
                  <li><Link to="/about">Về chúng tôi</Link></li>
                </ul>
              </div>

              {/* Column 3 */}
              <div className="footer-col">
                <h4>Tài Khoản &amp; Ví</h4>
                <ul className="footer-links">
                  <li><Link to="/login">Đăng nhập tài khoản</Link></li>
                  <li><Link to="/signup">Đăng ký thành viên</Link></li>
                  <li><Link to="/cart">Giỏ hàng &amp; Đơn mua</Link></li>
                  <li><Link to="/myprofile">Ưu đãi thành viên</Link></li>
                </ul>
              </div>

              {/* Column 4 */}
              <div className="footer-col">
                <h4>Hỗ Trợ &amp; Dịch Vụ</h4>
                <ul className="footer-links">
                  <li><Link to="/support#baohanh">Chính sách bảo hành</Link></li>
                  <li><Link to="/support#hoantien">Chính sách hoàn tiền</Link></li>
                  <li><Link to="/support#dieukhoan">Điều khoản &amp; Bảo mật</Link></li>
                  <li><Link to="/support#trogiup">Trung tâm trợ giúp 24/7</Link></li>
                </ul>
              </div>
            </div>

            <div className="footer-bottom">
              <p style={{ margin: 0 }}>&copy; {new Date().getFullYear()} MPS. All rights reserved.</p>
              <p style={{ margin: 0 }}>Powered by NhomCongTri.</p>
            </div>
          </div>
        </footer>

        {/* Floating Chat Widget (Bóng Chat Hỗ Trợ) */}
        <div style={{ position: 'fixed', bottom: '25px', right: '25px', zIndex: 9999 }}>
          {/* Chat Window Popup */}
          {this.state.isChatOpen && (
            <div style={{
              width: '340px',
              height: '430px',
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              marginBottom: '15px',
              border: '1px solid #e2e8f0'
            }}>
              {/* Header */}
              <div style={{ backgroundColor: 'var(--primary-color)', color: 'white', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>💬</span>
                  <div>
                    <strong style={{ fontSize: '13px', display: 'block' }}>Hỗ Trợ Trực Tuyến MPS</strong>
                    <span style={{ fontSize: '10px', opacity: 0.9 }}>
                      {this.state.connected ? '🟢 Trực tuyến' : '🔴 Đang kết nối lại...'}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => this.setState({ isChatOpen: false })} 
                  style={{ background: 'none', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer' }}
                >
                  ✖
                </button>
              </div>

              {/* Message List */}
              <div style={{ flex: 1, padding: '12px', overflowY: 'auto', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {this.state.chatMessages.map((msg, idx) => {
                  if (msg.system) {
                    return (
                      <div key={idx} style={{ alignSelf: 'center', fontSize: '11px', color: '#64748b', backgroundColor: '#e2e8f0', padding: '3px 10px', borderRadius: '10px', margin: '4px 0' }}>
                        {msg.text}
                      </div>
                    );
                  }
                  const isCustomer = msg.role === 'customer';
                  return (
                    <div 
                      key={idx} 
                      style={{
                        alignSelf: isCustomer ? 'flex-end' : 'flex-start',
                        maxWidth: '82%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isCustomer ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <span style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                        {msg.username || (isCustomer ? 'Bạn' : 'Admin')}
                      </span>
                      <div 
                        style={{
                          backgroundColor: isCustomer ? 'var(--primary-color)' : 'white',
                          color: isCustomer ? 'white' : '#1e293b',
                          padding: '8px 12px',
                          borderRadius: isCustomer ? '12px 12px 0 12px' : '12px 12px 12px 0',
                          fontSize: '13px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                          lineHeight: '1.4',
                          border: isCustomer ? 'none' : '1px solid #cbd5e1'
                        }}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Questions Tag Bar */}
              <div style={{ padding: '6px 10px', backgroundColor: '#f1f5f9', display: 'flex', gap: '6px', overflowX: 'auto' }}>
                {['Tư vấn Honda', 'Bảo hành', 'Thời gian ship'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      this.setState({ userMsgInput: tag }, () => {
                        this.handleSendChatMessage({ preventDefault: () => {} });
                      });
                    }}
                    style={{ backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '3px 8px', fontSize: '11px', whiteSpace: 'nowrap', cursor: 'pointer', color: '#475569' }}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Input Box */}
              <form onSubmit={this.handleSendChatMessage} style={{ display: 'flex', borderTop: '1px solid #e2e8f0' }}>
                <input 
                  type="text" 
                  placeholder="Nhập tin nhắn..." 
                  value={this.state.userMsgInput}
                  onChange={(e) => this.setState({ userMsgInput: e.target.value })}
                  style={{ flex: 1, padding: '10px 12px', border: 'none', outline: 'none', fontSize: '13px' }}
                />
                <button 
                  type="submit" 
                  style={{ backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', padding: '0 16px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Gửi
                </button>
              </form>
            </div>
          )}

          {/* Floating Bubble Button */}
          <button
            onClick={() => this.setState(prev => ({ isChatOpen: !prev.isChatOpen }))}
            style={{
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: '50px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(255, 0, 0, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'transform 0.2s'
            }}
          >
            <span>💬</span> {this.state.isChatOpen ? 'Đóng Chat' : 'Hỗ Trợ Trực Tuyến'}
          </button>
        </div>
      </div>
    );
  }
}

export default withRouter(Main);
