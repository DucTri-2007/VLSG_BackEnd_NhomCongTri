const MyConstants = {
  DB_URI: process.env.MONGODB_URI || 'mongodb+srv://admin_project:admin_project@test.poul7md.mongodb.net/shoppingonline',
  DB_SERVER: 'test.poul7md.mongodb.net',
  DB_USER: 'admin0',
  DB_PASS: 'vannhucu0k',
  DB_DATABASE: 'shoppingonline',
  EMAIL_USER: 'your_email@hotmail.com',
  EMAIL_PASS: 'your_email_password',
  JWT_SECRET: 'kito_secret_key',
  JWT_EXPIRES: '7d' // 7 days expiration
};

module.exports = MyConstants;
