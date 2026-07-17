'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface VlogItem {
  id: string;
  username: string;
  avatar: string;
  location: string;
  title: string;
  views: string;
  likes: number;
  videoUrl: string;
  duration: string;
  category: string;
  followers: string;
  isVerified: boolean;
  captions: Array<{ time: number; text: string }>;
  featuredStay: {
    id: string;
    name: string;
    image: string;
    price: string;
    location: string;
  };
}

export default function VlogPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === 'string' ? params.id : '';

  const vlogsDatabase: Record<string, VlogItem> = {
    'vlog-1': {
      id: 'vlog-1',
      username: 'nomad_alex',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      location: 'Leh-Ladakh',
      title: 'Solo biking across the highest motorable road in Khardung La! 🏍️ Peak adventure vibes.',
      views: '42.8K views',
      likes: 1254,
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-motorcyclist-riding-on-a-road-in-a-mountain-valley-41584-large.mp4',
      duration: '4:15',
      category: 'Adventure & Road Trips',
      followers: '124K',
      isVerified: true,
      captions: [
        { time: 0, text: "Hey guys, nomad_alex here! Today we're embarking on the ultimate journey." },
        { time: 4, text: "We are solo biking across Khardung La pass in Leh-Ladakh!" },
        { time: 9, text: "At 17,582 feet, this is one of the highest motorable passes in the world." },
        { time: 14, text: "The air is extremely thin here, but look at these spectacular Himalayas!" },
        { time: 20, text: "The winding roads are challenging but the adventure vibes are unmatched." },
        { time: 25, text: "Make sure to subscribe and follow for more raw mountain road trips!" }
      ],
      featuredStay: {
        id: 'list-5',
        name: 'Manali Alpine Retreat',
        image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&auto=format&fit=crop&q=80',
        price: '$80 / night',
        location: 'Manali, India'
      }
    },
    'vlog-2': {
      id: 'vlog-2',
      username: 'wanderlust_jenny',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      location: 'Seminyak, Bali',
      title: 'Top 5 secret beach cafes you must visit in Bali this year! 🍹🌴 Saved the best for last.',
      views: '89.2K views',
      likes: 3821,
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-beach-resort-with-palm-trees-40292-large.mp4',
      duration: '8:40',
      category: 'Tropical Stays & Cafes',
      followers: '310K',
      isVerified: true,
      captions: [
        { time: 0, text: "Hi everyone! Jenny here, coming to you from beautiful Bali." },
        { time: 4, text: "Today I'm revealing the top 5 secret beach cafes in Seminyak." },
        { time: 9, text: "Look at this gorgeous sunset here at La Brisa beach club!" },
        { time: 14, text: "The ocean breeze, cozy lighting, and tropical drinks are absolutely perfect." },
        { time: 20, text: "I've saved the absolute best hidden cafe spot for the end of the vlog." },
        { time: 25, text: "Let's grab a table and check out the menu together!" }
      ],
      featuredStay: {
        id: 'list-2',
        name: 'Forest Canopy Private Villa',
        image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&auto=format&fit=crop&q=80',
        price: '$450 / night',
        location: 'Ubud, Bali'
      }
    },
    'vlog-3': {
      id: 'vlog-3',
      username: 'nomad_vlogs',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
      location: 'Cappadocia, Turkey',
      title: 'Waking up at 5 AM to witness hundreds of hot air balloons fill the sky! Absolutely magical ✨',
      views: '112.5K views',
      likes: 5410,
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hot-air-balloon-rising-at-sunrise-33827-large.mp4',
      duration: '6:20',
      category: 'Bucket List Destinies',
      followers: '450K',
      isVerified: false,
      captions: [
        { time: 0, text: "Good morning from Cappadocia! Yes, it is currently 5:00 AM." },
        { time: 4, text: "We woke up early to witness something truly out of this world." },
        { time: 9, text: "Look behind me! Hundreds of hot air balloons are starting to inflate." },
        { time: 14, text: "And they're off! The morning sky is filled with a sea of colors." },
        { time: 20, text: "Staring out over the fairy chimneys as the balloons rise in the sunrise." },
        { time: 25, text: "This is a true bucket-list dream. You have to experience this once!" }
      ],
      featuredStay: {
        id: 'list-1',
        name: 'Grand Oceanfront Deluxe Suite',
        image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80',
        price: '$220 / night',
        location: 'Nusa Dua, Bali'
      }
    },
    'vlog-4': {
      id: 'vlog-4',
      username: 'backpack_guide',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      location: 'Kyoto, Japan',
      title: 'Exploring the quiet bamboo forests of Arashiyama in the early morning. Sound on 🔊',
      views: '61.4K views',
      likes: 2901,
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-sunlight-through-forest-trees-4841-large.mp4',
      duration: '5:02',
      category: 'Scenic Nature Walkthroughs',
      followers: '85K',
      isVerified: false,
      captions: [
        { time: 0, text: "Welcome to Kyoto, Japan. We're starting our day in Arashiyama." },
        { time: 4, text: "To beat the massive crowds, we arrived just as the sun was rising." },
        { time: 9, text: "The towering green stalks of bamboo create a beautiful green dome." },
        { time: 14, text: "Listen to the wind rustling through the leaves. It's incredibly peaceful." },
        { time: 20, text: "This is a meditative walk that connects you deeply to nature." },
        { time: 25, text: "Let's walk down this forest trail together in absolute silence." }
      ],
      featuredStay: {
        id: 'list-3',
        name: 'Tropical Garden Bungalow',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
        price: '$120 / night',
        location: 'Seminyak, Bali'
      }
    }
  };

  const vlog = vlogsDatabase[id] || vlogsDatabase['vlog-1'];

  // Media Player States
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isVolumeHovered, setIsVolumeHovered] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [quality, setQuality] = useState('720p');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [currentCaption, setCurrentCaption] = useState('');

  // Follow & Like states
  const [isFollowing, setIsFollowing] = useState(false);
  const [likeCount, setLikeCount] = useState(vlog.likes);
  const [isLiked, setIsLiked] = useState(false);

  // Floating Heart reaction particles
  const [localHearts, setLocalHearts] = useState<Array<{ id: number; x: number; y: number; color: string }>>([]);

  // Comments/Chat States
  const [comments, setComments] = useState<Array<{ id: string; user: string; text: string; avatarColor: string }>>([
    { id: '1', user: 'backpacker_sam', text: 'This looks so amazing! Added this to my next itinerary.', avatarColor: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' },
    { id: '2', user: 'nature_explorer', text: 'Stunning footage! Which camera gear did you use to film this?', avatarColor: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
    { id: '3', user: 'sid_vlogs', text: 'This part of the road is extremely slippery. Glad you made it safely!', avatarColor: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)' },
    { id: '4', user: 'wander_soul', text: 'Absolutely spectacular. Keep the travel vlogs coming! 🔥', avatarColor: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)' }
  ]);
  const [commentInput, setCommentInput] = useState('');
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(true);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle auto-scroll comments
  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments]);

  // Video Events
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => setIsPlaying(false));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Handle Captions and Time updates
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration || 1;
      setCurrentTime(current);
      setDurationSec(duration);
      setPlaybackProgress((current / duration) * 100);

      // Subtitle updates
      const matched = vlog.captions
        .filter(c => current >= c.time)
        .slice(-1)[0];
      if (matched) {
        setCurrentCaption(matched.text);
      } else {
        setCurrentCaption('');
      }
    }
  };

  const handleProgressChange = (val: number) => {
    if (videoRef.current && durationSec > 0) {
      const newTime = (val / 100) * durationSec;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setPlaybackProgress(val);
    }
  };

  const togglePlayPause = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMuted) {
      setIsMuted(false);
      if (videoRef.current) videoRef.current.volume = volume;
    } else {
      setIsMuted(true);
      if (videoRef.current) videoRef.current.volume = 0;
    }
  };

  const handleVolumeChange = (val: number) => {
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
    setIsMuted(val === 0);
  };

  const handleVideoClick = () => {
    togglePlayPause();
    triggerControlsGlow();
  };

  const triggerControlsGlow = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Click Reactions
  const handleReactLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikeCount(prev => (isLiked ? prev - 1 : prev + 1));

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = rect.width * 0.35;
      const y = rect.height * 0.45;
      const colors = ['#ec4899', '#f43f5e', '#ef4444', '#a855f7', '#3b82f6'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const heartId = Date.now() + Math.random();

      setLocalHearts(prev => [...prev, { id: heartId, x, y, color: randomColor }]);
      setTimeout(() => {
        setLocalHearts(prev => prev.filter(h => h.id !== heartId));
      }, 1500);
    }
  };

  // Submit Comments
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment = {
      id: String(Date.now()),
      user: 'me',
      text: commentInput.trim(),
      avatarColor: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)'
    };

    setComments(prev => [...prev, newComment]);
    setCommentInput('');
  };

  const formatTime = (timeInSec: number) => {
    const min = Math.floor(timeInSec / 60);
    const sec = Math.floor(timeInSec % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, []);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#05060c',
      backgroundImage: 'radial-gradient(circle at 50% 50%, #0d1020 0%, #05060c 100%)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      color: '#fff',
      fontFamily: 'var(--font-body)'
    }}>
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '-10%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(236, 72, 153, 0.06) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <Link href="/" style={{ textDecoration: 'none' }}>
        <motion.div 
          style={{
            position: 'absolute',
            top: '24px',
            left: '24px',
            zIndex: 10000,
            background: 'rgba(15, 11, 25, 0.7)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          }}
          whileHover={{ scale: 1.08, borderColor: 'rgba(255, 255, 255, 0.25)', background: 'rgba(255, 255, 255, 0.08)' }}
          whileTap={{ scale: 0.94 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </motion.div>
      </Link>

      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        style={{
          width: '100%',
          maxWidth: '1200px',
          height: '88vh',
          maxHeight: '760px',
          background: 'rgba(13, 16, 27, 0.85)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          display: 'flex',
          boxShadow: '0 24px 64px rgba(0,0,0,0.85)',
          overflow: 'hidden',
          zIndex: 100
        }}
      >
        <div style={{ flex: 7, display: 'flex', flexDirection: 'column', height: '100%', borderRight: '1px solid rgba(255, 255, 255, 0.08)', position: 'relative' }}>
          <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6', boxShadow: '0 0 8px #8b5cf6' }} />
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#8b5cf6', fontWeight: 800 }}>TRAVORA VLOG</span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{vlog.category} &bull; {vlog.views}</span>
          </div>

          <div 
            ref={containerRef}
            onMouseMove={triggerControlsGlow}
            onMouseLeave={() => {
              if (isPlaying) {
                setShowControls(false);
              }
            }}
            onClick={handleVideoClick}
            style={{ 
              flex: 1, 
              background: '#000', 
              position: 'relative', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              overflow: 'hidden', 
              cursor: 'pointer' 
            }}
          >
            <video 
              ref={videoRef}
              src={vlog.videoUrl} 
              autoPlay 
              loop 
              muted={isMuted}
              onTimeUpdate={handleTimeUpdate}
              playsInline 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />

            {captionsEnabled && currentCaption && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                style={{
                  position: 'absolute',
                  bottom: '75px',
                  left: 0,
                  right: 0,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  width: 'fit-content',
                  maxWidth: '85%',
                  background: 'rgba(0, 0, 0, 0.7)',
                  backdropFilter: 'blur(4px)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 500,
                  textAlign: 'center',
                  zIndex: 8,
                  pointerEvents: 'none',
                  letterSpacing: '0.2px',
                  textShadow: '0px 1px 2px rgba(0, 0, 0, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                {currentCaption}
              </motion.div>
            )}

            {showFeaturedStay && (
              <Link 
                href={`/venture/listings/${vlog.featuredStay.id}`}
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  left: '20px',
                  bottom: '80px',
                  zIndex: 39,
                  textDecoration: 'none'
                }}
              >
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  style={{
                    width: '240px',
                    background: 'rgba(15, 11, 25, 0.85)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '10px',
                    boxShadow: '0 10px 24px rgba(0, 0, 0, 0.5)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(15, 11, 25, 0.95)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(15, 11, 25, 0.85)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Close button on stay card */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowFeaturedStay(false);
                    }}
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: '#ef4444',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      zIndex: 42
                    }}
                    title="Dismiss card"
                  >
                    &times;
                  </button>

                  <img src={vlog.featuredStay.image} alt="" style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '8px', fontWeight: 800, color: '#ec4899', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block' }}>
                      Explore Area Stay
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: 'white', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {vlog.featuredStay.name}
                    </span>
                    <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.6)', display: 'block' }}>
                      {vlog.featuredStay.price}
                    </span>
                  </div>
                  <div style={{
                    background: 'rgba(236,72,153,0.1)',
                    border: '1px solid rgba(236,72,153,0.25)',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    color: '#ec4899',
                    fontSize: '9px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}>
                    Book
                  </div>
                </motion.div>
              </Link>
            )}

            {localHearts.map((heart) => (
              <motion.div
                key={heart.id}
                initial={{ opacity: 1, scale: 0.8, x: heart.x - 12, y: heart.y - 12 }}
                animate={{ 
                  opacity: 0, 
                  scale: 1.4, 
                  y: heart.y - 120,
                  x: heart.x - 12 + (Math.random() * 40 - 20)
                }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  pointerEvents: 'none',
                  zIndex: 5,
                  color: heart.color
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </motion.div>
            ))}

            {!isChatPanelOpen && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsChatPanelOpen(true);
                }}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '16px',
                  zIndex: 40,
                  background: 'rgba(15, 11, 25, 0.75)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
                }}
                whileHover={{ scale: 1.03, background: 'rgba(255, 255, 255, 0.08)' }}
                whileTap={{ scale: 0.97 }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                Open Comments
              </motion.button>
            )}

            <motion.div
              animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : 8 }}
              transition={{ duration: 0.25 }}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                zIndex: 10,
                pointerEvents: showControls ? 'auto' : 'none'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.7)' }}>{formatTime(currentTime)}</span>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={playbackProgress}
                  onChange={(e) => handleProgressChange(parseFloat(e.target.value))}
                  style={{
                    width: '100%',
                    height: '4px',
                    accentColor: '#8b5cf6',
                    background: `linear-gradient(to right, #8b5cf6 ${playbackProgress}%, rgba(255,255,255,0.2) ${playbackProgress}%)`,
                    borderRadius: '2px',
                    cursor: 'pointer',
                    outline: 'none',
                    border: 'none',
                    WebkitAppearance: 'none'
                  }}
                />
                <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.7)' }}>{formatTime(durationSec)}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifycontent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                  <button 
                    onClick={togglePlayPause}
                    style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                  >
                    {isPlaying ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    )}
                  </button>

                  <div 
                    onMouseEnter={() => setIsVolumeHovered(true)}
                    onMouseLeave={() => setIsVolumeHovered(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <button 
                      onClick={toggleMute}
                      style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                    >
                      {isMuted ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                          <line x1="23" y1="9" x2="17" y2="15"></line>
                          <line x1="17" y1="9" x2="23" y2="15"></line>
                        </svg>
                      ) : volume < 0.5 ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        </svg>
                      )}
                    </button>
                    
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ 
                        width: isVolumeHovered ? 70 : 0, 
                        opacity: isVolumeHovered ? 1 : 0 
                      }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden', display: 'flex', alignItems: 'center' }}
                    >
                      <input 
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        style={{
                          width: '60px',
                          height: '4px',
                          accentColor: '#8b5cf6',
                          background: 'rgba(255,255,255,0.2)',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      />
                    </motion.div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <button 
                    onClick={() => setCaptionsEnabled(!captionsEnabled)}
                    style={{ 
                      background: 'transparent', 
                      border: 'none', 
                      color: captionsEnabled ? '#8b5cf6' : 'white', 
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center',
                      filter: captionsEnabled ? 'drop-shadow(0 0 4px #8b5cf6)' : 'none',
                      transition: 'all 0.2s ease',
                      padding: 0
                    }}
                    title="Toggle Captions"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2" ry="2" fill={captionsEnabled ? 'rgba(139, 92, 246, 0.2)' : 'transparent'}></rect>
                      <text x="5" y="14" fill="currentColor" fontSize="7" fontWeight="bold" fontFamily="monospace">CC</text>
                    </svg>
                  </button>

                  <div style={{ position: 'relative' }}>
                    <button 
                      onClick={() => setShowQualityMenu(!showQualityMenu)}
                      style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                      title="Quality Settings"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showQualityMenu ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.5 1z"></path>
                      </svg>
                    </button>

                    <AnimatePresence>
                      {showQualityMenu && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 10 }}
                          style={{
                            position: 'absolute',
                            bottom: 'calc(100% + 12px)',
                            right: 0,
                            background: 'rgba(15, 11, 25, 0.95)',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '8px',
                            padding: '6px',
                            width: '100px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                            zIndex: 100,
                          }}
                        >
                          {['1080p', '720p', '480p', 'Auto'].map(opt => (
                            <button
                              key={opt}
                              onClick={() => {
                                setQuality(opt);
                                setShowQualityMenu(false);
                              }}
                              style={{
                                background: quality === opt ? 'rgba(139, 92, 246, 0.25)' : 'transparent',
                                border: 'none',
                                borderRadius: '4px',
                                color: 'white',
                                padding: '6px 8px',
                                fontSize: '11px',
                                fontWeight: 600,
                                textAlign: 'left',
                                cursor: 'pointer',
                                width: '100%',
                              }}
                            >
                              {opt}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button 
                    onClick={toggleFullscreen}
                    style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                    title="Fullscreen"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          <div style={{ padding: '24px', background: 'rgba(9, 10, 16, 0.4)' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'white', margin: '0 0 16px' }}>{vlog.title}</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '15px',
                  fontWeight: 700,
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                  border: '1.5px solid rgba(255, 255, 255, 0.15)'
                }}>
                  {vlog.username.slice(0, 2).toUpperCase()}
                </div>
                
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>@{vlog.username}</span>
                    {vlog.isVerified && (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="#3b82f6">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    )}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{vlog.followers} Followers</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <motion.button 
                  onClick={() => setIsFollowing(!isFollowing)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: isFollowing ? 'rgba(255,255,255,0.08)' : '#ffffff',
                    color: isFollowing ? '#cbd5e1' : '#090a10',
                    border: isFollowing ? '1px solid rgba(255,255,255,0.1)' : 'none',
                    boxShadow: isFollowing ? 'none' : '0 4px 12px rgba(255,255,255,0.15)'
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </motion.button>

                <motion.button 
                  onClick={handleReactLike}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    background: isLiked ? 'rgba(236, 72, 153, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid ' + (isLiked ? 'rgba(236, 72, 153, 0.3)' : 'rgba(255, 255, 255, 0.1)'),
                    color: isLiked ? '#ec4899' : '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                  whileHover={{ scale: 1.04, background: isLiked ? 'rgba(236, 72, 153, 0.2)' : 'rgba(255, 255, 255, 0.08)' }}
                  whileTap={{ scale: 0.96 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  <span>{likeCount}</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isChatPanelOpen && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '345px', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{ 
                flexShrink: 0, 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%', 
                background: 'rgba(7, 8, 14, 0.4)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', minWidth: '345px' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: 'white' }}>Comments ({comments.length})</span>
                <button 
                  onClick={() => setIsChatPanelOpen(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="11 17 6 12 11 7"></polyline>
                    <polyline points="18 17 13 12 18 7"></polyline>
                  </svg>
                </button>
              </div>

              <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', minWidth: '345px' }}>
                {comments.map(msg => (
                  <div key={msg.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '12px', lineHeight: '1.4' }}>
                    <div style={{ 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '50%',
                      background: msg.avatarColor,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '10px',
                      flexShrink: 0
                    }}>
                      {msg.user[0].toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                        <span style={{ fontWeight: 850, color: 'rgba(255,255,255,0.9)' }}>@{msg.user}</span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', margin: 0, wordBreak: 'break-word' }}>{msg.text}</p>
                    </div>
                  </div>
                ))}
                <div ref={commentsEndRef} />
              </div>

              <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', minWidth: '345px', background: 'rgba(5, 6, 12, 0.4)' }}>
                <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Add a comment..."
                    style={{
                      flex: 1,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: 'white',
                      fontSize: '12px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                  <button 
                    type="submit"
                    style={{
                      background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 10px rgba(139, 92, 246, 0.2)'
                    }}
                  >
                    Send
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
