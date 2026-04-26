/**
 * Draw the user photo on canvas, scaled to fit (letterbox)
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
 * Load a script tag from CDN (idempotent — safe to call multiple times)
 */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error(`Failed to load: ${src}`));
    document.head.appendChild(s);
  });
}

// Cached MoveNet detector — created once, reused on every call
let _detector = null;

/**
 * detectPoseKeypoints — uses TensorFlow.js MoveNet Lightning (browser, free, no API credits)
 *
 * MoveNet returns 17 body keypoints including exact pixel coordinates for:
 *   left_shoulder, right_shoulder, left_hip, right_hip, nose, etc.
 *
 * This is far more accurate for clothing placement than COCO-SSD's bounding box,
 * because we know the EXACT shoulder line and can scale the garment to the
 * real shoulder width detected in the image.
 *
 * @param {HTMLCanvasElement|HTMLImageElement} imageEl
 * @returns {{ centerX, topY, shoulderWidth, torsoHeight } | null}
 */
export async function detectPoseKeypoints(imageEl) {
  if (typeof window === 'undefined') return null;

  try {
    // ── Load TF.js + MoveNet from CDN if not already present ──────────────
    if (!window.poseDetection) {
      await loadScript(
        'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.17.0/dist/tf.min.js'
      );
      await loadScript(
        'https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.1.3/dist/pose-detection.min.js'
      );
    }

    const pd = window.poseDetection;

    // ── Create detector once and cache it ─────────────────────────────────
    if (!_detector) {
      _detector = await pd.createDetector(
        pd.SupportedModels.MoveNet,
        {
          modelType: pd.movenet.modelType.SINGLEPOSE_LIGHTNING,
          // Lightning = smallest + fastest model (~6 MB, ~30ms inference)
        }
      );
    }

    // ── Run inference ─────────────────────────────────────────────────────
    const poses = await _detector.estimatePoses(imageEl);
    if (!poses || poses.length === 0) return null;

    // Map keypoints by name, filter out low-confidence ones
    const kp = {};
    poses[0].keypoints.forEach(k => {
      if (k.score > 0.25) kp[k.name] = k;
    });

    const lShoulder = kp['left_shoulder'];
    const rShoulder = kp['right_shoulder'];

    // Shoulders are required — everything else is a bonus
    if (!lShoulder || !rShoulder) return null;

    const shoulderWidth  = Math.abs(rShoulder.x - lShoulder.x);
    const centerX        = (lShoulder.x + rShoulder.x) / 2;
    // Top of garment: a few pixels above the higher shoulder
    const shoulderTopY   = Math.min(lShoulder.y, rShoulder.y) - shoulderWidth * 0.06;

    // Torso height: shoulder-to-hip distance, or estimate from shoulder width
    const lHip = kp['left_hip'];
    const rHip = kp['right_hip'];
    const hipY = lHip && rHip ? (lHip.y + rHip.y) / 2 : null;
    const torsoHeight = hipY
      ? hipY - shoulderTopY
      : shoulderWidth * 1.5; // rough estimate if hips not detected

    return { centerX, topY: shoulderTopY, shoulderWidth, torsoHeight };
  } catch (err) {
    console.warn('MoveNet detection failed:', err.message);
    _detector = null; // reset so next call can retry
    return null;
  }
}
