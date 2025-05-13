'use client';

import { useState, useEffect } from 'react';
import UserProfile from '@/components/dashboard/UserProfile';
import StatisticsCards from '@/components/dashboard/StatisticsCards';
import ActivityChart from '@/components/dashboard/ActivityChart';
import Achievements from '@/components/dashboard/Achievements';

export default function Dashboard() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: Replace with actual API call
        fetchUserData();
    }, []);

  const fetchUserData = async () => {
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

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - User Profile */}
                    <div className="lg:col-span-1">
                        <UserProfile user={userData} />
                    </div>

                    {/* Right Column - Stats & Activities */}
                    <div className="lg:col-span-2 space-y-6">
                        <StatisticsCards user={userData} />
                        <ActivityChart />
                        <Achievements />
                    </div>
                </div>
            </div>
        </div>
    );
}