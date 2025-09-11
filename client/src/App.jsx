import './App.css'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/navbar'
import Footer from './components/footer'
import Home from './pages/home'
import SignUpPage from './pages/signup'
import SignInPage from './pages/signin'
import CreateProfile from './pages/create-profile'
import TestRegister from './pages/test-register'
import AboutUs from './pages/about-us'
import Activities from './pages/activities'
import ActivityDetailPage from './pages/activity-detail'
import Progress from './pages/progress'
import Library from './pages/library'
import BadgeJourney from './pages/badge-journey'
import CreateActivity from './pages/create-activity'
import ForgotPassword from './pages/forgot-password'
import VerifyOtp from './pages/verify-otp'
import ResetPassword from './pages/reset-password'

import UserProfileLayout from './layout/user-profile'
import Profile from './pages/profile'
import Subscription from './pages/subscription'
import Preferences from './pages/preferences'
import NotificationSettings from './pages/notifications'
import Pricing from './pages/pricing'
import ReferFriend from './pages/refer-a-friend'
import EarnBadge from './pages/earn-badge'

import ScrollToTop from './components/ScrollToTop'
import { ToastContainer } from 'react-toastify'

import Success from './pages/subscription-modes/success'
import Cancel from './pages/subscription-modes/cancel'
import Faqs from './pages/faqs'
import PrivacyPolicy from './pages/privacy-policy'
import ContactUs from './pages/contact-us'
import { SidebarProvider } from './context/SidebarContext'


function AppWrapper() {
  const location = useLocation()
  const hideLayout = location.pathname === '/signup' || location.pathname === '/signin' || location.pathname === '/admin-signin' || location.pathname === '/reset-password' || location.pathname === '/verify-otp' || location.pathname === '/forgot-password' || location.pathname === '/create-profile'


  return (
    <>
      {!hideLayout && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/create-profile" element={<CreateProfile />} />
        <Route path="/test-register" element={<TestRegister />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/activity-detail/:id" element={<ActivityDetailPage />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/library" element={<Library />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/badge-journey" element={<BadgeJourney />} />
        <Route path="/create-activity" element={<CreateActivity />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/success" element={<Success />} />
        <Route path="/cancel" element={<Cancel />} />
        <Route path="/faqs" element={<Faqs />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/contact-us" element={<ContactUs />} />

        {/* User Profile Routes */}

        <Route path="/user-profile" element={<UserProfileLayout />}>
          <Route path="profile" element={<Profile />} />
          <Route path="subscription" element={<Subscription />} />
          <Route path="preferences" element={<Preferences />} />
          <Route path="refer-a-friend" element={<ReferFriend />} />
          <Route path="earn-a-badge" element={<EarnBadge />} />
          <Route path="notifications" element={<NotificationSettings />} />
        </Route>

      </Routes>
      {!hideLayout && <Footer />}
    </>
  )
}

function App() {
  return (
    <SidebarProvider>

    <BrowserRouter>
      <ScrollToTop />
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        limit={1} // Ensures only one toast shows at a time
        style={{ zIndex: 100000000 }} // Ensures the toast is on top of other elements
        />
      <AppWrapper />
    </BrowserRouter>
        </SidebarProvider>
  )
}

export default App
