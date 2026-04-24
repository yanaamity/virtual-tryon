import { getProducts, getLooks } from '../../../lib/storage';
import { verifyAdminAuth } from '../../../lib/auth';

export default async function handler(req, res) {
  if (!verifyAdminAuth(req)) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const products = await getProducts();
    const looks = await getLooks();
    
    return res.status(200).json({
      success: true,
      stats: {
        totalProducts: products.length,
        totalLooks: looks.length,
        categories: [...new Set(products.map(p => p.category))],
        recentLooks: looks.slice(0, 5),
      },
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
