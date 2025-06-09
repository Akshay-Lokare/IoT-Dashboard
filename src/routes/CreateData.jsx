import React, { useEffect, useState } from 'react'
import Navbar from '../components/navbar'
import { toast } from 'react-toastify';
import axios from 'axios';
import { useSelector } from 'react-redux';

export default function CreateData() {

  const user = useSelector((state) => state.user);

  const [payload, setPayload] = useState('');
  const [allDevices, setAllDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');

  const handlePayloadCreation = async () => {
    try {
        const response = await fetch('http://localhost:5000/create-data');
        const data = await response.json();
        setPayload(data.payload);

        if (data.payload) {
          toast.success('Payload generated successfully!');
        }

    } catch (error) {
        console.error('❌ Error creating payload:', error);
        toast.error('Error generating payload');
    }
  };

  useEffect(() => {
    const fetchAllDevices = async () => {
      try {
        const response = await fetch(`http://localhost:5000/user-devices?email=${user.email}`);
        const data = await response.json();
        setAllDevices(data);
      } catch (error) {
        console.error(`Error fetching devices: ${error}`);
      }
    };

    if (user.email) {
      fetchAllDevices();
    } else {
      toast.error("Error fetching devices: user not logged in");
    }
  }, [user.email]);


  return (
    <div className='create-data-page'>
        <Navbar />
        <h3>Create Data</h3>

        <form className="add-data">
        <label>Device Type</label>
        
        <select
          value={selectedDevice}
          onChange={(e) => setSelectedDevice(e.target.value)}
          required
        >
          <option value="">-- Select --</option>
          {allDevices.map((device) => (
            <option key={device._id} value={device._id}>
              {/* {device.device_type} - {device.deveui} */}
              {device.deveui}
            </option>
          ))}
        </select>


        <p>email: {user.email}</p>

        </form>

    </div>
  )
}
