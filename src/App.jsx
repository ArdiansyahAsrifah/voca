import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Onboarding from './pages/Onboarding'
import Conversation from './pages/Conversation'
import Profile from './pages/Profile'
import Emergency from './pages/Emergency'

// Cek apakah user sudah pernah onboarding
function RootRedirect() {
  const hasProfile = localStorage.getItem('vocaProfile')
  return <Navigate to={hasProfile ? '/conversation' : '/onboarding'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/conversation" element={<Conversation />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/emergency" element={<Emergency />} />
      </Routes>
    </BrowserRouter>
  )
}