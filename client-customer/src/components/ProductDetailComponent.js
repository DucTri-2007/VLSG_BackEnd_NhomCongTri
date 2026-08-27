import React, { Component } from 'react';
import axios from 'axios';
import MyContext from '../contexts/MyContext';
import { Link } from 'react-router-dom';
import { withRouter } from '../utils/withRouter';

class ProductDetail extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      product: null,
      quantity: 1,
      loading: true,
      errorMsg: ''
    };
  }

  componentDidMount() {
    this.fetchProductDetail();
  }

  fetchProductDetail() {
    const { id } = this.props.router.params;
    if (id) {
      axios.get(`/api/customer/products/${id}`)
        .then(res => {
          if (res.data) {
            this.setState({
              product: res.data,
              loading: false
            });
          } else {
            this.setState({
              errorMsg: 'Không tìm thấy sản phẩm này.',
              loading: false
            });
          }
        })
        .catch(err => {
          console.error("Lỗi lấy chi tiết sản phẩm:", err.message);
          this.setState({
            errorMsg: 'Lỗi tải dữ liệu sản phẩm từ máy chủ.',
            loading: false
          });
        });
    }
  }

  handleQuantityChange = (amount) => {
    const { quantity, product } = this.state;
    const maxQty = product ? (product.quantity !== undefined ? product.quantity : 0) : 0;
    const newQty = quantity + amount;
    if (newQty >= 1 && newQty <= maxQty) {
      this.setState({ quantity: newQty });
    }
  };

  handleAddToCart = () => {
    const { product, quantity } = this.state;
    if (product) {
      const stock = product.quantity !== undefined ? product.quantity : 0;
      if (stock === 0) {
        alert("Sản phẩm này đã hết hàng!");
        return;
      }
      this.context.addToCart(product, quantity);
      alert(`Đã thêm ${quantity} sản phẩm "${product.name}" vào giỏ hàng thành công!`);
    }
  };

  formatCurrency(value) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }

  getProductImageUrl(image) {
    if (!image) return 'https://placehold.co/500x500?text=No+Image';
    if (image.startsWith('data:image/') || image.startsWith('http://') || image.startsWith('https://') || image.startsWith('/')) {
      return image;
    }
    return `data:image/jpeg;base64,${image}`;
  }

  render() {
    const { product, quantity, loading, errorMsg } = this.state;

    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <div className="loader" style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginTop: '15px', color: 'var(--text-light)' }}>Đang tải chi tiết phụ kiện...</p>
          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
          `}</style>
        </div>
      );
    }

    if (errorMsg || !product) {
      return (
        <div className="info-message" style={{ marginTop: '40px' }}>
          <h3>Đã xảy ra lỗi</h3>
          <p>{errorMsg || 'Không tìm thấy thông tin sản phẩm.'}</p>
          <Link to="/home" className="back-btn" style={{ marginTop: '20px', textDecoration: 'none' }}>
            Quay lại Trang chủ
          </Link>
        </div>
      );
    }

    const stock = product.quantity !== undefined ? product.quantity : 0;
    const isOutOfStock = stock === 0;
    const reviews = product.reviews || [];
    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

    return (
      <div className="fade-in">
        <div className="detail-container">
          {/* Product Image */}
          <div className="detail-img-wrapper">
            <img 
              src={this.getProductImageUrl(product.image)} 
              alt={product.name} 
              className="detail-img"
              onError={(e) => { e.target.src = 'https://placehold.co/500x500?text=No+Image'; }}
            />
          </div>

          {/* Product Info */}
          <div className="detail-info">
            <div className="detail-category">{product.category ? product.category.name : 'Phụ Kiện'}</div>
            <h1 className="detail-name">{product.name}</h1>
            
            {/* Price Box */}
            <div className="detail-price-box">
              <div className="detail-price-label">Giá bán chính thức:</div>
              <div className="detail-price">{this.formatCurrency(product.price)}</div>
            </div>

            {/* Inventory Status */}
            <div className="detail-meta" style={{ marginBottom: '20px' }}>
              <span>
                Trạng thái: 
                <strong style={{ 
                  color: isOutOfStock ? 'var(--accent-color)' : 'var(--primary-color)',
                  marginLeft: '5px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: isOutOfStock ? '#ffe4e6' : 'var(--primary-light)'
                }}>
                  {isOutOfStock ? 'Hết hàng' : `Còn hàng (Kho: ${stock})`}
                </strong>
              </span>
            </div>

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-dark)' }}>Số lượng mua:</span>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '30px', padding: '4px 10px', backgroundColor: 'var(--bg-main)' }}>
                  <button 
                    onClick={() => this.handleQuantityChange(-1)} 
                    style={{ background: 'none', border: 'none', fontSize: '18px', fontWeight: 'bold', padding: '0 10px', cursor: 'pointer', color: 'var(--text-light)' }}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span style={{ fontSize: '16px', fontWeight: '600', minWidth: '30px', textAlign: 'center', color: 'var(--text-dark)' }}>
                    {quantity}
                  </span>
                  <button 
                    onClick={() => this.handleQuantityChange(1)} 
                    style={{ background: 'none', border: 'none', fontSize: '18px', fontWeight: 'bold', padding: '0 10px', cursor: 'pointer', color: 'var(--text-light)' }}
                    disabled={quantity >= stock}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <button 
                onClick={this.handleAddToCart}
                className="back-btn" 
                style={{ 
                  border: 'none',
                  outline: 'none',
                  backgroundColor: isOutOfStock ? '#94a3b8' : 'var(--primary-color)',
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer'
                }}
                disabled={isOutOfStock}
              >
                🛒 {isOutOfStock ? 'Đã hết hàng' : 'Thêm vào giỏ hàng'}
              </button>
              
              <button 
                onClick={() => this.props.router.navigate(-1)}
                style={{ 
                  backgroundColor: 'white', 
                  color: 'var(--text-dark)', 
                  border: '1px solid var(--border-color)', 
                  boxShadow: 'none'
                }}
                className="back-btn"
              >
                ⬅️ Quay lại
              </button>
            </div>
          </div>
        </div>

        {/* Product Detailed Description Box */}
        <div style={{ marginTop: '30px', backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            📖 Mô Tả Chi Tiết &amp; Thông Số Kỹ Thuật
          </h3>
          <div style={{ fontSize: '14px', lineHeight: '1.8', color: '#334155', whiteSpace: 'pre-line' }}>
            {product.description || 'Sản phẩm phụ kiện chính hãng chất lượng cao. Được kiểm định nghiêm ngặt về tiêu chuẩn kỹ thuật, độ bền và tính an toàn tuyệt đối khi vận hành.'}
          </div>
        </div>

        {/* Reviews Section */}
        <div style={{ marginTop: '30px', backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            ⭐ Đánh Giá &amp; Nhận Xét Của Khách Hàng ({reviews.length})
            {avgRating && (
              <span style={{ fontSize: '14px', backgroundColor: '#fef9c3', color: '#854d0e', padding: '2px 8px', borderRadius: '12px', border: '1px solid #fde047' }}>
                {avgRating} / 5.0 ★
              </span>
            )}
          </h3>

          {reviews.length === 0 ? (
            <p style={{ color: 'var(--text-light)', fontSize: '13px' }}>Chưa có đánh giá nào cho sản phẩm này. Hãy mua và trở thành người đầu tiên đánh giá!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reviews.map((r, index) => (
                <div key={index} style={{ padding: '12px 15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '13px', color: 'var(--text-dark)' }}>👤 {r.customerName}</strong>
                    <span style={{ color: '#f59e0b', fontSize: '14px', fontWeight: 'bold' }}>
                      {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#334155', margin: '4px 0' }}>{r.comment}</p>
                  {r.image && (
                    <div style={{ marginTop: '8px' }}>
                      <img src={r.image} alt="Ảnh thực tế" style={{ maxWidth: '120px', maxHeight: '120px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    </div>
                  )}
                  <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'right', marginTop: '4px' }}>
                    {r.cdate ? new Date(r.cdate).toLocaleString('vi-VN') : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default withRouter(ProductDetail);
