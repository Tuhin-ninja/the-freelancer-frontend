import api from '@/lib/api';
import { Job, Proposal, PaginatedResponse } from '@/types/api';

export const jobAPI = {
  // Get all jobs with pagination and filters
  getAllJobs: async (params?: {
    page?: number;
    size?: number;
    status?: string;
    stack?: string[];
    budget?: string;
  }): Promise<PaginatedResponse<Job>> => {
    const response = await api.get('/api/jobs', { params });
    return response.data;
  },

  // Get job by ID
  getJobById: async (jobId: number): Promise<Job> => {
    const response = await api.get(`/api/jobs/${jobId}`);
    return response.data;
  },

  // Get jobs by client ID
  getJobsByClientId: async (clientId: number): Promise<Job[]> => {
    const response = await api.get(`/api/jobs/client/${clientId}`);
    return response.data;
  },

  // Search jobs
  searchJobs: async (params: {
    query?: string;
    stack?: string[];
    budgetMin?: number;
    budgetMax?: number;
  }): Promise<Job[]> => {
    const response = await api.get('/api/jobs/search', { params });
    return response.data;
  },

  // Create new job
  createJob: async (jobData: {
    title: string;
    description: string;
    stack?: string[];
    budgetType: 'FIXED' | 'HOURLY';
    minBudgetCents?: number;
    maxBudgetCents?: number;
    currency: string;
    ndaRequired?: boolean;
    ipAssignment?: boolean;
    repoLink?: string;
  }): Promise<Job> => {
    const response = await api.post('/api/jobs', jobData);
    return response.data;
  },

  // Update job
  updateJob: async (jobId: number, jobData: Partial<Job>): Promise<Job> => {
    const response = await api.put(`/api/jobs/${jobId}`, jobData);
    return response.data;
  },

  // Delete job
  deleteJob: async (jobId: number): Promise<void> => {
    await api.delete(`/api/jobs/${jobId}`);
  },
};

export const proposalAPI = {
  // Submit proposal to job
  submitProposal: async (jobId: number, proposalData: {
    cover: string;
    totalCents: number;
    currency: string;
    deliveryDays: number;
  }): Promise<Proposal> => {
    const response = await api.post(`/api/jobs/${jobId}/proposals`, proposalData);
    return response.data;
  },

  // Get proposals for job
  getProposalsForJob: async (jobId: number): Promise<Proposal[]> => {
    const response = await api.get(`/api/jobs/${jobId}/proposals`);
    return response.data;
  },

  // Get freelancer's proposals
  getFreelancerProposals: async (): Promise<Proposal[]> => {
    const response = await api.get('/api/proposals/me');
    return response.data;
  },

  // Update proposal
  updateProposal: async (proposalId: number, proposalData: Partial<Proposal>): Promise<Proposal> => {
    const response = await api.put(`/api/proposals/${proposalId}`, proposalData);
    return response.data;
  },

  // Withdraw proposal
  withdrawProposal: async (proposalId: number): Promise<void> => {
    await api.delete(`/api/proposals/${proposalId}`);
  },
};

export default { jobAPI, proposalAPI };
