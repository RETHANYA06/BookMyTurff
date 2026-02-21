import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FiUser, FiPhone, FiLock, FiSave, FiCheckCircle } from 'react-icons/fi';
import API_BASE_URL from '../config/api';

const PlayerProfile = () => {
    const { user, login } = useContext(AuthContext);
    const player = user; // Redirected via ProtectedRoute, so user is the player
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
        name: player?.name || '',
        phone_number: player?.phone_number || '',
        password: '',
        confirmPassword: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password && formData.password !== formData.confirmPassword) {
            return alert('Passwords do not match');
        }

        setLoading(true);
        setMessage('');
        try {
            const res = await axios.put(`${API_BASE_URL}/api/players/profile/${player.id}`, formData);
            login({ ...res.data.player, role: 'player' });
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            alert(err.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in" style={{ maxWidth: '600px', margin: '60px auto' }}>
            <h1 style={{ marginBottom: '40px', textAlign: 'center' }}>My Profile</h1>

            <form onSubmit={handleSubmit} className="glass" style={{ padding: '40px', borderRadius: '32px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ width: '80px', height: '80px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', color: 'white', fontSize: '2rem' }}>
                        {formData.name.charAt(0).toUpperCase()}
                    </div>
                    <p style={{ color: 'var(--text-secondary)' }}>Account Member since 2026</p>
                </div>

                {message && (
                    <div style={{ background: '#dcfce7', color: '#166534', padding: '15px', borderRadius: '12px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                        <FiCheckCircle /> {message}
                    </div>
                )}

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiUser size={14} /> Full Name</label>
                    <input
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiPhone size={14} /> Phone Number</label>
                    <input
                        value={formData.phone_number}
                        onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                        required
                    />
                </div>

                <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px', marginTop: '30px' }}>
                    <h4 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><FiLock /> Security</h4>
                    <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={{ fontSize: '0.75rem' }}>New Password</label>
                            <input
                                type="password"
                                placeholder="Leave blank to keep current"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                style={{ fontSize: '0.85rem' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem' }}>Confirm Pass</label>
                            <input
                                type="password"
                                placeholder="Repeat new"
                                value={formData.confirmPassword}
                                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                style={{ fontSize: '0.85rem' }}
                            />
                        </div>
                    </div>
                </div>

                <button
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '40px', padding: '18px', justifyContent: 'center' }}
                    disabled={loading}
                >
                    {loading ? <div className="loader"></div> : <><FiSave /> Save Changes</>}
                </button>
            </form>
        </div>
    );
};

export default PlayerProfile;
