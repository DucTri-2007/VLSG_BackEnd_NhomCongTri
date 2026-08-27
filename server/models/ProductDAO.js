require('../utils/MongooseUtil');
const Models = require('./Models');

const ProductDAO = {
  async selectAll() {
    const query = {};
    const products = await Models.Product.find(query).exec();
    return products;
  },
  async selectByID(_id) {
    const product = await Models.Product.findById(_id).exec();
    return product;
  },
  async insert(product) {
    const mongoose = require('mongoose');
    product._id = new mongoose.Types.ObjectId();
    const result = await Models.Product.create(product);
    return result;
  },
  async update(product) {
    const newvalues = {
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      quantity: product.quantity
    };
    const result = await Models.Product.findByIdAndUpdate(product._id, newvalues, { new: true });
    return result;
  },
  async delete(_id) {
    const result = await Models.Product.findByIdAndDelete(_id);
    return result;
  },
  async selectTopNew(top) {
    const query = {};
    const mysort = { cdate: -1 }; // descending
    const products = await Models.Product.find(query).sort(mysort).limit(top).exec();
    return products;
  },
  async selectTopHot(top) {
    let products = [];
    try {
      const items = await Models.Order.aggregate([
        { $match: { items: { $exists: true, $type: 'array' } } },
        { $unwind: '$items' },
        { $group: { _id: '$items.product._id', sum: { $sum: '$items.quantity' } } },
        { $sort: { sum: -1 } }, // descending
        { $limit: top }
      ]).exec();
      for (const item of items) {
        const product = await ProductDAO.selectByID(item._id);
        if (product) {
          products.push(product);
        }
      }
    } catch (e) {}

    // Fallback: If not enough hot products from orders, fetch products from DB
    if (products.length < top) {
      const allProds = await ProductDAO.selectAll();
      for (const p of allProds) {
        if (!products.some(existing => existing._id.toString() === p._id.toString())) {
          products.push(p);
          if (products.length >= top) break;
        }
      }
    }
    return products;
  },
  async selectByCatID(_cid) {
    const mongoose = require('mongoose');
    let conditions = [
      { 'category._id': _cid },
      { 'category.name': { $regex: new RegExp(_cid, 'i') } }
    ];
    if (mongoose.Types.ObjectId.isValid(_cid)) {
      conditions.push({ 'category._id': new mongoose.Types.ObjectId(_cid) });
    }
    const query = { $or: conditions };
    const products = await Models.Product.find(query).exec();
    return products;
  },
  async selectByKeyword(keyword) {
    if (!keyword) return await ProductDAO.selectAll();
    const safeKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const query = {
      $or: [
        { name: { $regex: new RegExp(safeKeyword, "i") } },
        { 'category.name': { $regex: new RegExp(safeKeyword, "i") } }
      ]
    };
    const products = await Models.Product.find(query).exec();
    return products;
  },
  async addReview(productId, review) {
    const product = await Models.Product.findById(productId);
    if (!product) return null;
    if (!product.reviews) product.reviews = [];
    product.reviews.push(review);
    const result = await product.save();
    return result;
  }
};

module.exports = ProductDAO;
