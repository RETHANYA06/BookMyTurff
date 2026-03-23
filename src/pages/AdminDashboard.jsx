import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { FiMonitor, FiActivity, FiUser, FiUsers, FiCalendar, FiClock, FiCheckCircle, FiXCircle, FiInfo, FiSmartphone, FiMail, FiLock, FiKey, FiPlus, FiArrowLeft, FiEye, FiEyeOff } from 'react-icons/fi';
import API_BASE_URL from '../config/api';
import { formatINR, formatDate, formatTime } from '../utils/formatters';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [searchParams, setSearchParams] = useSearchParams();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFilter, setSelectedFilter] = useState('total');
    const resultsRef = useRef(null);
    const [creatingOwner, setCreatingOwner] = useState(false);
    const [ownerData, setOwnerData] = useState({ name: '', phone_number: '', registration_id: '', email: '', password: '' });
    const [ownerAccounts, setOwnerAccounts] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [loadingOwners, setLoadingOwners] = useState(false);
    const showOwners = searchParams.get('view') === 'owners';
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        completed: 0,
        cancelled: 0,
        revenue: 0
    });

    const handleCreateOwner = async (e) => {
        e.preventDefault();
        setCreatingOwner(true);
        try {
            const token = localStorage.getItem('token');
            // Auto-generate Registration ID as requested
            const submissionData = { 
                ...ownerData, 
                registration_id: `TRF-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}` 
            };
            await axios.post(`${API_BASE_URL}/api/admin/create-owner`, submissionData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Owner account deployed successfully');
            setOwnerData({ name: '', phone_number: '', registration_id: '', email: '', password: '' });
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create owner');
        } finally {
            setCreatingOwner(false);
        }
    };

    const fetchAllBookings = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/bookings/admin/all`);
            setBookings(res.data);

            // Calculate Stats
            const newStats = res.data.reduce((acc, b) => {
                acc.total++;
                if (b.status === 'pending_payment') acc.pending++;
                if (b.status === 'completed') acc.completed++;
                if (b.status === 'cancelled') acc.cancelled++;
                const totalPrice = b.slot_ids?.reduce((sum, s) => sum + (s.price || 0), 0) || 0;
                if (b.status !== 'cancelled') {
                    acc.revenue += totalPrice;
                }
                return acc;
            }, { total: 0, pending: 0, completed: 0, cancelled: 0, revenue: 0 });

            setStats(newStats);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterClick = (filterId) => {
        setSelectedFilter(filterId);
        if (resultsRef.current) {
            resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const fetchOwnerAccounts = async () => {
        setLoadingOwners(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/api/admin/owners`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOwnerAccounts(res.data);
        } catch (err) {
            console.error('Error fetching owners:', err);
        } finally {
            setLoadingOwners(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchAllBookings();
            if (showOwners) fetchOwnerAccounts();
        }
    }, [user, showOwners]);

    if (user?.role !== 'admin') return <div style={{ textAlign: 'center', padding: '100px' }}>Access Denied</div>;

    if (showOwners) {
        return (
            <div className="fade-in" style={{ paddingBottom: '50px' }}>
                <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <FiUsers color="var(--primary)" /> Owner Accounts
                        </h1>
                        <p style={{ color: 'var(--text-secondary)' }}>All turf owner accounts created by the admin.</p>
                    </div>
                    <button
                        onClick={() => setSearchParams({})}
                        className="btn btn-outline"
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 28px', borderRadius: '18px', fontWeight: '800', fontSize: '0.95rem' }}
                    >
                        <FiArrowLeft size={20} /> Back to Dashboard
                    </button>
                </div>

                {loadingOwners ? (
                    <div style={{ textAlign: 'center', padding: '80px' }}><div className="loader"></div></div>
                ) : ownerAccounts.length === 0 ? (
                    <div className="glass-heavy" style={{ textAlign: 'center', padding: '80px', borderRadius: '35px' }}>
                        <FiUsers size={60} color="var(--text-secondary)" style={{ opacity: 0.3, marginBottom: '20px' }} />
                        <h3 style={{ color: 'var(--text-secondary)', fontWeight: '700' }}>No Owner Accounts Yet</h3>
                        <p style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>Go back to the dashboard to create your first turf owner account.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '25px' }}>
                        {ownerAccounts.map((owner, idx) => (
                            <div
                                key={owner._id}
                                className="glass-heavy card-hover"
                                style={{
                                    padding: '35px',
                                    borderRadius: '28px',
                                    border: '1px solid rgba(16, 185, 129, 0.1)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    animation: `slideUp 0.5s ease ${idx * 0.08}s both`
                                }}
                            >
                                {/* Decorative corner accent */}
                                <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', background: 'linear-gradient(135deg, transparent 50%, rgba(16,185,129,0.06) 50%)', borderRadius: '0 28px 0 0' }}></div>

                                {/* Header with avatar */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '28px' }}>
                                    <div style={{
                                        width: '58px', height: '58px', borderRadius: '20px',
                                        background: 'linear-gradient(135deg, var(--primary) 0%, #059669 100%)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#fff', fontSize: '1.4rem', fontWeight: '900',
                                        boxShadow: '0 10px 25px rgba(16, 185, 129, 0.25)',
                                        flexShrink: 0
                                    }}>
                                        {owner.name?.charAt(0)?.toUpperCase() || 'O'}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h3 style={{ fontSize: '1.3rem', fontWeight: '900', margin: 0, letterSpacing: '-0.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {owner.name || 'Unnamed Owner'}
                                        </h3>
                                        <span className="badge" style={{
                                            background: 'rgba(16, 185, 129, 0.1)',
                                            color: 'var(--primary)',
                                            fontSize: '0.65rem',
                                            padding: '4px 10px',
                                            marginTop: '4px',
                                            display: 'inline-block'
                                        }}>
                                            TURF OWNER
                                        </span>
                                    </div>
                                </div>

                                {/* Details grid */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    {/* Phone */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '12px',
                                            background: 'rgba(16, 185, 129, 0.08)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <FiSmartphone size={18} color="var(--primary)" />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Mobile</div>
                                            <div style={{ fontWeight: '700', fontSize: '1rem', letterSpacing: '1px' }}>+91 {owner.phone_number || '—'}</div>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '12px',
                                            background: 'rgba(59, 130, 246, 0.08)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <FiMail size={18} color="var(--accent)" />
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Email</div>
                                            <div style={{ fontWeight: '600', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{owner.email || '—'}</div>
                                        </div>
                                    </div>

                                    {/* Registration ID */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '12px',
                                            background: 'rgba(245, 158, 11, 0.08)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <FiKey size={18} color="var(--warning)" />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Registration ID</div>
                                            <div style={{ fontWeight: '700', fontSize: '0.9rem', fontFamily: 'monospace', letterSpacing: '1px', color: 'var(--warning)' }}>{owner.registration_id || '—'}</div>
                                        </div>
                                    </div>

                                    {/* Turf Info */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '12px',
                                            background: owner.turf_id ? 'rgba(34, 197, 94, 0.08)' : 'rgba(0,0,0,0.03)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <FiMonitor size={18} color={owner.turf_id ? 'var(--success)' : 'var(--text-secondary)'} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Turf Assigned</div>
                                            <div style={{ fontWeight: '700', fontSize: '0.95rem', color: owner.turf_id ? 'var(--success)' : 'var(--text-secondary)' }}>
                                                {owner.turf_id?.turf_name || 'Not yet assigned'}
                                            </div>
                                            {owner.turf_id?.location && (
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{owner.turf_id.location}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer with creation date */}
                                <div style={{
                                    marginTop: '22px',
                                    paddingTop: '18px',
                                    borderTop: '1px solid rgba(0,0,0,0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        <FiCalendar size={14} />
                                        Created: {owner.createdAt ? new Date(owner.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                    </div>
                                    <span className="badge" style={{
                                        background: owner.turf_id ? '#dcfce7' : '#fef3c7',
                                        color: owner.turf_id ? '#166534' : '#92400e',
                                        fontSize: '0.65rem'
                                    }}>
                                        {owner.turf_id ? 'ACTIVE' : 'SETUP PENDING'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Total count footer */}
                {ownerAccounts.length > 0 && (
                    <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.9rem' }}>
                        Showing {ownerAccounts.length} owner account{ownerAccounts.length !== 1 ? 's' : ''}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="fade-in" style={{ paddingBottom: '50px' }}>
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <FiMonitor color="var(--primary)" /> Admin Control Center
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>Monitoring all turf activities across the platform.</p>
            </div>

            {/* Stats Overview */}
            <div className="grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px', marginBottom: '40px' }}>
                {[
                    { id: 'total', label: 'Total Bookings', value: stats.total, icon: <FiActivity />, color: 'var(--accent)' },
                    { id: 'pending', label: 'Pending Payment', value: stats.pending, icon: <FiInfo />, color: '#f59e0b' },
                    { id: 'completed', label: 'Completed', value: stats.completed, icon: <FiCheckCircle />, color: 'var(--success)' },
                    { id: 'cancelled', label: 'Cancelled', value: stats.cancelled, icon: <FiXCircle />, color: 'var(--danger)' },
                    { id: 'revenue', label: 'Platform Revenue', value: formatINR(stats.revenue), icon: <FiActivity />, color: 'var(--primary)' }
                ].map((s, i) => (
                    <div 
                        key={i} 
                        className={`glass card-hover ${selectedFilter === s.id ? 'active-stat' : ''}`} 
                        onClick={() => handleFilterClick(s.id)}
                        style={{ 
                            padding: '25px', 
                            borderLeft: `5px solid ${s.color}`,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            transform: selectedFilter === s.id ? 'translateY(-5px)' : 'none',
                            boxShadow: selectedFilter === s.id ? `0 10px 20px ${s.color}20` : 'none',
                            background: selectedFilter === s.id ? `${s.color}05` : 'rgba(255,255,255,0.7)'
                        }}
                    >
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                            {s.label} {s.icon}
                        </div>
                        <h2 style={{ fontSize: '1.8rem' }}>{s.value}</h2>
                        {selectedFilter === s.id && (
                            <div style={{ height: '3px', background: s.color, width: '40px', marginTop: '10px', borderRadius: '10px' }}></div>
                        )}
                    </div>
                ))}
            </div>

            {/* Create Owner Section - Premium Customized Version */}
            <div className="glass-heavy animate-slide-up" style={{ 
                padding: '60px', 
                marginBottom: '60px', 
                borderRadius: '45px',
                border: '1px solid rgba(16, 185, 129, 0.15)',
                background: 'linear-gradient(165deg, rgba(255,255,255,1) 0%, rgba(248,255,252,1) 100%)',
                boxShadow: '0 50px 120px -30px rgba(16, 185, 129, 0.08)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative background element */}
                <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)', opacity: 0.03, borderRadius: '50%' }}></div>

                <div style={{ marginBottom: '50px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    <div style={{ 
                        background: 'linear-gradient(135deg, var(--primary) 0%, #059669 100%)', 
                        width: '70px',
                        height: '70px',
                        borderRadius: '24px', 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        margin: '0 auto 25px',
                        boxShadow: '0 20px 40px rgba(16, 185, 129, 0.25)',
                    }}>
                        <FiUser size={32} />
                    </div>
                    <h2 style={{ fontSize: '2.2rem', fontWeight: '900', margin: '0 0 10px', color: 'var(--text-primary)', letterSpacing: '-1px' }}>
                        Initialize account for Turf Owner
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: '500', maxWidth: '600px', margin: '0 auto' }}>
                        Securely onboard a new strategic partner to the platform ecosystem.
                    </p>
                </div>

                <form onSubmit={handleCreateOwner} style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto' }}>
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '40px', marginBottom: '50px' }}>
                        
                        {/* Full Name */}
                        <div className="custom-input-group">
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Full Name</label>
                            <div style={{ 
                                background: '#fff', 
                                borderRadius: '22px', 
                                border: '1px solid rgba(0,0,0,0.06)', 
                                boxShadow: '0 5px 15px rgba(0,0,0,0.02)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                padding: '0 25px',
                                height: '70px',
                                transition: 'all 0.3s ease'
                            }}>
                                <FiUser style={{ color: 'var(--primary)', fontSize: '1.4rem', flexShrink: 0 }} />
                                <input 
                                    placeholder="" 
                                    value={ownerData.name} 
                                    onChange={e => setOwnerData({ ...ownerData, name: e.target.value })} 
                                    required 
                                    style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', height: '100%', padding: '0 20px', fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: 0, boxShadow: 'none' }}
                                />
                            </div>
                        </div>

                        {/* Mobile Number */}
                        <div className="custom-input-group">
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Mobile Number</label>
                            <div style={{ 
                                background: '#fff', 
                                borderRadius: '22px', 
                                border: '1px solid rgba(0,0,0,0.06)', 
                                boxShadow: '0 5px 15px rgba(0,0,0,0.02)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                padding: '0 25px',
                                height: '70px',
                                transition: 'all 0.3s ease'
                            }}>
                                <FiSmartphone style={{ color: 'var(--primary)', fontSize: '1.4rem', flexShrink: 0 }} />
                                <div style={{ display: 'flex', alignItems: 'center', marginLeft: '20px', width: '100%' }}>
                                    <span style={{ fontWeight: '900', color: 'var(--primary)', fontSize: '1.2rem', paddingRight: '15px', borderRight: '1px solid rgba(0,0,0,0.08)' }}>+91</span>
                                    <input 
                                        placeholder="" 
                                        value={ownerData.phone_number} 
                                        onChange={e => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            if (val.length <= 10) setOwnerData({ ...ownerData, phone_number: val });
                                        }} 
                                        required 
                                        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', height: '100%', padding: '0 15px', fontSize: '1.2rem', fontWeight: '700', letterSpacing: '2px', color: 'var(--text-primary)', marginBottom: 0, boxShadow: 'none' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Email Address */}
                        <div className="custom-input-group">
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Owner Email (Login ID)</label>
                            <div style={{ 
                                background: '#fff', 
                                borderRadius: '22px', 
                                border: '1px solid rgba(0,0,0,0.06)', 
                                boxShadow: '0 5px 15px rgba(0,0,0,0.02)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                padding: '0 25px',
                                height: '70px',
                                transition: 'all 0.3s ease'
                            }}>
                                <FiMail style={{ color: 'var(--primary)', fontSize: '1.4rem', flexShrink: 0 }} />
                                <input 
                                    type="email"
                                    placeholder="" 
                                    autoComplete="off"
                                    name="owner_email"
                                    value={ownerData.email} 
                                    onChange={e => setOwnerData({ ...ownerData, email: e.target.value })} 
                                    style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', height: '100%', padding: '0 20px', fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: 0, boxShadow: 'none' }}
                                />
                            </div>
                        </div>

                        {/* Access Password */}
                        <div className="custom-input-group">
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Owner Access Password</label>
                            <div style={{ 
                                background: '#fff', 
                                borderRadius: '22px', 
                                border: '1px solid rgba(0,0,0,0.06)', 
                                boxShadow: '0 5px 15px rgba(0,0,0,0.02)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                padding: '0 25px',
                                height: '70px',
                                transition: 'all 0.3s ease',
                                position: 'relative'
                            }}>
                                <FiLock style={{ color: 'var(--primary)', fontSize: '1.4rem', flexShrink: 0, zIndex: 1 }} />
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    placeholder="" 
                                    autoComplete="new-password"
                                    name="owner_password"
                                    value={ownerData.password} 
                                    onChange={e => setOwnerData({ ...ownerData, password: e.target.value })} 
                                    required 
                                    style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', height: '100%', padding: '0 20px', paddingRight: '50px', fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: 0, boxShadow: 'none' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0
                                    }}
                                >
                                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            disabled={creatingOwner} 
                            style={{ 
                                height: '70px', 
                                padding: '0 60px',
                                borderRadius: '24px', 
                                fontWeight: '900',
                                boxShadow: '0 25px 50px rgba(16, 185, 129, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '15px',
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                                fontSize: '1rem',
                                border: 'none',
                                transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                            }}
                        >
                            {creatingOwner ? (
                                <div className="loader" style={{ width: '24px', height: '24px', border: '3px solid #fff', borderTop: '3px solid transparent' }}></div>
                            ) : (
                                <><FiPlus size={24} /> Deploy Owner Account</>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <div className="glass" style={{ padding: '30px' }} ref={resultsRef}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                        <FiActivity /> {selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1).replace('_', ' ')} Records
                    </h2>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                        Showing {
                            bookings.filter(b => {
                                if (selectedFilter === 'total') return true;
                                if (selectedFilter === 'pending') return b.status === 'pending_payment';
                                if (selectedFilter === 'completed') return b.status === 'completed';
                                if (selectedFilter === 'cancelled') return b.status === 'cancelled';
                                if (selectedFilter === 'revenue') return b.status !== 'cancelled';
                                return true;
                            }).length
                        } results
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}><div className="loader"></div></div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', background: '#f8fafc', color: 'var(--text-secondary)' }}>
                                    <th style={{ padding: '15px' }}>Turf / Venue</th>
                                    <th style={{ padding: '15px' }}>Player Details</th>
                                    <th style={{ padding: '15px' }}>Time & Date</th>
                                    <th style={{ padding: '15px' }}>Amount</th>
                                    <th style={{ padding: '15px' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings
                                    .filter(b => {
                                        if (selectedFilter === 'total') return true;
                                        if (selectedFilter === 'pending') return b.status === 'pending_payment';
                                        if (selectedFilter === 'completed') return b.status === 'completed';
                                        if (selectedFilter === 'cancelled') return b.status === 'cancelled';
                                        if (selectedFilter === 'revenue') return b.status !== 'cancelled';
                                        return true;
                                    })
                                    .map(b => (
                                        <tr key={b._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '15px' }}>
                                                <div style={{ fontWeight: 'bold' }}>{b.turf_id?.turf_name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{b.turf_id?.location}</div>
                                            </td>
                                            <td style={{ padding: '15px' }}>
                                                <div style={{ fontWeight: '600' }}>{b.player_name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{b.phone}</div>
                                            </td>
                                            <td style={{ padding: '15px' }}>
                                                <div style={{ fontSize: '0.9rem' }}>{formatDate(b.slot_ids?.[0]?.date)}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>
                                                    {formatTime(b.slot_ids?.[0]?.start_time)} - {formatTime(b.slot_ids?.[b.slot_ids.length - 1]?.end_time)}
                                                </div>
                                            </td>
                                            <td style={{ padding: '15px' }}>
                                                <div style={{ fontWeight: 'bold' }}>{formatINR(b.slot_ids?.reduce((s, slot) => s + (slot.price || 0), 0) || 0)}</div>
                                                <div style={{ fontSize: '0.7rem' }} className="badge">
                                                    {b.payment_type?.replace('_', ' ')}
                                                </div>
                                            </td>
                                            <td style={{ padding: '15px' }}>
                                                <span className="badge" style={{
                                                    background: b.status === 'completed' ? '#dcfce7' : (b.status === 'pending_payment' ? '#fef3c7' : '#f1f5f9'),
                                                    color: b.status === 'completed' ? '#166534' : (b.status === 'pending_payment' ? '#92400e' : '#475569')
                                                }}>
                                                    {b.status?.replace('_', ' ')}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
