import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiUser, FiPhone, FiMail, FiLock, FiHome, FiMapPin, FiClock, FiSettings, FiCheck, FiPlus, FiTrash, FiActivity, FiLayers } from 'react-icons/fi';

const OwnerRegister = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        // Step 1: Account
        name: '', phone: '', email: '', password: '',
        // Step 2: Turf Basic
        turf_name: '', image_url: '', location: '', google_map_link: '', sport_type: '5s football', turf_size: 'medium',
        // Step 3: Operating
        opening_time: '06:00', closing_time: '22:00', slot_duration: '60', max_players: '22', base_price: '500',
        days_open: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        // Step 4: Items & Rules
        rules_text: 'Please arrive 15 minutes early. No smoking allowed.',
        rental_items: [{ item_name: 'Football', rent_price: 50 }]
    });

    const handleNext = () => {
        if (step === 1) {
            if (formData.phone.length < 10) return alert('Enter a valid phone number');
        }
        if (step === 2) {
            if (!formData.turf_name || !formData.location) return alert('Fill all mandatory fields');
        }
        if (step === 3) {
            if (formData.days_open.length === 0) return alert('Select at least one day');
            if (formData.opening_time >= formData.closing_time) return alert('Closing time must be after opening time');
        }
        setStep(step + 1);
    };

    const handleBack = () => setStep(step - 1);

    const toggleDay = (day) => {
        const newDays = formData.days_open.includes(day)
            ? formData.days_open.filter(d => d !== day)
            : [...formData.days_open, day];
        setFormData({ ...formData, days_open: newDays });
    };

    const handleAddItem = () => {
        setFormData({ ...formData, rental_items: [...formData.rental_items, { item_name: '', rent_price: 0 }] });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.rental_items];
        newItems[index][field] = value;
        setFormData({ ...formData, rental_items: newItems });
    };

    const handleRemoveItem = (index) => {
        const newItems = formData.rental_items.filter((_, i) => i !== index);
        setFormData({ ...formData, rental_items: newItems });
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await axios.post('https://bookmyturff.onrender.com/api/auth/register', formData);
            login({ ...res.data, role: 'owner', id: res.data.manager_id || res.data._id });
            navigate('/manager/dashboard');
        } catch (err) {
            alert(err.response?.data?.message || 'Onboarding failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { id: 1, name: 'Account', icon: <FiUser /> },
        { id: 2, name: 'Arena', icon: <FiHome /> },
        { id: 3, name: 'Schedule', icon: <FiClock /> },
        { id: 4, name: 'Facilities', icon: <FiLayers /> }
    ];

    return (
        <div className="fade-in" style={{ maxWidth: '800px', margin: '60px auto' }}>
            <div className="glass" style={{ padding: '20px 40px', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', borderRadius: '24px' }}>
                {steps.map(s => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: step >= s.id ? 1 : 0.4, transition: '0.3s' }}>
                        <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: step >= s.id ? 'var(--primary)' : '#e2e8f0', color: step >= s.id ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {step > s.id ? <FiCheck /> : s.icon}
                        </div>
                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{s.name}</span>
                    </div>
                ))}
            </div>

            <div className="glass" style={{ padding: '50px', borderRadius: '24px' }}>
                {step === 1 && (
                    <div className="fade-in">
                        <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>Admin Account Setup</h2>
                        <div className="grid">
                            <div className="form-group">
                                <label>Full Name</label>
                                <div style={{ position: 'relative' }}>
                                    <FiUser style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.7 }} />
                                    <input style={{ paddingLeft: '50px' }} placeholder="Pitch Owner Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Business Phone</label>
                                <div style={{ position: 'relative' }}>
                                    <FiPhone style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.7 }} />
                                    <input style={{ paddingLeft: '50px' }} placeholder="10-digit mobile number" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Professional Email</label>
                            <div style={{ position: 'relative' }}>
                                <FiMail style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.7 }} />
                                <input style={{ paddingLeft: '50px' }} type="email" placeholder="owner@yourturf.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Strong Password</label>
                            <div style={{ position: 'relative' }}>
                                <FiLock style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.7 }} />
                                <input style={{ paddingLeft: '50px' }} type="password" placeholder="Min 6 characters" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="fade-in">
                        <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>Facility Information</h2>
                        <div className="form-group">
                            <label>Arena Name</label>
                            <div style={{ position: 'relative' }}>
                                <FiActivity style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.7 }} />
                                <input style={{ paddingLeft: '50px' }} placeholder="e.g. Wembley Sports Center" value={formData.turf_name} onChange={e => setFormData({ ...formData, turf_name: e.target.value })} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Arena Photo (URL)</label>
                            <div style={{ position: 'relative' }}>
                                <FiPlus style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.7 }} />
                                <input style={{ paddingLeft: '50px' }} placeholder="https://example.com/pitch.jpg (Optional)" value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Complete Address</label>
                            <div style={{ position: 'relative' }}>
                                <FiMapPin style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.7 }} />
                                <input style={{ paddingLeft: '50px' }} placeholder="Street, City, Landmark" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Google Maps Link (Optional)</label>
                            <div style={{ position: 'relative' }}>
                                <FiMapPin style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.7 }} />
                                <input style={{ paddingLeft: '50px' }} placeholder="Paste share link" value={formData.google_map_link} onChange={e => setFormData({ ...formData, google_map_link: e.target.value })} />
                            </div>
                        </div>

                        <div className="grid">
                            <div className="form-group">
                                <label>Primary Sport</label>
                                <select value={formData.sport_type} onChange={e => setFormData({ ...formData, sport_type: e.target.value })}>
                                    <option value="5s football">5s Football</option>
                                    <option value="7s football">7s Football</option>
                                    <option value="cricket">Cricket</option>
                                    <option value="badminton">Badminton</option>
                                    <option value="multi-sport">Multi-Sport</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Arena Size</label>
                                <select value={formData.turf_size} onChange={e => setFormData({ ...formData, turf_size: e.target.value })}>
                                    <option value="small">Small (3-5 players)</option>
                                    <option value="medium">Medium (7-9 players)</option>
                                    <option value="large">Large (11+ players)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="fade-in">
                        <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>Operating Configuration</h2>
                        <div className="grid">
                            <div className="form-group">
                                <label>Opening Time</label>
                                <div style={{ position: 'relative' }}>
                                    <FiClock style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.7 }} />
                                    <input style={{ paddingLeft: '50px' }} type="time" value={formData.opening_time} onChange={e => setFormData({ ...formData, opening_time: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Closing Time</label>
                                <div style={{ position: 'relative' }}>
                                    <FiClock style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.7 }} />
                                    <input style={{ paddingLeft: '50px' }} type="time" value={formData.closing_time} onChange={e => setFormData({ ...formData, closing_time: e.target.value })} />
                                </div>
                            </div>
                        </div>
                        <div className="grid">
                            <div className="form-group">
                                <label>Base Price (₹/hr)</label>
                                <div style={{ position: 'relative' }}>
                                    <FiSettings style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.7 }} />
                                    <input style={{ paddingLeft: '50px' }} type="number" value={formData.base_price} onChange={e => setFormData({ ...formData, base_price: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Slot Duration</label>
                                <select value={formData.slot_duration} onChange={e => setFormData({ ...formData, slot_duration: e.target.value })}>
                                    <option value="30">30 Minutes</option>
                                    <option value="45">45 Minutes</option>
                                    <option value="60">60 Minutes</option>
                                    <option value="90">90 Minutes</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid">
                            <div className="form-group">
                                <label>Max Players Capacity</label>
                                <div style={{ position: 'relative' }}>
                                    <FiUser style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.7 }} />
                                    <input style={{ paddingLeft: '50px' }} type="number" value={formData.max_players} onChange={e => setFormData({ ...formData, max_players: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        <label style={{ display: 'block', marginBottom: '15px' }}>Business Days (Open for Bookings)</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '30px' }}>
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                <button key={day} onClick={() => toggleDay(day)} className={`btn ${formData.days_open.includes(day) ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '10px 20px', borderRadius: '30px', fontSize: '0.85rem' }}>
                                    {day.slice(0, 3)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="fade-in">
                        <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>Rules & Equipment</h2>
                        <div className="form-group">
                            <label>Ground Instructions & Rules</label>
                            <textarea rows="4" value={formData.rules_text} onChange={e => setFormData({ ...formData, rules_text: e.target.value })} placeholder="State your cleanup rules, shoe requirements etc." />
                        </div>

                        <div className="glass" style={{ margin: '30px 0', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '30px', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', alignItems: 'center' }}>
                                <h4 style={{ fontSize: '1.2rem' }}>Rentable Equipment</h4>
                                <button type="button" onClick={handleAddItem} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '10px 20px', borderRadius: '15px' }}><FiPlus /> Add Item</button>
                            </div>
                            {formData.rental_items.map((item, index) => (
                                <div key={index} className="grid" style={{ gridTemplateColumns: '1fr 140px 50px', alignItems: 'start', gap: '15px', marginBottom: '10px' }}>
                                    <input placeholder="Item Name" value={item.item_name} onChange={e => handleItemChange(index, 'item_name', e.target.value)} style={{ marginBottom: 0 }} />
                                    <input type="number" placeholder="Rent ₹" value={item.rent_price} onChange={e => handleItemChange(index, 'rent_price', e.target.value)} style={{ marginBottom: 0 }} />
                                    <button onClick={() => handleRemoveItem(index)} className="btn-outline" style={{ color: 'var(--danger)', height: '56px', width: '56px', padding: 0, borderRadius: '14px', border: '1px solid rgba(239,68,68,0.2)' }}><FiTrash /></button>
                                </div>
                            ))}
                        </div>

                        {/* Review Summary before finish */}
                        <div style={{ background: 'var(--primary-soft)', padding: '20px', borderRadius: '16px', border: '1px dashed var(--primary)' }}>
                            <h4 style={{ color: 'var(--primary)', marginBottom: '10px' }}>Ready to Launch?</h4>
                            <p style={{ fontSize: '0.9rem', color: '#166534' }}>By clicking finish, your arena <b>{formData.turf_name}</b> will be created and slots will be generated for the next 7 days.</p>
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
                    {step > 1 ? (
                        <button className="btn btn-outline" onClick={handleBack} disabled={loading}><FiTrash /> Back</button>
                    ) : (
                        <Link to="/register" className="btn btn-outline">Back</Link>
                    )}

                    {step < 4 ? (
                        <button className="btn btn-primary" onClick={handleNext}>Next Step <FiArrowRight /></button>
                    ) : (
                        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{ minWidth: '150px', justifyContent: 'center' }}>
                            {loading ? <div className="loader"></div> : 'Finish Setup & Launch'}
                        </button>
                    )}
                </div>
            </div>
        </div >
    );
};

const FiArrowRight = () => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>;

export default OwnerRegister;
