import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import axios from 'axios';

class Order extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      orders: []
    };
  }

  componentDidMount() {
    this.apiGetOrders();
  }

  renderImage(image) {
    if (!image) return '/img/bo_thang_honda.jpg';
    if (image.startsWith('data:image') || image.startsWith('http://') || image.startsWith('https://')) return image;
    if (image.startsWith('/')) return image;
    return 'data:image/jpg;base64,' + image;
  }

  getStatusStyle(status) {
    switch (status) {
      case 'PENDING':
        return { backgroundColor: '#fff7ed', color: '#c2410c', border: '1px solid #000000', padding: '4px 10px', borderRadius: '12px', fontWeight: '900', fontSize: '12px' };
      case 'APPROVED':
        return { backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #000000', padding: '4px 10px', borderRadius: '12px', fontWeight: '900', fontSize: '12px' };
      case 'SHIPPING':
        return { backgroundColor: '#ecfeff', color: '#0e7490', border: '1px solid #000000', padding: '4px 10px', borderRadius: '12px', fontWeight: '900', fontSize: '12px' };
      case 'DELIVERED':
        return { backgroundColor: '#f0fdf4', color: '#15803d', border: '1px solid #000000', padding: '4px 10px', borderRadius: '12px', fontWeight: '900', fontSize: '12px' };
      case 'CANCELED':
        return { backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #000000', padding: '4px 10px', borderRadius: '12px', fontWeight: '900', fontSize: '12px' };
      default:
        return { backgroundColor: '#f1f5f9', color: '#000000', border: '1px solid #000000', padding: '4px 10px', borderRadius: '12px', fontWeight: '900', fontSize: '12px' };
    }
  }

  getStatusLabel(status) {
    switch (status) {
      case 'PENDING': return 'Chờ xác nhận';
      case 'APPROVED': return 'Chờ lấy hàng';
      case 'SHIPPING': return 'Đang giao hàng';
      case 'DELIVERED': return 'Đã giao hàng';
      case 'CANCELED': return 'Đã hủy';
      default: return status;
    }
  }

  render() {
    const orderRows = this.state.orders.map((order) => {
      const date = new Date(order.cdate).toLocaleString('vi-VN');
      const itemsList = order.items.map((item) => (
        <div key={item.product._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
          <img src={this.renderImage(item.product.image)} alt="" style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover', border: '1px solid #000000' }} />
          <span style={{ fontSize: '13px', color: '#000000', fontWeight: 'bold' }}>{item.product.name} (x{item.quantity})</span>
        </div>
      ));

      return (
        <tr key={order._id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
          <td style={{ padding: '12px 15px', fontFamily: 'monospace', fontSize: '13px', color: '#000000', fontWeight: '900' }}>{order._id}</td>
          <td style={{ padding: '12px 15px' }}>
            <div style={{ fontWeight: '900', color: '#000000', fontSize: '14px' }}>🧑 {order.customer.name}</div>
            <div style={{ fontSize: '12px', color: '#000000', fontWeight: 'bold', marginTop: '2px' }}>📞 SĐT: {order.shippingPhone || order.customer.phone}</div>
            <div style={{ fontSize: '12px', color: '#000000', fontWeight: '600' }}>✉️ Email: {order.customer.email}</div>
            {order.shippingAddress && (
              <div style={{ fontSize: '12px', color: '#ff0000', marginTop: '4px', fontWeight: 'bold' }}>🏠 Đ/c: {order.shippingAddress}</div>
            )}
            {order.note && (
              <div style={{ fontSize: '12px', color: '#000000', marginTop: '4px', fontStyle: 'italic', fontWeight: 'bold' }}>📝 Ghi chú: {order.note}</div>
            )}
          </td>
          <td style={{ padding: '12px 15px', color: '#000000', fontWeight: 'bold' }}>{date}</td>
          <td style={{ padding: '12px 15px', fontWeight: '900', color: '#ff0000', textAlign: 'right', fontSize: '15px' }}>
            {(order.total ?? 0).toLocaleString('vi-VN')} đ
          </td>
          <td style={{ padding: '12px 15px', textAlign: 'center' }}>
            <span style={this.getStatusStyle(order.status)}>{this.getStatusLabel(order.status)}</span>
          </td>
          <td style={{ padding: '12px 15px' }}>
            {itemsList}
          </td>
          <td style={{ padding: '12px 15px', textAlign: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
              {order.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => this.btnUpdateStatusClick(order._id, 'APPROVED')}
                    style={{ backgroundColor: '#000000', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px', width: '130px' }}
                  >
                    ✓ Xác nhận đơn
                  </button>
                  <button
                    onClick={() => this.btnUpdateStatusClick(order._id, 'CANCELED')}
                    style={{ backgroundColor: '#ff0000', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px', width: '130px' }}
                  >
                    ✗ Hủy đơn
                  </button>
                </>
              )}

              {order.status === 'APPROVED' && (
                <>
                  <button
                    onClick={() => this.btnUpdateStatusClick(order._id, 'SHIPPING')}
                    style={{ backgroundColor: '#000000', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px', width: '130px' }}
                  >
                    🚚 Giao hàng
                  </button>
                  <button
                    onClick={() => this.btnUpdateStatusClick(order._id, 'CANCELED')}
                    style={{ backgroundColor: '#ff0000', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px', width: '130px' }}
                  >
                    ✗ Hủy đơn
                  </button>
                </>
              )}

              {order.status === 'SHIPPING' && (
                <>
                  <button
                    onClick={() => this.btnUpdateStatusClick(order._id, 'DELIVERED')}
                    style={{ backgroundColor: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px', width: '130px' }}
                  >
                    🎉 Đã giao hàng
                  </button>
                  <button
                    onClick={() => this.btnUpdateStatusClick(order._id, 'CANCELED')}
                    style={{ backgroundColor: '#ff0000', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px', width: '130px' }}
                  >
                    ✗ Hủy đơn
                  </button>
                </>
              )}

              {(order.status === 'DELIVERED' || order.status === 'CANCELED') && (
                <span style={{ fontSize: '12px', color: '#000000', fontWeight: 'bold' }}>Hoàn tất</span>
              )}
            </div>
          </td>
        </tr>
      );
    });

    return (
      <div style={{ padding: '25px', backgroundColor: '#ffffff', borderRadius: '16px', border: '2px solid #000000', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '25px', color: '#ff0000', fontWeight: '900', textTransform: 'uppercase' }}>
          📦 QUẢN LÝ ĐƠN ĐẶT HÀNG
        </h2>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: '#000000', color: '#ffffff', textAlign: 'left' }}>
              <th style={{ padding: '12px 15px', color: '#ffffff' }}>ID Đơn hàng</th>
              <th style={{ padding: '12px 15px', color: '#ffffff' }}>Thông tin khách hàng</th>
              <th style={{ padding: '12px 15px', color: '#ffffff', width: '160px' }}>Ngày đặt</th>
              <th style={{ padding: '12px 15px', color: '#ffffff', textAlign: 'right', width: '140px' }}>Tổng tiền</th>
              <th style={{ padding: '12px 15px', color: '#ffffff', textAlign: 'center', width: '130px' }}>Trạng thái</th>
              <th style={{ padding: '12px 15px', color: '#ffffff' }}>Sản phẩm đặt</th>
              <th style={{ padding: '12px 15px', color: '#ffffff', textAlign: 'center', width: '180px' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {orderRows.length > 0 ? orderRows : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#000000', fontWeight: 'bold' }}>Không có đơn đặt hàng nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  apiGetOrders() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/orders', config).then((res) => {
      const result = res.data;
      if (Array.isArray(result)) {
        this.setState({ orders: result });
      }
    }).catch(err => {
      console.log("No orders loaded");
    });
  }

  btnUpdateStatusClick(id, status) {
    const actionText = status === 'APPROVED' ? 'duyệt' : 'hủy';
    if (window.confirm(`Bạn có chắc chắn muốn ${actionText} đơn hàng này không?`)) {
      const config = { headers: { 'x-access-token': this.context.token } };
      axios.put('/api/admin/orders/status/' + id, { status: status }, config).then((res) => {
        const result = res.data;
        if (result.success) {
          alert('Cập nhật trạng thái đơn hàng thành công!');
          this.apiGetOrders();
        } else {
          alert(result.message || 'Cập nhật thất bại.');
        }
      });
    }
  }
}

export default Order;
