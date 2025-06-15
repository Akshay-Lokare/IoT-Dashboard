import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export default function AdminAllDevices() {
  const [allUsers, setAllUsers] = useState([]);
  const [allDevices, setAllDevices] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/admin/get-users');
        setAllUsers(response.data);
      } catch (error) {
        console.error('❌ Error fetching users:', error);
        toast.error('Error fetching users');
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchAllDevices = async () => {
      try {
        const response = await axios.get('http://localhost:5000/admin/devices');
        setAllDevices(response.data);
      } catch (error) {
        console.error('❌ Error fetching devices:', error);
        toast.error('Error fetching devices');
      }
    };

    fetchAllDevices();
  }, []);

  const handleDelete = async (deveui) => {
    if (!window.confirm(`Are you sure you wanna delete this device ${deveui}`)) return;

    try {
        const response = await axios.delete(`http://localhost:5000/admin/delete-device`, {params: { deveui }});

        toast.success(response.data.msg);

        setAllDevices(prev => prev.filter(device => device.deveui !== deveui));

    } catch (error) {
        console.error('❌ Error deleting device:', error);
        toast.error('Failed to delete device');
    }
  }

  // Optionally filter devices based on selected user
  const filteredDevices = selectedUser
    ? allDevices.filter(device => device.creatorId === selectedUser)
    : allDevices;

  const getUserEmail = (userId) => {
    const user = allUsers.find(u => u._id === userId);
    return user ? user.email : 'Unknown';
  };

  return (
    <div className="admin-devices-container">
      <div className="admin-dashboard-container">
        <section className="admin-section">

          <h2 className="admin-section-title">All Devices</h2>

          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="">Select User</option>
            {allUsers.map(user => (
              <option key={user._id} value={user._id}>
                {user.email}
              </option>
            ))}
          </select>

          <div className="user-table-wrapper">
            <table className="user-table">

            <thead>
            <tr>

                <th></th>
                <th>deveui</th>
                <th>creatorId</th>
                <th>Loc1</th>
                <th>Loc2</th>
                <th>Loc3</th>
                <th>Loc4</th>
                <th>device_type</th>
                <th>record_type</th>
                <th>createDate</th>
                <th>updateDate</th>
            </tr>

            </thead>
            <tbody>

            {filteredDevices.map(device => {
                const tags = device.locationTags || [];
                return (
                <tr key={device._id}>
                    <td>
                        <button onClick={() => handleDelete(device.deveui)}>delete</button>
                    </td>
                    <td>{device.deveui}</td>
                    <td>{getUserEmail(device.creatorId)}</td>
                    <td>{tags[0] || 'empty'}</td>
                    <td>{tags[1] || 'empty'}</td>
                    <td>{tags[2] || 'empty'}</td>
                    <td>{tags[3] || 'empty'}</td>
                    <td>{device.device_type}</td>
                    <td>{device.record_type}</td>
                    <td>{new Date(device.createDate).toLocaleString()}</td>
                    <td>{new Date(device.updateDate).toLocaleString()}</td>
                </tr>
                );
            })}

            {filteredDevices.length === 0 && (
                <tr>
                <td colSpan="10" style={{ textAlign: 'center' }}>No devices found.</td>
                </tr>
            )}
            </tbody>

            </table>

          </div>
        </section>

      </div>
    </div>
  );
}
