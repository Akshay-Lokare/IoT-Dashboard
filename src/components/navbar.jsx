import React from 'react';

export default function Navbar() {
  return (
    <div className="navbar">
    <div className="navbar-logo"><a href="/home">IoT Data</a></div>

    <div className="navbar-links">
        <a href="/home" className="navbar-link">Home</a>
        <a href="/add-device" className="navbar-link">Devices</a>
        <a href="" className="navbar-link">Profile</a>
    </div>
    
    </div>

  )
}
