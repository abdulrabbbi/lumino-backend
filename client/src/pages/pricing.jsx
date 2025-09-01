/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Check } from 'lucide-react';
import Tick from '../../public/nav-images/contract.svg';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useSubscriptions from '../hooks/useSubscriptions';
import LoaderOverlay from '../components/LoaderOverlay';
import { BASE_URL } from '../utils/api';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Pricing = () => {
  const { subscriptions, loading } = useSubscriptions();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate(); // Initialize navigate

  const handleSubscribe = async (subscriptionId) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/signup'); // Pas dit pad aan naar jouw aanmeldpagina
      return;
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
      toast.error(error.message || 'Something went wrong. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading || isProcessing) {
    return <LoaderOverlay />;
  }

  const sorted = [
    subscriptions.find(s => s.name === 'Proefreis'),
    subscriptions.find(s => s.name === 'Jaaravontuur'),
    subscriptions.find(s => s.name === 'Eeuwig Sterk')
  ].filter(Boolean);

  return (
    <section className="py-16 px-4 mt-10 sm:px-6 lg:px-8 h-auto max-w-7xl m-auto">
      <ToastContainer style={{ zIndex: 100000000 }} />
      <div className="max-w-7xl w-full m-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl inter-tight-700 lg:text-2xl text-[#636363]">
            KIES JE ABONNEMENT!
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {sorted.map((sub, idx) => (
            <div key={sub._id} className={`relative ${sub.name === 'Jaaravontuur' ? 'lg:col-span-1' : ''}`}>
              {sub.name === 'Jaaravontuur' && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#DB297A] to-[#7940EA] rounded-3xl z-0"></div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 z-20">
                    <div className="text-white md:px-6 px-full py-2 font-bold text-sm">Meest gekozen</div>
                  </div>
                </>
              )}

              <div className={`flex flex-col justify-between 
  ${sub.name === 'Proefreis' || sub.name === 'Eeuwig Sterk' ? 'md:h-[450px] mt-16 h-full' : ''} 
  bg-white 
  ${sub.name === 'Jaaravontuur' ? 'mt-10 m-3 pb-24' : ''} 
  rounded-3xl p-8 shadow-lg border-2 border-gray-200 relative z-10`}>
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

                <button
                  onClick={() => handleSubscribe(sub._id)}
                  className="w-full bg-gradient-to-br from-[#22C55E] to-[#059669] cursor-pointer text-sm text-white inter-tight-400 py-3 px-6 rounded-2xl transition-colors duration-500"
                >
                  Meld je NU aan!
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
  {sub.priceType === 'monthly' && `€9,99 / maand`}
  {sub.priceType === 'yearly' && `€99,99 / jaar`}
  {sub.priceType === 'one-time' && `€199,99 eenmalig`}
</p>

              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;