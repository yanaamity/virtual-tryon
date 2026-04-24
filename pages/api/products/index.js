import { getProducts } from '../../../lib/storage';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const products = await getProducts();
      const { category } = req.query;
      
      let filtered = products;
      if (category && category !== 'all') {
        filtered = products.filter(p => p.category === category);
      }
      
      return res.status(200).json({ success: true, products: filtered });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
