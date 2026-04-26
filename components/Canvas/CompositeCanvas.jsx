import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { drawUserPhoto, drawClothingOverlay, canvasToBase64 } from './CanvasUtils';

/**
 * CompositeCanvas
 *
 * Renders the user photo + clothing overlay on an HTML5 canvas.
 * Clothing placement is fully managed by the parent (tryon.js), which
 * runs auto-placement (heuristic + optional COCO-SSD) and passes down
 * the computed `position`. Drag on this canvas updates `position` via
 * onPositionChange for fine-tuning only.
 *
 * Props:
 *   userPhoto       – data-url or blob URL of the user's photo
 *   selectedProduct – { imageUrl, ... }  null = no overlay
 *   position        – { x, y } in canvas pixels; null = no overlay yet
 *   scale           – clothing scale factor
 *   opacity         – clothing opacity 0-1
 *   onPositionChange– (newPos) => void  called while dragging
 */
const CompositeCanvas = forwardRef(function CompositeCanvas(
  { userPhoto, selectedProduct, position, scale = 1, opacity = 0.92, onPositionChange },
  ref
) {
  const canvasRef      = useRef(null);
  const userImgRef     = useRef(null);
  const clothingImgRef = useRef(null);
  const isDragging     = useRef(false);
  const dragStart      = useRef({ x: 0, y: 0 });

  // Expose capture() to parent
  useImperativeHandle(ref, () => ({
    capture: () => canvasRef.current ? canvasToBase64(canvasRef.current) : null,
  }));

  /* ── Image loaders ─────────────────────────────────────────────── */

  useEffect(() => {
    if (!userPhoto) { userImgRef.current = null; redraw(); return; }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { userImgRef.current = img; redraw(); };
    img.onerror = () => {
      const img2 = new Image();
      img2.onload = () => { userImgRef.current = img2; redraw(); };
      img2.src = userPhoto;
    };
    img.src = userPhoto;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPhoto]);

  useEffect(() => {
    if (!selectedProduct?.imageUrl) { clothingImgRef.current = null; redraw(); return; }
    const url = selectedProduct.imageUrl;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { clothingImgRef.current = img; redraw(); };
    img.onerror = () => {
      const img2 = new Image();
      img2.onload = () => { clothingImgRef.current = img2; redraw(); };
      img2.src = url;
    };
    img.src = url;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProduct?.imageUrl]);

  // Re-render whenever position/scale/opacity change
  useEffect(() => { redraw(); }, [position, scale, opacity]);

  /* ── Drawing ────────────────────────────────────────────────────── */

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!userImgRef.current) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Upload your photo to begin', canvas.width / 2, canvas.height / 2);
      return;
    }

    // Draw user photo (letterboxed)
    drawUserPhoto(canvas, userImgRef.current);

    // Draw clothing only when a position has been computed by parent
    if (clothingImgRef.current && position) {
      drawClothingOverlay(canvas, clothingImgRef.current, position, scale, opacity);
    }
  }, [position, scale, opacity]);

  /* ── Drag to fine-tune ──────────────────────────────────────────── */

  const getCanvasCoord = (e, canvas) => {
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const src    = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top)  * scaleY,
    };
  };

  const handlePointerDown = useCallback((e) => {
    if (!clothingImgRef.current || !position) return;
    isDragging.current = true;
    const p = getCanvasCoord(e, canvasRef.current);
    dragStart.current = { x: p.x - position.x, y: p.y - position.y };
  }, [position]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging.current || !onPositionChange) return;
    const p = getCanvasCoord(e, canvasRef.current);
    onPositionChange({
      x: p.x - dragStart.current.x,
      y: p.y - dragStart.current.y,
    });
  }, [onPositionChange]);

  const handlePointerUp = () => { isDragging.current = false; };

  /* ── Render ─────────────────────────────────────────────────────── */

  return (
    <div className="relative w-full">
      <canvas
        ref={canvasRef}
        width={600}
        height={700}
        className="w-full rounded-2xl shadow-lg border border-gray-200 cursor-move select-none"
        style={{ maxHeight: '70vh', background: '#f8fafc' }}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      />
      {clothingImgRef.current && position && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/40 text-white text-xs px-3 py-1 rounded-full pointer-events-none">
          Drag to fine-tune position
        </div>
      )}
    </div>
  );
});

export default CompositeCanvas;
