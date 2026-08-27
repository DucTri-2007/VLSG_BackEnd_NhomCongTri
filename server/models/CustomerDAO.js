require('../utils/MongooseUtil');
const Models = require('./Models');
const mongoose = require('mongoose');

const CustomerDAO = {
  // Method for Part 1: Customer Signup
  async selectByUsernameOrEmail(username, email) {
    const query = { $or: [{ username: username }, { email: email }] };
    const customer = await Models.Customer.findOne(query);
    return customer;
  },

  // Method for Part 1: Customer Signup
  async insert(customer) {
    customer._id = new mongoose.Types.ObjectId();
    const result = await Models.Customer.create(customer);
    return result;
  },

  // Method for Part 3: Customer Login & Logout
  async selectByUsernameAndPassword(username, password) {
    const query = { username: username, password: password };
    const customer = await Models.Customer.findOne(query).exec();
    return customer;
  },

  async selectByID(_id) {
    const customer = await Models.Customer.findById(_id).exec();
    return customer;
  },

  // Method for Part 2: Customer Active
  async active(_id, token, active) {
    const query = { _id: _id, token: token };
    const newvalues = { active: active };
    const result = await Models.Customer.findOneAndUpdate(query, newvalues, { new: true }).exec();
    return result;
  },

  // Admin approval method
  async updateActiveStatus(_id, active) {
    const newvalues = { active: active };
    const result = await Models.Customer.findByIdAndUpdate(_id, newvalues, { new: true }).exec();
    return result;
  },

  // Admin selectAll method
  async selectAll() {
    const query = {};
    const customers = await Models.Customer.find(query).exec();
    return customers;
  },

  // Method for Part 4: Customer MyProfile
  async update(customer) {
    const newvalues = {
      username: customer.username,
      password: customer.password,
      name: customer.name,
      phone: customer.phone,
      email: customer.email
    };
    const result = await Models.Customer.findByIdAndUpdate(customer._id, newvalues, { new: true }).exec();
    return result;
  },

  async delete(_id) {
    const result = await Models.Customer.findByIdAndDelete(_id).exec();
    return result;
  }
};

module.exports = CustomerDAO;
