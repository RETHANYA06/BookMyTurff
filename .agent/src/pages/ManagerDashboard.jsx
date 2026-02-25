import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FiDollarSign, FiCalendar, FiTrendingUp, FiXCircle, FiSettings, FiGrid, FiFilter, FiCheckCircle, FiMinusCircle, FiActivity } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const ManagerDashboard = () => {
    const { manager } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [filterDate, setFilterDate] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPayment, setFilterPayment] = useState('all');

    const fetchData = async () => {
        if (!manager?.turf_id) {
            setLoading(false);
            return;
        }

        setLoading(true); // Ensure loading is true when starting fresh fetch
        try {
            const [statsRes, bookingsRes] = await Promise.all([
                axios.get(`https://bookmyturff.onrender.com/api/bookings/earnings/${manager.turf_id}`),
                axios.get(`https://bookmyturff.onrender.com/api/bookings/${manager.turf_id}`)
            ]);
            setStats(statsRes.data);
            setBookings(bookingsRes.data);
            setFilteredBookings(bookingsRes.data);
        } catch (err) {
            console.error("Dashboard Fetch Error:", err);
            // Even on error, we must turn off loading to show the error state vs blank screen
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [manager]);

    useEffect(() => {
        let filtered = [...bookings];
        if (filterDate) {
            filtered = filtered.filter(b => b.slot_ids?.some(s => s.date === filterDate));
        }
        if (filterStatus !== 'all') {
            filtered = filtered.filter(b => b.status === filterStatus);
        }
        if (filterPayment !== 'all') {
            filtered = filtered.filter(b => b.payment_status === filterPayment);
        }
        setFilteredBookings(filtered);
    }, [filterDate, filterStatus, filterPayment, bookings]);

    const handleQuickAction = async (id, action, reason = '') => {
        const actionText = action === 'complete' ? 'mark this booking as COMPLETED' :
            (action === 'paid' ? 'mark this as FULLY PAID' : (action === 'confirm' ? 'CONFIRM this booking' : 'CANCEL this booking'));

        if (!window.confirm(`Are you sure you want to ${actionText}?`)) return;

        setLoading(true);
        try {
            if (action === 'complete') {
                await axios.post(`https://bookmyturff.onrender.com/api/bookings/${id}/complete`);
            } else if (action === 'confirm') {
                await axios.put(`https://bookmyturff.onrender.com/api/bookings/${id}`, { status: 'booked' });
            } else if (action === 'cancel') {
                await axios.put(`https://bookmyturff.onrender.com/api/bookings/${id}`, { status: 'cancelled', cancel_reason: reason });
            } else if (action === 'paid') {
                await axios.put(`https://bookmyturff.onrender.com/api/bookings/${id}`, { payment_status: 'fully_paid' });
            }
            fetchData();
        } catch (err) {
            alert('Action failed: ' + (err.response?.data?.message || 'Server error'));
        } finally {
            setLoading(false);
        }
    };

    if (!manager) return <div style={{ textAlign: 'center', marginTop: '100px' }}>Please login to access dashboard</div>;

    if (loading && !stats) return (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <div className="loader" style={{ borderColor: 'var(--primary)', marginBottom: '20px' }}></div>
            <h2>Preparing your dashboard...</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Gathering data for {manager.turf_name}</p>
        </div>
    );

    if (!stats) return (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <h2>Welcome, {manager.name}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>We're setting up your arena stats.</p>
            <button className="btn btn-primary" onClick={fetchData}>Refresh Dashboard</button>
        </div>
    );

    return (
        <div className="fade-in" style={{ paddingBottom: '60px', maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                <div>
                    <span style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', background: 'rgba(16, 185, 129, 0.1)', padding: '6px 15px', borderRadius: '30px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>Partner Portal</span>
                    <h1 style={{ fontSize: '3rem', marginTop: '15px', color: 'var(--text-primary)', lineHeight: '1' }}>Business Overview</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginTop: '5px' }}>Command Center for <b>{manager.turf_name}</b></p>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <Link to="/manager/slots" className="btn-outline" style={{ padding: '12px 25px', borderRadius: '15px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', border: '1px solid var(--border-subtle)', textDecoration: 'none', background: 'white' }}><FiGrid size={20} /> Manage Slots</Link>
                    <Link to="/manager/setup" className="btn-outline" style={{ padding: '12px 25px', borderRadius: '15px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', border: '1px solid var(--border-subtle)', textDecoration: 'none', background: 'white' }}><FiSettings size={20} /> Venue Settings</Link>
                </div>
            </div>

            {/* Today Overview Card Cluster */}
            <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
                <div className="glass" style={{ padding: '30px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '28px', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Daily Bookings</span>
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '14px', color: 'var(--primary)' }}><FiCalendar size={20} /></div>
                    </div>
                    <h2 style={{ fontSize: '3rem', margin: '15px 0', color: 'var(--text-primary)', fontWeight: '900' }}>{stats.todayBookings}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '800', fontSize: '0.85rem' }}>
                        <FiTrendingUp /> +12% from yesterday
                    </div>
                </div>
                <div className="glass" style={{ padding: '30px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '28px', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Total Revenue</span>
                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '14px', color: '#3b82f6' }}><FiDollarSign size={20} /></div>
                    </div>
                    <h2 style={{ fontSize: '3rem', margin: '15px 0', color: 'var(--text-primary)', fontWeight: '900' }}>₹{stats.advanceCollected}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.85rem' }}>
                        Secured digital payments
                    </div>
                </div>
                <div className="glass" style={{ padding: '30px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '28px', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Pending Credits</span>
                        <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '10px', borderRadius: '14px', color: '#f59e0b' }}><FiActivity size={20} /></div>
                    </div>
                    <h2 style={{ fontSize: '3rem', margin: '15px 0', color: 'var(--text-primary)', fontWeight: '900' }}>₹{stats.pendingPayments}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontWeight: '800', fontSize: '0.85rem' }}>
                        Requires manual collection
                    </div>
                </div>
                <div className="glass" style={{ padding: '30px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '28px', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Cancellations</span>
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '14px', color: 'var(--danger)' }}><FiXCircle size={20} /></div>
                    </div>
                    <h2 style={{ fontSize: '3rem', margin: '15px 0', color: 'var(--text-primary)', fontWeight: '900' }}>{stats.cancelledCount}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', fontWeight: '800', fontSize: '0.85rem' }}>
                        Total this session
                    </div>
                </div>
            </div>

            {/* Analytics & Calendar Section */}
            <div className="grid" style={{ gridTemplateColumns: '1fr 350px', gap: '30px' }}>
                <div className="glass" style={{ padding: '30px', minHeight: '600px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)' }}><FiFilter color="var(--primary)" /> Booking Intel</h2>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '10px 15px', marginBottom: 0, width: 'auto', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.08)', color: 'var(--text-primary)', borderRadius: '12px', fontWeight: '700' }}>
                                <option value="all">All Status</option>
                                <option value="pending_payment">Pending Payment</option>
                                <option value="booked">Booked</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <select value={filterPayment} onChange={e => setFilterPayment(e.target.value)} style={{ padding: '10px 15px', marginBottom: 0, width: 'auto', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.08)', color: 'var(--text-primary)', borderRadius: '12px', fontWeight: '700' }}>
                                <option value="all">All Payments</option>
                                <option value="pending_payment">Pending</option>
                                <option value="partially_paid">Partial</option>
                                <option value="fully_paid">Fully Paid</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', color: 'var(--text-secondary)' }}>
                                    <th style={{ padding: '15px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Date & Player</th>
                                    <th style={{ padding: '15px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Slot</th>
                                    <th style={{ padding: '15px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Payment</th>
                                    <th style={{ padding: '15px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Status</th>
                                    <th style={{ padding: '15px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBookings.map(b => (
                                    <tr key={b._id} style={{ background: 'rgba(255,255,255,0.02)' }}>
                                        <td style={{ padding: '20px 15px', borderRadius: '15px 0 0 15px' }}>
                                            <div style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '1.1rem' }}>{b.player_name}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{b.phone} • {b.slot_ids?.[0]?.date}</div>
                                            {b.rental_items?.length > 0 && (
                                                <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                                    {b.rental_items.map(ri => (
                                                        <span key={ri._id} style={{ fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.05)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '5px', fontWeight: '700', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                                                            {ri.quantity}x {ri.item_id?.item_name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '20px 15px' }}>
                                            <div style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: '700' }}>
                                                {b.slot_ids?.[0]?.start_time} - {b.slot_ids?.[(b.slot_ids?.length || 0) - 1]?.end_time}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '800', marginTop: '4px' }}>
                                                ₹{b.slot_ids?.reduce((sum, s) => sum + (s.price || 0), 0)}
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px 15px' }}>
                                            <span style={{
                                                padding: '6px 12px',
                                                borderRadius: '10px',
                                                fontSize: '0.75rem',
                                                fontWeight: '800',
                                                textTransform: 'uppercase',
                                                background: b.payment_status === 'fully_paid' ? 'rgba(16, 185, 129, 0.1)' : (b.payment_status === 'partially_paid' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)'),
                                                color: b.payment_status === 'fully_paid' ? 'var(--primary)' : (b.payment_status === 'partially_paid' ? '#3b82f6' : '#f59e0b'),
                                                border: `1px solid ${b.payment_status === 'fully_paid' ? 'rgba(16, 185, 129, 0.2)' : (b.payment_status === 'partially_paid' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(245, 158, 11, 0.2)')}`
                                            }}>
                                                {b.payment_status?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td style={{ padding: '20px 15px' }}>
                                            <span style={{
                                                padding: '6px 12px',
                                                borderRadius: '10px',
                                                fontSize: '0.75rem',
                                                fontWeight: '800',
                                                textTransform: 'uppercase',
                                                background: b.status === 'completed' ? 'rgba(255,255,255,0.05)' : (b.status === 'booked' ? 'rgba(16, 185, 129, 0.1)' : (b.status === 'pending_payment' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)')),
                                                color: b.status === 'completed' ? 'var(--text-secondary)' : (b.status === 'booked' ? 'var(--primary)' : (b.status === 'pending_payment' ? '#f59e0b' : 'var(--danger)')),
                                                border: `1px solid ${b.status === 'completed' ? 'rgba(255,255,255,0.1)' : (b.status === 'booked' ? 'rgba(16, 185, 129, 0.2)' : (b.status === 'pending_payment' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)'))}`
                                            }}>
                                                {b.status?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td style={{ padding: '20px 15px', borderRadius: '0 15px 15px 0' }}>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                {b.status === 'pending_payment' && (
                                                    <button onClick={() => handleQuickAction(b._id, 'confirm')} className="btn btn-primary" style={{ padding: '8px 15px', fontSize: '0.8rem' }}>
                                                        Confirm
                                                    </button>
                                                )}
                                                {b.status === 'booked' && (
                                                    <>
                                                        <button onClick={() => handleQuickAction(b._id, 'complete')} className="btn" style={{ padding: '8px', color: 'var(--primary)', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px' }} title="Mark Completed">
                                                            <FiCheckCircle size={18} />
                                                        </button>
                                                        {b.payment_status !== 'fully_paid' && (
                                                            <button onClick={() => handleQuickAction(b._id, 'paid')} className="btn" style={{ padding: '8px', color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px' }} title="Collect Payment">
                                                                <FiDollarSign size={18} />
                                                            </button>
                                                        )}
                                                        <button onClick={() => {
                                                            const reason = prompt('Enter cancellation reason:');
                                                            if (reason) handleQuickAction(b._id, 'cancel', reason);
                                                        }} className="btn" style={{ padding: '8px', color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '10px' }} title="Cancel">
                                                            <FiMinusCircle size={18} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredBookings.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-secondary)' }}>
                                No records found matching filters.
                            </div>
                        )}
                    </div>
                </div>

                <div className="glass" style={{ padding: '30px', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '32px', height: 'fit-content' }}>
                    <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)' }}><FiCalendar color="var(--primary)" /> Operations</h3>
                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800', marginBottom: '10px', display: 'block' }}>Date Filter</label>
                        <input
                            type="date"
                            value={filterDate}
                            onChange={e => setFilterDate(e.target.value)}
                            style={{
                                background: 'rgba(0,0,0,0.02)',
                                border: '1px solid rgba(0,0,0,0.08)',
                                color: 'var(--text-primary)',
                                borderRadius: '12px',
                                padding: '12px',
                                marginBottom: '20px',
                                width: '100%',
                                fontWeight: '700'
                            }}
                        />
                        <div style={{ background: 'rgba(0,0,0,0.02)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.05)' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '5px' }}>Scheduled Games</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--text-primary)' }}>{filteredBookings.length}</div>
                        </div>
                        {filterDate && (
                            <button className="btn" style={{ width: '100%', marginTop: '15px', color: 'var(--primary)', fontWeight: '800', fontSize: '0.85rem' }} onClick={() => setFilterDate('')}>
                                Clear Filter
                            </button>
                        )}
                    </div>

                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '30px 0' }}></div>

                    <h4 style={{ marginBottom: '20px', fontSize: '1rem', color: 'var(--text-primary)', fontWeight: '800' }}>Quick Actions</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <Link to="/manager/slots" className="btn btn-primary" style={{ height: '55px', borderRadius: '15px' }}>
                            Block / Manage Slots
                        </Link>
                        <Link to="/manager/setup" className="btn btn-outline" style={{ height: '55px', borderRadius: '15px', color: 'var(--text-primary)' }}>
                            Manage Inventory
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;
