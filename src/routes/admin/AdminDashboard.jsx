import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../../components/navbar';

export default function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [adminEmail, setAdminEmail] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Load admin email from localStorage
        const userData = JSON.parse(localStorage.getItem('user'));
        setAdminEmail(userData?.email || '');

        // Fetch users from backend
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:5000/admin/get-users');
                setUsers(response.data);
            } catch (error) {
                console.error('❌ Error fetching users:', error);
                toast.error('Error fetching users');
            }
        };

        fetchUsers();
    }, []);

    const toggleUserStatus = async (targetEmail) => {
        if (!adminEmail) {
            toast.error('Admin email not found');
            return;
        }

        try {
            await axios.post('http://localhost:5000/admin/toggle-user', {
                adminEmail,
                targetEmail
            });

            setUsers(users.map(user =>
                user.email === targetEmail ? { ...user, is_active: !user.is_active } : user
            ));

            toast.success('User status updated successfully');
        } catch (err) {
            console.error('Toggle failed:', err);
            toast.error('Failed to update user status');
        }
    };

    return (
        <div className='admin-dashboard'>
            <Navbar />

            <p><strong>Logged in as Admin:</strong> {adminEmail || 'Unknown'}</p>

            <div className='admin-dashboard-container'>

                <section className='admin-section'>
                    <h2 className='admin-section-title'>User Management</h2>

                    <div className='user-table-wrapper'>
                        <table className='user-table'>
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Status</th>
                                    <th>Email</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.username || 'N/A'}</td>
                                        <td>{user.is_active ? '✅ Active' : '❌ Inactive'}</td>
                                        <td>{user.email || 'N/A'}</td>
                                        <td>
                                            <button
                                                onClick={() => toggleUserStatus(user.email)}
                                                className={`status-btn ${user.is_active ? 'btn-red' : 'btn-green'}`}
                                            >
                                                {user.is_active ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
}
