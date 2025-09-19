'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { Button } from '@/components/ui/button';
import jobService from '@/services/job';
import proposalService, { Proposal } from '@/services/proposal';
import { Job } from '@/types/api';
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  Clock, 
  MapPin, 
  User, 
  Briefcase, 
  Star, 
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Share2,
  Bookmark,
  Eye,
  Heart,
  MoreHorizontal,
  Award,
  TrendingUp,
  Users,
  Globe,
  ThumbsUp,
  MessageCircle,
  ExternalLink,
  Zap,
  Shield,
  Wand2,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import contractService from '@/services/contract';
import PaymentGatewayModal from '@/components/PaymentGatewayModal';

type ProposalWithContract = Proposal & { contractId?: number };

export default function JobDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [job, setJob] = useState<Job | null>(null);
  const [proposals, setProposals] = useState<ProposalWithContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acceptingProposalId, setAcceptingProposalId] = useState<number | null>(null);
  const [freelancer, setFreelancer] = useState();
  
  // Payment Modal State
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    proposal: ProposalWithContract | null;
  }>({ isOpen: false, proposal: null });

  // AI Analysis State
  const [analyzingProposalId, setAnalyzingProposalId] = useState<number | null>(null);
  const [analysisResults, setAnalysisResults] = useState<{[key: number]: any}>({});

  // Safe date formatting utility
  const safeFormatDate = (dateString: string | undefined) => {
    if (!dateString) return 'recently';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'recently';
      return formatDistanceToNow(date) + ' ago';
    } catch {
      return 'recently';
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
      if (isAuthenticated && user?.role?.toLowerCase() === 'client') {
        fetchProposals();
      }
    }
  }, [jobId, isAuthenticated, user]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await jobService.jobAPI.getJobById(parseInt(jobId));
    //   const response2 = await authAPI.getUserById(response.freelancerId);
      setJob(response);
    } catch (error) {
      console.error('Error fetching job:', error);
      setError('Failed to load job details');
      toast.error('Failed to load job details');
    }
  };

  const fetchProposals = async () => {
    try {
      const response = await proposalService.getJobProposals(parseInt(jobId));
      console.log(response);
      setProposals(response);
    } catch (error) {
      console.error('Error fetching proposals:', error);
      toast.error('Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptProposal = (proposal: Proposal) => {
    // Open payment modal instead of direct API call
    setPaymentModal({ isOpen: true, proposal });
  };

  const handlePaymentSuccess = async () => {
    if (!paymentModal.proposal || !job || !user) {
      toast.error('Job or user data is not available.');
      return;
    }

    const proposal = paymentModal.proposal;
    setAcceptingProposalId(proposal.id);
    
    try {
      // First, accept the proposal
      // await proposalService.acceptProposal(proposal.id);

      // Then, create the contract
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + 30); // Default 30 day contract

      const contractData = {
        jobId: job.id,
        proposalId: proposal.id,
        clientId: job.clientId,
        freelancerId: proposal.freelancerId,
        totalAmountCents: proposal.proposedRate,
        currency: job.currency,
        paymentModel: job.paymentModel,
        startDate: today.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        termsJson: JSON.stringify({
          scope: `Work for job: ${job.title}`,
          timeline: 'As per job description',
        }),
      };

      const newContract = await contractService.createContract(contractData);

      // Update the proposal in the local state to ACCEPTED and add contractId
      setProposals(prev => prev.map(p =>
        p.id === proposal.id ? { ...p, status: 'ACCEPTED' as const, contractId: newContract.id } : p
      ));

      // Close payment modal
      setPaymentModal({ isOpen: false, proposal: null });
      
      toast.success('Payment successful! Proposal accepted and contract created!');
      
      // Optional: redirect to workspace immediately
      // router.push(`/workspace/${newContract.id}`);

    } catch (error: any) {
      console.error('Error accepting proposal or creating contract:', error);
      toast.error(error.response?.data?.message || 'Failed to finalize the agreement.');
      
      // Close payment modal on error
      setPaymentModal({ isOpen: false, proposal: null });
    } finally {
      setAcceptingProposalId(null);
    }
  };

  const analyzeProposal = async (proposal: ProposalWithContract) => {
    if (!job) {
      toast.error('Job details not available for analysis');
      return;
    }

    setAnalyzingProposalId(proposal.id);

    try {
      const response = await fetch('/api/ai/analyze-proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalContent: proposal.coverLetter,
          freelancerExperience: proposal.freelancerInfo?.name || 'Anonymous Freelancer',
          proposedRate: proposal.proposedRate,
          deliveryDays: proposal.deliveryDays
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze proposal');
      }

      const data = await response.json();
      console.log('AI analysis response:', data);
      
      if (data) {
        setAnalysisResults(prev => ({
          ...prev,
          [proposal.id]: data
        }));
        toast.success('Proposal analysis completed!');
      } else {
        throw new Error('No analysis data received from AI');
      }
    } catch (error) {
      console.error('Error analyzing proposal:', error);
      toast.error('Failed to analyze proposal. Please try again.');
    } finally {
      setAnalyzingProposalId(null);
    }
  };

//   const handleRejectProposal = async (proposalId: number) => {
//     try {
//       await proposalService.rejectProposal(proposalId);
      
//       // Update the proposal in the local state to DECLINED (rejected by client)
//       setProposals(prev => prev.map(p => 
//         p.id === proposalId ? { ...p, status: 'DECLINED' as const } : p
//       ));
      
//       toast.success('Proposal declined');
//     } catch (error: any) {
//       console.error('Error rejecting proposal:', error);
//       toast.error(error.response?.data?.message || 'Failed to decline proposal');
//     }
//   };

  // Facebook-style Proposal Card Component
  const ProposalCard = ({ proposal }: { proposal: ProposalWithContract }) => {
    console.log("Khaid hasan Tuhin - ",proposal);
    const [isLiked, setIsLiked] = useState(false);
    const [showFullCover, setShowFullCover] = useState(false);
    const [showPortfolio, setShowPortfolio] = useState(false);
    
    // Mock data for social engagement (in real app, this would come from API)
    const likes = Math.floor(Math.random() * 50) + 10;
    const views = Math.floor(Math.random() * 200) + 50;
    
    const portfolioList = proposal.portfolioLinks 
      ? proposal.portfolioLinks.split(',').map(link => link.trim()).filter(link => link)
      : [];

    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden mb-6"
      >
        {/* Header - Freelancer Profile */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {proposal.freelancerInfo?.name?.charAt(0)?.toUpperCase() || 'F'}
                </div>
                {/* Online status indicator */}
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-gray-900 text-lg">
                    {proposal.freelancerInfo?.name || 'Anonymous Freelancer'}
                  </h3>
                  <div title="Verified Freelancer">
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-2">
                  Professional Freelancer
                </p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-medium">5.0</span>
                    <span>(24 reviews)</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Award className="w-4 h-4 text-green-500" />
                    <span>100% Success</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{safeFormatDate(proposal.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <Button variant="ghost" size="sm" className="p-2">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Proposal Content */}
        <div className="p-6">
          {/* Proposal Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-600">${proposal.proposedRate}</div>
              <div className="text-sm text-green-700">Proposed Rate</div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{proposal.deliveryDays}</div>
              <div className="text-sm text-blue-700">Days Delivery</div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 text-center">
              <div className={`text-2xl font-bold ${
                proposal.status === 'SUBMITTED' ? 'text-yellow-600' :
                proposal.status === 'CONTRACTED' ? 'text-green-600' : 'text-red-600'
              }`}>
                {proposal.status} 
              </div>
              <div className="text-sm text-gray-700">Status</div>
            </div>
          </div>

          {/* Cover Letter */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
              Cover Letter
            </h4>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className={`text-gray-700 leading-relaxed ${
                !showFullCover && proposal.coverLetter.length > 300 ? 'line-clamp-4' : ''
              }`}>
                {proposal.coverLetter}
              </p>
              {proposal.coverLetter.length > 300 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFullCover(!showFullCover)}
                  className="mt-2 text-blue-600 hover:text-blue-700 p-0 h-auto"
                >
                  {showFullCover ? 'Show less' : 'Read more'}
                </Button>
              )}
            </div>
          </div>

          {/* Portfolio Links */}
          {portfolioList.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <ExternalLink className="w-5 h-5 mr-2 text-purple-600" />
                Portfolio ({portfolioList.length})
              </h4>
              <div className="space-y-2">
                {portfolioList.slice(0, showPortfolio ? portfolioList.length : 2).map((link, index) => (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-colors group"
                  >
                    <Globe className="w-5 h-5 text-purple-600" />
                    <span className="text-purple-700 group-hover:text-purple-800 truncate flex-1">
                      {link}
                    </span>
                    <ExternalLink className="w-4 h-4 text-purple-500 group-hover:text-purple-600" />
                  </a>
                ))}
              </div>
              {portfolioList.length > 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPortfolio(!showPortfolio)}
                  className="mt-2 text-purple-600 hover:text-purple-700"
                >
                  {showPortfolio ? 'Show less' : `Show ${portfolioList.length - 2} more`}
                </Button>
              )}
            </div>
          )}

          {/* Additional Notes */}
          {proposal.additionalNotes && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-indigo-600" />
                Additional Notes
              </h4>
              <div className="bg-indigo-50 rounded-xl p-4">
                <p className="text-gray-700 leading-relaxed">{proposal.additionalNotes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Social Engagement Bar */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{views} views</span>
              </span>
              <span className="flex items-center space-x-1">
                <Heart className="w-4 h-4" />
                <span>{likes} likes</span>
              </span>
            </div>
            <span>Proposal #{proposal.id}</span>
          </div>
        </div>

        {/* AI Analysis Section */}
        {analysisResults[proposal.id] && (
          <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-t border-gray-100">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Wand2 className="w-5 h-5 mr-2 text-purple-600" />
              AI Analysis Results
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Overall Score</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {analysisResults[proposal.id].overallScore || 'N/A'}
                  </span>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Strengths</span>
                  <span className="text-sm text-green-600 font-medium">
                    {analysisResults[proposal.id].strengths?.length || 0} found
                  </span>
                </div>
              </div>
            </div>
            
            {analysisResults[proposal.id].strengths && (
              <div className="mt-4">
                <h5 className="font-medium text-gray-800 mb-2">Key Strengths:</h5>
                <div className="flex flex-wrap gap-2">
                  {analysisResults[proposal.id].strengths.map((strength: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {strength}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {analysisResults[proposal.id].weaknesses && analysisResults[proposal.id].weaknesses.length > 0 && (
              <div className="mt-4">
                <h5 className="font-medium text-gray-800 mb-2">Areas for Consideration:</h5>
                <div className="flex flex-wrap gap-2">
                  {analysisResults[proposal.id].weaknesses.map((weakness: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                    >
                      {weakness}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {analysisResults[proposal.id].recommendations && analysisResults[proposal.id].recommendations.length > 0 && (
              <div className="mt-4">
                <h5 className="font-medium text-gray-800 mb-2">Recommendations:</h5>
                <ul className="space-y-1">
                  {analysisResults[proposal.id].recommendations.map((rec: string, index: number) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="text-purple-600 mr-2">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="p-6 bg-gray-50 border-t border-gray-100">
          {proposal.status === 'SUBMITTED' ? (
            <div className="space-y-3">
              <div className="flex space-x-3">
                <Button
                  onClick={() => analyzeProposal(proposal)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  disabled={analyzingProposalId === proposal.id}
                >
                  {analyzingProposalId === proposal.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Analyze with AI
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleAcceptProposal(proposal)}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  disabled={acceptingProposalId === proposal.id}
                >
                  {acceptingProposalId === proposal.id ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Accepting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Accept & Hire
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : proposal.status === 'PENDING' ? (
            <div className="flex items-center justify-center py-3">
              <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">ACCEPTED - PENDING</span>
              </div>
            </div>
          ) : proposal.status === 'DECLINED' ? (
            <div className="flex items-center justify-center py-3">
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-4 py-2 rounded-full border border-red-200">
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold">DECLINED</span>
              </div>
            </div>
          ) : proposal.status === 'ACCEPTED' ? (
            <div className="flex items-center justify-center py-3">
              <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-200">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">ACCEPTED</span>
              </div>
            </div>
          ) : proposal.status === 'CONTRACTED' ? (
            <div className="flex items-center justify-center py-3">
              <Button
                onClick={() => router.push(`/workspace/${proposal.contractId || proposal.id}`)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-semibold"
              >
                <Briefcase className="w-5 h-5 mr-2" />
                Go to Workspace
              </Button>
            </div>
          ) : proposal.status === 'REJECTED' ? (
            <div className="flex items-center justify-center py-3">
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-4 py-2 rounded-full border border-red-200">
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold">REJECTED</span>
              </div>
            </div>
          ) : null}
        </div>
      </motion.div>
    );
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
          <p className="text-gray-600">Loading job details and proposals...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The job you\'re looking for doesn\'t exist.'}</p>
          <Button onClick={() => router.back()} className="bg-blue-600 hover:bg-blue-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {job.title || job.projectName}
              </h1>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Posted {safeFormatDate(job.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{proposals.length} proposal{proposals.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4" />
                  <span>${job.budget || `${Math.floor((job.minBudgetCents || 0) / 100)} - ${Math.floor((job.maxBudgetCents || 0) / 100)}`}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Job Description Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Job Description</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {job.description}
            </p>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-4">
            {job.category && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {job.category}
              </span>
            )}
            {job.skills?.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Proposals Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Proposals ({proposals.length})
            </h2>
            {proposals.length > 0 && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <TrendingUp className="w-4 h-4" />
                <span>Sorted by submission date</span>
              </div>
            )}
          </div>

          {proposals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-12 text-center"
            >
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Proposals Yet</h3>
              <p className="text-gray-600 mb-6">
                Freelancers haven't submitted any proposals for this job yet.
              </p>
              <Button
                onClick={() => router.push('/jobs')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
              >
                Back to Jobs
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence>
                {proposals.map((proposal, index) => (
                  <ProposalCard key={proposal.id} proposal={proposal} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Payment Gateway Modal */}
      <PaymentGatewayModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, proposal: null })}
        onPaymentSuccess={handlePaymentSuccess}
        proposal={paymentModal.proposal ? {
          id: paymentModal.proposal.id,
          proposedRate: paymentModal.proposal.proposedRate,
          freelancerInfo: paymentModal.proposal.freelancerInfo,
          deliveryDays: paymentModal.proposal.deliveryDays
        } : {
          id: 0,
          proposedRate: 0,
          freelancerInfo: { name: 'Unknown' },
          deliveryDays: 0
        }}
        job={{
          id: jobId,
          title: job?.title || job?.projectName || 'Unknown Job',
          currency: job?.currency || 'USD'
        }}
      />
    </div>
  );
}
