'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

// Types
export interface TrailStop {
  id: string;
  name: string;
  category: 'Mountains' | 'Beaches' | 'Tropical' | 'Winter' | 'Historical';
  date?: string; // Visited date (e.g. "2026-04-14")
  plannedDate?: string; // Planned date (e.g. "2026-10")
  image: string;
  visited: boolean;
  inspiration?: string;
}

interface TheTrailProps {
  onZoomToDestination?: (destinationName: string) => void;
  onOpenChatWithItinerary?: (destinationName: string) => void;
}

const PRESET_IMAGES = [
  { name: 'Tropical Beach', url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop&q=80' },
  { name: 'Mountain Peak', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80' },
  { name: 'Iceland Winter', url: 'https://images.unsplash.com/photo-1483168527879-c66136b56105?w=600&auto=format&fit=crop&q=80' },
  { name: 'Ancient Temple', url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&auto=format&fit=crop&q=80' },
  { name: 'Coastal Cliffs', url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&auto=format&fit=crop&q=80' },
];

export default function TheTrail({ onZoomToDestination, onOpenChatWithItinerary }: TheTrailProps) {
  // Core initial stops state
  const [stops, setStops] = useState<TrailStop[]>([
    {
      id: 'stop-1',
      name: 'Ubud, Bali',
      category: 'Tropical',
      date: '2026-04-14',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&auto=format&fit=crop&q=80',
      visited: true
    },
    {
      id: 'stop-2',
      name: 'Reykjavik, Iceland',
      category: 'Winter',
      date: '2026-05-02',
      image: 'https://images.unsplash.com/photo-1483168527879-c66136b56105?w=400&auto=format&fit=crop&q=80',
      visited: true
    },
    {
      id: 'stop-3',
      name: 'Amalfi Coast, Italy',
      category: 'Beaches',
      date: '2026-06-18',
      image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400&auto=format&fit=crop&q=80',
      visited: true
    },
    {
      id: 'stop-4',
      name: 'Kyoto, Japan',
      category: 'Historical',
      plannedDate: '2026-10',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&auto=format&fit=crop&q=80',
      visited: false,
      inspiration: 'Saved from @wanderlust_jenny\'s post'
    },
    {
      id: 'stop-5',
      name: 'Zermatt, Switzerland',
      category: 'Mountains',
      plannedDate: '2026-12',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&auto=format&fit=crop&q=80',
      visited: false,
      inspiration: 'Saved from @nomad_alex\'s story'
    },
    {
      id: 'stop-6',
      name: 'Santorini, Greece',
      category: 'Beaches',
      plannedDate: '2027-06',
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&auto=format&fit=crop&q=80',
      visited: false,
      inspiration: 'Saved from @backpacker_sam\'s vlog'
    },
    {
      id: 'stop-7',
      name: 'Petra, Jordan',
      category: 'Historical',
      plannedDate: '2027-09',
      image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=400&auto=format&fit=crop&q=80',
      visited: false,
      inspiration: 'Trending in IRL Explorers Channel'
    }
  ]);

  // Form & overlay states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStop, setEditingStop] = useState<TrailStop | null>(null);
  const [activeStop, setActiveStop] = useState<TrailStop | null>(null);
  const [hoveredStopId, setHoveredStopId] = useState<string | null>(null);
  const [convertingStopId, setConvertingStopId] = useState<string | null>(null);
  const [showCollageStop, setShowCollageStop] = useState<TrailStop | null>(null);

  // Form variables
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<'Mountains' | 'Beaches' | 'Tropical' | 'Winter' | 'Historical'>('Tropical');
  const [formImage, setFormImage] = useState(PRESET_IMAGES[0].url);
  const [formVisited, setFormVisited] = useState(true);
  const [formDate, setFormDate] = useState('2026-07-11');
  const [formPlannedDate, setFormPlannedDate] = useState('2026-10');
  const [formInspiration, setFormInspiration] = useState('');

  // Parallax Scroll values
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const pathYTransform = useTransform(scrollYProgress, [0, 1], [0, -30]);

  // Particles & confetti canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);

  // Category Accent Colors
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Tropical': return '#ec4899'; 
      case 'Winter': return '#3b82f6'; 
      case 'Beaches': return '#14b8a6'; 
      case 'Mountains': return '#8b5cf6'; 
      case 'Historical': return '#f59e0b'; 
      default: return '#10b981';
    }
  };

  // dynamic coordinates & S-curve sort
  const getSortedWithCoordinates = () => {
    const visited = stops
      .filter(s => s.visited)
      .sort((a, b) => {
        const dA = a.date ? new Date(a.date).getTime() : 0;
        const dB = b.date ? new Date(b.date).getTime() : 0;
        return dA - dB;
      });

    const planned = stops
      .filter(s => !s.visited)
      .sort((a, b) => {
        const dA = a.plannedDate ? new Date(a.plannedDate).getTime() : 0;
        const dB = b.plannedDate ? new Date(b.plannedDate).getTime() : 0;
        return dA - dB;
      });

    const sorted = [...visited, ...planned];

    return sorted.map((stop, index) => {
      const y = 160 + index * 200; // ample vertical spacing for infographic nodes
      const x = index % 2 === 0 ? 160 : 440;
      return { ...stop, x, y };
    });
  };

  const sortedStops = getSortedWithCoordinates();
  const totalStopsCount = sortedStops.length;
  const totalHeight = 160 + totalStopsCount * 200 + 100;

  // Generate smooth, loop-free S-curve bezier path
  const getPathD = () => {
    if (totalStopsCount === 0) return 'M 300 0 L 300 400';
    let d = `M 300 0`;
    const first = sortedStops[0];
    d += ` C 300 80, ${first.x} ${first.y - 100}, ${first.x} ${first.y}`;

    for (let i = 1; i < totalStopsCount; i++) {
      const prev = sortedStops[i - 1];
      const curr = sortedStops[i];
      d += ` C ${prev.x} ${prev.y + 100}, ${curr.x} ${curr.y - 100}, ${curr.x} ${curr.y}`;
    }

    const last = sortedStops[totalStopsCount - 1];
    const endY = totalHeight - 40;
    d += ` C ${last.x} ${last.y + 100}, 300 ${endY - 80}, 300 ${endY}`;
    return d;
  };

  const pathD = getPathD();

  // dynamic placement coordinates for the Today location boundary pin
  const getTodayMarkerCoords = () => {
    const visited = sortedStops.filter(s => s.visited);
    const planned = sortedStops.filter(s => !s.visited);

    if (visited.length > 0 && planned.length > 0) {
      const lastVisited = visited[visited.length - 1];
      const firstPlanned = planned[0];
      return {
        x: (lastVisited.x + firstPlanned.x) / 2,
        y: (lastVisited.y + firstPlanned.y) / 2
      };
    } else if (planned.length === 0 && visited.length > 0) {
      const lastVisited = visited[visited.length - 1];
      return {
        x: (lastVisited.x + 300) / 2,
        y: lastVisited.y + 100
      };
    } else if (visited.length === 0 && planned.length > 0) {
      const firstPlanned = planned[0];
      return {
        x: (300 + firstPlanned.x) / 2,
        y: firstPlanned.y - 80
      };
    }
    return { x: 300, y: 160 };
  };

  const todayCoords = getTodayMarkerCoords();

  // Count-up animations state
  const [visitedCount, setVisitedCount] = useState(0);
  const [plannedCount, setPlannedCount] = useState(0);

  useEffect(() => {
    const vTotal = stops.filter(s => s.visited).length;
    const pTotal = stops.filter(s => !s.visited).length;

    let vCurrent = 0;
    let pCurrent = 0;

    const interval = setInterval(() => {
      let updated = false;
      if (vCurrent < vTotal) {
        vCurrent++;
        setVisitedCount(vCurrent);
        updated = true;
      }
      if (pCurrent < pTotal) {
        pCurrent++;
        setPlannedCount(pCurrent);
        updated = true;
      }
      if (!updated) clearInterval(interval);
    }, 100);

    return () => clearInterval(interval);
  }, [stops]);

  // Background slow drifting stars canvas loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: Array<{ x: number; y: number; size: number; speed: number; opacity: number }> = [];

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 800;
      canvas.height = totalHeight;
    };
    resize();

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.8,
        speed: Math.random() * 0.08 + 0.03,
        opacity: Math.random() * 0.4 + 0.15
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      
      particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        p.y -= p.speed;
        p.x += Math.sin(p.y * 0.003) * 0.08;

        if (p.y < 0) {
          p.y = canvas.height;
          p.x = Math.random() * canvas.width;
        }
      });
      animationId = requestAnimationFrame(draw);
    };

    draw();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [stops]);

  // Confetti system
  const triggerConfetti = (accentColor: string) => {
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      rotation: number;
      rotSpeed: number;
    }> = [];

    const colors = [accentColor, '#ffffff', '#8b5cf6', '#ec4899', '#f59e0b', '#3b82f6'];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2 + 80,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.8) * 16 - 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 5,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.25
      });
    }

    let frame = 0;
    const animate = () => {
      if (frame > 100) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.55;
        p.vx *= 0.98;
        p.rotation += p.rotSpeed;
      });

      frame++;
      requestAnimationFrame(animate);
    };

    animate();
  };

  // Convert Planned Stop to Visited (confetti celebration, mist fade, float halt)
  const handleMarkAsVisited = (stop: TrailStop) => {
    setConvertingStopId(stop.id);
    setActiveStop(null);

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(360, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(840, audioCtx.currentTime + 0.45);
      gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.45);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {}

    triggerConfetti(getCategoryColor(stop.category));

    setTimeout(() => {
      setStops(prev => prev.map(s => {
        if (s.id === stop.id) {
          return {
            ...s,
            visited: true,
            date: new Date().toISOString().split('T')[0], // today
            plannedDate: undefined
          };
        }
        return s;
      }));
      setConvertingStopId(null);
    }, 1500);
  };

  // Open modal prefilled for adding
  const openAddModal = () => {
    setFormName('');
    setFormCategory('Tropical');
    setFormImage(PRESET_IMAGES[0].url);
    setFormVisited(true);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormPlannedDate('2026-10');
    setFormInspiration('');
    setShowAddModal(true);
  };

  // Save stop
  const handleSaveNewStop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const newStop: TrailStop = {
      id: `stop-${Date.now()}`,
      name: formName,
      category: formCategory,
      image: formImage,
      visited: formVisited,
      date: formVisited ? formDate : undefined,
      plannedDate: !formVisited ? formPlannedDate : undefined,
      inspiration: !formVisited && formInspiration ? formInspiration : undefined
    };

    setStops(prev => [...prev, newStop]);
    setShowAddModal(false);
  };

  // Open edit modal prefilled
  const openEditModal = (stop: TrailStop, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingStop(stop);
    setFormName(stop.name);
    setFormCategory(stop.category);
    setFormImage(stop.image);
    setFormVisited(stop.visited);
    setFormDate(stop.date || new Date().toISOString().split('T')[0]);
    setFormPlannedDate(stop.plannedDate || '2026-10');
    setFormInspiration(stop.inspiration || '');
  };

  // Update existing stop
  const handleUpdateStop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStop || !formName.trim()) return;

    setStops(prev => prev.map(s => {
      if (s.id === editingStop.id) {
        return {
          ...s,
          name: formName,
          category: formCategory,
          image: formImage,
          visited: formVisited,
          date: formVisited ? formDate : undefined,
          plannedDate: !formVisited ? formPlannedDate : undefined,
          inspiration: !formVisited && formInspiration ? formInspiration : undefined
        };
      }
      return s;
    }));
    setEditingStop(null);
  };

  // Remove stop
  const handleRemoveStop = (id: string) => {
    setStops(prev => prev.filter(s => s.id !== id));
    setEditingStop(null);
  };

  const getCollageImages = (stop: TrailStop): string[] => {
    const images = [stop.image];
    const nameLower = stop.name.toLowerCase();
    if (nameLower.includes('ubud') || nameLower.includes('bali')) {
      images.push(
        'https://images.unsplash.com/photo-1524413840003-05174b1e7d73?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1518548419070-2c3101590783?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1501179691627-eeaa65ea017c?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=600&auto=format&fit=crop&q=80'
      );
    } else if (nameLower.includes('reykjavik') || nameLower.includes('iceland')) {
      images.push(
        'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=600&auto=format&fit=crop&q=80'
      );
    } else if (nameLower.includes('amalfi') || nameLower.includes('italy')) {
      images.push(
        'https://images.unsplash.com/photo-1484821541680-6b21fc0168f5?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&auto=format&fit=crop&q=80'
      );
    } else {
      switch (stop.category) {
        case 'Tropical':
          images.push(
            'https://images.unsplash.com/photo-1540206395-68808572332f?w=600&q=80',
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
            'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=80',
            'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600&q=80'
          );
          break;
        case 'Winter':
          images.push(
            'https://images.unsplash.com/photo-1485594050903-8e8ee7b071a8?w=600&q=80',
            'https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?w=600&q=80',
            'https://images.unsplash.com/photo-1498623116890-37e912163d5d?w=600&q=80',
            'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=600&q=80'
          );
          break;
        case 'Beaches':
          images.push(
            'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&q=80',
            'https://images.unsplash.com/photo-1473116763269-255ea7b2f5f9?w=600&q=80',
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
            'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=80'
          );
          break;
        case 'Mountains':
          images.push(
            'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600&q=80',
            'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
            'https://images.unsplash.com/photo-1486873249359-2731bd6dafc7?w=600&q=80',
            'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80'
          );
          break;
        case 'Historical':
          images.push(
            'https://images.unsplash.com/photo-1508849789987-4e5333c12b78?w=600&q=80',
            'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=600&q=80',
            'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&q=80',
            'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80'
          );
          break;
      }
    }
    return images;
  };

  return (
    <div 
      className="trail-tab-container" 
      style={{ 
        position: 'relative', 
        width: '100%', 
        minHeight: '100vh', 
        paddingTop: '80px', // Spacing Fix
        paddingBottom: '140px',
        zIndex: 5,
        overflow: 'visible'
      }}
    >
      
      {/* Aurora Ambient Glowing blobs */}
      <div 
        style={{
          position: 'absolute',
          top: '10%',
          left: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />
      <div 
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* Confetti canvas */}
      <canvas 
        ref={confettiCanvasRef}
        style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 99999 }}
      />

      {/* Stars canvas */}
      <canvas 
        ref={canvasRef}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}
      />

      {/* DESIGNER-GRADE HUD HEADER */}
      <div 
        style={{
          background: 'rgba(13, 16, 27, 0.45)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          padding: '28px 36px',
          borderRadius: '24px',
          marginBottom: '50px',
          zIndex: 10,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', tracking: '2px', letterSpacing: '2px', color: 'var(--primary)', fontWeight: 800 }}>
              Cinematic Travel log
            </span>
            <h3 style={{ fontSize: '26px', fontWeight: 900, margin: 0, color: 'var(--text-primary)', fontFamily: 'var(--font-title)', letterSpacing: '-0.5px' }}>
              The Trail
            </h3>
          </div>

          <button
            onClick={openAddModal}
            className="btn-primary"
            style={{
              padding: '11px 20px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
              border: 'none',
              boxShadow: '0 4px 15px rgba(236,72,153,0.3)',
              cursor: 'pointer'
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Trail Stop
          </button>
        </div>

        {/* Custom separator glow */}
        <div style={{ width: '100%', height: '1px', background: 'linear-gradient(to right, rgba(255,255,255,0.08), rgba(255,255,255,0.02))' }} />

        {/* Details row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Logged <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{visitedCount} Visited</span> &bull; Scouting <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{plannedCount} Planned</span>
            </div>
            
            {/* Legend indicators */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              {(['Tropical', 'Winter', 'Beaches', 'Mountains', 'Historical'] as const).map(cat => (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: getCategoryColor(cat), boxShadow: `0 0 6px ${getCategoryColor(cat)}` }} />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>{cat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Goal indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)', display: 'block' }}>Explorer Badge Level</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>43% Completion</span>
            </div>

            <div style={{ position: 'relative', width: '48px', height: '48px' }}>
              <svg width="48" height="48" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                <motion.circle 
                  cx="18" 
                  cy="18" 
                  r="16" 
                  fill="none" 
                  stroke="url(#gradient-accent)" 
                  strokeWidth="3.5"
                  strokeDasharray="100"
                  initial={{ strokeDashoffset: 100 }}
                  animate={{ strokeDashoffset: 100 - (3 / 7) * 100 }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  strokeLinecap="round"
                  transform="rotate(-90 18 18)"
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: 'var(--primary)' }}>
                43%
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* DYNAMIC WINDING TIMELINE PATH */}
      <div 
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: `${totalHeight}px`,
          overflow: 'visible',
          zIndex: 5
        }}
      >
        {/* Holographic glowing path lines */}
        <motion.div 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%',
            y: pathYTransform
          }}
        >
          <svg 
            width="100%" 
            height="100%" 
            viewBox={`0 0 600 ${totalHeight}`} 
            fill="none"
            preserveAspectRatio="none"
            style={{ overflow: 'visible' }}
          >
            {/* SVG Filter for clean neon bloom effect */}
            <filter id="neon-bloom" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Glowing underlay sweep line */}
            <path 
              d={pathD}
              stroke="url(#trail-gradient)"
              strokeWidth="9"
              opacity="0.15"
              filter="url(#neon-bloom)"
              strokeLinecap="round"
            />
            {/* Core glowing vector */}
            <motion.path 
              key={stops.length} // forces redrawing on change
              d={pathD}
              stroke="url(#trail-gradient)"
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.8, ease: 'easeInOut' }}
            />
            
            <defs>
              <linearGradient id="gradient-accent" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
              <linearGradient id="trail-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="35%" stopColor="#14b8a6" />
                <stop offset="50%" stopColor="#8b5cf6" />
                {/* Desaturated Planned/Future path line */}
                <stop offset="55%" stopColor="rgba(100, 116, 139, 0.4)" />
                <stop offset="100%" stopColor="rgba(148, 163, 184, 0.08)" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        {/* Narrative travel markers along the curves */}
        {sortedStops.map((stop, i) => {
          if (i === 0) return null;
          const prevY = sortedStops[i - 1].y;
          const midY = (prevY + stop.y) / 2;
          return (
            <div 
              key={`desc-${stop.id}`}
              style={{ 
                position: 'absolute', 
                top: `${midY}px`, 
                left: i % 2 === 0 ? '190px' : '230px', 
                width: '180px', 
                pointerEvents: 'none',
                opacity: 0.45,
                transform: 'translateY(-50%)',
                textAlign: 'center'
              }}
            >
              <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted)', fontWeight: 700 }}>
                {stop.visited ? '✓ visited' : '☉ unvisited'}
              </span>
            </div>
          );
        })}

        {/* RADAR LOCATION BOUNDARY MARKER */}
        <div 
          style={{
            position: 'absolute',
            left: `${todayCoords.x}px`,
            top: `${todayCoords.y}px`,
            transform: 'translate(-50%, -50%)',
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Concentric radar rings */}
          <div 
            style={{
              position: 'absolute',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(236,72,153,0.18)',
              border: '1.5px solid rgba(236,72,153,0.5)',
              animation: 'ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite',
              zIndex: -1
            }}
          />
          <div 
            style={{
              position: 'absolute',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.15)',
              border: '2px solid rgba(255, 255, 255, 0.45)',
              animation: 'pulse 2s infinite'
            }}
          />
          {/* Radar center point */}
          <div 
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: 'var(--brand-gradient)',
              boxShadow: '0 0 12px rgba(236,72,153,1)'
            }}
          />
        </div>

        {/* STOP INFOGRAPHIC NODES */}
        {sortedStops.map((stop, index) => {
          const delay = (stop.y / totalHeight) * 1.5;
          const isLeft = index % 2 === 0;

          return (
            <div
              key={stop.id}
              style={{
                position: 'absolute',
                left: `${stop.x}px`,
                top: `${stop.y}px`,
                transform: 'translate(-50%, -50%)',
                zIndex: 20
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 220, damping: 18, delay }}
              >
                {/* Node wrapper with custom float animation (Planned) */}
                <motion.div
                  onHoverStart={() => setHoveredStopId(stop.id)}
                  onHoverEnd={() => setHoveredStopId(null)}
                  onClick={() => setActiveStop(stop)}
                  animate={
                    !stop.visited && convertingStopId !== stop.id
                      ? { y: [0, -8, 2, -6, 0] } // double-sine bobbing loop
                      : { y: 0 }
                  }
                  transition={
                    !stop.visited && convertingStopId !== stop.id
                      ? { duration: 4.5, repeat: Infinity, ease: 'easeInOut' as const }
                      : undefined
                  }
                  style={{
                    position: 'relative',
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    background: '#0a0d14',
                    // Design border
                    border: stop.visited
                      ? `3.5px solid ${getCategoryColor(stop.category)}`
                      : '2px dashed rgba(255,255,255,0.25)',
                    boxShadow: stop.visited
                      ? `0 0 16px ${getCategoryColor(stop.category)}35`
                      : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'visible'
                  }}
                >
                  
                  {/* Glass Halo cover for premium design */}
                  <div 
                    style={{
                      position: 'absolute',
                      inset: -6,
                      borderRadius: '50%',
                      border: '1px solid rgba(255,255,255,0.03)',
                      background: 'radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 80%)',
                      pointerEvents: 'none',
                      zIndex: -1
                    }}
                  />

                  {/* Photo circle */}
                  <div 
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      // Fog / Grayscale treatment overlays for planned nodes
                      filter: stop.visited 
                        ? 'none' 
                        : hoveredStopId === stop.id 
                          ? 'grayscale(30%) brightness(0.95)' 
                          : 'grayscale(100%) brightness(0.48) blur(0.6px)',
                      transition: 'all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                    }}
                  >
                    <img 
                      src={stop.image} 
                      alt={stop.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>

                  {/* Node Edit floating indicator */}
                  {hoveredStopId === stop.id && (
                    <button
                      onClick={(e) => openEditModal(stop, e)}
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                        border: '2px solid #080a0f',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 40,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
                      }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                    </button>
                  )}

                  {/* DESIGNER FIX: Dynamic side labels adjacent to curve (offset cleanly opposite) */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      // offset left or right based on S-curve index position
                      left: isLeft ? '86px' : 'auto',
                      right: !isLeft ? '86px' : 'auto',
                      width: '190px',
                      textAlign: isLeft ? 'left' : 'right',
                      pointerEvents: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px'
                    }}
                  >
                    <span 
                      style={{ 
                        fontSize: '13px', 
                        fontWeight: 800, 
                        color: hoveredStopId === stop.id ? getCategoryColor(stop.category) : 'var(--text-primary)', 
                        display: 'block',
                        transition: 'color 0.25s ease',
                        fontFamily: 'var(--font-title)'
                      }}
                    >
                      {stop.name}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>
                      {stop.visited ? stop.date : stop.plannedDate}
                    </span>
                  </div>

                  {/* Confetti dissolve circular progress ring */}
                  {convertingStopId === stop.id && (
                    <div 
                      style={{
                        position: 'absolute',
                        inset: -5,
                        borderRadius: '50%',
                        border: '3px solid var(--primary)',
                        animation: 'spin 1s infinite linear',
                        background: 'rgba(236,72,153,0.18)'
                      }}
                    />
                  )}

                </motion.div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* DETAIL DRAWER / POPUP MODALS */}
      <AnimatePresence>
        {activeStop && (
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(5, 6, 12, 0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999, // Layering fix
              padding: '24px'
            }}
            onClick={() => setActiveStop(null)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '430px',
                background: 'rgba(13, 16, 27, 0.85)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 24px 64px rgba(0,0,0,0.8)'
              }}
            >
              {/* Photo header */}
              <div style={{ width: '100%', height: '220px', position: 'relative' }}>
                <img 
                  src={activeStop.image} 
                  alt={activeStop.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 35%, rgba(13,16,27,0.95))' }} />
                
                {/* Category accent tag */}
                <div 
                  style={{ 
                    position: 'absolute', 
                    top: '16px', 
                    right: '16px', 
                    background: getCategoryColor(activeStop.category), 
                    color: 'white', 
                    padding: '4px 12px', 
                    borderRadius: '20px', 
                    fontSize: '9px', 
                    fontWeight: 800, 
                    textTransform: 'uppercase',
                    boxShadow: `0 2px 10px ${getCategoryColor(activeStop.category)}50`
                  }}
                >
                  {activeStop.category}
                </div>

                <div style={{ position: 'absolute', bottom: '16px', left: '20px' }}>
                  <h3 style={{ fontSize: '22px', fontWeight: 900, margin: 0, color: 'var(--text-primary)' }}>{activeStop.name}</h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {activeStop.visited ? `Explored on ${activeStop.date}` : `Bucket list destination &bull; ${activeStop.plannedDate}`}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {activeStop.visited ? (
                  <>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                      You explored {activeStop.name}! View your archived photo postcards, map logs, and stories from this adventure.
                    </p>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                      <button
                        onClick={() => {
                          setShowCollageStop(activeStop);
                          setActiveStop(null);
                        }}
                        className="btn-primary"
                        style={{ flex: 1, padding: '12px', borderRadius: '12px', fontSize: '13px', fontWeight: 700 }}
                      >
                        Explore Memories &amp; Posts
                      </button>
                      <button
                        onClick={() => setActiveStop(null)}
                        style={{ background: 'transparent', border: '1px solid var(--card-border)', color: 'var(--text-primary)', padding: '12px 20px', borderRadius: '12px', fontSize: '13px', fontWeight: 700 }}
                      >
                        Close
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                      Kyoto represents untapped exploration territory! Plan your stays, hotels, and custom travel guide.
                    </p>

                    {activeStop.inspiration && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Inspiration:</span>
                        <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>{activeStop.inspiration}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                      
                      {/* Plan Trip CTA */}
                      <button
                        onClick={() => {
                          setActiveStop(null);
                          if (onOpenChatWithItinerary) onOpenChatWithItinerary(activeStop.name);
                        }}
                        className="btn-primary"
                        style={{ 
                          width: '100%', 
                          padding: '13px', 
                          borderRadius: '12px', 
                          fontSize: '13px', 
                          fontWeight: 700,
                          background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                          border: 'none',
                          boxShadow: '0 4px 15px rgba(236,72,153,0.25)'
                        }}
                      >
                        Plan This Trip with Chatbot &rarr;
                      </button>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => handleMarkAsVisited(activeStop)}
                          style={{ flex: 1, background: '#10b981', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Mark as Visited
                        </button>
                        <button
                          onClick={() => setActiveStop(null)}
                          style={{ background: 'transparent', border: '1px solid var(--card-border)', color: 'var(--text-primary)', padding: '12px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}
                        >
                          Cancel
                        </button>
                      </div>

                    </div>
                  </>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD STOP GLASS MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div 
            style={{
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
            }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '430px',
                background: 'rgba(13, 16, 27, 0.85)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                padding: '28px',
                boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
                overflowY: 'auto',
                maxHeight: '90vh'
              }}
            >
              <h3 style={{ fontSize: '20px', fontWeight: 900, margin: '0 0 20px 0', color: 'var(--text-primary)', fontFamily: 'var(--font-title)', letterSpacing: '-0.5px' }}>Add Stop</h3>
              
              <form onSubmit={handleSaveNewStop} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label-new">Destination Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Rome, Italy"
                    value={formName} 
                    onChange={e => setFormName(e.target.value)} 
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label-new">Category</label>
                  <select 
                    className="form-input" 
                    value={formCategory} 
                    onChange={e => setFormCategory(e.target.value as any)}
                    style={{ background: 'rgba(19, 24, 35, 0.9)', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <option value="Tropical">Tropical</option>
                    <option value="Winter">Winter</option>
                    <option value="Beaches">Beaches</option>
                    <option value="Mountains">Mountains</option>
                    <option value="Historical">Historical</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label-new">Thumbnail preset</label>
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
                    {PRESET_IMAGES.map((img, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => setFormImage(img.url)}
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          border: formImage === img.url ? '2px solid var(--primary)' : '2px solid transparent',
                          flexShrink: 0,
                          transition: 'border 0.2s ease'
                        }}
                      >
                        <img src={img.url} alt={img.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Custom Image URL..." 
                    value={formImage} 
                    onChange={e => setFormImage(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label className="form-label-new" style={{ margin: 0 }}>Mark as Visited?</label>
                  <input 
                    type="checkbox" 
                    checked={formVisited} 
                    onChange={e => setFormVisited(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                </div>

                {formVisited ? (
                  <div className="form-group">
                    <label className="form-label-new">Visited Date</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={formDate} 
                      onChange={e => setFormDate(e.target.value)} 
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }}
                      required
                    />
                  </div>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="form-label-new">Planned Date (e.g. 2026-10)</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="YYYY-MM"
                        value={formPlannedDate} 
                        onChange={e => setFormPlannedDate(e.target.value)} 
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label-new">Inspiration Source</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="e.g. Saved from @wanderlust_jenny's post" 
                        value={formInspiration} 
                        onChange={e => setFormInspiration(e.target.value)}
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                      />
                    </div>
                  </>
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1, padding: '12px', borderRadius: '12px', fontWeight: 700 }}>
                    Save Stop
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowAddModal(false)}
                    style={{ background: 'transparent', border: '1px solid var(--card-border)', color: 'var(--text-primary)', padding: '12px 20px', borderRadius: '12px', fontWeight: 700 }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT STOP GLASS MODAL */}
      <AnimatePresence>
        {editingStop && (
          <div 
            style={{
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
            }}
            onClick={() => setEditingStop(null)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '430px',
                background: 'rgba(13, 16, 27, 0.85)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                padding: '28px',
                boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
                overflowY: 'auto',
                maxHeight: '90vh'
              }}
            >
              <h3 style={{ fontSize: '20px', fontWeight: 900, margin: '0 0 20px 0', color: 'var(--text-primary)', fontFamily: 'var(--font-title)', letterSpacing: '-0.5px' }}>Edit Stop</h3>
              
              <form onSubmit={handleUpdateStop} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label-new">Destination Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formName} 
                    onChange={e => setFormName(e.target.value)} 
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label-new">Category</label>
                  <select 
                    className="form-input" 
                    value={formCategory} 
                    onChange={e => setFormCategory(e.target.value as any)}
                    style={{ background: 'rgba(19, 24, 35, 0.9)', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <option value="Tropical">Tropical</option>
                    <option value="Winter">Winter</option>
                    <option value="Beaches">Beaches</option>
                    <option value="Mountains">Mountains</option>
                    <option value="Historical">Historical</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label-new">Image URL</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formImage} 
                    onChange={e => setFormImage(e.target.value)} 
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label className="form-label-new" style={{ margin: 0 }}>Visited?</label>
                  <input 
                    type="checkbox" 
                    checked={formVisited} 
                    onChange={e => setFormVisited(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                </div>

                {formVisited ? (
                  <div className="form-group">
                    <label className="form-label-new">Visited Date</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={formDate} 
                      onChange={e => setFormDate(e.target.value)} 
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }}
                      required
                    />
                  </div>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="form-label-new">Planned Date (e.g. 2026-10)</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={formPlannedDate} 
                        onChange={e => setFormPlannedDate(e.target.value)} 
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label-new">Inspiration Source</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={formInspiration} 
                        onChange={e => setFormInspiration(e.target.value)}
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                      />
                    </div>
                  </>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn-primary" style={{ flex: 1, padding: '12px', borderRadius: '12px', fontWeight: 700 }}>
                      Update Stop
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setEditingStop(null)}
                      style={{ background: 'transparent', border: '1px solid var(--card-border)', color: 'var(--text-primary)', padding: '12px 16px', borderRadius: '12px', fontWeight: 700 }}
                    >
                      Cancel
                    </button>
                  </div>

                  <button 
                    type="button" 
                    onClick={() => handleRemoveStop(editingStop.id)}
                    style={{ background: '#ef4444', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 700 }}
                  >
                    Remove Stop
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
        {/* PHOTO COLLAGE MODAL OVERLAY */}
        {showCollageStop && (() => {
          const images = getCollageImages(showCollageStop);
          return (
            <div 
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(5, 6, 12, 0.9)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 99999,
                padding: '24px'
              }}
              onClick={() => setShowCollageStop(null)}
            >
              <motion.div
                initial={{ scale: 0.94, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.94, opacity: 0, y: 15 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '100%',
                  maxWidth: '700px',
                  background: 'rgba(13, 16, 27, 0.95)',
                  backdropFilter: 'blur(40px)',
                  WebkitBackdropFilter: 'blur(40px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '28px',
                  padding: '32px',
                  boxShadow: '0 24px 64px rgba(0,0,0,0.85)',
                  maxHeight: '90vh',
                  overflowY: 'auto'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <div>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--primary)', fontWeight: 800 }}>
                      Travel Journal Memories
                    </span>
                    <h3 style={{ fontSize: '24px', fontWeight: 900, margin: 0, color: 'var(--text-primary)', fontFamily: 'var(--font-title)' }}>
                      {showCollageStop.name}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setShowCollageStop(null)}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'var(--text-primary)',
                      fontSize: '20px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    &times;
                  </button>
                </div>

                {/* Collage Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', autoRows: '160px' }}>
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    style={{ gridColumn: 'span 2', gridRow: 'span 2', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', cursor: 'pointer' }}
                  >
                    <img src={images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    style={{ gridRow: 'span 2', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', cursor: 'pointer' }}
                  >
                    <img src={images[1] || PRESET_IMAGES[1].url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', cursor: 'pointer' }}
                  >
                    <img src={images[2] || PRESET_IMAGES[2].url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    style={{ gridColumn: 'span 2', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', cursor: 'pointer' }}
                  >
                    <img src={images[3] || PRESET_IMAGES[3].url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </motion.div>
                </div>

                {/* Footer action */}
                <div style={{ marginTop: '28px', textAlign: 'center' }}>
                  <button 
                    onClick={() => {
                      setShowCollageStop(null);
                      if (onZoomToDestination) onZoomToDestination(showCollageStop.name);
                    }}
                    className="btn-primary"
                    style={{ padding: '12px 28px', borderRadius: '12px', fontSize: '13px', fontWeight: 700 }}
                  >
                    Zoom in to Location Logs
                  </button>
                </div>

              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

    </div>
  );
}
