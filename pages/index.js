import Link from 'next/link';
import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(d => {
      if (d.success) setProducts(d.products.slice(0, 4));
    }).catch(() => {});
  }, []);

  return (
    <>
      <Head>
        <title>TryOnAI – Virtual Try-On Experience</title>
        <meta name="description" content="Virtually try on clothes before you buy. Upload your photo, select a clothing item, and see how it looks on you." />
      </Head>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-white to-indigo-50">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-sky-100 text-sky-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
                ✨ No AI API Costs — 100% Canvas-Powered
              </span>
              <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
                Try On Clothes<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-600">
                  Virtually
                </span>
              </h1>
              <p className="text-xl text-gray-600 mt-6 leading-relaxed">
                Upload your photo, pick any clothing item, and see exactly how it looks on you — instantly, for free, with zero AI API calls.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-10">
                <Link href="/tryon" className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-sky-200 hover:shadow-xl hover:-translate-y-0.5 text-center">
                  Start Try-On →
                </Link>
                <Link href="/gallery" className="bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 px-8 py-4 rounded-2xl font-bold text-lg transition-all text-center">
                  View Gallery
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-10 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">✅ No account needed</span>
                <span className="flex items-center gap-1.5">✅ Instant preview</span>
                <span className="flex items-center gap-1.5">✅ Save & compare looks</span>
              </div>
            </div>
            
            {/* Demo visual */}
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100">
                <div className="grid grid-cols-2 gap-3">
                  {['👕', '🧥', '👗', '🧣'].map((emoji, i) => (
                    <div key={i} className={`aspect-square rounded-2xl flex items-center justify-center text-5xl ${
                      ['bg-sky-50', 'bg-indigo-50', 'bg-purple-50', 'bg-pink-50'][i]
                    }`}>
                      {emoji}
                    </div>
                  ))}
                </div>
                <div className="mt-4 bg-sky-50 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center text-white font-bold">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Look Saved!</p>
                      <p className="text-xs text-gray-500">Classic Blue T-Shirt — Smart Mode</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg rotate-12">
                FREE!
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-gray-900">How It Works</h2>
          <p className="text-gray-500 mt-3 text-lg">Three simple steps to your perfect look</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '01', icon: '📸', title: 'Upload Your Photo', desc: 'Take or upload a full-body photo. Works best with a plain background.' },
            { step: '02', icon: '👕', title: 'Pick a Clothing Item', desc: 'Browse our catalog and select any item you want to try on.' },
            { step: '03', icon: '✨', title: 'See & Save Your Look', desc: 'Instantly see how it looks. Adjust position, scale, and opacity. Save for later.' },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} className="text-center p-8 bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="text-5xl mb-4">{icon}</div>
              <span className="text-xs font-bold text-sky-500 tracking-wider uppercase">Step {step}</span>
              <h3 className="text-xl font-bold text-gray-900 mt-2 mb-3">{title}</h3>
              <p className="text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-white">Powerful Features</h2>
            <p className="text-gray-400 mt-3 text-lg">Everything you need for the perfect virtual try-on</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '⚡', title: 'Simple Overlay Mode', desc: 'Drag, scale, and adjust opacity with precision sliders.' },
              { icon: '🤖', title: 'Smart Positioning', desc: 'AI-powered body detection using TensorFlow.js for auto-placement.' },
              { icon: '💾', title: 'Save Looks', desc: 'Save your favorite combinations as PNG images with metadata.' },
              { icon: '⚖️', title: 'Compare Looks', desc: 'Place up to 4 looks side-by-side to find your favourite.' },
              { icon: '🎛️', title: 'Fine Controls', desc: 'Per-product fit variants: size, color, and style adjustments.' },
              { icon: '🔧', title: 'Admin Panel', desc: 'Full CRUD management for products with image uploads.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-gray-800 rounded-2xl p-6 hover:bg-gray-750 transition-colors">
                <span className="text-3xl">{icon}</span>
                <h3 className="text-white font-bold text-lg mt-3 mb-2">{title}</h3>
                <p className="text-gray-400 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {products.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
              <p className="text-gray-500 mt-1">Click any item to start trying it on</p>
            </div>
            <Link href="/tryon" className="text-sky-500 hover:text-sky-700 font-semibold">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map(p => (
              <Link key={p.id} href="/tryon" className="block">
                <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-sky-200 hover:shadow-lg transition-all group">
                  <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 group-hover:scale-105 transition-transform">
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-contain"
                      onError={(e) => { e.target.outerHTML = `<span class="text-5xl">${p.category === 'dresses' ? '👗' : p.category === 'outerwear' ? '🧥' : '👕'}</span>`; }}
                    />
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                    <p className="text-sky-600 font-bold mt-0.5">{p.price}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-gradient-to-r from-sky-500 to-indigo-600 py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white">Ready to Try On?</h2>
          <p className="text-sky-100 text-xl mt-4">Upload your photo and start exploring looks in seconds.</p>
          <Link href="/tryon" className="inline-block mt-8 bg-white text-sky-600 hover:bg-sky-50 px-10 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl">
            Start for Free →
          </Link>
        </div>
      </section>
    </>
  );
}
