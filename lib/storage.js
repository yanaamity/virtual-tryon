// Storage helper - uses in-memory fallback when Vercel Blob not configured
const { put, get, list, del } = (() => {
  try { return require('@vercel/blob'); }
  catch { return { put: null, get: null, list: null, del: null }; }
})();
const memoryStore = new Map();
export async function storeBlob(filename, data, contentType = 'application/octet-stream') {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (put && token) { try { const b = await put(filename, data, { access: 'public', contentType, token }); return { url: b.url, key: filename }; } catch (err) { console.error('Blob error:', err); } }
  const dataStr = Buffer.isBuffer(data) ? data.toString('base64') : data;
  memoryStore.set(filename, { data: dataStr, contentType });
  return { url: `/api/blob/${encodeURIComponent(filename)}`, key: filename };
}
export async function getBlob(filename) {
  return memoryStore.get(filename) || null;
}
let productsCache = null;
let looksCache = null;
export async function getProducts() {
  if (productsCache) return productsCache;
  try { const fs = require('fs'); const path = require('path'); const fp = path.join(process.cwd(), 'data', 'products.json'); const raw = fs.readFileSync(fp, 'utf-8'); productsCache = JSON.parse(raw).products || []; return productsCache; } catch (err) { return []; }
}
export async function saveProducts(products) {
  productsCache = products;
  try { const fs = require('fs'); const path = require('path'); fs.writeFileSync(path.join(process.cwd(), 'data', 'products.json'), JSON.stringify({ products }, null, 2)); } catch (err) { await storeBlob('data/products.json', JSON.stringify({ products }), 'application/json'); }
}
export async function getLooks() {
  if (looksCache) return looksCache;
  try { const fs = require('fs'); const path = require('path'); const fp = path.join(process.cwd(), 'data', 'looks.json'); if (fs.existsSync(fp)) { const raw = fs.readFileSync(fp, 'utf-8'); looksCache = JSON.parse(raw).looks || []; } else { looksCache = []; } return looksCache; } catch (err) { return looksCache || []; }
}
export async function saveLooks(looks) {
  looksCache = looks;
  try { const fs = require('fs'); const path = require('path'); fs.writeFileSync(path.join(process.cwd(), 'data', 'looks.json'), JSON.stringify({ looks }, null, 2)); } catch (err) { await storeBlob('data/looks.json', JSON.stringify({ looks }), 'application/json'); }
}
