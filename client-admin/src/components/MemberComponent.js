import React, { Component } from 'react';
import axios from 'axios';
import MyContext from '../contexts/MyContext';

class MemberComponent extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      members: [],
      selectedMember: null,
      editPoints: 0,
      editTier: 'Đồng',
      editWallet: 1000000,
      message: ''
    };
  }

  componentDidMount() {
    this.apiGetMembers();
  }

  apiGetMembers() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/customers', config)
      .then(res => {
        this.setState({ members: res.data || [] });
      })
      .catch(err => {
        console.error("Lỗi lấy danh sách hội viên:", err.message);
      });
  }

  handleSelectMember(member) {
    this.setState({
      selectedMember: member,
      editPoints: member.points || 0,
      editTier: member.membershipTier || 'Đồng',
      editWallet: member.walletBalance !== undefined ? member.walletBalance : 1000000
    });
  }

  handleToggleLock(member) {
    const config = { headers: { 'x-access-token': this.context.token } };
    const isCurrentlyActive = member.active === 1;
    const endpoint = isCurrentlyActive ? `/api/admin/customers/deactivate/${member._id}` : `/api/admin/customers/approve/${member._id}`;
    const actionName = isCurrentlyActive ? '🔒 Khóa tài khoản' : '🟢 Mở khóa tài khoản';

    if (!window.confirm(`Bạn có chắc chắn muốn ${actionName} cho hội viên "${member.name || member.username}"?`)) return;

    axios.put(endpoint, {}, config)
      .then(res => {
        if (res.data.success) {
          this.setState({ message: `✅ ${res.data.message}` });
          this.apiGetMembers();
          setTimeout(() => this.setState({ message: '' }), 3000);
        }
      });
  }

  handleDeleteMember(member) {
    if (!window.confirm(`⚠️ CẢNH BÁO: Xóa vĩnh viễn hội viên "${member.name || member.username}"? Hành động này không thể hoàn tác!`)) return;

    const config = { headers: { 'x-access-token': this.context.token } };
    axios.delete(`/api/admin/customers/${member._id}`, config)
      .then(res => {
        if (res.data.success) {
          this.setState({ message: '🗑️ Đã xóa hội viên thành công!' });
          this.setState({ selectedMember: null });
          this.apiGetMembers();
          setTimeout(() => this.setState({ message: '' }), 3000);
        }
      });
  }

  handleUpdateMember(e) {
    e.preventDefault();
    const { selectedMember, editPoints, editTier, editWallet } = this.state;
    if (!selectedMember) return;

    const config = { headers: { 'x-access-token': this.context.token } };
    const body = {
      points: editPoints,
      membershipTier: editTier,
      walletBalance: editWallet
    };

    axios.put(`/api/admin/customers/member/${selectedMember._id}`, body, config)
      .then(res => {
        if (res.data.success) {
          this.setState({ message: '✅ Cập nhật thông tin hội viên thành công!' });
          this.apiGetMembers();
          setTimeout(() => this.setState({ message: '' }), 3000);
        } else {
          this.setState({ message: '❌ ' + res.data.message });
        }
      })
      .catch(err => {
        this.setState({ message: '❌ Lỗi server: ' + err.message });
      });
  }

  render() {
    const { members, selectedMember, editPoints, editTier, editWallet, message } = this.state;

    return (
      <div style={{ padding: '25px', backgroundColor: '#ffffff', borderRadius: '16px', border: '2px solid #000000', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#ff0000', marginBottom: '20px', fontWeight: '900', textTransform: 'uppercase', textAlign: 'center' }}>
          👑 QUẢN LÝ HỘI VIÊN &amp; VÍ MPS WALLET (7 HẠNG HỘI VIÊN)
        </h2>

        {message && (
          <div style={{ padding: '12px 18px', marginBottom: '20px', borderRadius: '8px', backgroundColor: message.includes('✅') || message.includes('🗑️') ? '#dcfce7' : '#fee2e2', color: message.includes('✅') || message.includes('🗑️') ? '#15803d' : '#b91c1c', fontWeight: 'bold', border: '1px solid #000000' }}>
            {message}
          </div>
        )}

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {/* Members Table */}
          <div style={{ flex: '3', backgroundColor: '#ffffff', borderRadius: '12px', border: '2px solid #000000', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#000000', color: '#ffffff', textAlign: 'left' }}>
                  <th style={{ padding: '14px 12px', color: '#ffffff' }}>Tên hội viên</th>
                  <th style={{ padding: '14px 12px', color: '#ffffff' }}>SĐT / Email</th>
                  <th style={{ padding: '14px 12px', color: '#ffffff' }}>Hạng Hội Viên</th>
                  <th style={{ padding: '14px 12px', color: '#ffffff' }}>Điểm Thưởng</th>
                  <th style={{ padding: '14px 12px', color: '#ffffff' }}>Ví MPS Wallet</th>
                  <th style={{ padding: '14px 12px', color: '#ffffff' }}>Trạng thái</th>
                  <th style={{ padding: '14px 12px', color: '#ffffff' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {members.map(m => (
                  <tr key={m._id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: selectedMember?._id === m._id ? '#fff1f2' : '#ffffff' }}>
                    <td style={{ padding: '12px', fontWeight: '900', color: '#000000' }}>{m.name || m.username}</td>
                    <td style={{ padding: '12px', color: '#000000', fontWeight: '600', fontSize: '13px' }}>{m.phone || m.email}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '4px 12px', borderRadius: '12px', backgroundColor: '#ff0000', color: '#ffffff', fontWeight: 'bold', fontSize: '12px' }}>
                        {m.membershipTier || 'Đồng'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontWeight: '900', color: '#ff0000' }}>
                      {(m.points || 0).toLocaleString('vi-VN')} pts
                    </td>
                    <td style={{ padding: '12px', fontWeight: '900', color: '#000000' }}>
                      {(m.walletBalance !== undefined ? m.walletBalance : 1000000).toLocaleString('vi-VN')} đ
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '10px', backgroundColor: m.active === 1 ? '#16a34a' : '#dc2626', color: '#ffffff', fontSize: '11px', fontWeight: 'bold' }}>
                        {m.active === 1 ? '🟢 Hoạt động' : '🔴 Khóa'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => this.handleSelectMember(m)}
                        style={{ padding: '6px 10px', borderRadius: '6px', border: 'none', backgroundColor: '#ff0000', color: '#ffffff', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        onClick={() => this.handleToggleLock(m)}
                        style={{ padding: '6px 10px', borderRadius: '6px', border: 'none', backgroundColor: m.active === 1 ? '#000000' : '#16a34a', color: '#ffffff', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                      >
                        {m.active === 1 ? '🔒 Khóa' : '🟢 Mở'}
                      </button>
                      <button
                        onClick={() => this.handleDeleteMember(m)}
                        style={{ padding: '6px 10px', borderRadius: '6px', border: 'none', backgroundColor: '#dc2626', color: '#ffffff', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                      >
                        🗑️ Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Edit Form */}
          <div style={{ flex: '1', minWidth: '280px', backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', border: '2px solid #000000', height: 'fit-content' }}>
            <h3 style={{ color: '#ff0000', marginBottom: '15px', fontWeight: '800' }}>
              {selectedMember ? `✏️ Cập nhật: ${selectedMember.name}` : '👉 Chọn hội viên để sửa'}
            </h3>

            {selectedMember ? (
              <form onSubmit={(e) => this.handleUpdateMember(e)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ color: '#000000', fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Điểm tích lũy (pts):</label>
                  <input
                    type="number"
                    value={editPoints}
                    onChange={(e) => this.setState({ editPoints: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '2px solid #000000', backgroundColor: '#ffffff', color: '#000000', fontWeight: 'bold' }}
                  />
                </div>

                <div>
                  <label style={{ color: '#000000', fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Hạng Hội Viên (7 Cấp):</label>
                  <select
                    value={editTier}
                    onChange={(e) => this.setState({ editTier: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '2px solid #000000', backgroundColor: '#ffffff', color: '#000000', fontWeight: 'bold' }}
                  >
                    <option value="Đồng">Đồng (0 - 99 pts)</option>
                    <option value="Bạc">Bạc (100 - 499 pts)</option>
                    <option value="Vàng">Vàng (500 - 999 pts)</option>
                    <option value="Bạch Kim">Bạch Kim (1.000 - 1.999 pts)</option>
                    <option value="Kim Cương">Kim Cương (2.000 - 4.999 pts)</option>
                    <option value="Tinh Anh">Tinh Anh (5.000 - 9.999 pts)</option>
                    <option value="Huyền Thoại">Huyền Thoại (10.000+ pts)</option>
                  </select>
                </div>

                <div>
                  <label style={{ color: '#000000', fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Số dư Ví MPS Wallet (VNĐ):</label>
                  <input
                    type="number"
                    value={editWallet}
                    onChange={(e) => this.setState({ editWallet: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '2px solid #000000', backgroundColor: '#ffffff', color: '#000000', fontWeight: 'bold' }}
                  />
                </div>

                <button
                  type="submit"
                  style={{ marginTop: '10px', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#ff0000', color: '#ffffff', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
                >
                  💾 Lưu Cập Nhật
                </button>
              </form>
            ) : (
              <p style={{ color: '#000000', fontSize: '14px', fontWeight: '500' }}>Vui lòng bấm nút <b>✏️ Sửa</b>, <b>🔒 Khóa</b> hoặc <b>🗑️ Xóa</b> ở danh sách hội viên bên trái để điều khiển tài khoản.</p>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default MemberComponent;
