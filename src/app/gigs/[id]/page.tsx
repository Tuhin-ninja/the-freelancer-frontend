'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Star, 
  Clock, 
  CheckCircle, 
  User, 
  MessageSquare, 
  Heart,
  Share2,
  Crown,
  Zap,
  Gift,
  Calendar,
  RefreshCw,
  Shield,
  Award,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAppSelector } from '@/store/hooks';
import gigService from '@/services/gig';
import { Gig, GigPackage } from '@/types/api';

interface PackageCardProps {
  package: GigPackage;
  index: number;
  onSelect: () => void;
  selected: boolean;
}

const PackageCard = ({ package: pkg, index, onSelect, selected }: PackageCardProps) => {
  const tierColors = {
    BASIC: {
      gradient: 'from-green-400 to-blue-500',
      border: 'border-green-200',
      bg: 'bg-green-50',
      text: 'text-green-700',
      icon: Gift
    },
    STANDARD: {
      gradient: 'from-purple-400 to-pink-500',
      border: 'border-purple-200',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      icon: Crown
    },
    PREMIUM: {
      gradient: 'from-yellow-400 to-orange-500',
      border: 'border-yellow-200',
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      icon: Zap
    }
  };

  const config = tierColors[pkg.tier] || tierColors.BASIC;
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      whileHover={{ scale: 1.05, y: -10 }}
      className="relative"
    >
      <div 
        className={`relative overflow-hidden rounded-3xl border-2 transition-all duration-300 cursor-pointer ${
          selected ? 'border-blue-500 shadow-2xl' : `${config.border} hover:shadow-xl`
        }`}
        onClick={onSelect}
      >
        {/* Animated background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-10`} />
        
        {/* Tier badge */}
        <div className="relative p-6 bg-white/80 backdrop-blur-sm">
          <div className={`inline-flex items-center px-4 py-2 rounded-full ${config.bg} ${config.text} text-sm font-bold mb-4`}>
            <IconComponent className="h-4 w-4 mr-2" />
            {pkg.tier}
          </div>
          
          {selected && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-4 right-4"
            >
              <div className="bg-blue-500 text-white rounded-full p-2">
                <CheckCircle className="h-5 w-5" />
              </div>
            </motion.div>
          )}
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.title}</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">{pkg.description}</p>
          
          {/* Price */}
          <div className="mb-6">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-gray-900">
                ${(pkg.priceCents / 100).toLocaleString()}
              </span>
              <span className="ml-2 text-gray-500">{pkg.currency}</span>
            </div>
          </div>
          
          {/* Features */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center text-gray-700">
              <Calendar className="h-4 w-4 mr-3 text-blue-500" />
              <span>{pkg.deliveryDays} days delivery</span>
            </div>
            
            {pkg.revisions && (
              <div className="flex items-center text-gray-700">
                <RefreshCw className="h-4 w-4 mr-3 text-green-500" />
                <span>{pkg.revisions} revisions</span>
              </div>
            )}
            
            <div className="flex items-center text-gray-700">
              <Shield className="h-4 w-4 mr-3 text-purple-500" />
              <span>Money-back guarantee</span>
            </div>
          </div>
          
          {/* Select button */}
          <Button 
            className={`w-full py-3 rounded-xl transition-all duration-300 ${
              selected 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : `bg-gradient-to-r ${config.gradient} hover:shadow-lg text-white`
            }`}
            onClick={onSelect}
          >
            {selected ? 'Selected' : 'Select Package'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default function GigDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const gigId = parseInt(params.id as string);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [gig, setGig] = useState<Gig | null>(null);
  const [packages, setPackages] = useState<GigPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<GigPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [proposalForm, setProposalForm] = useState({
    message: '',
    timeline: ''
  });
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    fetchGigDetails();
  }, [gigId]);

  const fetchGigDetails = async () => {
    try {
      setLoading(true);
      const [gigResponse, packagesResponse] = await Promise.all([
        gigService.gigAPI.getGigById(gigId),
        gigService.gigAPI.getGigPackages(gigId)
      ]);
      
      setGig(gigResponse);
      setPackages(packagesResponse);
      console.log('Gig details:', gigResponse);
      console.log('Packages:', packagesResponse);
    } catch (error) {
      console.error('Error fetching gig details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePackageSelect = (pkg: GigPackage) => {
    setSelectedPackage(pkg);
  };

  const handleSendProposal = () => {
    if (!selectedPackage) return;
    
    setShowProposalForm(true);
  };

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement proposal submission
    console.log('Submitting proposal:', {
      gigId,
      packageId: selectedPackage?.id,
      message: proposalForm.message,
      timeline: proposalForm.timeline
    });
    
    // Show success message and redirect
    alert('Proposal sent successfully!');
    router.push('/gigs');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Gig not found</h2>
          <Button onClick={() => router.push('/gigs')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Gigs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/gigs')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Gigs
            </Button>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => setIsLiked(!isLiked)}>
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current text-red-500' : 'text-gray-500'}`} />
              </Button>
              <Button variant="ghost">
                <Share2 className="h-5 w-5 text-gray-500" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Gig Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8 border border-white/20"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <motion.h1 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-4xl font-bold text-gray-900 mb-4 leading-tight"
              >
                {gig.title}
              </motion.h1>
              
              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3">
                    {gig.freelancerInfo?.name ? gig.freelancerInfo.name.charAt(0).toUpperCase() : 'F'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{gig.freelancerInfo?.name || 'Freelancer'}</p>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      <span className="text-sm text-gray-600">{gig.rating || 4.8} (127 reviews)</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-gray-700 leading-relaxed text-lg mb-6"
              >
                {gig.description}
              </motion.p>
              
              {/* Tags */}
              {gig.tags && gig.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {gig.tags.map((tag, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                      className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Packages Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center">
              <Sparkles className="mr-3 h-8 w-8 text-purple-500" />
              Choose Your Perfect Package
            </h2>
            <p className="text-gray-600 text-lg">Select the package that best fits your needs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <PackageCard
                key={pkg.id}
                package={pkg}
                index={index}
                onSelect={() => handlePackageSelect(pkg)}
                selected={selectedPackage?.id === pkg.id}
              />
            ))}
          </div>
        </motion.div>

        {/* Action Section */}
        <AnimatePresence>
          {selectedPackage && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20"
            >
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-full font-bold text-lg mb-4"
                >
                  <Award className="mr-2 h-5 w-5" />
                  {selectedPackage.tier} Package Selected
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedPackage.title}</h3>
                <p className="text-3xl font-bold text-gray-900">
                  ${(selectedPackage.priceCents / 100).toLocaleString()}
                </p>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handleSendProposal}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-12 py-4 rounded-xl text-lg font-bold transition-all duration-300 hover:shadow-2xl hover:scale-105"
                >
                  Send Proposal
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Proposal Form Modal */}
        <AnimatePresence>
          {showProposalForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Send Proposal</h3>
                  <Button
                    variant="ghost"
                    onClick={() => setShowProposalForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </Button>
                </div>

                <form onSubmit={handleSubmitProposal} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Message
                    </label>
                    <Textarea
                      value={proposalForm.message}
                      onChange={(e) => setProposalForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Tell the freelancer about your project requirements..."
                      rows={5}
                      className="w-full rounded-xl border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timeline (optional)
                    </label>
                    <Input
                      value={proposalForm.timeline}
                      onChange={(e) => setProposalForm(prev => ({ ...prev, timeline: e.target.value }))}
                      placeholder="When do you need this completed?"
                      className="w-full rounded-xl border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowProposalForm(false)}
                      className="flex-1 rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl"
                    >
                      Send Proposal
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
