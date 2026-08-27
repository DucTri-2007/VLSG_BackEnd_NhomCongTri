const express = require('express');
const router = express.Router();
// utils
const JwtUtil = require('../utils/JwtUtil');
// daos
const AdminDAO = require('../models/AdminDAO');
const CategoryDAO = require('../models/CategoryDAO');
const ProductDAO = require('../models/ProductDAO');
const CustomerDAO = require('../models/CustomerDAO');
const OrderDAO = require('../models/OrderDAO');
const VoucherDAO = require('../models/VoucherDAO');
const Models = require('../models/Models');

// login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    const admin = await AdminDAO.selectByUsernameAndPassword(username, password);
    if (admin) {
      const token = JwtUtil.genToken({ _id: admin._id, username: admin.username });
      res.json({
        success: true,
        message: 'Authentication successful',
        token: token,
        admin: { _id: admin._id, username: admin.username }
      });
    } else {
      res.json({ success: false, message: 'Incorrect username or password' });
    }
  } else {
    res.json({ success: false, message: 'Please input username and password' });
  }
});

// token verification endpoint
router.get('/token', JwtUtil.checkToken, (req, res) => {
  const token = req.headers['x-access-token'] || req.headers['authorization'];
  res.json({ success: true, message: 'Token is valid', token: token });
});

// category endpoints
router.get('/categories', JwtUtil.checkToken, async (req, res) => {
  const categories = await CategoryDAO.selectAll();
  res.json(categories);
});

router.post('/categories', JwtUtil.checkToken, async (req, res) => {
  const name = req.body.name;
  const category = { name: name };
  const result = await CategoryDAO.insert(category);
  res.json(result);
});

router.put('/categories/:id', JwtUtil.checkToken, async (req, res) => {
  const _id = req.params.id;
  const name = req.body.name;
  const category = { _id: _id, name: name };
  const result = await CategoryDAO.update(category);
  res.json(result);
});

router.delete('/categories/:id', JwtUtil.checkToken, async (req, res) => {
  const _id = req.params.id;
  const result = await CategoryDAO.delete(_id);
  res.json(result);
});

// product endpoints
router.get('/products', JwtUtil.checkToken, async function (req, res) {
  var products = await ProductDAO.selectAll();
  const sizePage = 4;
  const noPages = Math.ceil(products.length / sizePage);
  var curPage = 1;
  if (req.query.page) curPage = parseInt(req.query.page);
  const offset = (curPage - 1) * sizePage;
  products = products.slice(offset, offset + sizePage);
  const result = { products: products, noPages: noPages, curPage: curPage };
  res.json(result);
});

router.post('/products', JwtUtil.checkToken, async function (req, res) {
    const name = req.body.name;
    const price = req.body.price;
    const cid = req.body.category;
    const image = req.body.image;
    const quantity = req.body.quantity ? parseInt(req.body.quantity) : 0;
    const now = new Date().getTime();
    const category = await CategoryDAO.selectByID(cid);

    const product = {
        name: name,
        price: price,
        image: image,
        cdate: now,
        category: category,
        quantity: quantity
    };

    const result = await ProductDAO.insert(product);
    res.json(result);
});

router.put('/products/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;
  const name = req.body.name;
  const price = req.body.price;
  const cid = req.body.category;
  const image = req.body.image;
  const quantity = req.body.quantity ? parseInt(req.body.quantity) : 0;
  const now = new Date().getTime();
  const category = await CategoryDAO.selectByID(cid);
  const product = { _id: _id, name: name, price: price, image: image, cdate: now, category: category, quantity: quantity };
  const result = await ProductDAO.update(product);
  res.json(result);
});

router.delete('/products/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;
  const result = await ProductDAO.delete(_id);
  res.json(result);
});

// customer & member endpoints
router.get('/customers', JwtUtil.checkToken, async (req, res) => {
  try {
    const customers = await CustomerDAO.selectAll();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/customers/member/:id', JwtUtil.checkToken, async (req, res) => {
  try {
    const _id = req.params.id;
    const { points, membershipTier, walletBalance } = req.body;
    let customer = await Models.Customer.findById(_id);
    if (!customer) {
      return res.json({ success: false, message: 'Khách hàng không tồn tại!' });
    }
    if (points !== undefined) customer.points = parseInt(points);
    if (membershipTier) customer.membershipTier = membershipTier;
    if (walletBalance !== undefined) customer.walletBalance = parseInt(walletBalance);
    await customer.save();
    res.json({ success: true, message: 'Cập nhật thông tin hội viên thành công!', customer: customer });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/customers/approve/:id', JwtUtil.checkToken, async (req, res) => {
  try {
    const _id = req.params.id;
    const result = await CustomerDAO.updateActiveStatus(_id, 1);
    res.json({ success: true, message: 'Duyệt tài khoản khách hàng thành công!', customer: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/customers/deactivate/:id', JwtUtil.checkToken, async (req, res) => {
  try {
    const _id = req.params.id;
    const result = await CustomerDAO.updateActiveStatus(_id, 0);
    res.json({ success: true, message: 'Khóa tài khoản khách hàng thành công!', customer: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/customers/:id', JwtUtil.checkToken, async (req, res) => {
  try {
    const _id = req.params.id;
    const result = await CustomerDAO.delete(_id);
    res.json({ success: true, message: 'Xóa hội viên thành công!', customer: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// voucher endpoints
router.get('/vouchers', JwtUtil.checkToken, async (req, res) => {
  try {
    const vouchers = await VoucherDAO.selectAll();
    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/vouchers', JwtUtil.checkToken, async (req, res) => {
  try {
    const { code, discountPercent, minOrderValue, description, active } = req.body;
    const voucher = {
      code: code,
      discountPercent: parseInt(discountPercent || 0),
      minOrderValue: parseInt(minOrderValue || 0),
      description: description || '',
      active: active !== undefined ? active : true
    };
    const result = await VoucherDAO.insert(voucher);
    res.json({ success: true, message: 'Thêm mã giảm giá thành công!', voucher: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/vouchers/:id', JwtUtil.checkToken, async (req, res) => {
  try {
    const _id = req.params.id;
    const { code, discountPercent, minOrderValue, description, active } = req.body;
    const voucher = {
      _id: _id,
      code: code,
      discountPercent: parseInt(discountPercent || 0),
      minOrderValue: parseInt(minOrderValue || 0),
      description: description || '',
      active: active
    };
    const result = await VoucherDAO.update(voucher);
    res.json({ success: true, message: 'Cập nhật mã giảm giá thành công!', voucher: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/vouchers/:id', JwtUtil.checkToken, async (req, res) => {
  try {
    const _id = req.params.id;
    const result = await VoucherDAO.delete(_id);
    res.json({ success: true, message: 'Xóa mã giảm giá thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// order endpoints
router.get('/orders', JwtUtil.checkToken, async (req, res) => {
  try {
    const orders = await OrderDAO.selectAll();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/orders/status/:id', JwtUtil.checkToken, async (req, res) => {
  try {
    const _id = req.params.id;
    const { status } = req.body;
    const result = await OrderDAO.updateStatus(_id, status);
    res.json({ success: true, message: 'Cập nhật trạng thái đơn hàng thành công!', order: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
