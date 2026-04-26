// Storage helper - uses in-memory fallback when Vercel Blob not configured
const { put, get, list, del } = (() => {
  try {
    return require('@vercel/blob');
  } catch {
    return { put: null, get: null, list: null, del: null };
  }
})();

// In-memory store for development/fallback
const memoryStore = new Map();

export async function storeBlob(filename, data, contentType = 'application/octet-stream') {
  const token = process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL_BLOB_READ_WRITE_TOKEN;
  
  if (put && token) {
    try {
      const blob = await put(filename, data, {
        access: 'public',
        contentType,
        token,
      });
      return { url: blob.url, key: filename };
    } catch (err) {
      console.error('Blob storage error:', err);
    }
  }
  
  // Fallback: store in memory
  const dataStr = Buffer.isBuffer(data) ? data.toString('base64') : data;
  memoryStore.set(filename, { data: dataStr, contentType });
  return { url: `/api/blob/${encodeURIComponent(filename)}`, key: filename };
}

export async function getBlob(filename) {
  const token = process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL_BLOB_READ_WRITE_TOKEN;
  
  if (get && token) {
    try {
      const blob = await get(filename, { token });
      return blob;
    } catch (err) {
      console.error('Blob get error:', err);
    }
  }
  
  return memoryStore.get(filename) || null;
}

export function getMemoryStore() {
  return memoryStore;
}

// JSON data storage in blob or memory
let productsCache = null;
let looksCache = null;

export async function getProducts() {
  if (productsCache) return productsCache;
  
  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'data', 'products.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    productsCache = data.products || [];
    return productsCache;
  } catch (err) {
    return [];
  }
}

export async function saveProducts(products) {
  productsCache = products;
  // In production, could write to Vercel Blob
  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'data', 'products.json');
    fs.writeFileSync(filePath, JSON.stringify({ products }, null, 2));
  } catch (err) {
    // In serverless, filesystem writes don't persist - use Blob instead
    await storeBlob('data/products.json', JSON.stringify({ products }), 'application/json');
  }
}

export async function getLooks() {
  if (looksCache) return looksCache;
  
  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'data', 'looks.json');
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(raw);
      looksCache = data.looks || [];
    } else {
      looksCache = [];
    }
    return looksCache;
  } catch (err) {
    return looksCache || [];
  }
}

export async function saveLooks(looks) {
  looksCache = looks;
  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'data', 'looks.json');
    fs.writeFileSync(filePath, JSON.stringify({ looks }, null, 2));
  } catch (err) {
    await storeBlob('data/looks.json', JSON.stringify({ looks }), 'application/json');
  }
}
