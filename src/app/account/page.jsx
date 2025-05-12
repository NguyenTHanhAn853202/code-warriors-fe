"use client"
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Edit, Save, X } from 'lucide-react';
import axios from 'axios';
import MyDiscussions from '../../components/discussion/myDiscussion';
import request from '@/utils/server';

const ProfilePage = () => {
  const [user, setUser] = useState({
    username: '',
    gender: '',
    location: '',
    birthday: '',
    summary: '',
    avatar: '/user_1.jpg',
    elo: 0,
  });

  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [base64Image, setBase64Image] = useState("");

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get('http://localhost:8080/api/v1/user/info', {
        withCredentials: true
      });

      if (response.data.status === 'success') {
        const userData = response.data.data;
        setUser({
          username: userData.username || '',
          gender: userData.gender || 'Select Gender',
          location: userData.location || 'Your location',
          birthday: formatBirthday(userData.birthday) || 'Your birthday',
          summary: userData.summary || 'Tell us about yourself',
          avatar: userData.avatarImage || '/user_1.jpg',
          elo: userData.elo,
        });
      }
    } catch (err) {
      console.error('Error fetching user info:', err);
      setError('Failed to load user information');
    } finally {
      setLoading(false);
    }
  };

  // Format birthday from MongoDB date to DD/MM/YYYY
  const formatBirthday = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Return original if invalid date
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

 // Modified parseBirthday function - Properly validates DD/MM/YYYY and returns ISO format
