import React, { useState } from 'react';
import { ImageIcon, Smile } from 'lucide-react';

export function PostInput({ onPost }) {
  const [content, setContent] = useState('');

  const handlePost = () => {
    if (content.trim()) {
      onPost(content);
      setContent('');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-orange-100 p-4 ">
      {/* Header */}
      <h3 className="text-gray-700 inter-tight-400 font-semibold text-sm sm:text-base mb-4">
        What's on your mind?
      </h3>

      {/* Input Area */}
      <div className="space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts with the community..."
          className="w-full p-3 sm:p-4 border inter-tight-400 border-orange-100 rounded-lg resize-none text-sm  focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent placeholder-gray-400"
          rows="3"
        />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-emerald-600">
              <ImageIcon className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-emerald-600">
              <Smile className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handlePost}
            disabled={!content.trim()}
            className="w-full sm:w-auto px-6 py-2 bg-emerald-400 inter-tight-400 font-bold rounded-lg hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}