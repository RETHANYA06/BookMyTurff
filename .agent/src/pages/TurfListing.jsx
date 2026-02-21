import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiMapPin, FiStar, FiActivity, FiDollarSign, FiClock, FiArrowRight, FiNavigation, FiInfo } from 'react-icons/fi';

const TurfListing = () => {
    const { player } = useContext(AuthContext);
    const [turfs, setTurfs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Get user location for distance calculation
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                () => {
                    console.log("Location access denied. Using default city location.");
                    setUserLocation({ lat: 19.0760, lng: 72.8777 }); // Default to Mumbai
                }
            );
        }

        const fetchTurfs = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/turfs');
                setTurfs(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTurfs();
    }, []);

    // Haversine formula for distance
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return "1.2 km"; // Fallback mock distance
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d.toFixed(1) + " km";
    };

    if (loading) return (
        <div style={{ textAlign: 'center', padding: '100px' }}>
            <div className="loader" style={{ margin: '0 auto', borderColor: 'var(--primary)', borderBottomColor: 'transparent' }}></div>
            <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>Scouting for premium turfs...</p>
        </div>
    );

    return (
        <div className="fade-in" style={{ paddingBottom: '60px' }}>
            <header style={{ marginBottom: '60px', textAlign: 'center', paddingTop: '40px' }}>
                <div style={{ marginBottom: '20px' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '4px', background: 'rgba(16, 185, 129, 0.1)', padding: '8px 20px', borderRadius: '40px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>Geo-Located Venues</span>
                </div>
                <h1 style={{ fontSize: '4rem', color: 'var(--text-primary)', fontWeight: '900', letterSpacing: '-2px', lineHeight: '1' }}>LOCAL <span className="text-glow" style={{ color: 'var(--primary)' }}>ARENAS</span></h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginTop: '15px', fontWeight: '500' }}>Precision engineered pitches in your immediate vicinity.</p>
            </header>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '35px' }}>
                {turfs.map(turf => (
                    <div key={turf._id} className="glass card-hover" style={{ borderRadius: '32px', overflow: 'hidden', padding: '18px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        {/* Image Section */}
                        <div style={{ height: '240px', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                            <img
                                src={turf.image_url || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop'}
                                alt={turf.turf_name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '10px' }}>
                                <div className="glass" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <FiStar color="#f59e0b" fill="#f59e0b" size={14} />
                                    <span style={{ color: 'white', fontWeight: '800', fontSize: '0.85rem' }}>{turf.rating || 4.8}</span>
                                </div>
                                <div style={{ background: 'var(--primary)', color: '#0f172a', padding: '6px 15px', borderRadius: '10px', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    {turf.sport_type}
                                </div>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div style={{ padding: '25px 5px 10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', fontWeight: '800', marginBottom: '5px' }}>{turf.turf_name}</h3>
                                    <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: '600' }}>
                                        <FiMapPin size={16} color="var(--primary)" /> {turf.location}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--primary)' }}>₹{turf.starting_price}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Per Hour</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '15px', margin: '25px 0' }}>
                                <div className="glass" style={{ flex: 1, padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FiNavigation size={18} color="var(--primary)" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800' }}>Distance</div>
                                        <div style={{ fontWeight: '900', fontSize: '1rem', color: 'var(--text-primary)' }}>
                                            {calculateDistance(userLocation?.lat, userLocation?.lng, turf.coordinates?.lat, turf.coordinates?.lng)}
                                        </div>
                                    </div>
                                </div>
                                <div className="glass" style={{ flex: 1, padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FiClock size={18} color="var(--primary)" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800' }}>Live Slots</div>
                                        <div style={{ fontWeight: '900', fontSize: '1rem', color: 'var(--text-primary)' }}>{turf.available_slots_today || 0} Available</div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(`/turf/${turf._id}`)}
                                className="btn btn-primary"
                                style={{ width: '100%', height: '65px', borderRadius: '20px', fontSize: '1.1rem' }}
                            >
                                Secure Slot <FiArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                ))}

                {turfs.length === 0 && (
                    <div className="glass" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '120px 40px', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <FiInfo size={60} style={{ marginBottom: '25px', opacity: 0.3, color: 'var(--primary)' }} />
                        <h2 style={{ fontSize: '2.5rem', color: 'var(--text-primary)', fontWeight: '900' }}>No Arenas Detected</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginTop: '10px' }}>We couldn't locate any active turfs in your current sector. Try expanding your search area.</p>
                        <button className="btn btn-primary" style={{ marginTop: '40px', height: '60px', padding: '0 40px' }} onClick={() => window.location.reload()}>Scanner Refresh</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TurfListing;
