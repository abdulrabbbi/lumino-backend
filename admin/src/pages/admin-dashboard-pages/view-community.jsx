/* eslint-disable no-unused-vars */
/* eslint-disable no-case-declarations */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useAdminCommunity from '../../hooks/useAdminCommunity';
import useAdminPendingRequests from '../../hooks/useAdminPendingRequestToJoinCommunity';
import { toast, ToastContainer } from 'react-toastify';
import LoaderOverlay from '../../components/LoaderOverlay';

const ViewCommunity = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [community, setCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  
  // Pagination states for pending requests
  const [pendingRequestsPage, setPendingRequestsPage] = useState(1);
  const [pendingRequestsTotal, setPendingRequestsTotal] = useState(0);
  const [pendingRequestsPages, setPendingRequestsPages] = useState(0);
  const [pendingSearch, setPendingSearch] = useState('');
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const {
    getCommunities,
    getCommunityMembers,
    getCommunityPosts,
    syncCommunityStats,
    getCommunityById,
    loading: apiLoading,
    error
  } = useAdminCommunity();

  const {
    getPendingRequests,
    processRequest,
    bulkProcessRequests,
    loading: pendingLoading,
    error: pendingError
  } = useAdminPendingRequests();

  useEffect(() => {
    fetchCommunityDetails();
  }, [id, activeTab, pendingRequestsPage, pendingSearch]);

  const fetchCommunityDetails = async () => {
    try {
      setLoading(true);
  
      // Use getCommunityById instead of filtering from all communities
      const communityData = await getCommunityById(id);
      setCommunity(communityData);
      
      setStats({
        members: communityData.stats?.actualMemberCount || 0,
        posts: communityData.stats?.actualPostCount || 0,
        comments: communityData.stats?.commentCount || 0,
        pendingRequests: communityData.stats?.pendingRequests || 0
      });
  
      // Fetch tab-specific data
      switch (activeTab) {
        case 'members':
          const membersData = await getCommunityMembers(id);
          setMembers(membersData.members || []);
          break;
        case 'posts':
          const postsData = await getCommunityPosts(id);
          setPosts(postsData.posts || []);
          break;
        case 'pending':
          await fetchPendingRequests();
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('Error fetching community details:', err);
      setCommunity(null); // Set to null if not found
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const data = await getPendingRequests(id, {
        page: pendingRequestsPage,
        limit: 20,
        search: pendingSearch,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      setPendingRequests(data.requests || []);
      setPendingRequestsTotal(data.total || 0);
      setPendingRequestsPages(data.pages || 0);
      
      // Update community stats if available
      if (data.community?.stats) {
        setStats(prev => ({
          ...prev,
          pendingRequests: data.community.stats.pendingRequests || 0
        }));
      }
    } catch (err) {
      console.error('Error fetching pending requests:', err);
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

  const handleProcessRequest = async (requestId, userId, action) => {
    if (action === 'reject' && !rejectReason.trim() && window.confirm('Proceed without rejection reason?')) {
      // User confirmed to proceed without reason
    } else if (action === 'reject' && !rejectReason.trim()) {
      toast.info('Please provide a rejection reason or click "Proceed" without entering a reason.')
      // alert('Please provide a rejection reason or click "Proceed" without entering a reason.');
      return;
    }

    try {
      const result = await processRequest(id, {
        action,
        requestId,
        userId,
        reason: rejectReason
      });

      if (result.success) {
        // Remove the processed request from list
        setPendingRequests(prev => prev.filter(req => req._id !== requestId));
        setSelectedRequests(prev => prev.filter(id => id !== requestId));
        
        // Update stats
        setStats(prev => ({
          ...prev,
          members: action === 'approve' ? prev.members + 1 : prev.members,
          pendingRequests: prev.pendingRequests - 1
        }));

        // Reset reject reason
        setRejectReason('');
        
        toast.success(`Request ${action}ed successfully.`);
        // alert(result.message);
        
        // Refresh if needed
        if (pendingRequests.length === 1) {
          fetchPendingRequests();
        }
      }
    } catch (err) {
      console.error('Error processing request:', err);
toast.error('Failed to process request');
      // alert(err.response?.data?.error || 'Failed to process request');
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction) {
      alert('Please select an action');
      return;
    }

    if (bulkAction === 'reject' && !rejectReason.trim()) {
      toast.info('Please provide a rejection reason for bulk reject')
      // alert('Please provide a rejection reason for bulk reject');
      return;
    }

    const selectedRequestData = pendingRequests.filter(req => 
      selectedRequests.includes(req._id)
    );

    if (selectedRequestData.length === 0) {
      toast.info('No requests selected')
      return;
    }

    if (!window.confirm(`Are you sure you want to ${bulkAction} ${selectedRequestData.length} request(s)?`)) {
      return;
    }

    try {
      const results = await bulkProcessRequests(
        id, 
        selectedRequestData, 
        bulkAction, 
        rejectReason
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      // Remove successful requests from list
      const successfulIds = results
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value?.request?._id)
        .filter(id => id);

      setPendingRequests(prev => 
        prev.filter(req => !successfulIds.includes(req._id))
      );
      setSelectedRequests([]);
      setBulkAction('');

      // Update stats
      const approvedCount = bulkAction === 'approve' ? successful : 0;
      setStats(prev => ({
        ...prev,
        members: prev.members + approvedCount,
        pendingRequests: prev.pendingRequests - successful
      }));

      toast.success(`Bulk ${bulkAction} completed: ${successful} successful, ${failed} failed.`);
      
      // Refresh list if needed
      if (successful > 0) {
        fetchPendingRequests();
      }
    } catch (err) {
      console.error('Error in bulk action:', err);
      toast.error('Bulk action failed');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRequests(pendingRequests.map(req => req._id));
    } else {
      setSelectedRequests([]);
    }
  };

  const handleSelectRequest = (requestId) => {
    setSelectedRequests(prev => 
      prev.includes(requestId) 
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserTypeBadge = (userType) => {
    const typeConfig = {
      'subscribed': { color: 'bg-green-100 text-green-800', label: 'Subscribed' },
      'free': { color: 'bg-gray-100 text-gray-800', label: 'Free' },
      'test': { color: 'bg-purple-100 text-purple-800', label: 'Test' }
    };
    
    const config = typeConfig[userType] || { color: 'bg-gray-100 text-gray-800', label: userType };
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading && !community) {
    return (
      <LoaderOverlay/>
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
            className="mt-4 px-4 py-2 bg-blue-600 text-sm  text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <ToastContainer style={{zIndex: 1000000000000}}/>
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 ">
          <div className="py-6">
            <div className="flex justify-between items-center w-full">
            <div>
                  <h1 className="text-2xl font-bold text-gray-900">{community.name}</h1>
                  <p className="text-sm text-gray-600 mt-1">{community.description}</p>
                </div>
              <div className="flex items-center mb-4 sm:mb-0">
                <button
                  onClick={() => navigate('/admin-dashboard/manage-communities')}
                  className="mr-4 bg-gray-600  px-5 py-2 text-sm text-white rounded-xl cursor-pointer"
                >
                 Back
                </button>
               
              </div>
              
            </div>
            <div className="flex justify-end mt-4 gap-2">
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
                className="px-4 py-2 border border-gray-300 inter-tight-400 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Sync Stats
              </button>
            </div>

           
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-8 h-8 text-blue-600" fill ="none" stroke="currentColor" viewBox="0 0 24 24">
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

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingRequests || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              {['details', 'members', 'pending', 'analytics'].map((tab) => (
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
                  {tab === 'pending' && stats.pendingRequests > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {stats.pendingRequests}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

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
                  <div className="space-y-6">
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
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Pending Requests Tab */}
                {activeTab === 'pending' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-md inter-tight-600 text-gray-900">Pending Join Requests</h3>
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search users..."
                            value={pendingSearch}
                            onChange={(e) => setPendingSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 text-sm inter-tight-400 border border-gray-300 rounded-lg outline-none"
                          />
                          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {selectedRequests.length > 0 && (
                      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-sm inter-tight-400 text-blue-900">
                              {selectedRequests.length} request(s) selected
                            </span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <select
                              value={bulkAction}
                              onChange={(e) => setBulkAction(e.target.value)}
                              className="border text-sm inter-tight-400 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select action...</option>
                              <option value="approve">Approve Selected</option>
                              <option value="reject">Reject Selected</option>
                            </select>
                            
                            {bulkAction === 'reject' && (
                              <input
                                type="text"
                                placeholder="Rejection reason..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            )}
                            
                            <button
                              onClick={handleBulkAction}
                              className="px-4 py-2 bg-blue-600 text-white text-sm inter-tight-400 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={!bulkAction || pendingLoading}
                            >
                              {pendingLoading ? 'Processing...' : 'Apply'}
                            </button>
                            
                            <button
                              onClick={() => {
                                setSelectedRequests([]);
                                setBulkAction('');
                                setRejectReason('');
                              }}
                              className="px-4 py-2 text-gray-600 text-sm inter-tight-400 hover:text-gray-900"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedRequests.length === 0 && (
                      <div className="mb-4">
                        <label className="block text-sm inter-tight-400 font-medium text-gray-700 mb-2">
                          Rejection Reason (for individual rejections)
                        </label>
                        <input
                          type="text"
                          placeholder="Enter reason for rejection..."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="w-full text-sm inter-tight-400 outline-none border border-gray-300 rounded-lg px-4 py-2"
                        />
                      </div>
                    )}

              

                    {pendingLoading ? (
                      <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : pendingRequests.length === 0 ? (
                      <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No pending requests</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {pendingSearch ? 'No requests match your search.' : 'All join requests have been processed.'}
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <input
                                  type="checkbox"
                                  checked={selectedRequests.length === pendingRequests.length && pendingRequests.length > 0}
                                  onChange={handleSelectAll}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User Type
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Request Date
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {pendingRequests.map((request) => (
                              <tr key={request._id} className="hover:bg-gray-50">
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <input
                                    type="checkbox"
                                    checked={selectedRequests.includes(request._id)}
                                    onChange={() => handleSelectRequest(request._id)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                      {request.user?.avatar ? (
                                        <img src={request.user.avatar} alt="" className="h-10 w-10 rounded-full" />
                                      ) : (
                                        <span className="text-gray-600 font-semibold">
                                          {request.user?.firstName?.charAt(0) || request.user?.username?.charAt(0) || 'U'}
                                        </span>
                                      )}
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">
                                        {request.user?.firstName} {request.user?.surname}
                                      </div>
                                      <div className="text-sm text-gray-500">{request.user?.email}</div>
                                      <div className="text-xs text-gray-400">
                                        @{request.user?.username}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  {getUserTypeBadge(request.user?.userType)}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(request.requestDate)}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleProcessRequest(request._id, request.user._id, 'approve')}
                                      disabled={pendingLoading}
                                      className="px-3 py-1 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 disabled:opacity-50"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleProcessRequest(request._id, request.user._id, 'reject')}
                                      disabled={pendingLoading}
                                      className="px-3 py-1 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 disabled:opacity-50"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* Pagination */}
                        {pendingRequestsPages > 1 && (
                          <div className="mt-6 flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                              Showing <span className="font-medium">{(pendingRequestsPage - 1) * 20 + 1}</span> to{' '}
                              <span className="font-medium">
                                {Math.min(pendingRequestsPage * 20, pendingRequestsTotal)}
                              </span>{' '}
                              of <span className="font-medium">{pendingRequestsTotal}</span> results
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setPendingRequestsPage(prev => Math.max(prev - 1, 1))}
                                disabled={pendingRequestsPage === 1}
                                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                              >
                                Previous
                              </button>
                              {Array.from({ length: Math.min(5, pendingRequestsPages) }, (_, i) => {
                                let pageNum;
                                if (pendingRequestsPages <= 5) {
                                  pageNum = i + 1;
                                } else if (pendingRequestsPage <= 3) {
                                  pageNum = i + 1;
                                } else if (pendingRequestsPage >= pendingRequestsPages - 2) {
                                  pageNum = pendingRequestsPages - 4 + i;
                                } else {
                                  pageNum = pendingRequestsPage - 2 + i;
                                }
                                return (
                                  <button
                                    key={pageNum}
                                    onClick={() => setPendingRequestsPage(pageNum)}
                                    className={`px-3 py-1 rounded-lg ${
                                      pendingRequestsPage === pageNum
                                        ? 'bg-blue-600 text-white'
                                        : 'border border-gray-300 hover:bg-gray-50'
                                    }`}
                                  >
                                    {pageNum}
                                  </button>
                                );
                              })}
                              <button
                                onClick={() => setPendingRequestsPage(prev => Math.min(prev + 1, pendingRequestsPages))}
                                disabled={pendingRequestsPage === pendingRequestsPages}
                                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

              
                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Community Analytics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h4 className="font-medium text-gray-900 mb-4">Engagement Overview</h4>
                        <div className="space-y-4">
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
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h4 className="font-medium text-gray-900 mb-4">Activity Status</h4>
                        <div className="space-y-4">
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCommunity;