import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';

class ProductDetail extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      txtID: '',
      txtName: '',
      txtPrice: 0,
      txtQuantity: 0,
      cmbCategory: '',
      imgProduct: ''
    };
  }

  render() {
    const cates = this.state.categories.map((cate) => {
      return (<option key={cate._id} value={cate._id}>{cate.name}</option>);
    });

    return (
      <div style={{ width: '100%' }}>
        <h3 style={{ textAlign: 'center', color: '#fff', marginBottom: '20px', fontWeight: '700', borderBottom: '2px solid #555', paddingBottom: '10px' }}>
          📝 CHI TIẾT SẢN PHẨM
        </h3>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }} onSubmit={(e) => e.preventDefault()}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontWeight: '600', color: '#ccc', fontSize: '14px' }}>ID sản phẩm:</label>
            <input 
              type="text" 
              value={this.state.txtID} 
              onChange={(e) => { this.setState({ txtID: e.target.value }) }} 
              readOnly={true} 
              style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #555', backgroundColor: '#333', color: '#888', outline: 'none', fontSize: '14px', fontFamily: 'monospace' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontWeight: '600', color: '#ccc', fontSize: '14px' }}>Tên sản phẩm:</label>
            <input 
              type="text" 
              value={this.state.txtName} 
              onChange={(e) => { this.setState({ txtName: e.target.value }) }} 
              placeholder="Nhập tên sản phẩm..."
              style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #555', backgroundColor: '#222', color: '#fff', outline: 'none', fontSize: '14px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontWeight: '600', color: '#ccc', fontSize: '14px' }}>Giá bán (đ):</label>
            <input 
              type="number" 
              value={this.state.txtPrice} 
              onChange={(e) => { this.setState({ txtPrice: e.target.value }) }} 
              placeholder="Nhập giá bán..."
              style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #555', backgroundColor: '#222', color: '#fff', outline: 'none', fontSize: '14px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontWeight: '600', color: '#ccc', fontSize: '14px' }}>Số lượng:</label>
            <input 
              type="number" 
              value={this.state.txtQuantity} 
              onChange={(e) => { this.setState({ txtQuantity: e.target.value }) }} 
              placeholder="Nhập số lượng tồn kho..."
              style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #555', backgroundColor: '#222', color: '#fff', outline: 'none', fontSize: '14px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontWeight: '600', color: '#ccc', fontSize: '14px' }}>Hình ảnh sản phẩm:</label>
            <input 
              type="file" 
              name="fileImage" 
              accept="image/jpeg, image/png, image/gif" 
              onChange={(e) => this.previewImage(e)} 
              style={{ fontSize: '13px', color: '#ccc' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontWeight: '600', color: '#ccc', fontSize: '14px' }}>Danh mục sản phẩm:</label>
            <select 
              value={this.state.cmbCategory} 
              onChange={(e) => { this.setState({ cmbCategory: e.target.value }) }}
              style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #555', outline: 'none', fontSize: '14px', backgroundColor: '#222', color: '#fff' }}
            >
              {cates}
            </select>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button 
              type="button" 
              onClick={(e) => this.btnAddClick(e)}
              style={{ flex: 1, backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', transition: 'opacity 0.2s' }}
            >
              ➕ Thêm mới
            </button>
            <button 
              type="button" 
              onClick={(e) => this.btnUpdateClick(e)}
              style={{ flex: 1, backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', transition: 'opacity 0.2s' }}
            >
              ✏️ Cập nhật
            </button>
            <button 
              type="button" 
              onClick={(e) => this.btnDeleteClick(e)}
              style={{ flex: 1, backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', transition: 'opacity 0.2s' }}
            >
              🗑️ Xóa bỏ
            </button>
          </div>

          {/* Image preview box */}
          {this.state.imgProduct && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px', border: '1px dashed #555', padding: '10px', borderRadius: '6px', backgroundColor: '#222' }}>
              <img src={this.state.imgProduct} style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '4px' }} alt="" />
            </div>
          )}
        </form>
      </div>
    );
  }

  componentDidMount() {
    this.apiGetCategories();
  }

  getProductImageUrl(image) {
    if (!image) return '/img/bo_thang_honda.jpg';
    if (image.startsWith('data:') || image.startsWith('http://') || image.startsWith('https://')) return image;
    if (image.startsWith('/')) return image;
    if (image.includes('.') || image.endsWith('.jpg') || image.endsWith('.png')) return '/img/' + image;
    return 'data:image/jpg;base64,' + image;
  }

  componentDidUpdate(prevProps) {
    if (this.props.item !== prevProps.item && this.props.item != null) {
      this.setState({
        txtID: this.props.item._id,
        txtName: this.props.item.name,
        txtPrice: this.props.item.price,
        txtQuantity: this.props.item.quantity || 0,
        cmbCategory: this.props.item.category ? this.props.item.category._id : '',
        imgProduct: this.getProductImageUrl(this.props.item.image)
      });
    }
  }

  // event-handlers
  previewImage(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        this.setState({ imgProduct: evt.target.result });
      };
      reader.readAsDataURL(file);
    }
  }

  btnAddClick(e) {
    e.preventDefault();
    const name = this.state.txtName;
    const price = parseInt(this.state.txtPrice);
    const quantity = parseInt(this.state.txtQuantity);
    const category = this.state.cmbCategory;
    const image = this.state.imgProduct.replace(/^data:image\/[a-z]+;base64,/, ''); // remove "data:image/...;base64,"
    if (name && price && !isNaN(quantity) && category && image) {
      const prod = { name: name, price: price, quantity: quantity, category: category, image: image };
      this.apiPostProduct(prod);
    } else {
      alert('Vui lòng điền đầy đủ tên, giá bán, số lượng, danh mục và hình ảnh!');
    }
  }

  btnUpdateClick(e) {
    e.preventDefault();
    const id = this.state.txtID;
    const name = this.state.txtName;
    const price = parseInt(this.state.txtPrice);
    const quantity = parseInt(this.state.txtQuantity);
    const category = this.state.cmbCategory;
    const image = this.state.imgProduct.replace(/^data:image\/[a-z]+;base64,/, ''); // remove "data:image/...;base64,"
    if (id && name && price && !isNaN(quantity) && category && image) {
      const prod = { name: name, price: price, quantity: quantity, category: category, image: image };
      this.apiPutProduct(id, prod);
    } else {
      alert('Vui lòng chọn sản phẩm và điền đầy đủ thông tin để cập nhật!');
    }
  }

  btnDeleteClick(e) {
    e.preventDefault();
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) {
      const id = this.state.txtID;
      if (id) {
        this.apiDeleteProduct(id);
      } else {
        alert('Vui lòng chọn sản phẩm cần xóa!');
      }
    }
  }

  // apis
  apiGetCategories() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/categories', config).then((res) => {
      const result = res.data;
      this.setState({ categories: result });
      if (result && result.length > 0) {
        this.setState({ cmbCategory: result[0]._id });
      }
    }).catch(err => {
      console.log("No categories loaded (MongoDB offline)");
    });
  }

  apiPostProduct(prod) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.post('/api/admin/products', prod, config).then((res) => {
      const result = res.data;
      if (result) {
        alert('Thêm sản phẩm thành công!');
        this.apiGetProducts();
      } else {
        alert('Thêm sản phẩm thất bại!');
      }
    });
  }

  apiPutProduct(id, prod) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.put('/api/admin/products/' + id, prod, config).then((res) => {
      const result = res.data;
      if (result) {
        alert('Cập nhật sản phẩm thành công!');
        this.apiGetProducts();
      } else {
        alert('Cập nhật sản phẩm thất bại!');
      }
    });
  }

  apiDeleteProduct(id) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.delete('/api/admin/products/' + id, config).then((res) => {
      const result = res.data;
      if (result) {
        alert('Xóa sản phẩm thành công!');
        this.apiGetProducts();
      } else {
        alert('Xóa sản phẩm thất bại!');
      }
    });
  }

  apiGetProducts() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/products?page=' + this.props.curPage, config).then((res) => {
      const result = res.data;
      if (result && result.products) {
        if (result.products.length !== 0) {
          this.props.updateProducts(result.products, result.noPages);
        } else if (this.props.curPage > 1) {
          axios.get('/api/admin/products?page=' + (this.props.curPage - 1), config).then((res) => {
            const resultInner = res.data;
            this.props.updateProducts(resultInner.products, resultInner.noPages);
          });
        }
      }
    }).catch(err => {
      console.log("No products loaded (MongoDB offline)");
    });
  }
}

export default ProductDetail;
