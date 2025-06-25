"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { MapPin, RotateCcw, Move, Info } from "lucide-react";

const fixLeafletIcon = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  });
};

interface MapLocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
  height?: string;
}

// Move constants outside component or memoize them
const defaultLat = -2.1;
const defaultLng = 102.0;
const defaultZoom = 9;

export default function MapLocationPicker({
  onLocationSelect,
  initialLat,
  initialLng,
  height = "400px",
}: MapLocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const [selectedCoords, setSelectedCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLoadingBoundary, setIsLoadingBoundary] = useState(true);
  const [geoparkInfo, setGeoparkInfo] = useState<any>(null);

  // Memoize the functions with useCallback
  const createDraggableMarker = useCallback(
    (lat: number, lng: number) => {
      if (!mapInstanceRef.current) return;

      // Remove existing marker
      if (markerRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current);
      }

      // Create draggable marker
      const marker = L.marker([lat, lng], { draggable: true }).addTo(
        mapInstanceRef.current
      );
      marker
        .bindPopup(`Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`)
        .openPopup();

      // Add drag event listener
      marker.on("dragend", (e) => {
        const position = e.target.getLatLng();
        const newLat = position.lat;
        const newLng = position.lng;

        marker
          .bindPopup(`Lat: ${newLat.toFixed(6)}, Lng: ${newLng.toFixed(6)}`)
          .openPopup();
        setSelectedCoords({ lat: newLat, lng: newLng });
        onLocationSelect(newLat, newLng);
      });

      // Add drag start event for visual feedback
      marker.on("dragstart", () => {
        marker.closePopup();
      });

      markerRef.current = marker;
      setSelectedCoords({ lat, lng });
      onLocationSelect(lat, lng);
    },
    [onLocationSelect]
  );

  // Function to handle map click events
  const handleMapClick = useCallback(
    (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      createDraggableMarker(lat, lng);
    },
    [createDraggableMarker]
  );

  // Function to load GeoJSON boundary
  const loadGeoparkBoundary = useCallback(async () => {
    try {
      setIsLoadingBoundary(true);
      const response = await fetch("/data/geopark.geojson");

      if (!response.ok) {
        throw new Error(`Failed to fetch GeoJSON: ${response.status}`);
      }

      const geojsonData = await response.json();

      if (mapInstanceRef.current) {
        // Remove existing GeoJSON layer
        if (geoJsonLayerRef.current) {
          mapInstanceRef.current.removeLayer(geoJsonLayerRef.current);
        }

        // Create GeoJSON layer with custom styling
        const geoJsonLayer = L.geoJSON(geojsonData, {
          style: {
            color: "#059669", // Emerald green border
            weight: 3,
            opacity: 0.8,
            fillOpacity: 0.15,
            fillColor: "#10b981",
          },
          // Make sure the layer doesn't interfere with map clicks
          interactive: true,
          onEachFeature: (feature, layer) => {
            // Add popup with feature information
            if (feature.properties) {
              setGeoparkInfo(feature.properties);

              const popupContent = `
              <div class="p-2 max-w-sm">
                <h3 class="font-bold text-lg mb-2 text-emerald-700">${
                  feature.properties.name || "Geopark Merangin"
                }</h3>
                <div class="space-y-1 text-sm">
                  <div><strong>Negara:</strong> ${
                    feature.properties.Country
                  }</div>
                  <div><strong>Provinsi:</strong> ${
                    feature.properties.Province
                  }</div>
                  <div><strong>Kabupaten:</strong> ${
                    feature.properties.Regency
                  }</div>
                  <div><strong>Kecamatan:</strong> ${
                    feature.properties.Districts
                  }</div>
                  <div><strong>Desa:</strong> ${
                    feature.properties.Villages
                  }</div>
                  <div><strong>Luas:</strong> ${feature.properties.Area}</div>
                  <div><strong>Populasi:</strong> ${
                    feature.properties.Population
                  }</div>
                </div>
              </div>
            `;

              // Only bind popup, don't interfere with click events
              layer.bindPopup(popupContent);

              // Handle clicks on the GeoJSON layer - forward to map click handler
              layer.on("click", (e) => {
                // Stop the event from bubbling up to prevent double handling
                L.DomEvent.stopPropagation(e);
                // Create marker at the clicked location
                handleMapClick(e);
              });
            }
          },
        });

        geoJsonLayer.addTo(mapInstanceRef.current);
        geoJsonLayerRef.current = geoJsonLayer;

        // Fit map to GeoJSON bounds with padding
        const bounds = geoJsonLayer.getBounds();
        if (bounds.isValid()) {
          mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
        }
      }
    } catch (error) {
      console.error("Error loading geopark boundary:", error);
      // If GeoJSON fails to load, just center on Merangin coordinates
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([defaultLat, defaultLng], defaultZoom);
      }
    } finally {
      setIsLoadingBoundary(false);
    }
  }, [handleMapClick]);

  useEffect(() => {
    fixLeafletIcon();

    if (mapRef.current && !mapInstanceRef.current) {
      // Initialize map centered on Geopark Merangin
      const map = L.map(mapRef.current).setView(
        [defaultLat, defaultLng],
        defaultZoom
      );

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Add click event listener to the map
      map.on("click", handleMapClick);

      // Load GeoJSON boundary after map is ready
      loadGeoparkBoundary();

      // Add initial marker if coordinates provided and not default
      if (
        initialLat &&
        initialLng &&
        initialLat !== defaultLat &&
        initialLng !== defaultLng
      ) {
        createDraggableMarker(initialLat, initialLng);
      }

      // Fix map size after initialization
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
  }, [
    initialLat,
    initialLng,
    createDraggableMarker,
    handleMapClick,
    loadGeoparkBoundary,
  ]);

  const resetLocation = () => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
      setSelectedCoords(null);
      onLocationSelect(0, 0);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          if (mapInstanceRef.current) {
            // Center map to current location
            mapInstanceRef.current.setView([latitude, longitude], 15);
            createDraggableMarker(latitude, longitude);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          alert(
            "Tidak dapat mengakses lokasi Anda. Pastikan izin lokasi telah diberikan."
          );
        }
      );
    } else {
      alert("Geolocation tidak didukung oleh browser Anda.");
    }
  };

  const centerToMerangin = () => {
    if (mapInstanceRef.current) {
      if (geoJsonLayerRef.current) {
        // Fit to GeoJSON bounds if available
        const bounds = geoJsonLayerRef.current.getBounds();
        if (bounds.isValid()) {
          mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
        }
      } else {
        // Fallback to default coordinates
        mapInstanceRef.current.setView([defaultLat, defaultLng], defaultZoom);
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Klik pada peta untuk memilih lokasi{" "}
            {selectedCoords && "• Seret marker untuk mengubah posisi"}
          </p>
          {isLoadingBoundary && (
            <div className="flex items-center gap-1 text-xs text-emerald-600">
              <div className="w-3 h-3 border rounded-full border-emerald-600 animate-spin border-t-transparent"></div>
              Loading boundary...
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={centerToMerangin}
            className="text-xs">
            <MapPin className="w-3 h-3 mr-1" />
            Geopark Merangin
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={getCurrentLocation}
            className="text-xs">
            <MapPin className="w-3 h-3 mr-1" />
            Lokasi Saya
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={resetLocation}
            className="text-xs">
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      <div
        ref={mapRef}
        className="w-full border rounded-md"
        style={{ height }}
      />

      {selectedCoords && (
        <div className="p-3 text-sm rounded-md bg-muted">
          <div className="flex items-center gap-2 mb-2">
            <Move className="w-4 h-4 text-blue-500" />
            <strong>Koordinat yang dipilih:</strong>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>Latitude: {selectedCoords.lat.toFixed(6)}</div>
            <div>Longitude: {selectedCoords.lng.toFixed(6)}</div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            💡 Tip: Seret marker untuk mengubah posisi atau klik di tempat lain
            pada peta
          </p>
        </div>
      )}

      {!isLoadingBoundary && geoJsonLayerRef.current && geoparkInfo && (
        <div className="p-3 text-xs border rounded-md bg-emerald-50 text-emerald-700 border-emerald-200">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <div className="mb-1 font-semibold">Geopark Merangin</div>
              <div className="space-y-0.5 text-xs">
                <div>
                  📍 {geoparkInfo.Regency}, {geoparkInfo.Province}
                </div>
                <div>📏 Luas: {geoparkInfo.Area}</div>
                <div>
                  🏘️ {geoparkInfo.Districts} Kecamatan, {geoparkInfo.Villages}{" "}
                  Desa
                </div>
                <div>👥 Populasi: {geoparkInfo.Population}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
