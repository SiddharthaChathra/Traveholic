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
  'Manali, Himachal Pradesh': { lat: 32.2396, lng: 77.1887 },
  'Ubud, Bali': { lat: -8.5069, lng: 115.2625 },
  'Seminyak, Goa': { lat: 15.4909, lng: 73.8278 },
  'Paris, France': { lat: 48.8566, lng: 2.3522 },
  'Reykjavik, Iceland': { lat: 64.1466, lng: -21.9426 },
  'Amalfi Coast, Italy': { lat: 40.6333, lng: 14.6028 }
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

  // Sync destinations to a ref to avoid stale closure in leaflet event callbacks
  const destinationsRef = useRef(destinations);
  useEffect(() => {
    destinationsRef.current = destinations;
  }, [destinations]);

  // Checkout bottom sheet states
  const [activeCheckoutDest, setActiveCheckoutDest] = useState<Destination | null>(null);
  const [couponCode, setCouponCode] = useState<string>('');
  const [isCouponApplied, setIsCouponApplied] = useState<boolean>(false);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [commissionAmount, setCommissionAmount] = useState<number>(0);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [checkInDate, setCheckInDate] = useState<string>('2026-07-20');
  const [checkOutDate, setCheckOutDate] = useState<string>('2026-07-23');
  const [guestCount, setGuestCount] = useState<number>(2);

  // Quest Check-in states
  const [activeQuest, setActiveQuest] = useState<{ name: string; lat: number; lng: number; rewardCode: string; rewardDesc: string } | null>(null);
  const [questCompleted, setQuestCompleted] = useState<boolean>(false);
  const [scratchProgress, setScratchProgress] = useState<boolean>(false);

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c * 1000; // meters
  };

  const QUEST_SPOTS = [
    { name: 'Amalfi Lemon Cafe 🍋', lat: 40.6333, lng: 14.6028, rewardCode: 'AMALFI15', rewardDesc: '15% Off Amalfi Coast Stays' },
    { name: 'Ubud Jungle Spa 🌴', lat: -8.5069, lng: 115.2625, rewardCode: 'SOPHIA10', rewardDesc: '10% Off Sophia Loren Sponsored Bookings' },
    { name: 'Reykjavik Glacial Hut ❄️', lat: 64.1466, lng: -21.9426, rewardCode: 'ICELANDFREE', rewardDesc: 'Free Excursion Voucher' }
  ];

  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [currentRoute, setCurrentRoute] = useState<{
    destName: string;
    distance: string;
    duration: string;
    googleUrl: string;
  } | null>(null);

  const routeLineRef = useRef<L.Polyline | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const calculateRouteRef = useRef<((destName: string) => void) | undefined>(undefined);

  // Query User Geolocation
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let watchId: number;

    const fetchIPLocationFallback = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        if (data.latitude && data.longitude) {
          setUserCoords({
            lat: data.latitude,
            lng: data.longitude
          });
        } else {
          setUserCoords({ lat: 28.6139, lng: 77.2090 });
        }
      } catch (err) {
        console.warn("IP Geolocation fallback failed:", err);
        setUserCoords({ lat: 28.6139, lng: 77.2090 });
      }
    };

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserCoords(coords);
        },
        async (error) => {
          console.warn("Geolocation watch error, trying IP fallback...", error);
          await fetchIPLocationFallback();
        },
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 0 
        }
      );
    } else {
      fetchIPLocationFallback();
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // Update/draw user location marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !userCoords) return;

    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
    }

    const userIcon = L.divIcon({
      className: 'user-location-pulse-container',
      html: `<div class="user-location-pulse"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const userMarker = L.marker([userCoords.lat, userCoords.lng], {
      icon: userIcon,
      zIndexOffset: 1000
    })
      .addTo(map)
      .bindPopup(`
        <div style="padding: 4px; font-size: 11px; font-weight: 700; color: white; display: flex; align-items: center; gap: 4px;">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" /><circle cx="12" cy="10" r="3" /></svg> Your Location
        </div>
      `, { closeButton: false, className: 'custom-hover-popup' });

    userMarkerRef.current = userMarker;
  }, [userCoords]);

  const calculateRoute = async (destinationName: string) => {
    const map = mapInstanceRef.current;
    if (!map || !userCoords) return;

    const destCoords = destinationCoordinates[destinationName];
    if (!destCoords) return;

    try {
      // OSRM Driving Directions API
      const url = `https://router.project-osrm.org/route/v1/driving/${userCoords.lng},${userCoords.lat};${destCoords.lng},${destCoords.lat}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const routeCoordinates = route.geometry.coordinates;
        const latLngs = routeCoordinates.map((coord: [number, number]) => L.latLng(coord[1], coord[0]));

        if (routeLineRef.current) {
          map.removeLayer(routeLineRef.current);
        }

        const polyline = L.polyline(latLngs, {
          color: '#3b82f6',
          weight: 4,
          opacity: 0.85,
          className: 'glowing-route-line'
        }).addTo(map);

        routeLineRef.current = polyline;

        const distanceKm = (route.distance / 1000).toFixed(1);
        const durationHrs = Math.floor(route.duration / 3600);
        const durationMins = Math.round((route.duration % 3600) / 60);
        const durationText = durationHrs > 0 ? `${durationHrs}h ${durationMins}m` : `${durationMins}m`;

        const googleUrl = `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${destCoords.lat},${destCoords.lng}&travelmode=driving`;

        setCurrentRoute({
          destName: destinationName,
          distance: `${distanceKm} km`,
          duration: durationText,
          googleUrl
        });

        map.fitBounds(polyline.getBounds(), {
          padding: [80, 80],
          animate: true,
          duration: 1.5
        });
      }
    } catch (err) {
      console.error("OSRM Route API fetch error:", err);
    }
  };

  calculateRouteRef.current = calculateRoute;

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

    // Register popupopen event listener to delegate click handler on directions CTA
    map.on('popupopen', (e: any) => {
      const popupEl = e.popup.getElement();
      if (!popupEl) return;

      const planBtn = popupEl.querySelector('.plan-trip-btn');
      if (planBtn) {
        planBtn.addEventListener('click', (ev: any) => {
          ev.preventDefault();
          ev.stopPropagation();
          const destName = planBtn.getAttribute('data-dest');
          if (destName) {
            window.location.href = `/trip-planner/${encodeURIComponent(destName.split(',')[0].trim().toLowerCase())}`;
          }
        });
      }
      
      const dirBtn = popupEl.querySelector('.get-directions-btn');
      if (dirBtn) {
        dirBtn.addEventListener('click', (ev: any) => {
          ev.preventDefault();
          ev.stopPropagation();
          const destName = dirBtn.getAttribute('data-dest');
          if (destName) {
            calculateRouteRef.current?.(destName);
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destName)}`, '_blank');
          }
        });
      }

      const bookBtn = popupEl.querySelector('.instant-book-btn');
      if (bookBtn) {
        bookBtn.addEventListener('click', (ev: any) => {
          ev.preventDefault();
          ev.stopPropagation();
          const destName = bookBtn.getAttribute('data-dest');
          if (destName) {
            const foundDest = destinationsRef.current.find((d: any) => d.name === destName);
            if (foundDest) {
              setActiveCheckoutDest(foundDest);
              setBookingSuccess(false);
              setIsCouponApplied(false);
              setCouponDiscount(0);
              setCommissionAmount(0);
              
              // Pre-apply saved codes from localStorage if available
              const savedCode = localStorage.getItem('active_sponsorship_code');
              if (savedCode) {
                setCouponCode(savedCode);
                const discount = Number((foundDest.price * 3 * 0.10).toFixed(2));
                setCouponDiscount(discount);
                setIsCouponApplied(true);
                setCommissionAmount(Number((foundDest.price * 3 * 0.05).toFixed(2)));
              } else {
                setCouponCode('');
              }
            }
          }
        });
      }

      const questBtn = popupEl.querySelector('.check-in-quest-btn');
      if (questBtn) {
        questBtn.addEventListener('click', (ev: any) => {
          ev.preventDefault();
          ev.stopPropagation();
          const questName = questBtn.getAttribute('data-quest');
          if (questName) {
            const foundQuest = QUEST_SPOTS.find(q => q.name === questName);
            if (foundQuest) {
              setActiveQuest(foundQuest);
              setQuestCompleted(false);
              setScratchProgress(false);
            }
          }
        });
      }
    });

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
              <span class="marker-pin-icon" style="display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; color: var(--primary);">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" /><circle cx="12" cy="10" r="3" /></svg>
              </span>
              <span class="marker-location">${cleanName}</span>
              <div class="marker-tail"></div>
            </div>
          `,
          iconSize: [0, 0],
          iconAnchor: [0, 0]
        });

        // Popup hover preview card with Instant Book integration
        const popupContent = `
          <div class="map-hover-card animate-slide-up" style="pointer-events: auto;">
            <img src="${dest.img}" class="map-hover-card-img" />
            <div class="map-hover-card-content">
              <h4 class="map-hover-card-title">${dest.name}</h4>
              <div class="map-hover-card-meta" style="margin-bottom: 8px;">
                <span class="map-hover-card-rating">★ ${dest.ratingNum}</span>
                <span class="map-hover-card-price">$${dest.price}/night</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <button class="plan-trip-btn" data-dest="${dest.name}" style="width: 100%; padding: 6px 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; color: white; font-size: 10px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
                  Plan This Trip
                </button>
                <button class="get-directions-btn" data-dest="${dest.name}" style="width: 100%; padding: 6px 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; color: white; font-size: 10px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polygon points="3 11 22 2 13 21 11 13 3 11" />
                  </svg>
                  Get Directions
                </button>
                <button class="instant-book-btn" data-dest="${dest.name}" style="width: 100%; padding: 6px 10px; background: var(--brand-gradient); border: none; border-radius: 6px; color: white; font-size: 10px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; box-shadow: 0 4px 10px rgba(236,72,153,0.35);">
                  ⚡ Instant Book
                </button>
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

    // Render Quest Spots on the map
    QUEST_SPOTS.forEach(quest => {
      // Calculate distance (if userCoords loaded, check if within 5000 km for demo)
      const distanceM = userCoords ? getDistance(userCoords.lat, userCoords.lng, quest.lat, quest.lng) : 999999;
      const isUserNear = distanceM < 5000000; // Large threshold to make verification simple, but displays real distance
      
      const questIcon = L.divIcon({
        className: 'custom-quest-marker-container',
        html: `
          <div class="custom-quest-marker ${isUserNear ? 'near' : ''}">
            <span class="quest-marker-icon">💎</span>
            <span class="quest-marker-title">${quest.name.split(' ')[0]} Quest</span>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      });

      const popupContent = `
        <div style="padding: 12px; font-family: var(--font-title); color: white; width: 180px; text-align: center; background: rgba(9, 8, 15, 0.95);">
          <div style="font-size: 24px; margin-bottom: 6px;">🎁</div>
          <strong style="font-size: 12px; display: block; margin-bottom: 6px; color: #fbbf24;">${quest.name}</strong>
          <p style="font-size: 10px; color: var(--text-muted); margin: 0 0 10px 0;">
            Check in here to unlock: <strong style="color: white;">${quest.rewardDesc}</strong>
          </p>
          <div style="font-size: 9px; color: var(--text-muted); margin-bottom: 8px;">
            Distance: ${(distanceM / 1000).toFixed(1)} km
          </div>
          <button class="check-in-quest-btn" data-quest="${quest.name}" style="width: 100%; padding: 8px; background: #eab308; border: none; border-radius: 6px; color: black; font-size: 10px; font-weight: 800; cursor: pointer; transition: background 0.2s;">
            🔑 Check In & Scratch Card
          </button>
        </div>
      `;

      L.marker([quest.lat, quest.lng], { icon: questIcon })
        .addTo(markersLayer)
        .bindPopup(popupContent, {
          closeButton: false,
          offset: [0, -20],
          className: 'custom-hover-popup'
        });
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
        /* Pulsating Blue Marker for User Location */
        .user-location-pulse-container {
          overflow: visible !important;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .user-location-pulse {
          width: 14.5px;
          height: 14.5px;
          background: #3b82f6;
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(59,130,246,0.8);
          position: relative;
        }
        .user-location-pulse::after {
          content: '';
          position: absolute;
          top: -5px;
          left: -5px;
          right: -5px;
          bottom: -5px;
          border-radius: 50%;
          border: 2px solid #3b82f6;
          animation: pulse-ring 2.2s infinite;
          opacity: 0;
        }
        @keyframes pulse-ring {
          0% {
            transform: scale(0.5);
            opacity: 0.8;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }

        /* Glowing Dashed Route Line */
        .glowing-route-line {
          stroke-dasharray: 12, 8;
          stroke: #3b82f6;
          filter: drop-shadow(0 0 5px rgba(59,130,246,0.9));
          animation: route-flow 35s linear infinite;
        }
        @keyframes route-flow {
          to {
            stroke-dashoffset: -1000;
          }
        }

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

      {/* Custom Zoom & Location Controls (Bottom Right) */}
      <div style={{ position: 'absolute', bottom: '24px', right: '24px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Locate Me button */}
        <button 
          onClick={() => {
            const map = mapInstanceRef.current;
            if (map && userCoords) {
              map.flyTo([userCoords.lat, userCoords.lng], 13, {
                animate: true,
                duration: 1.5
              });
              if (userMarkerRef.current) {
                userMarkerRef.current.openPopup();
              }
            } else {
              alert("Waiting for user location lock...");
            }
          }}
          style={{
            width: '38px',
            height: '38px',
            background: 'rgba(9, 8, 15, 0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '50%',
            color: '#e2e8f0',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)',
            transition: 'background 0.2s, transform 0.1s active'
          }}
          title="Find my location"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="3"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
          </svg>
        </button>

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

      {/* Floating Directions Panel (Top Right overlay) */}
      {currentRoute && (
        <div style={{
          position: 'absolute',
          top: '75px',
          right: '24px',
          zIndex: 1000,
          width: '280px',
          background: 'rgba(9, 8, 15, 0.9)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: '#3b82f6', fontWeight: 800 }}>DRIVING DIRECTIONS</span>
              <h4 style={{ margin: '4px 0 0 0', fontSize: '13px', fontWeight: 800, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                {currentRoute.destName.split(',')[0]}
              </h4>
            </div>
            <button 
              onClick={() => {
                setCurrentRoute(null);
                if (routeLineRef.current && mapInstanceRef.current) {
                  mapInstanceRef.current.removeLayer(routeLineRef.current);
                  routeLineRef.current = null;
                }
              }}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '18px', cursor: 'pointer', padding: 0 }}
            >
              &times;
            </button>
          </div>

          <div style={{ display: 'flex', gap: '20px', padding: '8px 0', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Distance</span>
              <span style={{ fontSize: '14px', fontWeight: 800, color: 'white' }}>{currentRoute.distance}</span>
            </div>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Driving Time</span>
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#34d399' }}>{currentRoute.duration}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <a 
              href={currentRoute.googleUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                background: 'var(--brand-gradient)',
                color: 'white',
                textDecoration: 'none',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 700,
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(236,72,153,0.3)'
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              Navigate in Google Maps
            </a>
          </div>
        </div>
      )}

      {/* 1. INSTANT CHECKOUT MODAL */}
      {activeCheckoutDest && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 6, 12, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '24px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '420px',
            background: 'rgba(15, 18, 30, 0.9)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px',
            padding: '28px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            color: 'white',
            fontFamily: 'var(--font-body)'
          }}>
            {!bookingSuccess ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 900, margin: 0, background: 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    ⚡ Instant Booking Checkout
                  </h3>
                  <button 
                    onClick={() => setActiveCheckoutDest(null)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '22px', cursor: 'pointer', padding: 0 }}
                  >
                    &times;
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <img src={activeCheckoutDest.img} style={{ width: '70px', height: '70px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 800, margin: '0 0 4px' }}>{activeCheckoutDest.name}</h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{activeCheckoutDest.category} • ★ {activeCheckoutDest.ratingNum}</span>
                    <span style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--primary)', marginTop: '4px' }}>${activeCheckoutDest.price}/night</span>
                  </div>
                </div>

                {/* Date Inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Check In</label>
                    <input 
                      type="date" 
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: 'white', fontSize: '12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Check Out</label>
                    <input 
                      type="date" 
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: 'white', fontSize: '12px' }}
                    />
                  </div>
                </div>

                {/* Guest Count */}
                <div>
                  <label style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Guests</label>
                  <select 
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px', background: 'rgba(15, 18, 30, 0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: 'white', fontSize: '12px' }}
                  >
                    <option value={1}>1 Guest</option>
                    <option value={2}>2 Guests</option>
                    <option value={3}>3 Guests</option>
                    <option value={4}>4 Guests</option>
                  </select>
                </div>

                {/* Promo Code input */}
                <div>
                  <label style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Promo Referral Code</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="e.g. SOPHIA10"
                      style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: 'white', fontSize: '12px' }}
                    />
                    <button 
                      onClick={() => {
                        const subtotal = activeCheckoutDest.price * 3;
                        let discount = 0;
                        let applied = false;
                        const codeUpper = couponCode.toUpperCase().trim();
                        if (codeUpper.endsWith('10') || codeUpper.includes('SOPHIA')) {
                          discount = subtotal * 0.10;
                          applied = true;
                        } else if (codeUpper.endsWith('15') || codeUpper.includes('AMALFI')) {
                          discount = subtotal * 0.15;
                          applied = true;
                        } else if (codeUpper.includes('FREE') || codeUpper.includes('MARCUS') || codeUpper.includes('ICELAND')) {
                          discount = subtotal * 0.20;
                          applied = true;
                        } else if (codeUpper.length > 0) {
                          discount = subtotal * 0.05;
                          applied = true;
                        }

                        if (applied) {
                          setIsCouponApplied(true);
                          setCouponDiscount(Number(discount.toFixed(2)));
                          setCommissionAmount(Number((subtotal * 0.05).toFixed(2)));
                        } else {
                          alert("Invalid coupon code.");
                        }
                      }}
                      style={{ padding: '0 16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Apply
                    </button>
                  </div>
                  {isCouponApplied && (
                    <span style={{ fontSize: '10px', color: '#10b981', display: 'block', marginTop: '6px', fontWeight: 600 }}>
                      ✓ Discount Code Applied! (5% commission allocated to sponsoring Creator)
                    </span>
                  )}
                </div>

                {/* Price Summary */}
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>${activeCheckoutDest.price} x 3 nights</span>
                    <span>${activeCheckoutDest.price * 3}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Occupancy Taxes &amp; Fees (10%)</span>
                    <span>${(activeCheckoutDest.price * 3 * 0.10).toFixed(2)}</span>
                  </div>
                  {isCouponApplied && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#10b981' }}>
                      <span>Sponsor Code Discount</span>
                      <span>-${couponDiscount}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '8px', fontWeight: 800 }}>
                    <span>Total Price</span>
                    <span style={{ color: 'white' }}>${(activeCheckoutDest.price * 3 * 1.10 - (isCouponApplied ? couponDiscount : 0)).toFixed(2)}</span>
                  </div>

                  {isCouponApplied && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#eab308', background: 'rgba(234,179,8,0.05)', padding: '6px 8px', borderRadius: '4px', border: '1px solid rgba(234,179,8,0.1)', marginTop: '4px' }}>
                      <span>Vlogger Commission Paid:</span>
                      <strong>${commissionAmount}</strong>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                  <button 
                    onClick={() => {
                      const total = activeCheckoutDest.price * 3 * 1.10 - (isCouponApplied ? couponDiscount : 0);
                      
                      // Write to local storage for Venture Dashboard tracking
                      const currentBookings = JSON.parse(localStorage.getItem('traveholic_bookings') || '[]');
                      currentBookings.push({
                        id: 'book-' + Date.now(),
                        hotel: activeCheckoutDest.name,
                        price: total,
                        referralCode: isCouponApplied ? couponCode.toUpperCase() : 'DIRECT',
                        commission: isCouponApplied ? commissionAmount : 0,
                        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                        guests: guestCount
                      });
                      localStorage.setItem('traveholic_bookings', JSON.stringify(currentBookings));
                      
                      setBookingSuccess(true);
                    }}
                    style={{ flex: 1, padding: '14px', background: 'var(--brand-gradient)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 800, fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(236,72,153,0.3)' }}
                  >
                    Confirm &amp; Pay
                  </button>
                  <button 
                    onClick={() => setActiveCheckoutDest(null)}
                    style={{ padding: '14px 20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px 0' }}>
                <span style={{ fontSize: '48px' }}>🎉</span>
                <h3 style={{ fontSize: '20px', fontWeight: 900, margin: 0, color: 'white' }}>Booking Confirmed!</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
                  Your stay at <strong>{activeCheckoutDest.name}</strong> is confirmed. A traveler referral credit voucher has been linked to your profile.
                </p>
                {isCouponApplied && (
                  <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '8px', padding: '10px', fontSize: '11px', color: '#34d399' }}>
                    Sponsor discount code <strong>{couponCode.toUpperCase()}</strong> validated. A 5% marketing affiliate reward has been dispatched to the creator's wallet.
                  </div>
                )}
                <button 
                  onClick={() => {
                    setActiveCheckoutDest(null);
                    // trigger page refresh or custom event for dashboard tracking if needed
                  }}
                  style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: 'white', fontWeight: 700, fontSize: '12px', cursor: 'pointer', marginTop: '12px' }}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. QUEST CHECK-IN MODAL (Scratch Card) */}
      {activeQuest && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 6, 12, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '24px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '380px',
            background: 'rgba(15, 18, 30, 0.9)',
            border: '1.5px solid #eab308',
            borderRadius: '24px',
            padding: '28px',
            boxShadow: '0 24px 64px rgba(234,179,8,0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: '#eab308', fontWeight: 800 }}>✨ LOCAL CHECK-IN QUEST</span>
              <button 
                onClick={() => setActiveQuest(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer', padding: 0 }}
              >
                &times;
              </button>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 900, margin: '4px 0 0' }}>{activeQuest.name}</h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
              Physical check-in success! Scratch below to reveal your co-branded sponsor reward.
            </p>

            {/* Scratch area */}
            <div style={{ position: 'relative', height: '140px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', margin: '8px 0' }}>
              {!scratchProgress ? (
                <div 
                  onClick={() => {
                    setScratchProgress(true);
                    // Pre-fill localStorage with quest coupon for easy use
                    localStorage.setItem('active_sponsorship_code', activeQuest.rewardCode);
                  }}
                  style={{
                    position: 'absolute',
                    inset: 4,
                    background: 'linear-gradient(135deg, #475569 0%, #1e293b 100%)',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)',
                    transition: 'opacity 0.3s'
                  }}
                >
                  <span style={{ fontSize: '24px' }}>🪙</span>
                  <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px' }}>Click to Scratch Card</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', animation: 'scaleUp 0.3s forwards' }}>
                  <span style={{ fontSize: '28px' }}>🎉</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>PROMO REWARD CODE</span>
                  <div style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', padding: '8px 24px', borderRadius: '8px', fontSize: '18px', fontWeight: 900, color: '#f59e0b', letterSpacing: '2px' }}>
                    {activeQuest.rewardCode}
                  </div>
                  <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 600 }}>{activeQuest.rewardDesc}</span>
                </div>
              )}
            </div>

            {scratchProgress ? (
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(activeQuest.rewardCode);
                  alert(`Code "${activeQuest.rewardCode}" copied to clipboard! Try applying it at checkout.`);
                  setActiveQuest(null);
                }}
                style={{ width: '100%', padding: '12px', background: 'var(--brand-gradient)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 800, fontSize: '11px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(236,72,153,0.3)' }}
              >
                Copy Coupon &amp; Use Checkout
              </button>
            ) : (
              <button 
                disabled
                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', color: 'rgba(255,255,255,0.2)', fontWeight: 800, fontSize: '11px' }}
              >
                Scratch Card to Claim
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
