import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiActivity, FiArrowRight, FiCheck } from 'react-icons/fi';

const Register = () => {
    const navigate = useNavigate();
    const [selected, setSelected] = useState(null);

    const roles = [
        {
            id: 'player',
            title: 'Player',
            description: 'Join as an athlete, book turfs, and find games to play.',
            icon: <FiUser size={32} />,
            color: 'var(--primary)',
            path: '/player-register'
        },
        {
            id: 'owner',
            title: 'Turf Owner',
            description: 'List your turf, manage bookings, and grow your sports business.',
            icon: <FiActivity size={32} />,
            color: '#0ea5e9', // Sky blue for owner
            path: '/owner-register'
        }
    ];

    return (
        <div style={{ maxWidth: '1000px', margin: '100px auto', padding: '0 20px' }} className="fade-in">
            <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                <span style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '4px', background: 'rgba(16, 185, 129, 0.1)', padding: '8px 20px', borderRadius: '40px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>Onboarding Protocol</span>
                <h1 style={{ fontSize: '4rem', color: 'var(--text-primary)', fontWeight: '900', letterSpacing: '-2px', marginTop: '20px', lineHeight: '1' }}>JOIN THE <span className="text-glow" style={{ color: 'var(--primary)' }}>NETWORK</span></h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginTop: '15px', fontWeight: '500' }}>Define your objective to initialize deployment.</p>
            </div>

            <div className="grid" style={{ gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: '40px' }}>
                {roles.map(role => (
                    <div
                        key={role.id}
                        onClick={() => setSelected(role.id)}
                        className="glass-heavy card-hover"
                        style={{
                            padding: '60px 50px',
                            borderRadius: '40px',
                            cursor: 'pointer',
                            border: selected === role.id ? `2px solid ${role.color}` : '1px solid var(--border-subtle)',
                            transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                            background: selected === role.id ? 'rgba(0,0,0,0.02)' : 'var(--card-bg)',
                            position: 'relative',
                            boxShadow: selected === role.id ? `0 20px 60px ${role.color}15` : 'var(--shadow)'
                        }}
                    >
                        {selected === role.id && (
                            <div className="animate-float" style={{
                                position: 'absolute', top: '30px', right: '30px',
                                background: role.color, color: '#ffffff',
                                borderRadius: '12px', width: '32px', height: '32px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: `0 0 20px ${role.color}40`
                            }}>
                                <FiCheck size={18} strokeWidth={3} />
                            </div>
                        )}

                        <div className="animate-float" style={{
                            width: '90px', height: '90px', borderRadius: '28px',
                            background: `${role.color}10`, color: role.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '35px', border: `1px solid ${role.color}20`
                        }}>
                            {role.icon}
                        </div>

                        <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)', fontWeight: '800', marginBottom: '15px' }}>{role.title}</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.05rem', fontWeight: '500' }}>{role.description}</p>
                    </div>
                ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '80px' }}>
                <button
                    disabled={!selected}
                    onClick={() => navigate(roles.find(r => r.id === selected).path)}
                    className="btn btn-primary"
                    style={{
                        padding: '22px 80px', borderRadius: '22px', fontSize: '1.15rem',
                        opacity: selected ? 1 : 0.3, pointerEvents: selected ? 'auto' : 'none',
                        boxShadow: selected ? '0 20px 40px rgba(16, 185, 129, 0.2)' : 'none',
                        color: '#ffffff'
                    }}
                >
                    Initialize Account <FiArrowRight style={{ marginLeft: '12px' }} size={20} />
                </button>

                <p style={{ marginTop: '35px', color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: '600' }}>
                    Part of the network? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '800', textDecoration: 'none', marginLeft: '8px' }}>Login</Link>
                </p>
            </div>

            {/* Admin Note */}
            <div style={{ marginTop: '120px', padding: '40px 20px', textAlign: 'center', borderTop: '1px solid var(--border-subtle)' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                    Secured System Access • <Link to="/login" style={{ color: 'var(--text-primary)', fontWeight: '700', textDecoration: 'none' }}>Admin Console</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
