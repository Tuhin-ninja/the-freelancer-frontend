import api from '@/lib/api';
import { Gig, Profile, GigPackage, PaginatedResponse } from '@/types/api';

export const gigAPI = {
  // Get all gigs with pagination and filters
  getAllGigs: async (params?: {
    page?: number;
    size?: number;
    category?: string;
    tags?: string[];
  }): Promise<PaginatedResponse<Gig>> => {
    const response = await api.get('/api/gigs/search/with-freelancer', { params });
    return response.data;
  },

  // Get gig by ID
  getGigById: async (gigId: number): Promise<Gig> => {
    const response = await api.get(`/api/gigs/with-freelancer/${gigId}`);
    return response.data;
  },

  // Get gigs by user ID
  getGigsByUserId: async (userId: number): Promise<Gig[]> => {
    const response = await api.get(`/api/gigs/user/${userId}`);
    return response.data;
  },

  // Search gigs
  searchGigs: async (params: {
    category?: string;
    tags?: string[];
    freelancerId?: number;
  }): Promise<Gig[]> => {
    const response = await api.get('/api/gigs/search', { params });
    return response.data;
  },

  // Create new gig
  createGig: async (gigData: {
    title: string;
    description: string;
    category?: string;
    tags?: string[];
  }): Promise<Gig> => {
    const response = await api.post('/api/gigs', gigData);
    return response.data;
  },

  // Update gig
  updateGig: async (gigId: number, gigData: Partial<Gig>): Promise<Gig> => {
    const response = await api.put(`/api/gigs/${gigId}`, gigData);
    return response.data;
  },

  // Delete gig
  deleteGig: async (gigId: number): Promise<void> => {
    await api.delete(`/api/gigs/${gigId}`);
  },

  // Get gig packages
  getGigPackages: async (gigId: number): Promise<GigPackage[]> => {
    const response = await api.get(`/api/gigs/${gigId}/packages`);
    return response.data;
  },

  // Create gig package
  createGigPackage: async (gigId: number, packageData: {
    tier: 'BASIC' | 'STANDARD' | 'PREMIUM';
    title: string;
    description: string;
    priceCents: number;
    currency: string;
    deliveryDays: number;
    revisions?: number;
  }): Promise<GigPackage> => {
    const response = await api.post(`/api/gigs/${gigId}/packages`, packageData);
    return response.data;
  },
};

export const profileAPI = {
  // Get profile by user ID
  getProfile: async (userId: number): Promise<Profile> => {
    const response = await api.get(`/api/profiles/${userId}`);
    return response.data;
  },

  // Update own profile
  updateProfile: async (profileData: Partial<Profile>): Promise<Profile> => {
    const response = await api.put('/api/profiles/me', profileData);
    return response.data;
  },

  // Create profile
  createProfile: async (profileData: Partial<Profile>): Promise<Profile> => {
    const response = await api.post('/api/profiles', profileData);
    return response.data;
  },
};

export default { gigAPI, profileAPI };
