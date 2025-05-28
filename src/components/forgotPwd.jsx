import axios from 'axios';
import React, {useState} from 'react';
import { toast } from 'react-toastify';

export default function ForgotPwdForm({ onClose }) {

    const [form, setForm] = useState({
        username: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    const handleClick = async (e) => {
        e.preventDefault();
        try {
            await axios.put('http://localhost:5000/forgot-pwd', form);
            toast.success(`✅ Password reset success for ${form.username || form.email}`);
            onClose();
        } catch (error) {
            const msg = err.response?.data?.error || '⚠️ Something went wrong';
            toast.error(msg);
        }
    }

  return (
    <div className="modal-overlay">
    <div className="modal-content">

        <h3>Reset Password for {form.username}</h3>
        <form onSubmit={handleClick}>
            <input 
                type='text'
                name='username'
                placeholder='Username'
                value={form.username}
                onChange={handleChange}
                required
            />

            <input 
                type='text'
                name='email'
                placeholder='Email'
                value={form.email}
                onChange={handleChange}
                required
            />

            <input 
                type='text'
                name='password'
                placeholder='Password'
                value={form.password}
                onChange={handleChange}
                required
            />

            <button type="submit">Update Password</button>
            <button type="button" onClick={onClose}>Cancel</button>
            
        </form>
    </div>
    </div>
  )
}
