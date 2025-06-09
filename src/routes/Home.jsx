import React from 'react';

import Navbar from '../components/navbar';
import DeviceTable from '../components/deviceTable';

export default function Home() {
  return (
    <div className='home-page'>
      <Navbar />

      <h1>Welcome to the IoT Dashboard App</h1>
      <p>This is the Home page. Enjoy your stay!</p>
      
      <DeviceTable />
    </div>
  )
}
