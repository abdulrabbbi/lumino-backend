/* eslint-disable no-unused-vars */
// ReferralPage.jsx - WITH SHARE OPTIONS
import { useState, useEffect } from "react";
import { IoIosShareAlt, IoLogoWhatsapp, IoLogoFacebook, IoLogoTwitter, IoMdMail } from "react-icons/io";
import axios from "axios";
import { BASE_URL } from "../utils/api.js";
import { toast } from "react-toastify";
import LoaderOverlay from "../components/LoaderOverlay.jsx";

export default function ReferralPage() {
  const [referralData, setReferralData] = useState({
    referralCode: "",
    referralLink: "",
    totalReferrals: 0,
    successfulReferrals: 0,
    referrals: []
  });
  const [loading, setLoading] = useState(true);
  const [showShareOptions, setShowShareOptions] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${BASE_URL}/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setReferralData({
          ...response.data.stats,
          referrals: response.data.referrals || []
        });
      }
    } catch (error) {
      console.error("Error fetching referral data:", error);
      toast.error("Failed to load referral data");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralData.referralLink);
    toast.success("Referral link copied to clipboard!");
  };

  const shareToWhatsApp = () => {
    const message = encodeURIComponent(`Join me on this amazing platform! Get one month free when you sign up using my referral link: ${referralData.referralLink}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const shareToFacebook = () => {
    const url = encodeURIComponent(referralData.referralLink);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent('Join me on this amazing platform! Get one month free when you sign up using my referral link:');
    const url = encodeURIComponent(referralData.referralLink);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const shareToEmail = () => {
    const subject = encodeURIComponent('Join me and get 1 month free!');
    const body = encodeURIComponent(`Hi!\n\nI'd like to invite you to join this amazing platform. When you sign up using my referral link, we both get 1 month free!\n\nHere's my referral link: ${referralData.referralLink}\n\nThanks!`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleShareClick = async () => {
    // Try native sharing first (works on mobile browsers)
    if (navigator.share && navigator.canShare && navigator.canShare({
      title: 'Join me on this amazing platform!',
      text: 'Get one month free when you sign up using my referral link',
      url: referralData.referralLink,
    })) {
      try {
        await navigator.share({
          title: 'Join me on this amazing platform!',
          text: 'Get one month free when you sign up using my referral link',
          url: referralData.referralLink,
        });
        toast.success('Thanks for sharing!');
        return;
      } catch (error) {
        console.log('Native sharing cancelled or failed');
      }
    }
    
    // Fallback to custom share options
    setShowShareOptions(!showShareOptions);
  };

  if (loading) {
    return <LoaderOverlay/>;
  }

  return (
    <div className="">
      <div className="border border-[#E2E4E9] rounded-xl p-5 md:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">
            Refer a Friend & Earn Rewards!
          </h1>
          <p className="text-gray-600">
            Share your referral link with friends. When they sign up, both of you get 1 month free!
          </p>
        </div>

        <div className="mb-6 grid md:grid-cols-2  grid-cols-1 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Referrals</p>
            <p className="text-2xl font-bold text-gray-900">{referralData.totalReferrals}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Successful Referrals</p>
            <p className="text-2xl font-bold text-gray-900">{referralData.successfulReferrals}</p>
          </div>
        </div>

        <div className="mb-5">
          <h2 className="text-2xl inter-tight-400 md:text-[20px] text-gray-900 mb-3">
            How It Works:
          </h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 text-[#737373] flex items-center justify-center text-sm font-medium">
                1.
              </span>
              <p className="text-[14px] inter-tight-400 text-[#737373]">
                Share your link with friends.
              </p>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 text-[#737373] flex items-center justify-center text-sm font-medium">
                2.
              </span>
              <p className="text-[14px] inter-tight-400 text-[#737373]">
                They sign up and complete their first action.
              </p>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 text-[#737373] flex items-center justify-center text-sm font-medium">
                3.
              </span>
              <p className="text-[14px] inter-tight-400 text-[#737373]">
                You both get exclusive rewards!
              </p>
            </div>
          </div>
        </div>

        <div className="mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <label className="text-gray-800 font-medium text-sm whitespace-nowrap">
              Your Referral Link:
            </label>
            <div className="flex-1 bg-gray-100 rounded px-3 py-2">
              <span className="text-gray-800 text-sm break-all">
                {referralData.referralLink}
              </span>
            </div>
            <button 
              onClick={copyToClipboard}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-lg text-sm"
            >
              Copy
            </button>
          </div>
        </div>

        <div className="relative">
          <button 
            onClick={handleShareClick}
            className="bg-green-600 hover:bg-green-700 text-white font-medium px-8 py-2.5 rounded-lg flex items-center gap-2 mb-4"
          >
            <IoIosShareAlt size={20} />
            Share Referral Link
          </button>

          {/* Share Options */}
          {showShareOptions && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Share via:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={shareToWhatsApp}
                  className="flex items-center gap-2 p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium"
                >
                  <IoLogoWhatsapp size={18} />
                  WhatsApp
                </button>
                
                <button
                  onClick={shareToFacebook}
                  className="flex items-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                >
                  <IoLogoFacebook size={18} />
                  Facebook
                </button>
                
                <button
                  onClick={shareToTwitter}
                  className="flex items-center gap-2 p-3 bg-blue-400 hover:bg-blue-500 text-white rounded-lg text-sm font-medium"
                >
                  <IoLogoTwitter size={18} />
                  Twitter
                </button>
                
                <button
                  onClick={shareToEmail}
                  className="flex items-center gap-2 p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium"
                >
                  <IoMdMail size={18} />
                  Email
                </button>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <button
                  onClick={copyToClipboard}
                  className="w-full p-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium"
                >
                  Copy Link to Clipboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Referrals List */}
        {referralData.referrals.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Your Successful Referrals</h3>
            <div className="space-y-3">
              {referralData.referrals.map((referral, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{referral.email}</p>
                    <p className="text-sm text-gray-600">Joined: {new Date(referral.joinedAt).toLocaleDateString()}</p>
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                    Rewarded
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}