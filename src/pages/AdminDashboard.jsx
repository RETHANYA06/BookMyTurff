import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FiMonitor, FiActivity, FiUser, FiCalendar, FiClock, FiCheckCircle, FiXCircle, FiInfo } from 'react-icons/fi';
import API_BASE_URL from '../config/api';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        completed: 0,
        revenue: 0
    });

    const fetchAllBookings = async () => {
        setLoading(true);
        try {
            // We need an endpoint to get ALL bookings
            const res = await axios.get(`${API_BASE_URL}/api/bookings/admin/all`);
            setBookings(res.data);

            // Calculate Stats
            const newStats = res.data.reduce((acc, b) => {
                acc.total++;
                if (b.status === 'pending_payment') acc.pending++;
                if (b.status === 'completed') acc.completed++;
                const totalPrice = b.slot_ids?.reduce((sum, s) => sum + (s.price || 0), 0) || 0;
                acc.revenue += totalPrice;
                return acc;
            }, { total: 0, pending: 0, completed: 0, revenue: 0 });

            setStats(newStats);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'admin') fetchAllBookings();
    }, [user]);

    if (user?.role !== 'admin') return <div style={{ textAlign: 'center', padding: '100px' }}>Access Denied</div>;

    return (
        <div className="fade-in" style={{ paddingBottom: '50px' }}>
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <FiMonitor color="var(--primary)" /> Admin Control Center
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>Monitoring all turf activities across the platform.</p>
            </div>

            {/* Stats Overview */}
            <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
                {[
                    { label: 'Total Bookings', value: stats.total, icon: <FiActivity />, color: 'var(--accent)' },
                    { label: 'Pending Payment', value: stats.pending, icon: <FiInfo />, color: '#f59e0b' },
                    { label: 'Completed', value: stats.completed, icon: <FiCheckCircle />, color: 'var(--success)' },
                    { label: 'Platform Revenue', value: `₹${stats.revenue}`, icon: <FiActivity />, color: 'var(--primary)' }
                ].map((s, i) => (
                    <div key={i} className="glass" style={{ padding: '25px', borderLeft: `5px solid ${s.color}` }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                            {s.label} {s.icon}
                        </div>
                        <h2 style={{ fontSize: '2rem' }}>{s.value}</h2>
                    </div>
                ))}
            </div>

            <div className="glass" style={{ padding: '30px' }}>
                <h2 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FiActivity /> Live Booking Stream
                </h2>

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
                                {bookings.map(b => (
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
                                            <div style={{ fontSize: '0.9rem' }}>{b.slot_ids?.[0]?.date}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>
                                                {b.slot_ids?.[0]?.start_time} - {b.slot_ids?.[b.slot_ids.length - 1]?.end_time}
                                            </div>
                                        </td>
                                        <td style={{ padding: '15px' }}>
                                            <div style={{ fontWeight: 'bold' }}>₹{b.slot_ids?.reduce((s, slot) => s + (slot.price || 0), 0) || 0}</div>
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
