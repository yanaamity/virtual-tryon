import { useState, useRef, useCallback } from 'react';

export default function PhotoUpload({ onPhotoUploaded }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG or PNG)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be smaller than 10MB');
      return;
    }

    setUploading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target.result;
      setPreview(base64Data);

      try {
        const response = await fetch('/api/upload-user-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageData: base64Data,
            fileName: file.name,
            mimeType: file.type,
          }),
        });

        const data = await response.json();
        if (data.success) {
          onPhotoUploaded({
            imageUrl: data.imageUrl || base64Data,
            imageId: data.imageId,
            localPreview: base64Data,
          });
        } else {
          // Fallback: use local base64 directly
          onPhotoUploaded({
            imageUrl: base64Data,
            imageId: 'local-' + Date.now(),
            localPreview: base64Data,
          });
        }
      } catch (err) {
        // Network error fallback - use base64
        onPhotoUploaded({
          imageUrl: base64Data,
          imageId: 'local-' + Date.now(),
          localPreview: base64Data,
        });
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  }, [onPhotoUploaded]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  return (
    <div className="w-full">
      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-sky-500 bg-sky-50 scale-105'
              : 'border-gray-300 hover:border-sky-400 hover:bg-sky-50/50'
          }`}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-700">Upload Your Photo</p>
              <p className="text-sm text-gray-500 mt-1">
                Drag & drop or click to browse
              </p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG • Max 10MB • Full-body photo recommended</p>
            </div>
            <button
              type="button"
              className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2.5 rounded-full font-medium transition-colors shadow-sm"
            >
              Choose Photo
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="relative">
          <img
            src={preview}
            alt="Your photo"
            className="w-full rounded-2xl object-cover max-h-80 shadow-md"
          />
          <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <button
              onClick={() => {
                setPreview(null);
                onPhotoUploaded(null);
              }}
              className="bg-white text-gray-800 px-5 py-2.5 rounded-full font-medium hover:bg-gray-100 transition-colors"
            >
              Change Photo
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
              <div className="text-white text-center">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm font-medium">Uploading...</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
