import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n/I18nContext';

const Profile: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const { t, changeLanguage } = useI18n();
  
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (user) {
      setName(user.name);
      setLanguage(user.language || 'en');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (!name.trim()) {
      setMessage({ text: t('profile.errorNameRequired'), type: 'error' });
      return;
    }

    try {
      setIsSubmitting(true);
      await updateProfile({ name, language });
      changeLanguage(language);
      setMessage({ text: t('profile.updateSuccess'), type: 'success' });
    } catch (error: any) {
      setMessage({ text: error.message || t('profile.updateError'), type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm(t('profile.confirmLogout'))) {
      logout();
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        {t('profile.title')}
      </h2>

      {message.text && (
        <div 
          className={`px-4 py-3 rounded mb-4 ${message.type === 'error' ? 'bg-red-100 border border-red-400 text-red-700' : 'bg-green-100 border border-green-400 text-green-700'}`}
        role="alert"
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
            {t('profile.email')}
          </label>
          <input
            type="email"
            id="email"
            value={user.email}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
            disabled
          />
          <p className="text-sm text-gray-500 mt-1">{t('profile.emailCannotChange')}</p>
        </div>

        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
            {t('profile.name')}
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="language" className="block text-gray-700 font-medium mb-2">
            {t('profile.preferredLanguage')}
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            <option value="en">{t('languages.english')}</option>
            <option value="hi">{t('languages.hindi')}</option>
          </select>
        </div>

        <div className="flex flex-col space-y-4">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-300 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('profile.updating')}
              </span>
            ) : (
              t('profile.updateButton')
            )}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-300"
            disabled={isSubmitting}
          >
            {t('profile.logoutButton')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;