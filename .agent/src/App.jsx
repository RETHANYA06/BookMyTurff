import React, { useContext } from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Home from './pages/Home';
import TurfDetails from './pages/TurfDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import OwnerRegister from './pages/OwnerRegister';
import CancelBooking from './pages/CancelBooking';
import ManagerDashboard from './pages/ManagerDashboard';
import ManagerSlots from './pages/ManagerSlots';
import ManagerTurfSetup from './pages/ManagerTurfSetup';
import PlayerLogin from './pages/PlayerLogin';
import PlayerRegister from './pages/PlayerRegister';
import MyBookings from './pages/MyBookings';
import TurfSearch from './pages/TurfSearch';
import TurfListing from './pages/TurfListing';
import PlayerDashboard from './pages/PlayerDashboard';
import PlayerProfile from './pages/PlayerProfile';
import AdminDashboard from './pages/AdminDashboard';
import AccessDenied from './pages/AccessDenied';
import { FiHome, FiUser, FiLogOut, FiLayout, FiSearch, FiList, FiSettings, FiActivity } from 'react-icons/fi';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <AccessDenied />;
  return children;
};

const Navbar = () => {
  const { user, manager, player, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <nav className="glass fade-in" style={{
      margin: '25px auto',
      padding: '15px 35px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: '20px',
      zIndex: 1000,
      maxWidth: '1350px',
      border: '1px solid var(--border-subtle)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
    }}>
      <Link to="/" style={{ fontSize: '26px', fontWeight: '900', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '12px', letterSpacing: '-1px', textDecoration: 'none' }}>
        <div className="animate-float" style={{ background: 'var(--primary)', color: '#0f172a', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)' }}>
          <FiActivity size={24} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1' }}>
          <span style={{ color: 'var(--text-primary)', fontSize: '1.4rem' }}>BOOK<span style={{ color: 'var(--primary)' }}>MY</span></span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '800', letterSpacing: '4px', textTransform: 'uppercase' }}>Arenas</span>
        </div>
      </Link>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <Link to={player ? "/player/dashboard" : "/"} className="btn btn-primary" style={{ padding: '12px 25px', borderRadius: '16px', fontSize: '0.95rem' }}>Home</Link>
        <Link to="/turf-search" className="btn btn-primary" style={{ padding: '12px 25px', borderRadius: '16px', fontSize: '0.95rem' }}>Elite Search</Link>

        {player && (
          <>
            <Link to="/player/turfs" className="btn-outline" style={{ padding: '10px 18px', borderRadius: '14px', fontSize: '0.9rem', fontWeight: '700' }}><FiList size={18} /> Arenas</Link>
            <Link to="/my-bookings" className="btn-outline" style={{ padding: '10px 18px', borderRadius: '14px', fontSize: '0.9rem', fontWeight: '700' }}><FiActivity size={18} /> My Games</Link>
          </>
        )}

        {manager && (
          <Link to="/manager/dashboard" className="btn-outline" style={{ padding: '10px 18px', borderRadius: '14px', fontSize: '0.9rem', fontWeight: '700' }}><FiLayout size={18} /> Command Center</Link>
        )}

        <div style={{ marginLeft: '20px', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          {user ? (
            <>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '1rem', fontWeight: '900', color: 'var(--text-primary)' }}>{user.name || user.full_name}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {user.role === 'owner' ? 'Pro Partner' : user.role === 'admin' ? 'System Architect' : 'Elite Striker'}
                </span>
              </div>
              <button onClick={() => { logout(); navigate('/'); }} className="btn-outline box-btn" style={{ background: 'rgba(239,68,68,0.05)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.1)' }}>
                <FiLogOut size={20} />
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{ padding: '12px 30px', borderRadius: '16px', fontSize: '0.95rem' }}>Join the Elite</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

const HomeRedirect = () => {
  const { user } = useContext(AuthContext);
  if (user?.role === 'player') return <Navigate to="/player/dashboard" />;
  if (user?.role === 'owner' || user?.role === 'admin') return <Navigate to="/manager/dashboard" />;
  return <Home />;
};

const App = () => {
  return (
    <div className="App">
      <Navbar />
      <div className="container" style={{ paddingBottom: '80px' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/turf/:id" element={<ProtectedRoute allowedRoles={['player']}><TurfDetails /></ProtectedRoute>} />
          <Route path="/turf-search" element={<ProtectedRoute allowedRoles={['player']}><TurfSearch /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/player-login" element={<Navigate to="/login" />} />
          <Route path="/player-register" element={<PlayerRegister />} />
          <Route path="/owner-register" element={<OwnerRegister />} />
          <Route path="/register" element={<Register />} />
          <Route path="/my-bookings" element={<ProtectedRoute allowedRoles={['player']}><MyBookings /></ProtectedRoute>} />
          <Route path="/cancel-booking" element={<ProtectedRoute allowedRoles={['player']}><CancelBooking /></ProtectedRoute>} />

          {/* Player Routes */}
          <Route path="/player/dashboard" element={<ProtectedRoute allowedRoles={['player']}><PlayerDashboard /></ProtectedRoute>} />
          <Route path="/player/turfs" element={<ProtectedRoute allowedRoles={['player']}><TurfListing /></ProtectedRoute>} />
          <Route path="/player/profile" element={<ProtectedRoute allowedRoles={['player']}><PlayerProfile /></ProtectedRoute>} />

          {/* Manager Routes */}
          <Route path="/manager/dashboard" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><ManagerDashboard /></ProtectedRoute>} />
          <Route path="/manager/slots" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><ManagerSlots /></ProtectedRoute>} />
          <Route path="/manager/setup" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><ManagerTurfSetup /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin-panel" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
