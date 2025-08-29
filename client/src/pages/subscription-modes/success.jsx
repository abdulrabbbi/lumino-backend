/* eslint-disable no-unused-vars */
// Success.jsx
import React, { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight, Home, XCircle, Clock, InfinityIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../utils/api';
import BadgeModal from '../../components/badge-modal';

const Success = () => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState([]); // Track earned badges
  const [showBadgeModal, setShowBadgeModal] = useState(false); // Control modal visibility

  useEffect(() => {
    const verifySubscription = async (sessionId) => {
      setVerifying(true);
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${BASE_URL}/verify-subscription`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ session_id: sessionId })
        });
  
        const result = await response.json();
  
        if (!response.ok) {
          setOrderDetails({
            status: 'failed',
            error: result.error
          });
          toast.error(result.error || 'Verificatie van abonnement mislukt', {
            position: 'top-right',
            autoClose: 5000,
          });
        } else {
          setOrderDetails({
            status: 'success',
            subscription: result.subscription,
            expiresAt: result.expiresAt,
            trialEndDate: result.trialEndDate,
            orderStatus: result.orderStatus
          });
          
          // Check if badges were earned and set them
          if (result.badges && result.badges.length > 0) {
            setEarnedBadges(result.badges);
            
            // Show badge modal after 3 seconds
            setTimeout(() => {
              setShowBadgeModal(true);
            }, 2000);
          }
          
          toast.success('Abonnement succesvol geactiveerd!', {
            position: 'top-right',
            autoClose: 3000,
          });
        }
      } catch (error) {
        console.error('Verification error:', error);
        setOrderDetails({
          status: 'error',
          error: error.message
        });
        toast.error('Verificatie van abonnement mislukt. Neem contact op met support.', {
          position: 'top-right',
          autoClose: 5000,
        });
      } finally {
        setLoading(false);
        setVerifying(false);
      }
    };
  
    // Extract session_id from URL query parameters
    const queryParams = new URLSearchParams(window.location.search);
    const sessionId = queryParams.get('session_id');
  
    if (sessionId) {
      verifySubscription(sessionId);
    } else {
      setLoading(false);
      setOrderDetails({
        status: 'error',
        error: 'Geen sessie-ID gevonden'
      });
      toast.error('Geen sessie-ID gevonden in de URL', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  }, []);
  

  if (loading || verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-green-500 border-r-green-300 border-b-green-500 border-l-green-300 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {verifying ? 'Bevestiging van uw abonnement...' : 'Bevestiging ophalen...'}
          </p>
        </div>
      </div>
    );
  }

  const isSuccess = orderDetails?.status === 'success';
  const isFailed = orderDetails?.status === 'failed';
  const isError = orderDetails?.status === 'error';
  
  // Check if it's a lifetime subscription
  const isLifetimeSubscription = orderDetails?.subscription === "Eeuwig Sterk" && orderDetails?.expiresAt === null;

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12">
            <div className="text-center mb-8">
              {isSuccess ? (
                <>
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mt-6 poppins-700">Bedankt voor je aankoop!</h1>
                  <p className="text-gray-600 mt-2 inter-tight-400">Je betaling is succesvol verwerkt.</p>
                </>
              ) : isFailed ? (
                <>
                  <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                    <Clock className="w-12 h-12 text-yellow-600" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mt-6">Betaling in behandeling</h1>
                  <p className="text-gray-600 mt-2">Je betaling is nog niet voltooid.</p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <XCircle className="w-12 h-12 text-red-600" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mt-6">Er is een fout opgetreden</h1>
                  <p className="text-gray-600 mt-2">{orderDetails?.error}</p>
                </>
              )}
            </div>

            {isSuccess && orderDetails && (
              <>
                <div className="border border-gray-200 rounded-2xl p-6 mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 poppins-700">Orderdetails</h2>
                  <div className="space-y-3 inter-tight-400">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Abonnement:</span>
                      <span className="font-medium">{orderDetails.subscription}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium text-green-600">Betaald</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vervaldatum:</span>
                      <span className="font-medium">
                        {isLifetimeSubscription ? (
                          <div className="flex items-center">
                            <InfinityIcon className="w-5 h-5 mr-1" />
                            Levenslang
                          </div>
                        ) : (
                          new Date(orderDetails.expiresAt).toLocaleDateString('nl-NL')
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-2xl p-6 mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 poppins-700">Wat gebeurt er nu?</h2>
                  <ul className="space-y-3 inter-tight-400">
                    <li className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="ml-3 text-gray-700">Je hebt toegang tot alle premium functies</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="ml-3 text-gray-700">We hebben een bevestiging naar je e-mailadres gestuurd</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="ml-3 text-gray-700">
                        {isLifetimeSubscription ? 'Je hebt levenslang toegang' : 'Je abonnement is direct actief'}
                      </span>
                    </li>
                  </ul>
                </div>
              </>
            )}

            {isFailed && (
              <div className="bg-yellow-50 rounded-2xl p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 poppins-700">Wat gebeurt er nu?</h2>
                <ul className="space-y-3 inter-tight-400">
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock className="w-4 h-4 text-yellow-600" />
                    </div>
                    <span className="ml-3 text-gray-700">Je betaling wordt verwerkt</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock className="w-4 h-4 text-yellow-600" />
                    </div>
                    <span className="ml-3 text-gray-700">Je ontvangt een e-mail wanneer de betaling is voltooid</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock className="w-4 h-4 text-yellow-600" />
                    </div>
                    <span className="ml-3 text-gray-700">Je abonnement wordt geactiveerd na betaling</span>
                  </li>
                </ul>
              </div>
            )}

            <div className="flex flex-col justify-center items-center sm:flex-row gap-4">
              {isSuccess ? (
                <>
                  <Link
                    to="/"
                    className="flex items-center cursor-pointer inter-tight-400 justify-center px-10 py-2 bg-gradient-to-br from-[#22C55E] to-[#059669] text-white rounded-2xl font-medium transition-all hover:shadow-lg"
                  >
                    Ga naar je home <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </>
              ) : (
                <Link
                  to="/pricing"
                  className="flex items-center inter-tight-400 cursor-pointer justify-center px-10 py-2 bg-gradient-to-br from-[#22C55E] to-[#059669] text-white rounded-2xl font-medium transition-all hover:shadow-lg"
                >
                  Terug naar abonnementen
                </Link>
              )}
            </div>

            {isFailed && (
              <div className="mt-8 text-center text-sm text-gray-500">
                <p>Problemen met betalen? Neem contact op met onze support.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <BadgeModal
        isVisible={showBadgeModal} 
        onClose={() => setShowBadgeModal(false)} 
        badges={earnedBadges}
      />
    </>
  );
};

export default Success;