const express = require('express');
const router = express.Router();

const JwtUtil = require('../utils/JwtUtil');
const CustomerDAO = require('../models/CustomerDAO');
const ProductDAO = require('../models/ProductDAO');
const OrderDAO = require('../models/OrderDAO');
const VoucherDAO = require('../models/VoucherDAO');
const Models = require('../models/Models');

const tierRankMap = {
  'Đồng': 0,
  'Bạc': 1,
  'Vàng': 2,
  'Bạch Kim': 3,
  'Kim Cương': 4,
  'Tinh Anh': 5,
  'Huyền Thoại': 6
};

// Get active vouchers
router.get('/vouchers', async function (req, res) {
  try {
    const vouchers = await VoucherDAO.selectActive();
    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Validate voucher with Tier Gating check
router.post('/vouchers/validate', async function (req, res) {
  try {
    const { code, customerId, userTier } = req.body;
    if (!code) {
      return res.json({ success: false, message: 'Vui lòng nhập mã giảm giá!' });
    }
    const voucher = await VoucherDAO.selectByCode(code);
    if (!voucher) {
      return res.json({ success: false, message: 'Mã giảm giá không tồn tại hoặc đã hết hạn!' });
    }

    // Check Customer Tier Rank
    let currentTier = userTier || 'Đồng';
    if (customerId) {
      const c = await Models.Customer.findById(customerId);
      if (c && c.membershipTier) currentTier = c.membershipTier;
    }

    const minRequiredTier = voucher.minTier || 'Đồng';
    const userRank = tierRankMap[currentTier] ?? 0;
    const requiredRank = tierRankMap[minRequiredTier] ?? 0;

    if (userRank < requiredRank) {
      return res.json({
        success: false,
        message: `⚠️ Voucher "${voucher.code}" chỉ dành riêng cho Hội viên Hạng ${minRequiredTier} trở lên! (Hạng hiện tại của bạn: ${currentTier})`
      });
    }

    res.json({ success: true, voucher: voucher });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Top-up deposit to Ví MPS Wallet
router.post('/wallet/deposit', JwtUtil.checkToken, async function (req, res) {
  try {
    const { customerId, amount } = req.body;
    if (!amount || parseInt(amount) <= 0) {
      return res.json({ success: false, message: 'Số tiền nạp không hợp lệ!' });
    }
    let customer = await CustomerDAO.selectByID(customerId);
    if (!customer) {
      customer = await Models.Customer.findById(customerId);
    }
    if (!customer) {
      return res.json({ success: false, message: 'Không tìm thấy tài khoản khách hàng!' });
    }

    const depositVal = parseInt(amount);
    const currentBal = customer.walletBalance !== undefined ? customer.walletBalance : 1000000;
    customer.walletBalance = currentBal + depositVal;
    await customer.save();

    res.json({
      success: true,
      message: `🎉 Nạp thành công +${depositVal.toLocaleString('vi-VN')} đ vào Ví MPS Wallet!`,
      walletBalance: customer.walletBalance
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get fresh profile
router.get('/profile/:id', async function (req, res) {
  try {
    const id = req.params.id;
    let customer = await CustomerDAO.selectByID(id);
    if (!customer) {
      customer = await Models.Customer.findById(id);
    }
    res.json({ success: true, customer: customer });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Categories
router.get('/categories', async function (req, res) {
  try {
    const CategoryDAO = require('../models/CategoryDAO');
    const categories = await CategoryDAO.selectAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Products: new products
router.get('/products/new', async function (req, res) {
  try {
    const products = await ProductDAO.selectTopNew(6);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Products: hot products
router.get('/products/hot', async function (req, res) {
  try {
    const products = await ProductDAO.selectTopHot(6);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Products by category
router.get('/products/category/:cid', async function (req, res) {
  try {
    const cid = req.params.cid;
    const products = await ProductDAO.selectByCatID(cid);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Products search by keyword
router.get('/products/search/:keyword?', async function (req, res) {
  try {
    const keyword = req.params.keyword || '';
    const products = await ProductDAO.selectByKeyword(keyword);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Product detail by ID
router.get('/product/:id', async function (req, res) {
  try {
    const id = req.params.id;
    const product = await ProductDAO.selectByID(id);
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit product review
router.post('/product/review/:id', JwtUtil.checkToken, async function (req, res) {
  try {
    const productId = req.params.id;
    const { rating, comment, customerName, image } = req.body;
    const result = await ProductDAO.addReview(productId, {
      customerName: customerName || 'Khách hàng',
      rating: rating ? parseInt(rating) : 5,
      comment: comment || '',
      image: image || '',
      cdate: new Date().getTime()
    });
    if (result) {
      res.json({ success: true, message: 'Đã gửi đánh giá thành công!', product: result });
    } else {
      res.json({ success: false, message: 'Không thể thêm đánh giá.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Customer signup
router.post('/signup', async function (req, res) {
  try {
    const { username, password, name, phone, email } = req.body;
    const dbCustomer = await CustomerDAO.selectByUsernameOrEmail(username, email);
    if (dbCustomer) {
      return res.json({ success: false, message: 'Tên đăng nhập hoặc Email đã tồn tại!' });
    }
    const newCustomer = {
      username: username,
      password: password,
      name: name,
      phone: phone,
      email: email,
      active: 1,
      points: 0,
      membershipTier: 'Đồng',
      walletBalance: 1000000
    };
    const result = await CustomerDAO.insert(newCustomer);
    if (result) {
      res.json({ success: true, message: 'Đăng ký thành công! Hãy đăng nhập để trải nghiệm.' });
    } else {
      res.json({ success: false, message: 'Đăng ký thất bại!' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Customer login
router.post('/login', async function (req, res) {
  try {
    const { username, password } = req.body;
    const customer = await CustomerDAO.selectByUsernameAndPassword(username, password);
    if (customer) {
      if (customer.active === 0) {
        return res.json({ success: false, message: 'Tài khoản của bạn đã bị khóa!' });
      }
      const token = JwtUtil.genToken({ _id: customer._id, username: customer.username });
      res.json({
        success: true,
        message: 'Đăng nhập thành công!',
        token: token,
        customer: customer
      });
    } else {
      res.json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác!' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Checkout (place order)
router.post('/checkout', JwtUtil.checkToken, async function (req, res) {
  try {
    const { cart, customer, shippingAddress, shippingPhone, note, paymentMethod, voucherCode } = req.body;
    if (!cart || cart.length === 0) {
      return res.json({ success: false, message: 'Giỏ hàng trống!' });
    }
    
    // 1. Check stock
    for (const item of cart) {
      const dbProduct = await ProductDAO.selectByID(item.product._id);
      if (!dbProduct) {
        return res.json({ success: false, message: `Sản phẩm ${item.product.name} không tồn tại trong hệ thống!` });
      }
      const stock = dbProduct.quantity !== undefined ? dbProduct.quantity : 0;
      if (stock < item.quantity) {
        return res.json({ success: false, message: `Sản phẩm "${item.product.name}" không đủ số lượng trong kho! (Hiện còn: ${stock})` });
      }
    }

    // 2. Calculate raw total
    let rawTotal = 0;
    cart.forEach(item => {
      rawTotal += item.product.price * item.quantity;
    });

    // 3. Apply Voucher discount if provided & verify minTier
    let discountAmount = 0;
    let appliedVoucherCode = '';
    if (voucherCode) {
      const voucher = await VoucherDAO.selectByCode(voucherCode);
      if (voucher && rawTotal >= (voucher.minOrderValue || 0)) {
        let currentTier = customer.membershipTier || 'Đồng';
        const dbC = await Models.Customer.findById(customer._id);
        if (dbC && dbC.membershipTier) currentTier = dbC.membershipTier;

        const minRequiredTier = voucher.minTier || 'Đồng';
        const userRank = tierRankMap[currentTier] ?? 0;
        const requiredRank = tierRankMap[minRequiredTier] ?? 0;

        if (userRank < requiredRank) {
          return res.json({
            success: false,
            message: `⚠️ Voucher "${voucher.code}" chỉ dành riêng cho Hội viên Hạng ${minRequiredTier} trở lên!`
          });
        }

        appliedVoucherCode = voucher.code;
        discountAmount = Math.round((rawTotal * voucher.discountPercent) / 100);
      }
    }
    const finalTotal = Math.max(0, rawTotal - discountAmount);

    // 4. Handle Ví MPS Wallet payment
    let dbCustomer = await CustomerDAO.selectByID(customer._id);
    if (!dbCustomer) {
      dbCustomer = await Models.Customer.findById(customer._id);
    }

    const currentWallet = (dbCustomer && dbCustomer.walletBalance !== undefined) ? dbCustomer.walletBalance : 1000000;
    if (paymentMethod === 'WALLET') {
      if (currentWallet < finalTotal) {
        return res.json({ 
          success: false, 
          message: `Số dư Ví MPS Wallet không đủ! (Ví hiện có: ${currentWallet.toLocaleString('vi-VN')} đ, Đơn hàng: ${finalTotal.toLocaleString('vi-VN')} đ)` 
        });
      }
      dbCustomer.walletBalance = currentWallet - finalTotal;
    }

    // 5. Calculate Loyalty Points (10% of final order value)
    const pointsEarned = Math.round(finalTotal * 0.10);
    const newTotalPoints = (dbCustomer.points || 0) + pointsEarned;
    dbCustomer.points = newTotalPoints;

    // Calculate 7-Tier Membership Level
    let newTier = 'Đồng';
    if (newTotalPoints >= 10000) newTier = 'Huyền Thoại';
    else if (newTotalPoints >= 5000) newTier = 'Tinh Anh';
    else if (newTotalPoints >= 2000) newTier = 'Kim Cương';
    else if (newTotalPoints >= 1000) newTier = 'Bạch Kim';
    else if (newTotalPoints >= 500) newTier = 'Vàng';
    else if (newTotalPoints >= 100) newTier = 'Bạc';

    dbCustomer.membershipTier = newTier;
    await dbCustomer.save();

    // 6. Deduct product stock
    for (const item of cart) {
      const dbProduct = await ProductDAO.selectByID(item.product._id);
      dbProduct.quantity = (dbProduct.quantity || 0) - item.quantity;
      await dbProduct.save();
    }

    // 7. Save Order
    const now = new Date().getTime();
    const order = {
      cdate: now,
      total: finalTotal,
      status: 'PENDING',
      customer: dbCustomer,
      items: cart,
      shippingAddress: shippingAddress || '',
      shippingPhone: shippingPhone || dbCustomer.phone || '',
      note: note || '',
      paymentMethod: paymentMethod || 'COD',
      voucherCode: appliedVoucherCode,
      discountAmount: discountAmount
    };
    
    const result = await OrderDAO.insert(order);
    if (result) {
      res.json({
        success: true,
        message: `Thanh toán thành công! Bạn tích lũy được +${pointsEarned.toLocaleString('vi-VN')} điểm thưởng (${newTier}).`,
        customer: dbCustomer,
        pointsEarned: pointsEarned
      });
    } else {
      res.json({ success: false, message: 'Đặt hàng thất bại. Vui lòng thử lại sau!' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get customer orders
router.get('/orders/customer/:cid', JwtUtil.checkToken, async function (req, res) {
  try {
    const cid = req.params.cid;
    const orders = await OrderDAO.selectByCustomerID(cid);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel customer order
router.put('/orders/cancel/:id', JwtUtil.checkToken, async function (req, res) {
  try {
    const _id = req.params.id;
    const result = await OrderDAO.updateStatus(_id, 'CANCELED');
    if (result) {
      res.json({ success: true, message: 'Hủy đơn hàng thành công!' });
    } else {
      res.json({ success: false, message: 'Hủy đơn hàng thất bại!' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
