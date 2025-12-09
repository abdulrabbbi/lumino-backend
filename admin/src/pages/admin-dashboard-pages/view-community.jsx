import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useAdminCommunity from '../../hooks/useAdminCommunity';

const ViewCommunity = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [community, setCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  const {
    getCommunities,
    getCommunityMembers,
    getCommunityPosts,
    syncCommunityStats,
    loading: apiLoading,
    error
  } = useAdminCommunity();

  useEffect(() => {
    fetchCommunityDetails();
  }, [id, activeTab]);

  const fetchCommunityDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch community details
      const communitiesData = await getCommunities({ 
        limit: 1, 
        page: 1,
        search: '',
        status: 'all' 
      });
      
      const foundCommunity = communitiesData.communities?.find(c => c._id === id);
      if (foundCommunity) {
        setCommunity(foundCommunity);
        setStats({
          members: foundCommunity.stats?.actualMemberCount || 0,
          posts: foundCommunity.stats?.actualPostCount || 0,
          comments: foundCommunity.stats?.commentCount || 0
        });
      }

      // Fetch tab-specific data
      if (activeTab === 'members') {
        const membersData = await getCommunityMembers(id);
        setMembers(membersData.members || []);
      } else if (activeTab === 'posts') {
        const postsData = await getCommunityPosts(id);
        setPosts(postsData.posts || []);
      }
    } catch (err) {
      console.error('Error fetching community details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncStats = async () => {
    try {
      await syncCommunityStats(id);
      fetchCommunityDetails();
    } catch (err) {
      console.error('Error syncing stats:', err);
    }
  };

  const handleDeleteCommunity = async (action) => {
    if (window.confirm(`Are you sure you want to ${action} this community?`)) {
      try {
        // Implement delete functionality
        console.log(`Deleting community ${id} with action: ${action}`);
        navigate('/admin-dashboard/manage-communities');
      } catch (err) {
        console.error('Error deleting community:', err);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !community) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Community Not Found</h2>
          <p className="mt-2 text-gray-600">The community you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/admin-dashboard/manage-communities')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto ">
          <div className="py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center mb-4 sm:mb-0">
                <button
                  onClick={() => navigate('/admin-dashboard/manage-communities')}
                  className="mr-4 text-gray-600 hover:text-gray-900"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-xl inter-tight-600 text-gray-900">{community.name}</h1>
                  <p className="text-sm inter-tight-400 text-gray-600 mt-1">{community.description}</p>
                </div>
              </div>
              
            </div>
            <div className="flex mt-4 justify-end  gap-2">
                <Link
                  to={`/admin-dashboard/edit-community/${community._id}`}
                  className="px-4 py-2 bg-blue-600 text-sm inter-tight-400 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Community
                </Link>
                <button
                  onClick={handleSyncStats}
                  disabled={apiLoading}
                  className="px-4 py-2 border text-sm inter-tight-400 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Sync Stats
                </button>
              </div>

            {/* Status Badge */}
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                community.status === 'active' 
                  ? 'bg-green-100 text-green-800'
                  : community.status === 'archived'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {community.status.charAt(0).toUpperCase() + community.status.slice(1)}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                community.isPublic 
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {community.isPublic ? 'Public' : 'Private'}
              </span>
              {community.category && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                  {community.category}
                </span>
              )}
              <span className="text-sm text-gray-600">
                Created: {formatDate(community.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto mt-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 1.195a9 9 0 01-13.5 2.195" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-3xl font-bold text-gray-900">{stats.members}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Posts</p>
                <p className="text-3xl font-bold text-gray-900">{stats.posts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Comments</p>
                <p className="text-3xl font-bold text-gray-900">{stats.comments}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              {['details', 'members', 'posts', 'analytics', 'settings'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-6 font-medium text-sm whitespace-nowrap border-b-2 ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            ) : (
              <>
                {/* Details Tab */}
                {activeTab === 'details' && (
                  <div className="space-y-6 inter-tight-400">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Information</h3>
                      <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Community Name</dt>
                          <dd className="mt-1 text-sm text-gray-900">{community.name}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Category</dt>
                          <dd className="mt-1 text-sm text-gray-900">{community.category}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Visibility</dt>
                          <dd className="mt-1 text-sm text-gray-900">{community.isPublic ? 'Public' : 'Private'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Join Approval</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {community.requiresApproval ? 'Required' : 'Not Required'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Maximum Members</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {community.maxMembers > 0 ? community.maxMembers : 'Unlimited'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                          <dd className="mt-1 text-sm text-gray-900">{formatDate(community.updatedAt)}</dd>
                        </div>
                        <div className="md:col-span-2">
                          <dt className="text-sm font-medium text-gray-500">Description</dt>
                          <dd className="mt-1 text-sm text-gray-900">{community.description}</dd>
                        </div>
                      </dl>
                    </div>

                    {community.tags && community.tags.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {community.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {community.rules && community.rules.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Rules</h3>
                        <ul className="list-disc pl-5 space-y-2">
                          {community.rules.map((rule, index) => (
                            <li key={index} className="text-sm text-gray-700">{rule}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {community.createdBy && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Created By</h3>
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 font-semibold">
                              {community.createdBy.firstName?.charAt(0) || 'A'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">
                              {community.createdBy.firstName} {community.createdBy.surname}
                            </p>
                            <p className="text-sm text-gray-500">{community.createdBy.email}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Members Tab */}
                {activeTab === 'members' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Community Members</h3>
                      {/* <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Add Member
                      </button> */}
                    </div>
                    
                    {members.length === 0 ? (
                      <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No members</h3>
                        <p className="mt-1 text-sm text-gray-500">Start by adding members to your community.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Role
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Joined Date
                              </th>
                              {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th> */}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {members.map((member) => (
                              <tr key={member._id}>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                      <span className="text-gray-600 font-semibold">
                                        {member.user?.firstName?.charAt(0) || 'U'}
                                      </span>
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">
                                        {member.user?.firstName} {member.user?.surname}
                                      </div>
                                      <div className="text-sm text-gray-500">{member.user?.email}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                    member.role === 'admin'
                                      ? 'bg-purple-100 text-purple-800'
                                      : member.role === 'moderator'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {member.role}
                                  </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                    member.status === 'joined'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {member.status}
                                  </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {member.joinedAt ? formatDate(member.joinedAt) : 'Not joined'}
                                </td>
                                {/* <td className="px-4 py-4 whitespace-nowrap text-sm">
                                  <button className="text-blue-600 hover:text-blue-900 mr-3">
                                    Edit
                                  </button>
                                  <button className="text-red-600 hover:text-red-900">
                                    Remove
                                  </button>
                                </td> */}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Posts Tab */}
                {activeTab === 'posts' && (
                  <div>
                    <h3 className="text-lg font-semibold inter-tight-400 text-gray-900 mb-6">Community Posts</h3>
                    
                    {posts.length === 0 ? (
                      <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No posts</h3>
                        <p className="mt-1 text-sm text-gray-500">This community doesn't have any posts yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {posts.map((post) => (
                          <div key={post._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                            <div className="flex justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">{post.title || 'Untitled Post'}</h4>
                                <p className="mt-1 text-sm text-gray-600 line-clamp-2">{post.content}</p>
                                <div className="mt-2 flex items-center text-sm text-gray-500">
                                  <span>By {post.author?.username || 'Unknown'}</span>
                                  <span className="mx-2">•</span>
                                  <span>{formatDate(post.createdAt)}</span>
                                  <span className="mx-2">•</span>
                                  <span>{post.actualCommentCount || 0} comments</span>
                                  {post.isPinned && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                      Pinned
                                    </span>
                                  )}
                                </div>
                              </div>
                             
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                  <div>
                    <h3 className="text-lg inter-tight-600 text-gray-900 mb-6">Community Analytics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <h4 className="font-medium inter-tight-600 text-gray-900 mb-4">Engagement Overview</h4>
                        <div className="space-y-4 inter-tight-400">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Posts per Member</span>
                            <span className="font-medium text-gray-900">
                              {(stats.posts / stats.members || 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Avg Comments per Post</span>
                            <span className="font-medium text-gray-900">
                              {(stats.comments / stats.posts || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <h4 className=" text-gray-900 inter-tight-600 mb-4">Activity Status</h4>
                        <div className="space-y-4 inter-tight-400">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Last Activity</span>
                            <span className="font-medium text-gray-900">
                              {community.recentActivity?.lastActivity 
                                ? formatDate(community.recentActivity.lastActivity)
                                : 'No activity'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Activity Level</span>
                            <span className="font-medium text-gray-900">
                              {stats.posts > 10 ? 'High' : stats.posts > 5 ? 'Medium' : 'Low'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <div>
                    <h3 className="text-lg inter-tight-600 text-gray-900 mb-6">Community Settings</h3>
                    <div className="space-y-6">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex">
                          <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-yellow-800">Warning</h4>
                            <div className="mt-2 text-sm text-yellow-700">
                              <p>These actions are irreversible. Please proceed with caution.</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 inter-tight-400">Archive Community</h4>
                          <p className="text-sm text-gray-600 inter-tight-400 mb-3">
                            Archive this community. Archived communities are hidden from public view but can be restored later.
                          </p>
                          <button
                            onClick={() => handleDeleteCommunity('archive')}
                            className="px-4 py-2 text-sm inter-tight-400 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                          >
                            Archive Community
                          </button>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 inter-tight-400">Delete Community</h4>
                          <p className="text-sm text-gray-600 mb-3 inter-tight-400">
                            Permanently delete this community and all its data. This action cannot be undone.
                          </p>
                          <button
                            onClick={() => handleDeleteCommunity('permanent')}
                            className="px-4 py-2 bg-red-600 inter-tight-400 text-sm text-white rounded-lg hover:bg-red-700"
                          >
                            Delete Permanently
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCommunity;