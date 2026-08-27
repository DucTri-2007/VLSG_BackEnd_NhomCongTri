import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import axios from 'axios';

class Customer extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      customers: [],
      searchQuery: ''
    };
  }

  componentDidMount() {
    this.apiGetCustomers();
  }

  render() {
    const filteredCustomers = this.state.customers.filter(cust => 
      cust.username.toLowerCase().includes(this.state.searchQuery.toLowerCase()) ||
      cust.email.toLowerCase().includes(this.state.searchQuery.toLowerCase()) ||
      cust._id.toLowerCase().includes(this.state.searchQuery.toLowerCase())
    );

    const custRows = filteredCustomers.map((cust) => {
      const isActive = cust.active === 1;
      return (
        <tr key={cust._id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.2s', backgroundColor: '#ffffff' }}>
          <td style={{ padding: '12px 15px', fontFamily: 'monospace', fontSize: '13px', color: '#000000', fontWeight: 'bold' }}>{cust._id}</td>
          <td style={{ padding: '12px 15px', fontWeight: '900', color: '#000000' }}>{cust.username}</td>
          <td style={{ padding: '12px 15px', fontWeight: '600', color: '#000000' }}>{cust.name}</td>
          <td style={{ padding: '12px 15px', fontWeight: '600', color: '#000000' }}>{cust.phone}</td>
          <td style={{ padding: '12px 15px', fontWeight: '600', color: '#000000' }}>{cust.email}</td>
          <td style={{ padding: '12px 15px', fontFamily: 'monospace', fontSize: '12px', color: '#000000' }}>{cust.token || 'N/A'}</td>
          <td style={{ padding: '12px 15px', textAlign: 'center' }}>
            <span style={{
              backgroundColor: isActive ? '#dcfce7' : '#fee2e2',
              color: isActive ? '#15803d' : '#b91c1c',
              padding: '4px 10px',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '12px',
              border: isActive ? '1px solid #86efac' : '1px solid #fca5a5'
            }}>
              {isActive ? 'Đạt (Active)' : 'Khóa (Inactive)'}
            </span>
          </td>
          <td style={{ padding: '12px 15px', textAlign: 'center' }}>
            {isActive ? (
              <button
                onClick={() => this.btnDeactivateClick(cust._id)}
                style={{
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '13px'
                }}
              >
                🔒 Khóa tài khoản
              </button>
            ) : (
              <button
                onClick={() => this.btnApproveClick(cust._id)}
                style={{
                  backgroundColor: '#ff0000',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '13px'
                }}
              >
                ⚡ Kích hoạt
              </button>
            )}
          </td>
        </tr>
      );
    });

    return (
      <div style={{ padding: '25px', backgroundColor: '#ffffff', borderRadius: '16px', border: '2px solid #000000', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '25px', color: '#ff0000', fontWeight: '900', textTransform: 'uppercase' }}>
          👥 QUẢN LÝ TÀI KHOẢN KHÁCH HÀNG
        </h2>
        
        {/* Search bar */}
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <input 
            type="text" 
            placeholder="Tìm kiếm theo ID, username, email..." 
            value={this.state.searchQuery}
            onChange={(e) => this.setState({ searchQuery: e.target.value })}
            style={{
              padding: '10px 15px',
              borderRadius: '6px',
              backgroundColor: '#ffffff',
              color: '#000000',
              border: '2px solid #000000',
              width: '320px',
              fontWeight: 'bold',
              outline: 'none'
            }}
          />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: '#000000', color: '#ffffff', textAlign: 'left' }}>
              <th style={{ padding: '14px 15px', color: '#ffffff' }}>ID</th>
              <th style={{ padding: '14px 15px', color: '#ffffff' }}>Username</th>
              <th style={{ padding: '14px 15px', color: '#ffffff' }}>Họ tên</th>
              <th style={{ padding: '14px 15px', color: '#ffffff' }}>Điện thoại</th>
              <th style={{ padding: '14px 15px', color: '#ffffff' }}>Email</th>
              <th style={{ padding: '14px 15px', color: '#ffffff' }}>Mã Token</th>
              <th style={{ padding: '14px 15px', color: '#ffffff', textAlign: 'center' }}>Trạng thái</th>
              <th style={{ padding: '14px 15px', color: '#ffffff', textAlign: 'center' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {custRows.length > 0 ? custRows : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: '#000000', fontWeight: 'bold' }}>Không tìm thấy khách hàng nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  apiGetCustomers() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/customers', config).then((res) => {
      const result = res.data;
      if (Array.isArray(result)) {
        this.setState({ customers: result });
      }
    }).catch(err => {
      console.log("No customers loaded");
    });
  }

  btnApproveClick(id) {
    if (window.confirm('Bạn có chắc chắn muốn kích hoạt tài khoản này?')) {
      const config = { headers: { 'x-access-token': this.context.token } };
      axios.put('/api/admin/customers/approve/' + id, {}, config).then((res) => {
        const result = res.data;
        if (result.success) {
          alert('Kích hoạt tài khoản thành công!');
          this.apiGetCustomers();
        } else {
          alert(result.message || 'Kích hoạt thất bại.');
        }
      });
    }
  }

  btnDeactivateClick(id) {
    if (window.confirm('Bạn có chắc chắn muốn khóa tài khoản này không?')) {
      const config = { headers: { 'x-access-token': this.context.token } };
      axios.put('/api/admin/customers/deactivate/' + id, {}, config).then((res) => {
        const result = res.data;
        if (result.success) {
          alert('Khóa tài khoản khách hàng thành công!');
          this.apiGetCustomers();
        } else {
          alert(result.message || 'Khóa tài khoản thất bại.');
        }
      });
    }
  }
}

export default Customer;
