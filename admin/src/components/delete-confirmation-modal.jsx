import React, { useState } from 'react';

const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Delete",
  description,
  itemName,
  loading = false 
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirm();
    } else if (confirmText === 'DELETE') {
      setIsConfirmed(true);
      setConfirmText('');
    }
  };

  const handleClose = () => {
    setConfirmText('');
    setIsConfirmed(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          
          <h3 className="text-lg inter-tight-600 text-gray-900 text-center mb-2">
            {title}
          </h3>
          
          {description && (
            <p className="text-sm text-gray-600 inter-tight-400 text-center mb-4">
              {description}
            </p>
          )}
          
          {itemName && (
            <div className="bg-red-50 inter-tight-400 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm font-medium text-red-800 text-center">
                Community: <span className="">{itemName}</span>
              </p>
            </div>
          )}
          
          {!isConfirmed ? (
            <>
              <div className="mb-4">
                <p className="text-sm inter-tight-400 font-medium text-gray-700 mb-2">
                  This will permanently delete:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li className="flex items-start">
                    <svg className="w-4 h-4 mr-2 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>All community posts and comments</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 mr-2 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>All member records and data</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 mr-2 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Community settings and configuration</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 mr-2 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>This action <strong>cannot be undone</strong></span>
                  </li>
                </ul>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <span className="font-mono bg-gray-100 inter-tight-400 text-sm  px-1 py-0.5 rounded">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type DELETE here"
                  className="w-full px-3 py-2 border outline-none border-gray-300 rounded-lg text-sm inter-tight-400 "
                  autoFocus
                />
              </div>
            </>
          ) : (
            <>
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-red-800">Final Warning</p>
                    <p className="text-sm text-red-700 mt-1">
                      You are about to permanently delete this community and all its data. 
                      This action is irreversible. Are you absolutely sure?
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-sm inter-tight-400 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || (!isConfirmed && confirmText !== 'DELETE')}
              className={`px-4 py-2 text-sm inter-tight-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${loading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Deleting...
                </>
              ) : isConfirmed ? (
                'Yes, Delete Permanently'
              ) : (
                'Continue to Delete'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;