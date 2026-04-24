import { getLooks, saveLooks } from '../../../lib/storage';

export default async function handler(req, res) {
  const { id } = req.query;
  const looks = await getLooks();

  if (req.method === 'GET') {
    const look = looks.find(l => l.id === id);
    if (!look) return res.status(404).json({ success: false, error: 'Look not found' });
    return res.status(200).json({ success: true, look });
  }

  if (req.method === 'DELETE') {
    const filtered = looks.filter(l => l.id !== id);
    await saveLooks(filtered);
    return res.status(200).json({ success: true, message: 'Look deleted' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
