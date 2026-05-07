import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const ReportCard = ({ report }) => {
  const imageUrl = report.image_url ? `${API_URL}${report.image_url}` : null;

  return (
    <Link to={`/reports/${report.id}`} className="report-card">
      {imageUrl && (
        <div className="card-image">
          <img src={imageUrl} alt={report.title} />
        </div>
      )}
      {!imageUrl && (
        <div className="card-image card-image-placeholder">
          <span>{report.category?.icon || '📋'}</span>
        </div>
      )}
      <div className="card-body">
        <div className="card-meta">
          <span className="card-category" style={{ backgroundColor: report.category?.color + '20', color: report.category?.color }}>
            {report.category?.icon} {report.category?.name}
          </span>
          <StatusBadge status={report.status} />
        </div>
        <h3 className="card-title">{report.title}</h3>
        <p className="card-desc">{report.description}</p>
        {report.location && (
          <p className="card-location">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {report.location}
          </p>
        )}
        <div className="card-footer">
          <div className="card-author">
            <div className="author-avatar">{report.user?.name?.charAt(0)}</div>
            <span>{report.user?.name}</span>
          </div>
          <span className="card-date">
            {new Date(report.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ReportCard;
