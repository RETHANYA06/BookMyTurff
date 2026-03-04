import React, { useState } from 'react';
import axios from 'axios';
import { FiXCircle, FiPhone, FiHash, FiAlertCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const CancelBooking = () => {
    const [formData, setFormData] = useState({ bookingId: '', phone: '', reason: '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const navigate = useNavigate();

    const handleCancel = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await axios.post('https://bookmyturff.onrender.com/api/bookings/public-cancel', formData);
            setMessage({ type: 'success', text: res.data.message });
            setTimeout(() => navigate('/'), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Cancellation failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '80px auto' }}>
            <div className="glass" style={{ padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <FiXCircle size={50} color="var(--danger)" style={{ marginBottom: '15px' }} />
                    <h2>Cancel Booking</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Enter details to cancel your slot</p>
                </div>

                {message.text && (
                    <div style={{
                        padding: '15px',
                        borderRadius: '8px',
                        background: message.type === 'success' ? '#ecfdf5' : '#fee2e2',
                        color: message.type === 'success' ? '#065f46' : '#991b1b',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <FiAlertCircle /> {message.text}
                    </div>
                )}

                <form onSubmit={handleCancel}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <FiHash size={14} /> Booking ID
                    </label>
                    <input
                        placeholder="Enter your booking ID"
                        required
                        value={formData.bookingId}
                        onChange={e => setFormData({ ...formData, bookingId: e.target.value })}
                    />

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <FiPhone size={14} /> Registered Phone
                    </label>
                    <input
                        placeholder="Enter registered phone number"
                        required
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />

                    <label style={{ marginBottom: '8px', display: 'block' }}>Reason for cancellation (optional)</label>
                    <textarea
                        placeholder="Why are you cancelling?"
                        rows="3"
                        value={formData.reason}
                        onChange={e => setFormData({ ...formData, reason: e.target.value })}
                        style={{ width: '100%', padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '20px' }}
                    ></textarea>

                    <button className="btn btn-primary" style={{ width: '100%', background: 'var(--danger)', color: 'white' }} disabled={loading}>
                        {loading ? 'Cancelling...' : 'Confirm Cancellation'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CancelBooking;
