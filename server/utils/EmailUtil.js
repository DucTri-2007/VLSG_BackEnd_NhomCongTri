const nodemailer = require('nodemailer');
const MyConstants = require('./MyConstants');

const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: MyConstants.EMAIL_USER,
    pass: MyConstants.EMAIL_PASS
  }
});

const EmailUtil = {
  sendEmail(email, subject, text) {
    return new Promise((resolve, reject) => {
      const mailOptions = {
        from: MyConstants.EMAIL_USER,
        to: email,
        subject: subject,
        text: text
      };
      transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
          console.error("Nodemailer email sending failed: ", err.message);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  },
  send(email, id, token) {
    const text = 'Cảm ơn bạn đã đăng ký tài khoản. Vui lòng bấm vào liên kết sau để kích hoạt tài khoản của bạn: http://localhost:8010/active?id=' + id + '&token=' + token;
    return new Promise((resolve, reject) => {
      const mailOptions = {
        from: MyConstants.EMAIL_USER,
        to: email,
        subject: 'Kích hoạt tài khoản mua hàng - AutoGear',
        text: text
      };
      transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }
};

module.exports = EmailUtil;
