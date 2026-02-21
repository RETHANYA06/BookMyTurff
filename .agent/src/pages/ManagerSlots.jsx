import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FiPlus, FiLock, FiUnlock, FiRefreshCw, FiCalendar, FiClock } from 'react-icons/fi';

const ManagerSlots = () => {
    const { manager } = useContext(AuthContext);
    const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'));
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);

    if (!manager) return <div style={{ textAlign: 'center', marginTop: '100px' }}>Please login as Manager to access this page.</div>;

    const fetchSlots = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/slots/${manager.turf_id}?date=${date}`);
            setSlots(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (manager) fetchSlots();
    }, [manager, date]);

    const generateSlots = async () => {
        try {
            await axios.post('http://localhost:5000/api/slots/generate', {
                turfId: manager.turf_id,
                date
            });
            fetchSlots();
        } catch (err) {
            alert('Generation failed');
        }
    };

    const updateSlot = async (id, data) => {
        try {
            await axios.put(`http://localhost:5000/api/slots/${id}`, data);
            fetchSlots();
        } catch (err) {
            alert('Update failed');
        }
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem' }}>Slot Control Panel</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage daily inventory and pricing</p>
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ background: 'white', padding: '5px 15px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FiCalendar color="var(--primary)" />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            style={{ marginBottom: 0, width: 'auto', border: 'none', background: 'transparent', padding: '8px' }}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={generateSlots} style={{ height: '50px' }}>
                        <FiRefreshCw /> Auto-Generate Grid
                    </button>
                </div>
            </div>

            <div className="glass" style={{ padding: '35px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px' }}>
                        <div className="loader" style={{ borderColor: 'var(--primary)', borderBottomColor: 'transparent' }}></div>
                        <p style={{ marginTop: '15px', color: 'var(--text-secondary)' }}>Refining slot schedule...</p>
                    </div>
                ) : (
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                        {slots.map(slot => (
                            <div key={slot._id} className="glass" style={{ padding: '24px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <FiClock color="var(--text-secondary)" />
                                        <h3 style={{ fontSize: '1.2rem' }}>{slot.start_time} - {slot.end_time}</h3>
                                    </div>
                                    <span className="badge" style={{
                                        background: slot.status === 'available' ? '#dcfce7' : (slot.status === 'booked' ? '#fee2e2' : '#f1f5f9'),
                                        color: slot.status === 'available' ? '#166534' : (slot.status === 'booked' ? '#991b1b' : '#64748b')
                                    }}>
                                        {slot.status}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', display: 'block', fontWeight: 'bold' }}>Slot Price</label>
                                        <div style={{ position: 'relative' }}>
                                            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 'bold' }}>₹</span>
                                            <input
                                                type="number"
                                                defaultValue={slot.price}
                                                onBlur={(e) => updateSlot(slot._id, { price: e.target.value })}
                                                style={{ padding: '12px 12px 12px 30px', marginBottom: 0, fontSize: '1.1rem', fontWeight: 'bold' }}
                                                disabled={slot.status === 'booked'}
                                            />
                                        </div>
                                    </div>

                                    {slot.status === 'available' ? (
                                        <button className="btn btn-outline" style={{ height: '48px', width: '48px', justifyContent: 'center', padding: 0 }} onClick={() => updateSlot(slot._id, { status: 'blocked' })} title="Block Slot">
                                            <FiLock />
                                        </button>
                                    ) : slot.status === 'blocked' ? (
                                        <button className="btn btn-outline" style={{ height: '48px', width: '48px', justifyContent: 'center', padding: 0, color: 'var(--success)', borderColor: 'var(--success)' }} onClick={() => updateSlot(slot._id, { status: 'available' })} title="Unblock Slot">
                                            <FiUnlock />
                                        </button>
                                    ) : (
                                        <button className="btn btn-outline" disabled style={{ height: '48px', width: '48px', justifyContent: 'center', padding: 0, opacity: 0.3 }}>
                                            <FiLock />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {slots.length === 0 && (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px 20px', background: 'white', borderRadius: '24px' }}>
                                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🗓️</div>
                                <h2>Empty Schedule</h2>
                                <p style={{ color: 'var(--text-secondary)', marginTop: '10px', maxWidth: '400px', margin: '10px auto' }}>No inventory has been added for this date. Generate your daily slots with one click.</p>
                                <button className="btn btn-primary" onClick={generateSlots} style={{ marginTop: '25px', padding: '15px 40px' }}>
                                    Generate Daily Grid
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManagerSlots;
