import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Interactive OpenStreetMap map (free tiles, no key) via Leaflet.
// markers: [{ lat, lon, label, color, kind }]
export default function VenueMap({
  center = [40.8135, -74.0745], zoom = 14, markers = [], height = 320, style, interactive = true,
}) {
  const elRef = useRef(null)
  const mapRef = useRef(null)
  const layerRef = useRef(null)

  useEffect(() => {
    if (!elRef.current || mapRef.current) return
    const map = L.map(elRef.current, {
      scrollWheelZoom: false, zoomControl: interactive, dragging: interactive,
      doubleClickZoom: interactive, attributionControl: true,
    }).setView(center, zoom)
    mapRef.current = map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '&copy; OpenStreetMap',
    }).addTo(map)
    layerRef.current = L.layerGroup().addTo(map)
    const t = setTimeout(() => map.invalidateSize(), 120)
    return () => { clearTimeout(t); map.remove(); mapRef.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const map = mapRef.current, layer = layerRef.current
    if (!map || !layer) return
    layer.clearLayers()
    markers.forEach(m => {
      const color = m.color || '#0a7d3e'
      const icon = L.divIcon({
        className: '', iconSize: [26, 26], iconAnchor: [13, 26],
        html: `<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);
          background:${color};border:2px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,.35)"></div>`,
      })
      const mk = L.marker([m.lat, m.lon], { icon }).addTo(layer)
      if (m.label) mk.bindPopup(`<b>${m.label}</b>`)
    })
    map.setView(center, zoom)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(markers), center[0], center[1], zoom])

  return (
    <div
      ref={elRef}
      style={{ height, width: '100%', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--line)', ...style }}
      aria-label="Venue map"
    />
  )
}
