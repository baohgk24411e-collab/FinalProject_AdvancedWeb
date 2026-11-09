const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
function environment() {
  const dom = new JSDOM('', { url: 'http://localhost', runScripts: 'outside-only' });
  dom.window.structuredClone = structuredClone;
  dom.window.MOCK_PRODUCTS = [];
  return dom;
}
const load = (w, file) => w.eval(fs.readFileSync(path.join(__dirname, '../public/services', file), 'utf8'));
test('all shipped presentation scripts parse, and common overlays initialize once', async () => {
  const vm = require('node:vm');
  for (const folder of ['js', 'services', 'components']) {
    const directory = path.join(__dirname, '../public', folder);
    for (const file of fs.readdirSync(directory).filter(f => f.endsWith('.js'))) {
      new vm.Script(fs.readFileSync(path.join(directory, file), 'utf8'), { filename: file });
    }
  }
  const dom = environment(), w = dom.window;
  try {
    await new Promise(resolve => w.addEventListener('load', resolve));
    w.eval(fs.readFileSync(path.join(__dirname, '../public/js/common.js'), 'utf8'));
    w.setupCommonRoots(); w.setupCommonRoots();
    assert.equal(w.document.querySelectorAll('#toast-container').length, 1);
    assert.equal(w.document.querySelectorAll('#modal-overlay').length, 1);
    assert.equal(typeof w.showToast, 'function');
  } finally { w.close(); }
});
test('forged localStorage admin is ignored; failed login cannot create a session', async () => {
  const dom = environment(), w = dom.window;
  try {
    w.localStorage.setItem('tqg_current_user', JSON.stringify({ isAdmin: true }));
    w.fetch = async () => ({ ok: false, json: async () => ({ message: 'Unauthorized' }) });
    load(w, 'authService.js'); await w.authReady;
    assert.equal(w.AuthService.getCurrentUser(), null);
    const result = await w.AuthService.login('fake@test.local', 'fake');
    assert.equal(result.success, false); assert.equal(w.AuthService.getCurrentUser(), null);
    assert.equal(w.localStorage.getItem('tqg_current_user'), null);
  } finally { w.close(); }
});
test('failed checkout preserves cart and retry key; successful retry uses server totals', async () => {
  const dom = environment(), w = dom.window;
  try {
    let removed = 0, fail = true, keys = [];
    w.CartService = { getCart: () => [{ productId: 1, quantity: 2 }], removeFromCart: () => removed++, removeVoucher() {} };
    w.apiRequest = async (url, method, body) => {
      if (url === '/api/products') return [];
      keys.push(body.requestId);
      assert.equal(body.total, undefined); assert.equal(body.items[0].price, undefined);
      if (fail) throw new Error('offline');
      return { id: 'saved', total: 190000, items: body.items };
    };
    load(w, 'orderService.js');
    const args = [{ fullName: 'Test', phone: '0901234567' }, { address: 'Test address' }, 'COD', { total: 1 }];
    const first = await w.OrderService.createOrder(...args);
    assert.equal(first.success, false); assert.equal(removed, 0); assert.equal(w.OrderService.getOrders().length, 0);
    fail = false;
    const second = await w.OrderService.createOrder(...args);
    assert.equal(second.success, true); assert.equal(second.total, 190000); assert.equal(removed, 1);
    assert.equal(keys[0], keys[1]); assert.equal(w.sessionStorage.getItem('tqg_pending_order'), null);
  } finally { w.close(); }
});
test('failed order status update does not mutate the display cache', async () => {
  const dom = environment(), w = dom.window;
  try {
    load(w, 'orderService.js');
    w.OrderService.orders = [{ id: 'one', status: 'Chờ xác nhận' }];
    w.apiRequest = async () => { throw new Error('offline'); };
    const result = await w.OrderService.updateOrderStatus('one', 'Đã hủy');
    assert.equal(result.success, false); assert.equal(w.OrderService.getOrderById('one').status, 'Chờ xác nhận');
  } finally { w.close(); }
});
