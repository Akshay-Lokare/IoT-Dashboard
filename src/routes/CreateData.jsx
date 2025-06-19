import React, { useEffect, useState } from 'react'
import Navbar from '../components/navbar'
import { toast } from 'react-toastify';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { createInitialMotionEvent } from '../components/motionPayload';

export default function CreateData() {

  const user = useSelector((state) => state.user);

  const [payload, setPayload] = useState('');
  const [allDevices, setAllDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [motionCount, setMotionCount] = useState(0);
  const [battery, setBattery] = useState(100);

  const handlePayloadCreation = async () => {
    try {
      // 1. Get payload
      const response = await fetch('http://localhost:5000/create-data');
      const data = await response.json();
      setPayload(data.payload);

      if (data.payload) {
        toast.success('Payload generated successfully!');

        // 2. Find selected device details
        const selected = allDevices.find((d) => d._id === selectedDevice);
        if (!selected) {
          toast.error("Device not found");
          return;
        }

        // 3. POST payload and metadata to backend
        await axios.post(`http://localhost:5000/motion/create-data`, {
          deveui: selected.deveui,
          creatorId: user.email,
          locationTags: selected.locationTags,
          device_type: selected.device_type,
          record_type: selected.record_type,
          payload: data.payload,
          fcount: 1,
        });

        // Simulate motionCount increment and battery drain
        const newCount = motionCount + 1;
        const newBattery = Math.max(0, battery - 1);  // prevent negative battery

        // Now generate new payload with updated values
        const updatedPayload = createInitialMotionEvent(newCount, newBattery);

        setMotionCount(newCount);
        setBattery(newBattery);
        setPayload(updatedPayload);

        toast.success("✅ Data saved to database!");
      }

    } catch (error) {
      console.error('❌ Error creating payload:', error);
      toast.error('Error generating or saving payload');
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

        <button onClick={handlePayloadCreation} disabled={!selectedDevice}> Generate </button>

        <p>Payload - {payload || 'null'}</p>

        </form>

    </div>
  )
}
