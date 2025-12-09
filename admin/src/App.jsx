import './App.css'
import { BrowserRouter, Routes, Route, useLocation, Outlet, Navigate } from 'react-router-dom'
import Navbar from './components/navbar'
import AdminSignin from './pages/admin-dashboard-pages/admin-login'
import AdminDashboardLayout from './layout/admin-dashboard'
import Dashboard from './pages/admin-dashboard-pages/dashboard'
import ActiviteitenBeheer from './pages/admin-dashboard-pages/activiteitenbeheer'
import IngezondenActiviteiten from './pages/admin-dashboard-pages/ingezondenactiviteiten'
import GebruikersBeheren from './pages/admin-dashboard-pages/gebruikersbeheren'
import ContactBerichten from './pages/admin-dashboard-pages/contactberichten'
import TestgroepAanmeldingen from './pages/admin-dashboard-pages/testgroepaanmeldingen'
import Kwaliteitsaudit from './pages/admin-dashboard-pages/kwaliteitsaudit'
import EarlyAccess from './pages/admin-dashboard-pages/earlyaccess'
import Managebadge from './pages/admin-dashboard-pages/manage-badge'
import ScrollToTop from './components/ScrollToTop'
import MarketingUsers from './pages/admin-dashboard-pages/marketing-users'
import Rewards from './pages/admin-dashboard-pages/reward'
import TopContributors from './pages/admin-dashboard-pages/top-contributers'
import TrackingEvents from './pages/admin-dashboard-pages/tracking-events'
import RetentionDashboard from './pages/admin-dashboard-pages/retention-metrics'
import FunnelConversion from './pages/admin-dashboard-pages/conversion-funnel'


import CreateCommunity from './pages/admin-dashboard-pages/create-community'
import CommunityDetail from './pages/admin-dashboard-pages/community-detail'
import CommunityManagement from './pages/admin-dashboard-pages/manage-communities'
import EditCommunity from './pages/admin-dashboard-pages/edit-community'
import ViewCommunity from './pages/admin-dashboard-pages/view-community'

import { SidebarProvider } from './context/SidebarContext'

function AppLayout() {
  const location = useLocation()
  const hideNavbar = location.pathname === '/admin/signin' || location.pathname === '/admin'

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Outlet />
    </>
  )
}

function PrivateRoute({ children }) {
  const token = localStorage.getItem('adminAuthToken')
  // Redirect to /admin/signin instead of /signin
  return token ? children : <Navigate to="/admin/signin" replace />
}

function App() {
  return (
    <SidebarProvider>
      <BrowserRouter basename="/admin">
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Navigate to="/signin" replace />} />

          <Route path="/signin" element={<AdminSignin />} />

          <Route element={<AppLayout />}>
            <Route
              path="admin-dashboard"
              element={
                <PrivateRoute>
                  <AdminDashboardLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="activiteitenbeheer" element={<ActiviteitenBeheer />} />
              <Route path="ingezondenactiviteiten" element={<IngezondenActiviteiten />} />
              <Route path="gebruikersbeheer" element={<GebruikersBeheren />} />
              <Route path="contactberichten" element={<ContactBerichten />} />
              <Route path="testgroepaanmeldingen" element={<TestgroepAanmeldingen />} />
              <Route path="kwaliteitsaudit" element={<Kwaliteitsaudit />} />
              <Route path="earlyaccess" element={<EarlyAccess />} />
              <Route path="manage-badge" element={<Managebadge />} />
              <Route path="marketinggebruikers" element={<MarketingUsers />} />
              <Route path="reward-settings" element={<Rewards />} />
              <Route path="top-contributors" element={<TopContributors />} />
              <Route path="events-tracking" element={<TrackingEvents />} />
              <Route path="retention-metrics" element={<RetentionDashboard />} />
              <Route path="funnel-conversion" element={<FunnelConversion />} />
              <Route path="manage-communities" element={<CommunityManagement />} />
              <Route path="create-community" element={<CreateCommunity />} />
              <Route path="community-detail/:id" element={<CommunityDetail />} />
              <Route path="edit-community/:id" element={<EditCommunity />} />
              <Route path="view-community/:id" element={<ViewCommunity />} />
              



            </Route>

            {/* Update 404 redirect to /admin/signin */}
            <Route path="*" element={<Navigate to="/signin" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SidebarProvider>
  )
}

export default App