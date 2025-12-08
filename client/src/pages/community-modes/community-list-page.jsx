import React from 'react';
import { CommunityCard } from '../../components/community-components/community-card';

export function CommunityListPage({ onSelectCommunity }) {
  const communities = [
    {
      id: 1,
      name: 'Gratitude Garden',
      description: 'Explore playful activities that nurture thankfulness in everyday...',
      image: 'https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=400&h=300&fit=crop',
      members: [
        { id: 1, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
        { id: 2, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka' },
      ],
      memberCount: 2840,
      buttonText: 'JOIN',
      buttonStyle: 'bg-emerald-400',
    },
    {
      id: 2,
      name: 'Resilience Builders',
      description: 'A space to share tips, activities, and encouragement for raising...',
      image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop',
      members: [
        { id: 1, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Garfield' },
        { id: 2, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Whiskers' },
      ],
      memberCount: 5200,
      buttonText: 'REQUEST TO JOIN',
      buttonStyle: 'bg-emerald-400',
    },
    {
      id: 3,
      name: 'Creativity Cove',
      description: 'Engage in artistic endeavors that inspire innovation and expressi...',
      image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop',
      members: [
        { id: 1, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky' },
        { id: 2, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Max' },
      ],
      memberCount: 3100,
      buttonText: 'REQUEST TO JOIN',
      buttonStyle: 'bg-emerald-400',
    },
    {
      id: 4,
      name: 'Mindfulness Meadow',
      description: 'Discover calming practices that cultivate awareness and presen...',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop',
      members: [
        { id: 1, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bella' },
        { id: 2, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie' },
      ],
      memberCount: 4100,
      buttonText: 'JOIN',
      buttonStyle: 'bg-emerald-400',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      {/* <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl text-center  sm:text-3xl font-bold text-gray-900">Community</h1>
        </div>
      </header> */}

      {/* Content */}
      <main className="md:w-[95%] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {communities.map((community) => (
            <CommunityCard
              key={community.id}
              community={community}
              onSelect={() => onSelectCommunity(community)}
            />
          ))}
        </div>
      </main>

    
    </div>
  );
}