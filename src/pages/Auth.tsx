import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import Login from '../components/Login';
import Register from '../components/Register';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n/I18nContext';

const Auth: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const { user } = useAuth();
  const { t } = useI18n();

  // If user is already logged in, redirect to home
  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-gray-900 mb-6">
          {t('appName')}
        </h1>
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {isLoginView ? (
            <Login onRegisterClick={() => setIsLoginView(false)} />
          ) : (
            <Register onLoginClick={() => setIsLoginView(true)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;