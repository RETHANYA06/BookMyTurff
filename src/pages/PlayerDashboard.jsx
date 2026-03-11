import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    FiSearch, FiMapPin, FiDollarSign, FiStar,
    FiCalendar, FiClock, FiXCircle, FiPlay, FiUser,
    FiChevronRight, FiFilter, FiTrendingUp, FiCheckCircle, FiPlus, FiShoppingBag
} from 'react-icons/fi';
import { GiSoccerBall } from 'react-icons/gi';
import API_BASE_URL from '../config/api';
import { formatINR, formatDate, formatTime } from '../utils/formatters';

const PlayerDashboard = () => {
    const { player, logout } = useContext(AuthContext);
    const [turfs, setTurfs] = useState([]);
    const [dashboardData, setDashboardData] = useState({ upcoming: null, history: [] });
    const [availableToday, setAvailableToday] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('browse'); // browse, bookings, activity
    const [searchLocation, setSearchLocation] = useState('');
    const [filters, setFilters] = useState({
        sport: 'All',
        priceRange: 2500,
        minRating: 0
    });
    const [quickBookTurf, setQuickBookTurf] = useState(null);
    const [quickSlots, setQuickSlots] = useState([]);
    const [loadingQuickSlots, setLoadingQuickSlots] = useState(false);
    const [selectedQuickSlot, setSelectedQuickSlot] = useState(null);
    const [bookingProcessing, setBookingProcessing] = useState(false);
    const navigate = useNavigate();

    const fetchDashboardData = async () => {
        if (!player) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const query = new URLSearchParams({
                location: searchLocation,
                sport_type: filters.sport,
                max_price: filters.priceRange,
                min_rating: filters.minRating
            }).toString();

            const [turfRes, dashRes, availRes, historyRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/turfs?${query}`),
                axios.get(`${API_BASE_URL}/api/bookings/player-dashboard/${player.id}`),
                axios.get(`${API_BASE_URL}/api/turfs/available-today/list`),
                axios.get(`${API_BASE_URL}/api/bookings/player/${player.id}`)
            ]);

            setTurfs(turfRes.data);
            setDashboardData({
                upcoming: dashRes.data.upcoming,
                history: historyRes.data
            });
            setAvailableToday(availRes.data);
        } catch (err) {
            console.error('Data Fetch Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [player, searchLocation, filters]);

    const handleCancel = async (booking) => {
        // ... (existing handleCancel code)
    };

    const openQuickBook = async (turf) => {
        setQuickBookTurf(turf);
        setLoadingQuickSlots(true);
        setSelectedQuickSlot(null);
        try {
            const today = new Date().toLocaleDateString('en-CA');
            const res = await axios.get(`${API_BASE_URL}/api/slots/${turf._id}?date=${today}`);
            setQuickSlots(res.data);
        } catch (err) {
            console.error('Quick Slot Fetch Error:', err);
        } finally {
            setLoadingQuickSlots(false);
        }
    };

    const handleQuickBooking = async () => {
        if (!selectedQuickSlot || !player) return;
        setBookingProcessing(true);
        try {
            await axios.post(`${API_BASE_URL}/api/bookings`, {
                turf_id: quickBookTurf._id,
                slot_ids: [selectedQuickSlot._id],
                player_name: player.full_name,
                phone: player.phone_number,
                players_count: quickBookTurf.max_players,
                payment_type: 'pay_at_turf',
                rules_confirmed: true,
                player_id: player.id || player._id,
                booking_owner_type: 'registered_player'
            });
            alert('Slot booked successfully! See you at the pitch.');
            setQuickBookTurf(null);
            fetchDashboardData();
        } catch (err) {
            alert(err.response?.data?.message || 'Booking failed');
        } finally {
            setBookingProcessing(false);
        }
    };

    if (loading && turfs.length === 0) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <div className="loader" style={{ borderColor: 'var(--primary)', borderBottomColor: 'transparent', width: '40px', height: '40px' }}></div>
            <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>Setting up your turf...</p>
        </div>
    );

    return (
        <div className="fade-in" style={{ paddingBottom: '60px', maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
            {/* Header / Search Section */}
            <header style={{ marginBottom: '60px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '45px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                            <span style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', background: 'rgba(16, 185, 129, 0.1)', padding: '6px 14px', borderRadius: '30px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>Tactical Overview</span>
                            <div style={{ width: '40px', height: '1px', background: 'rgba(0,0,0,0.1)' }}></div>
                        </div>
                        <h1 style={{ fontSize: '4rem', marginBottom: '10px', color: 'var(--text-primary)', fontWeight: '900', letterSpacing: '-2.5px', lineHeight: '0.9' }}>
                            WELCOME, <span className="text-glow" style={{ color: 'var(--primary)' }}>{player?.full_name?.split(' ')[0].toUpperCase() || 'ATHLETE'}</span>!
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', fontWeight: '500', maxWidth: '600px' }}>Your next victory starts here. Scouts have identified prime openings across the sector.</p>
                    </div>
                </div>

                <div className="glass-heavy" style={{ padding: '12px', borderRadius: '28px', display: 'flex', flexWrap: 'wrap', gap: '15px', border: '1px solid var(--border-subtle)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)' }}>
                    <div style={{ flex: '2', minWidth: '300px', position: 'relative', display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.02)', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <FiSearch style={{ position: 'absolute', left: '25px', color: 'var(--primary)' }} size={20} />
                        <input
                            placeholder="Locate turf by name, sport, or territory..."
                            value={searchLocation}
                            onChange={(e) => setSearchLocation(e.target.value)}
                            style={{
                                paddingLeft: '65px',
                                height: '65px',
                                marginBottom: 0,
                                borderRadius: '20px',
                                background: 'transparent',
                                border: 'none',
                                fontSize: '1.15rem',
                                fontWeight: '700'
                            }}
                        />
                    </div>
                    <div style={{ flex: '1.2', minWidth: '250px', display: 'flex', gap: '12px' }}>
                        <select
                            value={filters.sport}
                            onChange={(e) => setFilters({ ...filters, sport: e.target.value })}
                            style={{ flex: 1, marginBottom: 0, borderRadius: '20px', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', color: 'var(--text-primary)', padding: '0 25px', fontWeight: '800', height: '65px', fontSize: '0.95rem' }}
                        >
                            <option value="All">All Disciplines</option>
                            <option value="cricket">Cricket</option>
                            <option value="football">Football</option>
                            <option value="badminton">Badminton</option>
                        </select>
                        <select
                            value={filters.minRating}
                            onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
                            style={{ flex: 1, marginBottom: 0, borderRadius: '20px', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', color: 'var(--text-primary)', padding: '0 25px', fontWeight: '800', height: '65px', fontSize: '0.95rem' }}
                        >
                            <option value="0">Any Rating</option>
                            <option value="4">4.0+ Performance</option>
                            <option value="4.5">4.5+ Elite</option>
                        </select>
                    </div>
                </div>
            </header>

            <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '40px' }}>
                {/* Main Content Area */}
                <div>
                    {/* Horizontal Sports Filter */}
                    <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '20px', marginBottom: '30px' }} className="hide-scrollbar">
                        {['All', 'Football', 'Cricket', 'Badminton', 'Tennis', 'Squash'].map(s => (
                            <button
                                key={s}
                                onClick={() => setFilters({ ...filters, sport: s.toLowerCase() === 'all' ? 'All' : s.toLowerCase() })}
                                style={{
                                    padding: '12px 28px',
                                    borderRadius: '30px',
                                    background: (filters.sport === s.toLowerCase() || (s === 'All' && filters.sport === 'All')) ? 'var(--primary)' : 'rgba(0,0,0,0.02)',
                                    color: (filters.sport === s.toLowerCase() || (s === 'All' && filters.sport === 'All')) ? 'var(--bg-page)' : 'var(--text-primary)',
                                    fontWeight: '800',
                                    whiteSpace: 'nowrap',
                                    border: (filters.sport === s.toLowerCase() || (s === 'All' && filters.sport === 'All')) ? '1px solid var(--primary)' : '1px solid rgba(0,0,0,0.08)',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    {/* Nearby Turfs Section */}
                    <section style={{ marginBottom: '50px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                            <h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '15px', color: 'var(--text-primary)' }}>
                                <FiTrendingUp color="var(--primary)" /> Elite Turf
                            </h2>
                            <Link to="/player/turfs" style={{ fontSize: '1rem', color: 'var(--primary)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px' }}>Explore All <FiChevronRight /></Link>
                        </div>
                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
                            {turfs.slice(0, 4).map(turf => (
                                <div key={turf._id} className="glass card-hover" style={{ borderRadius: '28px', overflow: 'hidden', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)', padding: '15px' }} onClick={() => navigate(`/turf/${turf._id}`)}>
                                    <div style={{ height: '200px', borderRadius: '18px', position: 'relative', overflow: 'hidden', backgroundColor: '#1e293b' }}>
                                        <img
                                            src={turf.image_url || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop'}
                                            alt={turf.turf_name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop' }}
                                        />
                                        <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', color: 'white' }}>
                                            <FiStar color="var(--warning)" fill="var(--warning)" size={14} /> {turf.rating || 4.8}
                                        </div>
                                    </div>
                                    <div style={{ padding: '20px 5px 5px' }}>
                                        <div onClick={() => navigate(`/turf/${turf._id}`)}>
                                            <h4 style={{ marginBottom: '8px', fontSize: '1.3rem', color: 'var(--text-primary)' }}>{turf.turf_name}</h4>
                                            <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', marginBottom: '20px' }}>
                                                <FiMapPin size={16} color="var(--primary)" /> {turf.location}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px', gap: '10px' }}>
                                            <div style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '1.1rem' }}>{formatINR(turf.starting_price || 800)}<span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}> /hr</span></div>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); openQuickBook(turf); }}
                                                className="btn btn-primary" 
                                                style={{ height: '40px', padding: '0 15px', fontSize: '0.75rem', borderRadius: '12px' }}
                                            >
                                                QUICK BOOK
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {turfs.length === 0 && (
                                <div className="glass" style={{ gridColumn: '1/-1', padding: '100px 40px', textAlign: 'center', color: 'var(--text-secondary)', borderRadius: '32px' }}>
                                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🏟️</div>
                                    <h3 style={{ color: 'var(--text-primary)' }}>No Turf Found</h3>
                                    <p>Try refining your search or changing the sports filter.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Price Range Filter Visual */}
                    <section style={{ marginBottom: '40px' }}>
                        <div className="glass" style={{ padding: '35px', borderRadius: '32px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: 'var(--bg-page)', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', right: '-20px', top: '-20px', fontSize: '12rem', opacity: 0.1, color: 'white' }}><FiDollarSign /></div>
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                                    <div>
                                        <h2 style={{ color: 'var(--bg-page)', marginBottom: '5px', fontSize: '1.8rem' }}>Elite Play, Any Budget</h2>
                                        <p style={{ opacity: 0.9, fontSize: '1rem', fontWeight: '600' }}>Filter turf by your hourly power play.</p>
                                    </div>
                                    <div style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px' }}>{formatINR(filters.priceRange)}</div>
                                </div>
                                <input
                                    type="range" min="300" max="2500" step="100"
                                    value={filters.priceRange}
                                    onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                                    style={{ accentColor: 'var(--bg-page)', height: '8px', padding: 0, width: '100%' }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '15px', opacity: 0.9, fontWeight: '800' }}>
                                    <span>{formatINR(300)}</span>
                                    <span>{formatINR(2500)}</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar - Bookings & Activity */}
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    {/* Upcoming Booking Card */}
                    <section>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)' }}>
                            <FiCalendar color="var(--primary)" /> Next Game
                        </h3>
                        {dashboardData.upcoming ? (
                            <div className="glass" style={{ padding: '25px', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '24px', background: 'rgba(16, 185, 129, 0.03)' }}>
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>Turf Ready</div>
                                    <div style={{ fontWeight: '800', fontSize: '1.3rem', color: 'var(--text-primary)' }}>{dashboardData.upcoming.turf_id?.turf_name}</div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '20px', marginBottom: '25px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px' }}>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '5px' }}>Time</div>
                                            {formatTime(dashboardData.upcoming.slot_ids?.[0]?.start_time)}
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '5px' }}>Date</div>
                                            <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-primary)' }}>{formatDate(dashboardData.upcoming.slot_ids?.[0]?.date)}</div>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        className="btn btn-primary"
                                        style={{ flex: 1, height: '50px', justifyContent: 'center' }}
                                        onClick={() => navigate(`/turf/${dashboardData.upcoming.turf_id?._id}`)}
                                    >
                                        Turf Details
                                    </button>
                                    <button
                                        className="btn btn-outline"
                                        style={{ width: '50px', height: '50px', color: 'var(--danger)', borderRadius: '15px' }}
                                        onClick={() => handleCancel(dashboardData.upcoming)}
                                    >
                                        <FiXCircle size={20} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="glass" style={{ padding: '40px 20px', textAlign: 'center', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: '3.5rem', marginBottom: '15px' }}>🏟️</div>
                                <h4 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>No Matches Booked</h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>The pitch is waiting for its hero.</p>
                                <button className="btn btn-outline" style={{ width: '100%', height: '50px' }} onClick={() => navigate('/player/turfs')}>Browse Venues</button>
                            </div>
                        )}
                    </section>

                    {/* Availability Today Quick List */}
                    <section>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)' }}>
                            <FiPlay color="var(--primary)" /> Play Today
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {availableToday.slice(0, 3).map(turf => (
                                <div key={turf._id} className="glass card-hover" style={{ padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '800', fontSize: '1rem', marginBottom: '4px', color: 'var(--text-primary)' }}>{turf.turf_name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{turf.next_slot ? formatTime(turf.next_slot) : 'Now'}</span> • {formatINR(turf.starting_price)}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/turf/${turf._id}`)}
                                        style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(0,0,0,0.02)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,0,0,0.08)' }}
                                    >
                                        <FiChevronRight size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Booking History Short List */}
                    <section>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)' }}>
                            <FiCheckCircle color="var(--text-secondary)" /> Past Games
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {dashboardData.history.slice(0, 3).map(b => (
                                <div key={b._id} style={{ display: 'flex', gap: '15px', alignItems: 'center', padding: '5px' }}>
                                    <div style={{ width: '45px', height: '45px', borderRadius: '15px', background: b.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        {b.status === 'completed' ? '🏆' : '❌'}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{b.turf_id?.turf_name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{b.slot_ids?.[0]?.date ? formatDate(b.slot_ids[0].date) : 'Past Match'}</div>
                                    </div>
                                    <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)' }}>{formatINR(b.slot_ids?.reduce((s, slot) => s + slot.price, 0) || 0)}</div>
                                </div>
                            ))}
                            <Link to="/my-bookings" style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--primary)', fontWeight: '800', marginTop: '15px', padding: '12px', borderRadius: '15px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>Full History →</Link>
                        </div>
                    </section>
                </aside>
            </div>

            {/* Quick Book Modal */}
            {quickBookTurf && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="glass-heavy fade-in" style={{ width: '100%', maxWidth: '500px', borderRadius: '35px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 40px 100px rgba(0,0,0,0.5)' }}>
                        <div style={{ padding: '35px', textAlign: 'center' }}>
                            <div style={{ width: '60px', height: '60px', background: 'var(--primary)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#0f172a' }}>
                                <GiSoccerBall size={32} />
                            </div>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '5px' }}>Quick Deployment</h2>
                            <p style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>{quickBookTurf.turf_name} • Today</p>
                        </div>

                        <div style={{ padding: '0 35px 35px' }}>
                            <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '10px' }} className="custom-scrollbar">
                                {loadingQuickSlots ? (
                                    <div style={{ textAlign: 'center', padding: '40px' }}><div className="loader"></div></div>
                                ) : quickSlots.length > 0 ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                                        {quickSlots.map(slot => (
                                            <button
                                                key={slot._id}
                                                disabled={slot.status !== 'available'}
                                                onClick={() => setSelectedQuickSlot(slot)}
                                                style={{
                                                    padding: '15px 5px',
                                                    borderRadius: '16px',
                                                    border: selectedQuickSlot?._id === slot._id ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)',
                                                    background: selectedQuickSlot?._id === slot._id ? 'rgba(16, 185, 129, 0.1)' : (slot.status === 'available' ? 'rgba(255,255,255,0.02)' : 'rgba(239, 68, 68, 0.05)'),
                                                    color: slot.status === 'available' ? 'var(--text-primary)' : 'rgba(239, 68, 68, 0.5)',
                                                    cursor: slot.status === 'available' ? 'pointer' : 'not-allowed',
                                                    textAlign: 'center',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                <div style={{ fontWeight: '800', fontSize: '1rem' }}>{formatTime(slot.start_time)}</div>
                                                <div style={{ fontSize: '0.65rem', fontWeight: '700', marginTop: '4px', textTransform: 'uppercase' }}>{formatINR(slot.price)}</div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                                        <FiXCircle size={40} style={{ opacity: 0.3, marginBottom: '15px' }} />
                                        <p>No openings detected for today.</p>
                                    </div>
                                )}
                            </div>

                            <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
                                <button
                                    onClick={() => setQuickBookTurf(null)}
                                    className="btn-outline"
                                    style={{ flex: '1', height: '55px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}
                                >
                                    ABORT
                                </button>
                                <button
                                    disabled={!selectedQuickSlot || bookingProcessing}
                                    onClick={handleQuickBooking}
                                    className="btn btn-primary"
                                    style={{ flex: '2', height: '55px', borderRadius: '16px', fontSize: '1rem', opacity: (!selectedQuickSlot || bookingProcessing) ? 0.6 : 1 }}
                                >
                                    {bookingProcessing ? 'ENCRYPTING...' : 'CONFIRM BOOKING'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlayerDashboard;
