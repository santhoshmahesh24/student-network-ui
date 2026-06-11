import React, { useState, useEffect } from 'react';
import { posts as postsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const PostCard = ({ post, onLike, onDelete, currentUserId }) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  const typeColors = { GENERAL: '#6c63ff', RESOURCE: '#43e97b', ACHIEVEMENT: '#ff6584' };
  const typeLabels = { GENERAL: '💬 Post', RESOURCE: '📚 Resource', ACHIEVEMENT: '🏆 Achievement' };

  const loadComments = async () => {
    if (!showComments) {
      setLoadingComments(true);
      const res = await postsApi.getComments(post.id);
      setComments(res.data);
      setLoadingComments(false);
    }
    setShowComments(!showComments);
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const res = await postsApi.addComment(post.id, newComment);
    setComments([...comments, res.data]);
    setNewComment('');
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="card fade-in" style={styles.postCard}>
      <div style={styles.postHeader}>
        <div style={styles.authorAvatar}>
          {post.author.fullName.charAt(0)}
        </div>
        <div style={styles.authorInfo}>
          <div style={styles.authorName}>{post.author.fullName}</div>
          <div style={styles.authorMeta}>
            {post.author.university} • {post.author.yearOfStudy} • {timeAgo(post.createdAt)}
          </div>
        </div>
        <span style={{ ...styles.typeTag, background: `${typeColors[post.type]}22`, color: typeColors[post.type] }}>
          {typeLabels[post.type]}
        </span>
      </div>

      <p style={styles.postContent}>{post.content}</p>

      {post.resourceUrl && (
        <a href={post.resourceUrl} target="_blank" rel="noreferrer" style={styles.resourceLink}>
          <span>🔗</span>
          <span>{post.resourceTitle || post.resourceUrl}</span>
          <span style={{ marginLeft: 'auto', color: '#6b7280' }}>↗</span>
        </a>
      )}

      {post.tags && (
        <div style={styles.tagsRow}>
          {post.tags.split(',').map(t => (
            <span key={t} className="tag">{t.trim()}</span>
          ))}
        </div>
      )}

      <div style={styles.postActions}>
        <button style={styles.actionBtn} onClick={() => onLike(post.id)}>
          ♥ {post.likeCount}
        </button>
        <button style={styles.actionBtn} onClick={loadComments}>
          💬 {post.commentCount} {showComments ? '▲' : '▼'}
        </button>
        {post.author.id === currentUserId && (
          <button style={{ ...styles.actionBtn, color: '#ff6584', marginLeft: 'auto' }} onClick={() => onDelete(post.id)}>
            🗑 Delete
          </button>
        )}
      </div>

      {showComments && (
        <div style={styles.commentsSection}>
          {loadingComments ? <div style={{ color: '#6b7280', fontSize: 13 }}>Loading...</div> :
            comments.map(c => (
              <div key={c.id} style={styles.comment}>
                <div style={styles.commentAvatar}>{c.author.fullName.charAt(0)}</div>
                <div>
                  <span style={styles.commentAuthor}>{c.author.fullName}</span>
                  <p style={styles.commentText}>{c.content}</p>
                </div>
              </div>
            ))
          }
          <form onSubmit={submitComment} style={styles.commentForm}>
            <input placeholder="Write a comment..." value={newComment} onChange={e => setNewComment(e.target.value)} style={{ flex: 1 }} />
            <button type="submit" className="btn btn-primary btn-sm">Post</button>
          </form>
        </div>
      )}
    </div>
  );
};

