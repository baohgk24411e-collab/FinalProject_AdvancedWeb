require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { getConnection } = require('../api/lib/database');
const { hashPassword } = require('../api/lib/security');
async function setup() {
  const { client, db } = await getConnection();
  try {
    for (const [file, key, collection] of [['categories', 'MOCK_CATEGORIES', 'Categories'], ['products', 'MOCK_PRODUCTS', 'Products']]) {
      const sandbox = {};
      new Function('window', fs.readFileSync(path.join(__dirname, '../../my-server-mongodb/data', `${file}.js`), 'utf8'))(sandbox);
      for (const record of sandbox[key]) await db.collection(collection).updateOne({ id: record.id }, { $setOnInsert: record }, { upsert: true });
    }
    for await (const user of db.collection('Users').find({ password: { $type: 'string' } })) {
      const changes = { email: String(user.email).trim().toLowerCase() };
      if (!user.passwordHash && user.password) changes.passwordHash = await hashPassword(user.password);
      await db.collection('Users').updateOne({ _id: user._id }, { $set: changes, $unset: { password: '' } });
    }
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      if (process.env.ADMIN_PASSWORD.length < 12) throw new Error('ADMIN_PASSWORD must contain at least 12 characters');
      const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
      const existing = await db.collection('Users').findOne({ email });
      if (existing && !existing.isAdmin) throw new Error('Refusing to promote an existing customer');
      await db.collection('Users').updateOne({ email }, { $setOnInsert: { id: `admin_${require('node:crypto').randomUUID()}`, email, name: 'Admin', passwordHash: await hashPassword(process.env.ADMIN_PASSWORD), isAdmin: true, wishlist: [], phone: '' } }, { upsert: true });
    }
    console.log('Setup complete. Existing data preserved. No sample accounts/orders created.');
  } finally { await client.close(); }
}
setup().catch(error => { console.error(error.message); process.exitCode = 1; });
