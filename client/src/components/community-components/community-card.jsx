// components/community-components/community-card.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export function CommunityCard({ community, onSelect, onJoin }) {
  const navigate = useNavigate();
  
  const {
    name,
    description,
    image,
    memberCount,
    members = [],
    buttonText,
    canJoin,
    canView = true, // Default to true if undefined
    viewMessage = '',
    redirectAction,
    isLocked,
    joinStatus // Added to check status
  } = community;

  const handleCardClick = () => {
    console.log('Card clicked:', { canView, joinStatus, redirectAction }); // Debug log
    
    // If user can't view community
    if (!canView) {
      // Show toast message - only if viewMessage is not empty
      const message = viewMessage || 'You need to join this community to view details';
      if (message.trim()) {
        toast.error(message, {
          duration: 3000,
        });
      }
      
      // Handle redirection based on redirectAction
      if (redirectAction === 'signup') {
        setTimeout(() => {
          navigate('/signup', { state: { from: '/communities' } });
        }, 1500);
      } else if (redirectAction === 'upgrade') {
        setTimeout(() => {
          navigate('/pricing', { state: { from: '/communities' } });
        }, 1500);
      }
      return;
    }
    
    // If user can view, trigger the onSelect (to navigate to community details)
    if (onSelect) {
      onSelect();
    }
  };

  const handleButtonClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (onJoin) {
      onJoin(e);
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col ${
        !canView ? 'opacity-95 hover:opacity-100 active:scale-[0.99]' : ''
      }`}
      onClick={handleCardClick}
    >
      <div className="w-full h-40 sm:h-48 overflow-hidden relative">
        <img
          src={image || "/placeholder.svg"}
          alt={name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = "/placeholder.svg";
          }}
        />
        
        {/* Show lock icon only if canView is false */}
        {canView === false && (
          <div className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      <div className="p-3 flex-1 flex flex-col">
        <h3 className="text-md inter-tight-700 text-gray-900 mb-2 flex items-center gap-2">
          {name}
          {canView === false && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              Join to View
            </span>
          )}
        </h3>

        <p className="text-sm text-gray-600 inter-tight-400 mb-4 flex-1 line-clamp-2">
          {description}
        </p>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex -space-x-2">
            {members.slice(0, 3).map((member, idx) => (
              <img
                key={idx}
                src={member.avatar || "/placeholder.svg"}
                alt="Member"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white"
              />
            ))}
          </div>
          <span className="text-xs inter-tight-400 text-gray-600">
            +{(memberCount || 0).toLocaleString()} members
          </span>
        </div>

        <button
          className={`justify-center md:w-auto w-full cursor-pointer text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-11 text-white font-semibold py-5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
            !canJoin ? 'opacity-75 hover:opacity-75 cursor-not-allowed bg-gray-400' : 
            joinStatus === 'joined' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
          }`}
          onClick={handleButtonClick}
          disabled={!canJoin}
        >
          {buttonText || ''}
          {!canJoin && isLocked && (
            <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}