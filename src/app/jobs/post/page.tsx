'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import jobService from '@/services/job';
import { CheckCircle, AlertCircle, ChevronRight, DollarSign, Clock } from 'lucide-react';

export default function PostJobPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [authChecked, setAuthChecked] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    stack: [] as string[],
    budgetType: 'FIXED' as ('FIXED' | 'HOURLY'),
    minBudgetCents: 0,
    maxBudgetCents: 0,
    currency: 'USD',
    ndaRequired: false,
    ipAssignment: false,
    repoLink: '',
  });
  const [currentSkill, setCurrentSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Initialize auth state from localStorage if Redux state is empty
  useEffect(() => {
    // If already authenticated in Redux, mark as checked
    if (isAuthenticated && user) {
      setAuthChecked(true);
      console.log("Auth already loaded in Redux:", { name: user.name, role: user.role });
      
      // Check if user is a client
      if (user.role !== 'client') {
        console.log("Redirecting: User is not a client");
        router.push('/jobs');
      }
    } else {
      // Try to load from localStorage if needed
      const userString = localStorage.getItem('user');
      const accessToken = localStorage.getItem('accessToken');
      
      if (userString && accessToken) {
        try {
          const localUser = JSON.parse(userString);
          console.log("Loaded user from localStorage:", localUser);
          
          if (localUser.role !== 'client') {
            console.log("Redirecting: User from localStorage is not a client");
            router.push('/jobs');
          }
          
          setAuthChecked(true);
        } catch (e) {
          console.error("Error parsing user from localStorage:", e);
          setAuthChecked(true); // Still mark as checked to show login form
        }
      } else {
        console.log("No auth data in localStorage");
        setAuthChecked(true); // Mark as checked to show login form
      }
    }
  }, [isAuthenticated, user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSkill = () => {
    if (currentSkill.trim() && !formData.stack.includes(currentSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        stack: [...prev.stack, currentSkill.trim()],
      }));
      setCurrentSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      stack: prev.stack.filter((s) => s !== skill),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Convert budget to cents
      const minBudget = parseFloat(formData.minBudgetCents.toString()) * 100;
      const maxBudget = parseFloat(formData.maxBudgetCents.toString()) * 100;

      const jobData = {
        ...formData,
        minBudgetCents: minBudget,
        maxBudgetCents: maxBudget,
      };

      await jobService.jobAPI.createJob(jobData);
      setSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        router.push('/jobs');
      }, 2000);
    } catch (err: any) {
      console.error('Error posting job:', err);
      setError(err.response?.data?.message || 'Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Display loading spinner while auth is being checked
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Check if user is not authenticated from Redux or localStorage
  const userString = localStorage.getItem('user');
  const isLocalStorageAuthenticated = !!userString && !!localStorage.getItem('accessToken');
  
  if (!isAuthenticated && !isLocalStorageAuthenticated) {
    console.log("Not authenticated in Redux or localStorage");
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-center mb-4">Authentication Required</h1>
          <p className="text-gray-600 text-center mb-6">
            You need to be logged in as a client to post a job.
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

  // Only clients can post jobs
  if (user && user.role !== 'client') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-center mb-4">Access Denied</h1>
          <p className="text-gray-600 text-center mb-6">
            Only clients can post jobs. Your account type is {user.role}.
          </p>
          <div className="flex justify-center">
            <Button 
              onClick={() => router.push('/jobs')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Browse Jobs
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-center mb-4">Job Posted Successfully!</h1>
          <p className="text-gray-600 text-center mb-6">
            Your job has been posted and is now visible to freelancers.
          </p>
          <div className="flex justify-center">
            <Button 
              onClick={() => router.push('/jobs')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              View All Jobs
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Post a New Job</h1>
          <p className="text-gray-600 mt-2">
            Find the perfect freelancer for your project by creating a detailed job post.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title*
                  </label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Full-Stack Developer for E-commerce Website"
                    required
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Keep it clear and specific to attract the right freelancers.
                  </p>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Job Description*
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your project, requirements, deliverables, and any other relevant details..."
                    required
                    className="w-full min-h-[200px]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Be detailed about project scope, timeline, and specific requirements.
                  </p>
                </div>

                <div>
                  <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
                    Required Skills
                  </label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      id="skills"
                      value={currentSkill}
                      onChange={(e) => setCurrentSkill(e.target.value)}
                      placeholder="e.g., React, Node.js, etc."
                      className="flex-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddSkill}>
                      Add
                    </Button>
                  </div>
                  
                  {formData.stack.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.stack.map((skill) => (
                        <span 
                          key={skill}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center"
                        >
                          {skill}
                          <button
                            type="button"
                            className="ml-1 text-blue-800 hover:text-blue-900"
                            onClick={() => handleRemoveSkill(skill)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="budgetType" className="block text-sm font-medium text-gray-700 mb-1">
                      Budget Type*
                    </label>
                    <select
                      id="budgetType"
                      name="budgetType"
                      value={formData.budgetType}
                      onChange={handleSelectChange}
                      className="w-full rounded-md border border-gray-300 py-2 px-3"
                      required
                    >
                      <option value="FIXED">Fixed Price</option>
                      <option value="HOURLY">Hourly Rate</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                      Currency*
                    </label>
                    <select
                      id="currency"
                      name="currency"
                      value={formData.currency}
                      onChange={handleSelectChange}
                      className="w-full rounded-md border border-gray-300 py-2 px-3"
                      required
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="minBudgetCents" className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Budget*
                    </label>
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-2">
                        <DollarSign className="h-5 w-5" />
                      </span>
                      <Input
                        id="minBudgetCents"
                        name="minBudgetCents"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.minBudgetCents}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        required
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="maxBudgetCents" className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Budget*
                    </label>
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-2">
                        <DollarSign className="h-5 w-5" />
                      </span>
                      <Input
                        id="maxBudgetCents"
                        name="maxBudgetCents"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.maxBudgetCents}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        required
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="ndaRequired"
                          name="ndaRequired"
                          type="checkbox"
                          checked={formData.ndaRequired}
                          onChange={handleCheckboxChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="ndaRequired" className="font-medium text-gray-700">
                          NDA Required
                        </label>
                        <p className="text-gray-500">
                          The freelancer will be required to sign a Non-Disclosure Agreement.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="ipAssignment"
                          name="ipAssignment"
                          type="checkbox"
                          checked={formData.ipAssignment}
                          onChange={handleCheckboxChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="ipAssignment" className="font-medium text-gray-700">
                          IP Assignment
                        </label>
                        <p className="text-gray-500">
                          The freelancer must transfer intellectual property rights for the work.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="repoLink" className="block text-sm font-medium text-gray-700 mb-1">
                    Repository Link (Optional)
                  </label>
                  <Input
                    id="repoLink"
                    name="repoLink"
                    value={formData.repoLink}
                    onChange={handleInputChange}
                    placeholder="e.g., https://github.com/username/repo"
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Link to a GitHub/GitLab repository if applicable.
                  </p>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="button"
                    onClick={() => router.back()}
                    variant="outline"
                    className="mr-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {loading ? 'Posting...' : 'Post Job'}
                    {!loading && <ChevronRight className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
