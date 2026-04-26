import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import PhotoUpload from '../components/PhotoUpload';
import ProductGrid from '../components/ProductGrid';

const CompositeCanvas = dynamic(() => import('../components/Canvas/CompositeCanvas'), { ssr: false });

const CANVAS_W = 600;
const CANVAS_H = 700;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Retry without crossOrigin
      const img2 = new Image();
      img2.onload = () => resolve(img2);
      img2.onerror = reject;
      img2.src = src;
    };
    img.src = src;
  });
}

export default function TryOnPage() {
  const [products, setProducts] = useState([]);
  const [userPhoto, setUserPhoto] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [position, setPosition] = useState(null);
  const [scale, setScale] = useState(1.0);
  const [opacity, setOpacity] = useState(0.92);
  const [detecting, setDetecting] = useState(false);
  const [placementMethod, setPlacementMethod] = useState(null); // null | 'heuristic' | 'ai'
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [tab, setTab] = useState('products');
  const [showControls, setShowControls] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(d => { if (d.success) setProducts(d.products); })
      .catch(console.error);
  }, []);

  /**
   * Two-phase auto-placement:
   *   Phase 1 (instant): heuristic center + shoulder heuristic
   *   Phase 2 (async):   COCO-SSD body detection → refined position
   */
  const autoPlaceClothing = useCallback(async (photo, product) => {
    if (!photo || !product) return;

    const photoUrl = photo.imageUrl || photo.localPreview;
    const clothingUrl = product.imageUrl;
    if (!photoUrl || !clothingUrl) return;

    try {
      const [userImg, clothImg] = await Promise.all([
        loadImage(photoUrl),
        loadImage(clothingUrl),
      ]);

      // How the user photo is letterboxed onto the 600×700 canvas
      const photoScale = Math.min(CANVAS_W / userImg.naturalWidth, CANVAS_H / userImg.naturalHeight);
      const photoX = (CANVAS_W - userImg.naturalWidth * photoScale) / 2;
      const photoY = (CANVAS_H - userImg.naturalHeight * photoScale) / 2;
      const photoW = userImg.naturalWidth * photoScale;
      const photoH = userImg.naturalHeight * photoScale;

      // Scale clothing so it fills ~62% of the photo width (torso-width estimate)
      const idealScale = Math.min(2.0, Math.max(0.3, (photoW * 0.62) / clothImg.naturalWidth));
      const clothW = clothImg.naturalWidth * idealScale;

      // ── Phase 1: instant heuristic ──────────────────────────────────────
      // Center horizontally; place at ~9% from top of photo (shoulder area)
      setPosition({
        x: photoX + (photoW - clothW) / 2,
        y: photoY + photoH * 0.09,
      });
      setScale(idealScale);
      setPlacementMethod('heuristic');

      // ── Phase 2: MoveNet pose detection (async, free, browser-only) ────────
      // MoveNet Lightning gives exact left_shoulder / right_shoulder keypoints,
      // so we scale the garment to the real shoulder width and align the top
      // of the clothing precisely to the shoulder line.
      setDetecting(true);
      try {
        const { detectPoseKeypoints } = await import('../components/Canvas/CanvasUtils');

        // Run detection on the photo at its natural resolution for best accuracy
        const tmpCanvas = document.createElement('canvas');
        tmpCanvas.width  = userImg.naturalWidth;
        tmpCanvas.height = userImg.naturalHeight;
        tmpCanvas.getContext('2d').drawImage(userImg, 0, 0);

        const pose = await detectPoseKeypoints(tmpCanvas);
        if (pose) {
          // Scale detected keypoint coords (natural px) → canvas px
          const sX = photoW / userImg.naturalWidth;
          const sY = photoH / userImg.naturalHeight;

          const canvasCenterX     = photoX + pose.centerX     * sX;
          const canvasTopY        = photoY + pose.topY        * sY;
          const canvasShoulderW   = pose.shoulderWidth        * sX;

          // Clothing width = shoulder width × 1.15 (slight overhang each side)
          const poseScale  = Math.min(2.0, Math.max(0.3, (canvasShoulderW * 1.15) / clothImg.naturalWidth));
          const poseClothW = clothImg.naturalWidth * poseScale;

          setPosition({ x: canvasCenterX - poseClothW / 2, y: canvasTopY });
          setScale(poseScale);
          setPlacementMethod('ai');
        }
        // If no pose detected, heuristic placement stays
      } catch {
        // MoveNet CDN unavailable — heuristic placement stays, no error shown
      } finally {
        setDetecting(false);
      }
    } catch (err) {
      console.error('Auto-place error:', err);
      // Last-resort fallback
      setPosition({ x: 120, y: 80 });
      setDetecting(false);
    }
  }, []);

  const handleProductSelect = useCallback((product) => {
    setSelectedProduct(product);
    setSelectedVariant(null);
    setPlacementMethod(null);
    setTab('controls');
    if (userPhoto) {
      autoPlaceClothing(userPhoto, product);
    }
  }, [userPhoto, autoPlaceClothing]);

  const handlePhotoUploaded = useCallback((photo) => {
    setUserPhoto(photo);
    setPlacementMethod(null);
    if (photo) {
      if (selectedProduct) {
        autoPlaceClothing(photo, selectedProduct);
      } else {
        setTab('products');
      }
    }
  }, [selectedProduct, autoPlaceClothing]);

  const handleSaveLook = async () => {
    if (!canvasRef.current || !userPhoto || !selectedProduct) return;
    setSaving(true);
    try {
      const compositeImageBase64 = canvasRef.current.capture();
      const res = await fetch('/api/looks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPhotoId: userPhoto.imageId,
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          visualizationMode: placementMethod === 'ai' ? 'smart' : 'simple',
          positioning: { x: position?.x, y: position?.y, scale, opacity },
          compositeImageBase64,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const effectiveImageUrl = selectedVariant?.imageUrl || selectedProduct?.imageUrl;

  // Step indicator for the top subtitle
  const stepHint = !userPhoto
    ? 'Step 1 — Upload your photo'
    : !selectedProduct
    ? 'Step 2 — Pick a clothing item'
    : '✨ Clothes are placed automatically — drag on canvas to fine-tune';

  return (
    <>
      <Head>
        <title>Try On – TryOnAI</title>
        <meta name="description" content="Upload your photo and virtually try on clothing — auto-placed instantly" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Virtual Try-On</h1>
          <p className="text-gray-500 mt-1">{stepHint}</p>
        </div>

        <div className="grid lg:grid-cols-[340px_1fr_300px] gap-6">

          {/* ── Left: Photo + Products ───────────────────────────────── */}
          <div className="lg:order-1 order-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-20">

              {/* Mobile tabs */}
              <div className="flex lg:hidden mb-4 gap-2">
                <button onClick={() => setTab('photo')}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === 'photo' ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  📸 Photo
                </button>
                <button onClick={() => setTab('products')}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === 'products' ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  👕 Products
                </button>
              </div>

              {/* Photo upload — always visible on desktop */}
              <div className={`${(tab !== 'photo' && tab !== 'products') ? 'hidden lg:block' : tab !== 'photo' ? 'hidden' : ''} mb-4`}>
                <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Your Photo</h3>
                <PhotoUpload onPhotoUploaded={handlePhotoUploaded} />
              </div>

              {/* Product grid */}
              <div className={`${tab !== 'products' ? 'hidden lg:block' : ''} lg:mt-4`} style={{ height: '420px' }}>
                <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Products</h3>
                <div style={{ height: 'calc(100% - 28px)' }}>
                  <ProductGrid
                    products={products}
                    selectedProduct={selectedProduct}
                    onSelectProduct={handleProductSelect}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Center: Canvas ───────────────────────────────────────── */}
          <div className="lg:order-2 order-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">

              {/* Status bar */}
              <div className="flex items-center justify-between mb-3 min-h-[28px]">
                <div className="flex items-center gap-2">
                  {detecting ? (
                    <span className="flex items-center gap-2 text-sm text-purple-600 font-medium">
                      <span className="w-3 h-3 border-2 border-purple-500 border-t-transparent rounded-full animate-spin inline-block" />
                      Enhancing with AI body detection…
                    </span>
                  ) : placementMethod === 'ai' ? (
                    <span className="text-sm text-purple-600 font-medium flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-purple-500 rounded-full inline-block" />
                      🤖 AI-placed
                      <span className="text-gray-400 font-normal">· drag to fine-tune</span>
                    </span>
                  ) : placementMethod === 'heuristic' ? (
                    <span className="text-sm text-sky-600 font-medium flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-sky-500 rounded-full inline-block" />
                      ✓ Auto-placed
                      <span className="text-gray-400 font-normal">· drag to fine-tune</span>
                    </span>
                  ) : userPhoto && !selectedProduct ? (
                    <span className="text-sm text-gray-400 italic">← Select a clothing item to try on</span>
                  ) : null}
                </div>
                {saveSuccess && (
                  <span className="text-green-600 font-medium text-sm flex items-center gap-1">✓ Look saved!</span>
                )}
              </div>

              <CompositeCanvas
                ref={canvasRef}
                userPhoto={userPhoto?.imageUrl || userPhoto?.localPreview}
                selectedProduct={effectiveImageUrl ? { ...selectedProduct, imageUrl: effectiveImageUrl } : selectedProduct}
                position={position}
                scale={scale}
                opacity={opacity}
                onPositionChange={setPosition}
              />

              {/* Controls appear once clothing is placed */}
              {selectedProduct && position && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">

                  {/* Fine-tune toggle */}
                  <button
                    onClick={() => setShowControls(v => !v)}
                    className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
                  >
                    {showControls ? '▲ Hide' : '▼ Show'} fine-tune controls
                  </button>

                  {showControls && (
                    <div className="grid grid-cols-2 gap-4 pb-1">
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">
                          Scale: {scale.toFixed(2)}×
                        </label>
                        <input type="range" min="0.3" max="2.5" step="0.05"
                          value={scale} onChange={e => setScale(parseFloat(e.target.value))}
                          className="w-full accent-sky-500" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">
                          Opacity: {Math.round(opacity * 100)}%
                        </label>
                        <input type="range" min="0.2" max="1" step="0.05"
                          value={opacity} onChange={e => setOpacity(parseFloat(e.target.value))}
                          className="w-full accent-sky-500" />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => userPhoto && autoPlaceClothing(userPhoto, selectedProduct)}
                      disabled={!userPhoto || detecting}
                      className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-700 rounded-xl font-medium text-sm transition-colors"
                    >
                      🔄 Re-place automatically
                    </button>
                    <button
                      onClick={handleSaveLook}
                      disabled={saving || !userPhoto}
                      className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-200 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm"
                    >
                      {saving ? '⏳ Saving…' : '💾 Save This Look'}
                    </button>
                  </div>
                </div>
              )}

              {!userPhoto && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-3 text-center text-sm text-blue-700">
                  📸 Upload your photo on the left to get started
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Product details ───────────────────────────────── */}
          <div className="lg:order-3 order-3">
            {selectedProduct ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-20">
                <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center p-4 mb-4">
                  <img
                    src={effectiveImageUrl || selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className="w-full h-full object-contain"
                    onError={e => {
                      e.target.style.display = 'none';
                      e.target.parentNode.innerHTML = '<span class="text-6xl">👕</span>';
                    }}
                  />
                </div>
                <h3 className="font-bold text-gray-900">{selectedProduct.name}</h3>
                <p className="text-sky-600 font-bold text-xl mt-0.5">{selectedProduct.price}</p>
                <p className="text-gray-500 text-sm mt-2">{selectedProduct.description}</p>

                {selectedProduct.sizes && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Available Sizes</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedProduct.sizes.map(s => (
                        <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Variants */}
                {selectedProduct.variants?.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Size</p>
                      <div className="flex flex-wrap gap-1.5">
                        {[...new Set(selectedProduct.variants.map(v => v.size))].map(size => {
                          const v = selectedProduct.variants.find(x => x.size === size);
                          const isActive = selectedVariant?.size === size;
                          return (
                            <button key={size} onClick={() => setSelectedVariant(isActive ? null : v)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${isActive ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                              {size}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <a href="/gallery"
                    className="block w-full text-center py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-sm font-semibold transition-colors">
                    View Saved Looks →
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center sticky top-20">
                <div className="text-4xl mb-3">👕</div>
                <p className="font-semibold text-gray-700">Select a product</p>
                <p className="text-sm text-gray-500 mt-1">
                  Choose any clothing item — it'll be placed on your photo automatically
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
