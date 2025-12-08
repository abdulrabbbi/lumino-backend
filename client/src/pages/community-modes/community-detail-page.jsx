import React, { useState } from 'react';

import { ArrowLeft, MoreVertical } from 'lucide-react';
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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
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
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </header>

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