import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/navbar';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function AllDevices() {
  const user = useSelector((state) => state.user);
  const [allDevices, setAllDevices] = useState([]);
  const [dropdownBtn, setDropdownBtn] = useState(null);
  const dropdownRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownBtn(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTopButtonClick = (id) => {
    setDropdownBtn(dropdownBtn === id ? null : id);
  };

  const deleteDevice = async (deveui) => {
    const confirmed = window.confirm("Are you sure you want to delete this device?");
    if (!confirmed) return;

    try {
      const response = await axios.delete(`http://localhost:5000/delete-device`, {
        params: { deveui }
      });

      setAllDevices(prev => prev.filter(device => device.deveui !== deveui));
      toast.success(response.data.msg || "Device deleted successfully!");

    } catch (error) {
      console.error(`Error deleting the device: ${error}`);
      toast.error("Failed to delete the device.");
    }
  };

  return (
    <div className="all-devices-page">
      <Navbar />

      <div className="device-cards-container">
        {allDevices.length > 0 ? (
          allDevices.map((device) => {
            const tags = device.locationTags || [];

            return (
              <div className="device-card" key={device._id}>

                <button
                  className="device-action-btn"
                  onClick={() => handleTopButtonClick(device._id)}
                >
                  ⋮
                </button>

                {dropdownBtn === device._id && (
                  <div className="device-dropdown" ref={dropdownRef}>
                    <button onClick={() => deleteDevice(device.deveui)}>Delete</button>
                  </div>
                )}

                <div className="device-info-pair"><span>DevEUI:</span> {device.deveui}</div>
                <div className="device-info-pair"><span>Tag 1:</span> {tags[0]}</div>
                <div className="device-info-pair"><span>Tag 2:</span> {tags[1]}</div>
                <div className="device-info-pair"><span>Tag 3:</span> {tags[2]}</div>
                <div className="device-info-pair"><span>Tag 4:</span> {tags[3]}</div>
                <div className="device-info-pair"><span>Type:</span> {device.device_type}</div>
                <div className="device-info-pair"><span>Record Type:</span> {device.record_type}</div>
                <div className="device-info-pair"><span>Updated:</span> {device.updateDate}</div>

              </div>
            );
          })

        ) : (
          <p className="no-device-msg">No data</p>
        )}

      </div>
    </div>
  );
}
