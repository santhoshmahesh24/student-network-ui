import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { users as usersApi, posts as postsApi } from '../services/api';
import Navbar from '../components/Navbar';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const profileId = id || currentUser.userId;
  const isOwnProfile = !id || parseInt(id) === currentUser.userId;

  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connectMsg, setConnectMsg] = useState('');

  useEffect(() => { loadProfile(); }, [profileId]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const [profRes, postsRes] = await Promise.all([
        usersApi.getProfile(profileId),
        postsApi.all(),
      ]);
      setProfile(profRes.data);
      setForm(profRes.data);
      const allPosts = postsRes.data.content || [];
      setUserPosts(allPosts.filter(p => p.author.id === parseInt(profileId)));
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await usersApi.updateProfile(form);
      setProfile(res.data);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const connect = async () => {
    try {
      await usersApi.sendRequest(profileId);
      setConnectMsg('Request sent!');
    } catch (err) {
      setConnectMsg(err.response?.data || 'Already connected');
    }
  };

  if (loading) return <div style={{ paddingTop: 64 }}><Navbar /><div className="spinner" /></div>;
  if (!profile) return null;

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.content}>

        {/* Cover + Avatar */}
        <div style={styles.cover}>
          <div style={styles.coverGradient} />
          <div style={styles.profileHeader}>
            <div style={styles.bigAvatar}>{profile.fullName.charAt(0)}</div>
            <div style={styles.profileInfo}>
              <h1 style={styles.profileName}>{profile.fullName}</h1>
              <p style={styles.profileMeta}>{profile.university} {profile.department && `• ${profile.department}`} {profile.yearOfStudy && `• ${profile.yearOfStudy} year`}</p>
              {profile.bio && <p style={styles.bio}>{profile.bio}</p>}
            </div>
            <div style={styles.profileActions}>
              {isOwnProfile ?
                <button className="btn btn-outline" onClick={() => setEditing(!editing)}>✏️ Edit Profile</button> :
                <div>
                  <button className="btn btn-primary" onClick={connect} disabled={!!connectMsg}>{connectMsg || '+ Connect'}</button>
                </div>
              }
            </div>
          </div>
        </div>

        <div style={styles.body}>
          {/* Left: Edit form or info */}
          <div style={styles.left}>
            {editing ? (
              <div className="card">
                <h3 style={styles.sectionTitle}>Edit Profile</h3>
                {[
                  ['Full Name', 'fullName', 'text'],
                  ['University', 'university', 'text'],
                  ['Department', 'department', 'text'],
                  ['Bio', 'bio', 'textarea'],
                  ['Skills (comma separated)', 'skills', 'text'],
                  ['LinkedIn URL', 'linkedinUrl', 'text'],
                  ['GitHub URL', 'githubUrl', 'text'],
                ].map(([label, key, type]) => (
                  <div key={key} style={{ marginBottom: 14 }}>
                    <label style={styles.label}>{label}</label>
                    {type === 'textarea' ?
                      <textarea value={form[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })} style={{ minHeight: 70 }} /> :
                      <input value={form[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })} />
                    }
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                  <button className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="card">
                <h3 style={styles.sectionTitle}>About</h3>
                {[
                  ['🎓 University', profile.university],
                  ['📚 Department', profile.department],
                  ['📅 Year', profile.yearOfStudy],
                  ['🤝 Connections', profile.connectionCount],
                ].filter(([, v]) => v).map(([label, value]) => (
                  <div key={label} style={styles.infoRow}>
                    <span style={styles.infoLabel}>{label}</span>
                    <span style={styles.infoValue}>{value}</span>
                  </div>
                ))}
                {profile.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" style={styles.socialLink}>🔗 LinkedIn</a>}
                {profile.githubUrl && <a href={profile.githubUrl} target="_blank" rel="noreferrer" style={styles.socialLink}>💻 GitHub</a>}

                {profile.skills && (
                  <div style={{ marginTop: 16 }}>
                    <div style={styles.sectionTitle}>Skills</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                      {profile.skills.split(',').map(s => <span key={s} className="tag">{s.trim()}</span>)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Posts */}
          <div style={styles.right}>
            <h3 style={{ ...styles.sectionTitle, marginBottom: 16 }}>Posts ({userPosts.length})</h3>
            {userPosts.length === 0 ?
              <div style={styles.empty}>No posts yet</div> :
              userPosts.map(p => (
                <div key={p.id} className="card fade-in" style={{ marginBottom: 12 }}>
                  <p style={{ color: '#d1d5db', fontSize: 14, lineHeight: 1.6 }}>{p.content}</p>
                  {p.tags && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>{p.tags.split(',').map(t => <span key={t} className="tag" style={{ fontSize: 11 }}>{t.trim()}</span>)}</div>}
                  <p style={{ color: '#6b7280', fontSize: 12, marginTop: 8 }}>♥ {p.likeCount} • 💬 {p.commentCount}</p>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { paddingTop: 64, minHeight: '100vh' },
  content: { maxWidth: 1000, margin: '0 auto', padding: '0 24px 40px' },
  cover: { position: 'relative', height: 160, marginBottom: 80 },
  coverGradient: { position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1a1060, #161920)', borderRadius: '0 0 16px 16px' },
  profileHeader: { position: 'absolute', bottom: -60, left: 24, right: 24, display: 'flex', alignItems: 'flex-end', gap: 20 },
  bigAvatar: { width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, #6c63ff, #ff6584)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 40, border: '4px solid #0d0f14', flexShrink: 0 },
  profileInfo: { flex: 1, paddingBottom: 8 },
  profileName: { fontSize: 24, fontWeight: 800, color: '#e8eaf0' },
  profileMeta: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  bio: { fontSize: 14, color: '#9ca3af', marginTop: 6, lineHeight: 1.5 },
  profileActions: { paddingBottom: 8 },
  body: { display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 },
  left: {},
  right: {},
  sectionTitle: { fontSize: 15, fontWeight: 700, color: '#e8eaf0', marginBottom: 12, fontFamily: 'Syne, sans-serif' },
  infoRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #2a2f42', fontSize: 13 },
  infoLabel: { color: '#6b7280' },
  infoValue: { color: '#e8eaf0', fontWeight: 500 },
  socialLink: { display: 'inline-block', marginTop: 10, marginRight: 12, color: '#6c63ff', textDecoration: 'none', fontSize: 13 },
  label: { display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 5 },
  empty: { color: '#6b7280', textAlign: 'center', padding: 40 },
};

export default Profile;
