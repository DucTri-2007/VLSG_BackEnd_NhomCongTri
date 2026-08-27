import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import ProductDetail from './ProductDetailComponent';

class Product extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      products: [],
      noPages: 0,
      curPage: 1,
      itemSelected: null
    };
  }

  getProductImageUrl(image) {
    if (!image) return '/img/bo_thang_honda.jpg';
    if (image.startsWith('data:') || image.startsWith('http://') || image.startsWith('https://')) return image;
    if (image.startsWith('/')) return image;
    if (image.includes('.') || image.endsWith('.jpg') || image.endsWith('.png')) return '/img/' + image;
    return 'data:image/jpg;base64,' + image;
  }

  render() {
    const prods = this.state.products.map((item) => {
      const isSelected = this.state.itemSelected && this.state.itemSelected._id === item._id;
      return (
        <tr 
          key={item._id} 
          onClick={() => this.trItemClick(item)}
          style={{
            cursor: 'pointer',
            borderBottom: '1px solid #333',
            backgroundColor: isSelected ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
            transition: 'background-color 0.2s',
            color: isSelected ? '#00f2fe' : '#ccc'
          }}
          onMouseOver={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'; }}
          onMouseOut={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <td style={{ padding: '12px 10px', fontFamily: 'monospace', fontSize: '12px', color: '#888' }}>{item._id}</td>
          <td style={{ padding: '12px 10px', fontWeight: '600', color: '#fff' }}>{item.name}</td>
          <td style={{ padding: '12px 10px', fontWeight: '700', color: '#10b981' }}>
            {(item.price ?? 0).toLocaleString('vi-VN')} đ
          </td>
          <td style={{ padding: '12px 10px', fontWeight: '600', color: '#00f2fe' }}>
            {item.quantity ?? 0}
          </td>
          <td style={{ padding: '12px 10px', fontSize: '13px', color: '#94a3b8' }}>
            {new Date(item.cdate).toLocaleString('vi-VN')}
          </td>
          <td style={{ padding: '12px 10px', fontSize: '14px' }}>
            <span style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              padding: '4px 8px',
              borderRadius: '4px',
              color: '#ccc',
              fontWeight: '500',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              {item.category ? item.category.name : 'N/A'}
            </span>
          </td>
          <td style={{ padding: '8px 10px' }}>
            <img 
              src={this.getProductImageUrl(item.image)} 
              style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #444' }} 
              alt={item.name} 
            />
          </td>
        </tr>
      );
    });

    const pagination = Array.from({ length: this.state.noPages }, (_, index) => {
      const pageNum = index + 1;
      const isCurrent = pageNum === this.state.curPage;
      return (
        <button
          key={index}
          onClick={() => this.lnkPageClick(pageNum)}
          style={{
            border: isCurrent ? '1px solid #00f2fe' : '1px solid #555',
            backgroundColor: isCurrent ? '#00f2fe' : '#222',
            color: isCurrent ? '#000' : '#ccc',
            padding: '6px 12px',
            margin: '0 4px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '13px',
            transition: 'all 0.2s'
          }}
        >
          {pageNum}
        </button>
      );
    });

    return (
      <div style={{ display: 'flex', gap: '20px', padding: '10px' }}>
        {/* Left Side: Product List Table */}
        <div style={{
          flex: '3',
          backgroundColor: 'rgba(30, 34, 51, 0.6)',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          padding: '24px',
          border: '1px solid rgba(102, 252, 241, 0.15)',
          backdropFilter: 'blur(8px)'
        }}>
          <h2 style={{ color: '#fff', marginBottom: '20px', fontWeight: '700', borderBottom: '2px solid #00f2fe', paddingBottom: '10px' }}>
            📦 DANH SÁCH SẢN PHẨM
          </h2>

          <table className="datatable" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(15, 17, 26, 0.85)', borderBottom: '2px solid #555', textAlign: 'left' }}>
                <th style={{ padding: '12px 10px', color: '#fff', width: '100px' }}>ID</th>
                <th style={{ padding: '12px 10px', color: '#fff' }}>Tên sản phẩm</th>
                <th style={{ padding: '12px 10px', color: '#fff', width: '110px' }}>Giá</th>
                <th style={{ padding: '12px 10px', color: '#fff', width: '100px' }}>Số lượng</th>
                <th style={{ padding: '12px 10px', color: '#fff', width: '180px' }}>Ngày tạo</th>
                <th style={{ padding: '12px 10px', color: '#fff', width: '130px' }}>Danh mục</th>
                <th style={{ padding: '12px 10px', color: '#fff', width: '90px' }}>Hình ảnh</th>
              </tr>
            </thead>
            <tbody>
              {prods.length > 0 ? prods : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#777' }}>Không có sản phẩm nào.</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {pagination}
          </div>
        </div>

        {/* Right Side: Product Detail Form */}
        <div style={{
          flex: '2',
          backgroundColor: 'rgba(30, 34, 51, 0.6)',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          padding: '24px',
          border: '1px solid rgba(102, 252, 241, 0.15)',
          backdropFilter: 'blur(8px)',
          maxHeight: 'fit-content'
        }}>
          <ProductDetail 
            item={this.state.itemSelected} 
            curPage={this.state.curPage} 
            updateProducts={this.updateProducts} 
          />
        </div>
      </div>
    );
  }

  componentDidMount() {
    this.apiGetProducts(this.state.curPage);
  }

  // event-handlers
  lnkPageClick(index) {
    this.apiGetProducts(index);
  }

  trItemClick(item) {
    this.setState({ itemSelected: item });
  }

  updateProducts = (products, noPages) => {
    this.setState({ products: products, noPages: noPages, itemSelected: null });
  }

  // apis
  apiGetProducts(page) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/products?page=' + page, config).then((res) => {
      const result = res.data;
      if (result && result.products) {
        this.setState({ products: result.products, noPages: result.noPages, curPage: result.curPage });
      }
    }).catch(err => {
      console.log("No products loaded (MongoDB offline)");
    });
  }
}

export default Product;
