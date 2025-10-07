import React, { useState } from 'react';
import useTrackingEvents from '../../hooks/useTrackingEvents';
import {
  formatEventName,
  formatTimestamp,
  getEventColor,
  getDeviceIcon,
  generateEventDescription
} from '../../utils/eventFormatters';
import LoaderOverlay from '../../components/LoaderOverlay';

const TrackingEvents = () => {
  const { events, loading, error, refetch } = useTrackingEvents();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 20;

  // Filter events based on selected filter and search term
  const filteredEvents = events.filter(event => {
    const matchesFilter = filter === 'all' || event.eventName === filter;
    const matchesSearch = 
      event.userId.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.userId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      generateEventDescription(event).toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Pagination logic
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  // Get unique event types for filter dropdown
  const eventTypes = [...new Set(events.map(event => event.eventName))];

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to first page when filter or search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

  // Pagination component
  const Pagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-gray-200 bg-white sm:px-6">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="text-sm text-gray-700 mr-4">
            Showing <span className="font-medium">{indexOfFirstEvent + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(indexOfLastEvent, filteredEvents.length)}
            </span> of{' '}
            <span className="font-medium">{filteredEvents.length}</span> results
          </div>
        </div>
        
        <div className="flex items-center space-x-1 mt-2 sm:mt-0">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {pageNumbers.map(number => (
            <button
              key={number}
              onClick={() => handlePageChange(number)}
              className={`relative inline-flex items-center px-3 py-1.5 border text-sm font-medium ${
                currentPage === number
                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {number}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
     <LoaderOverlay/>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-4xl md:text-6xl mb-4">⚠️</div>
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">Error Loading Events</h2>
          <p className="text-gray-600 mb-4 text-sm md:text-base">{error}</p>
          <button
            onClick={refetch}
            className="bg-blue-600 text-white px-4 md:px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl  font-bold text-gray-900 poppins-700">User Activity Timeline</h1>
        </div>

        <div className="grid md:grid-cols-2 grid-cols-1  gap-3 md:gap-4 lg:gap-6 mb-6 md:mb-8">
          <div className="bg-white rounded-lg shadow p-3 md:p-4 lg:p-6">
            <div className="flex items-center">
              <div className="p-1 md:p-2 bg-blue-100 rounded-lg">
                <span className="text-lg md:text-xl lg:text-2xl">📊</span>
              </div>
              <div className="ml-2 md:ml-3 lg:ml-4">
                <p className="text-xs md:text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-lg md:text-xl lg:text-2xl font-semibold text-gray-900">{events.length}</p>
              </div>
            </div>
          </div>
          
          
          
          <div className="bg-white rounded-lg shadow p-3 md:p-4 lg:p-6">
            <div className="flex items-center">
              <div className="p-1 md:p-2 bg-purple-100 rounded-lg">
                <span className="text-lg md:text-xl lg:text-2xl">🔔</span>
              </div>
              <div className="ml-2 md:ml-3 lg:ml-4">
                <p className="text-xs md:text-sm font-medium text-gray-600">Event Types</p>
                <p className="text-lg md:text-xl lg:text-2xl font-semibold text-gray-900">{eventTypes.length}</p>
              </div>
            </div>
          </div>
          
         
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search users, events, or activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 md:px-4 py-2 border inter-tight-400 border-gray-300 rounded-lg outline-none text-sm "
              />
            </div>
            <div className="sm:w-48 lg:w-64">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-3 md:px-4 py-2 text-sm inter-tight-400 border border-gray-300 rounded-lg outline-none"
              >
                <option value="all">All Events</option>
                {eventTypes.map(type => (
                  <option key={type} value={type}>
                    {formatEventName(type)}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={refetch}
              className="px-4 md:px-6 py-2 text-sm inter-tight-400 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center  whitespace-nowrap"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Events List */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="overflow-x-auto">
            {currentEvents.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-lg font-medium inter-tight-400 mb-2">No events found</p>
                {/* <p className="text-sm">Try adjusting your search or filter criteria</p> */}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {currentEvents.map((event) => (
                  <div key={event._id} className="p-4 md:p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      {/* User and Event Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {event.userId.username.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-2">
                              <p className="text-sm inter-tight-400  md:text-base font-medium text-gray-900 truncate">
                                {event.userId.username}
                              </p>
                              <span className={`inline-flex inter-tight-400 items-center px-2 py-0.5 rounded-full text-xs font-medium ${getEventColor(event.eventName)} mt-1 sm:mt-0`}>
                                {formatEventName(event.eventName)}
                              </span>
                            </div>
                            <p className="text-sm inter-tight-400 text-gray-600 mb-2">
                              {generateEventDescription(event)}
                            </p>
                            <div className="flex items-center inter-tight-400 space-x-4 text-xs text-gray-500">
                              <span className="flex items-center">
                                <span className="mr-1">{getDeviceIcon(event.device)}</span>
                                {event.device.toUpperCase()}
                              </span>
                              <span>{formatTimestamp(event.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => setSelectedEvent(event)}
                          className="text-blue-600 hover:text-blue-900 text-sm inter-tight-400 font-medium whitespace-nowrap"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <Pagination />
        </div>

        {selectedEvent && (
          <div className="fixed inset-0 bg-black/50 inter-tight-400 bg-opacity-50 flex items-center justify-center p-4 z-[1000000]">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[70vh] overflow-y-auto">
              <div className="p-4 md:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Event Details
                  </h3>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="text-gray-400 hover:text-gray-600 text-xl"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 text-sm md:text-base">User Information</h4>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm">
                      <p><strong>Username:</strong> {selectedEvent.userId.username}</p>
                      <p><strong>Email:</strong> {selectedEvent.userId.email}</p>
                      <p><strong>User ID:</strong> {selectedEvent.userId._id}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 text-sm md:text-base">Event Summary</h4>
                    <div className="bg-blue-50 p-3 rounded-lg text-sm">
                      <p className="font-medium text-blue-800">{generateEventDescription(selectedEvent)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 text-sm md:text-base">Event Information</h4>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm">
                      <p><strong>Event Name:</strong> {formatEventName(selectedEvent.eventName)}</p>
                      <p><strong>Event Type:</strong> {selectedEvent.userType}</p>
                      <p><strong>Device:</strong> {selectedEvent.device}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 text-sm md:text-base">Event Data</h4>
                    <pre className="bg-gray-50 p-3 rounded-lg text-xs md:text-sm overflow-x-auto">
                      {JSON.stringify(selectedEvent.eventData, null, 2)}
                    </pre>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 text-sm md:text-base">Timestamps</h4>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm">
                      <p><strong>Event Time:</strong> {formatTimestamp(selectedEvent.timestamp)}</p>
                      <p><strong>Created:</strong> {formatTimestamp(selectedEvent.createdAt)}</p>
                      <p><strong>Updated:</strong> {formatTimestamp(selectedEvent.updatedAt)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="px-4 py-2 bg-gray-300 text-sm inter-tight-400 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors "
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackingEvents;