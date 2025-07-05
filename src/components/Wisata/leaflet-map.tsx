"use client";
import { useEffect, useRef, useState } from "react";
import { Map } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface LeafletMapProps {
  attractions: Array<{
    id: number;
    name: string;
    latitude?: number;
    longitude?: number;
    type?: string;
    location: string;
  }>;
  zoom?: number;
  isVisible?: boolean; // Add this new prop
}

export default function LeafletMap({
  attractions,
  zoom = 10,
  isVisible = true,
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const geoJsonLayerRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    const loadLeaflet = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        // Dynamic import of Leaflet to ensure it only loads on client
        const L = (await import("leaflet")).default;

        // Fix Leaflet icon issue
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
          iconUrl:
            "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
          shadowUrl:
            "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        });

        // Clean up existing map first
        if (mapInstanceRef.current) {
          markersRef.current.forEach((marker) => {
            try {
              marker.remove();
            } catch (e) {
              console.warn("Error removing marker:", e);
            }
          });
          markersRef.current = [];

          if (geoJsonLayerRef.current) {
            try {
              mapInstanceRef.current.removeLayer(geoJsonLayerRef.current);
            } catch (e) {
              console.warn("Error removing GeoJSON layer:", e);
            }
            geoJsonLayerRef.current = null;
          }

          try {
            mapInstanceRef.current.remove();
          } catch (e) {
            console.warn("Error removing map:", e);
          }
          mapInstanceRef.current = null;
        }

        // Don't create map if no attractions or no valid coordinates
        if (!attractions || attractions.length === 0) {
          setIsLoading(false);
          return;
        }

        // Filter attractions with valid coordinates
        const validAttractions = attractions.filter(
          (attraction) =>
            attraction.latitude &&
            attraction.longitude &&
            !isNaN(attraction.latitude) &&
            !isNaN(attraction.longitude)
        );

        if (validAttractions.length === 0) {
          console.warn("No attractions with valid coordinates found");
          setIsLoading(false);
          return;
        }

        if (!mapRef.current) {
          console.warn("Map container ref not available");
          setIsLoading(false);
          return;
        }

        // Create map centered on first valid attraction
        const firstAttraction = validAttractions[0];
        const map = L.map(mapRef.current).setView(
          [firstAttraction.latitude!, firstAttraction.longitude!],
          zoom
        );

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;

        // Create custom icons for different types
        const createCustomIcon = (type?: string) => {
          let color = "#3B82F6"; // Default blue
          let emoji = "📍";

          switch (type) {
            case "Geologi":
              color = "#EF4444"; // Red
              emoji = "🏔️";
              break;
            case "Biologi":
              color = "#10B981"; // Green
              emoji = "🌿";
              break;
            case "Budaya":
              color = "#F59E0B"; // Orange
              emoji = "🏛️";
              break;
          }

          return L.divIcon({
            html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-size: 14px;">${emoji}</div>`,
            className: "custom-marker",
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15],
          });
        };

        // Add markers for all valid attractions
        const bounds = L.latLngBounds([]);

        validAttractions.forEach((attraction) => {
          try {
            const marker = L.marker(
              [attraction.latitude!, attraction.longitude!],
              {
                icon: createCustomIcon(attraction.type),
              }
            ).addTo(map);

            marker.bindPopup(`
              <div style="min-width: 200px;">
                <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">${
                  attraction.name
                }</h3>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">📍 ${
                  attraction.location
                }</p>
                ${
                  attraction.type
                    ? `<span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${attraction.type}</span>`
                    : ""
                }
              </div>
            `);

            markersRef.current.push(marker);
            bounds.extend([attraction.latitude!, attraction.longitude!]);
          } catch (e) {
            console.warn(`Error creating marker for ${attraction.name}:`, e);
          }
        });

        // Fit map to show all markers
        if (validAttractions.length > 1) {
          try {
            map.fitBounds(bounds, { padding: [20, 20] });
          } catch (e) {
            console.warn("Error fitting bounds:", e);
          }
        }

        // Load GeoJSON from /data/geopark.geojson
        fetch("/data/geopark.geojson")
          .then((res) => res.json())
          .then((geojsonData) => {
            const currentMap = mapInstanceRef.current;
            if (!currentMap) return;

            try {
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
            } catch (e) {
              console.warn("Error adding GeoJSON layer:", e);
            }
          })
          .catch((error) => {
            console.error("Error loading GeoJSON:", error);
          });

        // Invalidate size after a short delay
        setTimeout(() => {
          if (mapInstanceRef.current) {
            try {
              mapInstanceRef.current.invalidateSize();
            } catch (e) {
              console.warn("Error invalidating map size:", e);
            }
          }
        }, 100);

        setIsLoading(false);
      } catch (error) {
        console.error("Error loading Leaflet:", error);
        setLoadError("Failed to load map");
        setIsLoading(false);
      }
    };

    loadLeaflet();

    // Cleanup function
    return () => {
      if (typeof window === "undefined") return;

      markersRef.current.forEach((marker) => {
        try {
          marker.remove();
        } catch (e) {
          console.warn("Error removing marker in cleanup:", e);
        }
      });
      markersRef.current = [];

      if (geoJsonLayerRef.current && mapInstanceRef.current) {
        try {
          mapInstanceRef.current.removeLayer(geoJsonLayerRef.current);
        } catch (e) {
          console.warn("Error removing GeoJSON layer in cleanup:", e);
        }
        geoJsonLayerRef.current = null;
      }

      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          console.warn("Error removing map in cleanup:", e);
        }
        mapInstanceRef.current = null;
      }
    };
  }, [attractions, zoom]);

  // Add this new useEffect after the main useEffect
  useEffect(() => {
    if (isVisible && mapInstanceRef.current) {
      // Small delay to ensure the container is properly rendered
      setTimeout(() => {
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.invalidateSize();
          } catch (e) {
            console.warn(
              "Error invalidating map size on visibility change:",
              e
            );
          }
        }
      }, 100);
    }
  }, [isVisible]);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full dark:bg-gray-700 animate-pulse">
            <Map className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">Memuat peta...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full dark:bg-red-900">
            <Map className="w-8 h-8 text-red-500 dark:text-red-400" />
          </div>
          <p className="mb-2 text-red-500 dark:text-red-400">
            Gagal memuat peta
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-blue-500 underline hover:text-blue-600">
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  // No attractions state
  if (!attractions || attractions.length === 0) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full dark:bg-gray-700">
            <Map className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            Tidak ada lokasi untuk ditampilkan
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="w-full h-full min-h-[400px]"
    />
  );
}
