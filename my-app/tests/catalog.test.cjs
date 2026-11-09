const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');

async function catalog(fetchImpl, query = '') {
  const dom = new JSDOM(read('src/app/pages/products/products.component.html'), {
    url: `http://localhost/products${query}`, runScripts: 'outside-only'
  });
  const w = dom.window;
  await new Promise(resolve => w.addEventListener('load', resolve));
  w.fetch = fetchImpl;
  w.console.warn = () => {};
  w.Components = { ProductCard: p => `<article data-id="${p.id}">${p.name}</article>` };
  w.eval(read('public/data/products.js'));
  w.eval(read('public/js/products.js'));
  return { dom, w, count: () => {
    const el = w.document.getElementById('product-count');
    return Number(el.innerText ?? el.textContent);
  },
    choose(name, value) {
      const input = [...w.document.querySelectorAll(`input[name="${name}"]`)].find(el => el.value === value);
      input.checked = true;
      input.dispatchEvent(new w.Event('change', { bubbles: true }));
    }
  };
}

test('Summer filter works while API is still pending, and init binds once', async () => {
  let calls = 0;
  const c = await catalog(() => { calls++; return new Promise(() => {}); });
  try {
    c.w.initProductsCatalogPage();
    c.w.initProductsCatalogPage();
    c.choose('season', 'Mùa hè');
    const expected = c.w.MOCK_PRODUCTS.filter(p => p.season === 'Mùa hè').length;
    assert.ok(expected > 0);
    assert.equal(c.count(), expected);
    assert.equal(calls, 1);
  } finally { c.dom.window.close(); }
});

test('API refresh retains selected filter and accepts an empty database', async () => {
  let resolve;
  const c = await catalog(() => new Promise(r => { resolve = r; }));
  try {
    const pending = c.w.initProductsCatalogPage();
    c.choose('season', 'Mùa hè');
    resolve({ ok: true, json: async () => [] });
    await pending;
    assert.equal(c.count(), 0);
    assert.equal(c.w.document.getElementById('empty-state').style.display, 'block');
    assert.equal(c.w.document.querySelector('input[value="Mùa hè"]').checked, true);
  } finally { c.dom.window.close(); }
});

test('late API response uses the latest season selection', async () => {
  let resolve;
  const c = await catalog(() => new Promise(r => { resolve = r; }));
  try {
    const pending = c.w.initProductsCatalogPage();
    c.choose('season', 'Mùa đông');
    resolve({ ok: true, json: async () => [
      { id: 201, name: 'Summer fruit', season: 'Mùa hè' },
      { id: 202, name: 'Winter fruit', season: 'Mùa đông' }
    ] });
    await pending;
    assert.equal(c.count(), 1);
    assert.equal(c.w.document.querySelector('#products-catalog-grid article').dataset.id, '202');
  } finally { c.dom.window.close(); }
});

test('HTTP failure leaves filters working and explicitly labels offline data', async () => {
  const c = await catalog(async () => ({ ok: false, status: 503 }));
  try {
    await c.w.initProductsCatalogPage();
    c.choose('season', 'Mùa hè');
    assert.equal(c.count(), 13);
    assert.ok([...c.w.document.querySelectorAll('[role="status"]')].some(el => /Offline catalog/.test(el.textContent)));
  } finally { c.dom.window.close(); }
});

test('search tolerates optional fields; filters, sorting and reset work together', async () => {
  const products = [
    { id: 1, name: 'Mango', category: 'Fruits', season: 'Mùa hè', price: 95000 },
    { id: 2, name: 'Orange', category: 'Fruits', season: 'Quanh năm', price: 30000 },
    { id: 3, name: 'Nuts', category: 'Nutritional Seeds', price: 180000 }
  ];
  const c = await catalog(async () => ({ ok: true, json: async () => products }), '?search=missing');
  try {
    await c.w.initProductsCatalogPage();
    assert.equal(c.count(), 0);
    c.w.document.getElementById('reset-filters-btn').click();
    assert.equal(c.count(), 3);
    c.choose('productCategory', 'Fruits');
    c.choose('priceRange', '50-100');
    assert.equal(c.count(), 1);
    c.w.document.getElementById('reset-filters-btn').click();
    const select = c.w.document.getElementById('sort-select');
    select.value = 'price-asc';
    select.dispatchEvent(new c.w.Event('change'));
    assert.equal(c.w.document.querySelector('#products-catalog-grid article').dataset.id, '2');
  } finally { c.dom.window.close(); }
});
