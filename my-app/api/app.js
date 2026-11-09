const express = require('express');
const crypto = require('node:crypto');
const { getConnection } = require('./lib/database');
const { hashPassword, verifyPassword, tokenHash, publicUser } = require('./lib/security');

const fail = (status, message) => { const error = new Error(message); error.status = status; throw error; };
function text(value, field, required = true, max = 2000) {
  if (value == null && !required) return '';
  if (typeof value !== 'string' || (required && !value.trim()) || value.length > max || /[<>]/.test(value)) fail(400, `${field} không hợp lệ`);
  return value.trim();
}
function number(value, field, min = 0) {
  if (!Number.isSafeInteger(value) || value < min) fail(400, `${field} phải là số nguyên >= ${min}`);
  return value;
}
function email(value) {
  const result = text(value, 'Email', true, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) fail(400, 'Email không hợp lệ');
  return result;
}
function password(value) {
  if (typeof value !== 'string' || value.length < 8 || value.length > 128) fail(400, 'Mật khẩu cần 8–128 ký tự');
  return value;
}
const seasons = ['Mùa hè', 'Mùa đông', 'Quanh năm'];
const goals = ['Eat Clean', 'Tăng cơ', 'Giảm cân', 'Bổ sung năng lượng', 'Gia đình', 'Snack lành mạnh'];
function product(body, partial = false) {
  const result = {};
  for (const key of ['name', 'category', 'image', 'season']) {
    if (!partial || key in body) result[key] = text(body[key], key);
  }
  for (const key of ['price', 'stock']) if (!partial || key in body) result[key] = number(body[key], key);
  if ('season' in result && !seasons.includes(result.season)) fail(400, 'Mùa sản phẩm không hợp lệ');
  for (const key of ['nameEn', 'description', 'region', 'unit', 'slug']) if (key in body) result[key] = text(body[key], key, false);
  if ('image' in result && (!/^(images\/|assets\/|https:\/\/)/.test(result.image) || /["'`\r\n]/.test(result.image))) fail(400, 'Đường dẫn ảnh không hợp lệ');
  for (const key of ['isSeasonal', 'isBestSeller']) if (key in body) {
    if (typeof body[key] !== 'boolean') fail(400, `${key} không hợp lệ`);
    result[key] = body[key];
  }
  if ('oldPrice' in body) result.oldPrice = body.oldPrice == null ? null : number(body.oldPrice, 'oldPrice');
  if (!partial || 'healthGoals' in body) {
    if (!Array.isArray(body.healthGoals) || body.healthGoals.some(g => !goals.includes(g))) fail(400, 'Mục tiêu sức khỏe không hợp lệ');
    result.healthGoals = [...new Set(body.healthGoals)];
  }
  return result;
}
const defaultVouchers = [
  { code: 'FREESHIP', type: 'freeship', discountVal: 30000, minOrder: 0, description: 'Miễn phí vận chuyển tối đa 30.000đ', system: true },
  { code: 'TUQUYGARDEN10', type: 'percentage', discountVal: 10, maxDiscount: 100000, minOrder: 0, description: 'Giảm 10%, tối đa 100.000đ', system: true },
  { code: 'HEALTHY50', type: 'fixed', discountVal: 50000, minOrder: 500000, description: 'Giảm 50.000đ cho đơn từ 500.000đ', system: true }
];
function createApp(connection = getConnection) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));
  app.use((req, res, next) => {
    req.body ??= {};
    if (Array.isArray(req.body) || typeof req.body !== 'object') return res.status(400).json({ message: 'Dữ liệu gửi lên không hợp lệ' });
    next();
  });
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    res.set('X-Content-Type-Options', 'nosniff');
    // Cookie writes require an explicit same-origin/custom-header request.
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.get('X-Requested-With') !== 'TuQuyGarden') return res.status(403).json({ message: 'Invalid request origin' });
    next();
  });
  app.use('/api', async (req, res, next) => {
    try { const conn = await connection(); req.db = conn.db; req.client = conn.client; next(); }
    catch { res.status(503).json({ message: 'Chưa kết nối được MongoDB. Vui lòng thử lại.' }); }
  });
  const col = (req, name) => req.db.collection(name);
  async function auth(req, res, next) {
    const cookie = (req.headers.cookie || '').split(';').map(x => x.trim()).find(x => x.startsWith('tqg_session='));
    const token = cookie?.slice('tqg_session='.length);
    if (!token) return next(Object.assign(new Error('Vui lòng đăng nhập'), { status: 401 }));
    const session = await col(req, 'Sessions').findOne({ tokenHash: tokenHash(token), expiresAt: { $gt: new Date() } });
    req.user = session && await col(req, 'Users').findOne({ id: session.userId });
    if (!req.user) return next(Object.assign(new Error('Phiên đăng nhập đã hết hạn'), { status: 401 }));
    req.sessionHash = tokenHash(token);
    next();
  }
  const admin = (req, res, next) => req.user.isAdmin ? next() : next(Object.assign(new Error('Chỉ quản trị viên được phép thao tác'), { status: 403 }));
  const cookieOptions = () => ({ httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
  app.get('/api', (req, res) => res.json({ status: 'online', database: 'connected' }));
  app.post('/api/users/register', async (req, res) => {
    const user = { id: `u_${crypto.randomUUID()}`, name: text(req.body.name, 'Tên'), email: email(req.body.email), phone: text(req.body.phone, 'Điện thoại', false), healthGoal: text(req.body.healthGoal || 'Eat Clean', 'Mục tiêu'), passwordHash: await hashPassword(password(req.body.password)), isAdmin: false, wishlist: [], surveyCompleted: false, createdAt: new Date() };
    await col(req, 'Users').insertOne(user);
    res.status(201).json({ success: true, message: 'Đăng ký thành công. Vui lòng đăng nhập.', user: publicUser(user) });
  });
  app.post('/api/users/login', async (req, res) => {
    const address = email(req.body.email);
    if (typeof req.body.password !== 'string' || req.body.password.length > 128) fail(400, 'Mật khẩu không hợp lệ');
    const bucket = `${tokenHash(address)}:${Math.floor(Date.now() / 900000)}`;
    const attempts = await col(req, 'LoginAttempts').findOneAndUpdate({ _id: bucket }, { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(Date.now() + 900000) } }, { upsert: true, returnDocument: 'after' });
    if (attempts.count > 20) fail(429, 'Thử đăng nhập quá nhiều lần. Vui lòng chờ 15 phút.');
    const user = await col(req, 'Users').findOne({ email: address });
    if (!user || !await verifyPassword(req.body.password, user.passwordHash)) fail(401, 'Email hoặc mật khẩu không chính xác');
    const token = crypto.randomBytes(32).toString('hex');
    const maxAge = (req.body.rememberMe ? 30 : 1) * 86400000;
    await col(req, 'Sessions').insertOne({ tokenHash: tokenHash(token), userId: user.id, expiresAt: new Date(Date.now() + maxAge) });
    res.cookie('tqg_session', token, { ...cookieOptions(), maxAge });
    res.json({ success: true, user: publicUser(user), message: 'Đăng nhập thành công' });
  });
  app.post('/api/users/logout', auth, async (req, res) => {
    await col(req, 'Sessions').deleteOne({ tokenHash: req.sessionHash });
    res.clearCookie('tqg_session', cookieOptions()); res.json({ success: true });
  });
  app.get('/api/users/me', auth, (req, res) => res.json(publicUser(req.user)));
  app.put('/api/users/me', auth, async (req, res) => {
    const data = {};
    for (const key of ['name', 'phone', 'healthGoal', 'gender', 'birthday', 'address']) if (key in req.body) data[key] = text(req.body[key], key, key === 'name');
    if ('surveyCompleted' in req.body) data.surveyCompleted = req.body.surveyCompleted === true;
    if ('surveyData' in req.body) {
      const survey = req.body.surveyData;
      if (!survey || typeof survey !== 'object') fail(400, 'Khảo sát không hợp lệ');
      data.surveyData = {};
      for (const key of ['preferredCategories', 'preferredFlavors']) {
        if (!Array.isArray(survey[key]) || survey[key].length > 30) fail(400, 'Khảo sát không hợp lệ');
        data.surveyData[key] = survey[key].map(v => text(v, key, true, 100));
      }
    }
    if ('wishlist' in req.body) {
      if (!Array.isArray(req.body.wishlist) || req.body.wishlist.length > 500) fail(400, 'Wishlist không hợp lệ');
      data.wishlist = [...new Set(req.body.wishlist.map(v => number(v, 'productId', 1)))];
    }
    const user = await col(req, 'Users').findOneAndUpdate({ id: req.user.id }, { $set: data }, { returnDocument: 'after' });
    res.json({ success: true, user: publicUser(user), message: 'Đã lưu thông tin' });
  });
  app.put('/api/users/me/password', auth, async (req, res) => {
    if (typeof req.body.oldPassword !== 'string' || req.body.oldPassword.length > 128 || !await verifyPassword(req.body.oldPassword, req.user.passwordHash)) fail(400, 'Mật khẩu cũ không chính xác');
    await col(req, 'Users').updateOne({ id: req.user.id }, { $set: { passwordHash: await hashPassword(password(req.body.newPassword)) }, $unset: { password: '' } });
    await col(req, 'Sessions').deleteMany({ userId: req.user.id, tokenHash: { $ne: req.sessionHash } });
    res.json({ success: true, message: 'Đã đổi mật khẩu' });
  });
  app.get('/api/users', auth, admin, async (req, res) => res.json((await col(req, 'Users').find().toArray()).map(publicUser)));
  app.delete('/api/users/:id', auth, admin, async (req, res) => {
    const user = await col(req, 'Users').findOne({ id: req.params.id });
    if (!user) fail(404, 'Không tìm thấy người dùng');
    if (user.isAdmin) fail(409, 'Không xóa tài khoản quản trị tại đây');
    await col(req, 'Users').deleteOne({ id: user.id });
    await col(req, 'Sessions').deleteMany({ userId: user.id });
    res.json({ success: true });
  });
  app.get('/api/products', async (req, res) => {
    const query = {};
    if (req.query.category && req.query.category !== 'all') query.category = text(req.query.category, 'category');
    if (req.query.season && req.query.season !== 'all') {
      if (req.query.season === 'seasonal') query.isSeasonal = true;
      else query.season = text(req.query.season, 'season');
    }
    if (req.query.search) {
      const pattern = text(req.query.search, 'search').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = ['name', 'nameEn', 'region', 'description', 'category'].map(k => ({ [k]: { $regex: pattern, $options: 'i' } }));
    }
    res.json(await col(req, 'Products').find(query).toArray());
  });
  const productId = req => number(Number(req.params.id), 'id', 1);
  app.get('/api/products/:id', async (req, res) => {
    const item = await col(req, 'Products').findOne({ id: productId(req) });
    if (!item) fail(404, 'Không tìm thấy sản phẩm'); res.json(item);
  });
  async function validateCategory(req, data) {
    if (data.category && !await col(req, 'Categories').findOne({ id: data.category })) fail(400, 'Danh mục không tồn tại');
  }
  app.post('/api/products', auth, admin, async (req, res) => {
    const data = product(req.body); await validateCategory(req, data);
    const highest = await col(req, 'Products').find().sort({ id: -1 }).limit(1).next();
    await col(req, 'Counters').updateOne({ _id: 'products' }, { $max: { value: highest?.id || 0 } }, { upsert: true });
    const counter = await col(req, 'Counters').findOneAndUpdate({ _id: 'products' }, { $inc: { value: 1 } }, { returnDocument: 'after' });
    const item = { ...data, id: counter.value, createdAt: new Date() };
    await col(req, 'Products').insertOne(item); res.status(201).json(item);
  });
  app.put('/api/products/:id', auth, admin, async (req, res) => {
    const data = product(req.body, true); await validateCategory(req, data);
    const item = await col(req, 'Products').findOneAndUpdate({ id: productId(req) }, { $set: { ...data, updatedAt: new Date() } }, { returnDocument: 'after' });
    if (!item) fail(404, 'Không tìm thấy sản phẩm'); res.json(item);
  });
  app.delete('/api/products/:id', auth, admin, async (req, res) => {
    const result = await col(req, 'Products').deleteOne({ id: productId(req) });
    if (!result.deletedCount) fail(404, 'Không tìm thấy sản phẩm'); res.json({ success: true });
  });
  app.get('/api/categories', async (req, res) => res.json(await col(req, 'Categories').find().toArray()));
  app.post('/api/categories', auth, admin, async (req, res) => {
    if (typeof req.body.name !== 'string' || /[\"'`\\]/.test(req.body.name)) fail(400, 'Tên danh mục không hợp lệ');
    const item = { id: text(req.body.name, 'Mã danh mục'), name: text(req.body.name, 'Tên danh mục'), image: text(req.body.image, 'Ảnh', false) };
    if (await col(req, 'Categories').findOne({ name: item.name })) fail(409, 'Danh mục đã tồn tại');
    await col(req, 'Categories').insertOne(item); res.status(201).json(item);
  });
  app.delete('/api/categories/:id', auth, admin, async (req, res) => {
    const categories = col(req, 'Categories');
    const item = await categories.findOne({ id: req.params.id });
    if (!item) fail(404, 'Không tìm thấy danh mục');
    if (await col(req, 'Products').findOne({ category: item.id })) fail(409, 'Danh mục đang có sản phẩm');
    await categories.deleteOne({ _id: item._id }); res.json({ success: true });
  });
  app.put('/api/categories/:id', auth, admin, async (req, res) => {
    const item = await col(req, 'Categories').findOneAndUpdate({ id: req.params.id }, { $set: { name: text(req.body.name, 'Tên hiển thị') } }, { returnDocument: 'after' });
    if (!item) fail(404, 'Không tìm thấy danh mục');
    res.json(item);
  });
  app.get('/api/vouchers', async (req, res) => res.json([...defaultVouchers, ...await col(req, 'Vouchers').find().toArray()]));
  app.post('/api/vouchers', auth, admin, async (req, res) => {
    const code = text(req.body.code, 'Mã giảm giá', true, 40).toUpperCase();
    if (!/^[A-Z0-9_-]+$/.test(code) || defaultVouchers.some(v => v.code === code)) fail(400, 'Mã giảm giá không hợp lệ hoặc là mã hệ thống');
    const type = req.body.type;
    if (!['percentage', 'fixed', 'freeship'].includes(type)) fail(400, 'Loại giảm giá không hợp lệ');
    const discountVal = number(req.body.discountVal, 'Giá trị giảm', 1);
    if (type === 'percentage' && discountVal > 100) fail(400, 'Phần trăm giảm không vượt quá 100');
    const item = { code, type, discountVal, minOrder: number(req.body.minOrder, 'Giá trị đơn tối thiểu'), description: text(req.body.description, 'Mô tả') };
    await col(req, 'Vouchers').updateOne({ code }, { $set: item }, { upsert: true });
    res.json(item);
  });
  app.delete('/api/vouchers/:code', auth, admin, async (req, res) => {
    const result = await col(req, 'Vouchers').deleteOne({ code: req.params.code });
    if (!result.deletedCount) fail(404, 'Không tìm thấy mã tùy chỉnh');
    res.json({ success: true });
  });
  app.get('/api/orders', auth, async (req, res) => res.json(await col(req, 'Orders').find(req.user.isAdmin ? {} : { userId: req.user.id }).sort({ date: -1 }).toArray()));
  app.post('/api/orders', auth, async (req, res) => {
    if (req.user.isAdmin) fail(403, 'Tài khoản quản trị không thể đặt hàng');
    const body = req.body;
    const requestId = text(body.requestId, 'requestId', true, 100);
    const customerName = text(body.customerName, 'Người nhận');
    const customerPhone = text(body.customerPhone, 'Điện thoại');
    const address = text(body.address, 'Địa chỉ');
    const note = text(body.note, 'Ghi chú', false);
    if (!['COD', 'E-wallet', 'Bank transfer', 'Card'].includes(body.paymentMethod)) fail(400, 'Phương thức thanh toán không hợp lệ');
    if (!Array.isArray(body.items) || !body.items.length || body.items.length > 100) fail(400, 'Giỏ hàng không hợp lệ');
    const quantities = new Map();
    for (const item of body.items) {
      const id = number(item.productId, 'productId', 1), qty = number(item.quantity, 'quantity', 1);
      quantities.set(id, number((quantities.get(id) || 0) + qty, 'quantity', 1));
    }
    const session = req.client.startSession(); let order;
    try {
      await session.withTransaction(async () => {
        order = await col(req, 'Orders').findOne({ userId: req.user.id, requestId }, { session });
        if (order) return;
        const items = [];
        for (const [id, quantity] of quantities) {
          const p = await col(req, 'Products').findOneAndUpdate({ id, stock: { $gte: quantity } }, { $inc: { stock: -quantity } }, { session, returnDocument: 'before' });
          if (!p) fail(409, `Sản phẩm ${id} không tồn tại hoặc không đủ tồn kho`);
          items.push({ productId: id, name: p.name, image: p.image, quantity, price: p.price });
        }
        const subtotal = items.reduce((sum, p) => sum + p.quantity * p.price, 0);
        number(subtotal, 'subtotal');
        const shippingMethod = body.shippingMethod || 'standard';
        if (!['standard', 'express', 'scheduled'].includes(shippingMethod)) fail(400, 'Hình thức giao hàng không hợp lệ');
        let shipping = { standard: 0, express: 30000, scheduled: 40000 }[shippingMethod];
        let discount = 0;
        const code = text(body.voucherCode, 'Mã giảm giá', false, 40).toUpperCase();
        if (code) {
          const voucher = defaultVouchers.find(v => v.code === code) || await col(req, 'Vouchers').findOne({ code }, { session });
          if (!voucher || subtotal < voucher.minOrder) fail(400, 'Mã giảm giá không hợp lệ hoặc chưa đủ điều kiện');
          if (voucher.type === 'freeship') shipping = Math.max(0, shipping - voucher.discountVal);
          else if (voucher.type === 'percentage') discount = Math.min(Math.round(subtotal * voucher.discountVal / 100), voucher.maxDiscount ?? subtotal);
          else discount = Math.min(subtotal, voucher.discountVal);
        }
        const extras = (body.giftBox === true ? 25000 : 0) + (body.greetingCard === true ? 10000 : 0);
        order = { id: `TQG-${crypto.randomUUID()}`, requestId, userId: req.user.id, customerName, customerPhone, customerEmail: req.user.email, address, note, items, subtotal, shipping, shippingMethod, discount, extras, total: subtotal + shipping + extras - discount, status: 'Chờ xác nhận', paymentMethod: body.paymentMethod, paymentStatus: 'unpaid', date: new Date().toISOString() };
        await col(req, 'Orders').insertOne(order, { session });
      });
    } finally { await session.endSession(); }
    res.status(201).json(order);
  });
  app.put('/api/orders/:id/status', auth, async (req, res) => {
    const session = req.client.startSession(); let updated;
    try {
      await session.withTransaction(async () => {
        const order = await col(req, 'Orders').findOne({ id: req.params.id }, { session });
        if (!order) fail(404, 'Không tìm thấy đơn hàng');
        if (!req.user.isAdmin && order.userId !== req.user.id) fail(403, 'Không có quyền xem đơn hàng');
        const transitions = { 'Chờ xác nhận': ['Đang xử lý', 'Đã hủy'], 'Đang xử lý': ['Đang chuẩn bị', 'Đang giao', 'Đã hủy'], 'Đang chuẩn bị': ['Đang giao', 'Đã hủy'], 'Đang giao': ['Hoàn thành'], 'Hoàn thành': [], 'Đã hủy': [], 'Trả hàng/Hoàn tiền': [] };
        const data = {};
        if (req.body.refundRequest) {
          if (req.user.isAdmin && ['approved', 'rejected'].includes(req.body.refundRequest.status)) {
            if (order.refundRequest?.status !== 'pending') fail(409, 'Không có yêu cầu hoàn trả đang chờ');
            data.refundRequest = { ...order.refundRequest, status: req.body.refundRequest.status };
            data.status = req.body.refundRequest.status === 'approved' ? 'Trả hàng/Hoàn tiền' : 'Hoàn thành';
          } else {
            if (order.status !== 'Hoàn thành' || order.refundRequest?.status === 'pending') fail(409, 'Không thể yêu cầu hoàn trả');
            data.refundRequest = { status: 'pending', reason: text(req.body.refundRequest.reason, 'Lý do'), note: text(req.body.refundRequest.note, 'Ghi chú', false), requestedAt: new Date().toISOString() };
          }
        } else if (req.body.status && req.body.status !== order.status) {
          if (!(transitions[order.status] || []).includes(req.body.status)) fail(409, 'Chuyển trạng thái không hợp lệ');
          if (!req.user.isAdmin && !['Đã hủy', 'Hoàn thành'].includes(req.body.status)) fail(403, 'Không có quyền đổi trạng thái này');
          data.status = req.body.status;
          if (data.status === 'Đã hủy') for (const item of order.items) await col(req, 'Products').updateOne({ id: item.productId }, { $inc: { stock: item.quantity } }, { session });
        }
        updated = await col(req, 'Orders').findOneAndUpdate({ id: order.id }, { $set: { ...data, updatedAt: new Date() } }, { session, returnDocument: 'after' });
      });
    } finally { await session.endSession(); }
    res.json(updated);
  });
  // No public database-reset endpoint. Seeding is an explicit CLI operation.
  app.use('/api', (req, res) => res.status(404).json({ message: 'API không tồn tại' }));
  app.use((error, req, res, next) => {
    if (error.code === 11000) return res.status(409).json({ message: 'Dữ liệu đã tồn tại. Vui lòng tải lại và thử lại.' });
    const status = error.status || 500;
    res.status(status).json({ message: status < 500 ? error.message : 'Không thể hoàn tất thao tác. Kiểm tra kết nối MongoDB và cấu hình replica set.' });
  });
  return app;
}
module.exports = { createApp };
