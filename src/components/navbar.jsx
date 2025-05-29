import React, { useState } from 'react';

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  return (
    <div className="navbar">
      <div className="navbar-logo"><a href="/home">IoT Data</a></div>

      <div className="navbar-links">
        <a href="/home" className="navbar-link">Home</a>
        <a href="/add-device" className="navbar-link">Devices</a>

        <div className="navbar-profile-dropdown">
          <button 
            className="navbar-profile-dropdown-btn" 
            onClick={toggleDropdown}
          >
            Profile ▾
          </button>
          {dropdownOpen && (
            <div className="navbar-profile-dropdown-content">
              <a href="#">Profile</a>
              <a href="/">Logout</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
