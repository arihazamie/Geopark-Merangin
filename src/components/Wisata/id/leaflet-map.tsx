"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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
  zoom = 16,
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    fixLeafletIcon();

    if (mapRef.current && !mapInstanceRef.current) {
      const map = L.map(mapRef.current).setView([latitude, longitude], zoom);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([latitude, longitude]).addTo(map);
      marker.bindPopup(`<b>${name}</b>`).openPopup();

      mapInstanceRef.current = map;

      // Load GeoJSON from /data/geopark.geojson
      fetch("/data/geopark.geojson")
        .then((res) => res.json())
        .then((geojsonData) => {
          // Use mapInstanceRef.current and check if it still exists
          const currentMap = mapInstanceRef.current;
          if (!currentMap) return;

          const geoJsonLayer = L.geoJSON(geojsonData, {
            style: {
              color: "blue",
              weight: 2,
              opacity: 0.6,
              fillOpacity: 0.2,
              fillColor: "lightblue",
            },
            onEachFeature: (feature, layer) => {
              if (feature.properties?.name) {
                layer.bindPopup(`<b>${feature.properties.name}</b>`);
              }
            },
          });

          geoJsonLayer.addTo(currentMap);
          geoJsonLayerRef.current = geoJsonLayer;

          currentMap.fitBounds(geoJsonLayer.getBounds());
        })
        .catch((error) => {
          console.error("Error loading GeoJSON:", error);
        });

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 100);
    }

    return () => {
      if (geoJsonLayerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(geoJsonLayerRef.current);
        geoJsonLayerRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, name, zoom]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full min-h-[400px]"
    />
  );
}
