'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Briefcase, 
  Star, 
  Settings, 
  Camera, 
  CheckCircle, 
  Upload,
  MapPin,
  DollarSign,
  Clock,
  Award,
  Code,
  Calendar,
  Globe,
  Github,
  Linkedin,
  ArrowLeft,
  Edit3
} from 'lucide-react';
import { getProfile, updateProfilePicture } from '@/services/profile';
import { updateUser } from '@/store/authSlice';
import { useRouter } from 'next/navigation';

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
  updatedAt?: string;
}

const UserProfilePage = ({ params }: { params: Promise<{ userId: string }> }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user: loggedInUser } = useAppSelector((state) => state.auth);
  
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initializeParams = async () => {
      try {
        const resolvedParams = await params;
        setUserId(resolvedParams.userId);
      } catch (error) {
        console.error('Error resolving params:', error);
        setError('Invalid user ID');
        setLoading(false);
      }
    };

    initializeParams();
  }, [params]);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userId) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getProfile(userId);
        console.log('Profile API response:', data);
        
        if (data && typeof data === 'object') {
          // Handle the case where profile data is directly in the response
          if (data.profile) {
            setProfileData(data.profile);
          } else if (data.headline !== undefined) {
            // Profile data is directly in the response
            setProfileData(data);
          }
          
          if (data.user) {
            setUser(data.user);
            setIsOwnProfile(loggedInUser?.id === data.user.id);
          } else if (loggedInUser && userId === String(loggedInUser.id)) {
            // If no user data returned but this is the logged-in user's profile
            setUser(loggedInUser);
            setIsOwnProfile(true);
          }
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err: any) {
        console.error('Profile fetch error:', err);
        setError(err.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, loggedInUser]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    if (isOwnProfile) {
      fileInputRef.current?.click();
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const updatedUser = await updateProfilePicture(selectedFile);
      dispatch(updateUser(updatedUser));
      
      if(profileData){
        const data = { ...profileData, profilePictureUrl: updatedUser.profilePicture ?? null };
        setProfileData(data);
      }
      setPreviewImage(null);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageCancel = () => {
    setPreviewImage(null);
    setSelectedFile(null);
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700 font-semibold">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong.</h2>
          <p className="text-red-500 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex justify-between items-center mb-8"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          {isOwnProfile && (
            <button
              onClick={handleEditProfile}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              <Edit3 className="h-5 w-5" />
              Edit Profile
            </button>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/90 backdrop-blur-md border border-gray-100 rounded-2xl shadow-xl p-6 text-center"
            >
              <div className="relative inline-block mb-4">
                <img
                  src={previewImage || profileData?.profilePictureUrl || `https://ui-avatars.com/api/?name=${user?.name}&background=random`}
                  alt="Profile"
                  className={`w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg ${isOwnProfile ? 'cursor-pointer' : ''}`}
                  onClick={handleImageClick}
                />
                {isOwnProfile && (
                  <div className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white cursor-pointer hover:bg-blue-700 transition-all">
                    <Camera className="h-5 w-5" />
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
              />
              {previewImage && (
                <div className="mt-4 flex justify-center gap-2">
                  <button onClick={handleImageUpload} className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors">Save</button>
                  <button onClick={handleImageCancel} className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors">Cancel</button>
                </div>
              )}
              <h1 className="text-2xl font-bold text-gray-900 mt-4">{user?.name}</h1>
              <p className="text-blue-600 font-medium">{profileData?.headline}</p>
              <div className="flex items-center justify-center text-gray-500 mt-2">
                <MapPin className="h-4 w-4 mr-1.5" />
                <span>{profileData?.locationText || 'Location not set'}</span>
              </div>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white/90 backdrop-blur-md border border-gray-100 rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Social Links</h2>
              <div className="space-y-3">
                {profileData?.githubUsername && (
                  <a
                    href={`https://github.com/${profileData.githubUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <Github className="h-5 w-5 text-gray-700" />
                    <span className="text-gray-700">GitHub</span>
                  </a>
                )}
                {profileData?.gitlabUsername && (
                  <a
                    href={`https://gitlab.com/${profileData.gitlabUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors"
                  >
                    <Code className="h-5 w-5 text-orange-600" />
                    <span className="text-orange-600">GitLab</span>
                  </a>
                )}
                {profileData?.linkedinUrl && (
                  <a
                    href={profileData.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    <Linkedin className="h-5 w-5 text-blue-600" />
                    <span className="text-blue-600">LinkedIn</span>
                  </a>
                )}
                {profileData?.websiteUrl && (
                  <a
                    href={profileData.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
                  >
                    <Globe className="h-5 w-5 text-purple-600" />
                    <span className="text-purple-600">Website</span>
                  </a>
                )}
                {!profileData?.githubUsername && !profileData?.gitlabUsername && 
                 !profileData?.linkedinUrl && !profileData?.websiteUrl && (
                  <p className="text-gray-500 italic text-center py-4">No social links added yet</p>
                )}
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white/90 backdrop-blur-md border border-gray-100 rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Stats</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Currency</span>
                  <span className="font-bold text-blue-600">{profileData?.currency || 'USD'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Response Time</span>
                  <span className="font-bold text-green-600">Within 1 hour</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-bold text-gray-700">
                    {profileData?.updatedAt ? new Date(profileData.updatedAt).toLocaleDateString() : 'Recently'}
                  </span>
                </div>
              </div>
            </motion.div>

          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* About Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white/90 backdrop-blur-md border border-gray-100 rounded-2xl shadow-xl p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About Me</h2>
              <p className="text-gray-700 leading-relaxed">{profileData?.bio || 'No bio available.'}</p>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="bg-blue-100/50 text-center p-4 rounded-xl">
                <div className="text-3xl font-bold text-blue-600">{profileData?.deliveryScore || 0}%</div>
                <div className="text-sm text-blue-800">Delivery Score</div>
              </motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="bg-green-100/50 text-center p-4 rounded-xl">
                <div className="text-3xl font-bold text-green-600">{profileData?.reviewAvg || 0}</div>
                <div className="text-sm text-green-800">Avg Rating</div>
              </motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }} className="bg-purple-100/50 text-center p-4 rounded-xl">
                <div className="text-3xl font-bold text-purple-600">{profileData?.reviewsCount || 0}</div>
                <div className="text-sm text-purple-800">Reviews</div>
              </motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }} className="bg-orange-100/50 text-center p-4 rounded-xl">
                <div className="text-3xl font-bold text-orange-600">${profileData?.hourlyRateCents ? (profileData.hourlyRateCents / 100).toFixed(0) : '0'}</div>
                <div className="text-sm text-orange-800">Hourly Rate</div>
              </motion.div>
            </div>

            {/* Skills & Languages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="bg-white/90 backdrop-blur-md border border-gray-100 rounded-2xl shadow-xl p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {profileData?.skills && profileData.skills.length > 0 ? (
                    profileData.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">{skill}</span>
                    ))
                  ) : (
                    <p className="text-gray-500">No skills listed.</p>
                  )}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="bg-white/90 backdrop-blur-md border border-gray-100 rounded-2xl shadow-xl p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">Languages</h2>
                <div className="flex flex-wrap gap-2">
                  {profileData?.languages && profileData.languages.length > 0 ? (
                    profileData.languages.map((lang, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">{lang}</span>
                    ))
                  ) : (
                    <p className="text-gray-500">No languages listed.</p>
                  )}
                </div>
              </motion.div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default UserProfilePage;