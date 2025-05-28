import React, { useEffect } from 'react';

import Navbar from '../components/navbar';
import { Input } from '@mui/material';

export default function AddDevice() {

  useEffect();

  return (
    <div className='add-device-page'>
        <Navbar />

        <h3 className='add-device-h3'>Add Device</h3>
        <form action="POST" className='add-device-form'>
            <label> DeviId </label>
            <input 
            type="text"
            name='deveui'
            required
            />
            
            <label> location Tags </label>
            <input 
            type="text"
            name='creatorid'
            required
            />

            <label> DeviId </label>
            <input 
            type="text"
            name='deveui'
            required
            />
            <label> DeviId </label>
            <input 
            type="text"
            name='deveui'
            required
            />
            <label> DeviId </label>
            <input 
            type="text"
            name='deveui'
            required
            />
        </form>

    </div>
  )
}
