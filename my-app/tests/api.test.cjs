const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const { MongoClient } = require('mongodb');
const request = require('supertest');
const { createApp } = require('../api/app');
const { prepareDatabase } = require('../api/lib/database');
const { hashPassword } = require('../api/lib/security');
let server, client, db, app, admin, customer, outsider;
const write = (agent, method, url, body = {}) => agent[method](url).set('X-Requested-With', 'TuQuyGarden').send(body);
const product = { name: 'Xoài test', category: 'Fruits', image: 'images/test.png', price: 95000, stock: 10, season: 'Mùa hè', healthGoals: ['Eat Clean'] };
before(async () => {
  server = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  client = await new MongoClient(server.getUri()).connect();
  db = client.db('integration_test');
  await prepareDatabase(db);
  await db.collection('Categories').insertOne({ id: 'Fruits', name: 'Trái cây' });
  await db.collection('Users').insertOne({ id: 'admin', email: 'admin@test.vn', name: 'Admin', isAdmin: true, passwordHash: await hashPassword('test-password-123') });
  app = createApp(async () => ({ client, db }));
  admin = request.agent(app); customer = request.agent(app); outsider = request.agent(app);
  await write(admin, 'post', '/api/users/login', { email: 'admin@test.vn', password: 'test-password-123' }).expect(200);
  for (const [agent, email] of [[customer, 'user@test.vn'], [outsider, 'other@test.vn']]) {
    await write(agent, 'post', '/api/users/register', { name: 'Customer', email, password: 'test-password-123' }).expect(201);
    await write(agent, 'post', '/api/users/login', { email, password: 'test-password-123' }).expect(200);
  }
}, { timeout: 180000 });
after(async () => { await client?.close(); await server?.stop(); });

test('passwords hashed, session verified, no credential fields returned, role escalation ignored', async () => {
  const stored = await db.collection('Users').findOne({ email: 'user@test.vn' });
  assert.equal(stored.password, undefined);
  assert.match(stored.passwordHash, /^scrypt:/);
  const me = await customer.get('/api/users/me').expect(200);
  assert.equal(me.body.passwordHash, undefined);
  await write(customer, 'put', '/api/users/me', { isAdmin: true, name: 'Updated' }).expect(200);
  assert.equal((await customer.get('/api/users/me')).body.isAdmin, false);
  await request(app).get('/api/users/me').expect(401);
  await write(outsider, 'post', '/api/users/login', { email: { $ne: '' }, password: { $ne: '' } }).expect(400);
});

test('admin CRUD persists; season query, validation, immutable id and missing records', async () => {
  await write(request(app), 'post', '/api/products', product).expect(401);
  await write(customer, 'post', '/api/products', product).expect(403);
  await admin.post('/api/products').send(product).expect(403);
  await write(admin, 'post', '/api/products', { ...product, stock: -1 }).expect(400);
  await write(admin, 'post', '/api/products', { ...product, season: 'fake' }).expect(400);
  const created = await write(admin, 'post', '/api/products', product).expect(201);
  const id = created.body.id;
  assert.equal((await db.collection('Products').findOne({ id })).stock, 10);
  assert.ok((await request(app).get('/api/products').query({ season: 'Mùa hè' })).body.some(p => p.id === id));
  await write(admin, 'put', `/api/products/${id}`, { id: 9999, stock: 15, season: 'Mùa đông' }).expect(200);
  assert.equal((await request(app).get(`/api/products/${id}`)).body.id, id);
  assert.equal((await db.collection('Products').findOne({ id })).stock, 15);
  await write(admin, 'delete', `/api/products/${id}`).expect(200);
  await request(app).get(`/api/products/${id}`).expect(404);
  await write(admin, 'put', `/api/products/${id}`, { stock: 1 }).expect(404);
  await write(admin, 'post', '/api/seed').expect(404);
});

test('concurrent product creation has unique numeric ids', async () => {
  const responses = await Promise.all(Array.from({ length: 8 }, () => write(admin, 'post', '/api/products', product)));
  assert.ok(responses.every(r => r.status === 201), JSON.stringify(responses.map(r => r.body)));
  assert.equal(new Set(responses.map(r => r.body.id)).size, 8);
});

test('category CRUD persists and refuses removal while referenced', async () => {
  await write(customer, 'post', '/api/categories', { name: 'Test category' }).expect(403);
  const created = await write(admin, 'post', '/api/categories', { name: 'Test category' }).expect(201);
  const url = '/api/categories/' + encodeURIComponent(created.body.id);
  await write(admin, 'put', url, { name: 'Tên mới' }).expect(200);
  assert.equal((await db.collection('Categories').findOne({ id: created.body.id })).name, 'Tên mới');
  await write(admin, 'post', '/api/products', { ...product, category: created.body.id }).expect(201);
  await write(admin, 'delete', url).expect(409);
  const unused = await write(admin, 'post', '/api/categories', { name: 'Unused' }).expect(201);
  await write(admin, 'delete', '/api/categories/' + unused.body.id).expect(200);
  assert.equal(await db.collection('Categories').findOne({ id: unused.body.id }), null);
});

