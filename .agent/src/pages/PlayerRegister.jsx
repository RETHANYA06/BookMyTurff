import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiPhone, FiLock, FiUser, FiMail, FiMapPin, FiActivity, FiTarget, FiClock, FiUsers, FiCheckCircle, FiChevronRight, FiChevronLeft } from 'react-icons/fi';

const PlayerRegister = () => {
    const { login } = useContext(AuthContext);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        phone_number: '',
        password: '',
        confirm_password: '',
        email: '',
        // Step 2
        age_group: '21-25',
        gender: 'male',
        city: '',
        preferred_language: 'English',
        // Step 3
        sports_played: [],
        skill_level: 'beginner',
        preferred_play_time: 'evening',
        typical_group_size: '5-7 players',
        // Step 4
        willing_to_join_others: false,
        bring_own_equipment: false,
        notifications_opt_in: true
    });

    const navigate = useNavigate();

    const handleNext = () => {
        if (step === 1) {
            if (!formData.full_name || !formData.phone_number || !formData.email || !formData.password || !formData.confirm_password) return alert('Please fill all required fields');
            if (formData.password !== formData.confirm_password) return alert('Passwords do not match');
            if (formData.phone_number.length < 10) return alert('Valid phone number required');
        }
        if (step === 3) {
            if (formData.sports_played.length === 0) return alert('Please select at least one sport');
        }
        setStep(step + 1);
    };

    const handlePrev = () => setStep(step - 1);

    const toggleSport = (sport) => {
        const current = [...formData.sports_played];
        if (current.includes(sport)) {
            setFormData({ ...formData, sports_played: current.filter(s => s !== sport) });
        } else {
            setFormData({ ...formData, sports_played: [...current, sport] });
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/players/register', formData);
            const playerWithRole = {
                ...res.data.player,
                role: 'player',
                id: res.data.player.id || res.data.player._id
            };
            login(playerWithRole);
            localStorage.setItem('token', res.data.token);
            alert('Welcome to BookMyTurf! Your sports profile is ready.');
            navigate('/player/dashboard');
        } catch (err) {
            alert(err.response?.data?.message || 'Registration failed, try again');
        } finally {
            setLoading(false);
        }
    };

    const steps = ['Account', 'Details', 'Sports', 'Preferences'];

    return (
        <div className="fade-in" style={{ maxWidth: '600px', margin: '60px auto' }}>
            {/* Stepper Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', background: '#f8fafc', padding: '20px', borderRadius: '20px' }}>
                {steps.map((s, i) => (
                    <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: step > i + 1 ? 'var(--primary)' : (step === i + 1 ? 'var(--primary)' : '#e2e8f0'),
                            color: step >= i + 1 ? 'white' : '#64748b',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem',
                            zIndex: 2, transition: '0.3s'
                        }}>
                            {step > i + 1 ? <FiCheckCircle size={16} /> : i + 1}
                        </div>
                        <span style={{ fontSize: '0.7rem', marginTop: '8px', color: step >= i + 1 ? 'var(--text-primary)' : '#94a3b8', fontWeight: step === i + 1 ? 'bold' : 'normal' }}>{s}</span>
                        {i < steps.length - 1 && (
                            <div style={{ position: 'absolute', top: '16px', left: '50%', width: '100%', height: '2px', background: step > i + 1 ? 'var(--primary)' : '#e2e8f0', zIndex: 1 }}></div>
                        )}
                    </div>
                ))}
            </div>

            <div className="glass" style={{ padding: '40px', borderRadius: '32px' }}>
                {step === 1 && (
                    <div className="fade-in">
                        <h2 style={{ marginBottom: '10px' }}>Create Your Account</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Join the sports community of BookMyTurf.</p>

                        <label>Full Name</label>
                        <div className="input-with-icon">
                            <FiUser icon_pos="left" />
                            <input value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} placeholder="John Doe" required />
                        </div>

                        <label>Phone Number</label>
                        <div className="input-with-icon">
                            <FiPhone icon_pos="left" />
                            <input type="tel" value={formData.phone_number} onChange={e => setFormData({ ...formData, phone_number: e.target.value })} placeholder="10-digit number" required />
                        </div>

                        <label>Email Address</label>
                        <div className="input-with-icon">
                            <FiMail icon_pos="left" />
                            <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="john@example.com" required />
                        </div>

                        <div className="grid">
                            <div>
                                <label>Password</label>
                                <div className="input-with-icon">
                                    <FiLock icon_pos="left" />
                                    <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" required />
                                </div>
                            </div>
                            <div>
                                <label>Confirm Password</label>
                                <div className="input-with-icon">
                                    <FiLock icon_pos="left" />
                                    <input type="password" value={formData.confirm_password} onChange={e => setFormData({ ...formData, confirm_password: e.target.value })} placeholder="••••••••" required />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="fade-in">
                        <h2 style={{ marginBottom: '10px' }}>Personal Details</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Help us personalize your pitch recommendations.</p>

                        <div className="grid">
                            <div>
                                <label>Age Group</label>
                                <select value={formData.age_group} onChange={e => setFormData({ ...formData, age_group: e.target.value })}>
                                    <option value="under 16">Under 16</option>
                                    <option value="16-20">16-20 years</option>
                                    <option value="21-25">21-25 years</option>
                                    <option value="26-35">26-35 years</option>
                                    <option value="35+">35+ years</option>
                                </select>
                            </div>
                            <div>
                                <label>Gender</label>
                                <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                    <option value="prefer_not_to_say">Prefer not to say</option>
                                </select>
                            </div>
                        </div>

                        <label>City / Location</label>
                        <div className="input-with-icon">
                            <FiMapPin icon_pos="left" />
                            <input value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} placeholder="Mumbai, Bangalore..." required />
                        </div>

                        <label>Preferred Language</label>
                        <select value={formData.preferred_language} onChange={e => setFormData({ ...formData, preferred_language: e.target.value })}>
                            <option>English</option>
                            <option>Hindi</option>
                            <option>Marathi</option>
                            <option>Kannada</option>
                            <option>Tamil</option>
                            <option>Other</option>
                        </select>
                    </div>
                )}

                {step === 3 && (
                    <div className="fade-in">
                        <h2 style={{ marginBottom: '10px' }}>Sports Preferences</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>What games are you into? (Select multiple)</p>

                        <label>Sports You Play</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '25px' }}>
                            {['football', 'cricket', 'badminton', 'box cricket', 'multi-sport'].map(sport => (
                                <button
                                    key={sport}
                                    type="button"
                                    onClick={() => toggleSport(sport)}
                                    style={{
                                        padding: '10px 20px', borderRadius: '12px', border: '1px solid #e2e8f0',
                                        background: formData.sports_played.includes(sport) ? 'var(--primary)' : 'white',
                                        color: formData.sports_played.includes(sport) ? 'white' : 'inherit',
                                        textTransform: 'capitalize', cursor: 'pointer', transition: '0.2s', fontSize: '0.9rem'
                                    }}
                                >
                                    {sport === 'box cricket' ? '🏏 ' : (sport === 'football' ? '⚽ ' : (sport === 'badminton' ? '🏸 ' : '🏁 '))} {sport}
                                </button>
                            ))}
                        </div>

                        <div className="grid">
                            <div>
                                <label><FiTarget size={14} /> Skill Level</label>
                                <select value={formData.skill_level} onChange={e => setFormData({ ...formData, skill_level: e.target.value })}>
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>
                            <div>
                                <label><FiClock size={14} /> Best Play Time</label>
                                <select value={formData.preferred_play_time} onChange={e => setFormData({ ...formData, preferred_play_time: e.target.value })}>
                                    <option value="morning">Morning</option>
                                    <option value="afternoon">Afternoon</option>
                                    <option value="evening">Evening</option>
                                    <option value="night">Night</option>
                                </select>
                            </div>
                        </div>

                        <label><FiUsers size={14} /> Typical Group Size</label>
                        <select value={formData.typical_group_size} onChange={e => setFormData({ ...formData, typical_group_size: e.target.value })}>
                            <option value="solo">Solo (Looking for groups)</option>
                            <option value="2-4 players">2-4 players (Small team)</option>
                            <option value="5-7 players">5-7 players (Mid size)</option>
                            <option value="full team">Full team (11+ players)</option>
                        </select>
                    </div>
                )}

                {step === 4 && (
                    <div className="fade-in">
                        <h2 style={{ marginBottom: '10px' }}>Playing Preferences</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Final settings for your athlete profile.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <label className="checkbox-card glass" style={{ display: 'flex', gap: '15px', padding: '20px', borderRadius: '16px', cursor: 'pointer', border: '1px solid #e2e8f0' }}>
                                <input type="checkbox" checked={formData.willing_to_join_others} onChange={e => setFormData({ ...formData, willing_to_join_others: e.target.checked })} style={{ width: 'auto', marginBottom: 0 }} />
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>Willing to join other groups?</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Allow other players to invite you to games.</div>
                                </div>
                            </label>

                            <label className="checkbox-card glass" style={{ display: 'flex', gap: '15px', padding: '20px', borderRadius: '16px', cursor: 'pointer', border: '1px solid #e2e8f0' }}>
                                <input type="checkbox" checked={formData.bring_own_equipment} onChange={e => setFormData({ ...formData, bring_own_equipment: e.target.checked })} style={{ width: 'auto', marginBottom: 0 }} />
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>I bring my own equipment</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>You have your own kit (bat, ball, boots).</div>
                                </div>
                            </label>

                            <label className="checkbox-card glass" style={{ display: 'flex', gap: '15px', padding: '20px', borderRadius: '16px', cursor: 'pointer', border: '1px solid #e2e8f0' }}>
                                <input type="checkbox" checked={formData.notifications_opt_in} onChange={e => setFormData({ ...formData, notifications_opt_in: e.target.checked })} style={{ width: 'auto', marginBottom: 0 }} />
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>Enable match reminders</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Get notified about upcoming bookings.</div>
                                </div>
                            </label>
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '15px', marginTop: '40px' }}>
                    {step > 1 && (
                        <button type="button" onClick={handlePrev} className="btn btn-outline" style={{ flex: 1, height: '55px', justifyContent: 'center' }}>
                            <FiChevronLeft /> Back
                        </button>
                    )}
                    {step < 4 ? (
                        <button type="button" onClick={handleNext} className="btn btn-primary" style={{ flex: 2, height: '55px', justifyContent: 'center' }}>
                            Continue <FiChevronRight />
                        </button>
                    ) : (
                        <button onClick={handleSubmit} className="btn btn-primary" disabled={loading} style={{ flex: 2, height: '55px', justifyContent: 'center' }}>
                            {loading ? <div className="loader"></div> : <><FiCheckCircle /> Create My Profile</>}
                        </button>
                    )}
                </div>

                <p style={{ textAlign: 'center', marginTop: '25px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Login</Link>
                </p>
            </div>
        </div>
    );
};

export default PlayerRegister;
