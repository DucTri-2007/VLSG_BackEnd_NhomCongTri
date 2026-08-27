const mongoose = require('mongoose');
const MyConstants = require('./MyConstants');
const seedDatabase = require('./SeedData');

const uri = MyConstants.DB_URI || ('mongodb+srv://' + MyConstants.DB_USER + ':' + MyConstants.DB_PASS + '@' + MyConstants.DB_SERVER + '/' + MyConstants.DB_DATABASE);

mongoose.connect(uri)
  .then(async () => {
    console.log('Successfully connected to MongoDB Atlas!');
    // Tự động nạp dữ liệu phụ kiện xe
    await seedDatabase();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });

