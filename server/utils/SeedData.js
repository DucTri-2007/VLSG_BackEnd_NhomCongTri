const mongoose = require('mongoose');
const Models = require('../models/Models');

async function seedDatabase() {
  try {
    const existingCats = await Models.Category.find({});
    
    // Always ensure 4 main categories exist
    const categoriesData = [
      { name: 'Honda' },
      { name: 'Yamaha' },
      { name: 'Suzuki' },
      { name: 'Vespa' },
      { name: 'Phụ Tùng Động Cơ' }
    ];

    let insertedCategories = [];
    if (existingCats.length < 4) {
      await Models.Category.deleteMany({});
      for (const cat of categoriesData) {
        const newCat = await Models.Category.create({
          _id: new mongoose.Types.ObjectId(),
          name: cat.name
        });
        insertedCategories.push(newCat);
      }
    } else {
      insertedCategories = existingCats;
    }

    const catMap = {};
    insertedCategories.forEach(c => {
      catMap[c.name] = c;
    });

    const productsData = [
      // Honda
      {
        name: 'Bố Thắng Đĩa Trước Chính Hãng Honda Winner X / SH',
        price: 180000,
        image: '/img/bo_thang_honda.jpg',
        category: catMap['Honda'] || insertedCategories[0],
        quantity: 110,
        description: 'Bố thắng đĩa trước Elig chính hãng Honda độ bền cao, lực phanh chuẩn xác, không gây mòn đĩa thắng hay tiếng kêu rít rít khi phanh gấp. Sản phẩm đạt chuẩn chứng nhận an toàn quốc tế.'
      },
      {
        name: 'Phuộc Sau Ohlins Bình Dầu Cho Honda SH / Vario',
        price: 14500000,
        image: '/img/phuoc_ohlins_honda.jpg',
        category: catMap['Honda'] || insertedCategories[0],
        quantity: 15,
        description: 'Phuộc nhún cao cấp Ohlins Thụy Điển tích hợp bình dầu phụ cho các dòng xe tay ga Honda SH 150i/300i/350i, Vario, Click. Hỗ trợ tùy chỉnh độ nảy Rebound linh hoạt, di chuyển mượt mà trên mọi địa hình.'
      },
      {
        name: 'Bugi Bạch Kim NGK Iridium Cho Honda',
        price: 220000,
        image: '/img/bo_thang_honda.jpg',
        category: catMap['Honda'] || insertedCategories[0],
        quantity: 80,
        description: 'Bugi NGK Iridium chân dài cao cấp nhập khẩu Nhật Bản. Đánh lửa mạnh mẽ, giúp tiết kiệm nhiên liệu 5-10%, tăng tốc bốc và êm ái hơn. Thích hợp cho các dòng xe Honda Winner, SH, Air Blade, Vario, Exciter...'
      },

      // Yamaha
      {
        name: 'Lọc Dầu Nhớt Máy Chính Hãng Yamaha Exciter/R15',
        price: 80000,
        image: '/img/loc_nhot_yamaha.jpg',
        category: catMap['Yamaha'] || insertedCategories[1],
        quantity: 120,
        description: 'Lọc nhớt chính hãng Yamaha sản xuất theo tiêu chuẩn cao cấp giúp loại bỏ hoàn toàn cặn bẩn, mạt kim loại trong quá trình vận hành động cơ, giữ nhớt luôn sạch và duy trì tuổi thọ máy lâu dài.'
      },
      {
        name: 'Dây Curoa Truyền Động Bando Chính Hãng Yamaha NVX/Grande',
        price: 450000,
        image: '/img/day_curoa_yamaha.jpg',
        category: catMap['Yamaha'] || insertedCategories[1],
        quantity: 60,
        description: 'Dây curoa 2 mặt răng Bando chuyên dụng cho dòng xe tay ga Yamaha NVX 155, Grande, Janus. Khả năng chịu nhiệt cực cao, truyền tải công suất tối đa, chống giãn dây và chịu tải nặng tuyệt vời.'
      },

      // Suzuki
      {
        name: 'Bố Côn Côn Sau Chính Hãng Suzuki Raider/Satria',
        price: 650000,
        image: '/img/bo_thang_honda.jpg',
        category: catMap['Suzuki'] || insertedCategories[2],
        quantity: 30,
        description: 'Bộ lá côn nồi xe máy Suzuki Raider DOHC / Satria F150 chính hãng Indonesia. Độ bám ma sát chuẩn xác, bắt nồi cực nhạy, giúp xe vọt nhanh mà không bị trượt nồi khi đi đường dài.'
      },
      {
        name: 'Lọc Gió Động Cơ Chính Hãng Suzuki GSX-R150 / Bandit',
        price: 240000,
        image: '/img/loc_nhot_yamaha.jpg',
        category: catMap['Suzuki'] || insertedCategories[2],
        quantity: 45,
        description: 'Tấm lọc gió động cơ cao cấp dành riêng cho Suzuki GSX-R150, GSX-S150, Bandit. Giúp lọc sạch bụi mịn trước khi không khí vào buồng đốt, duy trì tỉ lệ hòa khí tối ưu cho động cơ đạt công suất tối đa.'
      },

      // Vespa
      {
        name: 'Lọc Gió Động Cơ Vespa Sprint/Primavera I-Get',
        price: 350000,
        image: '/img/loc_nhot_yamaha.jpg',
        category: catMap['Vespa'] || insertedCategories[3],
        quantity: 45,
        description: 'Lọc gió động cơ Piaggio Vespa chính hãng dành cho động cơ I-Get Sprint, Primavera, LX. Đảm bảo lưu lượng khí nạp ổn định, tăng cường độ bốc và giữ động cơ luôn êm ái khi vận hành.'
      },
      {
        name: 'Dây Curoa Bando Vespa LX/Primavera',
        price: 780000,
        image: '/img/day_curoa_yamaha.jpg',
        category: catMap['Vespa'] || insertedCategories[3],
        quantity: 25,
        description: 'Dây Curoa Bando nhập khẩu cho Vespa Sprint, Primavera, GTS 125/150. Được làm từ sợi Kevlar siêu bền, giảm ma sát rung lắc dán curoa, cho khả năng tăng tốc mượt mà và êm ái tuyệt đối.'
      },

      // Phụ Tùng Động Cơ
      {
        name: 'Nhớt Động Cơ Motul 300V Factory Line 10W40 1L',
        price: 490000,
        image: '/img/loc_nhot_yamaha.jpg',
        category: catMap['Phụ Tùng Động Cơ'] || insertedCategories[4],
        quantity: 100,
        description: 'Dầu nhớt tổng hợp 100% Motul 300V với công nghệ Ester Core đỉnh cao thế giới. Giúp bảo vệ màng dầu ở nhiệt độ cực cao, bôi trơn tối hảo cho động cơ số xe máy và mô tô PKL.'
      }
    ];

    // Refresh products table with official project images
    await Models.Product.deleteMany({});
    const now = new Date().getTime();
    for (const prod of productsData) {
      await Models.Product.create({
        _id: new mongoose.Types.ObjectId(),
        name: prod.name,
        price: prod.price,
        image: prod.image,
        cdate: now,
        category: prod.category,
        quantity: prod.quantity,
        description: prod.description
      });
    }

    // Seed Tier-Gated Vouchers
    const vouchersData = [
      { code: 'COPPER20', discountPercent: 20, minOrderValue: 0, minTier: 'Đồng', description: 'Dành cho tất cả Hội viên từ Hạng Đồng: Giảm 20% đơn bất kỳ', active: true },
      { code: 'SILVER25', discountPercent: 25, minOrderValue: 500000, minTier: 'Bạc', description: 'Đặc quyền Hạng Bạc trở lên: Giảm 25% cho đơn từ 500k', active: true },
      { code: 'GOLD30', discountPercent: 30, minOrderValue: 0, minTier: 'Vàng', description: 'Đặc quyền Hạng Vàng trở lên: Giảm 30% + Miễn phí ship hỏa tốc', active: true },
      { code: 'PLATINUM35', discountPercent: 35, minOrderValue: 0, minTier: 'Bạch Kim', description: 'Đặc quyền Hạng Bạch Kim trở lên: Giảm 35% + Ưu tiên giao 24h', active: true },
      { code: 'DIAMOND40', discountPercent: 40, minOrderValue: 0, minTier: 'Kim Cương', description: 'Đặc quyền Hạng Kim Cương trở lên: Giảm 40% + Tặng gói bảo dưỡng 1 năm', active: true },
      { code: 'ELITE45', discountPercent: 45, minOrderValue: 0, minTier: 'Tinh Anh', description: 'Đặc quyền Hạng Tinh Anh trở lên: Giảm 45% + Hỗ trợ kỹ thuật tại nhà', active: true },
      { code: 'LEGEND50', discountPercent: 50, minOrderValue: 0, minTier: 'Huyền Thoại', description: 'Đặc quyền Hạng Huyền Thoại: Giảm 50% tất cả phụ tùng + Giá sỉ VIP', active: true },
      { code: 'MPS10', discountPercent: 10, minOrderValue: 100000, minTier: 'Đồng', description: 'Mã giảm giá chào mừng tân thủ: Giảm 10% đơn từ 100k', active: true }
    ];

    await Models.Voucher.deleteMany({});
    for (const v of vouchersData) {
      await Models.Voucher.create({
        _id: new mongoose.Types.ObjectId(),
        ...v
      });
    }
    console.log('🎉 Đã nạp thành công Voucher phân quyền theo 7 Hạng Hội viên!');
  } catch (error) {
    console.error('❌ Lỗi khi seed cơ sở dữ liệu:', error.message);
  }
}

module.exports = seedDatabase;
