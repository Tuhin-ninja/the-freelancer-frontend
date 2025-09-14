import React from 'react';
import { Search, MapPin, DollarSign, Clock, Star } from 'lucide-react';
import { Job } from '@/types/api';

interface JobCardProps {
  job: Job;
  onClick?: () => void;
}

const JobCard = ({ job, onClick }: JobCardProps) => {
  const formatBudget = (min?: number, max?: number) => {
    if (min && max) {
      return `$${min.toFixed(2)} - $${max.toFixed(2)}`;
    } else if (min) {
      return `From $${min.toFixed(2)}`;
    } else if (max) {
      return `Up to $${max.toFixed(2)}`;
    }
    return 'Budget not specified';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-lg text-gray-900">{job.title}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(job.status)}`}>
              {job.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-gray-600 text-sm line-clamp-3">{job.description}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {job.skills?.slice(0, 4).map((skill: string, index: number) => (
          <span 
            key={index}
            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
          >
            {skill}
          </span>
        ))}
        {job.skills && job.skills.length > 4 && (
          <span className="text-gray-500 text-xs">+{job.skills.length - 4} more</span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-green-600">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm font-medium">
              {formatBudget(job.budget_min, job.budget_max)}
            </span>
          </div>
          {job.deadline && (
            <div className="flex items-center text-gray-600">
              <Clock className="h-4 w-4 mr-1" />
              <span className="text-sm">
                {new Date(job.deadline).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">
            Posted {new Date(job.created_at || job.createdAt).toLocaleDateString()}
          </div>
          {job.client?.name && (
            <div className="text-sm font-medium text-gray-700">
              by {job.client.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface JobListProps {
  jobs: Job[];
  onJobClick?: (job: Job) => void;
  loading?: boolean;
}

const JobList = ({ jobs, onJobClick, loading }: JobListProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 bg-gray-200 rounded w-48"></div>
                  <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded mb-1"></div>
                <div className="h-4 bg-gray-200 rounded mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
            <div className="flex gap-2 mb-4">
              <div className="h-6 bg-gray-200 rounded-full w-16"></div>
              <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              <div className="h-6 bg-gray-200 rounded-full w-14"></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="text-right">
                <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Search className="h-16 w-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
        <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {jobs.map((job) => (
        <JobCard 
          key={job.id} 
          job={job} 
          onClick={() => onJobClick?.(job)}
        />
      ))}
    </div>
  );
};

export default JobList;
