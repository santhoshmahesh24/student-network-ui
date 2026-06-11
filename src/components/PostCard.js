import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { likePost, addComment, getComments, deletePost } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [likes, setLikes] = useState(post.likeCount);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  const initial = post.author?.fullName?.charAt(0).toUpperCase() || '?';

  const handleLike = async () => {
    try {
      const res = await likePost(post.id);
      setLikes(res.data.likeCount);
    } catch (e) {}
  };

  const handleToggleComments = async () => {
    setShowComments(!showComments);
    if (!showComments && comments.length === 0) {
      setLoadingComments(true);
      try {
        const res = await getComments(post.id);
        setComments(res.data);
      } catch (e) {}
      setLoadingComments(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await addComment(post.id, { content: commentText });
      setComments([...comments, res.data]);
      setCommentText('');
    } catch (e) {}
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await deletePost(post.id);
      if (onDelete) onDelete(post.id);
    } catch (e) {}
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
    <div className="card post-card">
      <div className="post-header">
        <div className="post-avatar" onClick={() => navigate(`/profile/${post.author?.id}`)} style={{ cursor: 'pointer' }}>
          {initial}
        </div>
        <div style={{ flex: 1 }}>
          <div className="post-author-name" onClick={() => navigate(`/profile/${post.author?.id}`)} style={{ cursor: 'pointer' }}>
            {post.author?.fullName}
          </div>
          <div className="post-meta">
            {post.author?.university} · {post.author?.yearOfStudy} · {timeAgo(post.createdAt)}
          </div>
        </div>
        <span className={`post-type-badge badge-${post.type}`}>{post.type}</span>
      </div>

      <div className="post-content">{post.content}</div>

      {post.resourceUrl && (
        <a href={post.resourceUrl} target="_blank" rel="noreferrer" className="post-resource-link">
          🔗 <span>{post.resourceTitle || post.resourceUrl}</span>
        </a>
      )}

      {post.tags && (
        <div className="post-tags">
          {post.tags.split(',').map(t => (
            <span key={t} className="tag">#{t.trim()}</span>
          ))}
        </div>
      )}

      <div className="post-actions">
        <button className="action-btn" onClick={handleLike}>👍 {likes}</button>
        <button className="action-btn" onClick={handleToggleComments}>
          💬 {post.commentCount} Comments
        </button>
        {user?.userId === post.author?.id && (
          <button className="action-btn" onClick={handleDelete} style={{ marginLeft: 'auto', color: '#e41e3f' }}>
            🗑 Delete
          </button>
        )}
      </div>

      {showComments && (
        <div className="comments-section">
          {loadingComments && <div style={{ color: '#65676b', fontSize: 13 }}>Loading comments...</div>}
          {comments.map(c => (
            <div key={c.id} className="comment">
              <div className="comment-avatar">{c.author?.fullName?.charAt(0)}</div>
              <div className="comment-body">
                <div className="comment-author">{c.author?.fullName}</div>
                <div className="comment-text">{c.content}</div>
              </div>
            </div>
          ))}
          <form className="comment-input-row" onSubmit={handleComment}>
            <input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Write a comment..."
            />
            <button type="submit">Post</button>
          </form>
        </div>
      )}
    </div>
  );
}
