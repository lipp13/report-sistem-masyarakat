const StatusBadge = ({ status, size = 'sm' }) => {
  const config = {
    pending: { label: 'Menunggu', class: 'badge-pending', icon: '⏳' },
    approved: { label: 'Disetujui', class: 'badge-approved', icon: '✅' },
    rejected: { label: 'Ditolak', class: 'badge-rejected', icon: '❌' },
  };
  const s = config[status] || config.pending;

  return (
    <span className={`status-badge ${s.class} badge-${size}`}>
      <span>{s.icon}</span>
      {s.label}
    </span>
  );
};

export default StatusBadge;
