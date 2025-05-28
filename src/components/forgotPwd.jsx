import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export default function ForgotPwdForm({ onClose }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  //get stuff from localstorage
  useEffect(() => {
    const storedUserData = JSON.parse(localStorage.getItem('user'));
    if (storedUserData) {
        setFormData((prev) => ({
            ...prev,
            username: storedUserData.username || '',
            email: storedUserData.email || '',
        }));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    console.log("🔘 Submit triggered");

    if (!formData.username && !formData.email) {
      toast.error("⚠️ Provide username or email");
      return;
    }

    try {
      console.log("📤 Sending request:", formData);
      const response = await axios.put('http://localhost:5000/forgot-pwd', formData);
      console.log("✅ Server response:", response.data);
      toast.success(`✅ Password updated for ${formData.username || formData.email}`);
      onClose();
    } catch (error) {
      console.error("❌ Error:", error);
      const msg = error.response?.data?.error || '⚠️ Something went wrong';
      toast.error(msg);
    }
  };

  return (
    <div className="forgot-pwd-modal">
      <div className="forgot-pwd-content">
        <h3 className="forgot-pwd-title">Reset Password</h3>
        <div className="forgot-pwd-form">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="forgot-pwd-input"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="forgot-pwd-input"
          />
          <input
            type="password"
            name="password"
            placeholder="New Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="forgot-pwd-input"
          />
          <div className="forgot-pwd-buttons">
            <button type="button" onClick={handleSubmit} className="forgot-pwd-submit-btn">
              Update Password
            </button>
            <button type="button" onClick={onClose} className="forgot-pwd-cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}