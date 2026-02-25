import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiMapPin, FiActivity, FiDollarSign, FiClock, FiArrowRight, FiFilter } from 'react-icons/fi';

const TurfSearch = () => {
    const [turfs, setTurfs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        name: '',
        location: '',
        sport_type: 'All',
        max_price: 2000,
        available_today: false
    });
    const navigate = useNavigate();

    const fetchTurfs = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                name: filters.name,
                location: filters.location,
                sport_type: filters.sport_type,
                max_price: filters.max_price,
                available_today: filters.available_today
            }).toString();
            const res = await axios.get(`https://bookmyturff.onrender.com/api/turfs?${query}`);
            setTurfs(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(fetchTurfs, 500);
        return () => clearTimeout(timer);
    }, [filters]);

    return (
        <div className="fade-in" style={{ paddingBottom: '60px' }}>
            <header style={{ marginBottom: '60px', textAlign: 'center', paddingTop: '40px' }}>
                <div style={{ marginBottom: '20px' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '4px', background: 'rgba(16, 185, 129, 0.1)', padding: '8px 20px', borderRadius: '40px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>Tactical Arena Scouting</span>
                </div>
                <h1 style={{ fontSize: '4rem', color: 'var(--text-primary)', fontWeight: '900', letterSpacing: '-2px', lineHeight: '1' }}>ELITE <span className="text-glow" style={{ color: 'var(--primary)' }}>ARENA</span> FINDER</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginTop: '15px', fontWeight: '500' }}>Direct access to professional-grade sports venues.</p>
            </header>

            {/* Filter Bar */}
            <div className="glass-heavy" style={{ padding: '30px', borderRadius: '32px', marginBottom: '60px', display: 'flex', flexWrap: 'wrap', gap: '25px', alignItems: 'flex-end', position: 'sticky', top: '100px', zIndex: 100, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                <div style={{ flex: '1.5', minWidth: '200px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}><FiSearch size={16} color="var(--primary)" /> Arena Name</label>
                    <input
                        placeholder="Search arenas..."
                        value={filters.name}
                        onChange={e => setFilters({ ...filters, name: e.target.value })}
                        style={{ marginBottom: 0, background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.08)', color: 'var(--text-primary)', height: '55px', borderRadius: '15px' }}
                    />
                </div>
                <div style={{ flex: '1', minWidth: '150px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}><FiMapPin size={16} color="var(--primary)" /> Territory</label>
                    <input
                        placeholder="Location..."
                        value={filters.location}
                        onChange={e => setFilters({ ...filters, location: e.target.value })}
                        style={{ marginBottom: 0, background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.08)', color: 'var(--text-primary)', height: '55px', borderRadius: '15px' }}
                    />
                </div>
                <div style={{ flex: '0.8', minWidth: '150px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}><FiActivity size={16} color="var(--primary)" /> Discipline</label>
                    <select
                        value={filters.sport_type}
                        onChange={e => setFilters({ ...filters, sport_type: e.target.value })}
                        style={{ marginBottom: 0, background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.08)', height: '55px', borderRadius: '15px', color: 'var(--text-primary)' }}
                    >
                        <option style={{ background: '#0f172a' }}>All</option>
                        <option style={{ background: '#0f172a' }}>5s football</option>
                        <option style={{ background: '#0f172a' }}>7s football</option>
                        <option style={{ background: '#0f172a' }}>cricket</option>
                        <option style={{ background: '#0f172a' }}>badminton</option>
                        <option style={{ background: '#0f172a' }}>multi-sport</option>
                    </select>
                </div>
                <div style={{ flex: '1', minWidth: '200px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}><FiDollarSign size={16} color="var(--primary)" /> Budget Cap</label>
                        <span style={{ color: 'var(--primary)', fontWeight: '900', fontSize: '0.85rem' }}>₹{filters.max_price}</span>
                    </div>
                    <input
                        type="range" min="300" max="2500" step="100"
                        value={filters.max_price}
                        onChange={e => setFilters({ ...filters, max_price: e.target.value })}
                        style={{ marginBottom: 0, padding: 0, accentColor: 'var(--primary)' }}
                    />
                </div>
                <div style={{ paddingBottom: '5px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', cursor: 'pointer', userSelect: 'none', color: 'var(--text-primary)', fontWeight: '700' }}>
                        <input
                            type="checkbox"
                            checked={filters.available_today}
                            onChange={e => setFilters({ ...filters, available_today: e.target.checked })}
                            style={{ margin: 0, width: '22px', height: '22px', accentColor: 'var(--primary)' }}
                        />
                        Live Availability
                    </label>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '150px' }}>
                    <div className="loader" style={{ width: '60px', height: '60px' }}></div>
                    <p style={{ marginTop: '30px', color: 'var(--text-secondary)', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.8rem' }}>Scanning Terrain...</p>
                </div>
            ) : (
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
                    {turfs.map(turf => (
                        <div key={turf._id} className="glass card-hover" style={{ borderRadius: '32px', overflow: 'hidden', padding: '15px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                            <div style={{ height: '220px', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                                <img
                                    src={turf.image_url || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop'}
                                    alt={turf.turf_name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 15px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    {turf.sport_type}
                                </div>
                            </div>
                            <div style={{ padding: '25px 5px 10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                    <div>
                                        <h4 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', fontWeight: '800' }}>{turf.turf_name}</h4>
                                        <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', marginTop: '5px', fontWeight: '600' }}>
                                            <FiMapPin size={16} color="var(--primary)" /> {turf.location}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: '900', color: 'var(--primary)', fontSize: '1.4rem' }}>₹{turf.starting_price}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>Per Hour</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                                    <div className="glass" style={{ flex: 1, padding: '15px', background: 'rgba(0,0,0,0.02)', borderRadius: '18px', border: '1px solid rgba(0,0,0,0.05)' }}>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800', marginBottom: '5px' }}>Live Slots</div>
                                        <div style={{ fontWeight: '900', fontSize: '0.95rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <FiClock size={14} color="var(--primary)" /> {turf.available_slots_today} Available
                                        </div>
                                    </div>
                                    <div className="glass" style={{ flex: 1, padding: '15px', background: 'rgba(0,0,0,0.02)', borderRadius: '18px', border: '1px solid rgba(0,0,0,0.05)' }}>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800', marginBottom: '5px' }}>Next Session</div>
                                        <div style={{ fontWeight: '900', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{turf.next_slot || '--:--'}</div>
                                    </div>
                                </div>

                                <button
                                    className="btn btn-primary"
                                    style={{ width: '100%', height: '60px', borderRadius: '18px', fontSize: '1.05rem' }}
                                    onClick={() => navigate(`/turf/${turf._id}`)}
                                >
                                    Instant Book <FiArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {turfs.length === 0 && (
                        <div className="glass" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '120px 40px', borderRadius: '40px', border: '1px solid rgba(0,0,0,0.05)' }}>
                            <div style={{ fontSize: '5rem', marginBottom: '25px', opacity: 0.3 }}><FiFilter /></div>
                            <h2 style={{ fontSize: '2.5rem', color: 'var(--text-primary)', fontWeight: '900', letterSpacing: '-1px' }}>No Arenas Detected</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginTop: '10px' }}>Try recalibrating your search filters or scouting another sector.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TurfSearch;