const parseBirthday = (formattedDate) => {
  if (!formattedDate || formattedDate === 'Your birthday') return null;
  
  try {
    // Split the date string by '/' and validate we have exactly 3 parts
    const parts = formattedDate.split('/');
    if (parts.length !== 3) {
      throw new Error('Invalid date format. Expected DD/MM/YYYY');
    }
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    
    // Validate day, month, year ranges
    if (isNaN(day) || day < 1 || day > 31) {
      throw new Error('Invalid day value');
    }
    if (isNaN(month) || month < 1 || month > 12) {
      throw new Error('Invalid month value');
    }
    if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
      throw new Error('Invalid year value');
    }
    
    // Create date with consistent format: YYYY-MM-DD
    // Note: month needs to be zero-indexed for JavaScript Date
    const date = new Date(year, month - 1, day);
    
    // Validate if we got a valid date (e.g., check for 31st of months with 30 days)
    if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
      throw new Error('Invalid date combination');
    }
    
    // Format to ISO string for MongoDB
    return date.toISOString();
  } catch (error) {
    console.error('Error parsing date:', error);
    alert('Invalid birthday format. Please use DD/MM/YYYY format.');
    return null;
  }
}

  const getRank = (elo) => {
    if (elo >= 5000) return { name: 'Platinum', color: 'bg-cyan-500' };
    if (elo >= 2000) return { name: 'Gold', color: 'bg-yellow-500' };
    if (elo >= 1000) return { name: 'Silver', color: 'bg-gray-400' };
    return { name: 'Bronze', color: 'bg-amber-700' };
  };

  const getProgressToNextRank = (elo) => {
    if (elo >= 5000) return 100; // Max rank
    if (elo >= 2000) return ((elo - 2000) / 3000) * 100; // Progress to Platinum
    if (elo >= 1000) return ((elo - 1000) / 1000) * 100; // Progress to Gold
    return (elo / 1000) * 100; // Progress to Silver
  };

  const getNextRank = (elo) => {
    if (elo >= 5000) return 'Max Rank';
    if (elo >= 2000) return 'Platinum';
    if (elo >= 1000) return 'Gold';
    return 'Silver';
  };

  const getPointsToNextRank = (elo) => {
    if (elo >= 5000) return 0;
    if (elo >= 2000) return 5000 - elo;
    if (elo >= 1000) return 2000 - elo;
    return 1000 - elo;
  };

  const handleEdit = (field, value) => {
    setEditingField(field);
    setTempValue(value);
  };

  const handleSave = async (field) => {
    try {
      let valueToSend = tempValue;
      
      // Convert birthday format before sending to server
      if (field === 'birthday') {
        valueToSend = parseBirthday(tempValue);
        
        // If parseBirthday returns null, stop the submission
        if (valueToSend === null) {
          return;
        }
      }
      
      let updateData = { [field]: valueToSend };
      
      const response = await axios.patch(
        'http://localhost:8080/api/v1/user/updateProfile',
        updateData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (response.data.status === 'success') {
        // For birthday, we store the formatted date in the UI state
        if (field === 'birthday') {
          setUser(prev => ({
            ...prev,
            [field]: tempValue // Save the formatted date (DD/MM/YYYY) for display
          }));
        } else {
          setUser(prev => ({
            ...prev,
            [field]: tempValue
          }));
        }
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
  }

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
    } else // Trong phần renderFieldInput, thay đổi xử lý cho trường birthday
    if (field === 'birthday') {
      return (
        <input 
          type="text" 
          value={tempValue} 
          onChange={(e) => {
            // Chỉ cho phép nhập số và dấu /
            const newValue = e.target.value.replace(/[^\d/]/g, '');
            
            // Tự động thêm dấu / sau khi nhập 2 chữ số ngày hoặc tháng
            if (newValue.length === 2 && tempValue.length === 1 && !newValue.includes('/')) {
              setTempValue(newValue + '/');
            } else if (newValue.length === 5 && tempValue.length === 4 && newValue.charAt(2) === '/' && !newValue.includes('/', 3)) {
              setTempValue(newValue + '/');
            } else {
              // Giới hạn tối đa 10 ký tự (DD/MM/YYYY)
              if (newValue.length <= 10) {
                setTempValue(newValue);
              }
            }
          }}
          placeholder="DD/MM/YYYY"
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
    <div className="flex flex-row items-center justify-between py-3 border-b border-gray-200">
      <div className="font-bold text-gray-700 ml-10 w-1/">{label}:</div>
      <div className="flex items-center gap-2 ml-5 w-9/10">
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
            <span className="text-gray-500 flex-grow">{value}</span>
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

  const rank = getRank(user.elo);
  const progress = getProgressToNextRank(user.elo);
  const nextRank = getNextRank(user.elo);
  const pointsToNext = getPointsToNextRank(user.elo);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  
  

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await convertToBase64(file);
      setBase64Image(base64); 
      await request.post("/user/update-image",{
        image:base64
      })
      localStorage.setItem("avatar",base64)
    }
  };


   const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Profile Header with Avatar */}
        <div className="bg-white rounded-md shadow-sm p-6 mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
              <Image 
                src={base64Image?base64Image : localStorage.getItem("avatar")} 
                alt="Profile avatar"
                width={128}
                height={128}
                className="object-cover"
              />
            </div>
            <input onChange={handleImageChange} type='file' id='image-user' className='hidden' />
            <label htmlFor="image-user" className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600">
              <Edit size={16} />
            </label>
          </div>
          
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold">{user.username}</h1>
              <span className={`px-3 py-1 text-sm font-semibold text-white rounded-full ${rank.color}`}>
                {rank.name}
              </span>
            </div>
            
            <p className="text-gray-500 mt-1">{user.summary}</p>
            
            <div className="mt-4">
              <div className="flex justify-between mb-1 text-sm">
                <span className="font-medium">ELO Points: {user.elo}</span>
                {nextRank !== 'Max Rank' && (
                  <span className="text-gray-600">{pointsToNext} points to {nextRank}</span>
                )}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${rank.color}`} 
                  style={{width: `${progress}%`}}
                ></div>
              </div>
            </div>
            
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
        
        {/* Rank Information */}
        <Section title="Rank Information">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-lg border border-amber-700">
              <p className="text-sm text-gray-500">Bronze</p>
              <p className="font-medium">0-999 points</p>
            </div>
            <div className="p-3 rounded-lg border border-gray-400">
              <p className="text-sm text-gray-500">Silver</p>
              <p className="font-medium">1000-1999 points</p>
            </div>
            <div className="p-3 rounded-lg border border-yellow-500">
              <p className="text-sm text-gray-500">Gold</p>
              <p className="font-medium">2000-4999 points</p>
            </div>
            <div className="p-3 rounded-lg border border-cyan-500">
              <p className="text-sm text-gray-500">Platinum</p>
              <p className="font-medium">5000+ points</p>
            </div>
          </div>
        </Section>
        
        {/* Basic Info Section */}
        <Section title="Basic Info">
          <InfoItem label="Name" field="username" value={user.username} editable={false} />
          <InfoItem label="Gender" field="gender" value={user.gender} />
          <InfoItem label="Location" field="location" value={user.location} />
          <InfoItem label="Birthday" field="birthday" value={user.birthday} />
          <InfoItem label="Summary" field="summary" value={user.summary} />
        </Section>
        
        {/* My Discussions Section */}
        <Section title="My Discussions">
          <MyDiscussions />
        </Section>
      </div>
    </div>
  );
};

export default ProfilePage;