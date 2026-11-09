const crypto = require('node:crypto');
const { promisify } = require('node:util');
const scrypt = promisify(crypto.scrypt);
async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  return `scrypt:${salt}:${(await scrypt(password, salt, 64)).toString('hex')}`;
}
async function verifyPassword(password, hash) {
  if (typeof hash !== 'string' || !hash.startsWith('scrypt:')) return false;
  const [, salt, value] = hash.split(':');
  const actual = await scrypt(password, salt, 64);
  const expected = Buffer.from(value, 'hex');
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}
const tokenHash = value => crypto.createHash('sha256').update(value).digest('hex');
function publicUser(user) {
  if (!user) return null;
  const { password, passwordHash, _id, ...safe } = user;
  return safe;
}
module.exports = { hashPassword, verifyPassword, tokenHash, publicUser };
