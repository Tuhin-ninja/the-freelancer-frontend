'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { Button } from '@/components/ui/button';
import jobService from '@/services/job';
import { Job } from '@/types/api';
import { Plus, Edit, Trash2, MoreHorizontal, AlertCircle, CheckCircle, Clock, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ManageJobsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; jobId: number | null }>({
    show: false,
    jobId: null
  });
  const [deleteStatus, setDeleteStatus] = useState<{ success: boolean; message: string; show: boolean }>({
    success: false,
    message: '',
    show: false
  });

  // Check if user is a client
  // useEffect(() => {
  //   if (isAuthenticated && user?.role !== 'client') {
  //     router.push('/dashboard');
  //   }
  // }, [isAuthenticated, user, router]);

  // Load user's jobs
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchMyJobs();
    }
  }, [isAuthenticated, user]);

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      const response = await jobService.jobAPI.getMyJobs();
      setJobs(response || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    try {
      await jobService.jobAPI.deleteJob(jobId);
      setDeleteStatus({
        success: true,
        message: 'Job deleted successfully',
        show: true
      });
      
      // Remove from local state
      setJobs(jobs.filter(job => job.id !== jobId));
      
      // Hide the message after 3 seconds
      setTimeout(() => {
        setDeleteStatus(prev => ({ ...prev, show: false }));
      }, 3000);
      
    } catch (error) {
      console.error('Error deleting job:', error);
      setDeleteStatus({
        success: false,
        message: 'Failed to delete job',
        show: true
      });
      
      setTimeout(() => {
        setDeleteStatus(prev => ({ ...prev, show: false }));
      }, 3000);
    } finally {
      setDeleteModal({ show: false, jobId: null });
    }
  };

  const handleEditJob = (jobId: number) => {
    router.push(`/dashboard/jobs/edit/${jobId}`);
  };
  
  const formatDate = (dateString: string | Date) => {
    if (!dateString) return 'N/A';
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Open</span>;
      case 'in_progress':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">In Progress</span>;
      case 'completed':
        return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">Completed</span>;
      case 'cancelled':
        return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Cancelled</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">{status}</span>;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-center mb-4">Authentication Required</h1>
          <p className="text-gray-600 text-center mb-6">
            You need to be logged in to view this page.
          </p>
          <div className="flex justify-center">
            <Button 
              onClick={() => router.push('/auth/login')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Log In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Your Jobs</h1>
            <p className="text-gray-600">Manage your posted jobs and review proposals</p>
          </div>
          <Button
            onClick={() => router.push('/jobs/post')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Post a New Job
          </Button>
        </div>

        {deleteStatus.show && (
          <div className={`mb-6 p-4 rounded-md ${deleteStatus.success ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'}`}>
            <div className="flex items-center">
              {deleteStatus.success ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              )}
              <p className={deleteStatus.success ? 'text-green-700' : 'text-red-700'}>
                {deleteStatus.message}
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="bg-white shadow rounded-lg p-4">
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, idx) => (
                <div key={idx} className="flex items-center space-x-4 p-4 border-b border-gray-200">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
            <p className="text-gray-500 mb-6">
              Start by posting your first job to find the perfect freelancer for your project.
            </p>
            <Button
              onClick={() => router.push('/jobs/post')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Post Your First Job
            </Button>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Posted
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Proposals
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-600 hover:underline cursor-pointer" 
                          onClick={() => router.push(`/jobs/${job.id}`)}>
                          {job.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                          {job.description.substring(0, 80)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(job.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(job.createdAt || job.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.proposalCount || 0} proposals
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditJob(job.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setDeleteModal({ show: true, jobId: job.id })}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this job? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setDeleteModal({ show: false, jobId: null })}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => deleteModal.jobId && handleDeleteJob(deleteModal.jobId)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
