/**
 * Draw the user photo on canvas, scaled to fit
 */
export function drawUserPhoto(canvas, img) {
  const ctx = canvas.getContext('2d');
  const scale = Math.min(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
  const x = (canvas.width - img.naturalWidth * scale) / 2;
  const y = (canvas.height - img.naturalHeight * scale) / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, x, y, img.naturalWidth * scale, img.naturalHeight * scale);
  return { x, y, scale, imgW: img.naturalWidth * scale, imgH: img.naturalHeight * scale };
}

/**
 * Draw clothing overlay on canvas
 */
export function drawClothingOverlay(canvas, clothingImg, position, scaleFactor, opacity) {
  const ctx = canvas.getContext('2d');
  const w = clothingImg.naturalWidth * scaleFactor;
  const h = clothingImg.naturalHeight * scaleFactor;
  
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.drawImage(clothingImg, position.x, position.y, w, h);
  ctx.restore();
}

/**
 * Get canvas as base64 PNG
 */
export function canvasToBase64(canvas) {
  return canvas.toDataURL('image/png');
}

/**
 * Calculate clothing position based on canvas fraction coords
 */
export function fractionalToPixel(canvas, fx, fy) {
  return { x: fx * canvas.width, y: fy * canvas.height };
}

/**
 * Detect person bounding box using COCO-SSD
 * Returns simplified landmark data for clothing placement
 */
export async function detectPersonBbox(imgElement) {
  try {
    const cocoSsd = await import('@tensorflow-models/coco-ssd');
    await import('@tensorflow/tfjs-backend-webgl');
    const model = await cocoSsd.load();
    const predictions = await model.detect(imgElement);
    const person = predictions.find(p => p.class === 'person');
    if (!person) return null;
    const [bx, by, bw, bh] = person.bbox;
    return { x: bx, y: by, width: bw, height: bh, shoulderY: by + bh * 0.08, chestCenterX: bx + bw / 2, chestCenterY: by + bh * 0.25, torsoWidth: bw * 0.65 };
  } catch (err) { console.error('Detection error:', err); return null; }
}
export function scaleDetectionToCanvas(canvas, bbox, userImgLayout) {
  const scaleX = userImgLayout.imgW / (bbox.naturalWidth || userImgLayout.imgW);
  return { shoulderY: userImgLayout.y + bbox.shoulderY * (userImgLayout.imgH / (bbox.height / 0.92)), chestCenterX: userImgLayout.x + bbox.chestCenterX * scaleX, torsoWidth: bbox.torsoWidth * scaleX };
}