const Feed = () => {
  const [feedPosts, setFeedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState({ content: '', type: 'GENERAL', tags: '', resourceUrl: '', resourceTitle: '' });
  const [posting, setPosting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      const res = await postsApi.feed();
      setFeedPosts(res.data.content || []);
    } catch {
      const res = await postsApi.all();
      setFeedPosts(res.data.content || []);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newPost.content.trim()) return;
    setPosting(true);
    try {
      const res = await postsApi.create(newPost);
      setFeedPosts([res.data, ...feedPosts]);
      setNewPost({ content: '', type: 'GENERAL', tags: '', resourceUrl: '', resourceTitle: '' });
      setShowForm(false);
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (id) => {
    const res = await postsApi.like(id);
    setFeedPosts(feedPosts.map(p => p.id === id ? { ...p, likeCount: res.data.likeCount } : p));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    await postsApi.delete(id);
    setFeedPosts(feedPosts.filter(p => p.id !== id));
  };

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.content}>
        <div style={styles.main}>

          {/* Create Post */}
          <div className="card" style={styles.createCard}>
            <div style={styles.createTop} onClick={() => setShowForm(!showForm)}>
              <div style={styles.miniAvatar}>{user?.fullName?.charAt(0)}</div>
              <div style={styles.createPlaceholder}>What's on your mind, {user?.fullName?.split(' ')[0]}?</div>
              <span style={{ color: '#6b7280' }}>{showForm ? '▲' : '▼'}</span>
            </div>

            {showForm && (
              <form onSubmit={handlePost} style={styles.postForm}>
                <textarea
                  placeholder="Share knowledge, ask questions, celebrate wins..."
                  value={newPost.content}
                  onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                  style={{ minHeight: 100, resize: 'vertical', marginTop: 12 }}
                  required
                />
                <div style={styles.postFormRow}>
                  <select value={newPost.type} onChange={e => setNewPost({ ...newPost, type: e.target.value })} style={{ flex: 1 }}>
                    <option value="GENERAL">💬 General</option>
                    <option value="RESOURCE">📚 Resource</option>
                    <option value="ACHIEVEMENT">🏆 Achievement</option>
                  </select>
                  <input placeholder="Tags (comma separated)" value={newPost.tags} onChange={e => setNewPost({ ...newPost, tags: e.target.value })} style={{ flex: 2 }} />
                </div>
                {newPost.type === 'RESOURCE' && (
                  <div style={styles.postFormRow}>
                    <input placeholder="Resource URL" value={newPost.resourceUrl} onChange={e => setNewPost({ ...newPost, resourceUrl: e.target.value })} style={{ flex: 2 }} />
                    <input placeholder="Resource Title" value={newPost.resourceTitle} onChange={e => setNewPost({ ...newPost, resourceTitle: e.target.value })} style={{ flex: 1 }} />
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={posting}>{posting ? 'Posting...' : 'Post'}</button>
                </div>
              </form>
            )}
          </div>

          {/* Posts */}
          {loading ? <div className="spinner" /> :
            feedPosts.length === 0 ?
              <div style={styles.empty}>
                <div style={{ fontSize: 48 }}>⚡</div>
                <h3>Your feed is empty</h3>
                <p>Connect with other students to see their posts here</p>
              </div> :
              feedPosts.map(p => (
                <PostCard key={p.id} post={p} onLike={handleLike} onDelete={handleDelete} currentUserId={user?.userId} />
              ))
          }
        </div>

        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div className="card" style={{ padding: 20 }}>
            <h3 style={styles.sidebarTitle}>Quick Stats</h3>
            <div style={styles.statRow}><span>📝 Posts in feed</span><strong>{feedPosts.length}</strong></div>
            <div style={styles.statRow}><span>🎓 Your role</span><strong style={{ color: '#6c63ff' }}>{user?.role}</strong></div>
          </div>
          <div className="card" style={{ padding: 20, marginTop: 16 }}>
            <h3 style={styles.sidebarTitle}>Post Types</h3>
            <p style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.6 }}>
              💬 <strong style={{ color: '#e8eaf0' }}>General</strong> — questions & discussions<br />
              📚 <strong style={{ color: '#e8eaf0' }}>Resource</strong> — share links & materials<br />
              🏆 <strong style={{ color: '#e8eaf0' }}>Achievement</strong> — celebrate wins
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { paddingTop: 64, minHeight: '100vh', background: '#0d0f14' },
  content: { maxWidth: 1100, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 },
  main: { display: 'flex', flexDirection: 'column', gap: 16 },
  sidebar: {},
  createCard: { cursor: 'pointer' },
  createTop: { display: 'flex', alignItems: 'center', gap: 12 },
  miniAvatar: { width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #6c63ff, #ff6584)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, flexShrink: 0 },
  createPlaceholder: { flex: 1, color: '#6b7280', fontSize: 14 },
  postForm: { display: 'flex', flexDirection: 'column', gap: 10 },
  postFormRow: { display: 'flex', gap: 10 },
  postCard: { animation: 'fadeIn 0.3s ease' },
  postHeader: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 },
  authorAvatar: { width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #6c63ff, #43e97b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0 },
  authorInfo: { flex: 1 },
  authorName: { fontWeight: 600, fontSize: 15, color: '#e8eaf0' },
  authorMeta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  typeTag: { padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500 },
  postContent: { color: '#d1d5db', lineHeight: 1.7, fontSize: 15, marginBottom: 12 },
  resourceLink: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 10, color: '#6c63ff', textDecoration: 'none', fontSize: 14, marginBottom: 12 },
  tagsRow: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  postActions: { display: 'flex', gap: 8, paddingTop: 12, borderTop: '1px solid #2a2f42' },
  actionBtn: { background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '6px 12px', borderRadius: 8, fontSize: 14, fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s' },
  commentsSection: { marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10, padding: 12, background: '#1e2230', borderRadius: 10 },
  comment: { display: 'flex', gap: 8, alignItems: 'flex-start' },
  commentAvatar: { width: 28, height: 28, borderRadius: '50%', background: '#6c63ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0 },
  commentAuthor: { fontSize: 13, fontWeight: 600, color: '#e8eaf0', marginRight: 8 },
  commentText: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
  commentForm: { display: 'flex', gap: 8, marginTop: 4 },
  empty: { textAlign: 'center', padding: 60, color: '#6b7280' },
  sidebarTitle: { fontSize: 14, fontWeight: 700, color: '#e8eaf0', marginBottom: 14 },
  statRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #2a2f42', fontSize: 13, color: '#9ca3af' },
};

export default Feed;
