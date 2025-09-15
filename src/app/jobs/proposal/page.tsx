'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Send, 
  FileText, 
  DollarSign, 
  Clock, 
  Link as LinkIcon, 
  Plus, 
  X,
  Briefcase,
  User,
  Star,
  MapPin,
  Calendar,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Zap,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAppSelector } from '@/store/hooks';
import proposalService, { ProposalData } from '@/services/proposal';
import jobService from '@/services/job';
import { Job } from '@/types/api';
import { toast } from 'react-hot-toast';

export default function ProposalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams?.get('jobId');
  
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>(['']);
  
  const [formData, setFormData] = useState<Omit<ProposalData, 'jobId'>>({
    coverLetter: '',
    proposedRate: 0,
    deliveryDays: 1,
    portfolioLinks: '', // Changed from array to string
    additionalNotes: ''
  });

  // Redirect if not authenticated or not a freelancer
  useEffect(() => {
    // if (!isAuthenticated) {
    //   router.push('/auth/login');
    //   return;
    // }
    
    if (user?.role?.toLowerCase() !== 'freelancer') {
      router.push('/jobs');
      toast.error('Only freelancers can submit proposals');
      return;
    }
  }, [isAuthenticated, user, router]);

  // Fetch job details
  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) {
        router.push('/jobs');
        return;
      }

      try {
        setLoading(true);
        const jobData = await jobService.jobAPI.getJobById(parseInt(jobId));
        setJob(jobData);
      } catch (error) {
        console.error('Error fetching job:', error);
        toast.error('Failed to load job details');
        router.push('/jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId, router]);

  const handlePortfolioLinkChange = (index: number, value: string) => {
    const newLinks = [...portfolioLinks];
    newLinks[index] = value;
    setPortfolioLinks(newLinks);
  };

  const addPortfolioLink = () => {
    if (portfolioLinks.length < 5) { // Limit to 5 links
      setPortfolioLinks([...portfolioLinks, '']);
    }
  };

  const removePortfolioLink = (index: number) => {
    if (portfolioLinks.length > 1) {
      const newLinks = portfolioLinks.filter((_, i) => i !== index);
      setPortfolioLinks(newLinks);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!job || !jobId) return;
    
    // Validation
    if (!formData.coverLetter.trim()) {
      toast.error('Please write a cover letter');
      return;
    }
    
    if (formData.proposedRate <= 0) {
      toast.error('Please enter a valid rate');
      return;
    }
    
    if (formData.deliveryDays <= 0) {
      toast.error('Please enter valid delivery days');
      return;
    }

    try {
      setSubmitting(true);
      
      // Filter out empty portfolio links
      const validPortfolioLinks = portfolioLinks.filter(link => link.trim() !== '');
      
      const proposalData: ProposalData = {
        jobId: parseInt(jobId),
        coverLetter: formData.coverLetter,
        proposedRate: formData.proposedRate,
        deliveryDays: formData.deliveryDays,
        portfolioLinks: validPortfolioLinks.join(', '), // Convert array to comma-separated string
        additionalNotes: formData.additionalNotes
      };

      await proposalService.submitProposal(proposalData);
      
      toast.success('Proposal submitted successfully!');
      router.push('/jobs');
      
    } catch (error: any) {
      console.error('Error submitting proposal:', error);
      toast.error(error.response?.data?.message || 'Failed to submit proposal');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-6">The job you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push('/jobs')} className="bg-blue-600 hover:bg-blue-700">
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-6">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="p-2 hover:bg-white/20 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Submit Proposal
              </h1>
              <p className="text-gray-600 mt-1">Send your proposal for this job opportunity</p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Job Details Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sticky top-8">
              <div className="flex items-start space-x-4 mb-6">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h2 className="font-bold text-gray-900 text-lg leading-tight mb-2">
                    {job.title || job.projectName}
                  </h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>Posted by Client</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Budget</span>
                  </div>
                  <span className="font-bold text-green-600">
                    ${job.budget || Math.floor((job.minBudgetCents || 0) / 100)} - ${Math.floor((job.maxBudgetCents || 0) / 100)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Category</span>
                  </div>
                  <span className="text-sm text-gray-700">{job.category || 'Not specified'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-600">Posted</span>
                  </div>
                  <span className="text-sm text-gray-700">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
{/* 
              <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-4">Job Description</h3>
                <div className="max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-100">
                  <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {job.description}
                  </p>
                </div>
              </div> */}
            </div>
          </motion.div>

          {/* Proposal Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg text-white">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Cover Letter</h3>
                </div>
                
                <Textarea
                  placeholder="Explain why you're the perfect fit for this job. Highlight your relevant experience, skills, and what you can deliver..."
                  value={formData.coverLetter}
                  onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                  className="min-h-[200px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg text-white">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Your Rate</h3>
                  </div>
                  
                  <Input
                    type="number"
                    placeholder="Enter your proposed rate"
                    value={formData.proposedRate || ''}
                    onChange={(e) => setFormData({ ...formData, proposedRate: parseFloat(e.target.value) || 0 })}
                    className="border-gray-200 focus:border-green-500 focus:ring-green-500 bg-white text-gray-900 placeholder-gray-500"
                    min="1"
                    required
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Job budget: <span className="font-semibold text-green-600">
                      ${job.budget || `${Math.floor((job.minBudgetCents || 0) / 100)} - ${Math.floor((job.maxBudgetCents || 0) / 100)}`}
                    </span>
                  </p>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg text-white">
                      <Clock className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Delivery Time</h3>
                  </div>
                  
                  <Input
                    type="number"
                    placeholder="Number of days"
                    value={formData.deliveryDays || ''}
                    onChange={(e) => setFormData({ ...formData, deliveryDays: parseInt(e.target.value) || 1 })}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                    min="1"
                    required
                  />
                  <p className="text-sm text-gray-600 mt-2">How many days do you need?</p>
                </div>
              </div>

              {/* Portfolio Links */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white">
                      <LinkIcon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Portfolio Links</h3>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addPortfolioLink}
                    disabled={portfolioLinks.length >= 5}
                    className="border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Link
                  </Button>
                </div>

                <div className="space-y-3">
                  {portfolioLinks.map((link, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        type="url"
                        placeholder="https://your-portfolio.com"
                        value={link}
                        onChange={(e) => handlePortfolioLinkChange(index, e.target.value)}
                        className="flex-1 border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white text-gray-900 placeholder-gray-500"
                      />
                      {portfolioLinks.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePortfolioLink(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Share links to your relevant work (optional, max 5)
                </p>
              </div>

              {/* Additional Notes */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg text-white">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Additional Notes</h3>
                </div>
                
                <Textarea
                  placeholder="Any additional information you'd like to share (optional)..."
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                  className="min-h-[120px] resize-none border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-500"
                />
              </div>

              {/* Submit Button */}
              <motion.div
                className="flex justify-end space-x-4"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="px-8 py-3 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                >
                  {submitting ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Proposal
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
