const mongoose = require('mongoose');
const { Category } = require('./Models');

const CategoryDAO = {
  async selectAll() {
    const categories = await Category.find().exec();
    return categories;
  },
  async insert(category) {
    const _id = new mongoose.Types.ObjectId();
    const newCategory = new Category({ _id: _id, name: category.name });
    const result = await newCategory.save();
    return result;
  },
  async update(category) {
    const newvalues = { name: category.name };
    const result = await Category.findByIdAndUpdate(category._id, newvalues, { new: true });
    return result;
  },
  async delete(_id) {
    const result = await Category.findByIdAndDelete(_id);
    return result;
  },
  async selectByID(_id) {
    const category = await Category.findById(_id).exec();
    return category;
  }
};

module.exports = CategoryDAO;
