'use client';
import { useState, useEffect } from 'react';

export default function PostForm({ onClose }) {
  const [postContent, setPostContent] = useState('');
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isPosting, setIsPosting] = useState(false);

  // Focus textarea khi form mở
  useEffect(() => {
    const textarea = document.getElementById('post-textarea');
    if (textarea) {
      textarea.focus();
    }
  }, []);

  // Xử lý khi người dùng thêm hình ảnh
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setImages([...images, ...selectedFiles]);
    
    // Tạo URL preview cho các hình ảnh
    const newPreviewUrls = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newPreviewUrls]);
  };

  // Xóa hình ảnh khỏi danh sách
  const removeImage = (index) => {
    const updatedImages = [...images];
    const updatedPreviews = [...previewUrls];
    
    // Revoke URL để tránh rò rỉ bộ nhớ
    URL.revokeObjectURL(previewUrls[index]);
    
    updatedImages.splice(index, 1);
    updatedPreviews.splice(index, 1);
    
    setImages(updatedImages);
    setPreviewUrls(updatedPreviews);
  };

  // Xử lý khi người dùng đăng bài
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPosting(true);

    try {
      // Chuẩn bị dữ liệu gửi lên API
      const formData = new FormData();
      formData.append('content', postContent);
      
      // Thêm các hình ảnh vào formData
      images.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });
      
      // Giả lập API call
      // Trong thực tế, bạn sẽ thay thế bằng API call thực:
      // const response = await fetch('/api/posts', {
      //   method: 'POST',
      //   body: formData
      // });
      // const data = await response.json();
      
      // Mô phỏng API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Đăng bài thành công với nội dung:', postContent);
      console.log('Số lượng hình ảnh đính kèm:', images.length);
      
      // Revoke tất cả các URLs để tránh rò rỉ bộ nhớ
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      
      // Reset form
      setPostContent('');
      setImages([]);
      setPreviewUrls([]);
      
      // Đóng form sau khi đăng bài thành công
      onClose();
    } catch (error) {
      console.error('Lỗi khi đăng bài:', error);
      alert('Có lỗi xảy ra khi đăng bài. Vui lòng thử lại.');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/10 backdrop-blur-md p-4 rounded-lg flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h3 className="text-lg font-semibold text-gray-800">Post Story</h3>
          <button 
            type="button"
            className="text-gray-500 hover:text-gray-700 text-xl focus:outline-none"
            onClick={onClose}
          >
            ❌
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4">
          {/* Textarea */}
          <div className="mb-4">
            <textarea
              id="post-textarea"
              className="w-full border border-gray-200 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="8"
              placeholder="What are you thinking?"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
            ></textarea>
          </div>
          
          {/* Preview hình ảnh */}
          {previewUrls.length > 0 && (
            <div className="mb-4">
              <div className="grid grid-cols-3 gap-2">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
                    <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 focus:outline-none"
                      onClick={() => removeImage(index)}
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Divider */}
          <div className="border-t border-gray-200 my-4"></div>
          
          {/* Actions */}
          <div className="flex items-center justify-between">
            <div>
              {/* Button thêm hình */}
              <label className="flex items-center space-x-2 cursor-pointer px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <span className="text-xl">🖼️</span>
                <span className="text-sm font-medium">Image</span>
              </label>
            </div>
            
            <div className="flex space-x-2">
              {/* Nút hủy */}
              <button
                type="button"
                className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
                onClick={onClose}
              >
                Cancel
              </button>
              
              {/* Button đăng bài */}
              <button
                type="submit"
                className={`px-4 py-2 rounded-md bg-blue-500 text-white font-medium hover:bg-green-600 transition ${
                  isPosting || (postContent.trim() === '' && images.length === 0) 
                    ? 'opacity-70 cursor-not-allowed' 
                    : ''
                }`}
                disabled={isPosting || (postContent.trim() === '' && images.length === 0)}
              >
                {isPosting ? 'Waiting Post ...' : 'Post'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}