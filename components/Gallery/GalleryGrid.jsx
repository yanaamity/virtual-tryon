import { useState } from 'react';
import LookCard from './LookCard';
import LookComparison from './LookComparison';

export default function GalleryGrid({ looks, onLooksChange }) {
  const [comparingLooks, setComparingLooks] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const handleDelete = (id) => { onLooksChange(looks.filter(l => l.id !== id)); setComparingLooks(prev => prev.filter(l => l.id !== id)); };
  const handleCompare = (look) => { setComparingLooks(prev => { const exists = prev.find(l => l.id === look.id); if (exists) return prev.filter(l => l.id !== look.id); if (prev.length >= 4) return prev; return [...prev, look]; }); };
  return (<div><LookComparison looks={comparingLooks} onClose={() => setShowComparison(false)} /></div>);
}
