const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();

app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// MongoDB Atlas connection string
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://baohgk24411e_db_user:UGUQYdFZdq2Jwf6C@huynhbao.wmmvvom.mongodb.net/TuQuyGardenDB';
const dbName = 'TuQuyGardenDB';

let cachedClient = null;
let cachedDb = null;

async function getDb() {
  if (cachedDb) return cachedDb;
  const client = new MongoClient(mongoUri);
  await client.connect();
  cachedClient = client;
  cachedDb = client.db(dbName);
  return cachedDb;
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

// Health Check
app.get('/api', async (req, res) => {
  try {
    const db = await getDb();
    res.json({
      status: 'online',
      platform: 'Vercel Serverless Function',
      database: db ? 'connected' : 'disconnected',
      time: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// Products API
app.get('/api/products', async (req, res) => {
  try {
    const db = await getDb();
    const productsCol = db.collection('Products');
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
    const db = await getDb();
    const productsCol = db.collection('Products');
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
    const db = await getDb();
    const productsCol = db.collection('Products');
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
    const db = await getDb();
    const productsCol = db.collection('Products');
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
    const db = await getDb();
    const productsCol = db.collection('Products');
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
    const db = await getDb();
    const categoriesCol = db.collection('Categories');
    const categories = await categoriesCol.find({}).toArray();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Orders API
app.get('/api/orders', async (req, res) => {
  try {
    const db = await getDb();
    const ordersCol = db.collection('Orders');
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
    const db = await getDb();
    const ordersCol = db.collection('Orders');
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
    const db = await getDb();
    const ordersCol = db.collection('Orders');
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
    const db = await getDb();
    const usersCol = db.collection('Users');
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
    const db = await getDb();
    const usersCol = db.collection('Users');
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

module.exports = app;
