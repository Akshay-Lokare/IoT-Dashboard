import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch } from 'react-redux';

import ForgotPwdForm from '../components/forgotPwd';
import { setUserFromServer } from '../redux/userSlice';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '', // Still keeping username for signup
    email: '',    // Added email field
    password: '',
    is_admin: false,
    is_active: true,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [forgotPwd, setForgotPwd] = useState(false);

  const navigate = useNavigate();
  const API_URL = 'http://localhost:5000';
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/login' : '/sign-up';
      
      // For login, only send email and password
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData; // For signup, send all form data

      const response = await axios.post(`${API_URL}${endpoint}`, payload);

      if (isLogin) {
        const userData = response.data.user;
        localStorage.setItem('user', JSON.stringify(userData));
        dispatch(setUserFromServer(userData));
        
        toast.success('Login successful!');
        navigate(userData.is_admin ? '/admin' : '/home');
      } else {
        toast.success('Account created! Please log in.');
        setIsLogin(true);
        // Clear form after successful signup
        setFormData({
          username: '',
          email: '',
          password: '',
          is_admin: false,
          is_active: true,
        });
      }
    } catch (err) {
      const message = err.response?.data?.error || 'An error occurred';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const showPassword = () => {
    setShowPwd((prev) => !prev);
  }

  return (
    <div className="auth-container">
      <ToastContainer position="top-center" autoClose={3000} />

      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">{isLogin ? 'Login' : 'Sign-Up'}</h2>
          <p className="auth-subtitle">
            {isLogin ? 'Welcome back! Please log in.' : 'Create a new account'}
          </p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                className="form-input"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="password-wrapper">
              <input
                className="form-input"
                type={showPwd ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
              />
              <button
                type="button"
                onClick={showPassword}
                className="show-password-btn"
              >
                {showPwd ? 'hide' : 'show'}
              </button>
            </div>
          </div>

          {isLogin && (
            <>
              <span className='forgot-password' onClick={() => setForgotPwd(true)}>
                Forgot Password?
              </span>
              {forgotPwd && <ForgotPwdForm onClose={() => setForgotPwd(false)} />}
            </>
          )}

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Processing...' : isLogin ? 'Login' : 'Sign-Up'}
          </button>
        </form>

        <div className="auth-toggle">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <span
            className="toggle-link"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Sign-up' : 'Login'}
          </span>
        </div>
      </div>
    </div>
  );
}