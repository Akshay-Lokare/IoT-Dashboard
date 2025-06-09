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
    username: '',
    email: '',
    password: '',
    is_admin: false,
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
    console.log(`🚀 Form submitted!\nMode: ${isLogin ? 'Login' : 'Sign-Up'}`);
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/login' : '/sign-up';
      const payload = isLogin
        ? { username: formData.username, email: formData.email, password: formData.password, is_admin: formData.is_admin }
        : formData;

      console.log(`📡 Sending request to: ${API_URL}${endpoint}`);
      console.log(`📦 Payload:\n`, payload);

      const response = await axios.post(`${API_URL}${endpoint}`, payload);
      console.log(`✅ Response received:\n`, response.data);

      if (isLogin) {
          
        const userData = response.data.user;
        
        setFormData((prev) => ({
            ...prev,
            username: userData.username,
            email: userData.email,
            password: userData.password,
            is_admin: userData.is_admin,
        }));

        console.log('🔐 Login success!');
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log(`📦 User saved to localStorage:\n`, response.data.user);
        dispatch(setUserFromServer(userData)); // To save the data in redux

        toast.success('✅ Login successful!');
        
        console.log(`📍 Redirecting to: ${response.data.user.is_admin ? '/admin' : '/home'}`);
        navigate(response.data.user.is_admin ? '/admin' : '/home');

      } else {
        toast.success('🎉 Account created! Please log in.');
        console.log('🎉 Sign-up success! Switching to Login mode.');

        setIsLogin(true);
      }
    } catch (err) {
      const message = err.response?.data?.error || '⚠️ Username does not exist';
      console.log(`❗ Error occurred:\n`, message);

      if (isLogin && message.toLowerCase().includes('user not found')) {
        setError('❌ This username does not exist.');
      } else {
        setError(message);
      }
      toast.error(message);
    } finally {
      setLoading(false);
      console.log('🛑 Finished processing.');
    }
  };

  const showPassword = () => {
    setShowPwd((prev) => {
      console.log(`👁️ Toggle password visibility: ${!prev ? 'SHOW' : 'HIDE'}`);
      return !prev;
    });
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

          {!isLogin && (
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
          )}

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

          {isLogin ? (
            <>
           <span className='forgot-password' onClick={() => setForgotPwd(true)}>Forgot Password?</span>
           {forgotPwd && <ForgotPwdForm onClose={() => setForgotPwd(false)} />}
            </>
          ) : ''}

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading && <span className="loading-spinner">⚡</span>}
            {loading
              ? 'Processing...'
              : isLogin
              ? 'Login'
              : 'Sign-Up'}
          </button>
        </form>

        <div className="auth-toggle">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <span
            className="toggle-link"
            onClick={() => {
              console.log(`🔁 Switching to ${isLogin ? 'Sign-Up' : 'Login'} mode`);
              setIsLogin(!isLogin);
            }}
          >
            {isLogin ? 'Sign-up' : 'Login'}
          </span>
        </div>
      </div>
    </div>
  );
}
