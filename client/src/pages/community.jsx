import React, { useState } from 'react';
import { CommunityListPage } from './community-modes/community-list-page';
import { CommunityDetailPage } from './community-modes/community-detail-page';

export default function App() {
  const [currentPage, setCurrentPage] = useState('list');
  const [selectedCommunity, setSelectedCommunity] = useState(null);

  const handleSelectCommunity = (community) => {
    setSelectedCommunity(community);
    setCurrentPage('detail');
  };

  const handleBackToList = () => {
    setCurrentPage('list');
    setSelectedCommunity(null);
  };

  return (
    <div className="min-h-screen ">
      {currentPage === 'list' ? (
        <CommunityListPage onSelectCommunity={handleSelectCommunity} />
      ) : (
        <CommunityDetailPage community={selectedCommunity} onBack={handleBackToList} />
      )}
    </div>
  );
}