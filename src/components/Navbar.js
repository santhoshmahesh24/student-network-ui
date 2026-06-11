import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { label: 'Feed', path: '/feed', icon: '⚡' },
    { label: 'Discover', path: '/discover', icon: '🔍' },
    { label: 'Opportunities', path: '/opportunities', icon: '🚀' },
    { label: 'Connections', path: '/connections', icon: '🤝' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.logo} onClick={() => navigate('/feed')}>
        <span style={styles.logoIcon}>◈</span>
        <span style={styles.logoText}>StudentNet</span>
      </div>

      <div style={styles.navLinks}>
        {navItems.map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              ...styles.navBtn,
              ...(location.pathname === item.path ? styles.navBtnActive : {})
            }}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div style={styles.right}>
        <button style={styles.avatarBtn} onClick={() => setMenuOpen(!menuOpen)}>
          <div style={styles.avatar}>
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
          <span style={styles.userName}>{user?.fullName?.split(' ')[0]}</span>
          <span style={{ color: '#6b7280', fontSize: 12 }}>▾</span>
        </button>

        {menuOpen && (
          <div style={styles.dropdown}>
            <div style={styles.dropdownHeader}>
              <div style={styles.dropdownName}>{user?.fullName}</div>
              <div style={styles.dropdownEmail}>{user?.email}</div>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid #2a2f42', margin: '8px 0' }} />
            <button style={styles.dropdownItem} onClick={() => { navigate('/profile'); setMenuOpen(false); }}>
              👤 My Profile
            </button>
            <button style={styles.dropdownItem} onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 32px', height: 64,
    background: 'rgba(13,15,20,0.92)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid #2a2f42',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 10,
    cursor: 'pointer',
  },
  logoIcon: { fontSize: 22, color: '#6c63ff' },
  logoText: { fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: '#e8eaf0' },
  navLinks: { display: 'flex', gap: 4 },
  navBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 16px', borderRadius: 10,
    border: 'none', background: 'transparent',
    color: '#6b7280', fontSize: 14, fontFamily: 'DM Sans, sans-serif',
    cursor: 'pointer', transition: 'all 0.2s',
  },
  navBtnActive: { background: 'rgba(108,99,255,0.15)', color: '#6c63ff' },
  right: { position: 'relative' },
  avatarBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'transparent', border: 'none',
    cursor: 'pointer', padding: '6px 10px', borderRadius: 10,
  },
  avatar: {
    width: 34, height: 34, borderRadius: '50%',
    background: 'linear-gradient(135deg, #6c63ff, #ff6584)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 700, fontSize: 14,
    fontFamily: 'Syne, sans-serif',
  },
  userName: { color: '#e8eaf0', fontSize: 14, fontWeight: 500 },
  dropdown: {
    position: 'absolute', top: '110%', right: 0,
    background: '#161920', border: '1px solid #2a2f42',
    borderRadius: 12, padding: '8px', minWidth: 200,
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    animation: 'fadeIn 0.15s ease',
  },
  dropdownHeader: { padding: '8px 10px 4px' },
  dropdownName: { fontWeight: 600, fontSize: 14, color: '#e8eaf0' },
  dropdownEmail: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  dropdownItem: {
    display: 'flex', alignItems: 'center', gap: 8,
    width: '100%', padding: '10px 12px',
    background: 'transparent', border: 'none',
    color: '#e8eaf0', fontSize: 14, fontFamily: 'DM Sans, sans-serif',
    cursor: 'pointer', borderRadius: 8, textAlign: 'left',
    transition: 'background 0.15s',
  },
};

export default Navbar;
