import { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { drawUserPhoto, drawClothingOverlay, canvasToBase64 } from './CanvasUtils';

const CompositeCanvas = forwardRef(function CompositeCanvas({ userPhoto, selectedProduct, mode, position, scale, opacity, onPositionChange, onPersonDetected }, ref) {
  const canvasRef = useRef(null);
  const userImgRef = useRef(null);
  const clothingImgRef = useRef(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const layoutRef = useRef(null);

  useImperativeHandle(ref, () => ({
    capture: () => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      return canvasToBase64(canvas);
    },
  }));

  useEffect(() => {
    if (!userPhoto) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { userImgRef.current = img; redraw(); };
    img.onerror = () => { const img2 = new Image(); img2.onload = () => { userImgRef.current = img2; redraw(); }; img2.src = userPhoto; };
    img.src = userPhoto;
  }, [userPhoto]);

  useEffect(() => {
    if (!selectedProduct) { clothingImgRef.current = null; redraw(); return; }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      clothingImgRef.current = img;
      if (mode === 'smart' && userImgRef.current && onPersonDetected) {
        try {
          const { detectPersonBbox } = await import('./CanvasUtils');
          const tmpCanvas = document.createElement('canvas');
          tmpCanvas.width = userImgRef.current.naturalWidth;
          tmpCanvas.height = userImgRef.current.naturalHeight;
          const tmpCtx = tmpCanvas.getContext('2d');
          tmpCtx.drawImage(userImgRef.current, 0, 0);
          const bbox = await detectPersonBbox(tmpCanvas);
          if (bbox && layoutRef.current) {
            const layout = layoutRef.current;
            const imgScaleX = layout.imgW / userImgRef.current.naturalWidth;
            const imgScaleY = layout.imgH / userImgRef.current.naturalHeight;
            const smartX = layout.x + bbox.chestCenterX * imgScaleX - (clothingImgRef.current.naturalWidth * scale) / 2;
            const smartY = layout.y + bbox.shoulderY * imgScaleY;
            onPersonDetected({ x: smartX, y: smartY, detected: true });
          }
        } catch (err) { onPersonDetected({ detected: false }); }
      }
      redraw();
    };
    img.onerror = () => { const img2 = new Image(); img2.onload = () => { clothingImgRef.current = img2; redraw(); }; img2.src = selectedProduct.imageUrl; };
    img.src = selectedProduct.imageUrl;
  }, [selectedProduct, mode]);

  useEffect(() => { redraw(); }, [position, scale, opacity, mode]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#f8fafc'); gradient.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (!userImgRef.current) { ctx.fillStyle = '#94a3b8'; ctx.font = '16px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Upload your photo to begin', canvas.width/2, canvas.height/2); return; }
    const layout = drawUserPhoto(canvas, userImgRef.current); layoutRef.current = layout;
    if (clothingImgRef.current && position) { drawClothingOverlay(canvas, clothingImgRef.current, position, scale, opacity); }
  }, [position, scale, opacity]);

  const getCanvasPos = (e, canvas) => { const rect = canvas.getBoundingClientRect(); const scaleX = canvas.width / rect.width; const scaleY = canvas.height / rect.height; const clientX = e.touches ? e.touches[0].clientX : e.clientX; const clientY = e.touches ? e.touches[0].clientY : e.clientY; return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY }; };
  const handleMouseDown = useCallback((e) => { if (!clothingImgRef.current || !position) return; isDragging.current = true; const pos = getCanvasPos(e, canvasRef.current); dragStart.current = { x: pos.x - position.x, y: pos.y - position.y }; }, [position]);
  const handleMouseMove = useCallback((e) => { if (!isDragging.current || !onPositionChange) return; const pos = getCanvasPos(e, canvasRef.current); onPositionChange({ x: pos.x - dragStart.current.x, y: pos.y - dragStart.current.y }); }, [onPositionChange]);
  const handleMouseUp = () => { isDragging.current = false; };

  return (
    <div className="relative w-full">
      <canvas ref={canvasRef} width={600} height={700}
        className="w-full rounded-2xl shadow-lg border border-gray-200 cursor-move"
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown} onTouchMove={handleMouseMove} onTouchEnd={handleMouseUp}
      />
    </div>
  );
});
export default CompositeCanvas;
