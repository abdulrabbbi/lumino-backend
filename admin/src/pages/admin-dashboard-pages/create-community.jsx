import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAdminCommunity from '../../hooks/useAdminCommunity';
import { ToastContainer, toast } from 'react-toastify';
const CreateCommunity = () => {
  const navigate = useNavigate();
  const { createCommunity, loading } = useAdminCommunity();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    coverImage: '',
    isPublic: true,
    requiresApproval: false,
    maxMembers: 0,
    category: 'general',
    tags: '',
    rules: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        rules: formData.rules.split('\n').filter(rule => rule.trim()),
        maxMembers: parseInt(formData.maxMembers) || 0
      };
      
      await createCommunity(data);
      toast.success('Community created successfully!');
      setTimeout(() => {
        navigate('/admin-dashboard/manage-communities');

      }, 2000);
    } catch (err) {
      toast.error('Failed to create community. Please try again.');
      console.error('Error creating community:', err);
    }
  };

  const categories = [
    'general',
    'technology',
    'gaming',
    'education',
    'health',
    'business',
    'entertainment',
    'sports'
  ];

  return (
    <div className="min-h-screen ">
      <ToastContainer />
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 ">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl inter-tight-700 text-gray-900">Create New Community</h1>
              <p className="mt-1 text-sm inter-tight-400 text-gray-600">
                Create a new community and manage its settings
              </p>
            </div>
            
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto  py-2">
        <form onSubmit={handleSubmit} className="space-y-8">
        

          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg inter-tight-600 text-gray-900 mb-4">Basic Information</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Community Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300/70 outline-none inter-tight-400 text-sm  rounded-lg "
                  placeholder="Enter community name"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300/70 outline-none inter-tight-400 text-sm  rounded-lg "
                  placeholder="Describe your community"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300/70 outline-none inter-tight-400 text-sm  rounded-lg "
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300/70 outline-none inter-tight-400 text-sm  rounded-lg"
                  placeholder="technology, programming, webdev"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg inter-tight-600 text-gray-900 mb-4">Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="isPublic" className="text-sm font-medium inter-tight-400 text-gray-700">
                    Public Community
                  </label>
                  <p className="text-sm text-gray-500 inter-tight-400">
                    Anyone can see and join this community
                  </p>
                </div>
                <div className="relative inline-block w-12 align-middle select-none">
                  <input
                    type="checkbox"
                    id="isPublic"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div 
                    className={`block w-12 h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                      formData.isPublic ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, isPublic: !prev.isPublic }))}
                  >
                    <div 
                      className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${
                        formData.isPublic ? 'transform translate-x-6' : ''
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="requiresApproval" className="text-sm inter-tight-400 font-medium text-gray-700">
                    Require Approval
                  </label>
                  <p className="text-sm text-gray-500 inter-tight-400">
                    New members require admin approval
                  </p>
                </div>
                <div className="relative inline-block w-12 align-middle select-none">
                  <input
                    type="checkbox"
                    id="requiresApproval"
                    name="requiresApproval"
                    checked={formData.requiresApproval}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div 
                    className={`block w-12 h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                      formData.requiresApproval ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, requiresApproval: !prev.requiresApproval }))}
                  >
                    <div 
                      className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${
                        formData.requiresApproval ? 'transform translate-x-6' : ''
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="maxMembers" className="block text-sm inter-tight-400 font-medium text-gray-700 mb-2">
                  Maximum Members (0 for unlimited)
                </label>
                <input
                  type="number"
                  id="maxMembers"
                  name="maxMembers"
                  value={formData.maxMembers}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border inter-tight-400 border-gray-300 outline-none rounded-lg "
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg inter-tight-600 text-gray-900 mb-4">Community Rules</h2>
            <div>
              <label htmlFor="rules" className="block text-sm font-medium text-gray-700 mb-2">
                Rules (one per line)
              </label>
              <textarea
                id="rules"
                name="rules"
                value={formData.rules}
                onChange={handleChange}
                rows={5}
                className="w-full px-3 py-2 border border-slate-300/70 outline-none inter-tight-400 text-sm  rounded-lg"
                placeholder="Enter community rules, one per line"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg inter-tight-600 text-gray-900 mb-4">Images</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Image URL
                </label>
                <input
                  type="url"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300/70 outline-none inter-tight-400 text-sm  rounded-lg "
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  id="coverImage"
                  name="coverImage"
                  value={formData.coverImage}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300/70 outline-none inter-tight-400 text-sm  rounded-lg "
                  placeholder="https://example.com/cover.jpg"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin-dashboard/manage-communities')}
              className="px-6 py-2 border border-gray-300 text-sm inter-tight-400 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-sm inter-tight-400 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </span>
              ) : 'Create Community'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCommunity;