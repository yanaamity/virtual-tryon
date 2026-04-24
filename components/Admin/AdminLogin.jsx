import { useState } from 'react';

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => { e.preventDefault(); setLoading(true); setError(''); try { const res = await fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${password}` } }); if (res.ok) { localStorage.setItem('adminToken', password); onLogin(password); } else { setError('Invalid password'); } } catch(err) { setError('Connection error'); } finally { setLoading(false); } }; return (<div><form onSubmit={handleSubmit}><input type="password" value={password} onChange={e => setPassword(e.target.value)} /><button type="submit">Login</button></form></div>); }
