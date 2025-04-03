"use client"
import React, { useState } from 'react';
import Image from 'next/image';
import { Edit, Save, X } from 'lucide-react';

const ProfilePage = () => {
  // Sample user data - in a real app this would come from an API or context
  const [user, setUser] = useState({
    name: 'GR8oGdugB',
    gender: 'Not provided',
    location: 'Your location',
    birthday: 'Your birthday',
    summary: 'Tell us about yourself (interests, experience, etc.)',
    website: 'Your blog, portfolio, etc.',
    github: 'Your Github username or url',
    avatar: '/user_1.jpg', // Placeholder avatar - replace with actual avatar path
    work: 'Add a workplace',
    education: 'Add a school',
    skills: 'Your Skills'
  });

  // Track which fields are currently being edited
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState("");

  const handleEdit = (field, value) => {
    setEditingField(field);
    setTempValue(value);
  };

  const handleSave = (field) => {
    setUser({...user, [field]: tempValue});
    setEditingField(null);
  };

  const handleCancel = () => {
    setEditingField(null);
  };

  const InfoItem = ({ label, field, value, editable = true }) => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-gray-200">
      <div className="font-medium text-gray-700 mb-2 sm:mb-0">{label}</div>
      <div className="flex items-center gap-2 w-full sm:w-5/6 justify-end">
        {editingField === field ? (
          <div className="flex items-center gap-2 w-full">
            <input 
              type="text" 
              value={tempValue} 
              onChange={(e) => setTempValue(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm flex-grow"
            />
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
            <h1 className="text-2xl font-bold">{user.name}</h1>
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
          <InfoItem label="Name" field="name" value={user.name} />
          <InfoItem label="Gender" field="gender" value={user.gender} />
          <InfoItem label="Location" field="location" value={user.location} />
          <InfoItem label="Birthday" field="birthday" value={user.birthday} />
          <InfoItem label="Summary" field="summary" value={user.summary} />
          <InfoItem label="Website" field="website" value={user.website} />
          <InfoItem label="Github" field="github" value={user.github} />
        </Section>
        
        {/* Experience Section */}
        <Section title="Experience">
          <InfoItem label="Work" field="work" value={user.work} />
          <InfoItem label="Education" field="education" value={user.education} />
        </Section>
        
        {/* Skills Section */}
        <Section title="Skills">
          <InfoItem label="Technical Skills" field="skills" value={user.skills} />
        </Section>
      </div>
    </div>
  );
};

export default ProfilePage;