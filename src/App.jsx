import { Route, Routes, Navigate } from 'react-router-dom'

import Home from './routes/Home'
import AuthPage from './routes/AuthPage'
import AdminDashboard from './routes/admin/AdminDashboard'
import AddDevice from './routes/AddDevice'

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/add-device" element={<AddDevice />} />
      </Routes>
    </div>
  )
}

export default App
