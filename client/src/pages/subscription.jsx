import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoaderOverlay from "../components/LoaderOverlay";
import useUserSubscription from "../hooks/useUserSubscription";
import { BASE_URL } from "../utils/api";

export default function SubscriptionPage() {
  const { subscription, loading, error } = useUserSubscription();
  const [showCancelModal, setShowCancelModal] = useState(false);

  const navigate = useNavigate();
  const [cancelling, setCancelling] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const openCancelModal = () => {
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
  };

  const redirectToPurchasePage = () => {
    navigate('/pricing');
  };

  const handleCancelSubscription = async () => {
   setCancelling(true)
   closeCancelModal()

    setCancelling(true);
    try {
      const response = await fetch(`${BASE_URL}/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`, 
        },
      });

    await response.json();

      if (response.ok) {
        // Show success toast
        setToast({ 
          show: true, 
          message: "Abonnement succesvol opgezegd", 
          type: 'success' 
        });
        
        // Hide toast after 3 seconds and redirect
        setTimeout(() => {
          setToast({ ...toast, show: false });
          navigate('/');
        }, 1000);
      } else {
        // Show error toast
        setToast({ 
          show: true, 
          message: "Het is niet gelukt om het concertabonnement op te zeggen", 
          type: 'error' 
        });
        
        // Hide toast after 3 seconds
        setTimeout(() => {
          setToast({ ...toast, show: false });
        }, 3000);
      }
    } catch (err) {
      console.error("Cancellation error:", err);
      // Show error toast
      setToast({ 
        show: true, 
        message: "An error occurred while cancelling subscription", 
        type: 'error' 
      });
      
      // Hide toast after 3 seconds
      setTimeout(() => {
        setToast({ ...toast, show: false });
      }, 3000);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <LoaderOverlay />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-white rounded-lg border border-[#E2E4E9] max-w-4xl mx-auto mt-10 space-y-4">
        <h2 className="text-xl font-semibold inter-tight-400 text-gray-900">
          Error Loading Subscription
        </h2>
        <p className="text-gray-600 text-center inter-tight-400 text-sm">
          {error}
        </p>
      </div>
    );
  }

  // Check if user has no subscription (including test user check)
  if (!subscription?.hasSubscription) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-white rounded-lg border border-[#E2E4E9] max-w-4xl mx-auto mt-10 space-y-4">
        <h2 className="text-xl font-semibold inter-tight-400 text-gray-900">
          You haven't purchased any subscription yet
        </h2>
        <p className="text-gray-600 text-center inter-tight-400 text-sm">
          Purchase a subscription and start your activity journey!
        </p>
        <button
          className="bg-blue-500 text-sm cursor-pointer inter-tight-400 text-white px-10 py-2 rounded-xl duration-500 transition-all hover:bg-blue-600"
          onClick={redirectToPurchasePage}
        >
          Purchase Subscription
        </button>
      </div>
    );
  }

  if (subscription.isTestUser) {
    return (
      <div className="h-full bg-[#FFFFFF] space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white rounded-lg border border-[#E2E4E9] p-6 md:p-8">
            <h2 className="text-xl text-gray-950 mb-6 inter-tight-400">Test account Abonnement</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="text-sm text-gray-600 mb-1 inter-tight-400">Abonnementsstatus</div>
                <div className="text-base font-medium text-gray-900 inter-tight-400">
                  {subscription.status || 'Actief'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1 inter-tight-400">Pakket</div>
                <div className="text-base font-medium text-gray-900 inter-tight-400">
                  {subscription.subscription?.name || 'Levenslange Toegang'}
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg mt-6">
              <p className="text-blue-700 text-sm inter-tight-400">
                Je gebruikt een testaccount met speciale toegangsrechten. Dit is geen aangekocht abonnement.
              </p>
            </div>
          </div>
        </div>
        
        {/* Toast Notification */}
        {toast.show && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-md shadow-md ${
            toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {toast.message}
          </div>
        )}
      </div>
    );
  }
  
  // Determine if cancel button should be shown based on subscription type and trial status
  // Determine if cancel button should be shown based on subscription type and trial status
const shouldShowCancelButton = () => {
  const subscriptionType = subscription.subscription?.priceType;
  const isInTrial = subscription.status === 'trial'; // Check if status is 'trial'
  
  console.log('Subscription Type:', subscriptionType);
  console.log('Is in Trial:', isInTrial);
  console.log('Full subscription data:', subscription);
  
  // For monthly subscriptions, always show cancel button
  if (subscriptionType === 'monthly') {
    return true;
  }
  
  // For one-time and yearly payments, only show during trial
  if ((subscriptionType === 'one-time' || subscriptionType === 'yearly') && isInTrial) {
    return true;
  }
  
  return false;
};

  // For regular users with active subscription
  return (
    <div className="h-full bg-[#FFFFFF] space-y-6">

{showCancelModal && (
  <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg max-w-md w-full p-6">
      <h3 className="text-lg poppins-700 font-semibold text-gray-900 mb-4">
        Abonnement annuleren
      </h3>
      <p className="text-gray-600 mb-6 inter-tight-400">
        Weet je zeker dat je je abonnement wilt annuleren?
      </p>
      <div className="flex justify-end space-x-3">
        <button
          onClick={closeCancelModal}
          className="px-4 py-2 border inter-tight-400 cursor-pointer border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Abonnement behouden
        </button>
        <button
          onClick={handleCancelSubscription}
          className="px-4 py-2 bg-red-600 text-white inter-tight-400 cursor-pointer rounded-md hover:bg-red-700"
        >
          Annulering bevestigen
        </button>
      </div>
    </div>
  </div>
)}

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg border border-[#E2E4E9] p-6 md:p-8">
          <h2 className="text-xl text-gray-950 mb-6 inter-tight-400">Subscription details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="text-sm text-gray-600 mb-1 inter-tight-400">Subscription Status</div>
              <div className="text-base font-medium text-gray-900 inter-tight-400">
                {subscription.status}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1 inter-tight-400">Package</div>
              <div className="text-base font-medium text-gray-900 inter-tight-400">
                {subscription.subscription?.name}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1 inter-tight-400">Start Date</div>
              <div className="text-base font-medium text-gray-900 inter-tight-400">
                {new Date(subscription.startDate).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1 inter-tight-400">End Date</div>
              <div className="text-base font-medium text-gray-900 inter-tight-400">
                {new Date(subscription.endDate).toLocaleDateString()}
              </div>
            </div>
          </div>

          <hr className="border-gray-200 mb-6" />

          {shouldShowCancelButton() && (
  <div className="space-y-3">
    <button 
      className={`px-6 py-2 border rounded-xl cursor-pointer ${
        cancelling 
          ? 'border-gray-400 text-gray-400 cursor-not-allowed' 
          : 'border-[#8F8F8F] text-[#8F8F8F] hover:bg-gray-50'
      }`}
      onClick={openCancelModal}
      disabled={cancelling}
    >
      {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
    </button>
    <p className="text-sm text-[#B5B5B5] inter-tight-400">
      {subscription.subscription?.priceType === 'monthly' 
        ? 'Your subscription will remain active until the end of the current billing period.'
        : 'Your trial will end immediately upon cancellation.'
      }
    </p>
  </div>
)}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 md:p-8">
          <h2 className="text-xl text-[#000000] mb-6 inter-tight-400">Billing History</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="text-sm text-gray-600 mb-1 inter-tight-400">Final Payment</div>
              <div className="text-base font-medium text-gray-900 inter-tight-400">
                €{subscription.subscription?.price}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1 inter-tight-400">Type</div>
              <div className="text-base font-medium text-gray-900 inter-tight-400">
                {subscription.subscription?.priceType}
              </div>
            </div>
          </div>

          <hr className="border-gray-200 mb-4" />

          <p className="text-sm text-[#B5B5B5] inter-tight-400">
            Please contact customer service for detailed billing history.
          </p>
        </div>
      </div>
      
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-md shadow-md ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}
      
      {cancelling && <LoaderOverlay />}
    </div>
  );
}