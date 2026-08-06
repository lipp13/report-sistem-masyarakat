import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../map/leafletSetup';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function ReportsMap({ reports }) {
  // Filter reports that have latitude and longitude
  const validReports = reports.filter(
    (r) => r.latitude !== null && r.longitude !== null && !isNaN(parseFloat(r.latitude)) && !isNaN(parseFloat(r.longitude))
  );

  // Default center (Jakarta or first report)
  const center = validReports.length > 0
    ? [parseFloat(validReports[0].latitude), parseFloat(validReports[0].longitude)]
    : [-6.2088, 106.8456];

  return (
    <div style={{ height: '520px', width: '100%', borderRadius: 'var(--lm-radius-lg)', overflow: 'hidden', border: '1px solid var(--lm-surface1)', boxShadow: 'var(--lm-shadow)' }}>
      <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validReports.map((report) => {
          const lat = parseFloat(report.latitude);
          const lng = parseFloat(report.longitude);
          const imageUrl = report.image_url ? `${API_URL}${report.image_url}` : null;

          return (
            <Marker key={report.id} position={[lat, lng]}>
              <Popup>
                <div style={{ padding: '4px', maxWidth: '220px', color: '#1e1e2e' }}>
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt={report.title}
                      style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px', marginBottom: '6px' }}
                    />
                  )}
                  <div style={{ marginBottom: '4px' }}>
                    <StatusBadge status={report.status} size="sm" />
                  </div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 'bold' }}>{report.title}</h4>
                  <p style={{ margin: '0 0 6px', fontSize: '0.8rem', color: '#555' }}>
                    {report.location || 'Tanpa keterangan lokasi'}
                  </p>
                  <Link
                    to={`/reports/${report.id}`}
                    style={{
                      display: 'inline-block',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      color: '#3b82f6',
                      textDecoration: 'none',
                    }}
                  >
                    Lihat Detail →
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
