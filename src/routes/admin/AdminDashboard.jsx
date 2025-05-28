import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {

    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                if (!user?.is_admin) {
                    navigate('/login');
                    return;
                }

                const response = await axios.get('http://localhost:5000/admin/users');
                setUsers(response.data);

            } catch (error) {
                console.error(`❌ Failed to fetch users: ${err}`);
            }
        }
        fetchUsers();
    }, [navigate]);

    const toggleUserStatus = async (userId) => {
        try {
        await axios.post('http://localhost:5000/admin/toggle-user', { userId });
        setUsers(users.map(user => 
            user.id === userId ? { ...user, is_active: !user.is_active } : user
        ));
        } catch (err) {
        console.error('Toggle failed:', err);
        }
    };

  return (
    <div className='admin-dashboard'>
        <h1 className='admin-dashboard-header-1'>Admin Dashboard</h1>

            <table className='admin-dashboard-table'>
            
            <thead>
                <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Password</th>
                </tr>
            </thead>

            <tbody>
                {users.map(user => (
                    <tr key={user.id}>
                        <td>{user.username}</td>
                        <td>{user.is_active ? '✅ Active' : '❌ Inactive'}</td>

                        <td>
                            <button onClick={() => toggleUserStatus(user.id)}>Toggle Status</button>
                        </td>
                    
                    </tr>
                ))}
            </tbody>

            </table>

    </div>
  )
}
