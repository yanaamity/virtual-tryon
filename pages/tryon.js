import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import PhotoUpload from '../components/PhotoUpload';
import ProductGrid from '../components/ProductGrid';

const CompositeCanvas = dynamic(() => import('../components/Canvas/CompositeCanvas'), { ssr: false });

export default function TryOnPage() {
  const [products, setProducts] = useState([]);
  const [userPhoto, setUserPhoto] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [mode, setMode] = useState('simple');
  const [position, setPosition] = useState({ x: 80, y: 120 });
  const [scale, setScale] = useState(1.0);
  const [opacity, setOpacity] = useState(0.92);
  const [detecting, setDetecting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [tab, setTab] = useState('products'); // 'products' | 'controls'
  const canvasRef = useRef(null);

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(d => { if (d.success) setProducts(d.products); })
      .catch(console.error);
  }, []);

  const handleProductSelect = useCallback((product) => {
    setSelectedProduct(product);
    setSelectedVariant(null);
    // Set initial position from product's recommended position
    if (product.recommendedPosition) {
      const rp = product.recommendedPosition;
      setPosition({ x: rp.x * 600, y: rp.y * 700 });
      setScale(rp.scale || 1.0);
    }
    if (product.metadata?.defaultOpacity) {
      setOpacity(product.metadata.defaultOpacity);
    }
    setTab('controls');
  }, []);

  const handlePersonDetected = useCallback(({ x, y, detected }) => {
    setDetecting(false);
    if (detected) {
      setPosition({ x, y });
    }
  }, []);

  const handleModeToggle = async () => {
    const newMode = mode === 'simple' ? 'smart' : 'simple';
    setMode(newMode);
    if (newMode === 'smart' && userPhoto && selectedProduct) {
      setDetecting(true);
    }
  };

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
          visualizationMode: mode,
          positioning: { x: position.x, y: position.y, scale, opacity },
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
  const effectiveScale = scale * (selectedVariant?.scaleFactor || 1.0);

  return (
    <>
      <Head>
        <title>Try On – TryOnAI</title>
        <meta name="description" content="Upload your photo and virtually try on clothing items" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Virtual Try-On</h1>
          <p className="text-gray-500 mt-1">Upload your photo → select a product → see the magic happen</p>
        </div>

        <div className="grid lg:grid-cols-[340px_1fr_300px] gap-6">
          {/* Left: Photo upload + product panel (mobile: tabs) */}
          <div className="lg:order-1 order-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-20">
              {/* Mobile tabs */}
              <div className="flex lg:hidden mb-4 gap-2">
                <button
                  onClick={() => setTab('photo')}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold ${tab === 'photo' ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  📸 Photo
                </button>
                <button
                  onClick={() => setTab('products')}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold ${tab === 'products' ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                   👕 Products
                </button>
                <button
                  onClick={() => setTab('controls')}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold ${tab === 'controls' ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                   🎌️ Controls
                </button>
              </div>

              {/* Photo upload - always visible on desktop */}
              <div className={`${(tab !== 'photo' && tab !== 'products') ? 'hidden lg:block' : tab !== 'photo' ? 'hidden' : ''} mb-4`}>
                <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Your Photo</h3>
                <PhotoUpload onPhotoUploaded={(photo) => {
                  setUserPhoto(photo);
                  if (photo) setTab('products');
                }} />
              </div>

              {/* Products on desktop always, mobile only when tab selected */}
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

          {/* Center: Canvas */}
          <div className="lg:order-2 order-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleModeToggle}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      mode === 'smart'
                        ? 'bg-purple-500 text-white shadow-md shadow-purple-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {mode === 'smart' ? '🤖 Smart Mode' : '⚡ Simple Mode'}
                  </button>
                  {detecting && (
                    <span className="text-xs text-purple-600 flex items-center gap-1">
                      <span className="w-3 h-3 border border-purple-500 border-t-transparent rounded-full animate-spin inline-block" />
                      Detecting...
                    </span>
                  )}
                </div>

                {saveSuccess && (
                  <span className="text-green-600 font-medium text-sm flex items-center gap-1">
                    ✓ Look saved!
                  </span>
                )}
              </div>

              <CompositeCanvas
                ref={canvasRef}
                userPhoto={userPhoto?.imageUrl || userPhoto?.localPreview}
                selectedProduct={effectiveImageUrl ? { ...selectedProduct, imageUrl: effectiveImageUrl } : selectedProduct}
                mode={mode}
                position={position}
                scale={effectiveScale}
                opacity={opacity}
                onPositionChange={setPosition}
                onPersonDetected={handlePersonDetected}
              />

              {/* Controls below canvas */}
              {selectedProduct && (
                <div className="mt-4 space-y-3 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">Scale: {effectiveScale.toFixed(2)}x</label>
                      <input type="range" min="0.3" max="2.5" step="0.05"
                        value={scale} onChange={e => setScale(parseFloat(e.target.value))}
                        className="w-full accent-sky-500" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">Opacity: {Math.round(opacity * 100)}%</label>
                      <input type="range" min="0.2" max="1" step="0.05"
                        value={opacity} onChange={e => setOpacity(parseFloat(e.target.value))}
                        className="w-full accent-sky-500" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">X Position: {Math.round(position.x)}</label>
                      <input type="range" min="-200" max="600" step="5"
                        value={position.x} onChange={e => setPosition(p => ({ ...p, x: parseFloat(e.target.value) }))}
                        className="w-full accent-sky-500" />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        if (selectedProduct.recommendedPosition) {
                          const rp = selectedProduct.recommendedPosition;
                          setPosition({ x: rp.x * 600, y: rp.y * 700 });
                          setScale(rp.scale || 1.0);
                        }
                      }}
                      className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-sm transition-colors"
                    >
                      Reset Position
                    </button>
                    <button
                      onClick={handleSaveLook}
                      disabled={saving || !userPhoto}
                      className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-200 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm"
                    >
                      {saving ? '⏳ Saving...' : '💾 Save This Look'}
                    </button>
                  </div>
                </div>
              )}

              {!userPhoto && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-3 text-center text-sm text-blue-700">
                  <div>👆 Upload your photo on the left to start trying on clothes</div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Product details */}
          <div className="lgorder-3 order-3">
            {selectedProduct ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-20">
                <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center p-4 mb-4">
                  <img
                    src={effectiveImageUrl || selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentNode.innerHTML = '<span class="text-6xl">👕</span>';
                    }}
                  />
                </div>
                <h3 className="font-bold text-gray-900">{selectedProduct.name}</h3>
                <p className="text-sky-600 font-bold text-xl mt-0.5">{selectedProduct.price}</p>
                <p className="text-gray-500 text-sm mt-2">{selectedProduct.description}</p>

                {/* Variants */}
                {selectedProduct.variants?.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Size</p>
                      <div className="flex flex-wrap gap-1.5">
                        {[...new Set(selectedProduct.variants.map(v => v.size))].map(size => {
                          const variantForSize = selectedProduct.variants.find(v => v.size === size);
                          const isActive = selectedVariant?.size === size;
                          return (
                            <button
                              key={size}
                              onClick={() => setSelectedVariant(isActive ? null : variantForSize)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                                isActive ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Style</p>
                      <div className="flex flex-wrap gap-1.5">
                        {[...new Set(selectedProduct.variants.map(v => v.style))].map(style => {
                          const variantForStyle = selectedProduct.variants.find(v => v.style === style);
                          const isActive = selectedVariant?.style === style;
                          return (
                            <button
                              key={style}
                              onClick={() => setSelectedVariant(isActive ? null : variantForStyle)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                                isActive ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {style}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sizes */}
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

                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                  <a href="/gallery" className="block w-full text-center py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-sm font-semibold transition-colors">
                    View Saved Looks →
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center sticky top-20">
                <div className="text-4xl mb-3">👕</div>
                <p className="font-semibold text-gray-700">Select a product</p>
                <p className="text-sm text-gray-500 mt-1">Choose a clothing item from the left panel to see details and try it on</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
