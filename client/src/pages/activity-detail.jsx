/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react"
import { ArrowLeft, Clock, Users, Star, CheckCircle, X, Heart, Printer } from 'lucide-react'
import { useParams, useNavigate, useLocation } from "react-router-dom"
import DetailImage from "../../public/images/SVG-detail.svg"
import DetailImage1 from "../../public/images/SVG-detail-1.svg"
import DetailImage2 from "../../public/images/Frame (1)-detail.svg"
import { IoMdStar } from "react-icons/io"
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai"
import Faqs from "../components/faqs"
import BadgeModal from "../components/badge-modal"
import { useSingleActivity } from "../hooks/useSingleActivity"
import {
  learningDomainImages,
  learningDomainColors,
  LearningDomainDescription,
  newlearningDomainColors,
} from "../utils/learningDomain"
import LoaderOverlay from "../components/LoaderOverlay"
import { toast } from "react-toastify"
import { useMarkActivityCompleted, useRateActivity } from "../hooks/useActivityAPI"
import { useNavigation } from "../components/NavigationContext"
import axios from "axios"
import { BASE_URL } from "../utils/api"

const Sparkle = ({ style }) => (
  <div className="absolute pointer-events-none" style={style}>
    <div className="sparkle">✨</div>
  </div>
)

