import React from 'react';

import Navbar from '../components/navbar';
import DeviceTable from '../components/deviceTable';

export default function Home() {
  return (
    <div className='home-page'>
      <Navbar />      
      <DeviceTable />
    </div>
  )
}
