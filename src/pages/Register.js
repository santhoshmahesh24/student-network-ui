import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', university: '', department: '', yearOfStudy: '1st' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await auth.register(form);
      login(res.data);
      navigate('/feed');
    } catch (err) {
      setError(err.response?.data || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.logo}>◈ StudentNet</div>
          <h2 style={styles.title}>Create your account</h2>
          <p style={styles.subtitle}>Join thousands of students already on the platform</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Full Name</label>
              <input placeholder="Ravi Kumar" value={form.fullName} onChange={set('fullName')} required />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input type="email" placeholder="ravi@college.edu" value={form.email} onChange={set('email')} required />
            </div>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input type="password" placeholder="Min. 8 characters" value={form.password} onChange={set('password')} required minLength={8} />
          </div>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>University</label>
              <input placeholder="IIT Madras" value={form.university} onChange={set('university')} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Department</label>
              <input placeholder="Computer Science" value={form.department} onChange={set('department')} />
            </div>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Year of Study</label>
            <select value={form.yearOfStudy} onChange={set('yearOfStudy')}>
              {['1st', '2nd', '3rd', '4th', 'Postgrad'].map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15 }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.switchText}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'radial-gradient(ellipse at top, #1a1060 0%, #0d0f14 60%)' },
  container: { width: '100%', maxWidth: 560, background: '#161920', border: '1px solid #2a2f42', borderRadius: 20, padding: 40 },
  header: { textAlign: 'center', marginBottom: 32 },
  logo: { fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: '#6c63ff', marginBottom: 16 },
  title: { fontSize: 26, fontWeight: 800, color: '#e8eaf0', marginBottom: 6 },
  subtitle: { color: '#6b7280', fontSize: 14 },
  error: { background: 'rgba(255,101,132,0.1)', border: '1px solid rgba(255,101,132,0.3)', color: '#ff6584', padding: '10px 14px', borderRadius: 10, marginBottom: 16, fontSize: 14 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 500, color: '#9ca3af' },
  switchText: { textAlign: 'center', color: '#6b7280', fontSize: 14, marginTop: 20 },
  link: { color: '#6c63ff', textDecoration: 'none', fontWeight: 500 },
};

export default Register;
