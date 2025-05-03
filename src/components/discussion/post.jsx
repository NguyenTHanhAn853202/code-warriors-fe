'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Editor from './editor';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function Post({ onClose, onSuccess }) {
  const [postData, setPostData] = useState({
    title: '',
    content: ''
  });
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState(null);
  const router= useRouter();
  // Focus on title input when form opens
  useEffect(() => {
    const titleInput = document.getElementById('post-title');
    if (titleInput) {
      titleInput.focus();
    }
  }, []);

  const handleTitleChange = (e) => {
    setPostData(prev => ({
      ...prev,
      title: e.target.value
    }));
  };

  // Handle content change from Editor
  const handleContentChange = (html) => {
    setPostData(prev => ({
      ...prev,
      content: html
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPosting(true);
    setError(null);

    if (!postData.title.trim()) {
      setError('Title is required');
      setIsPosting(false);
      return;
    }

    if (!postData.content.trim()) {
      setError('Content is required');
      setIsPosting(false);
      return;
    }

    try {
      const apiClient = axios.create({
        baseURL: 'http://localhost:8080/api/v1',
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true
      });
      const response = await apiClient.post('/discussion', postData);

      // Handle success
      console.log('Post created successfully:', response.data);
      toast.success('Posted successfully');
            
      setTimeout(() => {
        router.push('/home');
        window.location.href = '/home';
      }, 1500);

      // Reset form
      setPostData({
        title: '',
        content: ''
      });

      // Notify parent component of success
      if (onSuccess) {
        onSuccess(response.data);
      }

      // Close form
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);

      // Display backend error message if available
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('An error occurred while creating the post. Please try again.');
      }
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h3 className="text-lg font-semibold text-gray-800">Create Discussion</h3>
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
          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
              {error}
            </div>
          )}

          {/* Title input */}
          <div className="mb-4">
            <label htmlFor="post-title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              id="post-title"
              type="text"
              className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter discussion title"
              value={postData.title}
              onChange={handleTitleChange}
              required
            />
          </div>
          
          {/* TipTap Editor */}
          <div className="w-full">
            <label htmlFor="post-content" className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
              <div className="h-full">
                <Editor 
                  value={postData.content}
                  onChange={handleContentChange}
                />
              </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
              onClick={onClose}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className={`px-4 py-2 rounded-md bg-blue-500 text-white font-medium hover:bg-blue-600 transition ${
                isPosting || !postData.title.trim() || !postData.content.trim()
                  ? 'opacity-70 cursor-not-allowed' 
                  : ''
              }`}
              disabled={isPosting || !postData.title.trim() || !postData.content.trim()}
            >
              {isPosting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
