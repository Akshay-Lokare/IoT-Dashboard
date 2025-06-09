import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';

export default function Navbar() {
  const user = useSelector((state) => state.user);
  
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [deviceDropdown, setDeviceDropdown] = useState(false);

  const profileRef = useRef(null);
  const deviceRef = useRef(null);

  const profileDropdownToggle = () => setProfileDropdown(!profileDropdown);
  const deviceDropdoweToggle = () => setDeviceDropdown(!deviceDropdown);

  useEffect(() => {
    const handleEffect = (e) => {
      if ( profileRef.current && !profileRef.current.contains(e.target) ) {
        setProfileDropdown(false);
      }

      if ( deviceRef.current && !deviceRef.current.contains(e.target) ) {
        setDeviceDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleEffect);
    
    return () => {
      document.removeEventListener('mousedown', handleEffect);
    };

  }, []);
  


  return (
    <div className="navbar">
      <div className="navbar-logo"><a href="/home">IoT Data</a></div>

      <div className="navbar-links">

        <div className="navbar-profile-dropdown" ref={deviceRef}>
          <button 
            className="navbar-profile-dropdown-btn" 
            onClick={deviceDropdoweToggle}
          >
            Devices ▾
          </button>
          {deviceDropdown && (
            <div className="navbar-profile-dropdown-content">
              <a href="/add-device">Add Devices</a>
              <a href="/create-data">Create Data</a>
            </div>
          )}
        </div>

        <div className="navbar-profile-dropdown" ref={profileRef}>
          <button 
            className="navbar-profile-dropdown-btn" 
            onClick={profileDropdownToggle}
          >
            Profile ▾
          </button>
          {profileDropdown && (
            <div className="navbar-profile-dropdown-content">
              <a href="/profile">Profile: {user.username}</a>
              <a href="/">Logout</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
