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
  Edit3,
  AlertTriangle,
  CreditCard,
  ExternalLink
} from 'lucide-react';
import { getProfile, updateProfilePicture } from '@/services/profile';
import { gigAPI } from '@/services/gig';
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
  const [gigs, setGigs] = useState<any[]>([]);
  const [gigsLoading, setGigsLoading] = useState(false);

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

  // Fetch user's gigs
  useEffect(() => {
    const fetchUserGigs = async () => {
      if (!userId) return;

      try {
        setGigsLoading(true);
        const response = await fetch(`http://localhost:8080/api/gigs/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const gigsData = await response.json();
          console.log('User gigs:', gigsData);
          setGigs(gigsData || []);
        } else {
          console.error('Failed to fetch gigs:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching gigs:', error);
      } finally {
        setGigsLoading(false);
      }
    };

    fetchUserGigs();
  }, [userId]);

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

            {/* Stripe Account Warning */}
            {isOwnProfile && (!user?.stripeAccountId || user?.stripeAccountId === null) && (
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl shadow-xl p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-8 w-8 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-amber-800 mb-2 flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Stripe Account Required
                    </h3>
                    <p className="text-amber-700 mb-4 leading-relaxed">
                      To receive payments for your freelance work and gigs, you need to connect your Stripe account. 
                      This allows clients to pay you securely and helps you manage your earnings.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => {
                          // You can implement Stripe Connect flow here
                          window.open('https://connect.stripe.com', '_blank');
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all duration-300 shadow-lg font-semibold"
                      >
                        <CreditCard className="h-4 w-4" />
                        Connect Stripe Account
                        <ExternalLink className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => router.push('/profile/edit')}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-amber-700 border-2 border-amber-300 rounded-xl hover:bg-amber-50 transition-all duration-300 font-semibold"
                      >
                        <Edit3 className="h-4 w-4" />
                        Update Profile
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-amber-100 rounded-xl border border-amber-200">
                  <h4 className="font-semibold text-amber-800 mb-2">Benefits of connecting Stripe:</h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Secure payment processing
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Automatic invoicing and receipts
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Quick payouts to your bank account
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Professional payment experience for clients
                    </li>
                  </ul>
                </div>
              </motion.div>
            )}

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

            {/* Gigs Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="bg-white/90 backdrop-blur-md border border-gray-100 rounded-2xl shadow-xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                  Available Gigs
                </h2>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {gigs.length} {gigs.length === 1 ? 'Gig' : 'Gigs'}
                </span>
              </div>
              
              {gigsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading gigs...</span>
                </div>
              ) : gigs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {gigs.map((gig, index) => (
                    <motion.div
                      key={gig.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      onClick={() => router.push(`/gigs/${gig.id}`)}
                      className="border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300 bg-white cursor-pointer transform hover:scale-[1.02]"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                          {gig.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          gig.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {gig.status}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {gig.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {gig.tags && gig.tags.slice(0, 3).map((tag: string, tagIndex: number) => (
                          <span 
                            key={tagIndex}
                            className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                        {gig.tags && gig.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                            +{gig.tags.length - 3} more
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            {gig.reviewAvg || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {gig.reviewsCount || 0} reviews
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            ${gig.profileId || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {gig.category}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Gigs Available</h3>
                  <p className="text-gray-600">
                    {isOwnProfile 
                      ? "You haven't posted any gigs yet." 
                      : "This freelancer hasn't posted any gigs yet."
                    }
                  </p>
                </div>
              )}
            </motion.div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default UserProfilePage;