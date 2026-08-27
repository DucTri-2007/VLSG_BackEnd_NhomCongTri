require('../utils/MongooseUtil');
const Models = require('./Models');
const mongoose = require('mongoose');

const OrderDAO = {
  async insert(order) {
    order._id = new mongoose.Types.ObjectId();
    const result = await Models.Order.create(order);
    return result;
  },

  async selectByCustomerID(custID) {
    const query = { 'customer._id': custID };
    const mysort = { cdate: -1 }; // descending order
    const orders = await Models.Order.find(query).sort(mysort).exec();
    return orders;
  },

  async selectAll() {
    const mysort = { cdate: -1 }; // descending order
    const orders = await Models.Order.find({}).sort(mysort).exec();
    return orders;
  },

  async updateStatus(_id, status) {
    const newvalues = { status: status };
    const result = await Models.Order.findByIdAndUpdate(_id, newvalues, { new: true }).exec();
    return result;
  }
};

module.exports = OrderDAO;
