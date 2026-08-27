const mongoose = require('mongoose');

// schemas
const AdminSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  username: String,
  password: String
}, { versionKey: false });

const CategorySchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String
}, { versionKey: false });

const CustomerSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  username: String,
  password: String,
  name: String,
  phone: String,
  email: String,
  active: Number,
  token: String,
  points: { type: Number, default: 0 },
  membershipTier: { type: String, default: 'Đồng' },
  walletBalance: { type: Number, default: 1000000 }
}, { versionKey: false });

const VoucherSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  code: { type: String, required: true, unique: true },
  discountPercent: { type: Number, default: 0 },
  minOrderValue: { type: Number, default: 0 },
  minTier: { type: String, default: 'Đồng' },
  description: String,
  active: { type: Boolean, default: true }
}, { versionKey: false });

const ReviewSchema = mongoose.Schema({
  customerName: String,
  rating: Number, // 1 to 5
  comment: String,
  image: String,
  cdate: Number
}, { versionKey: false });

const ProductSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  price: Number,
  image: String,
  cdate: Number,
  category: CategorySchema,
  quantity: { type: Number, default: 0 },
  description: String,
  reviews: [ReviewSchema]
}, { versionKey: false });

const ItemSchema = mongoose.Schema({
  product: ProductSchema,
  quantity: Number
}, { versionKey: false, _id: false });

const OrderSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  cdate: Number,
  total: Number,
  status: String,
  customer: CustomerSchema,
  items: [ItemSchema],
  shippingAddress: String,
  shippingPhone: String,
  note: String,
  paymentMethod: { type: String, default: 'COD' },
  voucherCode: String,
  discountAmount: { type: Number, default: 0 }
}, { versionKey: false });

// models
const Admin = mongoose.model('Admin', AdminSchema);
const Category = mongoose.model('Category', CategorySchema);
const Customer = mongoose.model('Customer', CustomerSchema);
const Product = mongoose.model('Product', ProductSchema);
const Order = mongoose.model('Order', OrderSchema);
const Voucher = mongoose.model('Voucher', VoucherSchema);

module.exports = { Admin, Category, Customer, Product, Order, Voucher };
