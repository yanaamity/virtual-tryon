import { v4 as uuidv4 } from 'uuid';
import { getProducts, saveProducts } from '../../../lib/storage';
import { verifyAdminAuth } from '../../../lib/auth';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (!verifyAdminAuth(req)) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    try {
      const {
        name, category, price, sizes, color, description,
        imageData, mimeType, recommendedPosition, metadata,
      } = req.body;

      const productId = `product-${uuidv4().slice(0, 8)}`;
      let imageUrl = `/products/default.svg`;

      // Store image if provided
      if (imageData) {
        const token = process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL_BLOB_READ_WRITE_TOKEN;
        const ext = mimeType === 'image/png' ? 'png' : 'jpg';
        const imgKey = `products/${productId}.${ext}`;

        if (token) {
          try {
            const { put } = await import('@vercel/blob');
            const buffer = Buffer.from(
              imageData.replace(/^data:image\/\w+;base64,/, ''),
              'base64'
            );
            const blob = await put(imgKey, buffer, {
              access: 'public',
              contentType: mimeType || 'image/jpeg',
              token,
            });
            imageUrl = blob.url;
          } catch (err) {
            imageUrl = imageData; // fallback to base64
          }
        } else {
          imageUrl = imageData;
        }
      }

      const newProduct = {
        id: productId,
        name,
        category,
        price,
        sizes: Array.isArray(sizes) ? sizes : (sizes || '').split(',').map(s => s.trim()),
        color,
        description,
        imageUrl,
        recommendedPosition: recommendedPosition || { x: 0.15, y: 0.18, scale: 0.85 },
        metadata: metadata || { type: 'overlay', defaultOpacity: 0.92 },
        variants: [],
        createdAt: new Date().toISOString(),
      };

      const products = await getProducts();
      products.push(newProduct);
      await saveProducts(products);

      return res.status(200).json({ success: true, productId, product: newProduct });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  if (req.method === 'GET') {
    const products = await getProducts();
    return res.status(200).json({ success: true, products });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
