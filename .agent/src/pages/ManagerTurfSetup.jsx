import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FiSave, FiPlus, FiTrash2 } from 'react-icons/fi';

const ManagerTurfSetup = () => {
    const { manager } = useContext(AuthContext);
    const [turf, setTurf] = useState(null);
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState({ item_name: '', rent_price: '' });

    useEffect(() => {
        if (!manager) return;
        const fetchData = async () => {
            const res = await axios.get(`https://bookmyturff.onrender.com/api/turfs/${manager.turf_id}`);
            setTurf(res.data);
            setItems(res.data.items || []);
        };
        fetchData();
    }, [manager]);

    const handleTurfUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`https://bookmyturff.onrender.com/api/turfs/${manager.turf_id}`, turf);
            alert('Turf updated successfully');
        } catch (err) {
            alert('Update failed');
        }
    };

    const addItem = async () => {
        try {
            const res = await axios.post(`https://bookmyturff.onrender.com/api/turfs/${manager.turf_id}/items`, newItem);
            setItems([...items, res.data]);
            setNewItem({ item_name: '', rent_price: '' });
        } catch (err) {
            alert('Failed to add item');
        }
    };

    const deleteItem = async (id) => {
        try {
            await axios.delete(`https://bookmyturff.onrender.com/api/turfs/items/${id}`);
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

                    <label>Arena Image URL</label>
                    <input placeholder="https://example.com/photo.jpg" value={turf.image_url} onChange={e => setTurf({ ...turf, image_url: e.target.value })} />

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
