const StatusBadge = ({ status, size = 'sm' }) => {
  const config = {
    pending: { label: 'Menunggu', class: 'status-pending badge-pending', icon: '⏳' },
    in_progress: { label: 'Diproses', class: 'status-in_progress badge-in_progress', icon: '⚡' },
    resolved: { label: 'Selesai', class: 'status-resolved badge-approved', icon: '✅' },
    approved: { label: 'Disetujui', class: 'status-approved badge-approved', icon: '✅' },
    rejected: { label: 'Ditolak', class: 'status-rejected badge-rejected', icon: '❌' },
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