const CelebrationSparkles = ({ isVisible, onComplete }) => {
  const [sparkles, setSparkles] = useState([])

  useEffect(() => {
    if (isVisible) {
      const newSparkles = []
      for (let i = 0; i < 10; i++) {
        newSparkles.push({
          id: i,
          left: Math.random() * 20 + 20 + "%",
          top: Math.random() * 90 + 20 + "%",
          animationDelay: Math.random() * 2 + "s",
          animationDuration: Math.random() * 3 + 2 + "s",
        })
      }
      setSparkles(newSparkles)
      const timer = setTimeout(() => {
        setSparkles([])
        onComplete()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onComplete])

  if (!isVisible) return null

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
  )
}

function ActivityDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { getNavigationState, saveNavigationState } = useNavigation()

  const [showRatingModal, setShowRatingModal] = useState(false)
  const [selectedRating, setSelectedRating] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const [showBadgeModal, setShowBadgeModal] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [earnedBadges, setEarnedBadges] = useState([])
  const [isMarkingComplete, setIsMarkingComplete] = useState(false)
  const [hasShownRatingModal, setHasShownRatingModal] = useState(false)
  const [isSubmittingRating, setIsSubmittingRating] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [showReminder, setShowReminder] = useState(false)

  const { markCompleted } = useMarkActivityCompleted()
  const { rateActivity } = useRateActivity()
  const { activity, loading, error } = useSingleActivity(id)

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    
    // Get current computed styles for colors and fonts
    const headerElement = document.querySelector('[class*="domainColor"]')
    const computedStyle = headerElement ? window.getComputedStyle(headerElement) : {}
    
    const printHTML = `
      <!DOCTYPE html>
      <html lang="nl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${activity?.title || 'Activity'} - Print</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
            padding: 40px 20px;
          }
          
          .print-container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
          }
          
          .print-header-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e5e7eb;
          }
          
          .logo-section {
            display: flex;
            align-items: center;
          }
          
          .logo-section img {
            height: 40px;
            width: auto;
            object-fit: contain;
          }
          
          .print-date {
            font-size: 12px;
            color: #666;
          }
          
          .print-main-header {
            background: linear-gradient(135deg, #079A68 0%, #20C25F 100%);
            color: white;
            padding: 40px 30px;
            border-radius: 20px;
            text-align: center;
            margin-bottom: 30px;
          }
          
          .domain-icon {
            width: 60px;
            height: 60px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
          }
          
          .domain-icon img {
            width: 40px;
            height: 40px;
            object-fit: contain;
          }
          
          .print-title {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 15px;
            line-height: 1.3;
          }
          
          .print-domain-badge {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-top: 10px;
          }
          
          .print-creator {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 13px;
            margin-top: 10px;
            margin-left: 10px;
          }
          
          .print-content {
            display: flex;
            flex-direction: column;
            gap: 25px;
          }
          
          .print-section {
            margin-bottom: 0;
            page-break-inside: avoid;
          }
          
          /* Zorg ervoor dat materialen en instructies samen blijven */
          .instructions-group {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .section-title {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 15px;
            color: #1f2937;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .section-icon {
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          
          .section-icon img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
          
          .description-text {
            font-size: 15px;
            color: #374151;
            line-height: 1.6;
            margin-bottom: 10px;
          }
          
          .materials-box {
            background: #f0fdf4;
            border: 2px solid #bbf7d0;
            padding: 20px;
            border-radius: 15px;
            font-size: 14px;
            color: #166534;
            line-height: 1.6;
            margin-bottom: 5px;
          }
          
          .steps-container {
            space: 15px;
          }
          
          .step {
            display: flex;
            gap: 15px;
            margin-bottom: 15px;
            page-break-inside: avoid;
          }
          
          .step-number {
            flex-shrink: 0;
            width: 30px;
            height: 30px;
            background: #3b82f6;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
          }
          
          .step-text {
            flex-grow: 1;
            font-size: 14px;
            color: #4b5563;
            line-height: 1.6;
            padding-top: 3px;
          }
          
          .activity-info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            background: #f9fafb;
            padding: 20px;
            border-radius: 15px;
            margin-bottom: 20px;
            page-break-inside: avoid;
          }
          
          .info-item {
            display: flex;
            flex-direction: column;
            gap: 5px;
          }
          
          .info-label {
            font-size: 12px;
            color: #666;
            font-weight: 600;
            text-transform: uppercase;
          }
          
          .info-value {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
          }
          
          .divider {
            border: none;
            border-top: 1px solid #e5e7eb;
            margin: 20px 0;
          }
          
          .print-footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            font-size: 12px;
            color: #666;
          }
          
          .learning-domain-section {
            background: white;
            border: 1px solid #e5e7eb;
            padding: 20px;
            border-radius: 15px;
            page-break-inside: avoid;
          }
          
          .domain-info {
            display: flex;
            gap: 15px;
          }
          
          .domain-info-icon {
            width: 32px;
            height: 32px;
            flex-shrink: 0;
          }
          
          .domain-info-icon img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
          
          .domain-info-content {
            flex-grow: 1;
          }
          
          .domain-info-title {
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 5px;
            font-size: 15px;
          }
          
          .domain-info-description {
            font-size: 13px;
            color: #4b5563;
            line-height: 1.5;
          }
          
          /* Print-specifieke optimalisaties */
          @media print {
            body {
              background: white;
              padding: 0;
              font-size: 12pt;
            }
            .print-container {
              box-shadow: none;
              border: none;
              max-width: 100%;
            }
            .print-content {
              gap: 15px;
            }
            .print-section {
              margin-bottom: 15px;
            }
            /* Forceer dat materialen en instructies op dezelfde pagina blijven */
            .instructions-group {
              page-break-inside: avoid;
              break-inside: avoid-page;
            }
            /* Verminder padding voor betere paginering */
            .print-main-header {
              padding: 25px 20px;
              margin-bottom: 20px;
            }
            .materials-box, .steps-container {
              page-break-inside: avoid;
            }
            /* Optimaliseer stap-weergave voor print */
            .step {
              margin-bottom: 10px;
              page-break-inside: avoid;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          <!-- Header with Logo -->
          <div class="print-header-top">
            <div class="logo-section">
              <img src="/logo.svg" alt="Logo" />
            </div>
            <div class="print-date">
              Gedrukt op ${new Date().toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          
          <!-- Main Header Section -->
          <div class="print-main-header">
            <div class="domain-icon">
              <img src="${activity?.learningDomain ? learningDomainImages[activity.learningDomain] : '/placeholder.svg'}" alt="Domain" />
            </div>
            <h1 class="print-title">${activity?.title || 'Activity'}</h1>
            <div>
              <span class="print-domain-badge">${activity?.learningDomain || 'Unknown'}</span>
              ${activity?.nickname ? `<span class="print-creator">Gemaakt door: ${activity.nickname}</span>` : ''}
            </div>
          </div>
          
          <!-- Activity Info Grid -->
          <div class="activity-info-grid">
            <div class="info-item">
              <span class="info-label">⏱ Duur</span>
              <span class="info-value">${activity?.time || '0'} minuten</span>
            </div>
            <div class="info-item">
              <span class="info-label">👥 Leeftijd</span>
              <span class="info-value">${activity?.ageGroup || 'Niet gespecificeerd'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">📚 Leergebied</span>
              <span class="info-value">${activity?.learningDomain || 'Unknown'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">⭐ Gemiddelde Beoordeling</span>
              <span class="info-value">${(activity?.averageRating || 0).toFixed(1)}/10</span>
            </div>
          </div>
          
          <hr class="divider" />
          
          <div class="print-content">
            <!-- Description Section -->
            <div class="print-section">
              <h2 class="section-title">
                <span class="section-icon">📝</span>
                Over deze activiteit
              </h2>
              <p class="description-text">${activity?.description || 'Geen beschrijving beschikbaar.'}</p>
            </div>
            
            <!-- Materials and Instructions Group - blijft bij elkaar -->
            <div class="instructions-group">
              <!-- Materials Section -->
              <div class="print-section">
                <h2 class="section-title">
                  <span class="section-icon">🛠</span>
                  Benodigdheden
                </h2>
                <div class="materials-box">
                  ${activity?.materials || 'Geen specifieke materialen benodigd.'}
                </div>
              </div>
              
              <!-- Instructions Section -->
              <div class="print-section">
                <h2 class="section-title">
                  <span class="section-icon">📋</span>
                  Stap voor stap instructies
                </h2>
                <div class="steps-container">
                  ${activity?.instructions?.map((step, index) => `
                    <div class="step">
                      <div class="step-number">${index + 1}</div>
                      <div class="step-text">${step}</div>
                    </div>
                  `).join('') || '<p class="description-text">Geen instructies beschikbaar.</p>'}
                </div>
              </div>
            </div>
            
            <!-- Effect Section -->
            <div class="print-section">
              <h2 class="section-title">
                <span class="section-icon">✨</span>
                Effect op je kind
              </h2>
              <p class="description-text">
                ${activity?.effect || `This activity helps children develop various skills related to ${activity?.learningDomain}.`}
              </p>
            </div>
            
            <!-- Learning Domain Info -->
            <div class="print-section">
              <div class="learning-domain-section">
                <h2 class="section-title">
                  <span class="section-icon">
                    <img src="${activity?.learningDomain ? learningDomainImages[activity.learningDomain] : '/placeholder.svg'}" alt="Domain" />
                  </span>
                  ${activity?.learningDomain || 'Learning Domain'}
                </h2>
                <div class="domain-info">
                  <p class="domain-info-description">
                    ${LearningDomainDescription[activity?.learningDomain] || 'Information about this learning domain.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <hr class="divider" />
          
          <!-- Footer -->
          <div class="print-footer">
            <p>© ${new Date().getFullYear()} - Activiteiten Applicatie</p>
            <p>Deze activiteit is afgeprint op ${new Date().toLocaleDateString('nl-NL')}</p>
          </div>
        </div>
      </body>
      </html>
    `
    
    printWindow.document.write(printHTML)
    printWindow.document.close()
    printWindow.focus()
    
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  // Fetch favorite status when activity loads
  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      const authToken = localStorage.getItem("authToken")
      if (!authToken) return

      try {
        const response = await axios.get(`${BASE_URL}/get-user-favorite-activities`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })

        if (response.data.success) {
          const isActivityFavorite = response.data.favorites.some(fav => fav.activityId === id)
          setIsFavorite(isActivityFavorite)
        }
      } catch (error) {
        console.error("Error fetching favorite status:", error)
      }
    }

    if (id) {
      fetchFavoriteStatus()
    }
  }, [id])

  useEffect(() => {
    window.scrollTo(0, 0)
    if (activity?.isCompleted) {
      setCompleted(true)
    }

    let interval

    if (!completed) {
      interval = setInterval(() => {
        setShowReminder(true)
      }, 180000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [activity, completed])

  const handleBack = () => {
    const savedState = getNavigationState()
    console.log("[ActivityDetail] Handling back with saved state:", savedState)

    if (savedState) {
      navigate("/activities", {
        state: {
          fromActivity: true,
          restoreState: savedState,
        },
        replace: false,
      })
    } else {
      navigate("/activities", { state: { fromActivity: true } })
    }
  }

  const handleReturnToOrigin = () => {
    const savedState = getNavigationState()
    console.log("[ActivityDetail] Returning to origin with saved state:", savedState)

    if (savedState) {
      navigate("/activities", {
        state: {
          fromActivity: true,
          restoreState: savedState,
        },
        replace: false,
      })
    } else {
      navigate("/activities", { state: { fromActivity: true } })
    }
  }


  const toggleFavorite = async () => {
    const authToken = localStorage.getItem("authToken")
    if (!authToken) {
      toast.info("Je moet inloggen om activiteiten als favoriet te markeren")
      return
    }

    if (favoriteLoading) return

    const wasFavorite = isFavorite
    setIsFavorite(!wasFavorite)
    setFavoriteLoading(true)

    try {
      const response = await axios.post(
        `${BASE_URL}/toggle-favourite-activity`,
        { activityId: id },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      )

      if (response.data?.success) {
        setIsFavorite(!!response.data.isFavorite)
        if (response.data?.message) {
          toast.success(response.data.message)
        }
      } else {
        setIsFavorite(wasFavorite)
        toast.error("Fout bij bijwerken favorieten")
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
      setIsFavorite(wasFavorite)
      toast.error("Fout bij bijwerken favorieten")
    } finally {
      setFavoriteLoading(false)
    }
  }

  const handleMarkComplete = async () => {
    if (completed || isMarkingComplete) return

    try {
      setIsMarkingComplete(true)

      const loadingToastId = toast.info("Even geduld, de activiteit wordt afgerond…", {
        autoClose: false,
        closeButton: false,
      })

      const response = await markCompleted(id)
      setCompleted(true)

      const badgesToSet = response.badges || (response.badge ? [response.badge] : [])
      setEarnedBadges(badgesToSet)

      toast.dismiss(loadingToastId)

      setShowCelebration(true)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsMarkingComplete(false)
    }
  }

  const handleReminderClose = () => {
    setShowReminder(false)
  }

  const handleReminderAction = () => {
    setShowReminder(false)
    const completeButtons = document.querySelectorAll("button")
    let completeButton = null

    for (const button of completeButtons) {
      if (button.textContent.includes("Markeer als voltooid") || button.textContent.includes("Voltooid")) {
        completeButton = button
        break
      }
    }

    if (completeButton) {
      completeButton.scrollIntoView({ behavior: "smooth", block: "center" })
      completeButton.classList.add("ring-2", "ring-blue-500", "ring-opacity-50")
      setTimeout(() => {
        completeButton.classList.remove("ring-2", "ring-blue-500", "ring-opacity-50")
      }, 2000)
    }
  }

  const handleCelebrationComplete = () => {
    setShowCelebration(false)

    setTimeout(() => {
      if (earnedBadges.length > 0) {
        setShowBadgeModal(true)
      } else {
        setShowRatingModal(true)
      }
    }, 300)
  }

  const handleBadgeModalClose = () => {
    setShowBadgeModal(false)

    setTimeout(() => {
      setShowRatingModal(true)
    }, 300)
  }

  const handleRatingClick = () => {
    setShowRatingModal(true)
  }

  const handleStarClick = (rating) => {
    setSelectedRating(rating * 2)
  }

  const handleSubmitRating = async () => {
    if (isSubmittingRating) return

    if (selectedRating < 1 || selectedRating > 10) {
      toast.error("Selecteer een beoordeling tussen 1 en 10", {
        toastId: "rating-error",
        autoClose: 3000,
      })
      return
    }

    try {
      setIsSubmittingRating(true)
      toast.dismiss()

      await rateActivity(id, selectedRating)

      setShowRatingModal(false)
      setSelectedRating(0)

      setTimeout(() => {
        handleReturnToOrigin()
      }, 1000)
    } catch (error) {
      toast.error(error.message, {
        toastId: "rating-api-error",
        autoClose: 3000,
      })
    } finally {
      setIsSubmittingRating(false)
    }
  }

  const handleRateLater = () => {
    setShowRatingModal(false)
    setSelectedRating(0)

    setTimeout(() => {
      handleReturnToOrigin()
    }, 300)
  }

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
    ]
    return ranges[index]
  }

  if (loading) {
    return <LoaderOverlay />
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center">Error: {error.message}</div>
  }

  if (!activity) {
    return <div className="min-h-screen flex items-center justify-center">Activity not found</div>
  }

  const domainImage = learningDomainImages[activity.learningDomain]
  const domainColor = learningDomainColors[activity.learningDomain]
  const domainDescription = LearningDomainDescription[activity.learningDomain]
  const newdomainColor = newlearningDomainColors[activity.learningDomain]
  const averageRating = activity.averageRating || 0

  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-10">
        <CelebrationSparkles isVisible={showCelebration} onComplete={handleCelebrationComplete} />
        <BadgeModal isVisible={showBadgeModal} onClose={handleBadgeModalClose} badges={earnedBadges} />

        {showReminder && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 md:p-4 p-2">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 relative">
              <button
                onClick={handleReminderClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
                <h2 className="text-xl font-semibold inter-tight-700 text-gray-800 mb-3">Vergeet niet af te ronden!</h2>
                <p className="text-gray-600 inter-tight-400 mb-6">
                  Je bent al even bezig met deze activiteit. Vergeet niet om deze als voltooid te markeren om je
                  vooruitgang bij te houden en badges te verdienen!
                </p>
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={handleReminderAction}
                    className="w-full bg-gradient-to-br from-[#079A68] to-[#20C25F] text-white py-3 rounded-xl inter-tight-700 font-medium hover:from-[#068a5d] hover:to-[#1cb055] transition-colors"
                  >
                    Naar voltooien knop
                  </button>
                  <button
                    onClick={handleReminderClose}
                    className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl inter-tight-400 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Later herinneren
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isMarkingComplete && <LoaderOverlay />}

        <div className="md:w-[90%] w-full mx-auto p-4 lg:p-6">
          <div className="px-4 py-3 flex justify-between items-center">
            <button onClick={handleBack} className="flex items-center text-[#262F40] cursor-pointer transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="text-sm inter-tight-400 font-medium">Terug naar activiteiten</span>
            </button>
            
            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 transition-colors no-print"
              aria-label="Print activiteit"
            >
              <Printer className="w-4 h-4" />
              <span className="text-sm inter-tight-400 text-gray-700 hidden sm:inline">Printen</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6 p-4 rounded-2xl bg-[#F1F6FB]">
              <div className={`${domainColor.split(" ")[0]} rounded-2xl text-white p-8 text-center relative`}>
                {/* Print button in header for easy access */}
                <button
                  onClick={handlePrint}
                  className="absolute top-4 right-16 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors no-print"
                  aria-label="Print activiteit"
                >
                  <Printer className="w-5 h-5" />
                </button>
                
                {/* Favorite button in the header area */}
                <button
                  onClick={toggleFavorite}
                  disabled={favoriteLoading}
                  className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors disabled:opacity-50 no-print"
                  aria-label={isFavorite ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"}
                >
                  {isFavorite ? (
                    <AiFillHeart size={24} color="#ef4444" className={favoriteLoading ? "opacity-70" : ""} />
                  ) : (
                    <AiOutlineHeart size={24} color="white" className={favoriteLoading ? "opacity-70" : ""} />
                  )}
                </button>
                
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
                <h2 className="text-lg poppins-700 font-semibold mb-3 flex items-center text-[#1F1F1F]">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center mr-1">
                    <div>
                      <img src={DetailImage2 || "/placeholder.svg"} alt="" />
                    </div>
                  </div>
                  Effect op je kind
                </h2>
                {activity.effect ? (
                  <p className="text-[#374151] inter-tight-400 text-md leading-relaxed">{activity.effect}</p>
                ) : (
                  <p className="text-[#374151] inter-tight-400 text-md leading-relaxed">
                    This activity helps children develop various skills related to {activity.learningDomain}.
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex md:flex-row flex-col gap-2 w-full space-x-4 no-print">
                <div className="flex flex-1 gap-2">
                  
                  <button
                    onClick={toggleFavorite}
                    disabled={favoriteLoading}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 bg-white rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {isFavorite ? (
                      <AiFillHeart size={20} color="#ef4444" className={favoriteLoading ? "opacity-70" : ""} />
                    ) : (
                      <AiOutlineHeart size={20} color="#6b7280" className={favoriteLoading ? "opacity-70" : ""} />
                    )}
                    <span className="inter-tight-400 font-medium">
                      {isFavorite ? "Verwijder uit favorieten" : "Toevoegen aan favorieten"}
                    </span>
                  </button>

                  <button
                  onClick={handleMarkComplete}
                  disabled={completed || isMarkingComplete}
                  className={`flex-1 ${
                    completed
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-br from-[#079A68] to-[#20C25F] hover:from-[#068a5d] hover:to-[#1cb055]"
                  } text-white py-3 text-sm px-6 rounded-xl inter-tight-700 font-medium transition-colors flex items-center justify-center space-x-2 ${
                    showCelebration ? "animate-pulse" : ""
                  }`}
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>{completed ? "Voltooid" : isMarkingComplete ? "Bezig..." : "Markeer als voltooid"}</span>
                </button>
                </div>
              </div>
             
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
                      className="text-sm text-[#1F1F1F] hover:text-blue-600 cursor-pointer text-right"
                    >
                      <span className="inter-tight-700 font-bold">{averageRating}</span>
                      <span className="inter-tight-400 font-light">/10</span>
                      <br />
                      <span className="inter-tight-400 text-xs text-gray-500">
                        ({activity.ratingCount || 0} {activity.ratingCount === 1 ? 'beoordeling' : 'beoordelingen'})
                      </span>
                    </button>
                  </div>
                  {/* Print option in details panel */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 no-print">
                    <div className="flex items-center text-[#4B5563]">
                      <Printer className="w-4 h-4 mr-2" />
                      <span className="text-sm inter-tight-400">Printen</span>
                    </div>
                    <button
                      onClick={handlePrint}
                      className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer font-medium"
                    >
                      Print activiteit
                    </button>
                  </div>
                  {/* Favorite status in details panel */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center text-[#4B5563]">
                      <Heart className="w-4 h-4 mr-2" />
                      <span className="text-sm inter-tight-400">Favoriet</span>
                    </div>
                    <div className="flex items-center">
                      {isFavorite ? (
                        <div className="flex items-center text-green-600">
                          <AiFillHeart size={16} className="mr-1" />
                          <span className="text-sm inter-tight-400">Ja</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-gray-500">
                          <AiOutlineHeart size={16} className="mr-1" />
                          <span className="text-sm inter-tight-400">Nee</span>
                        </div>
                      )}
                    </div>
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
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 md:p-4 p-2 no-print">
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
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSubmitRating()
                    }}
                    disabled={selectedRating === 0 || isSubmittingRating}
                    className={`flex-1 px-6 py-2 md:w-auto w-full rounded-xl inter-tight-400 text-sm font-medium transition-colors ${
                      selectedRating > 0 && !isSubmittingRating
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {isSubmittingRating ? "Versturen..." : "Verstuur"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <Faqs />
      </div>
    </>
  )
}

export default ActivityDetail
