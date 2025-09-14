'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import GigList from '@/components/GigList';
import gigService from '@/services/gig';
import { Gig } from '@/types/api';

export default function GigsPage() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchGigs();
  }, [selectedCategory]);

  const fetchGigs = async () => {
    try {
      setLoading(true);
      const response = await gigService.getAllGigs();
      setGigs(response.content || []);
    } catch (error) {
      console.error('Error fetching gigs:', error);
      setGigs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just filter locally since there's no search endpoint
    // In a real app, you'd call a search API
    fetchGigs();
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

  const filteredGigs = gigs.filter(gig => {
    const matchesSearch = !searchQuery ||
      gig.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gig.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = !selectedCategory || selectedCategory === 'All Categories' ||
      gig.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Browse Professional Services
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Find the perfect freelancer for your project
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4 bg-white rounded-lg p-2 shadow-lg">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Search for services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-gradient-to-r from-gray-50 via-white to-gray-50 text-gray-800 placeholder-gray-400 text-lg rounded-xl shadow-sm border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-300"
                  />

                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white px-8"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Search
                </Button>
              </div>
            </form>
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
                <Filter className="mr-2 h-5 w-5 text-gray-700" />
                Categories
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category === 'All Categories' ? '' : category)}
                    className={`w-full text-left px-3 py-2 rounded transition-colors ${(selectedCategory === category) || (selectedCategory === '' && category === 'All Categories')
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCategory || 'All Services'}
                </h2>
                <p className="text-gray-600">
                  {filteredGigs.length} service{filteredGigs.length !== 1 ? 's' : ''} available
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Gig List */}
            <GigList
              gigs={filteredGigs}
              loading={loading}
              onGigClick={(gig) => {
                // Navigate to gig detail page
                window.location.href = `/gigs/${gig.id}`;
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
