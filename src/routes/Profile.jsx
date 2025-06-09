import React from 'react';
import { useSelector } from 'react-redux';
import Navbar from '../components/navbar';

export default function Profile() {
  const user = useSelector((state) => state.user);

  if (!user || !user.username) {
    return (
      <div>
        <Navbar />
        <div style={{ padding: '2rem' }}>
          <h2> {user.username}'s Profile</h2>
          <p>User data not found. Please log in.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="profile-container">
        <h2 className="profile-title">{user.username}'s Profile</h2>

        <p className="profile-details"><strong>Username:</strong> {user.username}</p>
        <p className="profile-details"><strong>Email:</strong> {user.email}</p>
        <p className="profile-details"><strong>Is Active:</strong> {user.is_active ? 'Yes' : 'No'}</p>
        <p className="profile-details"><strong>Is Admin:</strong> {user.is_admin ? 'Yes' : 'No'}</p>
        <p className="profile-details"><strong>Created At:</strong> {user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}</p>
        <p className="profile-details"><strong>Updated At:</strong> {user.updated_at ? new Date(user.updated_at).toLocaleString() : 'N/A'}</p>
      
      </div>
    </div>
  );
}
