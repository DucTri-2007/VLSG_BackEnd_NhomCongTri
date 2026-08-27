import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { withRouter } from '../utils/withRouter';

class Cart extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      isSubmitting: false,
      shippingAddress: '',
      shippingPhone: '',
      note: '',
      paymentMethod: 'WALLET', // 'WALLET', 'QR', 'COD'
      voucherCodeInput: '',
      appliedVoucher: null,
      availableVouchers: [],
      showQRModal: false,
      lastTotal: 0,
      freshWalletBalance: 1000000,
      freshPoints: 0,
      freshTier: 'Đồng'
    };
  }

  componentDidMount() {
    const { customer } = this.context;
    if (customer && customer.phone) {
      this.setState({ shippingPhone: customer.phone });
    }
    this.apiGetVouchers();
    if (customer && customer._id) {
      this.apiGetProfile(customer._id);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { customer } = this.context;
    if (customer && customer.phone && !this.state.shippingPhone && !prevState.shippingPhone) {
      this.setState({ shippingPhone: customer.phone });
    }
  }

  apiGetVouchers() {
    axios.get('/api/customer/vouchers')
      .then(res => {
        this.setState({ availableVouchers: res.data || [] });
      })
      .catch(err => console.error("Lỗi tải vouchers:", err.message));
  }

  apiGetProfile(id) {
    axios.get(`/api/customer/profile/${id}`)
      .then(res => {
        if (res.data && res.data.customer) {
          const c = res.data.customer;
          this.setState({
            freshWalletBalance: c.walletBalance !== undefined ? c.walletBalance : 1000000,
            freshPoints: c.points || 0,
            freshTier: c.membershipTier || 'Đồng'
          });
        }
      })
      .catch(err => console.error("Lỗi tải thông tin ví:", err.message));
  }

  formatCurrency(value) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }

  getProductImageUrl(image) {
    if (!image) return '/img/bo_thang_honda.jpg';
    if (image.startsWith('data:') || image.startsWith('http://') || image.startsWith('https://')) return image;
    if (image.startsWith('/')) return image;
    if (image.includes('.') || image.endsWith('.jpg') || image.endsWith('.png')) return '/img/' + image;
    return `data:image/jpeg;base64,${image}`;
  }

  handleAddressChange = (e) => {
    let val = e.target.value;
    val = val.replace(/([^\s\-])\s{2,}$/g, '$1 - ');
    this.setState({ shippingAddress: val });
  };

  handleApplyVoucher = (codeToApply) => {
    const { customer } = this.context;
    const code = (codeToApply || this.state.voucherCodeInput).trim().toUpperCase();
    if (!code) {
      alert("Vui lòng nhập mã giảm giá!");
      return;
    }

    const body = {
      code: code,
      customerId: customer ? customer._id : null,
      userTier: this.state.freshTier || 'Đồng'
    };

    axios.post('/api/customer/vouchers/validate', body)
      .then(res => {
        if (res.data && res.data.success) {
          this.setState({ appliedVoucher: res.data.voucher, voucherCodeInput: code });
          alert(`🎉 Đã áp dụng Mã giảm giá ${code}: Giảm ${res.data.voucher.discountPercent}%!`);
        } else {
          alert(res.data.message || "Mã giảm giá không hợp lệ!");
        }
      })
      .catch(err => {
        console.error("Lỗi áp dụng voucher:", err.message);
        alert("Không thể áp dụng mã giảm giá lúc này!");
      });
  };

  handleCheckoutClick = () => {
    const { customer, cart } = this.context;
    const { shippingAddress, shippingPhone, paymentMethod } = this.state;
    
    if (!customer) {
      alert("Vui lòng đăng nhập trước khi tiến hành thanh toán!");
      this.props.router.navigate('/login');
      return;
    }

    if (cart.length === 0) {
      alert("Giỏ hàng của bạn đang trống!");
      return;
    }

    if (!shippingAddress || !shippingAddress.trim()) {
      alert("Vui lòng nhập Địa chỉ giao hàng!");
      return;
    }

    if (!shippingPhone || !shippingPhone.trim()) {
      alert("Vui lòng nhập Số điện thoại nhận hàng!");
      return;
    }

    if (paymentMethod === 'QR') {
      const rawTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      const discount = this.state.appliedVoucher ? Math.round((rawTotal * this.state.appliedVoucher.discountPercent) / 100) : 0;
      const finalTotal = Math.max(0, rawTotal - discount);
      this.setState({ showQRModal: true, lastTotal: finalTotal });
    } else {
      this.executeCheckout();
    }
  };

  executeCheckout = () => {
    const { token, customer, cart, clearCart } = this.context;
    const { shippingAddress, shippingPhone, note, paymentMethod, appliedVoucher } = this.state;

    this.setState({ isSubmitting: true });
    
    // Attach BOTH headers to guarantee token validation success!
    const config = {
      headers: {
        'x-access-token': token,
        'Authorization': `Bearer ${token}`
      }
    };
    
    const body = {
      cart: cart,
      customer: customer,
      shippingAddress: shippingAddress.trim(),
      shippingPhone: shippingPhone.trim(),
      note: note.trim(),
      paymentMethod: paymentMethod,
      voucherCode: appliedVoucher ? appliedVoucher.code : ''
    };

    axios.post('/api/customer/checkout', body, config)
      .then(res => {
        this.setState({ isSubmitting: false, showQRModal: false });
        if (res.data && res.data.success) {
          alert(`🎉 ĐẶT HÀNG THÀNH CÔNG!\n${res.data.message}`);
          clearCart();
          this.props.router.navigate('/myorders');
        } else {
          alert(res.data.message || "Đặt hàng thất bại, vui lòng kiểm tra lại!");
        }
      })
      .catch(err => {
        this.setState({ isSubmitting: false });
        console.error("Lỗi đặt hàng thanh toán:", err.message);
        alert("Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại sau!");
      });
  };

  render() {
    const { cart, updateCartQuantity, removeFromCart, customer } = this.context;
    const { isSubmitting, shippingAddress, shippingPhone, note, paymentMethod, voucherCodeInput, appliedVoucher, availableVouchers, freshWalletBalance, freshPoints, freshTier } = this.state;
    
    if (cart.length === 0) {
      return (
        <div className="info-message" style={{ marginTop: '50px' }}>
          <span style={{ fontSize: '50px' }}>🛒</span>
          <h3 style={{ marginTop: '20px' }}>Giỏ hàng của bạn trống</h3>
          <p>Hãy thêm các sản phẩm phụ kiện xe yêu thích vào giỏ hàng và quay lại đây để đặt hàng.</p>
          <Link to="/home" className="back-btn" style={{ marginTop: '20px', textDecoration: 'none' }}>
            Mua sắm ngay
          </Link>
        </div>
      );
    }

    const rawTotalAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const discountAmount = appliedVoucher ? Math.round((rawTotalAmount * appliedVoucher.discountPercent) / 100) : 0;
    const finalAmount = Math.max(0, rawTotalAmount - discountAmount);
    const pointsEarned = Math.round(finalAmount * 0.10);

    return (
      <div className="fade-in" style={{ marginTop: '30px' }}>
        <div className="section-header">
          <h2 className="section-title">GIỎ HÀNG CỦA BẠN</h2>
          <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>Bạn có {cart.length} sản phẩm trong giỏ hàng</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', alignItems: 'start' }} className="cart-grid-layout">
          {/* Cart Table List */}
          <div style={{ backgroundColor: 'white', borderRadius: 'var(--border-radius)', border: '2px solid #000000', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', padding: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #000000', color: '#ffffff', backgroundColor: '#000000', fontWeight: 'bold' }}>
                  <th style={{ padding: '12px 10px', color: '#ffffff' }}>Ảnh</th>
                  <th style={{ padding: '12px 10px', color: '#ffffff' }}>Tên sản phẩm</th>
                  <th style={{ padding: '12px 10px', color: '#ffffff' }}>Đơn giá</th>
                  <th style={{ padding: '12px 10px', textAlign: 'center', color: '#ffffff' }}>Số lượng</th>
                  <th style={{ padding: '12px 10px', textAlign: 'right', color: '#ffffff' }}>Thành tiền</th>
                  <th style={{ padding: '12px 10px', textAlign: 'center', color: '#ffffff' }}>Xóa</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => {
                  const subTotal = item.product.price * item.quantity;
                  const stock = item.product.quantity !== undefined ? item.product.quantity : 0;
                  return (
                    <tr key={item.product._id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.2s' }} className="cart-row">
                      <td style={{ padding: '15px 10px' }}>
                        <img 
                          src={this.getProductImageUrl(item.product.image)} 
                          alt={item.product.name} 
                          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #000000' }}
                        />
                      </td>
                      <td style={{ padding: '15px 10px' }}>
                        <Link to={`/product/${item.product._id}`} style={{ fontWeight: '900', color: '#000000', textDecoration: 'none' }}>
                          {item.product.name}
                        </Link>
                        <div style={{ fontSize: '11px', color: '#000000', fontWeight: '600', marginTop: '4px' }}>
                          Kho còn lại: {stock}
                        </div>
                      </td>
                      <td style={{ padding: '15px 10px', color: '#000000', fontWeight: 'bold' }}>
                        {this.formatCurrency(item.product.price)}
                      </td>
                      <td style={{ padding: '15px 10px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', border: '2px solid #000000', borderRadius: '20px', padding: '2px 8px', backgroundColor: '#ffffff' }}>
                          <button 
                            onClick={() => updateCartQuantity(item.product._id, item.quantity - 1)} 
                            style={{ background: 'none', border: 'none', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', color: '#000000', padding: '0 6px' }}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span style={{ fontSize: '14px', fontWeight: '800', minWidth: '20px', textAlign: 'center', color: '#000000' }}>
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateCartQuantity(item.product._id, item.quantity + 1)} 
                            style={{ background: 'none', border: 'none', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', color: '#000000', padding: '0 6px' }}
                            disabled={item.quantity >= stock}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '15px 10px', textAlign: 'right', fontWeight: '900', color: '#ff0000' }}>
                        {this.formatCurrency(subTotal)}
                      </td>
                      <td style={{ padding: '15px 10px', textAlign: 'center' }}>
                        <button 
                          onClick={() => {
                            if (window.confirm(`Xóa sản phẩm "${item.product.name}" khỏi giỏ hàng?`)) {
                              removeFromCart(item.product._id);
                            }
                          }}
                          style={{ background: 'none', border: 'none', color: '#ff0000', cursor: 'pointer', fontSize: '18px' }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Checkout Block / Order Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: 'var(--border-radius)', border: '2px solid #000000', boxShadow: 'var(--shadow-sm)', padding: '25px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '15px', color: '#000000', borderBottom: '2px solid #000000', paddingBottom: '10px', textTransform: 'uppercase' }}>
                TÓM TẮT ĐƠN HÀNG
              </h3>

              {/* Loyalty Points Award Preview */}
              <div style={{ backgroundColor: '#fff1f2', border: '2px solid #ff0000', padding: '10px 14px', borderRadius: '8px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#ff0000', fontWeight: 'bold', display: 'block' }}>💎 TÍCH ĐIỂM HỘI VIÊN (10%):</span>
                  <span style={{ fontSize: '11px', color: '#000000', fontWeight: 'bold' }}>Hạng hiện tại: <strong>{freshTier}</strong> ({freshPoints} pts)</span>
                </div>
                <span style={{ fontSize: '16px', fontWeight: '900', color: '#ff0000' }}>+{pointsEarned.toLocaleString('vi-VN')} pts</span>
              </div>

              {/* Voucher Selector Block */}
              <div style={{ marginBottom: '15px', padding: '12px', backgroundColor: '#fff5f5', borderRadius: '8px', border: '2px solid #ff0000' }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#ff0000', display: 'block', marginBottom: '6px' }}>
                  🎟️ Mã Giảm Giá Voucher (Theo Hạng):
                </label>

                {availableVouchers.length > 0 && (
                  <select
                    onChange={(e) => {
                      if (e.target.value) this.handleApplyVoucher(e.target.value);
                    }}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '2px solid #000000', fontSize: '12px', marginBottom: '8px', backgroundColor: 'white', color: '#000000', fontWeight: 'bold' }}
                  >
                    <option value="">-- Chọn Voucher Ưu Đãi Hạng Hội Viên --</option>
                    {availableVouchers.map(v => (
                      <option key={v._id} value={v.code}>
                        {v.code} - Giảm {v.discountPercent}% (Yêu cầu: Hạng {v.minTier || 'Đồng'})
                      </option>
                    ))}
                  </select>
                )}

                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    placeholder="Nhập mã code... (VD: COPPER20)"
                    value={voucherCodeInput}
                    onChange={(e) => this.setState({ voucherCodeInput: e.target.value })}
                    style={{ flex: 1, padding: '8px 10px', borderRadius: '6px', border: '2px solid #000000', fontSize: '12px', textTransform: 'uppercase', color: '#000000', fontWeight: 'bold' }}
                  />
                  <button
                    onClick={() => this.handleApplyVoucher()}
                    style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', backgroundColor: '#ff0000', color: 'white', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                  >
                    Áp dụng
                  </button>
                </div>

                {appliedVoucher && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#16a34a', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>✅ Đã dùng mã {appliedVoucher.code} (-{appliedVoucher.discountPercent}%)</span>
                    <button onClick={() => this.setState({ appliedVoucher: null, voucherCodeInput: '' })} style={{ border: 'none', background: 'none', color: '#ff0000', cursor: 'pointer', fontSize: '11px', textDecoration: 'underline' }}>Hủy mã</button>
                  </div>
                )}
              </div>

              {/* Price Details */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#000000', fontSize: '14px', fontWeight: '600' }}>
                <span>Tạm tính:</span>
                <span style={{ color: '#000000', fontWeight: '800' }}>{this.formatCurrency(rawTotalAmount)}</span>
              </div>
              
              {appliedVoucher && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#ff0000', fontSize: '14px', fontWeight: 'bold' }}>
                  <span>Giảm giá ({appliedVoucher.code}):</span>
                  <span>-{this.formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: '#000000', fontSize: '14px', fontWeight: '600' }}>
                <span>Phí vận chuyển:</span>
                <span style={{ color: '#ff0000', fontWeight: '800' }}>Miễn phí (Freeship)</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px dashed #000000', paddingTop: '12px', marginBottom: '20px' }}>
                <span style={{ fontWeight: '900', color: '#000000' }}>Tổng thanh toán:</span>
                <span style={{ fontWeight: '900', color: '#ff0000', fontSize: '22px' }}>{this.formatCurrency(finalAmount)}</span>
              </div>

              {/* Payment Methods Selector */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '900', marginBottom: '10px', color: '#000000', textTransform: 'uppercase' }}>Phương Thức Thanh Toán:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Option 1: Ví MPS Wallet */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', border: paymentMethod === 'WALLET' ? '2px solid #ff0000' : '2px solid #000000', backgroundColor: paymentMethod === 'WALLET' ? '#fff1f2' : 'white', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="WALLET" 
                      checked={paymentMethod === 'WALLET'} 
                      onChange={(e) => this.setState({ paymentMethod: e.target.value })} 
                    />
                    <div>
                      <strong style={{ fontSize: '13px', color: '#ff0000', display: 'block' }}>💳 Ví Thanh Toán MPS Wallet</strong>
                      <span style={{ fontSize: '11px', color: '#000000', fontWeight: 'bold' }}>Số dư ví hiện tại: <strong>{freshWalletBalance.toLocaleString('vi-VN')} đ</strong></span>
                    </div>
                  </label>

                  {/* Option 2: QR Code */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', border: paymentMethod === 'QR' ? '2px solid #ff0000' : '2px solid #000000', backgroundColor: paymentMethod === 'QR' ? '#fff1f2' : 'white', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="QR" 
                      checked={paymentMethod === 'QR'} 
                      onChange={(e) => this.setState({ paymentMethod: e.target.value })} 
                    />
                    <div>
                      <strong style={{ fontSize: '13px', color: '#000000', display: 'block' }}>📲 Mã QR Code Ngân Hàng</strong>
                      <span style={{ fontSize: '11px', color: '#000000', fontWeight: '600' }}>Quét mã QR chuyển khoản ngay</span>
                    </div>
                  </label>

                  {/* Option 3: COD */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', border: paymentMethod === 'COD' ? '2px solid #ff0000' : '2px solid #000000', backgroundColor: paymentMethod === 'COD' ? '#fff1f2' : 'white', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="COD" 
                      checked={paymentMethod === 'COD'} 
                      onChange={(e) => this.setState({ paymentMethod: e.target.value })} 
                    />
                    <div>
                      <strong style={{ fontSize: '13px', color: '#000000', display: 'block' }}>💵 Thanh Toán Khi Nhận Hàng (COD)</strong>
                      <span style={{ fontSize: '11px', color: '#000000', fontWeight: '600' }}>Nhận phụ tùng đồng kiểm rồi thanh toán</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Checkout Form & Button */}
              {customer ? (
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '900', marginBottom: '10px', color: '#000000', textTransform: 'uppercase' }}>Thông Tin Giao Hàng:</h4>
                  <div style={{ fontSize: '13px', color: '#000000', backgroundColor: '#ffffff', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '2px solid #000000', lineHeight: '1.6' }}>
                    <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>🧑 <strong>Người nhận:</strong> {customer.name} ({customer.email})</p>
                    
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontWeight: '900', color: '#000000', marginBottom: '4px' }}>
                        🏠 Địa chỉ giao hàng <span style={{ color: 'red' }}>*</span>:
                      </label>
                      <input 
                        type="text" 
                        placeholder="Số nhà, đường... (nhấn 2 lần space để thêm '-')" 
                        value={shippingAddress}
                        onChange={this.handleAddressChange}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '2px solid #000000', fontSize: '13px', boxSizing: 'border-box', color: '#000000', fontWeight: 'bold' }}
                      />
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontWeight: '900', color: '#000000', marginBottom: '4px' }}>
                        📞 Số điện thoại nhận hàng <span style={{ color: 'red' }}>*</span>:
                      </label>
                      <input 
                        type="text" 
                        placeholder="Nhập số điện thoại..." 
                        value={shippingPhone}
                        onChange={(e) => this.setState({ shippingPhone: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '2px solid #000000', fontSize: '13px', boxSizing: 'border-box', color: '#000000', fontWeight: 'bold' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: '900', color: '#000000', marginBottom: '4px' }}>
                        📝 Ghi chú cho shop:
                      </label>
                      <textarea 
                        placeholder="Ghi chú thêm..." 
                        value={note}
                        onChange={(e) => this.setState({ note: e.target.value })}
                        rows={2}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '2px solid #000000', fontSize: '13px', boxSizing: 'border-box', color: '#000000', fontWeight: 'bold', resize: 'vertical' }}
                      />
                    </div>
                  </div>
                  <button 
                    onClick={this.handleCheckoutClick}
                    disabled={isSubmitting}
                    style={{ 
                      width: '100%',
                      backgroundColor: '#ff0000',
                      color: 'white',
                      border: 'none',
                      padding: '14px',
                      borderRadius: '30px',
                      fontWeight: '900',
                      cursor: 'pointer',
                      fontSize: '16px',
                      boxShadow: '0 4px 12px rgba(255,0,0,0.3)',
                      transition: 'all 0.2s'
                    }}
                  >
                    {isSubmitting ? 'ĐANG XỬ LÝ ĐƠN HÀNG...' : '👉 TIẾN HÀNH ĐẶT HÀNG'}
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', backgroundColor: '#fff5f5', border: '2px solid #ff0000', padding: '15px', borderRadius: '8px' }}>
                  <p style={{ fontSize: '13px', color: '#ff0000', marginBottom: '15px', fontWeight: 'bold' }}>
                    ⚠️ Vui lòng đăng nhập tài khoản khách hàng để tiến hành thanh toán đơn hàng.
                  </p>
                  <Link to="/login" style={{ display: 'inline-block', backgroundColor: '#000000', color: 'white', fontWeight: 'bold', padding: '8px 20px', borderRadius: '30px', textDecoration: 'none', fontSize: '13px' }}>
                    Đăng nhập ngay
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* QR Code Payment Modal */}
        {this.state.showQRModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', maxWidth: '480px', width: '100%', textAlign: 'center', border: '3px solid #ff0000' }}>
              <span style={{ fontSize: '40px' }}>📱</span>
              <h3 style={{ margin: '10px 0 5px 0', fontSize: '20px', color: '#000000', fontWeight: '900' }}>Mã QR Thanh Toán Đơn Hàng</h3>
              <p style={{ fontSize: '13px', color: '#000000', marginBottom: '15px', fontWeight: '600' }}>Quét mã QR dưới đây để thực hiện chuyển khoản thanh toán đơn hàng.</p>
              
              <div style={{ padding: '15px', backgroundColor: '#fff5f5', borderRadius: '12px', border: '2px solid #000000', marginBottom: '15px' }}>
                <img 
                  src="/img/qr.png" 
                  alt="Mã QR Thanh Toán" 
                  style={{ width: '220px', height: '220px', objectFit: 'contain', borderRadius: '8px', margin: '0 auto', display: 'block' }}
                />
                <div style={{ marginTop: '10px', fontSize: '16px', fontWeight: '900', color: '#ff0000' }}>
                  Tổng tiền thanh toán: {this.formatCurrency(this.state.lastTotal)}
                </div>
                <div style={{ fontSize: '12px', color: '#000000', marginTop: '5px', fontWeight: 'bold' }}>
                  Nội dung CK: <strong style={{ color: '#ff0000' }}>{customer ? customer.name : ''} - MPS AutoGear</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                <button
                  onClick={this.executeCheckout}
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: '#ff0000',
                    color: 'white',
                    border: 'none',
                    padding: '14px 25px',
                    borderRadius: '30px',
                    fontWeight: '900',
                    cursor: 'pointer',
                    fontSize: '15px',
                    width: '100%'
                  }}
                >
                  {isSubmitting ? 'ĐANG GỬI ĐƠN HÀNG...' : '✅ Tôi đã chuyển khoản & Hoàn tất đặt hàng'}
                </button>
                <button
                  onClick={() => this.setState({ showQRModal: false })}
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

export default withRouter(Cart);
