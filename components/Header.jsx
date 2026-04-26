import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">TryOn<span className="text-sky-500">AI</span></span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-600 hover:text-sky-600 font-medium transition-colors">Home</Link>
            <Link href="/tryon" className="text-gray-600 hover:text-sky-600 font-medium transition-colors">Try On</Link>
            <Link href="/gallery" className="text-gray-600 hover:text-sky-600 font-medium transition-colors">Gallery</Link>
            <Link href="/tryon" className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2 rounded-full font-semibold transition-colors shadow-sm">
              Start Try-On
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-sky-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden py-3 border-t border-gray-100 space-y-2">
            <Link href="/" className="block py-2 px-3 text-gray-600 hover:text-sky-600 font-medium">Home</Link>
            <Link href="/tryon" className="block py-2 px-3 text-gray-600 hover:text-sky-600 font-medium">Try On</Link>
            <Link href="/gallery" className="block py-2 px-3 text-gray-600 hover:text-sky-600 font-medium">Gallery</Link>
          </div>
        )}
      </div>
    </header>
  );
}
