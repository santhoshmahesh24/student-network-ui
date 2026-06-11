import React, { useState, useEffect } from 'react';
import { opportunities as oppsApi } from '../services/api';
import Navbar from '../components/Navbar';

const typeColors = { INTERNSHIP: '#6c63ff', PROJECT: '#43e97b', RESEARCH: '#ff6584', JOB: '#f59e0b', HACKATHON: '#06b6d4', SCHOLARSHIP: '#a78bfa' };
const typeIcons = { INTERNSHIP: '💼', PROJECT: '🔨', RESEARCH: '🔬', JOB: '🏢', HACKATHON: '⚡', SCHOLARSHIP: '🎓' };

const OppCard = ({ opp, onClose, isOwner }) => {
  const [expanded, setExpanded] = useState(false);
  const color = typeColors[opp.type] || '#6c63ff';

  const daysLeft = opp.deadline ? Math.max(0, Math.ceil((new Date(opp.deadline) - Date.now()) / 86400000)) : null;

  return (
    <div className="card fade-in" style={{ ...styles.card, borderLeft: `3px solid ${color}` }}>
      <div style={styles.cardHeader}>
        <span style={{ ...styles.typeBadge, background: `${color}22`, color }}>{typeIcons[opp.type]} {opp.type}</span>
        {opp.isPaid && <span className="tag tag-green">💰 Paid</span>}
        {daysLeft !== null && <span style={{ ...styles.deadline, color: daysLeft < 7 ? '#ff6584' : '#6b7280' }}>⏰ {daysLeft}d left</span>}
      </div>

      <h3 style={styles.cardTitle}>{opp.title}</h3>
      <p style={styles.company}>{opp.company || opp.postedBy.fullName} • {opp.location || 'Location TBD'}</p>
      {opp.stipend && <p style={styles.stipend}>{opp.stipend}</p>}

      <p style={{ color: '#9ca3af', fontSize: 14, lineHeight: 1.6, marginTop: 8 }}>
        {expanded ? opp.description : `${opp.description.substring(0, 120)}...`}
        <button onClick={() => setExpanded(!expanded)} style={styles.moreBtn}>{expanded ? 'less' : 'more'}</button>
      </p>

      {opp.requiredSkills && (
        <div style={styles.skills}>
          {opp.requiredSkills.split(',').map(s => <span key={s} className="tag" style={{ fontSize: 11 }}>{s.trim()}</span>)}
        </div>
      )}

      <div style={styles.cardFooter}>
        <span style={styles.poster}>Posted by {opp.postedBy.fullName}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {isOwner && <button className="btn btn-danger btn-sm" onClick={() => onClose(opp.id)}>Close</button>}
          {opp.applyUrl && (
            <a href={opp.applyUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>Apply →</a>
          )}
        </div>
      </div>
    </div>
  );
};

const Opportunities = () => {
  const [opps, setOpps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', type: 'INTERNSHIP', company: '', location: '', isPaid: false, stipend: '', requiredSkills: '', applyUrl: '', deadline: '' });
  const [posting, setPosting] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { loadOpps(); }, [filter]);

  const loadOpps = async () => {
    setLoading(true);
    try {
      const res = filter === 'ALL' ? await oppsApi.all() : await oppsApi.byType(filter);
      setOpps(res.data.content || []);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return loadOpps();
    setLoading(true);
    const res = await oppsApi.search(search);
    setOpps(res.data.content || []);
    setLoading(false);
  };

  const handlePost = async (e) => {
    e.preventDefault();
    setPosting(true);
    try {
      const res = await oppsApi.create(form);
      setOpps([res.data, ...opps]);
      setShowForm(false);
      setForm({ title: '', description: '', type: 'INTERNSHIP', company: '', location: '', isPaid: false, stipend: '', requiredSkills: '', applyUrl: '', deadline: '' });
    } finally {
      setPosting(false);
    }
  };

  const handleClose = async (id) => {
    if (!window.confirm('Close this opportunity?')) return;
    await oppsApi.close(id);
    setOpps(opps.filter(o => o.id !== id));
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const types = ['ALL', 'INTERNSHIP', 'PROJECT', 'RESEARCH', 'JOB', 'HACKATHON', 'SCHOLARSHIP'];

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.content}>
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.title}>Opportunities</h1>
            <p style={styles.subtitle}>Internships, research, projects, hackathons & more</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ Post Opportunity</button>
        </div>

        {showForm && (
          <div className="card fade-in" style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 16, fontFamily: 'Syne, sans-serif' }}>Post an Opportunity</h3>
            <form onSubmit={handlePost} style={styles.form}>
              <div style={styles.row}>
                <div style={styles.field}><label style={styles.label}>Title *</label><input placeholder="Android Developer Intern" value={form.title} onChange={set('title')} required /></div>
                <div style={styles.field}><label style={styles.label}>Type *</label>
                  <select value={form.type} onChange={set('type')}>
                    {['INTERNSHIP','PROJECT','RESEARCH','JOB','HACKATHON','SCHOLARSHIP'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div style={styles.field}><label style={styles.label}>Description *</label><textarea placeholder="Describe the opportunity..." value={form.description} onChange={set('description')} style={{ minHeight: 80 }} required /></div>
              <div style={styles.row}>
                <div style={styles.field}><label style={styles.label}>Company / Organization</label><input placeholder="Zoho, IIT Lab..." value={form.company} onChange={set('company')} /></div>
                <div style={styles.field}><label style={styles.label}>Location</label><input placeholder="Chennai / Remote" value={form.location} onChange={set('location')} /></div>
              </div>
              <div style={styles.row}>
                <div style={styles.field}><label style={styles.label}>Required Skills</label><input placeholder="Java, Python, React" value={form.requiredSkills} onChange={set('requiredSkills')} /></div>
                <div style={styles.field}><label style={styles.label}>Apply URL</label><input placeholder="https://..." value={form.applyUrl} onChange={set('applyUrl')} /></div>
              </div>
              <div style={styles.row}>
                <div style={styles.field}><label style={styles.label}>Deadline</label><input type="date" value={form.deadline} onChange={set('deadline')} /></div>
                <div style={styles.field}><label style={styles.label}>Stipend (if paid)</label><input placeholder="₹15,000/month" value={form.stipend} onChange={set('stipend')} /></div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9ca3af', fontSize: 14, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isPaid} onChange={set('isPaid')} style={{ width: 'auto' }} />
                This is a paid opportunity
              </label>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={posting}>{posting ? 'Posting...' : 'Post Opportunity'}</button>
              </div>
            </form>
          </div>
        )}

        <div style={styles.controls}>
          <div style={styles.filters}>
            {types.map(t => (
              <button key={t} onClick={() => setFilter(t)} style={{ ...styles.filterBtn, ...(filter === t ? styles.filterActive : {}) }}>{t === 'ALL' ? 'All' : `${typeIcons[t]} ${t}`}</button>
            ))}
          </div>
          <form onSubmit={handleSearch} style={styles.searchRow}>
            <input placeholder="Search by skill, company, title..." value={search} onChange={e => setSearch(e.target.value)} />
            <button type="submit" className="btn btn-outline btn-sm">Search</button>
          </form>
        </div>

        {loading ? <div className="spinner" /> :
          opps.length === 0 ?
            <div style={styles.empty}><div style={{ fontSize: 48 }}>🚀</div><h3>No opportunities found</h3></div> :
            <div style={styles.grid}>
              {opps.map(o => <OppCard key={o.id} opp={o} onClose={handleClose} isOwner={o.postedBy.id === currentUser.userId} />)}
            </div>
        }
      </div>
    </div>
  );
};

