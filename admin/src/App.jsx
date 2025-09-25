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

import { SidebarProvider } from './context/SidebarContext'

function AppLayout() {
  const location = useLocation()
  // Update paths to include /admin prefix
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
      {/* Add basename="/admin" to BrowserRouter */}
      <BrowserRouter basename="/admin">
        <ScrollToTop />
        <Routes>
          {/* Redirect /admin to /admin/signin */}
          <Route path="/" element={<Navigate to="/signin" replace />} />

          {/* Public Signin Route - now at /admin/signin */}
          <Route path="/signin" element={<AdminSignin />} />

          {/* Protected Routes */}
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