import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import Menu from './MenuComponent';
import Home from './HomeComponent';
import Category from './CategoryComponent';
import Product from './ProductComponent';
import Login from './LoginComponent';
import Customer from './CustomerComponent';
import Order from './OrderComponent';
import Support from './SupportComponent';
import Member from './MemberComponent';
import Voucher from './VoucherComponent';
import { Routes, Route, Navigate } from 'react-router-dom';

class Main extends Component {
  static contextType = MyContext;

  render() {
    if (this.context.token !== '') {
      return (
        <div className="body-admin">
          <Menu />
          <div className="main-content">
            <Routes>
              <Route path="/admin" element={<Navigate replace to="/admin/home" />} />
              <Route path="/admin/home" element={<Home />} />
              <Route path="/admin/category" element={<Category />} />
              <Route path="/admin/product" element={<Product />} />
              <Route path="/admin/customer" element={<Customer />} />
              <Route path="/admin/members" element={<Member />} />
              <Route path="/admin/vouchers" element={<Voucher />} />
              <Route path="/admin/order" element={<Order />} />
              <Route path="/admin/support" element={<Support />} />
            </Routes>
          </div>
        </div>
      );
    }
    return <Login />;
  }
}

export default Main;
