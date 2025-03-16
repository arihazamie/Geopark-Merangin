"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet icon issues
const fixLeafletIcon = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  });
};

interface LeafletMapProps {
  latitude: number;
  longitude: number;
  name: string;
  zoom?: number;
}

export default function LeafletMap({
  latitude,
  longitude,
  name,
  zoom = 13,
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // Fix Leaflet icon issues
    fixLeafletIcon();

    if (mapRef.current && !mapInstanceRef.current) {
      // Initialize map
      const map = L.map(mapRef.current).setView([latitude, longitude], zoom);

      // Add tile layer (OpenStreetMap)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add marker
      const marker = L.marker([latitude, longitude]).addTo(map);
      marker.bindPopup(`<b>${name}</b>`).openPopup();

      // Store map instance
      mapInstanceRef.current = map;

      // Ensure map is properly sized
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, name, zoom]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full"
    />
  );
}
