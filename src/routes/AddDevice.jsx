import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/navbar';
import { toast } from 'react-toastify';

export default function AddDevice() {
  const [deveui, setDeveui] = useState('');
  const [deviceType, setDeviceType] = useState('');

  const [location1, setLocation1] = useState('');
  const [location2, setLocation2] = useState('');
  const [location3, setLocation3] = useState('');
  const [location4, setLocation4] = useState('');

  const [loading, setLoading] = useState(false);

  

  const handleSubmit = async (e) => {
    e.preventDefault();

    const locationTags = [location1, location2, location3];
    if (location4.trim()) locationTags.push(location4);

    if (locationTags.filter(loc => loc.trim() !== '').length < 3) {
      alert('Please enter at least 3 location tags');
      return;
    }

    const getCreatorId = JSON.parse(localStorage.getItem('user'));
    if (!getCreatorId || !getCreatorId.email) {
      console.error("user does not exist");
      return;
    }
    const creatorId = getCreatorId.email;

    let recordType = '';
    if (deviceType == 'motion') {
      recordType = 'motion.io'
    } else if (deviceType == 'feedback') {
      recordType = 'feedback.io'
    }

    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/add-device', {
        deveui,
        creatorId,
        locationTags,
        device_type: deviceType,
        record_type: recordType
      });

      console.log(`✅ Device successfull added`);
      toast.success('Device successfully added!');

      setDeveui('');
      setLocation1('');
      setLocation2('');
      setLocation3('');
      setLocation4('');
      setDeviceType('');

    } catch (error) {
      console.error(`⚠️ Error adding device: ${error}`);
      toast.error('Error adding device');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
    <div className="add-device-page">
      <h3 className="add-device-h3">Add Device</h3>
      <form className="add-device-form" onSubmit={handleSubmit}>

        <label>DevEUI</label>
        <input
          type="text"
          value={deveui}
          onChange={(e) => setDeveui(e.target.value)}
          placeholder="Enter Device EUI"
          required
        />

        <label>Location Tags (min 3)</label>
        <input
          type="text"
          value={location1}
          onChange={(e) => setLocation1(e.target.value)}
          placeholder="Location 1"
          required
        />
        <input
          type="text"
          value={location2}
          onChange={(e) => setLocation2(e.target.value)}
          placeholder="Location 2"
          required
        />
        <input
          type="text"
          value={location3}
          onChange={(e) => setLocation3(e.target.value)}
          placeholder="Location 3"
          required
        />
        <input
          type="text"
          value={location4}
          onChange={(e) => setLocation4(e.target.value)}
          placeholder="Location 4 (optional)"
        />

        <label>Device Type</label>
        <select
          value={deviceType}
          onChange={(e) => setDeviceType(e.target.value)}
          required
        >
          <option value="">-- Select --</option>
          <option value="motion">Motion</option>
          <option value="feedback">Feedback</option>
        </select>

        <div className="button-group">
          <button type="submit" className="btn-green" disabled={loading}>
            {loading ? 'Adding...' : 'Add Device'}
          </button>

          <button type="clear" className="btn-red">
            Clear
          </button>
        </div>


      </form>

    </div>
    </>
  );
}
