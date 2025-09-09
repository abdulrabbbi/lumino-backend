/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Check, X, AlertCircle } from 'lucide-react';
import Tick from '../../public/nav-images/contract.svg';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoaderOverlay from '../components/LoaderOverlay';
import { BASE_URL } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSubscription, setUserSubscription] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cancellingSubscription, setCancellingSubscription] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        const subsResponse = await fetch(`${BASE_URL}/get-all-subscriptions`);
        const subscriptionsData = await subsResponse.json();
        setSubscriptions(subscriptionsData);

        if (token) {
          try {
            const userSubResponse = await fetch(`${BASE_URL}/subscription-status`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (userSubResponse.ok) {
              const userSubData = await userSubResponse.json();
              if (userSubData.hasSubscription) {
                setUserSubscription(userSubData);
              }
            }
          } catch (error) {
            console.error('Error fetching user subscription:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load subscriptions');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubscribe = async (subscriptionId) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/signup');
      return;
    }

    if (userSubscription) {
      const currentPlanType = userSubscription.subscription.priceType;
      const targetSubscription = subscriptions.find(s => s._id === subscriptionId);
      const targetPlanType = targetSubscription.priceType;
      
      if (userSubscription.subscription._id !== subscriptionId) {
        toast.info(
          <div className="flex items-center">
            <span>Annuleer eerst je huidige abonnement voordat je een nieuw abonnement kiest.</span>
          </div>, 
          {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );
        return;
      }
    }

    setIsProcessing(true);

    try {
      const response = await fetch(`${BASE_URL}/purchase-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subscriptionId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Er is iets misgegaan. Probeer het opnieuw.', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    setIsProcessing(true);
    
    try {
      const response = await fetch(`${BASE_URL}/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to cancel subscription');
      }

      if (result.cancelled) {
        // Immediate cancellation (during trial)
        toast.success(
          <div className="flex items-center">
            <Check className="mr-2" size={18} />
            <span>Je abonnement is succesvol geannuleerd.</span>
          </div>, 
          {
            position: 'top-right',
            autoClose: 4000,
          }
        );
        setUserSubscription(null);
      } else if (result.cancelDate) {
        // Will cancel at period end
        const cancelDate = new Date(result.cancelDate).toLocaleDateString('nl-NL');
        toast.info(
          <div className="flex items-center">
            <AlertCircle className="mr-2" size={18} />
            <span>Je abonnement wordt aan het einde van de factureringsperiode ({cancelDate}) geannuleerd.</span>
          </div>, 
          {
            position: 'top-right',
            autoClose: 6000,
          }
        );
      }
      
      setCancellingSubscription(null);
    } catch (error) {
      console.error('Cancellation error:', error);
      toast.error(error.message || 'Kon abonnement niet annuleren. Probeer het later opnieuw.', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getPlanType = (priceType) => {
    switch(priceType) {
      case 'monthly': return 'Maandelijks';
      case 'yearly': return 'Jaarlijks';
      case 'one-time': return 'Levenslang';
      default: return priceType;
    }
  };

  const isCurrentPlan = (subscription) => {
    if (!userSubscription) return false;
    return userSubscription.subscription._id === subscription._id;
  };

  const shouldShowUpgradeOption = (subscription) => {
    if (!userSubscription) return true;
    
    const currentPlanType = userSubscription.subscription.priceType;
    const targetPlanType = subscription.priceType;
    
    // If user has lifetime, no upgrades possible
    if (currentPlanType === 'one-time') return false;
    
    // If user has yearly, only show lifetime as upgrade
    if (currentPlanType === 'yearly') {
      return targetPlanType === 'one-time';
    }
    
    // If user has monthly, show yearly and lifetime as upgrades
    if (currentPlanType === 'monthly') {
      return targetPlanType === 'yearly' || targetPlanType === 'one-time';
    }
    
    return true;
  };

  const handleUpgradeClick = () => {
    toast.info(
      <div className="flex items-center">
        <span>Annuleer je huidige abonnement om over te stappen naar een nieuw abonnement.</span>
      </div>, 
      {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
  };

  if (loading || isProcessing) {
    return <LoaderOverlay />;
  }

  const sortedSubscriptions = [
    subscriptions.find(s => s.name === 'Proefreis'),
    subscriptions.find(s => s.name === 'Jaaravontuur'),
    subscriptions.find(s => s.name === 'Eeuwig Sterk')
  ].filter(Boolean);

  return (
    <section className="py-16 px-4 md:mt-10 mt-3 sm:px-6 lg:px-8 h-auto max-w-7xl m-auto">
      <ToastContainer style={{ zIndex: 100000000 }} />
      
      {/* Cancel Confirmation Modal */}
      {cancellingSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Abonnement annuleren
            </h3>
            <p className="text-gray-600 mb-6">
              Weet je zeker dat je je huidige abonnement ({cancellingSubscription.name}) wilt annuleren?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setCancellingSubscription(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Terug
              </button>
              <button
                onClick={handleCancelSubscription}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl w-full m-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl inter-tight-700 lg:text-2xl text-[#636363]">
            KIES JE ABONNEMENT!
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {sortedSubscriptions.map((sub, idx) => {
            const isCurrent = isCurrentPlan(sub);
            const showUpgrade = shouldShowUpgradeOption(sub);
            const isLifetimeUser = userSubscription && userSubscription.subscription.priceType === 'one-time';
            
            return (
              <div key={sub._id} className={`relative ${sub.name === 'Jaaravontuur' ? 'md:mt-0 mt-8' : ''}`}>
                {sub.name === 'Jaaravontuur' && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-[#DB297A] to-[#7940EA] rounded-3xl z-0"></div>
                    <div className="absolute left-1/2 transform -translate-x-1/2 z-20">
                      <div className="text-white md:px-6 px-full py-2 font-bold text-sm">Meest gekozen</div>
                    </div>
                  </>
                )}

                <div className={`flex flex-col justify-between 
                  ${sub.name === 'Proefreis' || sub.name === 'Eeuwig Sterk' ? 'md:h-[510px] md:mt-13 mt-4 h-full' : ''} 
                  bg-white 
                  ${sub.name === 'Jaaravontuur' ? 'mt-10 m-3 pb-20' : ''} 
                  rounded-3xl p-8 shadow-lg border-2 border-gray-200 relative z-10`}>
                  
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-xs font-medium">
                      Jouw huidige plan
                    </div>
                  )}
                  
                  <div className="flex flex-col items-start">
                    <div className="mb-4 mt-4">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <img src={Tick} alt="" />
                      </div>
                    </div>
                    <div className="mb-4">
                      <h3 className="text-lg inter-tight-700 text-[#0F2137]">{sub.name}</h3>
                      <p className="text-[#666666] inter-tight-400 text-sm">{sub.shortDescription}</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8 mt-5">
                    {sub.details.map((text, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-[#3FDBB1] rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[#343D48] inter-tight-400 text-sm">{text}</span>
                      </div>
                    ))}
                  </div>

                  {isLifetimeUser ? (
                    <div className="text-center p-4 bg-gray-100 rounded-lg">
                      <p className="text-gray-600 text-sm inter-tight-400">Je hebt al levenslange toegang</p>
                    </div>
                  ) : isCurrent ? (
                    <div className="text-center p-4 bg-green-100 rounded-lg">
                      <p className="text-green-700 text-sm inter-tight-400">Dit is je huidige abonnement</p>
                    </div>
                  ) : userSubscription && shouldShowUpgradeOption(sub) ? (
                    <button
                      onClick={handleUpgradeClick}
                      className="w-full bg-gradient-to-br from-[#DB297A] to-[#7940EA] cursor-pointer text-sm text-white inter-tight-400 py-3 px-6 rounded-2xl transition-colors duration-500"
                    >
                      Upgrade nu!
                    </button>
                  ) : userSubscription ? (
                    <div className="text-center p-4 bg-gray-100 rounded-lg">
                      <p className="text-gray-600 text-sm inter-tight-400">Niet beschikbaar voor downgrade</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(sub._id)}
                      className="w-full bg-gradient-to-br from-[#22C55E] to-[#059669] cursor-pointer text-sm text-white inter-tight-400 py-3 px-6 rounded-2xl transition-colors duration-500"
                    >
                      Meld je NU aan!
                    </button>
                  )}

                  {/* <p className="text-xs text-gray-500 text-center mt-4">
                    {sub.priceType === 'monthly' && `€9,99 / maand`}
                    {sub.priceType === 'yearly' && `€99,99 / jaar`}
                    {sub.priceType === 'one-time' && `€199,99 eenmalig`}
                  </p> */}
                </div>
              </div>
            );
          })}
        </div>
        
        {userSubscription && (
          <div className="bg-blue-50 p-4 rounded-lg max-w-3xl mx-auto">
            <h3 className="text-blue-800 font-semibold mb-2 poppins-700">Opmerking over wijzigen van abonnement:</h3>
            <p className="text-blue-700 text-sm inter-tight-400">
              Om van abonnement te wijzigen, moet je eerst je huidige abonnement annuleren. 
              Na annulering kun je een nieuw abonnement kiezen.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Pricing;