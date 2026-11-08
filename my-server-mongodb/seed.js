require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = 'TuQuyGardenDB';

function loadJsData(filename, varName) {
  const filePath = path.join(__dirname, 'data', filename);
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8');
  const sandbox = {};
  const fn = new Function('window', content);
  fn(sandbox);
  return sandbox[varName] || [];
}

async function seed() {
  const client = new MongoClient(mongoUri);
  try {
    await client.connect();
    console.log(`Connected to MongoDB at ${mongoUri}`);
    const db = client.db(dbName);

    const categories = loadJsData('categories.js', 'MOCK_CATEGORIES');
    const products = loadJsData('products.js', 'MOCK_PRODUCTS');
    const users = loadJsData('users.js', 'MOCK_USERS');
    const orders = loadJsData('orders.js', 'MOCK_ORDERS');

    if (categories.length > 0) {
      await db.collection('Categories').deleteMany({});
      await db.collection('Categories').insertMany(categories);
      console.log(`Seeded ${categories.length} Categories`);
    }

    if (products.length > 0) {
      await db.collection('Products').deleteMany({});
      await db.collection('Products').insertMany(products);
      console.log(`Seeded ${products.length} Products`);
    }

    if (users.length > 0) {
      await db.collection('Users').deleteMany({});
      await db.collection('Users').insertMany(users);
      console.log(`Seeded ${users.length} Users`);
    }

    if (orders.length > 0) {
      await db.collection('Orders').deleteMany({});
      await db.collection('Orders').insertMany(orders);
      console.log(`Seeded ${orders.length} Orders`);
    }

    console.log('Database seeding completed successfully!');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await client.close();
  }
}

seed();

