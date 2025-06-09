import { Route, Routes, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Home from './routes/Home';
import AuthPage from './routes/AuthPage';
import AdminDashboard from './routes/admin/AdminDashboard';
import Profile from './routes/Profile';
import AddDevice from './routes/AddDevice';
import CreateData from './routes/CreateData';
import NotFound from './routes/notfound';

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/add-device" element={<AddDevice />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/create-data" element={<CreateData />} />
      </Routes>

      {/* ✅ This renders the toast messages */}
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}

export default App;
