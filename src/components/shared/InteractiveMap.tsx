import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import Supercluster from 'supercluster';
import 'leaflet/dist/leaflet.css';

interface Destination {
  name: string;
  count: string;
  img: string;
  category: string;
  price: number;
  ratingNum: number;
  amenitiesList: string[];
}

interface InteractiveMapProps {
  destinations: Destination[];
  hoveredDestinationName: string | null;
  selectedDestinationName: string | null;
  onDestinationSelect: (name: string) => void;
  onVisibleDestinationsChange: (names: string[]) => void;
}

const destinationCoordinates: Record<string, { lat: number; lng: number }> = {
  'Manali, Himachal Pradesh 🏔️': { lat: 32.2396, lng: 77.1887 },
  'Ubud, Bali 🌴': { lat: -8.5069, lng: 115.2625 },
  'Seminyak, Goa 🌊': { lat: 15.4909, lng: 73.8278 },
  'Paris, France 🗼': { lat: 48.8566, lng: 2.3522 },
  'Reykjavik, Iceland ❄️': { lat: 64.1466, lng: -21.9426 },
  'Amalfi Coast, Italy 🍋': { lat: 40.6333, lng: 14.6028 }
};

export default function InteractiveMap({
  destinations,
  hoveredDestinationName,
  selectedDestinationName,
  onDestinationSelect,
  onVisibleDestinationsChange
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [mapStyle, setMapStyle] = useState<'dark' | 'satellite'>('dark');
  const [searchThisArea, setSearchThisArea] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(2);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const superclusterRef = useRef<Supercluster | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create Leaflet Map instance centered on a central coordinate
    const map = L.map(mapContainerRef.current, {
      center: [20, 10],
      zoom: 2,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: false, // Disabling standard zoom control to render custom dark UI controls
      attributionControl: false
    });

    mapInstanceRef.current = map;

    // Create Layer group for pins & clusters
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    // Tile layers definitions
    updateTileLayer('dark');

    // Register event listeners
    const handleMapChange = () => {
      setZoom(map.getZoom());
      if (searchThisArea) {
        updateVisibleDestinations();
      }
    };

    map.on('zoomend', handleMapChange);
    map.on('moveend', handleMapChange);

    // Initial render call
    setTimeout(() => {
      map.invalidateSize();
      fitAllDestinations();
    }, 100);

    return () => {
      map.off('zoomend', handleMapChange);
      map.off('moveend', handleMapChange);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Helper to switch tile layers
  const updateTileLayer = (style: 'dark' | 'satellite') => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const darkUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    const satelliteUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

    const newLayer = L.tileLayer(style === 'dark' ? darkUrl : satelliteUrl, {
      maxZoom: 18
    }).addTo(map);

    tileLayerRef.current = newLayer;
  };

  // Switch map style when toggled
  useEffect(() => {
    updateTileLayer(mapStyle);
  }, [mapStyle]);

  // Sync flyTo when selectedDestinationName changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedDestinationName) return;

    const coords = destinationCoordinates[selectedDestinationName];
    if (coords) {
      map.flyTo([coords.lat, coords.lng], 10, {
        animate: true,
        duration: 1.5
      });

      // Find the marker programmatically and trigger preview
      setTimeout(() => {
        markersLayerRef.current?.eachLayer((layer: any) => {
          if (layer.options && layer.options.title === selectedDestinationName) {
            layer.openPopup();
          }
        });
      }, 1500);
    }
  }, [selectedDestinationName]);

  // Sync visible cards callback based on viewport bounds
  const updateVisibleDestinations = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const bounds = map.getBounds();
    const visibleNames: string[] = [];

    destinations.forEach(dest => {
      const coords = destinationCoordinates[dest.name];
      if (coords && bounds.contains([coords.lat, coords.lng])) {
        visibleNames.push(dest.name);
      }
    });

    onVisibleDestinationsChange(visibleNames);
  };

  // Re-trigger filtering on toggle
  useEffect(() => {
    if (searchThisArea) {
      updateVisibleDestinations();
    } else {
      // Clear filters (show all)
      onVisibleDestinationsChange(destinations.map(d => d.name));
    }
  }, [searchThisArea, destinations]);

  // Load supercluster whenever destinations change
  useEffect(() => {
    const points = destinations
      .map(dest => {
        const coords = destinationCoordinates[dest.name];
        if (!coords) return null;
        return {
          type: 'Feature' as const,
          properties: {
            cluster: false,
            destName: dest.name,
            price: dest.price,
            destination: dest
          },
          geometry: {
            type: 'Point' as const,
            coordinates: [coords.lng, coords.lat] // GeoJSON specifies [longitude, latitude]
          }
        };
      })
      .filter((pt): pt is NonNullable<typeof pt> => pt !== null);

    const index = new Supercluster({
      radius: 60,
      maxZoom: 16
    });

    index.load(points);
    superclusterRef.current = index;

    renderMapMarkers();
  }, [destinations, zoom, hoveredDestinationName, selectedDestinationName]);

  // Render clustered markers
  const renderMapMarkers = () => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    const index = superclusterRef.current;
    if (!map || !markersLayer || !index) return;

    markersLayer.clearLayers();

    // Query clusters for current bounds
    const bounds = map.getBounds();
    const bbox: [number, number, number, number] = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth()
    ];

    const clusters = index.getClusters(bbox, map.getZoom());

    clusters.forEach(c => {
      const [lng, lat] = c.geometry.coordinates;

      if (c.properties.cluster) {
        // Render Cluster marker
        const count = c.properties.point_count;
        const clusterIcon = L.divIcon({
          className: 'custom-cluster-marker-container',
          html: `<div class="custom-cluster-marker">${count}</div>`,
          iconSize: [36, 36]
        });

        const clusterMarker = L.marker([lat, lng], { icon: clusterIcon })
          .addTo(markersLayer)
          .on('click', () => {
            const expansionZoom = Math.min(index.getClusterExpansionZoom(c.properties.cluster_id), 18);
            map.flyTo([lat, lng], expansionZoom, {
              animate: true,
              duration: 0.8
            });
          });
      } else {
        // Render single destination pin
        const dest = c.properties.destination;
        const isHovered = hoveredDestinationName === dest.name;
        const isSelected = selectedDestinationName === dest.name;
        
        // Extract city and emoji cleanly
        const parts = dest.name.split(',');
        const city = parts[0];
        const words = dest.name.split(' ');
        const emoji = words[words.length - 1];
        const cleanName = emoji && emoji.length <= 4 ? `${city} ${emoji}` : city;

        const pinIcon = L.divIcon({
          className: 'custom-map-marker-container',
          html: `
            <div class="custom-map-marker ${isHovered ? 'hovered' : ''} ${isSelected ? 'selected' : ''}">
              <span class="marker-pin-icon">📍</span>
              <span class="marker-location">${cleanName}</span>
              <div class="marker-tail"></div>
            </div>
          `,
          iconSize: [0, 0],
          iconAnchor: [0, 0]
        });

        // Popup hover preview card
        const popupContent = `
          <div class="map-hover-card animate-slide-up">
            <img src="${dest.img}" class="map-hover-card-img" />
            <div class="map-hover-card-content">
              <h4 class="map-hover-card-title">${dest.name}</h4>
              <div class="map-hover-card-meta">
                <span class="map-hover-card-rating">★ ${dest.ratingNum}</span>
                <span class="map-hover-card-price">$${dest.price}/night</span>
              </div>
            </div>
          </div>
        `;

        const marker = L.marker([lat, lng], { 
          icon: pinIcon,
          title: dest.name
        })
          .addTo(markersLayer)
          .bindPopup(popupContent, {
            closeButton: false,
            offset: [0, -32],
            className: 'custom-hover-popup'
          });

        // Hover & Click events
        marker.on('mouseover', () => {
          marker.openPopup();
        });
        marker.on('mouseout', () => {
          // Keep popup open if it is the currently selected pin
          if (selectedDestinationName !== dest.name) {
            marker.closePopup();
          }
        });
        marker.on('click', () => {
          onDestinationSelect(dest.name);
        });
      }
    });
  };

  // Zoom to fit all coordinates
  const fitAllDestinations = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const coords = Object.values(destinationCoordinates);
    if (coords.length === 0) return;

    const latLngs = coords.map(c => L.latLng(c.lat, c.lng));
    const bounds = L.latLngBounds(latLngs);
    map.fitBounds(bounds, { padding: [50, 50] });
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Styles injection for Leaflet Dark Premium theme */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Leaflet DivIcon Box Overrides for Auto Sizing */
        .custom-map-marker-container {
          width: auto !important;
          height: auto !important;
          margin-left: 0px !important;
          margin-top: 0px !important;
          overflow: visible !important;
        }

        /* Destination Location Pin Styling */
        .custom-map-marker {
          background: var(--brand-gradient, linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%));
          color: white;
          font-size: 11px;
          font-weight: 800;
          padding: 6px 14px;
          border-radius: 20px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.5);
          border: 1px solid rgba(255,255,255,0.25);
          white-space: nowrap;
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          justify-content: center;
          transform: translate(-50%, -100%) translateY(-6px);
          transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.25s ease;
          transform-origin: bottom center;
        }
 
        .custom-map-marker.hovered, .custom-map-marker:hover {
          transform: translate(-50%, -100%) translateY(-8px) scale(1.1);
          box-shadow: 0 8px 18px rgba(236, 72, 153, 0.4);
          z-index: 999;
        }
 
        .custom-map-marker.selected {
          transform: translate(-50%, -100%) translateY(-8px) scale(1.15);
          border-color: #34d399;
          box-shadow: 0 0 14px #34d399;
          z-index: 1000;
        }

        .custom-map-marker .marker-location {
          font-weight: 800;
          opacity: 0.96;
        }
 
        .custom-map-marker .marker-tail {
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid #8b5cf6;
          transition: border-top-color 0.2s ease;
        }
 
        .custom-map-marker.selected .marker-tail {
          border-top-color: #34d399;
        }

        /* Cluster Styling */
        .custom-cluster-marker {
          background: rgba(9, 8, 15, 0.85);
          backdrop-filter: blur(8px);
          border: 2.5px solid #ec4899;
          color: white;
          font-size: 12px;
          font-weight: 800;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(236,72,153,0.3);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .custom-cluster-marker:hover {
          transform: scale(1.15);
          box-shadow: 0 6px 18px rgba(236,72,153,0.5);
        }

        /* Hover Preview Styling */
        .leaflet-popup-content-wrapper {
          background: rgba(9, 8, 15, 0.95) !important;
          backdrop-filter: blur(12px) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          border-radius: 12px !important;
          padding: 0 !important;
          overflow: hidden !important;
          box-shadow: 0 12px 24px rgba(0,0,0,0.6) !important;
        }

        .leaflet-popup-content {
          margin: 0 !important;
          width: 180px !important;
        }

        .leaflet-popup-tip {
          background: rgba(9, 8, 15, 0.95) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
        }

        .map-hover-card {
          display: flex;
          flex-direction: column;
          width: 100%;
        }

        .map-hover-card-img {
          width: 100%;
          height: 90px;
          object-fit: cover;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .map-hover-card-content {
          padding: 8px 10px;
        }

        .map-hover-card-title {
          margin: 0 0 4px 0;
          font-size: 11px;
          font-weight: 800;
          color: #f8fafc;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .map-hover-card-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 10px;
        }

        .map-hover-card-rating {
          color: #fbbf24;
          font-weight: 700;
        }

        .map-hover-card-price {
          color: #94a3b8;
          font-weight: 600;
        }

        .animate-slide-up {
          animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      ` }} />

      {/* Map DOM Element */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', background: '#09080f' }} />

      {/* Map UI Control Layers */}
      
      {/* Search this area Toggle (AirBnB style) */}
      <div style={{ position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, display: 'flex', gap: '8px' }}>
        <button 
          onClick={() => setSearchThisArea(!searchThisArea)}
          style={{
            background: searchThisArea ? 'var(--brand-gradient)' : 'rgba(9, 8, 15, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '24px',
            color: 'white',
            fontSize: '11px',
            fontWeight: 700,
            padding: '8px 16px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backdropFilter: 'blur(8px)',
            transition: 'background 0.2s ease, transform 0.1s active'
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Search as I move
        </button>
      </div>

      {/* Custom Zoom Controls (Bottom Right) */}
      <div style={{ position: 'absolute', bottom: '24px', right: '24px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button 
          onClick={handleZoomIn}
          style={{
            width: '38px',
            height: '38px',
            background: 'rgba(9, 8, 15, 0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '50%',
            color: '#e2e8f0',
            fontSize: '18px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)',
            transition: 'background 0.2s, transform 0.1s active'
          }}
        >
          +
        </button>
        <button 
          onClick={handleZoomOut}
          style={{
            width: '38px',
            height: '38px',
            background: 'rgba(9, 8, 15, 0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '50%',
            color: '#e2e8f0',
            fontSize: '18px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)',
            transition: 'background 0.2s, transform 0.1s active'
          }}
        >
          -
        </button>
      </div>

      {/* Layer Switcher & Reset Map Control (Bottom Left) */}
      <div style={{ position: 'absolute', bottom: '24px', left: '24px', zIndex: 1000, display: 'flex', gap: '10px', alignItems: 'center' }}>
        {/* Style selector */}
        <div style={{ 
          background: 'rgba(9, 8, 15, 0.85)', 
          backdropFilter: 'blur(8px)', 
          border: '1px solid rgba(255,255,255,0.08)', 
          borderRadius: '8px', 
          padding: '3px',
          display: 'flex',
          gap: '2px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
        }}>
          <button 
            onClick={() => setMapStyle('dark')}
            style={{
              background: mapStyle === 'dark' ? 'var(--brand-gradient)' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              fontSize: '10px',
              fontWeight: 700,
              padding: '6px 12px',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            Dark Map
          </button>
          <button 
            onClick={() => setMapStyle('satellite')}
            style={{
              background: mapStyle === 'satellite' ? 'var(--brand-gradient)' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              fontSize: '10px',
              fontWeight: 700,
              padding: '6px 12px',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            Satellite
          </button>
        </div>

        {/* Reset View Button */}
        <button 
          onClick={fitAllDestinations}
          style={{
            background: 'rgba(9, 8, 15, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            color: 'white',
            fontSize: '10px',
            fontWeight: 700,
            padding: '9px 14px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" />
            <line x1="3" y1="21" x2="10" y2="14" />
          </svg>
          Reset View
        </button>
      </div>

    </div>
  );
}
