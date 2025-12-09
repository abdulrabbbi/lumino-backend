import React, { useState } from 'react';
import { ArrowLeft, MoreVertical, LogOut } from 'lucide-react';
import { PostInput } from '../../components/community-components/post-input';
import { Post } from '../../components/community-components/post';

export function CommunityDetailPage({ community, onBack }) {
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: 'Liam Johnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam',
      timeAgo: '2 hours ago',
      content: "Kits are so excited to go for a beach day. So ready to build memories at Empire Haven on someday flow on they adventure begins.",
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
      likes: 507,
      comments: 23,
      shares: 12,
      liked: false,
    },
  ]);

  // State for dropdown and modal
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddPost = (content) => {
    const newPost = {
      id: posts.length + 1,
      author: 'You',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
      timeAgo: 'just now',
      content: content,
      image: null,
      likes: 0,
      comments: 0,
      shares: 0,
      liked: false,
    };
    setPosts([newPost, ...posts]);
  };

  const handleLikePost = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  // Handle leaving community
  const handleLeaveCommunity = () => {
    console.log('Leaving community:', community.id);
    // Here you would typically:
    // 1. Make an API call to leave the community
    // 2. Update your state/backend
    // 3. Redirect the user or show a success message
    
    setIsModalOpen(false);
    setIsDropdownOpen(false);
    
    // For now, just log and close the modal
    alert(`You have left ${community.name}`);
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (e) => {
    if (!e.target.closest('.dropdown-container') && !e.target.closest('.three-dots-button')) {
      setIsDropdownOpen(false);
    }
  };

  // Add event listener for clicking outside
  React.useEffect(() => {
    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between relative">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div className='flex flex-col'>
              <h1 className="text-xl inter-tight-700 font-bold text-gray-900">{community.name}</h1>
              <p className="text-gray-700 inter-tight-400 text-sm leading-relaxed">
                {community.description}
              </p>
            </div>
          </div>
          
          {/* Three dots button and dropdown */}
          <div className="relative dropdown-container">
            <button 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors three-dots-button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-label="More options"
              aria-expanded={isDropdownOpen}
            >
              <MoreVertical className="w-5 h-5 text-gray-700" />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button
                  onClick={() => {
                    setIsModalOpen(true);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm inter-tight-400 text-left text-red-600 hover:bg-red-50 transition-colors"
                >
                  <span className="">Leave Community</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl inter-tight-600 text-gray-900 mb-2">
              Leave Community?
            </h2>
            <p className="text-gray-600 text-sm inter-tight-400 mb-6">
              Are you sure you want to leave "{community.name}"? You won't be able to post or see community updates anymore.
            </p>
            
            <div className="flex flex-col gap-3">
              
              <button
                onClick={handleLeaveCommunity}
                className="justify-center md:w-auto w-full cursor-pointer text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary hover:bg-primary/90 h-11 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 whitespace-nowrap"
              >
               Confirm, Leave
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 px-4 border border-gray-300 text-sm rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Stay in Community
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
        {/* Post Input */}
        <PostInput onPost={handleAddPost} />

        {/* Posts Feed */}
        <div className="space-y-4 mt-8">
          {posts.map((post) => (
            <Post
              key={post.id}
              post={post}
              onLike={() => handleLikePost(post.id)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}