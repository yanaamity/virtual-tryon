export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-3">TryOnAI</h3>
            <p className="text-sm leading-relaxed">
              Virtual try-on powered by Canvas API. See how clothes look on you before you buy — no expensive AI APIs needed.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/tryon" className="hover:text-white transition-colors">Try On Clothes</a></li>
              <li><a href="/gallery" className="hover:text-white transition-colors">Saved Looks</a></li>
              <li><a href="/admin" className="hover:text-white transition-colors">Admin Panel</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Technology</h4>
            <ul className="space-y-2 text-sm">
              <li>React + Next.js</li>
              <li>HTML5 Canvas API</li>
              <li>TensorFlow.js COCO-SSD</li>
              <li>Vercel Deployment</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm">
          <p>© 2025 TryOnAI — Virtual Try-On MVP. Built with ❤️ on Vercel.</p>
        </div>
      </div>
    </footer>
  );
}
