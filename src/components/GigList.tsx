import React from 'react';
import { Search, Star } from 'lucide-react';
import { Gig } from '@/types/api';

interface GigCardProps {
  gig: Gig;
  onClick?: () => void;
}

const GigCard = ({ gig, onClick }: GigCardProps) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900 mb-2">{gig.title}</h3>
          <p className="text-gray-600 text-sm line-clamp-2">{gig.description}</p>
        </div>
        {gig.freelancer?.profilePictureUrl && (
          <img 
            src={gig.freelancer.profilePictureUrl} 
            alt={gig.freelancer.name}
            className="w-12 h-12 rounded-full ml-4"
          />
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {gig.skills?.slice(0, 4).map((skill: string, index: number) => (
          <span 
            key={index}
            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
          >
            {skill}
          </span>
        ))}
        {gig.skills && gig.skills.length > 4 && (
          <span className="text-gray-500 text-xs">+{gig.skills.length - 4} more</span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 ml-1">
              {gig.rating?.toFixed(1) || 'New'}
            </span>
          </div>
          {gig.deliveryDays && (
            <div className="text-sm text-gray-600">
              {gig.deliveryDays} day delivery
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Starting at</div>
          <div className="font-semibold text-green-600">
            ${gig.startingPrice?.toFixed(2) || '0.00'}
          </div>
        </div>
      </div>
    </div>
  );
};

interface GigListProps {
  gigs: Gig[];
  onGigClick?: (gig: Gig) => void;
  loading?: boolean;
}

const GigList = ({ gigs, onGigClick, loading }: GigListProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-full ml-4"></div>
            </div>
            <div className="flex gap-2 mb-4">
              <div className="h-6 bg-gray-200 rounded-full w-16"></div>
              <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              <div className="h-6 bg-gray-200 rounded-full w-14"></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (gigs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Search className="h-16 w-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No gigs found</h3>
        <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {gigs.map((gig) => (
        <GigCard 
          key={gig.id} 
          gig={gig} 
          onClick={() => onGigClick?.(gig)}
        />
      ))}
    </div>
  );
};

export default GigList;
