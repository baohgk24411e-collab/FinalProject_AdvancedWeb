const { MongoClient } = require('mongodb');
let connection;
async function prepareDatabase(db) {
  const schemas = {
    Products: { bsonType: 'object', required: ['id', 'name', 'category', 'price', 'stock'], properties: { id: { bsonType: ['int', 'long', 'double'], minimum: 1 }, name: { bsonType: 'string', minLength: 1 }, category: { bsonType: 'string' }, price: { bsonType: ['int', 'long', 'double'], minimum: 0 }, stock: { bsonType: ['int', 'long', 'double'], minimum: 0 } } },
    Users: { bsonType: 'object', required: ['id', 'email'], properties: { id: { bsonType: 'string' }, email: { bsonType: 'string' }, isAdmin: { bsonType: 'bool' }, passwordHash: { bsonType: 'string' } } },
    Orders: { bsonType: 'object', required: ['id', 'userId', 'items', 'total', 'status'], properties: { id: { bsonType: 'string' }, items: { bsonType: 'array' }, total: { bsonType: ['int', 'long', 'double'], minimum: 0 }, status: { bsonType: 'string' } } }
  };
  for (const [name, schema] of Object.entries(schemas)) {
    if (await db.listCollections({ name }).hasNext()) await db.command({ collMod: name, validator: { $jsonSchema: schema }, validationLevel: 'moderate' });
    else await db.createCollection(name, { validator: { $jsonSchema: schema }, validationLevel: 'moderate' });
  }
  await Promise.all([
    db.collection('Vouchers').createIndex({ code: 1 }, { unique: true }),
    db.collection('Products').createIndex({ id: 1 }, { unique: true }),
    db.collection('Categories').createIndex({ id: 1 }, { unique: true }),
    db.collection('Users').createIndex({ id: 1 }, { unique: true }),
    db.collection('Users').createIndex({ email: 1 }, { unique: true }),
    db.collection('Orders').createIndex({ id: 1 }, { unique: true }),
    db.collection('Orders').createIndex({ userId: 1, requestId: 1 }, { unique: true, partialFilterExpression: { requestId: { $type: 'string' } } }),
    db.collection('Sessions').createIndex({ tokenHash: 1 }, { unique: true }),
    db.collection('Sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection('LoginAttempts').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
  ]);
}
async function getConnection() {
  if (!connection) connection = (async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is required');
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    try {
      await client.connect();
      const db = client.db(process.env.DB_NAME || 'TuQuyGardenDB');
      await prepareDatabase(db);
      return { client, db };
    } catch (error) { await client.close(); throw error; }
  })().catch(error => { connection = null; throw error; });
  return connection;
}
module.exports = { getConnection, prepareDatabase };
