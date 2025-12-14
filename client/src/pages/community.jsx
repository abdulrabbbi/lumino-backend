import React, { useState } from 'react';
import { CommunityListPage } from './community-modes/community-list-page';
import { CommunityDetailPage } from './community-modes/community-detail-page';

export default function App() {
  const [currentPage, setCurrentPage] = useState('list');
  const [selectedCommunityId, setSelectedCommunityId] = useState(null);

  const handleSelectCommunity = (community) => {
    setSelectedCommunityId(community._id || community.id);
    setCurrentPage('detail');
  };

  const handleBackToList = () => {
    setCurrentPage('list');
    setSelectedCommunityId(null);
  };

  return (
    <div className="min-h-screen">
      {currentPage === 'list' ? (
        <CommunityListPage onSelectCommunity={handleSelectCommunity} />
      ) : (
        <CommunityDetailPage 
          communityId={selectedCommunityId} 
          onBack={handleBackToList} 
        />
      )}
    </div>
  );
}