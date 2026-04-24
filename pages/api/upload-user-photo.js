import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Expect base64 image in body
    const { imageData, fileName, mimeType } = req.body;
    
    if (!imageData) {
      return res.status(400).json({ success: false, error: 'No image data provided' });
    }

    const imageId = uuidv4();
    const ext = mimeType === 'image/png' ? 'png' : 'jpg';
    const imageKey = `users/photo-${imageId}.${ext}`;

    // Try to store in Vercel Blob if token is available
    const token = process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL_BLOB_READ_WRITE_TOKEN;
    
    if (token) {
      try {
        const { put } = await import('@vercel/blob');
        const buffer = Buffer.from(imageData.replace(/^data:image\/\w+;base64,/, ''), 'base64');
        const blob = await put(imageKey, buffer, {
          access: 'public',
          contentType: mimeType || 'image/jpeg',
          token,
        });
        return res.status(200).json({
          success: true,
          imageUrl: blob.url,
          imageId,
        });
      } catch (blobErr) {
        console.error('Blob upload error:', blobErr);
      }
    }

    // Fallback: return the base64 as the image URL (works for canvas operations)
    return res.status(200).json({
      success: true,
      imageUrl: imageData, // base64 data URL
      imageId,
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
