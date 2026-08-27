import React, { Component } from 'react';
import axios from 'axios';
import MyContext from '../contexts/MyContext';
import { Link } from 'react-router-dom';
import { withRouter } from '../utils/withRouter';

class Myorders extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      loading: true,
      selectedOrder: null,
      showQRModal: false,
      showReviewModal: false,
      reviewProduct: null,
      rating: 5,
      comment: '',
      isSubmittingReview: false
    };
  }

  componentDidMount() {
    this.fetchOrders();
  }

  fetchOrders() {
    const { customer, token } = this.context;
    if (!customer) {
      alert("Vui lòng đăng nhập trước khi xem lịch sử đơn hàng!");
      this.props.router.navigate('/login');
      return;
    }

    const config = {
      headers: { 'Authorization': `Bearer ${token}` }
    };

    this.setState({ loading: true });

    axios.get(`/api/customer/orders/customer/${customer._id}`, config)
      .then(res => {
        const rawOrders = res.data || [];
        const reversed = [...rawOrders].reverse(); // Đơn hàng mới nhất lên đầu
        this.setState({
          orders: reversed,
          loading: false,
          selectedOrder: reversed.length > 0 ? reversed[0] : null
        });
      })
      .catch(err => {
        console.error("Lỗi lấy lịch sử đơn hàng:", err.message);
        this.setState({ loading: false });
      });
  }

  handleCancelOrder = (orderId) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này? Tất cả số lượng hàng sẽ được hoàn lại kho.")) {
      const { token } = this.context;
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      axios.put(`/api/customer/orders/cancel/${orderId}`, {}, config)
        .then(res => {
          if (res.data && res.data.success) {
            alert(res.data.message || "Đã hủy đơn hàng thành công!");
            this.fetchOrders(); // load lại danh sách đơn hàng
          } else {
            alert(res.data.message || "Hủy đơn hàng thất bại!");
          }
        })
        .catch(err => {
          console.error("Lỗi hủy đơn hàng:", err.message);
          alert("Lỗi máy chủ trong quá trình hủy đơn hàng!");
        });
    }
  };

  handleReviewImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        this.setState({ reviewImage: evt.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  handleSubmitReview = () => {
    const { reviewProduct, rating, comment, reviewImage } = this.state;
    const { token, customer } = this.context;
    if (!reviewProduct || !comment.trim()) {
      alert("Vui lòng nhập nhận xét của bạn!");
      return;
    }

    this.setState({ isSubmittingReview: true });
    const config = { headers: { 'Authorization': `Bearer ${token}` } };
    const body = {
      rating: rating,
      comment: comment.trim(),
      customerName: customer ? customer.name : 'Khách hàng',
      image: reviewImage || ''
    };

    axios.post(`/api/customer/products/${reviewProduct._id}/review`, body, config)
      .then(res => {
        this.setState({ isSubmittingReview: false });
        if (res.data && res.data.success) {
          alert("Cảm ơn bạn đã gửi đánh giá sản phẩm thành công!");
          this.setState({ showReviewModal: false, reviewProduct: null, comment: '', rating: 5, reviewImage: '' });
        } else {
          alert(res.data.message || "Gửi đánh giá thất bại!");
        }
      })
      .catch(err => {
        this.setState({ isSubmittingReview: false });
        console.error("Lỗi gửi đánh giá:", err.message);
        alert("Không thể gửi đánh giá. Vui lòng thử lại sau!");
      });
  };

  formatCurrency(value) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }

  getProductImageUrl(image) {
    if (!image) return 'https://placehold.co/40x40?text=No+Img';
    if (image.startsWith('data:image/') || image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    return `data:image/jpeg;base64,${image}`;
  }

  getStatusInfo(status) {
    switch (status) {
      case 'PENDING':
        return { text: 'Chờ xác nhận', color: '#d97706', bg: '#fef3c7', step: 1 };
      case 'APPROVED':
        return { text: 'Chờ lấy hàng', color: '#2563eb', bg: '#dbeafe', step: 2 };
      case 'SHIPPING':
        return { text: 'Đang giao hàng', color: '#0891b2', bg: '#cff4fc', step: 3 };
      case 'DELIVERED':
        return { text: 'Đã giao hàng', color: '#16a34a', bg: '#dcfce7', step: 4 };
      case 'CANCELED':
        return { text: 'Đã hủy', color: '#dc2626', bg: '#fee2e2', step: 0 };
      default:
        return { text: status, color: '#64748b', bg: '#f1f5f9', step: 1 };
    }
  }

  renderDeliveryTimeline(status) {
    if (status === 'CANCELED') {
      return (
        <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold', fontSize: '13px', textAlign: 'center' }}>
          ❌ Đơn hàng này đã bị hủy.
        </div>
      );
    }

    const currentStep = this.getStatusInfo(status).step;
    const steps = [
      { num: 1, title: 'Chờ xác nhận', icon: '🕒' },
      { num: 2, title: 'Chờ lấy hàng', icon: '📦' },
      { num: 3, title: 'Đang giao hàng', icon: '🚚' },
      { num: 4, title: 'Đã giao hàng', icon: '🎉' }
    ];

    return (
      <div style={{ backgroundColor: '#f8fafc', padding: '20px 15px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          🚚 Quá Trình Giao Hàng Realtime:
        </h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          {/* Progress bar line */}
          <div style={{ position: 'absolute', top: '18px', left: '10%', right: '10%', height: '4px', backgroundColor: '#e2e8f0', zIndex: 1 }}>
            <div style={{ height: '100%', backgroundColor: 'var(--primary-color)', transition: 'width 0.4s ease', width: `${((Math.max(1, currentStep) - 1) / 3) * 100}%` }}></div>
          </div>

          {steps.map(s => {
            const isActive = currentStep >= s.num;
            const isCurrent = currentStep === s.num;
            return (
              <div key={s.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flex: 1, textAlign: 'center' }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%', 
                  backgroundColor: isActive ? 'var(--primary-color)' : '#ffffff', 
                  color: isActive ? '#ffffff' : '#94a3b8',
                  border: isCurrent ? '3px solid #000' : isActive ? '2px solid var(--primary-color)' : '2px solid #cbd5e1',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  boxShadow: isCurrent ? '0 0 10px rgba(0,0,0,0.2)' : 'none',
                  transition: 'all 0.3s'
                }}>
                  {s.icon}
                </div>
                <span style={{ fontSize: '11px', fontWeight: isCurrent ? '700' : '500', color: isActive ? 'var(--text-dark)' : '#94a3b8', marginTop: '6px' }}>
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  render() {
    const { orders, loading, selectedOrder, showQRModal, showReviewModal, reviewProduct, rating, comment, isSubmittingReview } = this.state;
    const { customer } = this.context;

    if (!customer) return null;

    return (
      <div className="fade-in" style={{ marginTop: '30px' }}>
        <div className="section-header">
          <h2 className="section-title">LỊCH SỬ ĐƠN HÀNG</h2>
          <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>Bạn đã thực hiện {orders.length} đơn hàng tại MPS</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <div className="loader" style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ marginTop: '15px', color: 'var(--text-light)' }}>Đang tải lịch sử đơn hàng...</p>
            <style>{`
              @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
          </div>
        ) : orders.length === 0 ? (
          <div className="info-message">
            <h3>Chưa có đơn hàng nào</h3>
            <p>Bạn chưa đặt bất kỳ đơn hàng phụ kiện xe nào trong hệ thống của chúng tôi.</p>
            <Link to="/home" className="back-btn" style={{ marginTop: '20px', textDecoration: 'none' }}>
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '30px', alignItems: 'start' }} className="orders-grid-layout">
            
            {/* Orders List Sidebar */}
            <div style={{ backgroundColor: 'white', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', padding: '20px', maxHeight: '650px', overflowY: 'auto' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '15px', color: 'var(--text-dark)' }}>Danh Sách Đơn Hàng</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {orders.map(order => {
                  const isSelected = selectedOrder && selectedOrder._id === order._id;
                  const dateStr = new Date(order.cdate).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
                  const statusInfo = this.getStatusInfo(order.status);

                  return (
                    <div 
                      key={order._id}
                      onClick={() => this.setState({ selectedOrder: order })}
                      style={{ 
                        padding: '15px', 
                        borderRadius: '8px', 
                        border: isSelected ? '2px solid var(--primary-color)' : '1px solid var(--border-color)', 
                        backgroundColor: isSelected ? 'var(--bg-main)' : 'white', 
                        cursor: 'pointer',
                        transition: 'var(--transition)'
                      }}
                      className="order-item-card"
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', fontFamily: 'monospace', color: isSelected ? 'var(--primary-hover)' : 'var(--text-dark)' }}>
                          ID: ...{order._id.substring(order._id.length - 8)}
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', color: statusInfo.color, backgroundColor: statusInfo.bg }}>
                          {statusInfo.text}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '5px' }}>
                        📅 Ngày đặt: {dateStr}
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--accent-color)', textAlign: 'right' }}>
                        {this.formatCurrency(order.total)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Order Detail Panel */}
            {selectedOrder && (
              <div style={{ backgroundColor: 'white', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', padding: '25px' }}>
                
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-dark)' }}>Chi Tiết Đơn Hàng</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-light)', fontFamily: 'monospace', marginTop: '4px' }}>
                      Mã đơn: {selectedOrder._id}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {(selectedOrder.status === 'PENDING' || selectedOrder.status === 'APPROVED') && (
                      <button
                        onClick={() => this.setState({ showQRModal: true })}
                        style={{
                          backgroundColor: '#0284c7',
                          color: 'white',
                          border: 'none',
                          padding: '8px 14px',
                          borderRadius: '30px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        📱 Quét mã QR thanh toán
                      </button>
                    )}

                    {selectedOrder.status === 'PENDING' && (
                      <button 
                        onClick={() => this.handleCancelOrder(selectedOrder._id)}
                        style={{ 
                          backgroundColor: 'var(--accent-color)', 
                          color: 'white', 
                          border: 'none', 
                          padding: '8px 14px', 
                          borderRadius: '30px', 
                          fontWeight: '600', 
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        ❌ Hủy đơn
                      </button>
                    )}
                  </div>
                </div>

                {/* Delivery Stepper */}
                {this.renderDeliveryTimeline(selectedOrder.status)}

                {/* Info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px', backgroundColor: 'var(--bg-main)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '13px', lineHeight: '1.6' }} className="order-details-meta">
                  <div>
                    <p style={{ color: 'var(--text-light)' }}>👤 Người mua hàng:</p>
                    <p style={{ fontWeight: '600', color: 'var(--text-dark)' }}>{selectedOrder.customer.name}</p>
                    <p style={{ color: 'var(--text-light)', marginTop: '5px' }}>📞 Số điện thoại nhận hàng:</p>
                    <p style={{ fontWeight: '600', color: 'var(--text-dark)' }}>{selectedOrder.shippingPhone || selectedOrder.customer.phone}</p>
                    {selectedOrder.shippingAddress && (
                      <>
                        <p style={{ color: 'var(--text-light)', marginTop: '5px' }}>🏠 Địa chỉ giao hàng:</p>
                        <p style={{ fontWeight: '600', color: 'var(--text-dark)' }}>{selectedOrder.shippingAddress}</p>
                      </>
                    )}
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-light)' }}>📅 Ngày tạo đơn:</p>
                    <p style={{ fontWeight: '600', color: 'var(--text-dark)' }}>
                      {new Date(selectedOrder.cdate).toLocaleString('vi-VN')}
                    </p>
                    <p style={{ color: 'var(--text-light)', marginTop: '5px' }}>⚡ Trạng thái đơn hàng:</p>
                    <p style={{ fontWeight: '700', color: this.getStatusInfo(selectedOrder.status).color }}>
                      {this.getStatusInfo(selectedOrder.status).text}
                    </p>
                    {selectedOrder.note && (
                      <>
                        <p style={{ color: 'var(--text-light)', marginTop: '5px' }}>📝 Ghi chú cho shop:</p>
                        <p style={{ fontWeight: '600', color: 'var(--text-dark)', fontStyle: 'italic' }}>{selectedOrder.note}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Items list */}
                <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: 'var(--text-dark)' }}>Danh Sách Mặt Hàng</h4>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-light)', fontWeight: 'bold' }}>
                        <th style={{ padding: '8px 5px' }}>Ảnh</th>
                        <th style={{ padding: '8px 5px' }}>Tên phụ kiện</th>
                        <th style={{ padding: '8px 5px', textAlign: 'right' }}>Đơn giá</th>
                        <th style={{ padding: '8px 5px', textAlign: 'center' }}>SL</th>
                        <th style={{ padding: '8px 5px', textAlign: 'right' }}>Thành tiền</th>
                        {selectedOrder.status === 'DELIVERED' && (
                          <th style={{ padding: '8px 5px', textAlign: 'center' }}>Đánh giá</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map(item => (
                        <tr key={item.product._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 5px' }}>
                            <img 
                              src={this.getProductImageUrl(item.product.image)} 
                              alt={item.product.name} 
                              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                              onError={(e) => { e.target.src = 'https://placehold.co/40x40?text=No+Img'; }}
                            />
                          </td>
                          <td style={{ padding: '10px 5px', fontWeight: '500', color: 'var(--text-dark)' }}>
                            <Link to={`/product/${item.product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                              {item.product.name}
                            </Link>
                          </td>
                          <td style={{ padding: '10px 5px', textAlign: 'right', color: 'var(--text-light)' }}>
                            {this.formatCurrency(item.product.price)}
                          </td>
                          <td style={{ padding: '10px 5px', textAlign: 'center', fontWeight: '600', color: 'var(--text-dark)' }}>
                            {item.quantity}
                          </td>
                          <td style={{ padding: '10px 5px', textAlign: 'right', fontWeight: '700', color: 'var(--text-dark)' }}>
                            {this.formatCurrency(item.product.price * item.quantity)}
                          </td>
                          {selectedOrder.status === 'DELIVERED' && (
                            <td style={{ padding: '10px 5px', textAlign: 'center' }}>
                              <button
                                onClick={() => this.setState({ showReviewModal: true, reviewProduct: item.product, rating: 5, comment: '' })}
                                style={{
                                  backgroundColor: '#eab308',
                                  color: 'white',
                                  border: 'none',
                                  padding: '5px 10px',
                                  borderRadius: '20px',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  cursor: 'pointer'
                                }}
                              >
                                ⭐ Đánh giá
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', borderTop: '2px solid var(--border-color)', paddingTop: '15px' }}>
                  <div style={{ fontSize: '15px', color: 'var(--text-dark)', fontWeight: 'bold' }}>
                    Tổng số tiền đơn hàng:{' '}
                    <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--accent-color)', marginLeft: '10px' }}>
                      {this.formatCurrency(selectedOrder.total)}
                    </span>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* QR Payment Modal */}
        {showQRModal && selectedOrder && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '25px', maxWidth: '450px', width: '100%', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: 'var(--text-dark)' }}>📱 Quét Mã QR Thanh Toán</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '15px' }}>Quét mã QR để chuyển khoản cho đơn hàng #{selectedOrder._id.substring(selectedOrder._id.length - 8)}</p>
              
              <div style={{ padding: '15px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '15px' }}>
                <img src="/img/qr.png" alt="QR Code" style={{ width: '200px', height: '200px', objectFit: 'contain', margin: '0 auto', display: 'block' }} />
                <div style={{ marginTop: '10px', fontSize: '14px', fontWeight: 'bold', color: 'var(--accent-color)' }}>
                  Số tiền: {this.formatCurrency(selectedOrder.total)}
                </div>
              </div>

              <button
                onClick={() => this.setState({ showQRModal: false })}
                style={{ backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {/* Review Modal */}
        {showReviewModal && reviewProduct && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '25px', maxWidth: '480px', width: '100%' }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: 'var(--text-dark)', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                ⭐ Đánh Giá Sản Phẩm
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                <img src={this.getProductImageUrl(reviewProduct.image)} alt="" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--text-dark)' }}>{reviewProduct.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--accent-color)', fontWeight: 'bold' }}>{this.formatCurrency(reviewProduct.price)}</div>
                </div>
              </div>

              {/* Star Rating Picker */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>Chọn số sao đánh giá:</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => this.setState({ rating: star })}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        color: star <= rating ? '#f59e0b' : '#cbd5e1'
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment Input */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>Nhận xét chi tiết sản phẩm:</label>
                <textarea
                  placeholder="Chia sẻ trải nghiệm sử dụng, chất lượng sản phẩm..."
                  value={comment}
                  onChange={(e) => this.setState({ comment: e.target.value })}
                  rows={3}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              {/* Image Upload */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>📷 Thêm ảnh thực tế sản phẩm (Tùy chọn):</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={this.handleReviewImageChange}
                  style={{ fontSize: '12px' }}
                />
                {this.state.reviewImage && (
                  <div style={{ marginTop: '8px' }}>
                    <img src={this.state.reviewImage} alt="Preview" style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => this.setState({ showReviewModal: false, reviewProduct: null })}
                  style={{ backgroundColor: '#f1f5f9', color: '#475569', border: 'none', padding: '10px 20px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button
                  onClick={this.handleSubmitReview}
                  disabled={isSubmittingReview}
                  style={{ backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {isSubmittingReview ? 'ĐANG GỬI...' : 'Gửi Đánh Giá'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        <style>{`
          @media (max-width: 768px) {
            .orders-grid-layout {
              grid-template-columns: 1fr !important;
            }
            .order-details-meta {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    );
  }
}

export default withRouter(Myorders);
