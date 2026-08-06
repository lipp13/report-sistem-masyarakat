import { useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { ThumbsUp, MapPin, MessageSquare } from 'lucide-react';
import api from '../api/client';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const ReportCard = ({ report, onVoteSuccess }) => {
  const [votesCount, setVotesCount] = useState(report.votes_count || 0);
  const [hasVoted, setHasVoted] = useState(!!report.has_voted);
  const [voting, setVoting] = useState(false);

  const imageUrl = report.image_url ? `${API_URL}${report.image_url}` : null;

  const handleVote = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (voting) return;
    setVoting(true);

    try {
      const res = await api.post(`/reports/${report.id}/vote`);
      if (res.data?.success) {
        setVotesCount(res.data.data.votes_count);
        setHasVoted(res.data.data.has_voted);
        toast.success(res.data.message);
        if (onVoteSuccess) onVoteSuccess(report.id, res.data.data);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error('Silakan login terlebih dahulu untuk mendukung laporan.');
      } else {
        toast.error('Gagal memproses dukungan.');
      }
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="report-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Link to={`/reports/${report.id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
        {imageUrl ? (
          <div className="card-image">
            <img src={imageUrl} alt={report.title} loading="lazy" />
          </div>
        ) : (
          <div className="card-image card-image-placeholder">
            <span>{report.category?.icon || '📋'}</span>
          </div>
        )}
      </Link>

      <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="card-meta">
          <span className="card-category" style={{ backgroundColor: (report.category?.color || '#3b82f6') + '20', color: report.category?.color || '#3b82f6' }}>
            {report.category?.icon} {report.category?.name}
          </span>
          <StatusBadge status={report.status} />
        </div>

        <Link to={`/reports/${report.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3 className="card-title">{report.title}</h3>
        </Link>

        <p className="card-desc">{report.description}</p>

        {report.location && (
          <p className="card-location">
            <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
            {report.location}
          </p>
        )}

        <div className="card-footer" style={{ marginTop: 'auto', paddingTop: '0.85rem' }}>
          <div className="card-author">
            <div className="author-avatar">{report.user?.name?.charAt(0) || 'W'}</div>
            <span>{report.user?.name || 'Warga'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              onClick={handleVote}
              className={`btn-vote ${hasVoted ? 'voted' : ''}`}
              title="Dukung laporan ini agar ditindaklanjuti lebih cepat"
            >
              <ThumbsUp size={14} className="vote-icon" />
              <span>{votesCount}</span>
            </button>

            {report.comments_count !== undefined && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--lm-subtext0)' }}>
                <MessageSquare size={14} />
                {report.comments_count}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;
