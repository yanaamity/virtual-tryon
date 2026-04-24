import { v4 as uuidv4 } from 'uuid';
import { getLooks, saveLooks } from '../../../lib/storage';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '15mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const looks = await getLooks();
      return res.status(200).json({ success: true, looks });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const {
        userPhotoId,
        productId,
        productName,
        visualizationMode,
        positioning,
        compositeImageBase64,
      } = req.body;

      const lookId = uuidv4();
      const timestamp = new Date().toISOString();

      let compositeImageUrl = compositeImageBase64;

      // Try to store composite image in Vercel Blob
      const token = process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL_BLOB_READ_WRITE_TOKEN;
      if (token && compositeImageBase64 && compositeImageBase64.startsWith('data:')) {
        try {
          const { put } = await import('@vercel/blob');
          const buffer = Buffer.from(
            compositeImageBase64.replace(/^data:image\/\w+;base64,/, ''),
            'base64'
          );
          const blob = await put(`looks/look-${lookId}.png`, buffer, {
            access: 'public',
            contentType: 'image/png',
            token,
          });
          compositeImageUrl = blob.url;
        } catch (err) {
          console.error('Blob store error:', err);
        }
      }

      const newLook = {
        id: lookId,
        userId: 'user-anonymous',
        timestamp,
        userPhotoId,
        productId,
        productName,
        visualizationMode,
        positioning,
        compositeImageUrl,
      };

      const looks = await getLooks();
      looks.unshift(newLook);
      await saveLooks(looks);

      return res.status(200).json({
        success: true,
        lookId,
        lookUrl: compositeImageUrl,
        look: newLook,
      });
    } catch (err) {
      console.error('Save look error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
