const Models = require('./Models');
const mongoose = require('mongoose');

const VoucherDAO = {
  async selectAll() {
    return await Models.Voucher.find({});
  },

  async selectActive() {
    return await Models.Voucher.find({ active: true });
  },

  async selectByCode(code) {
    if (!code) return null;
    return await Models.Voucher.findOne({ code: code.toUpperCase().trim(), active: true });
  },

  async insert(voucher) {
    const _id = new mongoose.Types.ObjectId();
    voucher._id = _id;
    voucher.code = voucher.code.toUpperCase().trim();
    voucher.minTier = voucher.minTier || 'Đồng';
    return await Models.Voucher.create(voucher);
  },

  async update(voucher) {
    const newvalues = {
      code: voucher.code.toUpperCase().trim(),
      discountPercent: voucher.discountPercent,
      minOrderValue: voucher.minOrderValue,
      minTier: voucher.minTier || 'Đồng',
      description: voucher.description,
      active: voucher.active
    };
    return await Models.Voucher.findByIdAndUpdate(voucher._id, newvalues, { new: true });
  },

  async delete(_id) {
    return await Models.Voucher.findByIdAndDelete(_id);
  }
};

module.exports = VoucherDAO;
