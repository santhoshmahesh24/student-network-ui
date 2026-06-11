import React, { useState, useEffect } from 'react';
import { users as usersApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Connections = () => {
  const [connections, setConnections] = useState([]);
  const [pending, setPending] = useState([]);
  const [tab, setTab] = useState('connections');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [connRes, pendRes] = await Promise.all([
        usersApi.getConnections(currentUser.userId),
        usersApi.getPendingRequests(),
      ]);
      setConnections(connRes.data);
      setPending(pendRes.data);
    } finally {
      setLoading(false);
    }
  };

  const respond = async (id, accept) => {
    await usersApi.respondToRequest(id, accept);
    await loadAll();
  };

  const remove = async (id) => {
    if (!window.confirm('Remove this connection?')) return;
    await usersApi.removeConnection(id);
    setConnections(connections.filter(c => c.id !== id));
  };

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>Connections</h1>
        </div>

        <div style={styles.tabs}>
          <button style={{ ...styles.tab, ...(tab === 'connections' ? styles.tabActive : {}) }} onClick={() => setTab('connections')}>
            🤝 My Connections <span style={styles.count}>{connections.length}</span>
          </button>
          <button style={{ ...styles.tab, ...(tab === 'pending' ? styles.tabActive : {}) }} onClick={() => setTab('pending')}>
            ⏳ Pending Requests
            {pending.length > 0 && <span className="badge" style={{ marginLeft: 8 }}>{pending.length}</span>}
          </button>
        </div>

        {loading ? <div className="spinner" /> : (
          <>
            {tab === 'connections' && (
              connections.length === 0 ?
                <div style={styles.empty}>
                  <div style={{ fontSize: 48 }}>🤝</div>
                  <h3>No connections yet</h3>
                  <p>Go to Discover to find and connect with students</p>
                  <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/discover')}>Find Students</button>
                </div> :
                <div style={styles.grid}>
                  {connections.map(u => (
                    <div key={u.id} className="card fade-in" style={styles.userCard}>
                      <div style={styles.cardTop}>
                        <div style={styles.avatar}>{u.fullName.charAt(0)}</div>
                        <div style={{ flex: 1 }}>
                          <div style={styles.name}>{u.fullName}</div>
                          <div style={styles.meta}>{u.university}</div>
                          <div style={styles.meta}>{u.department} • {u.yearOfStudy}</div>
                        </div>
                      </div>
                      {u.skills && (
                        <div style={styles.skills}>
                          {u.skills.split(',').slice(0, 3).map(s => <span key={s} className="tag" style={{ fontSize: 11 }}>{s.trim()}</span>)}
                        </div>
                      )}
                      <div style={styles.cardActions}>
                        <button className="btn btn-outline btn-sm" onClick={() => navigate(`/profile/${u.id}`)}>Profile</button>
                        <button className="btn btn-danger btn-sm" onClick={() => remove(u.id)}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
            )}

            {tab === 'pending' && (
              pending.length === 0 ?
                <div style={styles.empty}>
                  <div style={{ fontSize: 48 }}>⏳</div>
                  <h3>No pending requests</h3>
                </div> :
                <div style={styles.grid}>
                  {pending.map(req => (
                    <div key={req.id} className="card fade-in" style={styles.userCard}>
                      <div style={styles.cardTop}>
                        <div style={styles.avatar}>{req.sender.fullName.charAt(0)}</div>
                        <div>
                          <div style={styles.name}>{req.sender.fullName}</div>
                          <div style={styles.meta}>{req.sender.university}</div>
                          <div style={styles.meta}>{req.sender.department}</div>
                        </div>
                      </div>
                      <div style={styles.cardActions}>
                        <button className="btn btn-primary btn-sm" onClick={() => respond(req.id, true)}>✓ Accept</button>
                        <button className="btn btn-danger btn-sm" onClick={() => respond(req.id, false)}>✗ Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: { paddingTop: 64, minHeight: '100vh' },
  content: { maxWidth: 1000, margin: '0 auto', padding: '40px 24px' },
  header: { marginBottom: 24 },
  title: { fontSize: 32, fontWeight: 800, color: '#e8eaf0' },
  tabs: { display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid #2a2f42', paddingBottom: 0 },
  tab: { padding: '10px 20px', background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 14, fontFamily: 'DM Sans, sans-serif', borderBottom: '2px solid transparent', display: 'flex', alignItems: 'center', gap: 6 },
  tabActive: { color: '#6c63ff', borderBottomColor: '#6c63ff' },
  count: { background: '#2a2f42', color: '#9ca3af', padding: '1px 7px', borderRadius: 10, fontSize: 12 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 },
  userCard: { display: 'flex', flexDirection: 'column', gap: 12 },
  cardTop: { display: 'flex', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #6c63ff, #43e97b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 20, flexShrink: 0 },
  name: { fontWeight: 700, fontSize: 15, color: '#e8eaf0' },
  meta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  skills: { display: 'flex', flexWrap: 'wrap', gap: 4 },
  cardActions: { display: 'flex', gap: 8, marginTop: 4 },
  empty: { textAlign: 'center', padding: 60, color: '#6b7280' },
};

export default Connections;
