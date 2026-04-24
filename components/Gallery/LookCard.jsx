import { useState } from 'react';
export default function LookCard({ look, onDelete, onCompare, isComparing }) {
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => { if (!confirm('Delete?')) return; setLoading(true); try { await fetch(`/api/looks/${look.id}`, { method: 'DELETE' }); onDelete(look.id); } catch (err) { console.error(err); } finally { setLoading(false); } };
  const handleDownload = () => { const url = look.compositeImageUrl; if (!url) return; if (url.startsWith('data:')) { const link = document.createElement('a'); link.href = url; link.download = `look-${look.id}.png`; link.click(); } else { window.open(url, '_blank'); } };
  return (<div className="bg-white rounded-2xl overflow-hidden shadow-sm border-2"><p className="font-semibold">{look.productName}</p><div className="flex gap-2"><button onClick={() => onCompare(look)}>{isComparing ? 'Selected' : 'Compare'}</button><button onClick={handleDownload}>Download</button><button onClick={handleDelete} disabled={loading}>X</button></div></div>);
}
