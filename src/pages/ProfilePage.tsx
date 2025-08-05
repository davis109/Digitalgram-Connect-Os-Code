import React from 'react';
import { Navigate } from 'react-router-dom';
import Profile from '../components/Profile';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Profile />
      </div>
    </div>
  );
};

export default ProfilePage;