import { useEffect, useState } from "react";
import { ArrowLeft, Clock, Users, Star, CheckCircle, X } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import DetailImage from "../../public/images/SVG-detail.svg";
import DetailImage1 from "../../public/images/SVG-detail-1.svg";
import DetailImage2 from "../../public/images/Frame (1)-detail.svg";
import { IoMdStar } from "react-icons/io";
import Faqs from "../components/faqs";
import BadgeModal from "../components/badge-modal";
import { useSingleActivity } from "../hooks/useSingleActivity";
import {
  learningDomainImages,
  learningDomainColors,
  LearningDomainDescription,
  newlearningDomainColors,
} from "../utils/learningDomain";
import LoaderOverlay from "../components/LoaderOverlay";
import { toast, ToastContainer } from "react-toastify";
import { useMarkActivityCompleted, useRateActivity } from "../hooks/useActivityAPI";

const Sparkle = ({ style }) => (
  <div className="absolute pointer-events-none" style={style}>
    <div className="sparkle">✨</div>
  </div>
);

const CelebrationSparkles = ({ isVisible, onComplete }) => {
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    if (isVisible) {
      const newSparkles = [];
      for (let i = 0; i < 10; i++) {
        newSparkles.push({
          id: i,
          left: Math.random() * 20 + 20 + "%",
          top: Math.random() * 90 + 20 + "%",
          animationDelay: Math.random() * 2 + "s",
          animationDuration: Math.random() * 3 + 2 + "s",
        });
      }
      setSparkles(newSparkles);
      const timer = setTimeout(() => {
        setSparkles([]);
        onComplete();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {sparkles.map((sparkle) => (
        <Sparkle
          key={sparkle.id}
          style={{
            left: sparkle.left,
            top: sparkle.top,
            animationDelay: sparkle.animationDelay,
            animationDuration: sparkle.animationDuration,
          }}
        />
      ))}
      <style jsx>{`
        .sparkle {
          font-size: 30px;
          animation: sparkleButtonFloat var(--duration, 3s) ease-out forwards;
        }
        @keyframes sparkleButtonFloat {
          0% {
            transform: translateX(0) translateY(0) rotate(0deg) scale(0);
            opacity: 0;
          }
          20% {
            opacity: 1;
            transform: translateX(5px) translateY(-15px) rotate(180deg) scale(1);
          }
          60% {
            opacity: 1;
            transform: translateX(-10px) translateY(-25px) rotate(360deg) scale(1.1);
          }
          90% {
            opacity: 1;
            transform: translateX(15px) translateY(-35px) rotate(540deg) scale(1);
          }
          100% {
            transform: translateX(0) translateY(-45px) rotate(720deg) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

function ActivityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [apiResponseReceived, setApiResponseReceived] = useState(false);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);

  const { markCompleted } = useMarkActivityCompleted();
  const { rateActivity } = useRateActivity();
  const { activity, loading, error } = useSingleActivity(id);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (activity?.isCompleted) {
      setCompleted(true);
    }
  }, [activity]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleMarkComplete = async () => {
    if (completed || isMarkingComplete) return;

    try {
      setIsMarkingComplete(true);
      setShowCelebration(true);
      setApiResponseReceived(false);

      const response = await markCompleted(id);
      
      setCompleted(true);
      console.log("API Response:", response);

      // Handle badges from the response
      let badgesToSet = [];
      if (response.badges && Array.isArray(response.badges) && response.badges.length > 0) {
        badgesToSet = response.badges;
      } else if (response.badge && typeof response.badge === "object") {
        badgesToSet = [response.badge];
      }

      if (badgesToSet.length > 0) {
        setEarnedBadges(badgesToSet);
      }

      setApiResponseReceived(true);
    } catch (error) {
      setShowCelebration(false);
      setApiResponseReceived(true);
      toast.error(error.message);
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const handleCelebrationComplete = () => {
    setShowCelebration(false);

    if (apiResponseReceived && earnedBadges.length > 0) {
      setTimeout(() => {
        setShowBadgeModal(true);
      }, 100);
    }
  };

  useEffect(() => {
    if (!showCelebration && apiResponseReceived && earnedBadges.length > 0 && !showBadgeModal) {
      setTimeout(() => {
        setShowBadgeModal(true);
      }, 100);
    }
  }, [showCelebration, apiResponseReceived, earnedBadges, showBadgeModal]);

  const handleBadgeModalClose = () => {
    setShowBadgeModal(false);
    setTimeout(() => {
      setEarnedBadges([]);
      setApiResponseReceived(false);
    }, 300);
  };

  const handleRatingClick = () => {
    setShowRatingModal(true);
  };

  const handleStarClick = (rating) => {
    setSelectedRating(rating * 2);
  };

  const handleSubmitRating = async () => {
    try {
      if (selectedRating < 1 || selectedRating > 10) {
        toast.error("Rating must be between 1 and 10");
        return;
      }
      await rateActivity(id, selectedRating);
      setShowRatingModal(false);
      setSelectedRating(0);
      toast.success(" Beoordeling succesvol ingediend!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleRateLater = () => {
    setShowRatingModal(false);
    setSelectedRating(0);
  };

  const getRatingRange = (index) => {
    const ranges = [
      <span key={0}>
        <span className="font-bold">1-2</span>
      </span>,
      <span key={1}>
        <span className="font-bold">3-4</span>
      </span>,
      <span key={2}>
        <span className="font-bold">5-6</span>
      </span>,
      <span key={3}>
        <span className="font-bold">7-8</span>
      </span>,
      <span key={4}>
        <span className="font-bold">9-10</span>
      </span>,
    ];
    return ranges[index];
  };

  if (loading) {
    return <LoaderOverlay />;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center">Error: {error.message}</div>;
  }

  if (!activity) {
    return <div className="min-h-screen flex items-center justify-center">Activity not found</div>;
  }

  const domainImage = learningDomainImages[activity.learningDomain];
  const domainColor = learningDomainColors[activity.learningDomain];
  const domainDescription = LearningDomainDescription[activity.learningDomain];
  const newdomainColor = newlearningDomainColors[activity.learningDomain];
  const averageRating = activity.averageRating || 0;

  return (
    <>
      <ToastContainer style={{ zIndex: 100000000 }} />
      <div className="min-h-screen bg-gray-50 pb-10">
        <CelebrationSparkles isVisible={showCelebration} onComplete={handleCelebrationComplete} />
        <BadgeModal isVisible={showBadgeModal} onClose={handleBadgeModalClose} badges={earnedBadges} />
        
        {isMarkingComplete && <LoaderOverlay />}

        <div className="md:w-[90%] w-full mx-auto p-4 lg:p-6">
          <div className="px-4 py-3">
            <button onClick={handleBack} className="flex items-center text-[#262F40] cursor-pointer transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="text-sm inter-tight-400 font-medium">Terug naar activiteiten</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6 p-4 rounded-2xl bg-[#F1F6FB]">
              <div className={`${domainColor.split(" ")[0]} rounded-2xl text-white p-8 text-center`}>
                <div className="w-16 h-16 shadow-2xl bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <div>
                    <img src={domainImage || "/placeholder.svg"} alt="" className="h-10 w-10" />
                  </div>
                </div>
                <h1 className="text-2xl lg:text-3xl inter-tight-700 font-bold leading-tight">{activity.title}</h1>
                <div className="flex justify-center mt-2">
                  <span className={`${newdomainColor} px-3 py-1 rounded-full text-xs font-medium`}>
                    {activity.learningDomain}
                  </span>
                </div>
                <div className="flex justify-center items-center">
                  {activity.nickname && (
                    <p className={` ${newdomainColor} w-50  px-3 mt-2 py-1 rounded-full text-xs font-medium`}>
                      Gemaakt door: {activity.nickname}
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl p-3">
                <h2 className="text-lg poppins-700 font-semibold mb-1 text-[#111827]">Over deze activiteit</h2>
                <p className="text-[#374151] inter-tight-400 text-md leading-relaxed">{activity.description}</p>
              </div>

              <div className="p-3">
                <h2 className="text-lg inter-tight-700 font-semibold mb-3 flex items-center text-[#1F1F1F]">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center mr-1">
                    <div>
                      <img src={DetailImage || "/placeholder.svg"} alt="" />
                    </div>
                  </div>
                  Benodigdheden
                </h2>
                <div className="bg-[#F0FDF4] border border-[#BBF7D0] p-6 rounded-2xl">
                  <p className="text-sm inter-tight-400 text-[#166534]">{activity.materials}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6">
                <h2 className="text-lg poppins-700 font-semibold mb-4 flex items-center text-[#111827]">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center mr-1">
                    <div>
                      <img src={DetailImage1 || "/placeholder.svg"} alt="" />
                    </div>
                  </div>
                  Stap voor stap
                </h2>
                <div className="space-y-4">
                  {activity.instructions.map((step, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs inter-tight-700 font-bold">{index + 1}</span>
                      </div>
                      <p className="text-sm inter-tight-400 text-[#4B5563]">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl p-3">
                <h2 className="text-lg poppins-700 font-semibold mb-3 flex items-center text-[#111827]">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center mr-1">
                    <div>
                      <img src={DetailImage2 || "/placeholder.svg"} alt="" />
                    </div>
                  </div>
                  Effect op het kind
                </h2>
                {activity.effect ? (
                  <p className="text-[#374151] inter-tight-400 text-md leading-relaxed">{activity.effect}</p>
                ) : (
                  <p className="text-[#374151] inter-tight-400 text-md leading-relaxed">
                    This activity helps children develop various skills related to {activity.learningDomain}.
                  </p>
                )}
              </div>

              <button
                onClick={handleMarkComplete}
                disabled={completed || isMarkingComplete}
                className={`w-full ${
                  completed
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-br from-[#079A68] to-[#20C25F] hover:from-[#068a5d] hover:to-[#1cb055]"
                } text-white py-3 text-sm px-6 rounded-xl inter-tight-700 font-medium transition-colors flex items-center justify-center space-x-2 ${
                  showCelebration ? "animate-pulse" : ""
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                <span>
                  {completed 
                    ? "Voltooid" 
                    : isMarkingComplete 
                      ? "Bezig..." 
                      : "Markeer als voltooid"}
                </span>
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-3xl shadow-lg border border-[#E2E4E9] p-6">
                <h3 className="inter-tight-700 font-semibold mb-4 text-[#1F1F1F]">Activiteit details</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-[#4B5563]">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="text-sm inter-tight-400">Duur</span>
                    </div>
                    <span className="text-sm inter-tight-700 font-medium text-[#1F1F1F]">{activity.time} min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-[#4B5563]">
                      <Users className="w-4 h-4 mr-2" />
                      <span className="text-sm inter-tight-400">Leeftijd</span>
                    </div>
                    <span className="text-sm inter-tight-700 font-medium text-[#1F1F1F]">{activity.ageGroup}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-[#4B5563]">
                      <Star className="w-4 h-4 mr-2" />
                      <span className="text-sm inter-tight-400">Rating</span>
                    </div>
                    <button
                      onClick={handleRatingClick}
                      className="text-sm text-[#1F1F1F] hover:text-blue-600 cursor-pointer"
                    >
                      <span className="inter-tight-700 font-bold">{averageRating}</span>
                      <span className="inter-tight-400 font-light">/10</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-lg border border-[#E2E4E9] p-6">
                <h3 className="inter-tight-700 font-semibold mb-4 text-[#1F1F1F]">Leergebied</h3>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-2xl mt-1 flex items-center justify-center flex-shrink-0">
                    <img
                      src={domainImage || "/placeholder.svg"}
                      alt={activity.learningDomain}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="inter-tight-700 font-medium text-base text-[#1F1F1F] mb-1">
                      {activity.learningDomain}
                    </p>
                    <p className="text-sm inter-tight-400 text-[#4B5563] leading-relaxed">{domainDescription}</p>
                  </div>
                </div>
              </div>

              {completed && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <div>
                      <p className="inter-tight-700 font-medium text-sm text-green-800">Activiteit voltooid!</p>
                      <p className="text-xs inter-tight-400 text-green-600">Goed gedaan! 🎉</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {showRatingModal && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 md:p-4 p-2">
            <div className="bg-white rounded-3xl p-8 max-w-xl w-full mx-4 relative">
              <button
                onClick={() => setShowRatingModal(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
              <div className="text-center">
                <h2 className="text-lg font-semibold inter-tight-400 text-gray-800 mb-8">
                  Beoordeling Selecteer Een Aantal Sterren:
                </h2>
                <div className="flex justify-center space-x-4 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleStarClick(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <IoMdStar
                        className={`w-12 h-12 ${star * 2 <= selectedRating ? "text-[#EEAA43]" : "text-[#D9D9D9]"}`}
                      />
                    </button>
                  ))}
                </div>
                <div className="flex justify-center space-x-8 mb-8 text-sm text-gray-500">
                  {[1, 2, 3, 4, 5].map((index) => (
                    <span key={index} className={selectedRating === index * 2 ? "text-green-600 font-medium" : ""}>
                      {getRatingRange(index - 1)}
                    </span>
                  ))}
                </div>
                <div className="flex md:flex-row gap-2 flex-col w-full space-x-4">
                  <button
                    onClick={handleRateLater}
                    className="flex-1 px-6 py-2 md:w-auto w-full border inter-tight-400 text-sm border-gray-600 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Beoordeel Later
                  </button>
                  <button
                    onClick={handleSubmitRating}
                    disabled={selectedRating === 0}
                    className={`flex-1 px-6 py-2 md:w-auto w-full rounded-xl inter-tight-400 text-sm font-medium transition-colors ${
                      selectedRating > 0
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Verstuur
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <Faqs />
      </div>
    </>
  );
}

export default ActivityDetail;