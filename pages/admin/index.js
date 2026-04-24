import { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLogin from '../../components/Admin/AdminLogin';
import ProductForm from '../../components/Admin/ProductForm';

export default function AdminPage() {
  const [token, setToken] = useState(null);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    if (saved) setToken(saved);
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchProducts();
    fetchStats();
  }, [token]);

  const fetchProducts = async () => {
    const res = await fetch('/api/products');
    const d = await res.json();
    if (d.success) setProducts(d.products);
  };

  const fetchStats = async () => {
    const res = await fetch('/api/admin/stats', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const d = await res.json();
    if (d.success) setStats(d.stats);
  };

  const handleDelete = async (productId) => {
    if (!confirm('Delete this product permanently?')) return;
    setDeleting(productId);
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      if (d.success) {
        setProducts(prev => prev.filter(p => p.id !== productId));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
    setStats(null);
    setProducts([]);
  };

  if (!token) return <AdminLogin onLogin={setToken} />;

  return (
    <>
      <Head><title>Admin Panel – TryOnAI</title></Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-500 mt-0.5">Manage products and view analytics</p>
          </div>
          <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 text-sm font-medium transition-colors">
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-8">
          {['dashboard', 'products'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                activeTab === tab ? 'bg-indigo-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab === 'dashboard' ? '📊 Dashboard' : '👕 Products'}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Products', value: stats.totalProducts, icon: '👕', color: 'bg-sky-50 text-sky-700' },
                { label: 'Total Looks', value: stats.totalLooks, icon: '💾', color: 'bg-purple-50 text-purple-700' },
                { label: 'Categories', value: stats.categories?.length || 0, icon: '📂', color: 'bg-green-50 text-green-700' },
                { label: 'Recent Looks', value: stats.recentLooks?.length || 0, icon: '📸', color: 'bg-orange-50 text-orange-700' },
              ].map(({ label, value, icon, color }) => (
                <div key={label} className={`rounded-2xl p-5 ${color} border border-current border-opacity-20`}>
                  <div className="text-3xl mb-2">{icon}</div>
                  <p className="text-3xl font-bold">{value}</p>
                  <p className="text-sm mt-1 opacity-80">{label}</p>
                </div>
              ))}
            </div>

            {stats.categories?.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Product Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {stats.categories.map(cat => (
                    <span key={cat} className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium capitalize">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {stats.recentLooks?.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Recent Looks</h3>
                <div className="space-y-3">
                  {stats.recentLooks.map(look => (
                    <div key={look.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      {look.compositeImageUrl && (
                        <img src={look.compositeImageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{look.productName}</p>
                        <p className="text-xs text-gray-500">{new Date(look.timestamp).toLocaleString()} · {look.visualizationMode} mode</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">{products.length} product{products.length !== 1 ? 's' : ''} total</p>
              <button
                onClick={() => { setShowAddForm(true); setEditingProduct(null); }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
              >
                + Add Product
              </button>
            </div>

            {/* Add/Edit Form Modal */}
            {(showAddForm || editingProduct) && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <ProductForm
                    product={editingProduct}
                    token={token}
                    onSaved={(p) => {
                      fetchProducts();
                      setShowAddForm(false);
                      setEditingProduct(null);
                    }}
                    onCancel={() => { setShowAddForm(false); setEditingProduct(null); }}
                  />
                </div>
              </div>
            )}

            {/* Products list */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Category</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Price</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Sizes</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-contain bg-gray-100 p-1"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.color}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs capitalize">{product.category}</span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-sky-600 hidden md:table-cell">{product.price}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">
                        {product.sizes?.join(', ')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setEditingProduct(product); setShowAddForm(false); }}
                            className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg font-medium transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={deleting === product.id}
                            className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                          >
                            {deleting === product.id ? '...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && (
                <div className="py-12 text-center text-gray-500">
                  <p className="text-lg font-medium">No products yet</p>
                  <p className="text-sm mt-1">Add your first product using the button above</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
