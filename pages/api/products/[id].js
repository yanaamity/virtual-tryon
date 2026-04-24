import { getProducts, saveProducts } from '../../../lib/storage';
import { verifyAdminAuth } from '../../../lib/auth';

export default async function handler(req, res) {
  const { id } = req.query;
  const products = await getProducts();
  
  if (req.method === 'GET') {
    const product = products.find(p => p.id === id);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    return res.status(200).json({ success: true, product });
  }
  
  if (req.method === 'PUT') {
    if (!verifyAdminAuth(req)) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Product not found' });
    
    products[idx] = { ...products[idx], ...req.body, id };
    await saveProducts(products);
    return res.status(200).json({ success: true, product: products[idx] });
  }
  
  if (req.method === 'DELETE') {
    if (!verifyAdminAuth(req)) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    
    const filtered = products.filter(p => p.id !== id);
    if (filtered.length === products.length) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    
    await saveProducts(filtered);
    return res.status(200).json({ success: true, message: 'Product deleted' });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
