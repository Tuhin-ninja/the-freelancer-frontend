'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, MapPin, DollarSign, Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import JobList from '@/components/JobList';
import jobService from '@/services/job';
import { Job } from '@/types/api';
import { useAppSelector } from '@/store/hooks';

// Button component for clients to post a job
const ClientPostJobButton = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  // Only show the button if user is authenticated and is a client
  if (!isAuthenticated || user?.role !== 'client') {
    return null;
  }
  
  return (
    <Button 
      className="bg-blue-600 hover:bg-blue-700 text-white"
      onClick={() => router.push('/jobs/post')}
    >
      <Plus className="mr-2 h-4 w-4" />
      Post a Job
    </Button>
  );
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [budgetRange, setBudgetRange] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobService.jobAPI.getAllJobs();
      setJobs(response.content || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just filter locally since there's no search endpoint
    // In a real app, you'd call a search API
    fetchJobs();
  };

  const categories = [
    'All Categories',
    'Web Development',
    'Mobile Apps',
    'Graphic Design',
    'Digital Marketing',
    'Writing & Translation',
    'Video & Animation',
    'Music & Audio',
    'Data Science',
    'Business',
    'Photography'
  ];

  const budgetRanges = [
    'All Budgets',
    'Under $100',
    '$100 - $500',
    '$500 - $1,000',
    '$1,000 - $5,000',
    '$5,000+'
  ];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchQuery || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || selectedCategory === 'All Categories';
    
    let matchesBudget = !budgetRange || budgetRange === 'All Budgets';
    if (budgetRange && budgetRange !== 'All Budgets' && job.budget) {
      const budget = job.budget;
      switch (budgetRange) {
        case 'Under $100':
          matchesBudget = budget < 100;
          break;
        case '$100 - $500':
          matchesBudget = budget >= 100 && budget <= 500;
          break;
        case '$500 - $1,000':
          matchesBudget = budget >= 500 && budget <= 1000;
          break;
        case '$1,000 - $5,000':
          matchesBudget = budget >= 1000 && budget <= 5000;
          break;
        case '$5,000+':
          matchesBudget = budget >= 5000;
          break;
      }
    }
    
    return matchesSearch && matchesCategory && matchesBudget;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Find Your Next Project
            </h1>
            <p className="text-xl mb-8 text-green-100">
              Browse thousands of job opportunities from clients worldwide
            </p>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4 bg-white rounded-lg p-2 shadow-lg">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Search for jobs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-0  text-lg"
                  />
                </div>
                <Button 
                  type="submit" 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Search Jobs
                </Button>
              </div>
            </form>
            
            {/* Post Job Button for Hero Section */}
            <div className="mt-6">
              <ClientPostJobButton />
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <Filter className="mr-2 h-5 w-5" />
                Filters
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Categories</h4>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category === 'All Categories' ? '' : category)}
                        className={`w-full text-left px-3 py-2 rounded transition-colors text-sm ${
                          (selectedCategory === category) || (selectedCategory === '' && category === 'All Categories')
                            ? 'bg-green-100 text-green-700'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Budget Range</h4>
                  <div className="space-y-2">
                    {budgetRanges.map((range) => (
                      <button
                        key={range}
                        onClick={() => setBudgetRange(range === 'All Budgets' ? '' : range)}
                        className={`w-full text-left px-3 py-2 rounded transition-colors text-sm ${
                          (budgetRange === range) || (budgetRange === '' && range === 'All Budgets')
                            ? 'bg-green-100 text-green-700'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Available Jobs
                </h2>
                <p className="text-gray-600">
                  {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
                </p>
              </div>
              
              {/* Post Job Button for clients only */}
              <ClientPostJobButton />
            </div>

            {/* Job List */}
            <JobList 
              jobs={filteredJobs} 
              loading={loading}
              onJobClick={(job) => {
                // Navigate to job detail page
                window.location.href = `/jobs/${job.id}`;
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
