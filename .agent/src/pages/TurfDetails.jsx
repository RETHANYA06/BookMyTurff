import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FiCalendar, FiClock, FiCheckCircle, FiInfo, FiUser, FiUsers, FiArrowRight, FiArrowLeft, FiShoppingBag, FiTruck, FiMapPin, FiActivity, FiLayers } from 'react-icons/fi';

const TurfDetails = () => {
    const { id } = useParams();
    const [searchLocation, setSearchLocation] = useState('');
    const [timeLeft, setTimeLeft] = useState(0);
    const navigate = useNavigate();
    const [turf, setTurf] = useState(null);
    const [items, setItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState({});
    const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'));
    const [slots, setSlots] = useState([]);
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [bookingStep, setBookingStep] = useState(1); // 1: Details, 2: Slots, 3: Form, 4: Success
    const [formData, setFormData] = useState({
        player_name: '',
        phone: '',
        players_count: '',
        payment_type: 'pay_at_turf',
        rules_confirmed: false,
        advance_amount: 0
    });
    const { player } = useContext(AuthContext);
    const [bookingResult, setBookingResult] = useState(null);
    const [loadingSlots, setLoadingSlots] = useState(false);

    useEffect(() => {
        if (player) {
            setFormData(prev => ({
                ...prev,
                player_name: player.full_name,
                phone: player.phone_number
            }));
        }
    }, [player]);

    const fetchTurfDetails = async () => {
        const res = await axios.get(`https://bookmyturff.onrender.com/api/turfs/${id}`);
        setTurf(res.data);
        setItems(res.data.items || []);
    };

    const fetchSlots = async () => {
        setLoadingSlots(true);
        try {
            const res = await axios.get(`https://bookmyturff.onrender.com/api/slots/${id}?date=${date}`);
            setSlots(res.data);
        } finally {
            setLoadingSlots(false);
        }
    };

    useEffect(() => {
        fetchTurfDetails();
    }, [id]);

    useEffect(() => {
        fetchSlots();
        // Polling to see other players' reservations
        const poll = setInterval(fetchSlots, 10000); // 10 seconds
        return () => clearInterval(poll);
    }, [id, date]);

    useEffect(() => {
        let timer;
        if (timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        // Clear selection when time expires
                        if (selectedSlots.length > 0) {
                            alert('Session expired! Please select your slots again.');
                            setSelectedSlots([]);
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [timeLeft, selectedSlots]);

    useEffect(() => {
        // Sync selected slots with fetched slots (in case someone else booked them or lock expired)
        if (slots.length > 0 && selectedSlots.length > 0) {
            const pId = player?.id || player?._id;
            const updatedSelection = selectedSlots.filter(sel => {
                const actual = slots.find(s => s._id === sel._id);
                if (!actual) return true; // Keep if not found in current view (maybe paginated later)

                // Keep ONLY if still available OR still reserved by me
                const isByMe = actual.status === 'reserved' && actual.locked_by === pId;
                return actual.status === 'available' || isByMe;
            });

            if (updatedSelection.length !== selectedSlots.length) {
                setSelectedSlots(updatedSelection);
                if (updatedSelection.length === 0) setTimeLeft(0);
            }
        }
    }, [slots, player]);

    const handleBooking = async (e) => {
        if (e) e.preventDefault();
        if (!player || player.role !== 'player') {
            return alert('Only registered players can book turfs.');
        }
        if (!formData.rules_confirmed) return alert('Please confirm rules first');
        if (selectedSlots.length === 0) return alert('Please select at least one slot');

        try {
            const res = await axios.post('https://bookmyturff.onrender.com/api/bookings', {
                turf_id: id,
                slot_ids: selectedSlots.map(s => s._id),
                ...formData,
                player_id: player.id || player._id,
                booking_owner_type: 'registered_player',
                items: selectedItems
            });
            setBookingResult(res.data);
            alert('Slot booked! Your reservation is confirmed.');
            setBookingStep(4);
        } catch (err) {
            alert(err.response?.data?.message || 'Booking failed');
        }
    };

    const toggleSlot = async (slot) => {
        if (!player) return window.confirm('Please login as a player to book.') && navigate('/player-login');

        const playerId = player.id || player._id;
        const isSelected = selectedSlots.some(s => s._id === slot._id);

        if (isSelected) {
            try {
                await axios.post('https://bookmyturff.onrender.com/api/slots/unlock', { slotId: slot._id, playerId });
                setSelectedSlots(selectedSlots.filter(s => s._id !== slot._id));
                if (selectedSlots.length === 1) setTimeLeft(0);
            } catch (err) {
                console.error("Unlock error:", err);
            }
            return;
        }

        if (slot.status !== 'available') {
            const isByMe = slot.status === 'reserved' && slot.locked_by === playerId;
            const isExpired = slot.status === 'reserved' && new Date() - new Date(slot.locked_at) > 3 * 60 * 1000;
            if (!isExpired && !isByMe) return;
        }

        try {
            const res = await axios.post('https://bookmyturff.onrender.com/api/slots/lock', { slotId: slot._id, playerId });
            const lockedSlot = res.data.slot;

            if (selectedSlots.length === 0) {
                setSelectedSlots([lockedSlot]);
                setTimeLeft(180); // 3 minutes
            } else {
                const sorted = [...selectedSlots, lockedSlot].sort((a, b) => a.start_time.localeCompare(b.start_time));

                // Check continuity
                let isContinuous = true;
                for (let i = 0; i < sorted.length - 1; i++) {
                    if (sorted[i].end_time !== sorted[i + 1].start_time) {
                        isContinuous = false;
                        break;
                    }
                }

                if (isContinuous) {
                    setSelectedSlots(sorted);
                } else {
                    // Unlock old slots and start new selection
                    await Promise.all(selectedSlots.map(s =>
                        axios.post('https://bookmyturff.onrender.com/api/slots/unlock', { slotId: s._id, playerId: player.id })
                    ));
                    setSelectedSlots([lockedSlot]);
                    setTimeLeft(180);
                }
            }
            if (bookingStep === 1) setBookingStep(2);
        } catch (err) {
            console.error("Lock error details:", err.response?.data);
            const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to lock slot. It may have been just taken.';
            alert(errorMsg);
            fetchSlots(); // Refresh current slots to show actual status
        }
    };

    const categorizeSlots = () => {
        const categories = {
            'Early Morning (5AM - 9AM)': [],
            'Morning (9AM - 1PM)': [],
            'Afternoon (1PM - 5PM)': [],
            'Evening (5PM - 9PM)': [],
            'Night (9PM - 11PM)': []
        };

        slots.forEach(slot => {
            const hour = parseInt(slot.start_time.split(':')[0]);
            // Filter 5 AM to 11 PM
            if (hour < 5 || (hour === 23 && parseInt(slot.start_time.split(':')[1]) > 0) || hour > 23) return;

            if (hour >= 5 && hour < 9) categories['Early Morning (5AM - 9AM)'].push(slot);
            else if (hour >= 9 && hour < 13) categories['Morning (9AM - 1PM)'].push(slot);
            else if (hour >= 13 && hour < 17) categories['Afternoon (1PM - 5PM)'].push(slot);
            else if (hour >= 17 && hour < 21) categories['Evening (5PM - 9PM)'].push(slot);
            else if (hour >= 21 && hour <= 23) categories['Night (9PM - 11PM)'].push(slot);
        });

        return categories;
    };

    const calculateTotal = () => {
        let slotTotal = selectedSlots.reduce((sum, slot) => sum + slot.price, 0);
        let itemTotal = 0;
        Object.keys(selectedItems).forEach(itemId => {
            const item = items.find(i => i._id === itemId);
            if (item) itemTotal += item.rent_price * selectedItems[itemId];
        });
        return slotTotal + itemTotal;
    };

    if (!turf) return <div style={{ textAlign: 'center', padding: '100px' }}><div className="loader"></div></div>;

    return (
        <div className="fade-in" style={{ maxWidth: '1350px', margin: '40px auto', padding: '0 20px', paddingBottom: '100px' }}>
            {bookingStep < 4 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 420px', gap: '35px', alignItems: 'start' }}>

                    {/* Main Content Area */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '35px' }}>

                        {/* 1. Header & Info */}
                        <section className="glass-heavy" style={{ padding: '0', borderRadius: '40px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 30px 60px rgba(0,0,0,0.4)' }}>
                            <div style={{ height: '420px', position: 'relative' }}>
                                <img
                                    src={turf.image_url || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop'}
                                    alt={turf.turf_name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <div style={{
                                    position: 'absolute',
                                    bottom: '0',
                                    left: '0',
                                    right: '0',
                                    height: '60%',
                                    background: 'linear-gradient(to top, #0f172a, transparent)'
                                }} />
                                <div className="animate-float" style={{ position: 'absolute', top: '30px', right: '30px', background: 'var(--primary)', color: '#0f172a', padding: '10px 25px', borderRadius: '40px', fontWeight: '900', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', boxShadow: '0 0 30px rgba(16, 185, 129, 0.4)' }}>
                                    {turf.sport_type}
                                </div>
                            </div>
                            <div style={{ padding: '50px', marginTop: '-100px', position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h1 style={{ fontSize: '4.5rem', marginBottom: '10px', color: 'var(--text-primary)', fontWeight: '900', letterSpacing: '-3px', lineHeight: '1' }}>{turf.turf_name}</h1>
                                        <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.2rem', fontWeight: '600', marginTop: '15px' }}>
                                            <FiMapPin color="var(--primary)" size={24} /> {turf.location}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px', fontWeight: '800' }}>Investment Basis</div>
                                        <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary)', lineHeight: '1' }}>₹{turf.price_per_hour || '500'} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>/ HR</span></div>
                                    </div>
                                </div>

                                <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '50px' }}>
                                    <div className="glass" style={{ padding: '25px', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '800', marginBottom: '10px' }}>Tactical Dimension</div>
                                        <div style={{ fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                                            <FiLayers color="var(--primary)" size={18} /> {turf.turf_size || 'PRO GRADE'}
                                        </div>
                                    </div>
                                    <div className="glass" style={{ padding: '25px', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '800', marginBottom: '10px' }}>Squad Limit</div>
                                        <div style={{ fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                                            <FiUsers color="var(--primary)" size={18} /> {turf.max_players} ATHLETES
                                        </div>
                                    </div>
                                    <div className="glass" style={{ padding: '25px', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '800', marginBottom: '10px' }}>Session Block</div>
                                        <div style={{ fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                                            <FiClock color="var(--primary)" size={18} /> {turf.slot_duration} MINS
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: '40px', padding: '30px', background: 'rgba(16, 185, 129, 0.03)', borderRadius: '28px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                                    <h4 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--primary)', fontWeight: '900', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '2px' }}><FiInfo size={20} /> Field Directives</h4>
                                    <p style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--text-secondary)', fontWeight: '500' }}>{turf.rules_text || 'Active scouting mandatory 15 minutes prior to session kick-off. Specialized professional athletic footwear is strictly required for optimal field integrity.'}</p>
                                </div>
                            </div>
                        </section>

                        {/* 2. Slot Selection */}
                        <section className="glass-heavy" style={{ padding: '50px', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '50px' }}>
                                <div>
                                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '2.5rem', color: 'var(--text-primary)', fontWeight: '900', letterSpacing: '-1px' }}><FiCalendar color="var(--primary)" /> Tactical Window</h2>
                                    {timeLeft > 0 && (
                                        <div style={{ marginTop: '15px', background: 'rgba(245, 158, 11, 0.1)', padding: '12px 25px', borderRadius: '15px', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'inline-flex', alignItems: 'center', gap: '15px' }}>
                                            <div className="loader" style={{ width: '16px', height: '16px', borderColor: 'var(--warning)', borderBottomColor: 'transparent' }}></div>
                                            <span style={{ color: 'var(--warning)', fontWeight: '900', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                Cart Integrity System: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    {[0, 1, 2, 3, 4, 5, 6].map(offset => {
                                        const d = new Date();
                                        d.setDate(d.getDate() + offset);
                                        const dStr = d.toISOString().split('T')[0];
                                        const isSelected = date === dStr;
                                        return (
                                            <button
                                                key={dStr}
                                                onClick={() => setDate(dStr)}
                                                style={{
                                                    padding: '12px 20px',
                                                    borderRadius: '15px',
                                                    border: 'none',
                                                    background: isSelected ? 'var(--primary)' : 'transparent',
                                                    color: isSelected ? '#0f172a' : 'var(--text-secondary)',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                <div style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '2px' }}>{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                                <div style={{ fontWeight: '900', fontSize: '1.1rem' }}>{d.getDate()}</div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {loadingSlots ? (
                                <div style={{ textAlign: 'center', padding: '100px' }}><div className="loader" style={{ width: '60px', height: '60px' }}></div></div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                                    {Object.entries(categorizeSlots()).map(([category, catSlots]) => catSlots.length > 0 && (
                                        <div key={category}>
                                            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px' }}>
                                                <FiClock size={16} color="var(--primary)" /> {category}
                                            </h4>
                                            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '15px' }}>
                                                {catSlots.map(slot => {
                                                    const isLockedByMe = slot.status === 'reserved' && slot.locked_by === (player?.id || player?._id);
                                                    const isLockedByOther = slot.status === 'reserved' && !isLockedByMe;
                                                    const isActive = selectedSlots.some(s => s._id === slot._id);

                                                    let bg = 'rgba(255,255,255,0.03)';
                                                    let border = '1px solid rgba(255,255,255,0.08)';
                                                    let color = 'var(--text-primary)';

                                                    if (slot.status === 'booked' || slot.status === 'blocked') {
                                                        bg = 'rgba(239, 68, 68, 0.05)';
                                                        border = '1px solid rgba(239, 68, 68, 0.1)';
                                                        color = 'rgba(239, 68, 68, 0.5)';
                                                    } else if (isLockedByOther) {
                                                        bg = 'rgba(245, 158, 11, 0.05)';
                                                        border = '1px solid rgba(245, 158, 11, 0.1)';
                                                        color = 'rgba(245, 158, 11, 0.5)';
                                                    } else if (isActive) {
                                                        bg = 'var(--primary)';
                                                        border = '1px solid var(--primary)';
                                                        color = '#0f172a';
                                                    }

                                                    return (
                                                        <button
                                                            key={slot._id}
                                                            disabled={slot.status === 'booked' || slot.status === 'blocked' || isLockedByOther}
                                                            onClick={() => toggleSlot(slot)}
                                                            className="card-hover"
                                                            style={{
                                                                padding: '18px 10px',
                                                                borderRadius: '20px',
                                                                border,
                                                                background: bg,
                                                                color,
                                                                cursor: (slot.status === 'available' || isLockedByMe) ? 'pointer' : 'not-allowed',
                                                                textAlign: 'center',
                                                                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                                                            }}
                                                        >
                                                            <div style={{ fontWeight: '900', fontSize: '1.2rem' }}>{slot.start_time}</div>
                                                            <div style={{ fontSize: '0.75rem', fontWeight: '800', marginTop: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                                {isLockedByOther ? 'LOCKED' : (slot.status === 'booked' ? 'ENGAGED' : `₹${slot.price}`)}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                    {slots.length === 0 && <div className="glass" style={{ textAlign: 'center', padding: '60px', borderRadius: '24px', color: 'var(--text-secondary)', fontWeight: '700' }}>System status: No tactical openings detected for this window.</div>}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Sidebar: Booking Summary & Form */}
                    <div style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
                        {bookingStep === 3 ? (
                            <form onSubmit={handleBooking} className="glass-heavy fade-in" style={{ padding: '40px', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 40px 80px rgba(0,0,0,0.5)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
                                    <h3 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', fontWeight: '900', letterSpacing: '-1px' }}>Deployment</h3>
                                    <button type="button" onClick={() => setBookingStep(2)} style={{ border: 'none', background: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}><FiArrowLeft /> REVISE</button>
                                </div>

                                <div style={{ marginBottom: '30px' }}>
                                    <div className="glass" style={{ padding: '20px', borderRadius: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '900', marginBottom: '10px' }}>Personnel Intel</div>
                                        <div style={{ fontWeight: '900', color: 'var(--text-primary)', fontSize: '1.1rem' }}>{player?.full_name}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', marginTop: '4px' }}>{player?.phone_number}</div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '25px' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '900', marginBottom: '12px', paddingLeft: '5px' }}>Squad Capacity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={turf.max_players}
                                        placeholder={`Max ${turf.max_players} Athletes`}
                                        required
                                        value={formData.players_count}
                                        onChange={e => setFormData({ ...formData, players_count: e.target.value })}
                                        style={{ height: '60px', fontSize: '1.1rem', fontWeight: '800' }}
                                    />
                                </div>

                                <div style={{ margin: '35px 0' }}>
                                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '900', marginBottom: '20px', paddingLeft: '5px' }}><FiShoppingBag size={16} /> Gear Requisition</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {items.map(item => (
                                            <div key={item._id} className="glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderRadius: '18px', background: 'rgba(255,255,255,0.02)' }}>
                                                <div>
                                                    <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-primary)' }}>{item.item_name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700' }}>₹{item.rent_price} / unit</div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(0,0,0,0.3)', padding: '5px 12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <button type="button" onClick={() => setSelectedItems({ ...selectedItems, [item._id]: Math.max(0, (selectedItems[item._id] || 0) - 1) })} style={{ border: 'none', background: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.2rem', fontWeight: '900' }}>-</button>
                                                    <span style={{ fontSize: '1rem', fontWeight: '900', color: 'var(--text-primary)', minWidth: '20px', textAlign: 'center' }}>{selectedItems[item._id] || 0}</span>
                                                    <button type="button" onClick={() => setSelectedItems({ ...selectedItems, [item._id]: (selectedItems[item._id] || 0) + 1 })} style={{ border: 'none', background: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.2rem', fontWeight: '900' }}>+</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ margin: '30px 0' }}>
                                    <label style={{ display: 'flex', gap: '15px', cursor: 'pointer', fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: '700', alignItems: 'center' }}>
                                        <input
                                            type="checkbox"
                                            required
                                            checked={formData.rules_confirmed}
                                            onChange={e => setFormData({ ...formData, rules_confirmed: e.target.checked })}
                                            style={{ width: '22px', height: '22px', margin: 0, accentColor: 'var(--primary)' }}
                                        />
                                        Directives Acknowledged
                                    </label>
                                </div>

                                <div className="glass-heavy" style={{ padding: '25px', borderRadius: '24px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)', margin: '35px 0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Final Allocation</span>
                                        <span style={{ fontWeight: '900', fontSize: '2rem', color: 'var(--primary)' }}>₹{calculateTotal()}</span>
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px', fontWeight: '600' }}>Inclusive of {selectedSlots.length} tactical units & requisitioned gear.</p>
                                </div>

                                <button className="btn btn-primary" style={{ width: '100%', height: '70px', borderRadius: '22px', fontSize: '1.2rem' }}>
                                    Confirm Deployment <FiCheckCircle size={24} />
                                </button>
                                <p style={{ textAlign: 'center', fontSize: '0.85rem', marginTop: '20px', color: 'var(--warning)', fontWeight: '800' }}>⚡ ARRIVE T-MINUS 15 MINS</p>
                            </form>
                        ) : (
                            <div className="glass-heavy" style={{ padding: '40px', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 40px 80px rgba(0,0,0,0.5)' }}>
                                <h3 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', fontWeight: '900', letterSpacing: '-1px', marginBottom: '35px' }}>Mission Intel</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div className="glass" style={{ padding: '25px', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '900', marginBottom: '12px' }}>Objective Sector</div>
                                        <div style={{ fontWeight: '900', fontSize: '1.4rem', color: 'var(--text-primary)', lineHeight: '1.1' }}>{turf.turf_name}</div>
                                        <div style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '1rem', marginTop: '10px' }}>{date}</div>
                                    </div>

                                    {selectedSlots.length > 0 ? (
                                        <>
                                            <div className="glass" style={{ padding: '25px', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '900', marginBottom: '12px' }}>Deployment Window</div>
                                                <div style={{ fontWeight: '900', fontSize: '1.2rem', color: 'var(--text-primary)' }}>{selectedSlots[0]?.start_time} — {selectedSlots[(selectedSlots?.length || 0) - 1]?.end_time}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '800', marginTop: '8px' }}>{selectedSlots.length} Session Blocks</div>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', padding: '0 10px' }}>
                                                <span style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: '800' }}>Valuation</span>
                                                <span style={{ fontWeight: '900', fontSize: '2rem', color: 'var(--primary)' }}>₹{calculateTotal()}</span>
                                            </div>
                                            <button
                                                className="btn btn-primary"
                                                style={{ width: '100%', height: '70px', borderRadius: '22px', fontSize: '1.2rem', marginTop: '15px' }}
                                                onClick={() => setBookingStep(3)}
                                            >
                                                Initialize Booking <FiArrowRight size={24} />
                                            </button>
                                        </>
                                    ) : (
                                        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                                            <div className="animate-float" style={{ fontSize: '3rem', marginBottom: '20px', opacity: 0.3 }}>⚽</div>
                                            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', fontWeight: '700', lineHeight: '1.6' }}>Identify tactical openings on the schedule to proceed.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Success Step */}
            {bookingStep === 4 && (
                <div className="glass-heavy fade-in" style={{ maxWidth: '750px', margin: '60px auto', padding: '80px', borderRadius: '50px', textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.2)', boxShadow: '0 50px 100px rgba(0,0,0,0.6)' }}>
                    <div className="animate-float" style={{
                        width: '120px',
                        height: '120px',
                        background: 'var(--primary)',
                        borderRadius: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 40px',
                        color: '#0f172a',
                        boxShadow: '0 0 50px rgba(16, 185, 129, 0.5)',
                        transform: 'rotate(-5deg)'
                    }}>
                        <FiCheckCircle size={60} strokeWidth={2.5} />
                    </div>
                    <div style={{ display: 'inline-block', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', padding: '10px 30px', borderRadius: '40px', fontWeight: '900', letterSpacing: '2px', fontSize: '0.9rem', marginBottom: '20px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        SLOT BOOKED SUCCESSFULLY
                    </div>
                    <h1 style={{ fontSize: '5rem', marginBottom: '15px', color: 'var(--text-primary)', fontWeight: '900', letterSpacing: '-4px', lineHeight: '0.9' }}>VICTORY <span className="text-glow" style={{ color: 'var(--primary)' }}>SECURED</span></h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.4rem', marginBottom: '50px', fontWeight: '600' }}>Objective <b>{turf.turf_name}</b> has been successfully neutralized and reserved for your squad.</p>

                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '45px', borderRadius: '32px', textAlign: 'left', marginBottom: '50px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.05))', zIndex: -1 }}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '3px', fontWeight: '900' }}>Deployment Manifest</span>
                            <span style={{ fontWeight: '900', color: 'var(--primary)', background: 'rgba(16, 185, 129, 0.1)', padding: '6px 15px', borderRadius: '12px', fontSize: '1rem', letterSpacing: '1px' }}>#{bookingResult?._id.slice(-8).toUpperCase()}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className="glass" style={{ padding: '20px', borderRadius: '18px', background: 'rgba(255,255,255,0.01)' }}>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800', marginBottom: '5px' }}>Date</div>
                                <div style={{ fontWeight: '900', color: 'var(--text-primary)', fontSize: '1.2rem' }}>{date}</div>
                            </div>
                            <div className="glass" style={{ padding: '20px', borderRadius: '18px', background: 'rgba(255,255,255,0.01)' }}>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800', marginBottom: '5px' }}>Window</div>
                                <div style={{ fontWeight: '900', color: 'var(--text-primary)', fontSize: '1.2rem' }}>{selectedSlots[0]?.start_time} - {selectedSlots[(selectedSlots?.length || 0) - 1]?.end_time}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '30px', marginTop: '30px', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-primary)', fontSize: '1.3rem', fontWeight: '900', letterSpacing: '-0.5px' }}>Asset Valuation</span>
                            <span style={{ fontWeight: '900', fontSize: '2.5rem', color: 'var(--primary)' }}>₹{calculateTotal()}</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '20px' }}>
                        <button onClick={() => navigate('/my-bookings')} className="btn btn-primary" style={{ flex: 1, height: '75px', borderRadius: '22px', fontSize: '1.2rem' }}>
                            Access Archives <FiActivity size={24} />
                        </button>
                        <button onClick={() => navigate('/')} className="btn-outline" style={{ flex: 1, height: '75px', borderRadius: '22px', fontSize: '1.2rem', background: 'rgba(255,255,255,0.03)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                            Sector Return
                        </button>
                    </div>
                    <p style={{ marginTop: '40px', fontSize: '1.1rem', color: 'var(--warning)', fontWeight: '900', letterSpacing: '1px' }}>⚡ ADVISORY: ARRIVE T-MINUS 15 MINS FOR CALIBRATION</p>
                </div>
            )}
        </div>
    );
};

export default TurfDetails;
