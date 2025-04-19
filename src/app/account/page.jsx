"use client"
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Edit, Save, X } from 'lucide-react';
import axios from 'axios';

const ProfilePage = () => {
  const [user, setUser] = useState({
    username: '',
    gender: '',
    location: '',
    birthday: '',
    summary: '',
    avatar: '/user_1.jpg',
  });

  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      
      // Using axios with credentials to send cookies
      const response = await axios.get('http://localhost:8080/api/v1/user/info', {
        withCredentials: true  // This ensures cookies are sent with the request
      });

      if (response.data.status === 'success') {
        const userData = response.data.data;
        setUser({
          username: userData.username || '',
          gender: userData.gender || 'Select Gender',
          location: userData.location || 'Your location',
          birthday: userData.birthday || 'Your birthday',
          summary: userData.summary || 'Tell us about yourself',
          avatar: userData.avatarImage || '/user_1.jpg',
        });
      }
    } catch (err) {
      console.error('Error fetching user info:', err);
      setError('Failed to load user information');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (field, value) => {
    setEditingField(field);
    setTempValue(value);
  };

  const handleSave = async (field) => {
    try {
      let updateData = { [field]: tempValue };
      
      const response = await axios.patch(
        'http://localhost:8080/api/v1/user/updateProfile',
        updateData,
        {
          withCredentials: true,  // Send cookies with the request
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (response.data.status === 'success') {
        setUser(prev => ({
          ...prev,
          [field]: tempValue
        }));
        setEditingField(null);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      
      if (err.response && err.response.data && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        alert('Failed to update profile. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    setEditingField(null);
  };

  const renderFieldInput = (field, value) => {
    if (field === 'gender') {
      return (
        <select
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm flex-grow"
          autoFocus
        >
          <option value="">Select gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      );
    } else if (field === 'birthday') {
      return (
        <input 
          type="text" 
          value={tempValue} 
          onChange={(e) => setTempValue(e.target.value)}
          placeholder="DD/MM/YYYY"
          pattern="\d{2}/\d{2}/\d{4}"
          className="border border-gray-300 rounded-md px-3 py-2 text-sm flex-grow"
          autoFocus
        />
      );
    } else {
      return (
        <input 
          type="text" 
          value={tempValue} 
          onChange={(e) => setTempValue(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm flex-grow"
          autoFocus
        />
      );
    }
  };

  const InfoItem = ({ label, field, value, editable = true }) => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-gray-200">
      <div className="font-medium text-gray-700 mb-2 sm:mb-0">{label}</div>
      <div className="flex items-center gap-2 w-full sm:w-5/6 justify-end">
        {editingField === field ? (
          <div className="flex items-center gap-2 w-full">
            {renderFieldInput(field, value)}
            <button 
              onClick={() => handleSave(field)} 
              className="text-green-500 hover:text-green-700 p-2"
            >
              <Save size={18} />
            </button>
            <button 
              onClick={handleCancel} 
              className="text-red-500 hover:text-red-700 p-2"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <>
            <span className="text-gray-500">{value}</span>
            {editable && (
              <button 
                onClick={() => handleEdit(field, value)} 
                className="text-blue-500 hover:text-blue-700 ml-2"
              >
                <span className="flex items-center gap-1">
                  <Edit size={16} />
                  <span>Edit</span>
                </span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );

  const Section = ({ title, children }) => (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <div className="bg-white rounded-md shadow-sm p-4">
        {children}
      </div>
    </div>
  );

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Profile Header with Avatar */}
        <div className="bg-white rounded-md shadow-sm p-6 mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
              <Image 
                src={user.avatar} 
                alt="Profile avatar"
                width={128}
                height={128}
                className="object-cover"
              />
            </div>
            <button className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600">
              <Edit size={16} />
            </button>
          </div>
          
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold">{user.username}</h1>
            <p className="text-gray-500 mt-1">{user.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
              <a
                href="/account/password/set"
                className="inline-flex justify-center py-1.5 px-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Change Password
              </a>
            </div>
          </div>
        </div>
        
        {/* Basic Info Section */}
        <Section title="Basic Info">
          <InfoItem label="Name" field="username" value={user.username} editable={false} />
          <InfoItem label="Gender" field="gender" value={user.gender} />
          <InfoItem label="Location" field="location" value={user.location} />
          <InfoItem label="Birthday" field="birthday" value={user.birthday} />
          <InfoItem label="Summary" field="summary" value={user.summary} />
        </Section>
      </div>
    </div>
  );
};

export default ProfilePage;