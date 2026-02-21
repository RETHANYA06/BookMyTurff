import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FiSave, FiPlus, FiTrash2 } from 'react-icons/fi';
import API_BASE_URL from '../config/api';

const ManagerTurfSetup = () => {
    const { manager } = useContext(AuthContext);
    const [turf, setTurf] = useState(null);
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState({ item_name: '', rent_price: '' });

    useEffect(() => {
        if (!manager) return;
        const fetchData = async () => {
            const res = await axios.get(`${API_BASE_URL}/api/turfs/${manager.turf_id}`);
            setTurf(res.data);
            setItems(res.data.items || []);
        };
        fetchData();
    }, [manager]);

    const handleTurfUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${API_BASE_URL}/api/turfs/${manager.turf_id}`, turf);
            alert('Turf updated successfully');
        } catch (err) {
            alert('Update failed');
        }
    };

    const addItem = async () => {
        try {
            const res = await axios.post(`${API_BASE_URL}/api/turfs/${manager.turf_id}/items`, newItem);
            setItems([...items, res.data]);
            setNewItem({ item_name: '', rent_price: '' });
        } catch (err) {
            alert('Failed to add item');
        }
    };

    const deleteItem = async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/api/turfs/items/${id}`);
            setItems(items.filter(i => i._id !== id));
        } catch (err) {
            alert('Failed to delete item');
        }
    };

    if (!turf) return <div>Loading...</div>;

    return (
        <div className="grid" style={{ gridTemplateColumns: '1.2fr 1fr' }}>
            <div className="glass" style={{ padding: '30px' }}>
                <h2>Turf Settings</h2>
                <form onSubmit={handleTurfUpdate} style={{ marginTop: '20px' }}>
                    <label>Turf Name</label>
                    <input value={turf.turf_name} onChange={e => setTurf({ ...turf, turf_name: e.target.value })} />

                    <label>Location</label>
                    <input value={turf.location} onChange={e => setTurf({ ...turf, location: e.target.value })} />

                    <label>Turf Image</label>
                    <div style={{ marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {turf.image_url && (
                            <div style={{ position: 'relative', width: '200px', height: '120px', borderRadius: '15px', overflow: 'hidden', border: '2px solid var(--primary)' }}>
                                <img src={turf.image_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.3s' }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                                    <span style={{ color: 'white', fontWeight: 'bold', fontSize: '0.8rem' }}>Current Image</span>
                                </div>
                            </div>
                        )}
                        <div className="glass" style={{ padding: '20px', borderRadius: '18px', border: '2px dashed var(--border-subtle)', textAlign: 'center', cursor: 'pointer', transition: '0.3s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}>
                            <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="turf-image-upload"
                                onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;
                                    const formData = new FormData();
                                    formData.append('image', file);
                                    try {
                                        const res = await axios.post(`${API_BASE_URL}/api/turfs/upload`, formData, {
                                            headers: { 'Content-Type': 'multipart/form-data' }
                                        });
                                        setTurf({ ...turf, image_url: res.data.imageUrl });
                                        alert('Image uploaded and synced!');
                                    } catch (err) {
                                        console.error('Upload Error:', err);
                                        alert(`Upload failed: ${err.response?.data?.message || err.message}`);
                                    }
                                }}
                            />
                            <label htmlFor="turf-image-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                <div style={{ background: 'var(--primary-glow)', color: 'var(--primary)', width: '45px', height: '45px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FiPlus size={24} />
                                </div>
                                <span>{turf.image_url ? 'Replace Turf Image' : 'Upload Turf Image'}</span>
                            </label>
                        </div>
                    </div>

                    <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                        <div>
                            <label>Opening Time</label>
                            <input type="time" value={turf.opening_time} onChange={e => setTurf({ ...turf, opening_time: e.target.value })} />
                        </div>
                        <div>
                            <label>Closing Time</label>
                            <input type="time" value={turf.closing_time} onChange={e => setTurf({ ...turf, closing_time: e.target.value })} />
                        </div>
                        <div>
                            <label>Slot Duration (min)</label>
                            <select value={turf.slot_duration} onChange={e => setTurf({ ...turf, slot_duration: parseInt(e.target.value) })}>
                                <option value="30">30 Min</option>
                                <option value="60">60 Min</option>
                                <option value="90">90 Min</option>
                                <option value="120">120 Min</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                        <div>
                            <label>Max Players</label>
                            <input type="number" value={turf.max_players} onChange={e => setTurf({ ...turf, max_players: parseInt(e.target.value) })} />
                        </div>
                        <div>
                            <label>Base Price (₹/hr)</label>
                            <input type="number" value={turf.base_price} onChange={e => setTurf({ ...turf, base_price: parseInt(e.target.value) })} />
                        </div>
                        <div>
                            <label>Sport Type</label>
                            <input value={turf.sport_type || 'Football'} onChange={e => setTurf({ ...turf, sport_type: e.target.value })} />
                        </div>
                    </div>

                    <label>Rules & Instructions</label>
                    <textarea
                        rows="5"
                        value={turf.rules_text}
                        onChange={e => setTurf({ ...turf, rules_text: e.target.value })}
                    ></textarea>

                    <button className="btn btn-primary" style={{ marginTop: '20px', width: '100%' }}>
                        <FiSave /> Save Changes
                    </button>
                </form>
            </div>

            <div className="glass" style={{ padding: '30px' }}>
                <h2>Rentable Items</h2>
                <div style={{ marginTop: '20px' }}>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        <input
                            placeholder="Item Name (e.g. Shoes)"
                            value={newItem.item_name}
                            onChange={e => setNewItem({ ...newItem, item_name: e.target.value })}
                            style={{ marginBottom: 0 }}
                        />
                        <input
                            type="number"
                            placeholder="Price"
                            value={newItem.rent_price}
                            onChange={e => setNewItem({ ...newItem, rent_price: e.target.value })}
                            style={{ marginBottom: 0, width: '100px' }}
                        />
                        <button className="btn btn-primary" onClick={addItem}>
                            <FiPlus />
                        </button>
                    </div>

                    <div className="grid" style={{ gap: '10px' }}>
                        {items.map(item => (
                            <div key={item._id} className="glass" style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)' }}>
                                <div>
                                    <b>{item.item_name}</b>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>₹{item.rent_price}</div>
                                </div>
                                <button className="btn" style={{ color: 'var(--danger)' }} onClick={() => deleteItem(item._id)}>
                                    <FiTrash2 />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerTurfSetup;
