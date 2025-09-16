'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { motion } from 'framer-motion';
import { User, Mail, Briefcase, Star, Settings, Camera, CheckCircle, Upload } from 'lucide-react';
import { updateProfilePicture, getProfile } from '@/services/profile';
import { updateUser } from '@/store/authSlice';

interface ProfileData {
  headline: string;
  bio: string;
  hourlyRateCents: number;
  currency: string;
  availability: string;
  languages: string[] | null;
  skills: string[];
  locationText: string;
  githubUsername: string | null;
  gitlabUsername: string | null;
  websiteUrl: string | null;
  linkedinUrl: string | null;
  deliveryScore: number;
  reviewAvg: number;
  reviewsCount: number;
  profilePictureUrl: string | null;
}

const ProfilePage = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        try {
          const data = await getProfile(String(user.id));
          setProfileData(data);
        } catch (error) {
          console.error('Failed to fetch profile data:', error);
        }
      }
    };

    fetchProfile();
  }, [user?.id]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const updatedUser = await updateProfilePicture(selectedFile);
      dispatch(updateUser(updatedUser));
      // Refetch profile data to get the new image URL
      const data = await getProfile(String(user!.id));
      setProfileData(data);
      setPreviewImage(null);
      setSelectedFile(null);
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      // You might want to show an error message to the user
    } finally {
      setIsUploading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-600">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          <div className="p-8">
            <div className="flex flex-col sm:flex-row items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative group mb-6 sm:mb-0 sm:mr-8"
                onClick={handleImageClick}
              >
                <img
                  src={previewImage || profileData?.profilePictureUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white cursor-pointer"
                />
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
              </motion.div>
              <div className="text-center sm:text-left">
                <h1 className="text-4xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-lg text-gray-600 mt-1">{user.email}</p>
                {previewImage && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                  >
                    {isUploading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 mr-2" />
                        Save Picture
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50/50 px-8 py-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-gray-500" />
              Profile Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center bg-white p-4 rounded-xl shadow-sm">
                <Briefcase className="w-6 h-6 text-blue-500 mr-4" />
                <div>
                  <p className="text-sm text-gray-500">Account Type</p>
                  <p className="font-semibold text-gray-800 capitalize">{user.role?.toLowerCase()}</p>
                </div>
              </div>
              <div className="flex items-center bg-white p-4 rounded-xl shadow-sm">
                <Star className="w-6 h-6 text-yellow-500 mr-4" />
                <div>
                  <p className="text-sm text-gray-500">Rating</p>
                  <p className="font-semibold text-gray-800">4.8 (127 reviews)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
