/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAdminCommunity from '../../hooks/useAdminCommunity';
import { AiOutlineDelete, AiOutlineEdit, AiOutlineEye } from 'react-icons/ai';
import DeleteConfirmationModal from '../../components/delete-confirmation-modal';
import { toast, ToastContainer } from 'react-toastify';

const CommunityManagement = () => {
  const [communities, setCommunities] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();
  const { 
    getCommunities, 
    deleteCommunity,  // Make sure this exists in your hook
    loading: apiLoading, 
    error 
  } = useAdminCommunity();

  useEffect(() => {
    fetchCommunities();
  }, [page, search, statusFilter, sortBy, sortOrder]);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        search,
        status: statusFilter,
        sortBy,
        sortOrder
      };
      const data = await getCommunities(params);
      setCommunities(data.communities || []);
      setStats(data.stats || {});
      setTotalPages(data.pages || 1);
    } catch (err) {
      console.error('Error fetching communities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (community, e) => {
    e.stopPropagation();
    setSelectedCommunity(community);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCommunity) return;
    
    try {
      setDeleting(true);
      await deleteCommunity(selectedCommunity._id);
      
      console.log(`Community "${selectedCommunity.name}" deleted successfully`);
      
      setDeleteModalOpen(false);
      setSelectedCommunity(null);

      toast.info(`Community "${selectedCommunity.name}" deleted successfully`);
      
      fetchCommunities();
      
    } catch (err) {
      console.error('Error deleting community:', err);
    } finally {
      setDeleting(false);
    }
  };

  // Handle delete modal close
  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedCommunity(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-yellow-100 text-yellow-800';
      case 'deleted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleViewCommunity = (id) => {
    navigate(`/admin-dashboard/view-community/${id}`);
  };

  const handleEditCommunity = (id, e) => {
    e.stopPropagation();
    navigate(`/admin-dashboard/edit-community/${id}`);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="min-h-screen ">
        <ToastContainer style={{zIndex: 100000000}} />
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl inter-tight-600 text-gray-900">Community Management</h1>
            <button
              onClick={() => navigate('/admin-dashboard/create-community')}
              className="bg-blue-600 hover:bg-blue-700 text-sm inter-tight-400 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Community
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-4">
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search communities..."
                  value={search}
                  onChange={handleSearch}
                  className="pl-10 pr-4 py-2 w-full border text-sm outline-none inter-tight-400 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 text-sm inter-tight-400 outline-none rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Active</option>
                {/* <option value="archived">Archived</option>
                <option value="deleted">Deleted</option> */}
                <option value="all">All Status</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 text-sm inter-tight-400 outline-none rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="createdAt">Created Date</option>
                <option value="name">Name</option>
                <option value="stats.memberCount">Members</option>
                <option value="stats.postCount">Posts</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            </div>
          ) : communities.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No communities found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {search ? 'Try a different search term' : 'Get started by creating a new community'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Community
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {communities.map((community) => (
                      <tr
                        key={community._id}
                        onClick={() => handleViewCommunity(community._id)}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {community.image ? (
                                <img 
                                  className="h-10 w-10 rounded-full object-cover" 
                                  src={community.image} 
                                  alt={community.name} 
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-blue-600 font-semibold">
                                    {community.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {community.name}
                              </div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {community.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(community.status)}`}>
                            {community.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(community.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div
                            className="flex space-x-3"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => handleViewCommunity(community._id)}
                              className="text-blue-600 hover:text-blue-900 text-xl transition-colors"
                              title="View"
                            >
                              <AiOutlineEye />
                            </button>

                            <button
                              onClick={(e) => handleEditCommunity(community._id, e)}
                              className="text-green-600 hover:text-green-900 text-xl transition-colors"
                              title="Edit"
                            >
                              <AiOutlineEdit />
                            </button>

                            <button
                              onClick={(e) => handleDeleteClick(community, e)}
                              className="text-red-600 hover:text-red-900 text-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete"
                              disabled={deleting && selectedCommunity?._id === community._id}
                            >
                              {deleting && selectedCommunity?._id === community._id ? (
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                              ) : (
                                <AiOutlineDelete />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-4 md:mb-0">
                    <p className="text-sm text-gray-700">
                      Showing page <span className="font-medium">{page}</span> of{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={page === totalPages}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        page === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete Community"
        description="Are you sure you want to delete this community? This action is irreversible."
        itemName={selectedCommunity?.name}
        loading={deleting}
      />
    </div>
  );
};

export default CommunityManagement;