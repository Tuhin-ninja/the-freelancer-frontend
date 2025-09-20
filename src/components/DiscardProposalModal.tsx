'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DiscardProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  proposalId: number;
  freelancerName: string;
  isLoading?: boolean;
}

export default function DiscardProposalModal({
  isOpen,
  onClose,
  onConfirm,
  proposalId,
  freelancerName,
  isLoading = false
}: DiscardProposalModalProps) {
  const [reason, setReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');

  const predefinedReasons = [
    'Found a better proposal',
    'Budget constraints',
    'Project requirements changed',
    'Freelancer not responsive',
    'Timeline mismatch',
    'Other'
  ];

  const handleConfirm = () => {
    const finalReason = selectedReason === 'Other' ? reason : selectedReason;
    if (!finalReason.trim()) {
      alert('Please provide a reason for discarding this proposal');
      return;
    }
    onConfirm(finalReason);
  };

  const handleReasonSelect = (selectedReason: string) => {
    setSelectedReason(selectedReason);
    if (selectedReason !== 'Other') {
      setReason(selectedReason);
    } else {
      setReason('');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Discard Proposal
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  From {freelancerName}
                </p>
              </div>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-red-800">
                    Warning: This action cannot be undone
                  </h4>
                  <p className="text-sm text-red-700 mt-1">
                    Discarding this proposal will refund the escrow payment and remove the proposal from consideration.
                  </p>
                </div>
              </div>
            </div>

            {/* Reason Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Why are you discarding this proposal? *
              </label>
              <div className="space-y-2">
                {predefinedReasons.map((reasonOption) => (
                  <label
                    key={reasonOption}
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={reasonOption}
                      checked={selectedReason === reasonOption}
                      onChange={(e) => handleReasonSelect(e.target.value)}
                      disabled={isLoading}
                      className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">{reasonOption}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Reason Input */}
            {selectedReason === 'Other' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Please specify your reason
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={isLoading}
                  placeholder="Please provide a detailed reason..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none disabled:opacity-50"
                  rows={3}
                />
              </div>
            )}

            {/* Proposal Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Proposal Details</h4>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Proposal ID:</span> #{proposalId}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Freelancer:</span> {freelancerName}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading || !reason.trim()}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Discarding...
                  </>
                ) : (
                  'Discard Proposal'
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}