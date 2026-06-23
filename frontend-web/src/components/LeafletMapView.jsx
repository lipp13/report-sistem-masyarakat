import "../map/leafletSetup";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { useEffect } from "react";

/** Default Indonesia */
export const DEFAULT_MAP_CENTER = [-2.5, 118];
export const DEFAULT_MAP_ZOOM = 5;

function SyncMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center[0], center[1], zoom, map]);
  return null;
}

function MapClickLayer({ onMapClick, interactive }) {
  useMapEvents({
    click(e) {
      if (interactive && onMapClick) onMapClick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

/**
 * @param {object} props
 * @param {[number, number]} props.center — [lat, lng]
 * @param {number} props.zoom
 * @param {[number, number] | null} props.markerPosition
 * @param {(pos: [number, number]) => void} [props.onMapClick]
 * @param {(pos: [number, number]) => void} [props.onMarkerDragEnd]
 * @param {string} [props.className]
 * @param {number} [props.heightPx]
 * @param {boolean} [props.scrollWheelZoom]
 */
export default function LeafletMapView({
  center,
  zoom = 14,
  markerPosition,
  onMapClick,
  onMarkerDragEnd,
  className = "",
  heightPx = 240,
  scrollWheelZoom = true,
}) {
  const interactive = Boolean(onMapClick || onMarkerDragEnd);

  return (
    <div
      className={`leaflet-map-wrap ${className}`.trim()}
      style={{ height: heightPx, borderRadius: "var(--lm-radius-sm)" }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={scrollWheelZoom}
        dragging
        doubleClickZoom={interactive}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <SyncMapView center={center} zoom={zoom} />
        <MapClickLayer onMapClick={onMapClick} interactive={interactive} />
        {markerPosition ? (
          <Marker
            position={markerPosition}
            draggable={Boolean(onMarkerDragEnd)}
            eventHandlers={{
              dragend: (e) => {
                const p = e.target.getLatLng();
                onMarkerDragEnd?.([p.lat, p.lng]);
              },
            }}
          />
        ) : null}
      </MapContainer>
    </div>
  );
}
