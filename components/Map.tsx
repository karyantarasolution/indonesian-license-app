// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { License } from "@/contexts/license-context";

// Fix for missing default icon in react-leaflet
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  licenses: License[];
}

export default function Map({ licenses }: MapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full h-full bg-slate-100 animate-pulse rounded-lg flex items-center justify-center">Memuat Peta...</div>;
  }

  // Default center: Kabupaten Tapin coordinates (approximate)
  const defaultCenter: [number, number] = [-2.9427, 115.1587];

  // Filter licenses that have valid coordinates
  const licensesWithCoords = licenses.filter(
    (license) => license.latitude && license.longitude && !isNaN(Number(license.latitude)) && !isNaN(Number(license.longitude))
  );

  return (
    <MapContainer
      center={defaultCenter}
      zoom={11}
      style={{ height: "100%", width: "100%", zIndex: 0 }}
      className="rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {licensesWithCoords.map((license) => (
        <Marker
          key={license.id}
          position={[Number(license.latitude), Number(license.longitude)]}
        >
          <Popup>
            <div className="p-1">
              <h3 className="font-bold text-sm">{license.namaIzin}</h3>
              <p className="text-xs text-gray-600 mb-1">{license.jenisIzin}</p>
              <p className="text-xs"><strong>Pemohon:</strong> {license.pemohonNama || '-'}</p>
              <p className="text-xs"><strong>Status:</strong> <span className="uppercase text-blue-600">{license.status}</span></p>
              <p className="text-xs mt-1 truncate max-w-[200px]">{license.lokasiIzin}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
