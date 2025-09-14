'use client';
import React from 'react';
import { useAppSelector } from '@/hooks/redux';
import { Briefcase, UserCircle, Plus, FileText, BarChart3, Settings, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const DashboardPage = () => {
  const { user, isAuthenticated } = useAppSelector((state) => ({
    user: state.auth.user,
    isAuthenticated: state.auth.isAuthenticated,
  }));
  const [gigs, setGigs] = React.useState([]);
  const [loadingGigs, setLoadingGigs] = React.useState(false);
  const [gigsError, setGigsError] = React.useState('');

  React.useEffect(() => {
    if (!user) return;
    const fetchGigs = async () => {
      setLoadingGigs(true);
      setGigsError('');
      try {
        const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';
        const axios = (await import('axios')).default;
        const res = await axios.get(`http://localhost:8080/api/gigs/user/${user.id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setGigs(res.data);
      } catch (err: any) {
        setGigsError(err.response?.data?.message || 'Failed to fetch gigs.');
      } finally {
        setLoadingGigs(false);
      }
    };
    fetchGigs();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <img
              src="https://images.unsplash.com/photo-1755278338891-e8d8481ff087?q=80&w=3072&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Profile"
              className="object-cover h-20 w-20 rounded-full border-4 border-white shadow-lg"
            />
          </div>
          <motion.h1
            initial={{ scale: 0.9, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, type: 'spring' }}
            className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-2"
          >
            Welcome back, {user?.name || 'User'}!
          </motion.h1>
          <p className="text-gray-600 text-lg">
            {user?.role === 'FREELANCER' ? 'Ready to showcase your skills?' : 'Ready to find the perfect freelancer?'}
          </p>
        </motion.div>

        {/* Role-based Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {user?.role === 'FREELANCER' ? (
            // Freelancer Actions
            <>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 shadow-xl cursor-pointer"
                onClick={() => window.location.href = '/dashboard/gigs/create'}
              >
                <div className="flex items-center mb-4">
                  <div className="bg-white/20 p-3 rounded-full">
                    <Plus className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">Create New Gig</h3>
                <p className="text-blue-100">Showcase your skills and start earning</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-6 shadow-xl cursor-pointer"
              >
                <div className="flex items-center mb-4">
                  <div className="bg-white/20 p-3 rounded-full">
                    <BarChart3 className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">Analytics</h3>
                <p className="text-green-100">Track your gig performance</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-6 shadow-xl cursor-pointer"
              >
                <div className="flex items-center mb-4">
                  <div className="bg-white/20 p-3 rounded-full">
                    <Star className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">Reviews</h3>
                <p className="text-purple-100">Manage client feedback</p>
              </motion.div>
            </>
          ) : (
            // Client Actions
            <>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl p-6 shadow-xl cursor-pointer"
                onClick={() => window.location.href = '/dashboard/jobs/create'}
              >
                <div className="flex items-center mb-4">
                  <div className="bg-white/20 p-3 rounded-full">
                    <FileText className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">Post a Job</h3>
                <p className="text-orange-100">Find the perfect freelancer</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-2xl p-6 shadow-xl cursor-pointer"
              >
                <div className="flex items-center mb-4">
                  <div className="bg-white/20 p-3 rounded-full">
                    <Briefcase className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">Manage Projects</h3>
                <p className="text-cyan-100">Track ongoing work</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-2xl p-6 shadow-xl cursor-pointer"
              >
                <div className="flex items-center mb-4">
                  <div className="bg-white/20 p-3 rounded-full">
                    <Settings className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">Account Settings</h3>
                <p className="text-pink-100">Manage your profile</p>
              </motion.div>
            </>
          )}
        </div>

        {/* Content Section */}
        {user?.role === 'FREELANCER' ? (
          /* Freelancer's Gigs Section */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Briefcase className="h-6 w-6 text-blue-500" />
              Your Gigs
            </h2>
            {loadingGigs && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-blue-500">Loading gigs...</span>
              </div>
            )}
            {gigsError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-600">{gigsError}</p>
              </div>
            )}
            {!loadingGigs && gigs.length === 0 && (
              <div className="text-center py-12">
                <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No gigs created yet</p>
                <p className="text-gray-400">Start by creating your first gig!</p>
              </div>
            )}
            <div className="grid gap-4">
              {gigs.map((gig: any, index: number) => (
                <motion.div
                  key={gig.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-xl text-gray-800">{gig.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      gig.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {gig.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-2">{gig.description}</p>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                      {gig.category}
                    </span>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                      ${gig.startingPrice}
                    </span>
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                      {gig.deliveryDays} days
                    </span>
                  </div>
                  {gig.tags && gig.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {gig.tags.map((tag: string, tagIndex: number) => (
                        <span
                          key={tagIndex}
                          className="bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          /* Client's Jobs Section */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <FileText className="h-6 w-6 text-orange-500" />
              Your Posted Jobs
            </h2>
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No jobs posted yet</p>
              <p className="text-gray-400">Start by posting your first job!</p>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default DashboardPage;

