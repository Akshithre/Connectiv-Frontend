import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NavigationButtons = ({ 
  onSave, 
  isLoading, 
  hasChanges, 
  proposalId 
}) => {
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);
  const [action, setAction] = useState(null);

  const handleNext = () => {
    if (!proposalId) {
      alert('Please save the form before proceeding');
      return;
    }
    
    if (hasChanges) {
      setAction('next');
      setShowDialog(true);
      return;
    }
    
    navigate('/business-valuation', {
      state: { 
        proposalId: proposalId,
        shouldRefresh: true
      }
    });
  };

  const handleCancel = () => {
    if (hasChanges) {
      setAction('cancel');
      setShowDialog(true);
      return;
    }
    navigate('/home');
  };

  const handleConfirmAction = async (shouldSave) => {
    if (shouldSave) {
      await onSave();
    }
    
    setShowDialog(false);
    if (action === 'next') {
      navigate('/business-valuation', {
        state: { 
          proposalId: proposalId,
          shouldRefresh: true
        }
      });
    } else if (action === 'cancel') {
      navigate('/home');
    }
  };

  return (
    <>
      <div className="flex justify-center gap-4 mt-8">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isLoading}
          className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={isLoading || !hasChanges}
          className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save'}
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={isLoading}
          className="px-8 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600"
        >
          Next
        </button>
      </div>

      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Unsaved Changes</h3>
            <p className="mb-6">
              Do you want to save your changes before {action === 'next' ? 'proceeding to the next step' : 'canceling'}?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => handleConfirmAction(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Discard
              </button>
              <button
                onClick={() => handleConfirmAction(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save & {action === 'next' ? 'Proceed' : 'Exit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NavigationButtons;