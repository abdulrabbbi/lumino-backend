import './App.css'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
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


function AppWrapper() {
  const location = useLocation()
  const hideLayout = location.pathname === '/admin-signin' || location.pathname === '/'

  return (
    <>
      {!hideLayout && <Navbar />}
      <Routes>
        <Route path="/" element={<AdminSignin />} />
          <Route path="/admin-dashboard" element={<AdminDashboardLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="activiteitenbeheer" element={<ActiviteitenBeheer />} />
          <Route path="ingezondenactiviteiten" element={<IngezondenActiviteiten />} />
          <Route path="gebruikersbeheer" element={<GebruikersBeheren />} />
          <Route path="contactberichten" element={<ContactBerichten />} />
          <Route path="testgroepaanmeldingen" element={<TestgroepAanmeldingen />} />
          <Route path="kwaliteitsaudit" element={<Kwaliteitsaudit />} />
          <Route path="earlyaccess" element={<EarlyAccess />} />
          <Route path="manage-badge" element={<Managebadge />} />

        </Route>
      </Routes>
      {/* {!hideLayout && <Footer />} */}
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppWrapper />
    </BrowserRouter>
  )
}

export default App
