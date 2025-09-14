'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/authSlice';
import { Button } from '@/components/ui/button';
import {
  User,
  Search,
  Bell,
  Settings,
  LogOut,
  Menu,
  Briefcase,
  UserCircle,
  PlusCircle
} from 'lucide-react';

const Navbar = () => {
  const [showDropdown, setShowDropdown] = React.useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    dispatch(logout());
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b w-full" style={{ fontSize: '16px' }}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 w-full">
          {/* Logo and main navigation */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center space-x-3">
              <Briefcase className="h-10 w-10 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">FreelanceHub</span>
            </Link>

            <div className="hidden md:ml-8 md:flex md:space-x-12">
              <Link href="/jobs" className="text-gray-700 hover:text-blue-600 px-4 py-3 text-xl font-medium whitespace-nowrap">
                Browse Jobs
              </Link>
              <Link href="/gigs" className="text-gray-700 hover:text-blue-600 px-4 py-3 text-xl font-medium whitespace-nowrap">
                Browse Services
              </Link>
              {isAuthenticated && (
                <Link href="/messages" className="text-gray-700 hover:text-blue-600 px-4 py-3 text-xl font-medium whitespace-nowrap">
                  Messages
                </Link>
              )}
              <Link href="/freelancers" className="text-gray-700 hover:text-blue-600 px-4 py-3 text-xl font-medium whitespace-nowrap">
                Find Freelancers
              </Link>
            </div>
          </div>

          {/* Search bar */}
          <div className="hidden md:flex items-center flex-1 max-w-lg mx-8">
            <div className="relative w-full group">
              {/* Search Icon */}
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-gray-600 transition-colors duration-200 h-6 w-6" />

              {/* Input Box */}
              <input
                type="text"
                placeholder="Search jobs, services, or freelancers..."
                className="w-full pl-12 pr-4 py-3 text-base rounded-xl bg-white border border-gray-200 
                 focus:ring-2 focus:ring-blue-500 focus:border-blue-400
                 shadow-sm hover:shadow-md transition-all duration-200
                 placeholder-gray-400 text-gray-700"
              />

              {/* Optional: Glow effect on focus */}
              <div className="absolute inset-0 rounded-xl ring-0 ring-blue-400 opacity-0 pointer-events-none transition-all duration-200 group-focus-within:opacity-100 group-focus-within:ring-2"></div>
            </div>
          </div>

          {/* Right side navigation */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <button
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 border-2 border-blue-400 focus:outline-none overflow-hidden"
                    title="Account"
                    onClick={() => setShowDropdown((prev) => !prev)}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1755278338891-e8d8481ff087?q=80&w=3072&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                      alt="Profile"
                      className="object-cover w-12 h-12 rounded-full"
                    />
                  </button>
                  {/* Dropdown with user details */}
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 transition-all duration-200 z-50">
                      <div className="py-4 px-4 flex flex-col items-center">
                        <img
                          src="https://images.unsplash.com/photo-1755278338891-e8d8481ff087?q=80&w=3072&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                          alt="Profile"
                          className="object-cover h-12 w-12 rounded-full mb-2"
                        />
                        <span className="font-semibold text-blue-700">{user?.name}</span>
                        <span className="text-xs text-gray-500 mb-2">{user?.email}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mb-2"
                          onClick={() => router.push('/dashboard')}
                        >
                          <Briefcase className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="transition-colors duration-150 group-hover:text-blue-600 group-active:text-blue-700">Dashboard</span>
                        </Button>
                        <Button variant="outline" size="sm" className="w-full mt-2" onClick={handleLogout}>
                          <LogOut className="h-4 w-4 mr-2 text-red-500" />
                          <span className="transition-colors duration-150 group-hover:text-red-600 group-active:text-red-700">Logout</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/login">
                  <Button
                    className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 text-base rounded-full shadow-md hover:from-blue-600 hover:to-blue-800 transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
                  >
                    <UserCircle className="h-5 w-5" />
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button
                    className="bg-gradient-to-r from-green-400 to-green-600 text-white px-6 py-3 text-base rounded-full shadow-md hover:from-green-500 hover:to-green-700 transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
                  >
                    <PlusCircle className="h-5 w-5" />
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
