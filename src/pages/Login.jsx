import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiPhone, FiLock, FiUser, FiLayout } from 'react-icons/fi';
import { GiSoccerBall } from 'react-icons/gi';
import API_BASE_URL from '../config/api';

const Login = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('player'); // Default to player
    const [loading, setLoading] = useState(false);
    const { user, login } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            if (user.role === 'admin') navigate('/admin-panel');
            else if (user.role === 'owner') navigate('/manager/dashboard');
            else navigate('/player/dashboard');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const endpoint = role === 'player' ? `${API_BASE_URL}/api/players/login` : `${API_BASE_URL}/api/auth/login`;
            const res = await axios.post(endpoint, { phone_number: phoneNumber, password });

            const userData = role === 'player'
                ? { ...res.data.player, role: res.data.player.role || 'player', id: res.data.player.id || res.data.player._id }
                : { ...res.data, role: res.data.role || 'owner', id: res.data.manager_id || res.data._id };

            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
            }

            login(userData);

            // Redirection based on role
            if (userData.role === 'admin') {
                navigate('/admin-panel');
            } else if (userData.role === 'owner') {
                navigate('/manager/dashboard');
            } else {
                navigate('/player/dashboard');
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '480px', margin: '100px auto', padding: '0 20px' }} className="fade-in">
            <div className="glass-heavy" style={{ padding: '60px', borderRadius: '40px', border: '1px solid var(--border-subtle)', boxShadow: '0 40px 80px rgba(0,0,0,0.05)' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div className="animate-float" style={{ background: 'var(--primary)', width: '60px', height: '60px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)' }}>
                        <GiSoccerBall size={30} color="#ffffff" />
                    </div>
                    <h2 style={{ fontSize: '2.5rem', color: 'var(--text-primary)', marginBottom: '10px', letterSpacing: '-1px' }}>Portal Access</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: '500' }}>Welcome back, choose your role</p>
                </div>

                {/* Role Switcher */}
                <div style={{ display: 'flex', background: 'rgba(0,0,0,0.03)', padding: '6px', borderRadius: '20px', marginBottom: '40px', border: '1px solid rgba(0,0,0,0.05)' }}>
                    <button
                        onClick={() => setRole('player')}
                        style={{
                            flex: 1, padding: '14px', borderRadius: '16px', border: 'none',
                            background: role === 'player' ? 'var(--primary)' : 'transparent',
                            fontWeight: '800', cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                            color: role === 'player' ? '#0f172a' : 'var(--text-secondary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            fontSize: '0.95rem'
                        }}
                    >
                        <FiUser size={18} /> Player
                    </button>
                    <button
                        onClick={() => setRole('owner')}
                        style={{
                            flex: 1, padding: '14px', borderRadius: '16px', border: 'none',
                            background: role === 'owner' ? 'var(--primary)' : 'transparent',
                            fontWeight: '800', cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                            color: role === 'owner' ? '#0f172a' : 'var(--text-secondary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            fontSize: '0.95rem'
                        }}
                    >
                        <FiLayout size={18} /> Owner
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800', marginBottom: '10px', paddingLeft: '5px' }}>Phone Number</label>
                        <div className="phone-input-group">
                            <div className="phone-prefix">+91</div>
                            <div className="input-with-icon">
                                <FiPhone />
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={e => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        if (value.length <= 10) setPhoneNumber(value);
                                    }}
                                    placeholder="Mobile number"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '35px' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800', marginBottom: '10px', paddingLeft: '5px' }}>Secure Key</label>
                        <div className="input-with-icon">
                            <FiLock />
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button className="btn btn-primary" disabled={loading} style={{ width: '100%', height: '65px', borderRadius: '20px', fontSize: '1.1rem' }}>
                        {loading ? <div className="loader" style={{ width: '24px', height: '24px' }}></div> : 'Enter Dashboard'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    New to the network? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '800', textDecoration: 'none', marginLeft: '5px' }}>Initialize Account</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
