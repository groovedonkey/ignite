import { Routes, Route, Navigate } from 'react-router-dom'
import ProspectSite from './pages/ProspectSite'
import CRMPortal from './pages/CRMPortal'
import CRMLogin from './pages/CRMLogin'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ProspectSite />} />
      <Route path="/portal/login" element={<CRMLogin />} />
      <Route path="/portal/*" element={<CRMPortal />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
