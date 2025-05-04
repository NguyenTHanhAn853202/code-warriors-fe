'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Editor from './editor';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function EditPage({ discussionId, onClose }) {
  const [postData, setPostData] = useState({
    title: '',
    content: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Fetch the discussion data when component mounts
  useEffect(() => {
    const fetchDiscussion = async () => {
      try {
        setIsLoading(true);
        // Using the API endpoint shown in the image
        const response = await axios.get(`http://localhost:8080/api/v1/discussion/comments/${discussionId}`, {
          withCredentials: true
        });

        if (response.data.status === 'success') {
          // Access the discussion data from the correct path in the response
          const discussionData = response.data.data.discussion;
          setPostData({
            title: discussionData.title || '',
            content: discussionData.content || ''
          });
        }
      } catch (err) {
        console.error('Error fetching discussion:', err);
        setError('Failed to load discussion. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (discussionId) {
      fetchDiscussion();
    }
  }, [discussionId]);

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
    setIsSubmitting(true);
    setError(null);

    if (!postData.title.trim()) {
      setError('Title is required');
      setIsSubmitting(false);
      return;
    }

    if (!postData.content.trim()) {
      setError('Content is required');
      setIsSubmitting(false);
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
      const response = await apiClient.put(`/discussion/${discussionId}`, postData);


      console.log('Discussion updated successfully:', response.data);
      toast.success('Discussion updated successfully');
            
      setTimeout(() => {
      }, 1500);
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error updating discussion:', error);

      // Display backend error message if available
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('An error occurred while updating the discussion. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading discussion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-800">Edit Discussion</h3>
          <button 
            type="button"
            className="text-gray-500 hover:text-gray-700 text-xl focus:outline-none"
            onClick={onClose}
          >
            ❌
          </button>
        </div>
        
        {/* Form - with overflow scroll */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto flex-grow">
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
          
          {/* TipTap Editor - with fixed height and scroll */}
          <div className="w-full">
            <label htmlFor="post-content" className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <div className="editor-container overflow-y-auto h-[300px] border border-gray-200 rounded-lg">
              <Editor 
                value={postData.content}
                onChange={handleContentChange}
              />
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-end space-x-2 mt-3">
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
                isSubmitting || !postData.title.trim() || !postData.content.trim()
                  ? 'opacity-70 cursor-not-allowed' 
                  : ''
              }`}
              disabled={isSubmitting || !postData.title.trim() || !postData.content.trim()}
            >
              {isSubmitting ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}