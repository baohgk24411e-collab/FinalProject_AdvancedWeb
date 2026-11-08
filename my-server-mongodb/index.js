require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = 3002;

app.use(morgan('dev'));
app.use(cors({
  origin: ['http://localhost:4200', 'http://127.0.0.1:4200', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));
app.use(cookieParser());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = 'TuQuyGardenDB';
let db, productsCol, categoriesCol, ordersCol, usersCol;

function loadJsData(filename, varName) {
  const filePath = path.join(__dirname, 'data', filename);
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8');
  const sandbox = {};
  const fn = new Function('window', content);
  fn(sandbox);
  return sandbox[varName] || [];
}

function buildIdQuery(id) {
  if (!isNaN(id) && String(id).trim() !== '') {
    return { id: Number(id) };
  }
  if (ObjectId.isValid(id) && String(id).length === 24) {
    return { _id: new ObjectId(id) };
  }
  return { id: id };
}

async function connectDB() {
  try {
    const client = new MongoClient(mongoUri);
    await client.connect();
    db = client.db(dbName);
    productsCol = db.collection('Products');
    categoriesCol = db.collection('Categories');
    ordersCol = db.collection('Orders');
    usersCol = db.collection('Users');
    console.log(`[MongoDB] Connected successfully to database: ${dbName}`);
  } catch (err) {
    console.warn(`[MongoDB] Notice: Could not connect to local MongoDB (${mongoUri}). Running in standalone mock mode until MongoDB service starts. Error: ${err.message}`);
  }
}
connectDB();

app.get('/', (req, res) => {
  res.json({
    status: 'online',
    project: 'Tu Quy Garden Backend Server',
    database: dbName,
    endpoints: [
      '/api/products',
      '/api/categories',
      '/api/orders',
      '/api/users'
    ]
  });
});

// Seed / Reset Database API
app.post('/api/seed', async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: 'Database not connected yet' });
    const categories = loadJsData('categories.js', 'MOCK_CATEGORIES');
    const products = loadJsData('products.js', 'MOCK_PRODUCTS');
    const users = loadJsData('users.js', 'MOCK_USERS');
    const orders = loadJsData('orders.js', 'MOCK_ORDERS');

    if (categories.length > 0) {
      await categoriesCol.deleteMany({});
      await categoriesCol.insertMany(categories);
    }
    if (products.length > 0) {
      await productsCol.deleteMany({});
      await productsCol.insertMany(products);
    }
    if (users.length > 0) {
      await usersCol.deleteMany({});
      await usersCol.insertMany(users);
    }
    if (orders.length > 0) {
      await ordersCol.deleteMany({});
      await ordersCol.insertMany(orders);
    }

    res.json({
      success: true,
      message: 'Database seeded successfully',
      seeded: {
        categories: categories.length,
        products: products.length,
        users: users.length,
        orders: orders.length
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Products API
app.get('/api/products', async (req, res) => {
  try {
    if (!productsCol) return res.status(503).json({ error: 'Database not connected yet' });
    const { category, search, season } = req.query;
    let query = {};
    if (category && category !== 'all') query.category = category;
    if (season && season !== 'all') {
      if (season === 'seasonal') query.isSeasonal = true;
      else query.season = season;
    }
    if (search) query.name = { $regex: search, $options: 'i' };
    const items = await productsCol.find(query).toArray();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    if (!productsCol) return res.status(503).json({ error: 'Database not connected yet' });
    const query = buildIdQuery(req.params.id);
    const item = await productsCol.findOne(query);
    if (!item) return res.status(404).json({ message: 'Product not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    if (!productsCol) return res.status(503).json({ error: 'Database not connected yet' });
    let nextId = req.body.id;
    if (!nextId) {
      const highest = await productsCol.find().sort({ id: -1 }).limit(1).toArray();
      nextId = (highest.length > 0 && typeof highest[0].id === 'number') ? highest[0].id + 1 : 1;
    }
    const newProduct = {
      ...req.body,
      id: Number(nextId),
      createdAt: new Date()
    };
    const result = await productsCol.insertOne(newProduct);
    res.status(201).json({ _id: result.insertedId, ...newProduct });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    if (!productsCol) return res.status(503).json({ error: 'Database not connected yet' });
    const query = buildIdQuery(req.params.id);
    const { _id, ...updateData } = req.body;
    updateData.updatedAt = new Date();
    await productsCol.updateOne(query, { $set: updateData });
    const updated = await productsCol.findOne(query);
    if (!updated) return res.status(404).json({ message: 'Product not found to update' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    if (!productsCol) return res.status(503).json({ error: 'Database not connected yet' });
    const query = buildIdQuery(req.params.id);
    const result = await productsCol.deleteOne(query);
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Product not found to delete' });
    }
    res.json({ success: true, message: 'Product deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Categories API
app.get('/api/categories', async (req, res) => {
  try {
    if (!categoriesCol) return res.status(503).json({ error: 'Database not connected yet' });
    const categories = await categoriesCol.find({}).toArray();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Orders API
app.get('/api/orders', async (req, res) => {
  try {
    if (!ordersCol) return res.status(503).json({ error: 'Database not connected yet' });
    const { userId } = req.query;
    let query = userId ? { userId } : {};
    const orders = await ordersCol.find(query).sort({ date: -1 }).toArray();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    if (!ordersCol) return res.status(503).json({ error: 'Database not connected yet' });
    const newOrder = {
      ...req.body,
      id: req.body.id || 'TQG' + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toISOString()
    };
    await ordersCol.insertOne(newOrder);
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  try {
    if (!ordersCol) return res.status(503).json({ error: 'Database not connected yet' });
    const { status, refundRequest } = req.body;
    const updateDoc = {};
    if (status) updateDoc.status = status;
    if (refundRequest !== undefined) updateDoc.refundRequest = refundRequest;
    await ordersCol.updateOne({ id: req.params.id }, { $set: updateDoc });
    const updated = await ordersCol.findOne({ id: req.params.id });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Users / Auth API
app.post('/api/users/login', async (req, res) => {
  try {
    if (!usersCol) return res.status(503).json({ error: 'Database not connected yet' });
    const { email, password } = req.body;
    const user = await usersCol.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Sai email hoặc mật khẩu' });
    }
    const { password: _, ...userInfo } = user;
    res.json({ success: true, user: userInfo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users/register', async (req, res) => {
  try {
    if (!usersCol) return res.status(503).json({ error: 'Database not connected yet' });
    const { email, password, name, phone, healthGoal } = req.body;
    const existing = await usersCol.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email đã được đăng ký' });
    }
    const newUser = {
      id: 'u_' + Date.now(),
      name,
      email,
      password,
      phone: phone || '',
      healthGoal: healthGoal || 'Eat Clean',
      isAdmin: false,
      wishlist: [],
      surveyCompleted: false,
      createdAt: new Date()
    };
    await usersCol.insertOne(newUser);
    const { password: _, ...userInfo } = newUser;
    res.status(201).json({ success: true, user: userInfo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});

