import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';

class Login extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      txtUsername: '',
      txtPassword: ''
    };
  }

  render() {
    if (this.context.token === '') {
      return (
        <div className="login-container-dark">
          <div className="login-card-dark">
            <div className="login-logo">
              ADMIN
            </div>
            <form onSubmit={(e) => this.btnLoginClick(e)}>
              <div className="input-group-dark">
                <label>Username</label>
                <input
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  value={this.state.txtUsername}
                  onChange={(e) => { this.setState({ txtUsername: e.target.value }); }}
                  className="input-field-dark"
                  required
                />
              </div>
              <div className="input-group-dark">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={this.state.txtPassword}
                  onChange={(e) => { this.setState({ txtPassword: e.target.value }); }}
                  className="input-field-dark"
                  required
                />
              </div>
              <button type="submit" className="btn-submit-dark">
                ĐĂNG NHẬP HỆ THỐNG
              </button>
            </form>
          </div>
        </div>
      );
    }
    return <div />;
  }

  // event-handlers
  btnLoginClick(e) {
    e.preventDefault();
    const username = this.state.txtUsername;
    const password = this.state.txtPassword;
    if (username && password) {
      const account = { username: username, password: password };
      this.apiLogin(account);
    } else {
      alert('Vui lòng nhập đầy đủ tài khoản và mật khẩu!');
    }
  }

  // apis
  apiLogin(account) {
    axios.post('/api/admin/login', account).then((res) => {
      const result = res.data;
      if (result.success === true) {
        this.context.setToken(result.token);
        this.context.setUsername(result.admin.username);
      } else {
        alert(result.message);
      }
    }).catch((err) => {
      console.error(err);
      alert('Đăng nhập thất bại. Vui lòng kiểm tra lại máy chủ Backend!');
    });
  }
}

export default Login;
