import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Buyer' });
    const [error, setError] = useState('');
    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', formData);
            setStep(2);
            setError('');
            alert('OTP sent to your email.');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/verify-registration', { ...formData, otp });
            alert('Registration successful! Please login.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'OTP verification failed');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto' }}>
            <h2>Register for CampusKart</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {step === 1 ? (
                <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input name="name" type="text" placeholder="Full Name" onChange={handleChange} required />
                    <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
                    <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
                    <select name="role" onChange={handleChange}>
                        <option value="Buyer">Buyer</option>
                        <option value="Seller">Seller</option>
                        <option value="Admin">Admin</option>
                    </select>
                    <button type="submit">Register</button>
                </form>
            ) : (
                <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <p>Enter the 6-digit OTP sent to {formData.email}</p>
                    <input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        maxLength={6}
                    />
                    <button type="submit">Verify Registration</button>
                </form>
            )}
        </div>
    );
};

export default Register;