test('duplicate email rejected; profile and password persist across sessions', async () => {
  const agent = request.agent(app);
  await write(agent, 'post', '/api/users/register', { name: 'Profile', email: 'profile@test.vn', password: 'before-password' }).expect(201);
  await write(agent, 'post', '/api/users/register', { name: 'Profile', email: 'PROFILE@test.vn', password: 'before-password' }).expect(409);
  const login = await write(agent, 'post', '/api/users/login', { email: 'profile@test.vn', password: 'before-password' }).expect(200);
  assert.match(login.headers['set-cookie'][0], /HttpOnly/);
  const second = request.agent(app);
  await write(second, 'post', '/api/users/login', { email: 'profile@test.vn', password: 'before-password' }).expect(200);
  await write(agent, 'put', '/api/users/me', { name: 'Saved name', wishlist: [1], healthGoal: 'Eat Clean' }).expect(200);
  assert.equal((await second.get('/api/users/me')).body.name, 'Saved name');
  await write(agent, 'put', '/api/users/me/password', { oldPassword: 'before-password', newPassword: 'after-password' }).expect(200);
  await second.get('/api/users/me').expect(401);
  await write(second, 'post', '/api/users/login', { email: 'profile@test.vn', password: 'before-password' }).expect(401);
  await write(second, 'post', '/api/users/login', { email: 'profile@test.vn', password: 'after-password' }).expect(200);
});

test('orders recompute money, reserve stock, enforce ownership and restore stock once on cancel', async () => {
  const p = (await write(admin, 'post', '/api/products', product)).body;
  const body = { requestId: 'order-one', customerName: 'Customer', customerPhone: '0901234567', address: 'Test address', paymentMethod: 'COD', items: [{ productId: p.id, quantity: 2, price: 1 }], total: 1, discount: 9999999 };
  const response = await write(customer, 'post', '/api/orders', body).expect(201);
  assert.equal(response.body.total, 190000);
  assert.equal((await db.collection('Products').findOne({ id: p.id })).stock, 8);
  const retry = await write(customer, 'post', '/api/orders', body).expect(201);
  assert.equal(retry.body.id, response.body.id);
  assert.equal((await db.collection('Products').findOne({ id: p.id })).stock, 8);
  assert.equal((await outsider.get('/api/orders').query({ userId: response.body.userId })).body.length, 0);
  await write(outsider, 'put', `/api/orders/${response.body.id}/status`, { status: 'Đã hủy' }).expect(403);
  await write(customer, 'put', `/api/orders/${response.body.id}/status`, { status: 'Hoàn thành' }).expect(409);
  await write(customer, 'put', `/api/orders/${response.body.id}/status`, { status: 'Đã hủy' }).expect(200);
  await write(customer, 'put', `/api/orders/${response.body.id}/status`, { status: 'Đã hủy' }).expect(200);
  assert.equal((await db.collection('Products').findOne({ id: p.id })).stock, 10);
});

test('transaction rolls back partial reservations and concurrent orders cannot oversell', async () => {
  const p = (await write(admin, 'post', '/api/products', { ...product, stock: 1 })).body;
  const base = { customerName: 'Customer', customerPhone: '0901234567', address: 'Test', paymentMethod: 'COD' };
  await write(customer, 'post', '/api/orders', { ...base, requestId: 'rollback', items: [{ productId: p.id, quantity: 1 }, { productId: 99999, quantity: 1 }] }).expect(409);
  assert.equal((await db.collection('Products').findOne({ id: p.id })).stock, 1);
  const responses = await Promise.all(['race-a', 'race-b'].map(requestId => write(customer, 'post', '/api/orders', { ...base, requestId, items: [{ productId: p.id, quantity: 1 }] })));
  assert.deepEqual(responses.map(r => r.status).sort(), [201, 409]);
  assert.equal((await db.collection('Products').findOne({ id: p.id })).stock, 0);
});

test('admin vouchers are shared and applied using server values', async () => {
  await write(customer, 'post', '/api/vouchers', { code: 'TEST15' }).expect(403);
  await write(admin, 'post', '/api/vouchers', { code: 'TEST15', type: 'percentage', discountVal: 101, minOrder: 0, description: 'Invalid' }).expect(400);
  await write(admin, 'post', '/api/vouchers', { code: 'TEST15', type: 'percentage', discountVal: 15, minOrder: 0, description: 'Test discount' }).expect(200);
  assert.ok((await customer.get('/api/vouchers')).body.some(v => v.code === 'TEST15'));
  const p = (await write(admin, 'post', '/api/products', product)).body;
  const order = await write(customer, 'post', '/api/orders', { requestId: 'voucher-order', customerName: 'Customer', customerPhone: '0901234567', address: 'Test', paymentMethod: 'COD', items: [{ productId: p.id, quantity: 1 }], voucherCode: 'TEST15', discount: 95000 }).expect(201);
  assert.equal(order.body.discount, 14250); assert.equal(order.body.total, 80750);
  await write(admin, 'delete', '/api/vouchers/TEST15').expect(200);
  assert.equal(await db.collection('Vouchers').findOne({ code: 'TEST15' }), null);
});

test('logout invalidates session; database failure never returns success', async () => {
  await write(outsider, 'post', '/api/users/logout').expect(200);
  await outsider.get('/api/users/me').expect(401);
  const unavailable = createApp(async () => { throw new Error('offline'); });
  await write(request(unavailable), 'post', '/api/products', product).expect(503);
});
