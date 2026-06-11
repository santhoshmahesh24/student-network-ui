import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await auth.login(form);
      login(res.data);
      navigate('/feed');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div style={styles.brand}>
          <div style={styles.brandIcon}>◈</div>
          <h1 style={styles.brandName}>StudentNet</h1>
          <p style={styles.brandTagline}>Where students connect, collaborate, and grow together.</p>
        </div>
        <div style={styles.floatingCards}>
          {['🎓 Share Resources', '🤝 Build Connections', '🚀 Find Opportunities'].map((t, i) => (
            <div key={i} style={{ ...styles.floatCard, animationDelay: `${i * 0.2}s` }}>{t}</div>
          ))}
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.formCard}>
          <h2 style={styles.title}>Welcome back</h2>
          <p style={styles.subtitle}>Sign in to your account</p>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input
                type="email" placeholder="you@university.edu"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input
                type="password" placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15 }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={styles.switchText}>
            Don't have an account?{' '}
            <Link to="/register" style={styles.link}>Create one</Link>
          </p>

          <div style={styles.demo}>
            <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }}>Demo accounts:</p>
            {[['alice@example.com', 'password123'], ['bob@example.com', 'password123']].map(([e, p]) => (
              <button key={e} style={styles.demoBtn} onClick={() => setForm({ email: e, password: p })}>
                {e}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { display: 'flex', minHeight: '100vh' },
  left: {
    flex: 1, display: 'flex', flexDirection: 'column',
    justifyContent: 'center', padding: '60px',
    background: 'linear-gradient(135deg, #0d0f14 0%, #161920 50%, #1a1060 100%)',
    position: 'relative', overflow: 'hidden',
  },
  brand: { position: 'relative', zIndex: 2 },
  brandIcon: { fontSize: 48, color: '#6c63ff', marginBottom: 16 },
  brandName: { fontSize: 48, fontWeight: 800, color: '#e8eaf0', marginBottom: 16, fontFamily: 'Syne, sans-serif' },
  brandTagline: { fontSize: 18, color: '#6b7280', lineHeight: 1.6, maxWidth: 400 },
  floatingCards: { marginTop: 48, display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', zIndex: 2 },
  floatCard: {
    display: 'inline-block', padding: '12px 20px',
    background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.3)',
    borderRadius: 12, color: '#e8eaf0', fontSize: 15, width: 'fit-content',
    animation: 'fadeIn 0.5s ease forwards', opacity: 0,
  },
  right: {
    width: 480, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 40, background: '#0d0f14',
  },
  formCard: { width: '100%', maxWidth: 380 },
  title: { fontSize: 28, fontWeight: 800, color: '#e8eaf0', marginBottom: 6 },
  subtitle: { color: '#6b7280', marginBottom: 28, fontSize: 15 },
  error: {
    background: 'rgba(255,101,132,0.1)', border: '1px solid rgba(255,101,132,0.3)',
    color: '#ff6584', padding: '10px 14px', borderRadius: 10, marginBottom: 16, fontSize: 14,
  },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 500, color: '#9ca3af' },
  switchText: { textAlign: 'center', color: '#6b7280', fontSize: 14, marginTop: 20 },
  link: { color: '#6c63ff', textDecoration: 'none', fontWeight: 500 },
  demo: { marginTop: 24, padding: 16, background: '#161920', borderRadius: 10, border: '1px solid #2a2f42' },
  demoBtn: {
    display: 'block', width: '100%', padding: '8px 12px', marginBottom: 6,
    background: '#1e2230', border: '1px solid #2a2f42', borderRadius: 8,
    color: '#9ca3af', fontSize: 12, cursor: 'pointer', textAlign: 'left',
    fontFamily: 'DM Sans, sans-serif',
  },
};

export default Login;
