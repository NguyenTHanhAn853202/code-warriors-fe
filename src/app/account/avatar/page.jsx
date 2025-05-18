import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Camera, X } from 'lucide-react';

export default function AvatarUploadForm({ onSave, onCancel }) {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  // Get initial avatar from localStorage when component mounts
  useEffect(() => {
    const storedAvatar = localStorage.getItem("avatar");
    if (storedAvatar) {
      setPreviewUrl(storedAvatar);
    }
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChooseImage = () => {
    fileInputRef.current.click();
  };

  const handleSave = () => {
    if (image && typeof onSave === 'function') {
      onSave(image);
    }
    window.location.href = '/account';
  };

  const handleCancel = () => {
    setImage(null);
    if (typeof onCancel === 'function') {
      onCancel();
    }
  };

  const handleReset = () => {
    setImage(null);
    setPreviewUrl(localStorage.getItem("avatar") || null);
  };

  return (
    <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Upload a New Avatar</h2>
          <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="w-48 h-48 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 mb-4 flex items-center justify-center">
            {previewUrl ? (
              <div className="relative w-full h-full">
                <Image 
                  src={previewUrl}
                  alt="Avatar preview"
                  layout="fill"
                  objectFit="cover"
                />
              </div>
            ) : (
              <Camera size={48} className="text-gray-400" />
            )}
          </div>
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
        />
        
        <div className="flex flex-col gap-3">
          <button
            onClick={handleChooseImage}
            className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-700">Choose Image...</span>
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!image}
              className={`flex-1 py-2 px-4 rounded-md text-white flex items-center justify-center gap-2 ${
                image ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-300 cursor-not-allowed'
              } transition-colors`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              <span>Save</span>
            </button>
            
            <button
              onClick={handleCancel}
              className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}