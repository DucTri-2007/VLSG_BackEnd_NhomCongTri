import React, { Component } from 'react';
import axios from 'axios';
import MyContext from '../contexts/MyContext';

class VoucherComponent extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      vouchers: [],
      selectedVoucher: null,
      code: '',
      discountPercent: 20,
      minOrderValue: 0,
      minTier: 'Đồng',
      description: '',
      active: true,
      message: ''
    };
  }

  componentDidMount() {
    this.apiGetVouchers();
  }

  apiGetVouchers() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/vouchers', config)
      .then(res => {
        this.setState({ vouchers: res.data || [] });
      })
      .catch(err => {
        console.error("Lỗi lấy danh sách voucher:", err.message);
      });
  }

  handleSelectVoucher(v) {
    this.setState({
      selectedVoucher: v,
      code: v.code,
      discountPercent: v.discountPercent,
      minOrderValue: v.minOrderValue,
      minTier: v.minTier || 'Đồng',
      description: v.description || '',
      active: v.active !== undefined ? v.active : true
    });
  }

  handleClearForm() {
    this.setState({
      selectedVoucher: null,
      code: '',
      discountPercent: 20,
      minOrderValue: 0,
      minTier: 'Đồng',
      description: '',
      active: true
    });
  }

  handleSaveVoucher(e) {
    e.preventDefault();
    const { selectedVoucher, code, discountPercent, minOrderValue, minTier, description, active } = this.state;
    if (!code || !code.trim()) {
      alert("Vui lòng nhập mã giảm giá!");
      return;
    }

    const config = { headers: { 'x-access-token': this.context.token } };
    const body = { code, discountPercent, minOrderValue, minTier, description, active };

    if (selectedVoucher) {
      axios.put(`/api/admin/vouchers/${selectedVoucher._id}`, body, config)
        .then(res => {
          if (res.data.success) {
            this.setState({ message: '✅ Cập nhật Mã giảm giá thành công!' });
            this.handleClearForm();
            this.apiGetVouchers();
            setTimeout(() => this.setState({ message: '' }), 3000);
          }
        });
    } else {
      axios.post('/api/admin/vouchers', body, config)
        .then(res => {
          if (res.data.success) {
            this.setState({ message: '🎉 Thêm Mã giảm giá mới thành công!' });
            this.handleClearForm();
            this.apiGetVouchers();
            setTimeout(() => this.setState({ message: '' }), 3000);
          }
        });
    }
  }

  handleDeleteVoucher(_id) {
    if (!window.confirm("Bạn có chắc chắn muốn xóa mã giảm giá này?")) return;
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.delete(`/api/admin/vouchers/${_id}`, config)
      .then(res => {
        if (res.data.success) {
          this.setState({ message: '🗑️ Đã xóa mã giảm giá!' });
          this.handleClearForm();
          this.apiGetVouchers();
          setTimeout(() => this.setState({ message: '' }), 3000);
        }
      });
  }

  render() {
    const { vouchers, selectedVoucher, code, discountPercent, minOrderValue, minTier, description, active, message } = this.state;

    return (
      <div style={{ padding: '25px', backgroundColor: '#ffffff', borderRadius: '16px', border: '2px solid #000000', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#ff0000', marginBottom: '20px', fontWeight: '900', textTransform: 'uppercase', textAlign: 'center' }}>
          🏷️ QUẢN LÝ MÃ GIẢM GIÁ VOUCHER (PHÂN QUYỀN HẠNG HỘI VIÊN)
        </h2>

        {message && (
          <div style={{ padding: '12px 18px', marginBottom: '20px', borderRadius: '8px', backgroundColor: message.includes('✅') || message.includes('🎉') ? '#dcfce7' : '#fee2e2', color: message.includes('✅') || message.includes('🎉') ? '#15803d' : '#b91c1c', fontWeight: 'bold', border: '1px solid #000000' }}>
            {message}
          </div>
        )}

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {/* Table */}
          <div style={{ flex: '3', backgroundColor: '#ffffff', borderRadius: '12px', border: '2px solid #000000', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#000000', color: '#ffffff', textAlign: 'left' }}>
                  <th style={{ padding: '14px 12px', color: '#ffffff' }}>Mã Code</th>
                  <th style={{ padding: '14px 12px', color: '#ffffff' }}>Giảm (%)</th>
                  <th style={{ padding: '14px 12px', color: '#ffffff' }}>Hạng yêu cầu</th>
                  <th style={{ padding: '14px 12px', color: '#ffffff' }}>Đơn tối thiểu</th>
                  <th style={{ padding: '14px 12px', color: '#ffffff' }}>Mô tả</th>
                  <th style={{ padding: '14px 12px', color: '#ffffff' }}>Trạng thái</th>
                  <th style={{ padding: '14px 12px', color: '#ffffff' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map(v => (
                  <tr key={v._id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: selectedVoucher?._id === v._id ? '#fff1f2' : '#ffffff' }}>
                    <td style={{ padding: '12px', fontWeight: '900', color: '#ff0000', fontSize: '15px', fontFamily: 'monospace' }}>
                      🎟️ {v.code}
                    </td>
                    <td style={{ padding: '12px', fontWeight: '900', color: '#000000' }}>
                      -{v.discountPercent}%
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '10px', backgroundColor: '#ff0000', color: '#ffffff', fontSize: '11px', fontWeight: 'bold' }}>
                        {v.minTier || 'Đồng'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#000000' }}>
                      {(v.minOrderValue || 0).toLocaleString('vi-VN')} đ
                    </td>
                    <td style={{ padding: '12px', fontSize: '13px', color: '#000000', fontWeight: '500' }}>
                      {v.description}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '10px', backgroundColor: v.active ? '#16a34a' : '#dc2626', color: '#ffffff', fontSize: '11px', fontWeight: 'bold' }}>
                        {v.active ? '🟢 Đang mở' : '🔴 Khóa'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => this.handleSelectVoucher(v)}
                        style={{ padding: '6px 10px', borderRadius: '6px', border: 'none', backgroundColor: '#000000', color: '#ffffff', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => this.handleDeleteVoucher(v._id)}
                        style={{ padding: '6px 10px', borderRadius: '6px', border: 'none', backgroundColor: '#ff0000', color: '#ffffff', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Form */}
          <div style={{ flex: '1', minWidth: '280px', backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', border: '2px solid #000000', height: 'fit-content' }}>
            <h3 style={{ color: '#ff0000', marginBottom: '15px', fontWeight: '800' }}>
              {selectedVoucher ? `✏️ Sửa Voucher: ${selectedVoucher.code}` : '➕ Tạo Voucher Mới'}
            </h3>

            <form onSubmit={(e) => this.handleSaveVoucher(e)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ color: '#000000', fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Mã giảm giá (Code):</label>
                <input
                  type="text"
                  placeholder="Ví dụ: COPPER20"
                  value={code}
                  onChange={(e) => this.setState({ code: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '2px solid #000000', backgroundColor: '#ffffff', color: '#000000', textTransform: 'uppercase', fontWeight: 'bold' }}
                />
              </div>

              <div>
                <label style={{ color: '#000000', fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Hạng Hội Viên Tối Thiểu (Phân quyền):</label>
                <select
                  value={minTier}
                  onChange={(e) => this.setState({ minTier: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '2px solid #000000', backgroundColor: '#ffffff', color: '#000000', fontWeight: 'bold' }}
                >
                  <option value="Đồng">Đồng (Cho tất cả)</option>
                  <option value="Bạc">Bạc trở lên</option>
                  <option value="Vàng">Vàng trở lên</option>
                  <option value="Bạch Kim">Bạch Kim trở lên</option>
                  <option value="Kim Cương">Kim Cương trở lên</option>
                  <option value="Tinh Anh">Tinh Anh trở lên</option>
                  <option value="Huyền Thoại">Huyền Thoại (Chỉ VIP)</option>
                </select>
              </div>

              <div>
                <label style={{ color: '#000000', fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Mức giảm giá (%):</label>
                <input
                  type="number"
                  placeholder="20"
                  value={discountPercent}
                  onChange={(e) => this.setState({ discountPercent: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '2px solid #000000', backgroundColor: '#ffffff', color: '#000000', fontWeight: 'bold' }}
                />
              </div>

              <div>
                <label style={{ color: '#000000', fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Giá trị đơn tối thiểu (VNĐ):</label>
                <input
                  type="number"
                  placeholder="0"
                  value={minOrderValue}
                  onChange={(e) => this.setState({ minOrderValue: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '2px solid #000000', backgroundColor: '#ffffff', color: '#000000', fontWeight: 'bold' }}
                />
              </div>

              <div>
                <label style={{ color: '#000000', fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Mô tả ưu đãi:</label>
                <textarea
                  placeholder="Mô tả ưu đãi..."
                  value={description}
                  onChange={(e) => this.setState({ description: e.target.value })}
                  rows="2"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '2px solid #000000', backgroundColor: '#ffffff', color: '#000000', fontWeight: 'bold', resize: 'vertical' }}
                ></textarea>
              </div>

              <div>
                <label style={{ color: '#000000', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => this.setState({ active: e.target.checked })}
                  />
                  Kích hoạt mã này
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#ff0000', color: '#ffffff', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {selectedVoucher ? '💾 Lưu Cập Nhật' : '➕ Tạo Voucher'}
                </button>
                {selectedVoucher && (
                  <button
                    type="button"
                    onClick={() => this.handleClearForm()}
                    style={{ padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#000000', color: '#ffffff', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Hủy
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default VoucherComponent;