const styles = {
  page: { paddingTop: 64, minHeight: '100vh' },
  content: { maxWidth: 1100, margin: '0 auto', padding: '40px 24px' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  title: { fontSize: 32, fontWeight: 800, color: '#e8eaf0' },
  subtitle: { color: '#6b7280', marginTop: 6 },
  controls: { marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 12 },
  filters: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  filterBtn: { padding: '7px 14px', borderRadius: 20, border: '1px solid #2a2f42', background: 'transparent', color: '#9ca3af', cursor: 'pointer', fontSize: 13, fontFamily: 'DM Sans, sans-serif' },
  filterActive: { background: 'rgba(108,99,255,0.15)', borderColor: '#6c63ff', color: '#6c63ff' },
  searchRow: { display: 'flex', gap: 8 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 },
  card: { display: 'flex', flexDirection: 'column', gap: 8 },
  cardHeader: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  typeBadge: { padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  deadline: { fontSize: 12, marginLeft: 'auto' },
  cardTitle: { fontSize: 17, fontWeight: 700, color: '#e8eaf0' },
  company: { fontSize: 13, color: '#6b7280' },
  stipend: { fontSize: 13, color: '#43e97b', fontWeight: 600 },
  skills: { display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 10, borderTop: '1px solid #2a2f42' },
  poster: { fontSize: 12, color: '#6b7280' },
  moreBtn: { background: 'none', border: 'none', color: '#6c63ff', cursor: 'pointer', fontSize: 13, fontFamily: 'DM Sans, sans-serif', marginLeft: 4 },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  field: { display: 'flex', flexDirection: 'column', gap: 5 },
  label: { fontSize: 12, color: '#9ca3af', fontWeight: 500 },
  empty: { textAlign: 'center', padding: 60, color: '#6b7280' },
};

export default Opportunities;
