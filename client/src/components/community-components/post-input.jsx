import React, { useState, useRef } from 'react';
import { ImageIcon, Smile, X, Loader2 } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

export function PostInput({ onPost, isLoading = false }) {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handlePost = () => {
    if (content.trim() || image) {
      onPost(content, image);
      setContent('');
      setImage(null);
      setImagePreview(null);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.info('Image size should be less than 5MB');
        return;
      }

      setImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handlePost();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
      <ToastContainer style={{zIndex: 1000000000000000}}/>
      <h3 className="text-gray-900 inter-tight-600 font-semibold text-base mb-4">
        Create a post
      </h3>

      <div className="space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Share your thoughts with the community..."
          className="w-full p-4 border inter-tight-400 border-gray-200 rounded-lg resize-none text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-gray-400 bg-gray-50 hover:bg-white transition-colors"
          rows="4"
          disabled={isLoading}
        />

        {imagePreview && (
          <div className="relative rounded-lg overflow-hidden border border-gray-200">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="w-full max-h-64 object-contain"
            />
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              aria-label="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* File Input (hidden) */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelect}
          accept="image/*"
          className="hidden"
          disabled={isLoading}
        />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              <ImageIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Add Image</span>
            </button>
          
          </div>

          <div className="flex items-center gap-3">
            {/* Character Counter */}
            <div className="text-sm text-gray-500 hidden sm:block">
              {content.length}/1000
            </div>
            
            <button
              onClick={handlePost}
              disabled={(!content.trim() && !image) || isLoading}
              className="w-full sm:w-auto px-6 py-3 text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2 min-w-[100px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Posting...
                </>
              ) : (
                'Post'
              )}
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-xs text-gray-500 inter-tight-400 pt-2 border-t border-gray-100">
          <p>• Share your thoughts, questions, or experiences</p>
          <p>• You can add images to make your post more engaging</p>
        </div>
      </div>
    </div>
  );
}