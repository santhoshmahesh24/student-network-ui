import React, { useState, useEffect } from 'react';
import { users as usersApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Discover = () => {
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState({});
  const [messages, setMessages] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.trim().length > 1) search();
    }, 400);
    return () => clearTimeout(timeout);
  }, [query]);

  const search = async () => {
    setLoading(true);
    try {
      const res = await usersApi.search(query);
      setResults(res.data);
    } finally {
      setLoading(false);
    }
  };

  const connect = async (id, name) => {
    setConnecting({ ...connecting, [id]: true });
    try {
      await usersApi.sendRequest(id);
      setMessages({ ...messages, [id]: 'Request sent!' });
    } catch (err) {
      setMessages({ ...messages, [id]: err.response?.data || 'Already connected or requested' });
    } finally {
      setConnecting({ ...connecting, [id]: false });
    }
  };

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>Discover Students</h1>
          <p style={styles.subtitle}>Search by name, university, department, or skills</p>
        </div>

        <div style={styles.searchBox}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            placeholder="Try 'Python', 'IIT', 'Machine Learning', 'Alice'..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {loading && <div className="spinner" />}

        {results.length > 0 && (
          <div style={styles.grid}>
            {results.map(u => (
              <div key={u.id} className="card fade-in" style={styles.userCard}>
                <div style={styles.cardTop}>
                  <div style={styles.avatar}>{u.fullName.charAt(0)}</div>
                  <div>
                    <div style={styles.name}>{u.fullName}</div>
                    <div style={styles.meta}>{u.university}</div>
                    <div style={styles.meta}>{u.department} • {u.yearOfStudy}</div>
                  </div>
                </div>
                {u.skills && (
                  <div style={styles.skills}>
                    {u.skills.split(',').slice(0, 4).map(s => (
                      <span key={s} className="tag" style={{ fontSize: 11 }}>{s.trim()}</span>
                    ))}
                  </div>
                )}
                <div style={styles.cardActions}>
                  <button className="btn btn-outline btn-sm" onClick={() => navigate(`/profile/${u.id}`)}>View Profile</button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => connect(u.id, u.fullName)}
                    disabled={connecting[u.id] || !!messages[u.id]}
                  >
                    {connecting[u.id] ? '...' : messages[u.id] ? '✓ Sent' : '+ Connect'}
                  </button>
                </div>
                {messages[u.id] && <p style={styles.msg}>{messages[u.id]}</p>}
              </div>
            ))}
          </div>
        )}

        {!loading && query.length > 1 && results.length === 0 && (
          <div style={styles.empty}>
            <div style={{ fontSize: 48 }}>🔍</div>
            <h3>No students found</h3>
            <p>Try a different name or skill</p>
          </div>
        )}

        {query.length <= 1 && (
          <div style={styles.suggestions}>
            <p style={styles.suggestTitle}>Suggested searches</p>
            <div style={styles.suggestTags}>
              {['Python', 'Machine Learning', 'React', 'IoT', 'IIT', 'NIT', 'Research', 'Java'].map(s => (
                <button key={s} style={styles.suggestTag} onClick={() => setQuery(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: { paddingTop: 64, minHeight: '100vh' },
  content: { maxWidth: 1000, margin: '0 auto', padding: '40px 24px' },
  header: { marginBottom: 32 },
  title: { fontSize: 32, fontWeight: 800, color: '#e8eaf0' },
  subtitle: { color: '#6b7280', marginTop: 6 },
  searchBox: { position: 'relative', marginBottom: 32 },
  searchIcon: { position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 18 },
  searchInput: { paddingLeft: 48, fontSize: 16, height: 52, borderRadius: 14 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },
  userCard: { display: 'flex', flexDirection: 'column', gap: 12 },
  cardTop: { display: 'flex', gap: 12, alignItems: 'flex-start' },
  avatar: { width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #6c63ff, #ff6584)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 20, flexShrink: 0 },
  name: { fontWeight: 700, fontSize: 15, color: '#e8eaf0' },
  meta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  skills: { display: 'flex', flexWrap: 'wrap', gap: 4 },
  cardActions: { display: 'flex', gap: 8, marginTop: 4 },
  msg: { fontSize: 12, color: '#43e97b', marginTop: 4 },
  empty: { textAlign: 'center', padding: 60, color: '#6b7280' },
  suggestions: { textAlign: 'center', padding: 40 },
  suggestTitle: { color: '#6b7280', marginBottom: 16, fontSize: 14 },
  suggestTags: { display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  suggestTag: { padding: '8px 16px', background: '#161920', border: '1px solid #2a2f42', borderRadius: 20, color: '#9ca3af', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 14 },
};

export default Discover;
