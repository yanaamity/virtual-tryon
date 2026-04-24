import { useState, useRef, useCallback } from 'react';
export default function PhotoUpload({ onPhotoUploaded }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const handleFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) { alert('Please select a valid image'); return; }
    if (file.size > 10 * 1024 * 1024) { alert('Image must be <10MB'); return; }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const b64 = e.target.result;
      setPreview(b64);
      try {
        const resp = await fetch('/api/upload-user-photo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageData: b64, fileName: file.name, mimeType: file.type }) });
        const d = await resp.json();
        onPhotoUploaded({ imageUrl: d.imageUrl || b64, imageId: d.imageId || 'local-'+Date.now(), localPreview: b64 });
      } catch (err) {
        onPhotoUploaded({ imageUrl: b64, imageId: 'local-'+Date.now(), localPreview: b64 });
      } finally { setUploading(false); }
    };
    reader.readAsDataURL(file);
  }, [onPhotoUploaded]);
  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); };
  return (
    <div className="w-full">
      {!preview ? (
        <div onDrop={handleDrop} onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer">
        <p className="text-lg font-semibold text-gray-700">Upload Your Photo</p>
        <p className="text-sm text-gray-500">Drag &amp; drop or click</p>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </div>
      ) : (<div className="relative"><img src={preview} alt="Your photo" className="w-full rounded-2xl object-cover max-h-80" /><button onClick={() => { setPreview(null); onPhotoUploaded(null); }} className="absolute top-2 right-2 bg-white rounded-full px-3 py-1">Change</button></div>)}
    </div>
  );
}
