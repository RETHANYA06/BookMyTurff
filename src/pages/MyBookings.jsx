import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FiCalendar, FiClock, FiMapPin, FiXCircle, FiCheckCircle, FiInfo, FiActivity } from 'react-icons/fi';
import API_BASE_URL from '../config/api';

const MyBookings = () => {
    const { player } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming');

    const fetchBookings = async () => {
        if (!player) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/bookings/player/${player.id}`);
            setBookings(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [player]);

    const handleCancel = async (booking) => {
        // Time check: only allow cancel before start time
        const now = new Date();
        const firstSlot = booking.slot_ids?.[0];
        if (firstSlot) {
            const startDateTime = new Date(`${firstSlot.date}T${firstSlot.start_time}`);
            if (now > startDateTime) {
                return alert('Cannot cancel a match that has already started.');
            }
        }

        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        try {
            await axios.put(`${API_BASE_URL}/api/bookings/${booking._id}`, {
                status: 'cancelled',
                cancel_reason: 'cancelled_by_player'
            });
            alert('Booking cancelled successfully');
            fetchBookings();
        } catch (err) {
            alert(err.response?.data?.message || 'Cancellation failed');
        }
    };

    const filteredBookings = bookings.filter(b => {
        if (activeTab === 'upcoming') return b.status === 'booked' || b.status === 'pending_payment';
        if (activeTab === 'completed') return b.status === 'completed';
        if (activeTab === 'cancelled') return b.status === 'cancelled';
        return true;
    });

    if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><div className="loader"></div></div>;

    return (
        <div className="fade-in" style={{ maxWidth: '1000px', margin: '40px auto', paddingBottom: '60px' }}>
            <div style={{ marginBottom: '50px' }}>
                <span style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '3px', background: 'rgba(16, 185, 129, 0.1)', padding: '8px 20px', borderRadius: '40px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>Player Archives</span>
                <h1 style={{ fontSize: '3.5rem', color: 'var(--text-primary)', marginTop: '15px', letterSpacing: '-2px', fontWeight: '900' }}>GAME <span className="text-glow" style={{ color: 'var(--primary)' }}>HISTORY</span></h1>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '50px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1px' }}>
                {['upcoming', 'completed', 'cancelled'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '18px 35px',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === tab ? '4px solid var(--primary)' : '4px solid transparent',
                            color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
                            fontWeight: '800',
                            fontSize: '1rem',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            cursor: 'pointer',
                            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}
                    >
                        {tab}
                        {tab === 'upcoming' && filteredBookings.length > 0 && (
                            <span style={{ padding: '4px 10px', borderRadius: '8px', background: 'var(--primary)', color: '#0f172a', fontSize: '0.75rem', fontWeight: '900' }}>{filteredBookings.length}</span>
                        )}
                    </button>
                ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                {filteredBookings.map(booking => (
                    <div key={booking._id} className="glass" style={{
                        padding: '40px',
                        borderRadius: '32px',
                        borderLeft: `8px solid ${booking.status === 'booked' ? 'var(--primary)' : (booking.status === 'completed' ? '#3b82f6' : (booking.status === 'pending_payment' ? '#f59e0b' : 'var(--danger)'))}`,
                        background: 'var(--card-bg)',
                        border: '1px solid var(--border-subtle)',
                        borderLeftWidth: '8px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '100%', background: `linear-gradient(90deg, transparent, ${booking.status === 'booked' ? 'rgba(16, 185, 129, 0.03)' : 'rgba(239, 68, 68, 0.03)'})`, zIndex: -1 }}></div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '30px' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', fontWeight: '800', marginBottom: '8px' }}>{booking.turf_id?.turf_name}</h3>
                                        <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: '600' }}>
                                            <FiMapPin color="var(--primary)" size={18} /> {booking.turf_id?.location}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800', marginBottom: '5px' }}>Operation Ref</div>
                                        <div style={{ fontSize: '0.95rem', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '1px' }}>#{booking._id.slice(-8).toUpperCase()}</div>
                                    </div>
                                </div>

                                <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', background: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '30px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800', marginBottom: '8px' }}>Timeline</div>
                                        <div style={{ fontWeight: '900', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                            {booking.slot_ids?.[0]?.start_time} - {booking.slot_ids?.[(booking.slot_ids?.length || 0) - 1]?.end_time}
                                            <div style={{ color: 'var(--primary)', marginTop: '4px', fontSize: '0.8rem' }}>{booking.slot_ids?.[0]?.date}</div>
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800', marginBottom: '8px' }}>Squad Size</div>
                                        <div style={{ fontWeight: '900', fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <FiActivity color="var(--primary)" /> {booking.players_count} Members
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800', marginBottom: '8px' }}>Intel</div>
                                        <div style={{ fontWeight: '900', fontSize: '0.9rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            ₹{booking.slot_ids?.reduce((s, slot) => s + slot.price, 0) || 0}
                                            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Paid</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800', marginBottom: '8px' }}>Condition</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{
                                                width: '8px', height: '8px', borderRadius: '50%',
                                                background: booking.status === 'booked' ? 'var(--primary)' : (booking.status === 'completed' ? '#3b82f6' : '#ef4444'),
                                                boxShadow: `0 0 10px ${booking.status === 'booked' ? 'var(--primary)' : (booking.status === 'completed' ? '#3b82f6' : '#ef4444')}`
                                            }}></div>
                                            <span style={{ fontWeight: '900', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-primary)', letterSpacing: '1px' }}>
                                                {booking.status?.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {booking.rental_items && booking.rental_items.length > 0 && (
                                    <div style={{ marginBottom: '30px', padding: '20px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>Inventory Deployed</div>
                                        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                            {booking.rental_items.map(ri => (
                                                <div key={ri._id} style={{ fontSize: '0.85rem', color: 'var(--text-primary)', background: 'rgba(0,0,0,0.03)', padding: '6px 15px', borderRadius: '10px', fontWeight: '700', border: '1px solid var(--border-subtle)' }}>
                                                    {ri.item_id?.item_name} × {ri.quantity}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '15px' }}>
                                        {(booking.status === 'booked' || booking.status === 'pending_payment') && (
                                            <button
                                                onClick={() => handleCancel(booking)}
                                                className="btn-outline"
                                                style={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: 'var(--danger)', padding: '12px 25px', fontSize: '0.9rem', fontWeight: '800', borderRadius: '15px', background: 'rgba(239, 68, 68, 0.05)' }}
                                            >
                                                <FiXCircle /> Abort Protocol
                                            </button>
                                        )}
                                        {booking.status === 'completed' && <div style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem', fontWeight: '800' }}><FiCheckCircle size={20} /> Mission Complete</div>}
                                        {booking.status === 'cancelled' && <div style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem', fontWeight: '800' }}><FiInfo size={20} /> {booking.cancel_reason?.replace('_', ' ') || 'Operation Cancelled'}</div>}
                                    </div>

                                    {booking.status === 'booked' && (
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div className="animate-float"><FiInfo color="var(--primary)" /></div> Deployment advisory: Arrive T-minus 15 mins
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredBookings.length === 0 && (
                    <div className="glass-heavy" style={{ textAlign: 'center', padding: '120px 40px', borderRadius: '40px', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontSize: '5rem', marginBottom: '25px', opacity: 0.3 }}>🏟️</div>
                        <h2 style={{ fontSize: '2.5rem', color: 'var(--text-primary)', fontWeight: '900', letterSpacing: '-1px' }}>No Match Records</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginTop: '10px', fontWeight: '500' }}>Your tactical history is currently blank. Initiate your first booking now.</p>
                        <button className="btn btn-primary" style={{ marginTop: '40px', padding: '18px 45px' }} onClick={() => window.location.href = '/player/dashboard'}>Browse Turf</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyBookings;
