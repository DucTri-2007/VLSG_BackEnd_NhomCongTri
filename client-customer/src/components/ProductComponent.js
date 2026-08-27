import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import MyContext from '../contexts/MyContext';
import { withRouter } from '../utils/withRouter';

class Product extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      products: [],
      loading: true,
      title: 'Danh sách sản phẩm'
    };
  }

  componentDidMount() {
    this.fetchProducts();
  }

  componentDidUpdate(prevProps) {
    const prevParams = prevProps.router.params;
    const currentParams = this.props.router.params;
    if (prevParams.cid !== currentParams.cid || prevParams.keyword !== currentParams.keyword) {
      this.fetchProducts();
    }
  }

  fetchProducts() {
    this.setState({ loading: true });
    const { cid, keyword } = this.props.router.params;

    if (cid) {
      axios.get(`/api/customer/products/category/${cid}`)
        .then(res => {
          const products = res.data || [];
          let categoryName = 'Danh mục';
          if (products.length > 0 && products[0].category) {
            categoryName = products[0].category.name;
          } else {
            // Trường hợp danh mục rỗng chưa có sản phẩm, ta có thể lấy tên từ DB nếu muốn, 
            // hoặc đơn giản là hiển thị thông tin chung
            categoryName = 'Chi tiết';
          }
          this.setState({
            products: products,
            title: `Danh mục: ${categoryName}`,
            loading: false
          });
        })
        .catch(err => {
          console.error("Lỗi tải sản phẩm danh mục:", err.message);
          this.setState({ loading: false });
        });
    } else if (keyword) {
      axios.get(`/api/customer/products/search/${encodeURIComponent(keyword)}`)
        .then(res => {
          this.setState({
            products: res.data || [],
            title: `Kết quả tìm kiếm cho: "${keyword}"`,
            loading: false
          });
        })
        .catch(err => {
          console.error("Lỗi tìm kiếm sản phẩm:", err.message);
          this.setState({ loading: false });
        });
    } else {
      axios.get('/api/customer/products/search')
        .then(res => {
          this.setState({
            products: res.data || [],
            title: 'Tất cả Danh Mục & Sản Phẩm',
            loading: false
          });
        })
        .catch(err => {
          console.error("Lỗi tải tất cả sản phẩm:", err.message);
          this.setState({ loading: false });
        });
    }
  }

  formatCurrency(value) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }

  getProductImageUrl(image) {
    if (!image) return 'https://placehold.co/300x300?text=No+Image';
    if (image.startsWith('data:image/') || image.startsWith('http://') || image.startsWith('https://') || image.startsWith('/')) {
      return image;
    }
    return `data:image/jpeg;base64,${image}`;
  }

  render() {
    const { products, loading, title } = this.state;

    return (
      <div className="fade-in" style={{ marginTop: '30px' }}>
        <div className="section-header">
          <h2 className="section-title">{title}</h2>
          <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>Tìm thấy {products.length} sản phẩm phù hợp</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <div className="loader" style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ marginTop: '15px', color: 'var(--text-light)' }}>Đang tải danh sách sản phẩm...</p>
            <style>{`
              @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
          </div>
        ) : products.length === 0 ? (
          <div className="info-message">
            <h3>Không tìm thấy sản phẩm nào</h3>
            <p>Rất tiếc, không có sản phẩm phụ kiện xe nào phù hợp với danh mục hoặc từ khóa tìm kiếm của bạn.</p>
            <Link to="/home" className="back-btn" style={{ marginTop: '20px', textDecoration: 'none' }}>
              Quay lại Trang chủ
            </Link>
          </div>
        ) : (
          <div className="product-grid">
            {products.map(prod => (
              <div 
                key={prod._id} 
                className="product-card"
                onClick={() => this.props.router.navigate(`/product/${prod._id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="product-img-wrapper">
                  <img 
                    src={this.getProductImageUrl(prod.image)} 
                    alt={prod.name} 
                    className="product-img"
                    onError={(e) => { e.target.src = 'https://placehold.co/300x300?text=No+Image'; }}
                  />
                </div>
                <div className="product-info">
                  <div className="product-category">{prod.category ? prod.category.name : 'Phụ Kiện'}</div>
                  <h3 className="product-name" title={prod.name}>{prod.name}</h3>
                  <div className="product-footer">
                    <span className="product-price">{this.formatCurrency(prod.price)}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        this.context.addToCart(prod, 1);
                        alert(`Đã thêm "${prod.name}" vào giỏ hàng thành công!`);
                      }}
                      style={{
                        backgroundColor: 'var(--primary-color)',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      🛒 Thêm vào giỏ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}

export default withRouter(Product);
