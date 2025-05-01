import React, { useState, useEffect } from "react";
import { Mail, Phone, Globe, Check, X, AlertCircle } from "lucide-react";
import NavbarAdmin from "../components/pages/NavbarAdmin";
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Rejection Modal Component
const RejectionModal = ({ isOpen, onClose, onSubmit, proposalVersion }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(reason);
    setReason('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Reject Hold Request for Proposal {proposalVersion}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Rejection
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              required
              placeholder="Please provide a reason for rejecting the hold request..."
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
            >
              Submit Rejection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rejectionModal, setRejectionModal] = useState({
    isOpen: false,
    request: null
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/business-proposal/get-hold-requests`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }
      
      const data = await response.json();
      
      if (data.status) {
        // Filter out any requests that might have invalid data
        const validRequests = data.data.filter(request => 
          request.proposalId && 
          request.proposalNumber && 
          request.versionNumber &&
          request.proposalVersion
        );
        
        setRequests(validRequests);
      } else {
        throw new Error(data.message || 'Failed to fetch requests');
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError(error.message);
      toast.error(error.message || 'Failed to load hold requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (request) => {
    try {
      // First validate the request object
      if (!request?.proposalId || !request?.proposalNumber || !request?.versionNumber) {
        toast.error('Invalid request data');
        return;
      }
  
      // Update the hold status
      const response = await fetch(`${API_BASE_URL}/api/business-proposal/update-hold-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalId: request.proposalId,
          proposalNumber: request.proposalNumber,
          versionNumber: request.versionNumber,
          status: 'hold'
        }),
      });
  
      const data = await response.json();
      
      if (!data.status) {
        throw new Error(data.message || 'Failed to accept hold request');
      }
  
      // Only create notification if status update was successful
      if (request.userId) {
        try {
          await fetch(`${API_BASE_URL}/api/notifications/create`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: request.userId,
              title: 'Hold Request Accepted',
              message: `Your hold request for proposal ${request.proposalVersion} has been accepted.`
            }),
          });
        } catch (notificationError) {
          console.error('Failed to create notification:', notificationError);
          // Don't throw here, as the main action was successful
        }
      }
  
      // Remove the accepted request from the local state
      setRequests(prevRequests => 
        prevRequests.filter(r => 
          !(r.proposalId === request.proposalId && 
            r.proposalNumber === request.proposalNumber && 
            r.versionNumber === request.versionNumber)
        )
      );
  
      toast.success('Hold request accepted successfully');
    } catch (error) {
      console.error('Error accepting hold request:', error);
      toast.error(error.message || 'Failed to accept hold request');
    }
  };

  const handleReject = async (reason) => {
    if (!rejectionModal.request || !reason) return;

    try {
      // Update the hold status
      const response = await fetch(`${API_BASE_URL}/api/business-proposal/update-hold-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalId: rejectionModal.request.proposalId,
          proposalNumber: rejectionModal.request.proposalNumber,
          versionNumber: rejectionModal.request.versionNumber,
          status: 'active',
          rejectionReason: reason
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject hold request');
      }

      // Create notification for the user
      const notificationResponse = await fetch(`${API_BASE_URL}/api/notifications/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: rejectionModal.request.userId,
          title: 'Hold Request Rejected',
          message: `Your hold request for proposal ${rejectionModal.request.proposalVersion} was rejected. Reason: ${reason}`
        }),
      });

      if (!notificationResponse.ok) {
        console.error('Failed to create notification');
      }

      toast.success('Hold request rejected successfully');
      setRejectionModal({ isOpen: false, request: null });
      fetchRequests();
    } catch (error) {
      console.error('Error rejecting hold request:', error);
      toast.error('Failed to reject hold request');
    }
  };

  if (loading) {
    return (
      <div>
        <NavbarAdmin />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <NavbarAdmin />
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Hold Requests</h1>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proposal Version</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No hold requests pending
                  </td>
                </tr>
              ) : (
                requests.map((request, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.businessOwner}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.proposalVersion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Hold Requested
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {request.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(request)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => setRejectionModal({ isOpen: true, request })}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {rejectionModal.isOpen && (
          <RejectionModal
            isOpen={rejectionModal.isOpen}
            onClose={() => setRejectionModal({ isOpen: false, request: null })}
            onSubmit={handleReject}
            proposalVersion={rejectionModal.request?.proposalVersion}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;