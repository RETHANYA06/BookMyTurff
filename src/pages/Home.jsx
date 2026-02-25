import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FiMapPin, FiClock, FiUsers, FiArrowRight, FiSearch } from 'react-icons/fi';
import API_BASE_URL from '../config/api';
import { formatINR, formatTime } from '../utils/formatters';

const Home = () => {
    const [turfs, setTurfs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchTurfs = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/turfs`);
                setTurfs(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTurfs();
    }, []);

    const filteredTurfs = turfs.filter(t =>
        t.turf_name.toLowerCase().includes(search.toLowerCase()) ||
        t.location.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div className="loader"></div>
                <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>Scouting for the best pitches...</p>
            </div>
        );
    }

    return (
        <div className="fade-in">
            {/* Hero Section */}
            <div style={{
                position: 'relative',
                padding: '160px 0 120px',
                textAlign: 'center',
                overflow: 'hidden'
            }}>
                <div className="animate-float" style={{
                    position: 'absolute',
                    top: '-10%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '80%',
                    height: '500px',
                    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
                    zIndex: -1,
                    filter: 'blur(40px)'
                }} />

                <div style={{ marginBottom: '25px' }}>
                    <span style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: 'var(--primary)',
                        padding: '10px 24px',
                        borderRadius: '40px',
                        fontWeight: '800',
                        fontSize: '0.9rem',
                        textTransform: 'uppercase',
                        letterSpacing: '3px',
                        border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}>The Future of Sports Management</span>
                </div>

                <h1 style={{ fontSize: '5.5rem', marginTop: '10px', marginBottom: '25px', lineHeight: '0.9', color: 'var(--text-primary)', fontWeight: '900', letterSpacing: '-3px' }}>
                    BOOK YOUR <span className="text-glow" style={{ color: 'var(--primary)' }}>TURF</span>.
                </h1>

                <p style={{ color: 'var(--text-secondary)', fontSize: '1.4rem', maxWidth: '800px', margin: '0 auto 60px', fontWeight: '500', lineHeight: '1.4' }}>
                    Access world-class turf with zero friction. Premium venues, professional-grade quality, instant digital booking.
                </p>

                <div style={{ maxWidth: '850px', margin: '0 auto', position: 'relative' }}>
                    <div className="glass-heavy" style={{ padding: '12px', borderRadius: '28px', display: 'flex', gap: '15px', border: '1px solid var(--border-subtle)', boxShadow: '0 30px 60px rgba(0,0,0,0.05)' }}>
                        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <FiSearch size={22} style={{ position: 'absolute', left: '25px', color: 'var(--primary)' }} />
                            <input
                                placeholder="Locate your next turf..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{
                                    paddingLeft: '65px',
                                    height: '65px',
                                    marginBottom: 0,
                                    background: 'transparent',
                                    border: 'none',
                                    fontSize: '1.2rem',
                                    fontWeight: '700',
                                    width: '100%'
                                }}
                            />
                        </div>
                        <button className="btn btn-primary" style={{ height: '65px', padding: '0 45px', fontSize: '1.1rem' }}>Find Turf</button>
                    </div>
                </div>
            </div>


            {/* Turf List */}
            <div className="container">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '60px' }}>
                    <div>
                        <span style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', display: 'block' }}>Curated Selections</span>
                        <h2 style={{ fontSize: '4.5rem', color: 'var(--text-primary)', marginTop: '15px', marginBottom: '20px' }}>Top <span style={{ color: 'var(--primary)' }}>Turf</span></h2>
                    </div>
                    <Link to="/player/turfs" style={{ fontSize: '1.1rem', color: 'var(--primary)', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', background: 'rgba(16, 185, 129, 0.05)', padding: '12px 25px', borderRadius: '30px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                        Browse Global List <FiArrowRight />
                    </Link>
                </div>

                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '35px' }}>
                    {filteredTurfs.slice(0, 6).map(turf => (
                        <div key={turf._id} className="glass card-hover" style={{ overflow: 'hidden', padding: '18px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{
                                height: '280px',
                                backgroundColor: '#1e293b', // Dark fallback
                                backgroundImage: `linear-gradient(rgba(0,0,0,0.0), rgba(0,0,0,0.8)), url("${turf.image_url || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop'}")`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                borderRadius: '24px',
                                position: 'relative'
                            }}>
                                <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                                    <span className="badge" style={{ background: 'var(--primary)', color: '#0f172a', fontWeight: '900' }}>{turf.sport_type || 'Football'}</span>
                                </div>
                                <div style={{ position: 'absolute', bottom: '25px', left: '25px', right: '25px' }}>
                                    <h3 style={{
                                        fontSize: '2rem',
                                        color: 'white',
                                        fontWeight: '900',
                                        marginBottom: '5px',
                                        textShadow: '0 4px 12px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.5)'
                                    }}>
                                        {turf.turf_name}
                                    </h3>
                                    <p style={{
                                        color: 'rgba(255,255,255,0.9)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                                    }}>
                                        <FiMapPin color="var(--primary)" /> {turf.location}
                                    </p>
                                </div>
                            </div>

                            <div style={{ padding: '25px 5px 10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', gap: '20px' }}>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800', marginBottom: '3px' }}>Capacity</div>
                                            <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <FiUsers color="var(--primary)" size={16} /> {turf.max_players || 22}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800', marginBottom: '3px' }}>Hours</div>
                                            <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <FiClock color="var(--primary)" size={16} /> {formatTime(turf.opening_time)} - {formatTime(turf.closing_time)}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800', marginBottom: '3px' }}>Starting From</div>
                                        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--primary)' }}>{formatINR(turf.starting_price || turf.base_price || 500)}</div>
                                    </div>
                                </div>

                                <Link to={`/turf/${turf._id}`} className="btn btn-primary" style={{ width: '100%', height: '60px', borderRadius: '18px', fontSize: '1.1rem' }}>
                                    Reserve Slot <FiArrowRight size={20} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredTurfs.length === 0 && (
                    <div className="glass" style={{ textAlign: 'center', padding: '120px 40px', borderRadius: '40px' }}>
                        <div style={{ fontSize: '5rem', marginBottom: '25px', opacity: 0.5 }}>🏟️</div>
                        <h2 style={{ color: 'var(--text-primary)', fontSize: '2.5rem' }}>Turf Not Found</h2>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '10px', fontSize: '1.2rem' }}>Our scouts couldn't find matches for this query. Try a different location.</p>
                    </div>
                )}
            </div>

            {/* CTA Footer */}
            <div className="container" style={{ marginTop: '140px', paddingBottom: '100px' }}>
                <div className="glass-heavy animate-float" style={{
                    padding: '100px 50px',
                    borderRadius: '50px',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid rgba(16, 185, 129, 0.15)'
                }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 70% 30%, rgba(16, 185, 129, 0.05) 0%, transparent 60%)', zIndex: -1 }}></div>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <span style={{ color: 'var(--primary)', fontWeight: '900', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '4px' }}>Partner with us</span>
                        <h2 style={{ fontSize: '4rem', marginBottom: '25px', color: 'var(--text-primary)', marginTop: '20px', lineHeight: '1' }}>OWN AN ELITE TURF?</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.4rem', maxWidth: '700px', margin: '0 auto 50px', fontWeight: '500' }}>
                            Transform your venue into a high-performance business. Professional management tools, instant payouts, and global reach.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                            <Link to="/owner-register" className="btn btn-primary" style={{ padding: '20px 50px', fontSize: '1.2rem', borderRadius: '25px' }}>
                                Register as Partner <FiArrowRight />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
