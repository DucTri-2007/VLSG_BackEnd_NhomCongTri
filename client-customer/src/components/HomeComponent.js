import React, { Component } from 'react';
import axios from 'axios';
import MyContext from '../contexts/MyContext';
import { withRouter } from '../utils/withRouter';

class Home extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      newProducts: [],
      hotProducts: [],
      saleProducts: [],
      loading: true,
      saleHours: 5,
      saleMinutes: 42,
      saleSeconds: 18
    };
    this.timer = null;
  }

  componentDidMount() {
    this.fetchHomeProducts();
    this.startSaleTimer();
  }

  componentWillUnmount() {
    if (this.timer) clearInterval(this.timer);
  }

  startSaleTimer() {
    this.timer = setInterval(() => {
      let { saleHours, saleMinutes, saleSeconds } = this.state;
      if (saleSeconds > 0) {
        saleSeconds--;
      } else {
        saleSeconds = 59;
        if (saleMinutes > 0) {
          saleMinutes--;
        } else {
          saleMinutes = 59;
          if (saleHours > 0) {
            saleHours--;
          } else {
            saleHours = 12;
          }
        }
      }
      this.setState({ saleHours, saleMinutes, saleSeconds });
    }, 1000);
  }

  fetchHomeProducts() {
    Promise.all([
      axios.get('/api/customer/products/new'),
      axios.get('/api/customer/products/hot')
    ]).then(([newRes, hotRes]) => {
      let newProds = newRes.data || [];
      let hotProds = hotRes.data || [];

      const defaultMockProducts = [
        { _id: 'mock1', name: 'Bố Thắng Đĩa Trước Chính Hãng Honda Winner X / SH', price: 180000, image: null, category: { name: 'Honda' } },
        { _id: 'mock2', name: 'Phuộc Sau Ohlins Bình Dầu Cho Honda SH / Vario', price: 14500000, image: null, category: { name: 'Honda' } },
        { _id: 'mock3', name: 'Lốp Xe Michelin City Grip 2 Cho Vespa GTS / Sprint', price: 1250000, image: null, category: { name: 'Vespa' } },
        { _id: 'mock4', name: 'Nhông Sên Dĩa DID Vàng Nhập Khẩu Cho Suzuki Raider', price: 450000, image: null, category: { name: 'Suzuki' } },
        { _id: 'mock5', name: 'Pô Akrapovic Titan Full System Cho Yamaha R15 / NVX', price: 8500000, image: null, category: { name: 'Yamaha' } }
      ];

      if (newProds.length === 0) {
        newProds = [...defaultMockProducts];
      } else if (newProds.length < 5) {
        const originalLength = newProds.length;
        for (let i = 0; newProds.length < 5; i++) {
          const item = newProds[i % originalLength];
          newProds.push({
            ...item,
            _id: `${item._id}_cloned_new_${i}`
          });
        }
      }

      if (hotProds.length === 0) {
        hotProds = [...newProds].reverse();
      } else if (hotProds.length < 5) {
        const originalLength = hotProds.length;
        for (let i = 0; hotProds.length < 5; i++) {
          const item = hotProds[i % originalLength];
          hotProds.push({
            ...item,
            _id: `${item._id}_cloned_hot_${i}`
          });
        }
      }

      this.setState({
        newProducts: newProds.slice(0, 5),
        hotProducts: hotProds.slice(0, 5),
        saleProducts: newProds.slice(0, 4),
        loading: false
      });
    }).catch(err => {
      console.error("Lỗi lấy sản phẩm trang chủ:", err.message);
      const mockFallback = [
        { _id: 'mock1', name: 'Bố Thắng Đĩa Trước Chính Hãng Honda Winner X / SH', price: 180000, image: null, category: { name: 'Honda' } },
        { _id: 'mock2', name: 'Phuộc Sau Ohlins Bình Dầu Cho Honda SH / Vario', price: 14500000, image: null, category: { name: 'Honda' } },
        { _id: 'mock3', name: 'Lốp Xe Michelin City Grip 2 Cho Vespa GTS / Sprint', price: 1250000, image: null, category: { name: 'Vespa' } },
        { _id: 'mock4', name: 'Nhông Sên Dĩa DID Vàng Nhập Khẩu Cho Suzuki Raider', price: 450000, image: null, category: { name: 'Suzuki' } },
        { _id: 'mock5', name: 'Pô Akrapovic Titan Full System Cho Yamaha R15 / NVX', price: 8500000, image: null, category: { name: 'Yamaha' } }
      ];
      this.setState({
        newProducts: mockFallback,
        hotProducts: [...mockFallback].reverse(),
        saleProducts: mockFallback.slice(0, 4),
        loading: false
      });
    });
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

  renderProductGrid(products) {
    if (products.length === 0) {
      return (
        <div className="info-message" style={{ width: '100%' }}>
          <h3>Không có sản phẩm nào</h3>
          <p>Hiện tại chưa có sản phẩm nào thuộc mục này.</p>
        </div>
      );
    }

    return (
      <div className="product-grid">
        {products.map((prod) => (
          <div 
            key={prod._id} 
            className="product-card"
            onClick={() => this.props.router.navigate(`/product/${prod._id}`)}
            style={{ cursor: 'pointer', border: '2px solid #000000', borderRadius: '12px', overflow: 'hidden' }}
          >
            <div className="product-img-wrapper">
              <img 
                src={this.getProductImageUrl(prod.image)} 
                alt={prod.name} 
                className="product-img"
              />
            </div>
            <div className="product-info">
              <div className="product-category" style={{ fontWeight: 'bold', color: '#000000' }}>{prod.category ? prod.category.name : 'Phụ Kiện'}</div>
              <h3 className="product-name" style={{ color: '#000000', fontWeight: '900' }} title={prod.name}>{prod.name}</h3>
              <div className="product-footer">
                <span className="product-price" style={{ color: '#ff0000', fontWeight: '900', fontSize: '16px' }}>{this.formatCurrency(prod.price)}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    this.context.addToCart(prod, 1);
                    alert(`Đã thêm "${prod.name}" vào giỏ hàng thành công!`);
                  }}
                  style={{
                    backgroundColor: '#ff0000',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  🛒 Thêm vào giỏ
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  render() {
    const { newProducts, hotProducts, saleProducts, loading, saleHours, saleMinutes, saleSeconds } = this.state;

    return (
      <div className="fade-in">
        {/* Hero Banner Section */}
        <section className="hero" style={{ position: 'relative', overflow: 'hidden', height: '360px', background: '#000000', borderRadius: '16px', border: '3px solid #ff0000', display: 'flex', alignItems: 'center' }}>
          <iframe 
            src="https://www.youtube.com/embed/orGnU0trT1M?autoplay=1&mute=1&loop=1&playlist=orGnU0trT1M&controls=0&showinfo=0&rel=0&iv_load_policy=3" 
            frameBorder="0" 
            allow="autoplay; encrypted-media" 
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '100%',
              height: '100%',
              minWidth: '100%',
              minHeight: '100%',
              transform: 'translate(-50%, -50%) scale(1.35)',
              pointerEvents: 'none',
              opacity: 0.45,
              zIndex: 1
            }}
            title="MPS Banner Video"
          ></iframe>
          <div style={{ position: 'relative', zIndex: 2, padding: '40px', width: '100%' }}>
            <span style={{ backgroundColor: '#ff0000', color: 'white', fontSize: '12px', fontWeight: '900', padding: '5px 12px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              🏍️ Cửa Hàng Phụ Tùng Xe Máy Chính Hãng MPS
            </span>
            <h1 style={{ marginTop: '15px', color: 'white', textShadow: '0 2px 8px rgba(0,0,0,0.8)', fontSize: '36px', fontWeight: '900' }}>Nâng Tầm Xế Yêu Của Bạn</h1>
            <p style={{ color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.8)', marginBottom: '25px', maxWidth: '600px', fontSize: '15px', lineHeight: '1.5', fontWeight: '600' }}>
              Chuyên phân phối phụ tùng xe máy chính hãng cho Honda, Yamaha, Suzuki, Vespa. Tích điểm 10% đơn mua, thanh toán Ví MPS Wallet &amp; QR tiện lợi.
            </p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <a href="#flash-sale" style={{ backgroundColor: '#ff0000', color: 'white', fontWeight: '900', padding: '12px 24px', borderRadius: '30px', textDecoration: 'none' }}>
                🔥 Săn Deal Flash Sale
              </a>
            </div>
          </div>
        </section>

        {/* Live Flash Sale Countdown Section with Dedicated Sale Products Grid */}
        <section id="flash-sale" style={{ marginTop: '30px', padding: '25px', backgroundColor: '#000000', border: '3px solid #ff0000', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px', borderBottom: '2px solid #ff0000', paddingBottom: '15px' }}>
            <div>
              <span style={{ fontSize: '12px', color: '#ffffff', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>🔥 CHƯƠNG TRÌNH KHUYẾN MÃI GIỜ VÀNG</span>
              <h2 style={{ fontSize: '24px', color: '#ff0000', fontWeight: '900', margin: '4px 0 0 0', textTransform: 'uppercase' }}>SIÊU SALE BÙM NỔ - GIẢM ĐẾN 50%</h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '13px' }}>KẾT THÚC TRONG:</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ backgroundColor: '#ff0000', color: '#ffffff', padding: '8px 12px', borderRadius: '8px', fontWeight: '900', fontSize: '16px' }}>
                  {String(saleHours).padStart(2, '0')} <small style={{ fontSize: '10px', display: 'block' }}>GIỜ</small>
                </div>
                <div style={{ backgroundColor: '#ff0000', color: '#ffffff', padding: '8px 12px', borderRadius: '8px', fontWeight: '900', fontSize: '16px' }}>
                  {String(saleMinutes).padStart(2, '0')} <small style={{ fontSize: '10px', display: 'block' }}>PHÚT</small>
                </div>
                <div style={{ backgroundColor: '#ff0000', color: '#ffffff', padding: '8px 12px', borderRadius: '8px', fontWeight: '900', fontSize: '16px' }}>
                  {String(saleSeconds).padStart(2, '0')} <small style={{ fontSize: '10px', display: 'block' }}>GIÂY</small>
                </div>
              </div>
            </div>
          </div>

          {/* Flash Sale Product Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
            {saleProducts.map((prod, idx) => {
              const percentages = [30, 25, 40, 50];
              const discountPct = percentages[idx % percentages.length];
              const originalPrice = Math.round(prod.price * (1 + discountPct / 100));
              return (
                <div 
                  key={prod._id}
                  onClick={() => this.props.router.navigate(`/product/${prod._id}`)}
                  style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '14px', border: '2px solid #ff0000', cursor: 'pointer', position: 'relative' }}
                >
                  <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#ff0000', color: '#ffffff', fontSize: '11px', fontWeight: '900', padding: '3px 8px', borderRadius: '4px' }}>
                    -{discountPct}%
                  </div>

                  <img 
                    src={this.getProductImageUrl(prod.image)} 
                    alt={prod.name} 
                    style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #000000', marginBottom: '10px' }}
                  />

                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#000000' }}>
                    {prod.category ? prod.category.name : 'Phụ Kiện'}
                  </div>
                  <h4 style={{ fontSize: '13px', fontWeight: '900', color: '#000000', margin: '4px 0 8px 0', height: '36px', overflow: 'hidden' }}>
                    {prod.name}
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', textDecoration: 'line-through', fontWeight: 'bold' }}>
                      Giá gốc: {this.formatCurrency(originalPrice)}
                    </span>
                    <span style={{ fontSize: '16px', color: '#ff0000', fontWeight: '900' }}>
                      Sale: {this.formatCurrency(prod.price)}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      this.context.addToCart(prod, 1);
                      alert(`🎉 [FLASH SALE -${discountPct}%] Đã thêm "${prod.name}" vào giỏ!`);
                    }}
                    style={{ width: '100%', padding: '8px', borderRadius: '20px', border: 'none', backgroundColor: '#ff0000', color: '#ffffff', fontWeight: '900', cursor: 'pointer', fontSize: '12px' }}
                  >
                    ⚡ MUA NGAY GIÁ SALE
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <p style={{ marginTop: '15px', color: '#000000', fontWeight: 'bold' }}>Đang tải sản phẩm phụ tùng xe máy...</p>
          </div>
        ) : (
          <>
            {/* New Products Section */}
            <section id="new-products" style={{ marginTop: '30px' }}>
              <div className="section-header">
                <h2 className="section-title" style={{ color: '#000000', fontWeight: '900' }}>SẢN PHẨM MỚI NHẤT</h2>
                <span style={{ fontSize: '13px', color: '#000000', fontWeight: '600' }}>Hàng vừa cập bến MPS</span>
              </div>
              {this.renderProductGrid(newProducts)}
            </section>

            {/* Hot Products Section */}
            <section id="hot-products" style={{ marginTop: '40px' }}>
              <div className="section-header">
                <h2 className="section-title" style={{ color: '#000000', fontWeight: '900' }}>SẢN PHẨM BÁN CHẠY</h2>
                <span style={{ fontSize: '13px', color: '#000000', fontWeight: '600' }}>Khách hàng tin tưởng và chọn mua nhiều nhất</span>
              </div>
              {this.renderProductGrid(hotProducts)}
            </section>
          </>
        )}
      </div>
    );
  }
}

export default withRouter(Home);
