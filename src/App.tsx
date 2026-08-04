import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Clubs from './pages/Clubs'
import ClubDetail from './pages/ClubDetail'
import MemberDetail from './pages/MemberDetail'
import Payout from './pages/Payout'
import Profile from './pages/Profile'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clubs" element={<Clubs />} />
        <Route path="/clubs/:id" element={<ClubDetail />} />
        <Route path="/clubs/:id/members/:memberId" element={<MemberDetail />} />
        <Route path="/clubs/:id/payout" element={<Payout />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
