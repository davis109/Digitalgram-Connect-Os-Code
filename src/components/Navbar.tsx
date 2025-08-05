import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import homeIcon from '../assets/home-icon.svg';
import chatIcon from '../assets/chat-icon.svg';
import profileIcon from '../assets/profile-icon.svg';
import loginIcon from '../assets/login-icon.svg';
import logo from '../assets/logo.svg';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const { t } = useI18n();
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-blue-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <img src={logo} alt="Logo" className="h-8 w-auto" />
              </Link>
            </div>
            
            {/* Desktop menu */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`${isActive('/') ? 'border-white text-white' : 'border-transparent text-blue-100 hover:border-blue-300 hover:text-white'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                <img src={homeIcon} alt="Home" className="h-5 w-5 mr-1" />
                {t('nav.home')}
              </Link>
              
              {user && (
                <>
                  <Link
                    to="/chat"
                    className={`${isActive('/chat') ? 'border-white text-white' : 'border-transparent text-blue-100 hover:border-blue-300 hover:text-white'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    <img src={chatIcon} alt="Chat" className="h-5 w-5 mr-1" />
                    {t('nav.chat')}
                  </Link>
                  <Link
                    to="/profile"
                    className={`${isActive('/profile') ? 'border-white text-white' : 'border-transparent text-blue-100 hover:border-blue-300 hover:text-white'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    <img src={profileIcon} alt="Profile" className="h-5 w-5 mr-1" />
                    {t('nav.profile')}
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className={`${isActive('/admin') ? 'border-white text-white' : 'border-transparent text-blue-100 hover:border-blue-300 hover:text-white'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      {t('nav.admin')}
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
          
          {/* Auth buttons */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="text-white">
                {user.name}
              </div>
            ) : (
              <Link
                to="/auth"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
              >
                <img src={loginIcon} alt="Login" className="h-5 w-5 mr-1" />
                {t('nav.login')}
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-blue-100 hover:text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-expanded="false"
            >
              <span className="sr-only">{t('nav.openMenu')}</span>
              {/* Icon when menu is closed */}
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Icon when menu is open */}
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            to="/"
            className={`${isActive('/') ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-700 hover:text-white'} block pl-3 pr-4 py-2 border-l-4 ${isActive('/') ? 'border-white' : 'border-transparent'} text-base font-medium flex items-center`}
            onClick={closeMenu}
          >
            <img src={homeIcon} alt="Home" className="h-5 w-5 mr-2" />
            {t('nav.home')}
          </Link>
          
          {user ? (
            <>
              <Link
                to="/chat"
                className={`${isActive('/chat') ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-700 hover:text-white'} block pl-3 pr-4 py-2 border-l-4 ${isActive('/chat') ? 'border-white' : 'border-transparent'} text-base font-medium flex items-center`}
                onClick={closeMenu}
              >
                <img src={chatIcon} alt="Chat" className="h-5 w-5 mr-2" />
                {t('nav.chat')}
              </Link>
              <Link
                to="/profile"
                className={`${isActive('/profile') ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-700 hover:text-white'} block pl-3 pr-4 py-2 border-l-4 ${isActive('/profile') ? 'border-white' : 'border-transparent'} text-base font-medium flex items-center`}
                onClick={closeMenu}
              >
                <img src={profileIcon} alt="Profile" className="h-5 w-5 mr-2" />
                {t('nav.profile')}
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`${isActive('/admin') ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-700 hover:text-white'} block pl-3 pr-4 py-2 border-l-4 ${isActive('/admin') ? 'border-white' : 'border-transparent'} text-base font-medium flex items-center`}
                  onClick={closeMenu}
                >
                  {t('nav.admin')}
                </Link>
              )}
            </>
          ) : (
            <Link
              to="/auth"
              className={`${isActive('/auth') ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-700 hover:text-white'} block pl-3 pr-4 py-2 border-l-4 ${isActive('/auth') ? 'border-white' : 'border-transparent'} text-base font-medium flex items-center`}
              onClick={closeMenu}
            >
              <img src={loginIcon} alt="Login" className="h-5 w-5 mr-2" />
              {t('nav.login')}
            </Link>
          )}
        </div>
        
        {/* Mobile user info */}
        {user && (
          <div className="pt-4 pb-3 border-t border-blue-700">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-800 flex items-center justify-center text-white font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-white">{user.name}</div>
                <div className="text-sm font-medium text-blue-200">{user.email}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;