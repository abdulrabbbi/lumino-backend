import React from 'react';
import { Heart, MessageCircle, Share2, Flag } from 'lucide-react';
import { LuMessageSquareText } from "react-icons/lu";
import { IoMdShare } from "react-icons/io";


export function Post({ post, onLike }) {
  return (
    <div className="bg-white rounded-lg border border-orange-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-orange-50">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img
              src={post.avatar || "/placeholder.svg"}
              alt={post.author}
              className="w-9 sm:w-10 h-9 sm:h-10 rounded-full"
            />
            <div>
              <p className="font-semibold inter-tight-700 text-gray-900 text-sm sm:text-base">
                {post.author}
              </p>
              <p className="text-xs sm:text-sm inter-tight-400 text-gray-500">{post.timeAgo}</p>
            </div>
          </div>
          <button className="p-1 hover:bg-gray-100 rounded">
            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        <p className="text-gray-700 inter-tight-400 text-sm sm:text-base leading-relaxed mb-4">
          {post.content}
        </p>

        {post.image && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img
              src={post.image || "/placeholder.svg"}
              alt="Post content"
              className="w-full h-auto object-cover max-h-80"
            />
          </div>
        )}
      </div>

      {/* Interactions */}
      <div className="px-4 sm:px-5 py-3 bg-gray-50 flex items-center justify-between text-xs sm:text-sm text-gray-600 border-t border-orange-50">
        <div className="flex gap-4">
          <button
            className="flex items-center gap-1 hover:text-red-500 transition-colors group"
            onClick={onLike}
          >
            <Heart
              className={`w-4 h-4 sm:w-5 sm:h-5 transition-all ${
                post.liked ? 'fill-red-500 text-red-500' : 'group-hover:text-red-500'
              }`}
            />
            <span>{post.likes}</span>
          </button>
          <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
            <LuMessageSquareText className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{post.comments}</span>
          </button>
          <button className="flex items-center gap-1 hover:text-green-500 transition-colors">
            <IoMdShare className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{post.shares}</span>
          </button>
        </div>
       
      </div>
    </div>
  );
}