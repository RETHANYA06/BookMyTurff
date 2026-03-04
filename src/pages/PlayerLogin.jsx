import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiPhone, FiLock } from 'react-icons/fi';
import API_BASE_URL from '../config/api';

const PlayerLogin = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/players/login`, {
                phone_number: phoneNumber,
                password
            });
            login({ ...res.data.player, role: 'player', id: res.data.player.id || res.data.player._id });
            localStorage.setItem('token', res.data.token);
            navigate('/');
        } catch (err) {
            alert(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in" style={{ maxWidth: '400px', margin: '100px auto' }}>
            <div className="glass" style={{ padding: '40px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Welcome Back</h2>
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '30px' }}>Login to your player account</p>

                <form onSubmit={handleSubmit}>
                    <label>Phone Number</label>
                    <div className="phone-input-group">
                        <div className="phone-prefix">+91</div>
                        <div className="input-with-icon">
                            <FiPhone />
                            <input
                                placeholder="Enter 10-digit mobile"
                                type="tel"
                                value={phoneNumber}
                                onChange={e => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    if (value.length <= 10) setPhoneNumber(value);
                                }}
                                required
                            />
                        </div>
                    </div>

                    <label>Password</label>
                    <div className="input-with-icon">
                        <FiLock />
                        <input
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '20px', height: '50px', justifyContent: 'center' }}>
                        {loading ? <div className="loader"></div> : 'Login'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '25px', color: 'var(--text-secondary)' }}>
                    New to BookMyTurff? <Link to="/player-register" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Register here</Link>
                </p>

                <div style={{ marginTop: '30px', borderTop: '1px solid #e2e8f0', paddingTop: '20px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.9rem' }}>Are you a manager? <Link to="/login" style={{ color: 'var(--primary)' }}>Manager Login</Link></p>
                </div>
            </div>
        </div>
    );
};

export default PlayerLogin;
