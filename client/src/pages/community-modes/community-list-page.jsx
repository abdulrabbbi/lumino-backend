/* eslint-disable no-unused-vars */
// pages/community/CommunityListPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommunity } from '../../hooks/useCommunity';
import { CommunityCard } from '../../components/community-components/community-card'
import LoaderOverlay from '../../components/LoaderOverlay';
import { ToastContainer } from 'react-toastify';


export default function CommunityListPage() {
  const [communities, setCommunities] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const { getAllCommunities, joinCommunity, loading, error } = useCommunity();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const data = await getAllCommunities();
      setCommunities(data.communities || []);
    } catch (err) {
      console.error('Error fetching communities:', err);
    }
  };

  const handleCommunityClick = (communityId) => {
    navigate(`/community-details/${communityId}`);
  };

  const handleJoinCommunity = async (community, e) => {
    e.stopPropagation();

    const redirectAction = community.redirectAction;

    switch (redirectAction) {
      case 'signup':
        navigate('/signup', { state: { from: '/communities' } });
        return;

      case 'upgrade':
        navigate('/pricing', { state: { from: '/communities' } });
        return;

      case 'view':
        navigate(`/community-details/${community._id}`);
        return;

      case 'join':
        try {
          await joinCommunity(community._id);
          fetchCommunities();
        } catch (err) {
          console.error('Error joining community:', err);

          // Check if error has redirect action
          if (err.response?.data?.redirectAction === 'upgrade') {
            navigate('/subscription', { state: { from: '/communities' } });
          }
        }
        return;

      default:
        // Fallback to signup if no redirect action
        navigate('/signup', { state: { from: '/communities' } });
    }
  };

  if (loading) {
    return <LoaderOverlay />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <ToastContainer style={{ zIndex: 10000000000000 }} />
      <div className="md:w-[90%] mx-auto w-full">


        {communities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 inter-tight-400 text-sm ">No communities found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {communities.map((community) => (
              <CommunityCard
                key={community._id}
                community={{
                  id: community._id,
                  name: community.name,
                  description: community.description,
                  image: community.image || '',
                  memberCount: community.stats?.memberCount || community.memberCount || 0,
                  isMember: community.joinStatus === 'joined',
                  buttonText: community.buttonText || "",
                  redirectAction: community.redirectAction,
                  canJoin: community.canJoin,
                  canView: community.canView, // ADD THIS
                  viewMessage: community.viewMessage, // ADD THIS
                  isLocked: community.isLocked,
                  joinStatus: community.joinStatus, // ADD THIS if needed
                  isGuest: community.isGuest // ADD THIS if needed
                }}
                onSelect={() => handleCommunityClick(community._id)}
                onJoin={(e) => handleJoinCommunity(community, e)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}