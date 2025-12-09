/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAdminCommunity from '../../hooks/useAdminCommunity';

const EditCommunity = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { getCommunities, updateCommunity, loading: apiLoading } = useAdminCommunity();

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
    rules: '',
    status: 'active'
  });

  const categories = [
    'general', 'technology', 'gaming', 'education', 'health',
    'business', 'entertainment', 'sports', 'art', 'music',
    'food', 'travel', 'fitness', 'science', 'politics'
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'archived', label: 'Archived' },
    { value: 'deleted', label: 'Deleted' }
  ];

  useEffect(() => {
    fetchCommunity();
  }, [id]);

  const fetchCommunity = async () => {
    try {
      setLoading(true);
      const data = await getCommunities({ 
        limit: 1, 
        page: 1,
        search: '',
        status: 'all' 
      });
      
      const community = data.communities?.find(c => c._id === id);
      if (community) {
        setFormData({
          name: community.name || '',
          description: community.description || '',
          image: community.image || '',
          coverImage: community.coverImage || '',
          isPublic: community.isPublic ?? true,
          requiresApproval: community.requiresApproval ?? false,
          maxMembers: community.maxMembers || 0,
          category: community.category || 'general',
          tags: community.tags ? community.tags.join(', ') : '',
          rules: community.rules ? community.rules.join('\n') : '',
          status: community.status || 'active'
        });
      }
    } catch (err) {
      setError('Failed to fetch community details');
      console.error('Error fetching community:', err);
    } finally {
      setLoading(false);
    }
  };

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
      setSaving(true);
      setError('');
      setSuccess('');

      const data = {
        ...formData,
        maxMembers: parseInt(formData.maxMembers) || 0,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        rules: formData.rules.split('\n').filter(rule => rule.trim())
      };

      await updateCommunity(id, data);
      setSuccess('Community updated successfully!');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/admin-dashboard/view-community/${id}`);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update community');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/admin-dashboard/view-community/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 ">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl inter-tight-600 text-gray-900">Edit Community</h1>
                <p className="mt-1 text-sm inter-tight-400 text-gray-600">
                  Update community settings and information
                </p>
              </div>
              <button
                onClick={handleCancel}
                className="text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-3">

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white  p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            
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
                  className="w-full px-3 py-2 border border-slate-300/70 outline-none inter-tight-400 text-sm  rounded-lg"
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
                  className="w-full px-3 py-2 border border-slate-300/70 outline-none inter-tight-400 text-sm  rounded-lg"
                  placeholder="Describe your community"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300/70 outline-none inter-tight-400 text-sm  rounded-lg"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300/70 outline-none inter-tight-400 text-sm  rounded-lg"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
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
                <p className="mt-1 text-sm text-gray-500">Separate tags with commas</p>
              </div>
            </div>
          </div>

          {/* Community Settings */}
          <div className="bg-white p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Community Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="isPublic" className="text-sm inter-tight-400 font-medium text-gray-700">
                    Public Community
                  </label>
                  <p className="text-sm text-gray-500 inter-tight-400">
                    Anyone can see and join this community
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="isPublic"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
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
                <label className="relative inline-flex items-center inter-tight-400 cursor-pointer">
                  <input
                    type="checkbox"
                    id="requiresApproval"
                    name="requiresApproval"
                    checked={formData.requiresApproval}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <label htmlFor="maxMembers" className="block text-sm inter-tight-400 font-medium text-gray-700 mb-2">
                  Maximum Members
                </label>
                <input
                  type="number"
                  id="maxMembers"
                  name="maxMembers"
                  value={formData.maxMembers}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-slate-300/70 outline-none inter-tight-400 text-sm  rounded-lg"
                  placeholder="0 for unlimited"
                />
                <p className="mt-1 text-sm text-gray-500 inter-tight-400">Enter 0 for unlimited members</p>
              </div>
            </div>
          </div>

          {/* Community Rules */}
          <div className="bg-white p-3">
            <h2 className="text-lg inter-tight-600 text-gray-900 mb-4">Community Rules</h2>
            <div>
              <label htmlFor="rules" className="block text-sm font-medium inter-tight-400 text-gray-700 mb-2">
                Rules (one per line)
              </label>
              <textarea
                id="rules"
                name="rules"
                value={formData.rules}
                onChange={handleChange}
                rows={5}
                className="w-full px-3 py-2 border border-slate-300/70 outline-none inter-tight-400 text-sm  rounded-lg"
                placeholder="1. Be respectful to other members
2. No spam or self-promotion
3. Keep discussions on topic"
              />
              <p className="mt-1 text-sm text-gray-500 inter-tight-400">Enter each rule on a new line</p>
            </div>
          </div>

          {/* Images */}
          <div className="bg-whitep-3">
            <h2 className="text-lg inter-tight-600 text-gray-900 mb-4">Community Images</h2>
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
                  className="w-full px-3 py-2 border border-slate-300/70 outline-none inter-tight-400 text-sm  rounded-lg"
                  placeholder="https://example.com/profile.jpg"
                />
               
              </div>
              <div>
                <label htmlFor="coverImage" className="block text-sm inter-tight-400 font-medium text-gray-700 mb-2">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  id="coverImage"
                  name="coverImage"
                  value={formData.coverImage}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300/70 outline-none inter-tight-400 text-sm  rounded-lg"
                  placeholder="https://example.com/cover.jpg"
                />
                
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:justify-end space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border text-sm inter-tight-400 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || apiLoading}
              className="px-6 py-3 bg-blue-600 text-sm inter-tight-400 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              {saving ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </span>
              ) : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCommunity;