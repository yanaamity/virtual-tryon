import Link from 'next/link';
import { useState } from 'react';
export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900">TryOn<span className="text-sky-500">AI</span></span>
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-600 hover:text-sky-600 font-medium">Home</Link>
            <Link href="/tryon" className="text-gray-600 hover:text-sky-600 font-medium">Try On</Link>
            <Link href="/gallery" className="text-gray-600 hover:text-sky-600 font-medium">Gallery</Link>
            <Link href="/tryon" className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2 rounded-full font-semibold">Start Try-On</Link>
          </nav>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-600">Menu</button>
        </div>
        {mobileOpen && (<div className="md:hidden py-3 border-t space-y-2"><Link href="/">Home</Link><Link href="/tryon">Try On</Link><Link href="/gallery">Gallery</Link></div>)}
      </div>
    </header>
  );
}
