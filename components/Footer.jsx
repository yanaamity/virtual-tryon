export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div><h3 className="text-white font-bold text-lg mb-3">TryOnAI</h3><p className="text-sm leading-relaxed">Virtual try-on powered by Canvas API.</p></div>
          <div><h4 className="text-white font-semibold mb-3">Quick Links</h4><ul className="space-y-2 text-sm"><li><a href="/tryon">Try On</a></li><li><a href="/gallery">Gallery</a></li></ul></div>
          <div><h4 className="text-white font-semibold mb-3">Tech</h4><ul className="space-y-2 text-sm"><li>React + Next.js</li><li>Canvas API</li><li>TensorFlow.js</li></ul></div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm"><p>© 2025 TryOnAI</p></div>
      </div>
    </footer>
  );
}
