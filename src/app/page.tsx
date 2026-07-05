'use client';

import React, { useState, useEffect } from 'react';
import Logo from '@/components/Logo';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const { user, loading, login, signup, logout, updateTravellerType, forgotPassword, verifyOtp, resetPassword } = useAuth();

  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return count.toString();
  };

  const renderAvatar = (username: string, size = 40) => {
    if (!username) return null;
    const cleanName = username.startsWith('@') ? username.slice(1) : username;
    const initials = cleanName.split('_').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    
    const gradients = [
      'linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)',
      'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
      'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
      'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)'
    ];
    
    const hash = cleanName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradient = gradients[hash % gradients.length];
    
    return (
      <div 
        className="premium-avatar" 
        style={{ 
          width: `${size}px`, 
          height: `${size}px`, 
          borderRadius: '50%', 
          background: gradient, 
          color: 'white', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: `${size * 0.38}px`, 
          fontWeight: 700,
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15), inset 0 2px 4px rgba(255, 255, 255, 0.2)',
          border: '1.5px solid var(--glass-border)',
          textShadow: '0 1px 2px rgba(0,0,0,0.2)',
          flexShrink: 0
        }}
      >
        {initials}
      </div>
    );
  };

  const renderMilestoneIcon = (id: string, size = 22) => {
    switch (id) {
      case 'ms-1':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L14 19v-5.5l8 2.5z"/>
          </svg>
        );
      case 'ms-2':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 20L12 4L22 20H2Z" />
            <path d="M12 4L15 10H9L12 4Z" fill="currentColor" opacity="0.4" />
          </svg>
        );
      case 'ms-3':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" opacity="0.3" />
          </svg>
        );
      case 'ms-4':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        );
      case 'ms-5':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 7l-7 5 7 5V7z" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
        );
      case 'ms-6':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
            <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
          </svg>
        );
      default:
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="12" cy="12" r="10" />
          </svg>
        );
    }
  };


  // Splash Screen States
  const [showSplash, setShowSplash] = useState(true);
  const [fadeClass, setFadeClass] = useState('');
  const [contentVisible, setContentVisible] = useState(false);

  // Form Switch States
  const [formMode, setFormMode] = useState<'login' | 'signup'>('login');
  const [userRole, setUserRole] = useState<'traveller' | 'business'>('traveller');
  const [showPassword, setShowPassword] = useState(false);

  // Input states (Common)
  const [identifier, setIdentifier] = useState(''); // email or username for login
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Birthday Selects
  const [birthMonth, setBirthMonth] = useState('Month');
  const [birthDay, setBirthDay] = useState('Day');
  const [birthYear, setBirthYear] = useState('Year');

  // Traveller Specific Inputs
  const [isVlogger, setIsVlogger] = useState(false);

  // Business Specific Inputs
  const [businessType, setBusinessType] = useState<'agency' | 'hotel'>('agency');
  const [businessName, setBusinessName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [address, setAddress] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [bookingModel, setBookingModel] = useState<'direct' | 'redirect'>('direct');

  // Form UI Feedback States
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ==========================================
  // Premium Social Feed States
  // ==========================================
  const [activeTab, setActiveTab] = useState<'home' | 'reels' | 'search' | 'create' | 'messages' | 'profile'>('home');
  const [isMiniInboxOpen, setIsMiniInboxOpen] = useState(false);
  const [isExpandingFullscreen, setIsExpandingFullscreen] = useState(false);
  const [miniSlideActive, setMiniSlideActive] = useState(false);
  const [miniActiveChatBuddy, setMiniActiveChatBuddy] = useState<string | null>(null);
  const [miniChatInput, setMiniChatInput] = useState('');
  const [miniSearchQuery, setMiniSearchQuery] = useState('');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeExploreCategory, setActiveExploreCategory] = useState('All');
  const [isSwitchingCategory, setIsSwitchingCategory] = useState(false);
  const [hasEverSwitchedCategory, setHasEverSwitchedCategory] = useState(false);
  const [showSearchDrawer, setShowSearchDrawer] = useState(false);
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'following' | 'comments' | 'follows'>('all');
  
  // Dedicated Vlogs Feed state
  const [vlogs, setVlogs] = useState([
    {
      id: 'vlog-1',
      username: 'nomad_alex',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      location: 'Leh-Ladakh 🏔️',
      title: 'Solo biking across the highest motorable road in Khardung La! 🏍️ Peak adventure vibes.',
      views: '42.8K views',
      likes: 1254,
      thumbnail: '/vlog-1.png',
      duration: '4:15',
      liked: false
    },
    {
      id: 'vlog-2',
      username: 'wanderlust_jenny',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      location: 'Seminyak, Bali 🌴',
      title: 'Top 5 secret beach cafes you must visit in Bali this year! 🍹🌴 Saved the best for last.',
      views: '89.2K views',
      likes: 3821,
      thumbnail: '/vlog-2.png',
      duration: '8:40',
      liked: false
    },
    {
      id: 'vlog-3',
      username: 'nomad_vlogs',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
      location: 'Cappadocia, Turkey 🎈',
      title: 'Waking up at 5 AM to witness hundreds of hot air balloons fill the sky! Absolutely magical ✨',
      views: '112.5K views',
      likes: 5410,
      thumbnail: '/vlog-3.png',
      duration: '6:20',
      liked: false
    },
    {
      id: 'vlog-4',
      username: 'backpack_guide',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      location: 'Kyoto, Japan ⛩️',
      title: 'Exploring the quiet bamboo forests of Arashiyama in the early morning. Sound on 🔊',
      views: '61.4K views',
      likes: 2901,
      thumbnail: '/vlog-4.png',
      duration: '5:02',
      liked: false
    }
  ]);

  const toggleLikeVlog = (id: string) => {
    setVlogs((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          return {
            ...v,
            liked: !v.liked,
            likes: v.liked ? v.likes - 1 : v.likes + 1
          };
        }
        return v;
      })
    );
  };

  // Custom posts list state
  const [posts, setPosts] = useState([
    {
      id: 'post-1',
      username: 'wanderlust_jenny',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      location: 'Ubud, Bali 🌴',
      images: [
        'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80'
      ],
      caption: 'Waking up to tropical jungle sounds in Bali... this place is absolute heaven! 💚 Who wants to join my next backpacking trip here?',
      hashtags: ['#bali', '#backpacking', '#nature', '#travelbuddy'],
      likesCount: 142,
      comments: [
        { id: 'c1', username: 'backpacker_sam', text: 'Stunning! I am planning to visit Ubud next month. Let’s connect!' },
        { id: 'c2', username: 'nomad_alex', text: 'Which villa is this? Looks incredible.' }
      ]
    },
    {
      id: 'post-2',
      username: 'backpacker_sam',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      location: 'Solang Valley, Manali 🏔️',
      images: [
        'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80'
      ],
      caption: 'First summit climb of the year! The thin air, cold wind, and majestic views are worth every step. 🏔️ Solang Valley never ceases to amaze.',
      hashtags: ['#manali', '#climbing', '#adventure', '#mountains'],
      likesCount: 98,
      comments: [
        { id: 'c3', username: 'wanderlust_jenny', text: 'So proud of you Sam! Safe travels!' }
      ]
    },
    {
      id: 'post-3',
      username: 'stay_luxury_bali',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      location: 'Seminyak, Goa 🌊',
      images: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&auto=format&fit=crop&q=80'
      ],
      caption: 'Golden hour at our beachside resort. Private pool villas available direct. Link in bio! 🌅🍹',
      hashtags: ['#goa', '#luxuryresort', '#sunset', '#beachlife'],
      likesCount: 215,
      comments: [
        { id: 'c4', username: 'nomad_alex', text: 'Just booked a weekend stay here, can’t wait!' }
      ]
    }
  ]);

  // Stories list state
  const [stories, setStories] = useState([
    { id: 'story-1', username: 'Your Story', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&auto=format&fit=crop&q=80', caption: 'Sunrise hike above the clouds! 🌅🧗‍♂️', viewed: false, isLive: false },
    { id: 'story-2', username: 'nomad_vlogs', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80', caption: 'LIVE STREAM: Hidden Waterfalls Trek! 💦🎥', viewed: false, isLive: true },
    { id: 'story-3', username: 'backpacker_sam', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&auto=format&fit=crop&q=80', caption: 'Campfire talks in the freezing cold! 🪵🔥', viewed: false, isLive: false },
    { id: 'story-4', username: 'wanderlust_jenny', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&auto=format&fit=crop&q=80', caption: 'Scooter rides through Bali rice fields! 🛵🌾', viewed: false, isLive: false },
    { id: 'story-5', username: 'nomad_alex', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop&q=80', caption: 'Fresh croissants in Paris! 🥐🇫🇷', viewed: false, isLive: false }
  ]);

  // Active story viewing states
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [storyProgress, setStoryProgress] = useState(0);

  // Notifications State
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 'n1', username: 'backpacker_sam', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', type: 'like', text: 'liked your post.', time: '2m ago' },
    { id: 'n2', username: 'wanderlust_jenny', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', type: 'comment', text: 'commented: "Stunning shot!"', time: '15m ago' },
    { id: 'n3', username: 'nomad_alex', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', type: 'follow', text: 'started following you.', time: '1h ago' }
  ]);
  const [unreadNotifications, setUnreadNotifications] = useState(3);

  // Settings Drawer State
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // AI Chatbot States
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [aiChatMessages, setAiChatMessages] = useState([
    { sender: 'ai', text: 'Hi! I’m your Travora AI assistant. Ask me anything about itineraries, local tips, or travel recommendations!' }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiTyping, setAiTyping] = useState(false);

  // Direct Inbox Messages States
  const [activeChatBuddy, setActiveChatBuddy] = useState('backpacker_sam');
  const [isSwitchingChat, setIsSwitchingChat] = useState(false);

  const handleSwitchActiveChat = (buddy: string) => {
    if (buddy === activeChatBuddy) return;
    setIsSwitchingChat(true);
    setTimeout(() => {
      setActiveChatBuddy(buddy);
      setIsSwitchingChat(false);
    }, 220);
  };

  const handleSwitchExploreCategory = (cat: string) => {
    if (cat === activeExploreCategory) return;
    
    // Play synthesized micro-sound click
    playUISound('click');
    
    // Dynamically update background mood glow color based on category
    let moodColor = 'rgba(139, 92, 246, 0.15)';
    if (cat === 'Mountains') moodColor = 'rgba(59, 130, 246, 0.15)';
    else if (cat === 'Beaches') moodColor = 'rgba(236, 72, 153, 0.15)';
    else if (cat === 'Tropical') moodColor = 'rgba(245, 158, 11, 0.15)';
    else if (cat === 'Cities') moodColor = 'rgba(16, 185, 129, 0.15)';
    else if (cat === 'Winter') moodColor = 'rgba(6, 182, 212, 0.15)';
    else if (cat === 'Cultural') moodColor = 'rgba(219, 39, 119, 0.15)';
    setCategoryMoodColor(moodColor);

    setHasEverSwitchedCategory(true);
    setIsSwitchingCategory(true);
    setTimeout(() => {
      setActiveExploreCategory(cat);
      setIsSwitchingCategory(false);
    }, 220);
  };

  const renderCategoryIcon = (catName: string) => {
    switch (catName) {
      case 'All':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
            <path d="M2 12h20" />
          </svg>
        );
      case 'Mountains':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
          </svg>
        );
      case 'Beaches':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 10c3 0 3 3 6 3s3-3 6-3 3 3 6 3 3-3 6-3" />
            <path d="M2 14c3 0 3 3 6 3s3-3 6-3 3 3 6 3 3-3 6-3" />
          </svg>
        );
      case 'Tropical':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Palm tree trunk */}
            <path d="M12 22V12" />
            {/* Left frond */}
            <path d="M12 12C12 12 6 10 4 5c2 1 5 2 8 7z" />
            {/* Right frond */}
            <path d="M12 12C12 12 18 10 20 5c-2 1-5 2-8 7z" />
            {/* Top frond */}
            <path d="M12 12C12 12 10 6 12 2c1 2 2 5 0 10z" />
            {/* Trunk curve */}
            <path d="M12 22c-1-4 2-7 3-10" />
          </svg>
        );
      case 'Cities':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 22h20M4 22V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v16M12 22V10a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v12" />
          </svg>
        );
      case 'Winter':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="2" x2="12" y2="22" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="m20 16-4-4 4-4M4 8l4 4-4 4M16 4l-4 4-4-4M8 20l4-4 4 4" />
          </svg>
        );
      case 'Cultural':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Temple / Pagoda icon */}
            <path d="M3 21h18" />
            <path d="M5 21V10l7-7 7 7v11" />
            <path d="M9 21v-6h6v6" />
            <path d="M2 10h20" />
            <path d="M6 10V7" />
            <path d="M18 10V7" />
          </svg>
        );
      default:
        return null;
    }
  };
  const [chatInput, setChatInput] = useState('');
  const [conversations, setConversations] = useState<Record<string, { sender: 'them' | 'me'; text: string; time: string }[]>>({
    'backpacker_sam': [
      { sender: 'them', text: 'Hey, are you going to Manali next week?', time: '10:30 AM' },
      { sender: 'me', text: 'Yes! Planning to stay near Solang Valley. How is the weather?', time: '10:32 AM' },
      { sender: 'them', text: 'It’s amazing right now, perfect for trekking! Bring a warm jacket.', time: '10:35 AM' }
    ],
    'wanderlust_jenny': [
      { sender: 'them', text: 'Loved your post! Bali was so magical.', time: 'Yesterday' },
      { sender: 'me', text: 'Thank you! Yes, Seminyak is a dream.', time: 'Yesterday' }
    ],
    'nomad_alex': [
      { sender: 'them', text: 'Do you recommend hostel stays or homestays in Goa?', time: '2 days ago' },
      { sender: 'me', text: 'Hostels are great for meeting people, homestays are better for peace.', time: '2 days ago' }
    ]
  });

  // Reels list data & interactions
  const [reels, setReels] = useState([
    {
      id: 'reel-1',
      username: 'nomad_vlogs',
      avatar: '🎥',
      caption: 'Exploring hidden waterfalls in Bali! 💦 Nature at its finest. #travelvlog #waterfalls #bali',
      soundtrack: 'Nomad Vlogs - Original Audio',
      likes: 1205,
      comments: 89,
      imageGradient: 'linear-gradient(to bottom, #0284c7, #8b5cf6, #ec4899)'
    },
    {
      id: 'reel-2',
      username: 'iceland_explorer',
      avatar: '🦊',
      caption: 'Chasing sunsets across the black sand beach in Iceland. 🌋🌊 #iceland #sunset #glacier',
      soundtrack: 'Iceland Explorer - Soundscapes',
      likes: 852,
      comments: 42,
      imageGradient: 'linear-gradient(to bottom, #111827, #1e3a8a, #0d9488)'
    },
    {
      id: 'reel-3',
      username: 'backpacker_sam',
      avatar: '🧗‍♂️',
      caption: 'Morning views from 4,000 meters above sea level! 🏔️☕ #mountains #hiking #camping #sunrise',
      soundtrack: 'Backpacker Sam - Morning Chill',
      likes: 1943,
      comments: 112,
      imageGradient: 'linear-gradient(to bottom, #b45309, #d97706, #10b981)'
    }
  ]);
  const [activeReelIndex, setActiveReelIndex] = useState(0);

  // Advanced Interactive states for Reels
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showRefreshToast, setShowRefreshToast] = useState(false);
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set(['nomad_vlogs']));
  const [likedReels, setLikedReels] = useState<Set<string>>(new Set());
  const [savedReels, setSavedReels] = useState<Set<string>>(new Set());
  const [refreshPoolIndex, setRefreshPoolIndex] = useState(0);

  // Pool of new reels to load on scroll-up refresh
  const refreshPool = [
    {
      id: 'reel-ref-1',
      username: 'travel_guru',
      avatar: '🌸',
      caption: 'Lost in the streets of Kyoto 🇯🇵. The cherry blossoms are breathtaking! #japan #kyoto #sakura',
      soundtrack: 'Travel Guru - Kyoto Lofi Beat',
      likes: 4521,
      comments: 230,
      imageGradient: 'linear-gradient(to bottom, #fbcfe8, #f472b6, #db2777)'
    },
    {
      id: 'reel-ref-2',
      username: 'surf_safari',
      avatar: '🏄‍♂️',
      caption: 'Catching waves at dawn in Costa Rica! 🌊☀️ Pure life vibes. #puravida #surfing #travelgoals',
      soundtrack: 'Surf Safari - Surf Rock Anthems',
      likes: 3120,
      comments: 115,
      imageGradient: 'linear-gradient(to bottom, #06b6d4, #0891b2, #0369a1)'
    },
    {
      id: 'reel-ref-3',
      username: 'aurora_hunter',
      avatar: '🌌',
      caption: 'The northern lights dancing in Norway! 🌌✨ Unbelievable night. #aurora #norway #travel #nightsky',
      soundtrack: 'Aurora Hunter - Cosmic Ambient',
      likes: 7840,
      comments: 429,
      imageGradient: 'linear-gradient(to bottom, #022c22, #064e3b, #0f766e)'
    }
  ];

  // Toggle user follow status
  const toggleFollowUser = (username: string) => {
    setFollowedUsers(prev => {
      const next = new Set(prev);
      if (next.has(username)) {
        next.delete(username);
      } else {
        next.add(username);
      }
      return next;
    });
  };

  // Toggle like status for a reel
  const toggleLikeReel = (reelId: string) => {
    setLikedReels(prev => {
      const next = new Set(prev);
      if (next.has(reelId)) {
        next.delete(reelId);
        setReels(curr => curr.map(r => r.id === reelId ? { ...r, likes: r.likes - 1 } : r));
      } else {
        next.add(reelId);
        setReels(curr => curr.map(r => r.id === reelId ? { ...r, likes: r.likes + 1 } : r));
      }
      return next;
    });
  };

  // Toggle save status for a reel
  const toggleSaveReel = (reelId: string) => {
    setSavedReels(prev => {
      const next = new Set(prev);
      if (next.has(reelId)) {
        next.delete(reelId);
      } else {
        next.add(reelId);
      }
      return next;
    });
  };

  // Pull-to-refresh logic
  const triggerRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    
    setTimeout(() => {
      const nextReel = refreshPool[refreshPoolIndex % refreshPool.length];
      setRefreshPoolIndex(prev => prev + 1);
      
      const uniqueId = `${nextReel.id}-${Date.now()}`;
      const newReel = { ...nextReel, id: uniqueId };
      
      setReels(prev => [newReel, ...prev]);
      setActiveReelIndex(0);
      setIsRefreshing(false);
      setShowRefreshToast(true);
      setTimeout(() => setShowRefreshToast(false), 2000);
    }, 1500);
  };

  // Scroll gesture tracking state to throttle rapid wheel scrolls
  const [lastScrollTime, setLastScrollTime] = useState(0);

  // Debounced mouse wheel scrolling handler
  const handleReelsWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (isRefreshing) return;
    const now = Date.now();
    if (now - lastScrollTime < 850) return; // 850ms throttle
    
    if (e.deltaY > 25) {
      // Scroll Down -> Next Reel
      setActiveReelIndex(prev => (prev + 1) % reels.length);
      setLastScrollTime(now);
    } else if (e.deltaY < -25) {
      // Scroll Up -> Previous Reel OR Refresh
      if (activeReelIndex === 0) {
        triggerRefresh();
      } else {
        setActiveReelIndex(prev => (prev - 1 + reels.length) % reels.length);
      }
      setLastScrollTime(now);
    }
  };

  // Click handler for Prev Arrow (triggers refresh on first reel)
  const handlePrevReel = () => {
    if (isRefreshing) return;
    if (activeReelIndex === 0) {
      triggerRefresh();
    } else {
      setActiveReelIndex(prev => (prev - 1 + reels.length) % reels.length);
    }
  };

  // Click handler for Next Arrow
  const handleNextReel = () => {
    if (isRefreshing) return;
    setActiveReelIndex(prev => (prev + 1) % reels.length);
  };

  // Search places mock dataset
  const travelDestinations = [
    { name: 'Manali, Himachal Pradesh 🏔️', count: '4.8k posts', img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=300&auto=format&fit=crop&q=80', category: 'Mountains' },
    { name: 'Ubud, Bali 🌴', count: '12.5k posts', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=300&auto=format&fit=crop&q=80', category: 'Tropical' },
    { name: 'Seminyak, Goa 🌊', count: '9.2k posts', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80', category: 'Beaches' },
    { name: 'Paris, France 🗼', count: '24.1k posts', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=300&auto=format&fit=crop&q=80', category: 'Cities' },
    { name: 'Reykjavik, Iceland ❄️', count: '3.5k posts', img: 'https://images.unsplash.com/photo-1483168527879-c66136b56105?w=300&auto=format&fit=crop&q=80', category: 'Winter' },
    { name: 'Amalfi Coast, Italy 🍋', count: '18.7k posts', img: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=300&auto=format&fit=crop&q=80', category: 'Cultural' }
  ];

  // Creator state
  const [newPostCaption, setNewPostCaption] = useState('');
  const [newPostLocation, setNewPostLocation] = useState('');
  const [selectedPresetImageIndex, setSelectedPresetImageIndex] = useState(0);
  const creatorPresets = [
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1483168527879-c66136b56105?w=600&auto=format&fit=crop&q=80'
  ];

  // Premium Social Dashboard States
  const [postTitle, setPostTitle] = useState('Austria: Panoramic Lake');
  const [selectedPlatform, setSelectedPlatform] = useState<'Feed' | 'Stories' | 'Community' | 'Highlights'>('Feed');
  const [taggedFriends, setTaggedFriends] = useState<string[]>(['@wanderlust.jenny', '@markstravels']);
  const [friendInput, setFriendInput] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Mountains', 'Adventure']);
  const [scheduleDate, setScheduleDate] = useState('2026-07-04');
  const [scheduleTime, setScheduleTime] = useState('12:00');
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'private'>('public');
  const [allowComments, setAllowComments] = useState(true);
  const [crossPostFacebook, setCrossPostFacebook] = useState(false);
  const [crossPostTwitter, setCrossPostTwitter] = useState(false);
  const [crossPostTiktok, setCrossPostTiktok] = useState(false);
  const [sendNotification, setSendNotification] = useState(true);
  const [previewCarouselIndex, setPreviewCarouselIndex] = useState(0);
  const [locationSuggestionsExpanded, setLocationSuggestionsExpanded] = useState(false);
  const [isPreviewLiked, setIsPreviewLiked] = useState(false);
  const [isPreviewSaved, setIsPreviewSaved] = useState(false);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);

  // Redesigned Destination Discovery States
  const [heroIndex, setHeroIndex] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [liveUpticks, setLiveUpticks] = useState<Record<number, number>>({});
  const [categoryMoodColor, setCategoryMoodColor] = useState('rgba(139, 92, 246, 0.15)'); // default violet glow
  const [discoverMousePos, setDiscoverMousePos] = useState({ x: -1000, y: -1000 }); // start hidden
  const [typedPlaceholderIndex, setTypedPlaceholderIndex] = useState(0);
  const [typedText, setTypedText] = useState('');

  // Elevated Home Feed States
  const [hoveredStoryId, setHoveredStoryId] = useState<string | null>(null);
  const [activeDoubleTapPostId, setActiveDoubleTapPostId] = useState<string | null>(null);
  const [activeMapPostId, setActiveMapPostId] = useState<string | null>(null);
  const [postCarouselIndices, setPostCarouselIndices] = useState<Record<string, number>>({});
  const [loadedFeedImages, setLoadedFeedImages] = useState<Record<string, boolean>>({});
  const [showSwitchDropdown, setShowSwitchDropdown] = useState(false);
  const [hoveredVlogId, setHoveredVlogId] = useState<string | null>(null);
  const [showBellNotifications, setShowBellNotifications] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; message: string }[]>([]);
  const [globalMousePos, setGlobalMousePos] = useState({ x: -1000, y: -1000 });
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [visiblePostsCount, setVisiblePostsCount] = useState(2);
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

  const showToast = (message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2800);
  };

  const handleFeedCarouselLeft = (postId: string, maxLen: number) => {
    setPostCarouselIndices(prev => {
      const cur = prev[postId] || 0;
      const next = cur === 0 ? maxLen - 1 : cur - 1;
      return { ...prev, [postId]: next };
    });
  };

  const handleFeedCarouselRight = (postId: string, maxLen: number) => {
    setPostCarouselIndices(prev => {
      const cur = prev[postId] || 0;
      const next = cur === maxLen - 1 ? 0 : cur + 1;
      return { ...prev, [postId]: next };
    });
  };

  // Global mouse move tracker for reactive glows
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      setGlobalMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, []);

  // Skeleton loader effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingFeed(false);
    }, 1100);
    return () => clearTimeout(timer);
  }, []);

  // Live feed count-up effect
  useEffect(() => {
    if (activeTab === 'home') {
      vlogs.forEach((v) => {
        let targetViews = parseFloat(v.views.replace('K views', '')) * 1000 || 42800;
        let targetLikes = v.likes || 1254;

        let viewsStart = Math.floor(targetViews * 0.75);
        let likesStart = Math.floor(targetLikes * 0.75);

        setViewCounts(prev => ({ ...prev, [v.id]: viewsStart }));
        setLikeCounts(prev => ({ ...prev, [v.id]: likesStart }));

        let vStep = Math.ceil((targetViews - viewsStart) / 10);
        let lStep = Math.ceil((targetLikes - likesStart) / 10);

        let count = 0;
        let interval = setInterval(() => {
          count++;
          setViewCounts(prev => {
            const cur = prev[v.id] || viewsStart;
            if (cur >= targetViews || count >= 10) {
              clearInterval(interval);
              return { ...prev, [v.id]: targetViews };
            }
            return { ...prev, [v.id]: cur + vStep };
          });
          setLikeCounts(prev => {
            const cur = prev[v.id] || likesStart;
            if (cur >= targetLikes || count >= 10) {
              return { ...prev, [v.id]: targetLikes };
            }
            return { ...prev, [v.id]: cur + lStep };
          });
        }, 60);
      });
    }
  }, [activeTab]);

  // --- DESTINATION DISCOVERY REDESIGN HELPERS & EFFECTS ---
  const heroDestinations = [
    { name: 'Ubud, Bali 🌴', desc: "Experience the calming spiritual energy, lush green rice terraces, and beautiful waterfalls of Bali's cultural heart.", visitors: '12.5k posts', rating: '4.9', stars: '★★★★★', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80' },
    { name: 'Reykjavik, Iceland ❄️', desc: 'Marvel at the magical Northern lights, geothermal pools, and active volcanoes in this icy Nordic wonderland.', visitors: '3.5k posts', rating: '4.8', stars: '★★★★½', img: 'https://images.unsplash.com/photo-1483168527879-c66136b56105?w=800&auto=format&fit=crop&q=80' },
    { name: 'Amalfi Coast, Italy 🍋', desc: 'Wander along vertical cliffs, colorful fishing villages, and cliffside lemon gardens overlooking the Tyrrhenian Sea.', visitors: '18.7k posts', rating: '4.9', stars: '★★★★★', img: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&auto=format&fit=crop&q=80' },
    { name: 'Manali, Himachal Pradesh 🏔️', desc: 'Explore snow-covered valleys, local wooden temples, and active winter sports routes in the high Himalayas.', visitors: '4.8k posts', rating: '4.7', stars: '★★★★½', img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80' }
  ];

  // Synthesize Web Audio click/pop sound dynamically without audio assets
  const playUISound = (type: 'tap' | 'open' | 'click' | 'hover') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'tap') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.015, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'open') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(250, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(550, ctx.currentTime + 0.18);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      } else if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === 'hover') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.006, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      }
    } catch (e) {
      console.warn("Web Audio block:", e);
    }
  };

  // Cycle hero index for live morphing banner
  useEffect(() => {
    if (activeTab !== 'search' || isHeroHovered) return;
    const interval = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % heroDestinations.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeTab, isHeroHovered]);

  // Command key listener (⌘K / Ctrl+K)
  useEffect(() => {
    const handleCmdK = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => {
          const next = !prev;
          playUISound(next ? 'open' : 'click');
          return next;
        });
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
      }
    };
    window.addEventListener('keydown', handleCmdK);
    return () => window.removeEventListener('keydown', handleCmdK);
  }, [soundEnabled]);

  // Typing animation suggest loop inside search palette
  useEffect(() => {
    if (!showCommandPalette) return;
    const searchSuggestions = [
      'romantic beach getaways...',
      'trekking in the Himalayas...',
      'winter snowy adventures...',
      'historic cultural pagodas...',
      'best street food spots...'
    ];
    let wordIndex = typedPlaceholderIndex;
    let charIndex = 0;
    let isDeleting = false;
    let currentWord = searchSuggestions[wordIndex];
    let timer: NodeJS.Timeout;

    const tick = () => {
      if (!isDeleting) {
        setTypedText(currentWord.slice(0, charIndex + 1));
        charIndex++;
        if (charIndex >= currentWord.length) {
          isDeleting = true;
          timer = setTimeout(tick, 2000);
        } else {
          timer = setTimeout(tick, 100);
        }
      } else {
        setTypedText(currentWord.slice(0, charIndex - 1));
        charIndex--;
        if (charIndex <= 0) {
          isDeleting = false;
          wordIndex = (wordIndex + 1) % searchSuggestions.length;
          setTypedPlaceholderIndex(wordIndex);
          currentWord = searchSuggestions[wordIndex];
          timer = setTimeout(tick, 500);
        } else {
          timer = setTimeout(tick, 50);
        }
      }
    };

    timer = setTimeout(tick, 500);
    return () => clearTimeout(timer);
  }, [showCommandPalette, typedPlaceholderIndex]);

  // Uptick likes simulation loop
  useEffect(() => {
    if (activeTab !== 'search') return;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * travelDestinations.length);
      setLiveUpticks(prev => ({
        ...prev,
        [randomIdx]: (prev[randomIdx] || 0) + 1
      }));
    }, 7000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const [mediaLibrary, setMediaLibrary] = useState([
    { id: 'lib-1', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80', name: 'mountain_sunrise.jpg', size: '1.2 MB', dimensions: '1920x1080' },
    { id: 'lib-2', url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&auto=format&fit=crop&q=80', name: 'amalfi_sunset.jpg', size: '2.4 MB', dimensions: '2400x1600' },
    { id: 'lib-3', url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop&q=80', name: 'paris_eiffel.jpg', size: '980 KB', dimensions: '1200x800' },
    { id: 'lib-4', url: 'https://images.unsplash.com/photo-1483168527879-c66136b56105?w=600&auto=format&fit=crop&q=80', name: 'iceland_winter.jpg', size: '1.8 MB', dimensions: '1600x1200' },
    { id: 'lib-5', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80', name: 'goa_beach.jpg', size: '1.5 MB', dimensions: '1920x1080' },
    { id: 'lib-6', url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=300&auto=format&fit=crop&q=80', name: 'manali_valley.jpg', size: '1.1 MB', dimensions: '1200x900' }
  ]);

  const [postImages, setPostImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&auto=format&fit=crop&q=80'
  ]);

  // Comment input state dictionary
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  // Story progression effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showStoryViewer) {
      setStoryProgress(0);
      interval = setInterval(() => {
        setStoryProgress((prev) => {
          if (prev >= 100) {
            // Advance or close
            setActiveStoryIndex((currIndex) => {
              const imageStories = stories.filter(s => s.image);
              if (currIndex < imageStories.length - 1) {
                return currIndex + 1;
              } else {
                setShowStoryViewer(false);
                return 0;
              }
            });
            return 0;
          }
          return prev + 2.5; // full in 4s
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [showStoryViewer, activeStoryIndex, stories]);

  // Direct Inbox Messages Handlers
  const handleSendMiniMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!miniActiveChatBuddy || !miniChatInput.trim()) return;

    const newMsg = {
      sender: 'me' as const,
      text: miniChatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setConversations((prev) => ({
      ...prev,
      [miniActiveChatBuddy]: [...(prev[miniActiveChatBuddy] || []), newMsg]
    }));
    setMiniChatInput('');

    // Buddy Auto response
    const currentBuddy = miniActiveChatBuddy;
    setTimeout(() => {
      const responses: Record<string, string[]> = {
        'backpacker_sam': [
          'Wow, that sounds awesome! 🏔️ Can’t wait to meet up.',
          'Let’s catch up later, going out for a trek now! 🚶‍♂️',
          'Perfect! Let know if you need anything from the local guides.'
        ],
        'wanderlust_jenny': [
          'Amazing! Bali has so many hidden gems. 🌴',
          'Are you visiting Ubud soon?',
          'Let’s meet at the beach club! 🍹'
        ],
        'nomad_alex': [
          'Definitely, let’s sync up. 🚀',
          'Sounds good! Let me check my itinerary.',
          'Good choice. Homestays are lovely.'
        ]
      };
      
      const buddyResponses = responses[currentBuddy] || ['Nice! Let me know.'];
      const randomResponse = buddyResponses[Math.floor(Math.random() * buddyResponses.length)];

      const replyMsg = {
        sender: 'them' as const,
        text: randomResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setConversations((prev) => ({
        ...prev,
        [currentBuddy]: [...(prev[currentBuddy] || []), replyMsg]
      }));
    }, 1200);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = {
      sender: 'me' as const,
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setConversations((prev) => ({
      ...prev,
      [activeChatBuddy]: [...(prev[activeChatBuddy] || []), newMsg]
    }));
    setChatInput('');

    // Buddy Auto response
    setTimeout(() => {
      const responses: Record<string, string[]> = {
        'backpacker_sam': [
          'Wow, that sounds awesome! 🏔️ Can’t wait to meet up.',
          'Let’s catch up later, going out for a trek now! 🚶‍♂️',
          'Perfect! Let me know if you need anything from the local guides.'
        ],
        'wanderlust_jenny': [
          'Amazing! Bali has so many hidden gems. 🌴',
          'Are you visiting Ubud soon?',
          'Let’s meet at the beach club! 🍹'
        ],
        'nomad_alex': [
          'Definitely, let’s sync up. 🚀',
          'Sounds good! Let me check my itinerary.',
          'Good choice. Homestays are lovely.'
        ]
      };
      
      const buddyResponses = responses[activeChatBuddy] || ['Nice! Let me know.'];
      const randomResponse = buddyResponses[Math.floor(Math.random() * buddyResponses.length)];

      const replyMsg = {
        sender: 'them' as const,
        text: randomResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setConversations((prev) => ({
        ...prev,
        [activeChatBuddy]: [...(prev[activeChatBuddy] || []), replyMsg]
      }));
    }, 1200);
  };

  // AI Chatbot Handler
  const handleSendAiMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const userText = aiInput.trim();
    const newUserMsg = { sender: 'user' as const, text: userText };
    setAiChatMessages((prev) => [...prev, newUserMsg]);
    setAiInput('');
    setAiTyping(true);

    // AI Responses
    setTimeout(() => {
      let aiText = '';
      const textLower = userText.toLowerCase();

      if (textLower.includes('itinerary') || textLower.includes('plan')) {
        aiText = '🗺️ **Recommended 3-Day Travel Itinerary:**\n\n**Day 1: Cultural Sightseeing**\n- Morning: Historical walk around town.\n- Afternoon: Local marketplace food tour.\n- Evening: Catch a sunset at the mountain terrace.\n\n**Day 2: Wilderness Trail**\n- Morning: Trek towards waterfalls or cliffs.\n- Afternoon: Refresh at a lake picnic.\n- Evening: Fireside dinner under the stars.\n\n**Day 3: Connect & Chill**\n- Morning: Cozy local cafes.\n- Afternoon: Social group tour with local Travora buddies!';
      } else if (textLower.includes('bali') || textLower.includes('ubud')) {
        aiText = '🌴 **Bali Travel Tips:**\n- **Places:** Tegallalang rice fields, Kanto Lampo waterfall, Uluwatu cliff temple.\n- **Buddy Connect:** Connect with @wanderlust_jenny who is active in Ubud right now!\n- **Safety:** Rent a motorbike, but always keep a digital license on your phone.';
      } else if (textLower.includes('manali') || textLower.includes('himachal')) {
        aiText = '🏔️ **Manali Guide:**\n- **Must See:** Jogini Falls, Solang Valley, Hampta trekking camp.\n- **Local Buddy:** @backpacker_sam is climbing nearby peaks and sharing live updates!\n- **Dish:** Siddu with melted ghee is a local warm delight.';
      } else if (textLower.includes('goa')) {
        aiText = '🌊 **Goa Recommendations:**\n- **Beaches:** Palolem (quiet South) or Arambol (creative North).\n- **Stays:** Private villas via @stay_luxury_bali (direct in-app chat).\n- **Vibe:** Sunset drums at Arambol sweet lake is a must!';
      } else {
        aiText = '✈️ That sounds like a wonderful adventure! I recommend connecting with travel buddies like @backpacker_sam or @wanderlust_jenny who have visited similar spots recently. \n\nLet me know if you need specific packing lists, weather forecasts, or hotel recommendations!';
      }

      setAiChatMessages((prev) => [...prev, { sender: 'ai' as const, text: aiText }]);
      setAiTyping(false);
    }, 1200);
  };

  // Like Toggle
  const toggleLike = (id: string) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setPosts((currentPosts) =>
          currentPosts.map((p) => (p.id === id ? { ...p, likesCount: p.likesCount - 1 } : p))
        );
      } else {
        next.add(id);
        setPosts((currentPosts) =>
          currentPosts.map((p) => (p.id === id ? { ...p, likesCount: p.likesCount + 1 } : p))
        );
      }
      return next;
    });
  };

  // Save Toggle
  const toggleSave = (id: string) => {
    setSavedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Inline Comment Adding
  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    
    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [
              ...p.comments,
              { id: `c-${Date.now()}`, username: user?.username || 'travel_buddy', text }
            ]
          };
        }
        return p;
      })
    );
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  // Create custom post handler
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostCaption.trim()) return;

    // Parse hashtags dynamically from the caption, fallback if none found
    const parsedHashtags = newPostCaption.match(/#[a-zA-Z0-9_]+/g) || ['#travora', '#explore', '#wanderlust'];
    
    // Choose the first image in the attached images as the primary thumbnail/image for feed compatibility
    const primaryImage = postImages.length > 0 ? postImages[0] : 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80';

    const newPost = {
      id: `post-${Date.now()}`,
      username: user?.username || 'isabella_nilsson',
      avatar: user?.avatarUrl ? <img src={user.avatarUrl} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : '🌟',
      location: newPostLocation.trim() || 'Travel Heaven 📍',
      image: primaryImage,
      images: postImages.length > 0 ? postImages : [primaryImage],
      title: postTitle.trim(),
      caption: newPostCaption.trim(),
      hashtags: parsedHashtags,
      likesCount: 0,
      comments: [],
      categories: selectedCategories,
      platform: selectedPlatform,
      scheduleDate,
      scheduleTime,
      visibility,
      allowComments
    };

    setPosts((prev) => [newPost, ...prev]);
    
    // Reset states after publishing
    setNewPostCaption('');
    setNewPostLocation('');
    setPostTitle('');
    setTaggedFriends(['@wanderlust.jenny', '@markstravels']);
    setSelectedCategories(['Adventure']);
    setPostImages([
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80'
    ]);
    
    // Redirect to home feed
    setActiveTab('home');
  };

  // Media panel helper functions
  const handleMediaUpload = (files: File[]) => {
    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      const name = file.name;
      const dimensions = '1920x1080';
      const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      const newItem = {
        id: `lib-${Date.now()}-${Math.random()}`,
        url,
        name,
        size: sizeStr,
        dimensions
      };
      setMediaLibrary(prev => [newItem, ...prev]);
      setPostImages(prev => [...prev, url]);
    });
  };

  const toggleMediaSelection = (url: string) => {
    setPostImages(prev => {
      if (prev.includes(url)) {
        return prev.filter(img => img !== url);
      } else {
        return [...prev, url];
      }
    });
  };

  const moveMedia = (index: number, direction: number) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= postImages.length) return;
    setPostImages(prev => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  };

  // Live Preview Helper for double tap like
  const handleDoubleTapPreview = () => {
    setIsPreviewLiked(true);
    setShowHeartOverlay(true);
    setTimeout(() => {
      setShowHeartOverlay(false);
    }, 800);
  };

  // Live Preview Helper for click-to-slide
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (postImages.length <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    if (clickX < width * 0.4) {
      setPreviewCarouselIndex(prev => (prev === 0 ? postImages.length - 1 : prev - 1));
    } else {
      setPreviewCarouselIndex(prev => (prev === postImages.length - 1 ? 0 : prev + 1));
    }
  };

  // --- PROFILE DASHBOARD REDESIGN STATES ---
  const [profileTab, setProfileTab] = useState<'posts' | 'saved' | 'milestones' | 'settings'>('posts');
  const [selectedHighlight, setSelectedHighlight] = useState<string | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editBio, setEditBio] = useState('Exploring the globe one country at a time | Mountain climber & Coffee lover | Vlogging my journeys.');
  const [editWebsite, setEditWebsite] = useState('travora.com/shashank');

  // Sync user details to edit inputs when user is loaded
  useEffect(() => {
    if (user) {
      setEditFullName(user.fullName || '');
      setEditUsername(user.username || '');
      setEditEmail(user.email || '');
    }
  }, [user]);

  // Mock User Posts dataset (Polaroid travel postcards)
  const [userPosts, setUserPosts] = useState([
    {
      id: 'up-1',
      title: 'Sunrise over Ubud rice terraces',
      location: 'Ubud, Bali',
      img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop&q=80',
      likes: 412,
      comments: 32,
      category: 'Tropical'
    },
    {
      id: 'up-2',
      title: 'Solo bike ride through the mountain pass',
      location: 'Khardung La, Ladakh',
      img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&auto=format&fit=crop&q=80',
      likes: 624,
      comments: 48,
      category: 'Mountains'
    },
    {
      id: 'up-3',
      title: 'Golden sunset at Fushimi Inari',
      location: 'Kyoto, Japan',
      img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop&q=80',
      likes: 589,
      comments: 41,
      category: 'Cultural'
    },
    {
      id: 'up-4',
      title: 'Eiffel Tower from the streets of Paris',
      location: 'Paris, France',
      img: 'https://images.unsplash.com/photo-1483168527879-c66136b56105?w=600&auto=format&fit=crop&q=80',
      likes: 832,
      comments: 72,
      category: 'Cities'
    },
    {
      id: 'up-5',
      title: 'Camping under a blanket of stars',
      location: 'Nubra Valley, India',
      img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80',
      likes: 914,
      comments: 89,
      category: 'Mountains'
    },
    {
      id: 'up-6',
      title: 'Hidden cave pool swimming',
      location: 'Seminyak, Goa',
      img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
      likes: 351,
      comments: 18,
      category: 'Beaches'
    }
  ]);

  // Mock Highlights / Stories data (no emojis)
  const highlights = [
    {
      id: 'hl-1',
      title: 'Bali',
      cover: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=150&auto=format&fit=crop&q=80',
      stories: [
        { img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80', caption: 'Rice fields in Ubud' },
        { img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', caption: 'Sunset surfing in Uluwatu' }
      ]
    },
    {
      id: 'hl-2',
      title: 'Leh',
      cover: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=150&auto=format&fit=crop&q=80',
      stories: [
        { img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80', caption: 'Breathtaking Ladakh mountains' },
        { img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', caption: 'Stargazing at Nubra Valley' }
      ]
    },
    {
      id: 'hl-3',
      title: 'Kyoto',
      cover: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=150&auto=format&fit=crop&q=80',
      stories: [
        { img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80', caption: 'Kyoto bamboo trees' },
        { img: 'https://images.unsplash.com/photo-1483168527879-c66136b56105?w=800&q=80', caption: 'Cherry blossoms peak season' }
      ]
    },
    {
      id: 'hl-4',
      title: 'Paris',
      cover: 'https://images.unsplash.com/photo-1483168527879-c66136b56105?w=150&auto=format&fit=crop&q=80',
      stories: [
        { img: 'https://images.unsplash.com/photo-1483168527879-c66136b56105?w=800&q=80', caption: 'Morning walks in Montmartre' }
      ]
    }
  ];

  // Mock Travel Milestones (no emojis)
  const [milestones, setMilestones] = useState([
    { id: 'ms-1', title: 'First Flight', desc: 'Booked and took first flight to a new destination.', unlocked: true, date: 'March 14, 2025', points: 100, badgeColor: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
    { id: 'ms-2', title: 'Mountain Conqueror', desc: 'Ascended above 4,000m altitude in Leh pass.', unlocked: true, date: 'May 20, 2025', points: 250, badgeColor: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' },
    { id: 'ms-3', title: 'Tropical Nomad', desc: 'Vlogged live in Ubud cafes and beach settings.', unlocked: true, date: 'June 02, 2025', points: 200, badgeColor: 'linear-gradient(135deg, #10b981 0%, #047857 100%)' },
    { id: 'ms-4', title: 'Globetrotter Pro', desc: 'Visit 5 or more countries around the world.', unlocked: false, progress: '3/5', points: 500, badgeColor: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)' },
    { id: 'ms-5', title: 'Storyteller Master', desc: 'Uploaded 5 or more vlogs or posts to Travora.', unlocked: true, date: 'June 28, 2026', points: 300, badgeColor: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)' },
    { id: 'ms-6', title: 'SQLite Maestro', desc: 'Verified database connections and synchronized schema.', unlocked: true, date: 'July 01, 2026', points: 400, badgeColor: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' }
  ]);

  // Current slide index for highlight stories popup viewer
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);

  // Forgot Password Modal States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // Password Validation
  const checkPassword = (val: string) => {
    return {
      length: val.length >= 8,
      uppercase: /[A-Z]/.test(val),
      lowercase: /[a-z]/.test(val),
      number: /[0-9]/.test(val),
      special: /[^A-Za-z0-9]/.test(val)
    };
  };
  const PasswordChecklist = ({ pwd }: { pwd: string }) => {
    if (!pwd) return null;
    const checks = checkPassword(pwd);
    if (Object.values(checks).every(Boolean)) return null;

    return (
      <ul style={{ fontSize: '11px', color: 'var(--accent-red)', marginTop: '8px', paddingLeft: '16px', lineHeight: '1.6', fontWeight: 500 }}>
        {!checks.length && <li>At least 8 characters</li>}
        {!checks.uppercase && <li>One uppercase letter</li>}
        {!checks.lowercase && <li>One lowercase letter</li>}
        {!checks.number && <li>One number</li>}
        {!checks.special && <li>One special character</li>}
      </ul>
    );
  };

  useEffect(() => {
    if (!loading) {
      const delayTimeout = setTimeout(() => {
        setFadeClass('fade-out');
        const removalTimeout = setTimeout(() => {
          setShowSplash(false);
          setContentVisible(true);
        }, 800);
        return () => clearTimeout(removalTimeout);
      }, 1000);
      return () => clearTimeout(delayTimeout);
    }
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      if (formMode === 'login') {
        const result = await login(identifier, password);
        if (result.success) {
          setSuccessMsg('Logged in successfully!');
          setIdentifier('');
          setPassword('');
        } else {
          setErrorMsg(result.error || 'Invalid credentials');
        }
      } else {
        // Sign Up Flow
        if (!Object.values(checkPassword(password)).every(Boolean)) {
          setErrorMsg('Please fix the errors before submitting.');
          setSubmitting(false);
          return;
        }

        const signupData: any = {
          role: userRole,
          username,
          email,
          phone,
          password,
          fullName,
        };

        if (userRole === 'traveller') {
          signupData.travellerType = isVlogger ? 'vlogger' : 'normal';
        } else {
          signupData.businessProfile = {
            businessType,
            businessName,
            registrationNumber,
            phone,
            address,
            websiteUrl: websiteUrl || undefined,
            bookingModel: bookingModel
          };
        }

        const result = await signup(signupData);
        if (result.success) {
          setSuccessMsg('Account created successfully!');
          setUsername('');
          setEmail('');
          setPassword('');
          setFullName('');
          setPhone('');
          setBusinessName('');
          setRegistrationNumber('');
          setAddress('');
          setWebsiteUrl('');
        } else {
          setErrorMsg(result.error || 'Signup failed');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Traveller Type directly on Dashboard
  const handleDashboardToggleVlogger = async (checked: boolean) => {
    const targetType = checked ? 'vlogger' : 'normal';
    const result = await updateTravellerType(targetType);
    if (!result.success) {
      alert(result.error || 'Failed to switch profile type');
    }
  };

  // Helper arrays for Birthday drop downs
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1));
  const years = Array.from({ length: 80 }, (_, i) => String(2026 - i));

  // Forgot Password Handlers
  const handleForgotStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(''); setForgotSuccess(''); setForgotLoading(true);
    const res = await forgotPassword(forgotIdentifier);
    setForgotLoading(false);
    if (res.success) {
      setForgotStep(2);
      alert('Simulated OTP sent to your email/phone: ' + res.simulatedOtp);
    } else {
      setForgotError(res.error || 'Failed to send OTP');
    }
  };

  const handleForgotStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(''); setForgotSuccess(''); setForgotLoading(true);
    const res = await verifyOtp(forgotIdentifier, forgotOtp);
    setForgotLoading(false);
    if (res.success) {
      setForgotStep(3);
    } else {
      setForgotError(res.error || 'Invalid OTP');
    }
  };

  const handleForgotStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Passwords do not match');
      return;
    }
    if (!Object.values(checkPassword(forgotNewPassword)).every(Boolean)) {
      setForgotError('Please fix the password errors before submitting.');
      return;
    }
    setForgotError(''); setForgotSuccess(''); setForgotLoading(true);
    const res = await resetPassword(forgotIdentifier, forgotOtp, forgotNewPassword);
    setForgotLoading(false);
    if (res.success) {
      setForgotSuccess('Password reset successfully!');
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotStep(1);
        setForgotIdentifier(''); setForgotOtp(''); setForgotNewPassword(''); setForgotConfirmPassword('');
      }, 2000);
    } else {
      setForgotError(res.error || 'Failed to reset password');
    }
  };

  if (user) {
    const activeImageStories = stories.filter(s => s.image);

    const isSidebarCollapsed = activeTab === 'messages' || showSearchDrawer || showNotificationsDrawer;
    return (
      <>
        {showSplash && (
          <div className={`splash-container ${fadeClass}`}>
            <div className="splash-logo-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Logo theme={theme} width={130} showText={true} />
              <div className="splash-progress-bar">
                <div className="splash-progress-line" />
              </div>
            </div>
          </div>
        )}
        <div className={`instagram-app-layout ${(showSearchDrawer || showNotificationsDrawer) ? 'drawer-open' : ''}`}>
        <div className="bg-glow-container">
          <div className="bg-blob bg-blob-1" />
          <div className="bg-blob bg-blob-2" />
          <div className="bg-blob bg-blob-3" />
          
          {/* Cursor-reactive ambient background glow */}
          <div 
            className="global-cursor-reactive-glow"
            style={{
              left: `${globalMousePos.x}px`,
              top: `${globalMousePos.y}px`
            }}
          />
        </div>
        
        {/* MOBILE ONLY: Top Header Bar */}
        <header className="mobile-header">
          <span className="social-top-nav-title" style={{ fontSize: '20px', background: 'linear-gradient(135deg, #0284c7 0%, #f97316 50%, #ef4444 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Travora</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              className="social-nav-icon-btn" 
              onClick={() => {
                setShowNotificationsDrawer(!showNotificationsDrawer);
                setShowSearchDrawer(false);
              }}
              aria-label="Notifications"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>
        </header>

        {/* DESKTOP ONLY: Left Navigation Sidebar Wrapper and Sidebar */}
        <div className="instagram-sidebar-wrapper">
          <aside className="instagram-sidebar">
            
            {/* Logo */}
            <div className="instagram-sidebar-logo-container">
              <span className="instagram-sidebar-logo-icon">
                <Logo theme={theme} width={24} showText={false} />
              </span>
              <span className="instagram-sidebar-logo-text">Travora</span>
            </div>

            {/* Navigation Menu */}
            <nav className="instagram-sidebar-menu">
              
              {/* Home */}
              <button 
                className={`instagram-sidebar-item ${activeTab === 'home' && !showSearchDrawer && !showNotificationsDrawer ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('home');
                  setShowSearchDrawer(false);
                  setShowNotificationsDrawer(false);
                  setShowMoreMenu(false);
                }}
              >
                <span className="instagram-sidebar-item-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={activeTab === 'home' && !showSearchDrawer && !showNotificationsDrawer ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" fill={activeTab === 'home' && !showSearchDrawer && !showNotificationsDrawer ? 'var(--right-pane-bg)' : 'none'} />
                  </svg>
                </span>
                <span className="instagram-sidebar-item-label">Home</span>
              </button>

              {/* Search */}
              <button 
                className={`instagram-sidebar-item ${(activeTab === 'search' && !showNotificationsDrawer) || showSearchDrawer ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('search');
                  setShowSearchDrawer(false);
                  setShowNotificationsDrawer(false);
                  setShowMoreMenu(false);
                }}
              >
                <span className="instagram-sidebar-item-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <span className="instagram-sidebar-item-label">Search</span>
              </button>

              {/* Reels */}
              <button 
                className={`instagram-sidebar-item ${activeTab === 'reels' && !showSearchDrawer && !showNotificationsDrawer ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('reels');
                  setShowSearchDrawer(false);
                  setShowNotificationsDrawer(false);
                  setShowMoreMenu(false);
                }}
              >
                <span className="instagram-sidebar-item-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="6" />
                    <circle cx="12" cy="12" r="6" />
                    <polygon points="10.5 9, 10.5 15, 15.5 12" fill={activeTab === 'reels' ? 'currentColor' : 'none'} />
                  </svg>
                </span>
                <span className="instagram-sidebar-item-label">Reels</span>
              </button>

              {/* Messages */}
              <button 
                className={`instagram-sidebar-item ${activeTab === 'messages' && !showSearchDrawer && !showNotificationsDrawer ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('messages');
                  setShowSearchDrawer(false);
                  setShowNotificationsDrawer(false);
                  setShowMoreMenu(false);
                }}
              >
                <span className="instagram-sidebar-item-icon" style={{ position: 'relative' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </span>
                <span className="instagram-sidebar-item-label">Messages</span>
              </button>

              {/* Notifications */}
              <button 
                className={`instagram-sidebar-item ${showNotificationsDrawer ? 'active' : ''}`}
                onClick={() => {
                  setShowNotificationsDrawer(!showNotificationsDrawer);
                  setShowSearchDrawer(false);
                  setShowMoreMenu(false);
                }}
              >
                <span className="instagram-sidebar-item-icon" style={{ position: 'relative' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={showNotificationsDrawer ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  {unreadNotifications > 0 && (
                    <span className="instagram-sidebar-badge">{unreadNotifications}</span>
                  )}
                </span>
                <span className="instagram-sidebar-item-label">Notifications</span>
              </button>

              {/* Create */}
              <button 
                className={`instagram-sidebar-item ${activeTab === 'create' && !showSearchDrawer && !showNotificationsDrawer ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('create');
                  setShowSearchDrawer(false);
                  setShowNotificationsDrawer(false);
                  setShowMoreMenu(false);
                }}
              >
                <span className="instagram-sidebar-item-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </span>
                <span className="instagram-sidebar-item-label">Create</span>
              </button>

              {/* Profile */}
              <button 
                className={`instagram-sidebar-item ${activeTab === 'profile' && !showSearchDrawer && !showNotificationsDrawer ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('profile');
                  setShowSearchDrawer(false);
                  setShowNotificationsDrawer(false);
                  setShowMoreMenu(false);
                }}
              >
                <span className="instagram-sidebar-item-icon">
                  <img 
                    src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.fullName)}`} 
                    alt="Profile" 
                    style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', border: activeTab === 'profile' && !showSearchDrawer && !showNotificationsDrawer ? '2px solid var(--text-primary)' : '1px solid var(--card-border)' }} 
                  />
                </span>
                <span className="instagram-sidebar-item-label">Profile</span>
              </button>

            </nav>

            {/* Footer menu */}
            <div className="instagram-sidebar-footer" style={{ position: 'relative' }}>
              
               {/* More Menu Dropdown */}
              {showMoreMenu && (
                <div className="instagram-more-menu-dropdown">
                  <button className="instagram-more-menu-item" onClick={() => { setActiveTab('profile'); setShowMoreMenu(false); }}>
                    <span>⚙️</span> Settings
                  </button>
                  <button className="instagram-more-menu-item" onClick={() => { setAiChatOpen(true); setShowMoreMenu(false); }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px' }}>
                      <img src="/ai-guide.png" alt="AI" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: theme === 'dark' ? 'invert(1)' : 'none' }} />
                    </span>
                    AI Travel Assistant
                  </button>
                  <button className="instagram-more-menu-item" onClick={() => { toggleTheme(); setShowMoreMenu(false); }}>
                    <span>{theme === 'light' ? '🌙' : '☀️'}</span> Switch Appearance
                  </button>
                  <div style={{ height: '1px', background: 'var(--card-border)', margin: '4px 0' }} />
                  <button className="instagram-more-menu-item" style={{ color: '#ef4444' }} onClick={() => { logout(); setShowMoreMenu(false); }}>
                    <span>🚪</span> Log Out
                  </button>
                </div>
              )}

              {/* More Button */}
              <button 
                className={`instagram-sidebar-item ${showMoreMenu ? 'active' : ''}`}
                onClick={() => setShowMoreMenu(!showMoreMenu)}
              >
                <span className="instagram-sidebar-item-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                </span>
                <span className="instagram-sidebar-item-label">More</span>
              </button>

            </div>

          </aside>
        </div>

        {/* --- DYNAMIC SLIDE-OUT DRAWERS PANEL --- */}
        
        {/* Search Drawer */}
        {showSearchDrawer && (
          <div className="instagram-drawer">
            <div className="instagram-drawer-header">
              <h2 className="instagram-drawer-title">Search</h2>
              <div className="search-input-wrapper">
                <span style={{ marginRight: '8px', color: 'var(--text-muted)' }}>🔍</span>
                <input 
                  type="text" 
                  className="comment-input" 
                  style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px' }}
                  placeholder="Search destinations, buddies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="instagram-drawer-content">
              <h3 className="drawer-search-section-title">Places</h3>
              <div className="drawer-search-results">
                {travelDestinations
                  .filter(dest => dest.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((dest, idx) => (
                    <div 
                      key={idx} 
                      className="drawer-search-item"
                      onClick={() => {
                        setSearchQuery(dest.name.split(',')[0]);
                        setActiveTab('search');
                        setShowSearchDrawer(false);
                      }}
                    >
                      <img src={dest.img} alt={dest.name} className="drawer-search-item-img" />
                      <div className="drawer-search-item-info">
                        <span className="drawer-search-item-name">{dest.name}</span>
                        <span className="drawer-search-item-count">{dest.count}</span>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}

        {/* Notifications Drawer */}
        {showNotificationsDrawer && (
          <div className="instagram-drawer">
            <div className="instagram-drawer-header">
              <h2 className="instagram-drawer-title">Notifications</h2>
              
              <div className="notification-filters">
                <button 
                  className={`notification-filter-btn ${notificationFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setNotificationFilter('all')}
                >
                  All
                </button>
                <button 
                  className={`notification-filter-btn ${notificationFilter === 'following' ? 'active' : ''}`}
                  onClick={() => setNotificationFilter('following')}
                >
                  People you follow
                </button>
                <button 
                  className={`notification-filter-btn ${notificationFilter === 'comments' ? 'active' : ''}`}
                  onClick={() => setNotificationFilter('comments')}
                >
                  Comments
                </button>
                <button 
                  className={`notification-filter-btn ${notificationFilter === 'follows' ? 'active' : ''}`}
                  onClick={() => setNotificationFilter('follows')}
                >
                  Follows
                </button>
              </div>

            </div>
            
            <div className="instagram-drawer-content" style={{ padding: '0 24px' }}>
              
              <div className="drawer-notification-section-title">Follow requests</div>
              <div className="follow-requests-card" onClick={() => alert('Opening follow requests...')}>
                <div className="follow-requests-icon-wrapper">
                  <span className="follow-requests-icon">👥</span>
                </div>
                <div className="follow-requests-info">
                  <span className="follow-requests-title">Follow requests</span>
                  <span className="follow-requests-subtitle">test_explorer + 10 others</span>
                </div>
                <div className="follow-requests-indicator">
                  <span className="follow-requests-dot"></span>
                </div>
              </div>

              <div className="drawer-notification-section-title">This week</div>
              
              {notifications
                .filter(n => {
                  if (notificationFilter === 'comments') return n.type === 'comment';
                  if (notificationFilter === 'follows') return n.type === 'follow';
                  if (notificationFilter === 'following') return n.type === 'like' || n.type === 'comment';
                  return true;
                })
                .map((n) => (
                  <div key={n.id} className="drawer-notification-item">
                    <div className="drawer-notification-avatar-wrapper">
                      <span className="drawer-notification-avatar">{n.avatar}</span>
                    </div>
                    <div className="drawer-notification-content">
                      <p className="drawer-notification-text">
                        <span className="drawer-notification-username">{n.username}</span>
                        {n.text}
                      </p>
                      <span className="drawer-notification-time">{n.time}</span>
                    </div>
                    {n.type === 'follow' && (
                      <div className="drawer-notification-buttons">
                        <button className="notification-btn-confirm" onClick={() => alert('Confirmed follow!')}>Confirm</button>
                        <button className="notification-btn-delete" onClick={() => alert('Request deleted.')}>Delete</button>
                      </div>
                    )}
                  </div>
                ))
              }
              
            </div>
          </div>
        )}

        {/* --- MAIN DISPLAY WORKSPACE --- */}
        <div className="instagram-main-area" onClick={() => {
          // Close drawers if you click main area
          setShowSearchDrawer(false);
          setShowNotificationsDrawer(false);
        }}>
          
          {/* Smooth page shift container */}
          <div key={activeTab} className="page-transition-container">
            
            {/* VIEW 1: HOME FEED */}
            {activeTab === 'home' && (
              <div className="instagram-feed-layout">
                
                {/* Center feed column */}
                <div className="instagram-feed-posts-column">
                  
                  {/* Stories Card Container */}
                  <div className="stories-card-container">
                    <div className="stories-scroll-row">
                      {stories.map((story) => (
                        <div 
                          key={story.id} 
                          className="story-wrapper"
                          onMouseEnter={() => setHoveredStoryId(story.id)}
                          onMouseLeave={() => setHoveredStoryId(null)}
                          onClick={() => {
                            if (story.id === 'story-1') {
                              setActiveTab('create');
                            } else {
                              const imgStoriesIdx = activeImageStories.findIndex(s => s.id === story.id);
                              if (imgStoriesIdx !== -1) {
                                setActiveStoryIndex(imgStoriesIdx);
                                setShowStoryViewer(true);
                              }
                            }
                          }}
                        >
                          <div className={`story-ring ${story.viewed ? 'viewed' : ''} ${story.id === 'story-1' ? 'user-story-ring' : ''} ${story.isLive ? 'live-story' : ''}`}>
                            <div className="story-avatar">
                              {story.avatar.startsWith('http') ? (
                                <img src={story.avatar} alt={story.username} className="story-avatar-img" />
                              ) : (
                                story.avatar
                              )}
                            </div>
                            {story.id === 'story-1' && <div className="user-add-story-badge">+</div>}
                            {story.isLive && <span className="story-live-badge-glow">LIVE</span>}
                            {hoveredStoryId === story.id && (
                              <svg className="story-progress-arc-overlay" viewBox="0 0 70 70">
                                <circle cx="35" cy="35" r="32" className="story-progress-circle-path" />
                              </svg>
                            )}
                          </div>
                          <span className="story-username">{story.username}</span>
                          
                          {/* Floating story thumbnail preview */}
                          {hoveredStoryId === story.id && story.image && (
                            <div className="story-hover-preview-card discover-premium-card animate-slide-up">
                              <img src={story.image} alt="preview" className="story-hover-preview-img" />
                              <div className="story-hover-preview-meta">
                                <span className="story-hover-preview-text">{story.caption.slice(0, 48)}...</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Posts feed with Skeleton/Shimmer loaders support */}
                  {isLoadingFeed ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {[1, 2].map((i) => (
                        <div key={i} className="post-card skeleton-card">
                          <div className="post-card-header" style={{ padding: '12px 16px', display: 'flex', gap: '12px' }}>
                            <div className="skeleton-avatar skeleton-shimmer" style={{ width: '38px', height: '38px', borderRadius: '50%' }} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, justifyContent: 'center' }}>
                              <div className="skeleton-line skeleton-shimmer" style={{ width: '40%', height: '10px', borderRadius: '4px' }} />
                              <div className="skeleton-line skeleton-shimmer" style={{ width: '25%', height: '8px', borderRadius: '4px' }} />
                            </div>
                          </div>
                          <div className="skeleton-media skeleton-shimmer" style={{ height: '380px', margin: '0 16px', borderRadius: '16px' }} />
                          <div className="post-card-actions" style={{ padding: '16px' }}>
                            <div className="skeleton-line skeleton-shimmer" style={{ width: '30%', height: '14px', borderRadius: '4px' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {posts.slice(0, visiblePostsCount).map((post, postIdx) => {
                        const isLiked = likedPosts.has(post.id);
                        const isSaved = savedPosts.has(post.id);
                        const commentsOpen = expandedComments[post.id];

                        return (
                          <article 
                            key={post.id} 
                            className="post-card fade-slide-up"
                            style={{ animationDelay: `${postIdx * 0.15}s` }}
                          >
                            
                            {/* Post Header */}
                            <div className="post-card-header">
                              <div className="post-card-user-info">
                                <div className="post-card-avatar">
                                  {post.avatar.startsWith('http') ? (
                                    <img src={post.avatar} alt={post.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                  ) : (
                                    post.avatar
                                  )}
                                </div>
                                <div>
                                  <span className="post-card-username">{post.username}</span>
                                  <span className="post-card-location" onClick={() => setActiveMapPostId(prev => prev === post.id ? null : post.id)}>
                                    📍 {post.location}
                                  </span>
                                </div>
                              </div>
                              <button className="post-action-btn spring-active" style={{ color: 'var(--text-muted)' }}>•••</button>
                            </div>

                            {/* Tappable Inline Map Preview Card */}
                            {activeMapPostId === post.id && (
                              <div className="post-inline-map-card discover-premium-card animate-slide-up">
                                <div className="map-card-header">
                                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2.5"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
                                    Map Explorer: {post.location}
                                  </span>
                                  <button onClick={() => setActiveMapPostId(null)} className="map-close-btn">&times;</button>
                                </div>
                                <div className="map-card-body">
                                  <div className="radar-grid-bg"></div>
                                  <div className="radar-ping"></div>
                                  <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <span style={{ fontSize: '28px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}>📍</span>
                                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#ffffff', background: 'rgba(0,0,0,0.7)', padding: '2px 8px', borderRadius: '12px', marginTop: '4px' }}>
                                      {post.location}
                                    </span>
                                  </div>
                                  <div style={{ position: 'absolute', bottom: '8px', right: '8px', zIndex: 2, fontSize: '10px', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '4px' }}>
                                    GPS Active
                                  </div>
                                </div>
                                <div className="map-card-footer">
                                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Coordinates: 8.4095° S, 115.1889° E</span>
                                  <button className="map-directions-btn" onClick={() => { showToast(`Opening Google Maps for ${post.location}...`); }}>
                                    Get Directions
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Post Media Carousel with double-tap heart burst overlay */}
                            <div 
                              className="post-card-media-container" 
                              onDoubleClick={() => {
                                setActiveDoubleTapPostId(post.id);
                                if (!isLiked) {
                                  toggleLike(post.id);
                                  showToast(`Liked @${post.username}'s post`);
                                }
                                setTimeout(() => {
                                  setActiveDoubleTapPostId(null);
                                }, 800);
                              }}
                              style={{ position: 'relative', overflow: 'hidden' }}
                            >
                              <div 
                                className="post-carousel-track" 
                                style={{ 
                                  display: 'flex', 
                                  transition: 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)', 
                                  transform: `translateX(-${(postCarouselIndices[post.id] || 0) * 100}%)`,
                                  height: '100%'
                                }}
                              >
                                {(post.images || [post.image]).map((imgUrl, imgIdx) => {
                                  const isImgLoaded = loadedFeedImages[`${post.id}-${imgIdx}`];
                                  return (
                                    <div key={imgIdx} style={{ minWidth: '100%', position: 'relative' }}>
                                      {!isImgLoaded && (
                                        <div className="skeleton-loader-shimmer" style={{ position: 'absolute', inset: 0 }} />
                                      )}
                                      <img 
                                        src={imgUrl} 
                                        alt={`post-${imgIdx}`} 
                                        className={`post-card-img ${isImgLoaded ? 'sharpen' : 'blur-placeholder'}`} 
                                        onLoad={() => setLoadedFeedImages(prev => ({ ...prev, [`${post.id}-${imgIdx}`]: true }))}
                                        style={{ 
                                          width: '100%', 
                                          height: '100%', 
                                          objectFit: 'cover',
                                          filter: isImgLoaded ? 'none' : 'blur(15px)',
                                          transition: 'filter 0.4s ease'
                                        }}
                                      />
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Heart burst scale-in overlay */}
                              {activeDoubleTapPostId === post.id && (
                                <div className="double-tap-heart-burst">
                                  <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                  </svg>
                                </div>
                              )}

                              {/* Dot Indicators */}
                              {post.images && post.images.length > 1 && (
                                <>
                                  <button 
                                    className="carousel-nav-btn prev"
                                    onClick={(e) => { e.stopPropagation(); handleFeedCarouselLeft(post.id, post.images.length); }}
                                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                                  >
                                    ‹
                                  </button>
                                  <button 
                                    className="carousel-nav-btn next"
                                    onClick={(e) => { e.stopPropagation(); handleFeedCarouselRight(post.id, post.images.length); }}
                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}
                                  >
                                    ›
                                  </button>
                                  
                                  <div className="feed-carousel-indicators">
                                    {post.images.map((_, dotIdx) => (
                                      <span 
                                        key={dotIdx} 
                                        className={`feed-carousel-dot ${(postCarouselIndices[post.id] || 0) === dotIdx ? 'active' : ''}`}
                                      />
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Post Actions */}
                            <div className="post-card-actions">
                              <div className="post-card-left-actions">
                                <button className={`post-action-btn-with-count spring-active ${isLiked ? 'liked' : ''}`} onClick={() => {
                                  toggleLike(post.id);
                                  if (!isLiked) {
                                    showToast(`Liked @${post.username}'s post`);
                                  }
                                }}>
                                  <svg width="22" height="22" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                  </svg>
                                  <span className="post-action-count animated-count">{formatCount(post.likesCount)}</span>
                                </button>
                                
                                <button className="post-action-btn-with-count spring-active" onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !commentsOpen }))}>
                                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                                  </svg>
                                  <span className="post-action-count">{post.comments.length}</span>
                                </button>

                                <button className="post-action-btn-with-count spring-active" onClick={() => showToast(`Link copied for @${post.username}'s post!`)}>
                                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="22" y1="2" x2="11" y2="13" />
                                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                  </svg>
                                </button>
                              </div>
                              <button className={`post-action-btn spring-active ${isSaved ? 'saved' : ''}`} onClick={() => {
                                toggleSave(post.id);
                                showToast(isSaved ? "Removed from saved posts" : "Saved post to bookmarks");
                              }}>
                                <svg width="22" height="22" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                              </button>
                            </div>

                            {/* Caption */}
                            <div className="post-card-caption-section" style={{ padding: 0, marginTop: '4px' }}>
                              <span className="post-card-caption-username">{post.username}</span>
                              <span>{post.caption}</span>
                              <div style={{ marginTop: '4px' }}>
                                {post.hashtags.map((tag, tIdx) => (
                                  <span key={tIdx} className="post-card-caption-hashtags" style={{ marginRight: '6px' }}>{tag}</span>
                                ))}
                              </div>
                            </div>

                            {/* Comment trigger */}
                            <button 
                              className="post-card-comments-toggle" 
                              style={{ padding: 0, margin: '8px 0 0 0' }}
                              onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !commentsOpen }))}
                            >
                              {commentsOpen ? 'Hide comments' : `View all ${post.comments.length} comments`}
                            </button>

                            {commentsOpen && (
                              <div className="post-card-comments-drawer" style={{ background: 'var(--input-bg)', padding: '12px', borderRadius: '8px', marginTop: '10px' }}>
                                <div className="post-card-comments-list" style={{ maxHeight: '150px' }}>
                                  {post.comments.map((c) => (
                                    <div key={c.id} className="comment-item">
                                      <span className="comment-username">{c.username}</span>
                                      <span>{c.text}</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="comment-input-container" style={{ marginTop: '10px' }}>
                                  <input 
                                    type="text" 
                                    className="comment-input" 
                                    placeholder="Add a comment..."
                                    value={commentInputs[post.id] || ''}
                                    onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(post.id); }}
                                  />
                                  <button className="comment-submit-btn spring-active" onClick={() => handleAddComment(post.id)}>Post</button>
                                </div>
                              </div>
                            )}

                          </article>
                        );
                      })}

                      {/* Infinite Scroll Trigger Indicator */}
                      <div className="feed-infinite-scroll-trigger">
                        {isLoadingMore ? (
                          <div className="infinite-scroll-loader-spinner">
                            <div className="accent-loader-circle"></div>
                            <span>Fetching more travel stories...</span>
                          </div>
                        ) : visiblePostsCount < posts.length ? (
                          <button 
                            className="load-more-feed-btn spring-active"
                            onClick={() => {
                              setIsLoadingMore(true);
                              setTimeout(() => {
                                setVisiblePostsCount(prev => prev + 1);
                                setIsLoadingMore(false);
                                showToast("New travel posts loaded successfully!");
                              }, 1000);
                            }}
                          >
                            Load More Stories
                          </button>
                        ) : (
                          <span className="feed-end-message">✨ You've caught up with all travel updates!</span>
                        )}
                      </div>
                    </div>
                  )}

                </div>

                {/* Right side Suggestions Column */}
                <div className="instagram-feed-right-column">
                  
                  {/* Current User Card */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px', position: 'relative' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 800 }}>
                      {user.fullName.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '13px' }}>{user.username}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.fullName}</div>
                    </div>
                    
                    <div style={{ position: 'relative' }}>
                      <button 
                        className="suggested-profile-switch-btn spring-active" 
                        onClick={() => setShowSwitchDropdown(!showSwitchDropdown)}
                      >
                        Switch
                      </button>

                      {showSwitchDropdown && (
                        <div className="switch-accounts-dropdown discover-premium-card animate-slide-up" style={{ right: 0, top: '24px', zIndex: 120 }}>
                          <div className="switch-dropdown-header">
                            <span>Switch Accounts</span>
                            <button className="switch-close-btn" onClick={() => setShowSwitchDropdown(false)}>&times;</button>
                          </div>
                          <div className="switch-accounts-list">
                            <div className="switch-account-item active" onClick={() => { showToast("Already logged in as Suvarnatest"); setShowSwitchDropdown(false); }}>
                              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, marginRight: '8px' }}>S</div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '12px', fontWeight: 600 }}>@Suvarnatest</div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Shashank (Active)</div>
                              </div>
                              <span style={{ color: 'var(--accent-blue)', fontSize: '12px' }}>✓</span>
                            </div>
                            <div className="switch-account-item" onClick={() => { showToast("Switched to @traveler_shashank"); setShowSwitchDropdown(false); }}>
                              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80" style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', marginRight: '8px' }} />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '12px', fontWeight: 600 }}>@traveler_shashank</div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Siddhartha Chathra</div>
                              </div>
                            </div>
                            <div className="switch-account-item" onClick={() => { showToast("Switched to @sid_vlogs"); setShowSwitchDropdown(false); }}>
                              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', marginRight: '8px' }} />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '12px', fontWeight: 600 }}>@sid_vlogs</div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Siddhartha Vlogs</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Suggestions Header */}
                  <div className="instagram-suggested-header">
                    <span>Suggested for you</span>
                    <button style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer' }} onClick={() => showToast('Displaying travel creators near Ubud...')}>See all</button>
                  </div>

                  {/* Suggested list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { username: 'wanderlust_jenny', relation: 'Suggested for you', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', active: true },
                      { username: 'backpacker_sam', relation: 'Followed by nomad_vlogs + 2 others', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', active: false },
                      { username: 'stay_luxury_bali', relation: 'Suggested Stay partner', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', active: true }
                    ].map((sUser) => {
                      const isFld = followedUsers.has(sUser.username);
                      return (
                        <div key={sUser.username} className="instagram-suggested-user-row">
                          <div style={{ position: 'relative', width: '32px', height: '32px' }}>
                            <img src={sUser.avatar} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            {sUser.active && (
                              <span className="suggested-presence-indicator"></span>
                            )}
                          </div>
                          <div className="instagram-suggested-user-info">
                            <span className="instagram-suggested-username">{sUser.username}</span>
                            <span className="instagram-suggested-relationship">{sUser.relation}</span>
                          </div>
                          <button 
                            className={`follow-btn spring-active ${isFld ? 'following' : ''}`}
                            onClick={() => {
                              setFollowedUsers(prev => {
                                const next = new Set(prev);
                                if (next.has(sUser.username)) {
                                  next.delete(sUser.username);
                                  showToast(`Unfollowed @${sUser.username}`);
                                } else {
                                  next.add(sUser.username);
                                  showToast(`Started following @${sUser.username}`);
                                }
                                return next;
                              });
                            }}
                          >
                            {isFld ? '✓ Following' : 'Follow'}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Vlogs Scrollable Feed Section */}
                  <div className="vlogs-section-header">
                    <span className="vlogs-section-title">Explore Travel Vlogs</span>
                    <span className="vlogs-section-badge-pulsing">LIVE FEED</span>
                  </div>

                  <div className="vlogs-scroll-container">
                    {vlogs.map((vlog) => (
                      <div 
                        key={vlog.id} 
                        className="vlog-feed-card spring-active"
                        onMouseEnter={() => setHoveredVlogId(vlog.id)}
                        onMouseLeave={() => setHoveredVlogId(null)}
                      >
                        {/* Vlog Header */}
                        <div className="vlog-card-header">
                          <div className="vlog-user-info">
                            <span className="vlog-avatar">
                              <img src={vlog.avatar} alt={vlog.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            </span>
                            <div className="vlog-user-details">
                              <span className="vlog-username">{vlog.username}</span>
                              <span className="vlog-location">📍 {vlog.location}</span>
                            </div>
                          </div>
                          <span className="vlog-duration-badge">{vlog.duration}</span>
                        </div>

                        {/* Vlog Thumbnail Media */}
                        <div className="vlog-media-container" onClick={() => showToast(`Opening Vlog Player: Solo Trekking...`)}>
                          <img src={vlog.thumbnail} alt={vlog.title} className="vlog-img" />
                          <div className="vlog-play-overlay">
                            <div className="vlog-play-button">
                              <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                          {hoveredVlogId === vlog.id && (
                            <div className="vlog-playback-progress-bar-container">
                              <div className="vlog-playback-progress-bar-fill"></div>
                            </div>
                          )}
                        </div>

                        {/* Vlog Details */}
                        <div className="vlog-caption-section">
                          <p className="vlog-title-text">{vlog.title}</p>
                          <div className="vlog-metrics-row">
                            <span className="vlog-views">
                              {viewCounts[vlog.id] !== undefined ? `${(viewCounts[vlog.id] / 1000).toFixed(1)}K views` : vlog.views}
                            </span>
                            <button 
                              className={`vlog-like-btn spring-active ${vlog.liked ? 'liked' : ''}`} 
                              onClick={() => {
                                toggleLikeVlog(vlog.id);
                                if (!vlog.liked) {
                                  showToast(`Liked @${vlog.username}'s vlog`);
                                }
                              }}
                            >
                              <svg width="12" height="12" fill={vlog.liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: '4px' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              {likeCounts[vlog.id] !== undefined ? likeCounts[vlog.id] : vlog.likes}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

              </div>
            )}

            {/* VIEW 2: REELS (DESKTOP ALIGNED) */}
            {activeTab === 'reels' && (
              <div className="reels-desktop-layout" onWheel={handleReelsWheel}>
                {/* Refresh Overlay / Spinner */}
                {isRefreshing && (
                  <div className="reels-refresh-spinner-popup">
                    <svg className="reels-refresh-spinner" viewBox="0 0 50 50">
                      <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5" stroke="currentColor"></circle>
                    </svg>
                    <span>Refreshing feed...</span>
                  </div>
                )}

                {/* Refresh Toast Confirmation */}
                {showRefreshToast && (
                  <div className="reels-refresh-toast">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', color: '#10b981' }}>
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Feed refreshed!</span>
                  </div>
                )}

                {/* Slidable track container for smooth vertical animation */}
                <div 
                  className="reels-track" 
                  style={{ 
                    transform: `translateY(-${activeReelIndex * 100}%)`
                  }}
                >
                  {reels.map((reel, rIdx) => {
                    const isLiked = likedReels.has(reel.id);
                    const isSaved = savedReels.has(reel.id);
                    const isFollowing = followedUsers.has(reel.username);

                    return (
                      <div 
                        className="reels-center-wrapper" 
                        key={reel.id}
                        style={{
                          opacity: rIdx === activeReelIndex ? 1 : 0.3,
                          transform: `scale(${rIdx === activeReelIndex ? 1 : 0.95})`,
                          transition: 'opacity 0.5s ease, transform 0.5s ease',
                          pointerEvents: rIdx === activeReelIndex ? 'auto' : 'none'
                        }}
                      >
                        
                        {/* Inner Centered Container to anchor left details and right actions */}
                        <div className="reels-inner-container">

                          {/* Left Column: Creator details & Caption (Desktop-only, hidden on mobile via CSS) */}
                          <div className="reels-details-left-side">
                            <div className="reels-details-left-container">
                              
                              <div className="reel-user-row-new">
                                <div className="reel-user-avatar-new" onClick={() => setActiveTab('profile')} style={{ cursor: 'pointer' }}>
                                  {renderAvatar(reel.username, 36)}
                                </div>
                                <div className="reel-user-name-info">
                                  <span className="reel-username-new" onClick={() => setActiveTab('profile')} style={{ cursor: 'pointer' }}>
                                    {reel.username}
                                  </span>
                                  <span className="reel-bullet-separator">•</span>
                                  <button 
                                    className={`reel-follow-btn-new ${isFollowing ? 'following' : ''}`}
                                    onClick={() => toggleFollowUser(reel.username)}
                                  >
                                    {isFollowing ? 'Following' : 'Follow'}
                                  </button>
                                </div>
                              </div>

                              <div className="reel-caption-container-new">
                                <p className="reel-caption-new">
                                  {reel.caption}
                                </p>
                              </div>

                              <div className="reel-soundtrack-new">
                                <svg className="music-icon-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M9 18V5l12-2v13"></path>
                                  <circle cx="6" cy="18" r="3"></circle>
                                  <circle cx="18" cy="16" r="3"></circle>
                                </svg>
                                <div className="music-text-scroll-container">
                                  <span className="music-text-scroll">{reel.soundtrack}</span>
                                </div>
                              </div>

                            </div>
                          </div>

                          {/* Middle Column: Immersive Video Card */}
                          <div className="reels-desktop-card" style={{ background: reel.imageGradient }}>
                            <div className="reel-gradient-overlay" />
                            
                            {/* Play/Pause overlay button indicator */}
                            <div className="reel-play-indicator-overlay">
                              <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                            
                            {/* Mobile overlay details (Visible only on mobile/tablet via CSS) */}
                            <div className="reel-mobile-overlay-details">
                              <div className="reel-user-row-new">
                                {renderAvatar(reel.username, 32)}
                                <span className="reel-username-new">{reel.username}</span>
                                <span className="reel-bullet-separator">•</span>
                                <button 
                                  className={`reel-follow-btn-new ${isFollowing ? 'following' : ''}`}
                                  onClick={() => toggleFollowUser(reel.username)}
                                >
                                  {isFollowing ? 'Following' : 'Follow'}
                                </button>
                              </div>
                              <p className="reel-caption-new">{reel.caption}</p>
                              <div className="reel-soundtrack-new">
                                <svg className="music-icon-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M9 18V5l12-2v13"></path>
                                  <circle cx="6" cy="18" r="3"></circle>
                                  <circle cx="18" cy="16" r="3"></circle>
                                </svg>
                                <span>{reel.soundtrack}</span>
                              </div>
                            </div>
                          </div>

                          {/* Right Column: Interaction Action Buttons */}
                          <div className="reels-desktop-actions-column-new">
                            
                            {/* Like Button */}
                            <div className="reel-action-item">
                              <button 
                                className={`reels-action-circle-btn-new ${isLiked ? 'liked' : ''}`} 
                                onClick={() => toggleLikeReel(reel.id)} 
                                title={isLiked ? "Unlike" : "Like"}
                              >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                              </button>
                              <span className="reel-action-count">{formatCount(reel.likes)}</span>
                            </div>

                            {/* Comment Button */}
                            <div className="reel-action-item">
                              <button 
                                className="reels-action-circle-btn-new" 
                                onClick={() => alert('Comments drawer open')} 
                                title="Comment"
                              >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                                </svg>
                              </button>
                              <span className="reel-action-count">{formatCount(reel.comments)}</span>
                            </div>

                            {/* Share Button */}
                            <div className="reel-action-item">
                              <button 
                                className="reels-action-circle-btn-new" 
                                onClick={() => alert('Copied Reel link!')} 
                                title="Share"
                              >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(-20deg) translate(0px, 1px)', transformOrigin: 'center' }}>
                                  <line x1="22" y1="2" x2="11" y2="13" />
                                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                </svg>
                              </button>
                              <span className="reel-action-count" style={{ display: 'none' }}>Share</span>
                            </div>

                            {/* Save / Bookmark Button */}
                            <div className="reel-action-item">
                              <button 
                                className={`reels-action-circle-btn-new ${isSaved ? 'saved' : ''}`} 
                                onClick={() => toggleSaveReel(reel.id)} 
                                title={isSaved ? "Unsave" : "Save"}
                              >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                                </svg>
                              </button>
                              <span className="reel-action-count" style={{ display: 'none' }}>Save</span>
                            </div>

                            {/* More Options Button */}
                            <div className="reel-action-item">
                              <button 
                                className="reels-action-circle-btn-new" 
                                onClick={() => alert('Options drawer open')} 
                                title="More options"
                              >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                                  <circle cx="6" cy="12" r="1.5" fill="currentColor" />
                                  <circle cx="18" cy="12" r="1.5" fill="currentColor" />
                                </svg>
                              </button>
                            </div>

                            {/* Rotating Audio Icon */}
                            <div className="reel-audio-vinyl-wrapper" title="Audio track">
                              <div className="reel-audio-avatar-square">
                                {renderAvatar(reel.username, 24)}
                              </div>
                            </div>

                          </div>

                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* Fixed Navigation Column at right middle edge of screen */}
                <div className="reels-navigation-column">
                  <button 
                    className="reels-nav-arrow-new" 
                    onClick={handlePrevReel}
                    title="Previous Reel (Scroll up / Pull to refresh)"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                  </button>
                  <button 
                    className="reels-nav-arrow-new" 
                    onClick={handleNextReel}
                    title="Next Reel (Scroll down)"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* VIEW 3: INBOX MESSAGES (DESKTOP LAYOUT) */}
            {activeTab === 'messages' && (
              <div className="messages-desktop-layout">
                {/* Mesmerizing Background Glows */}
                <div className="messages-bg-glow-1"></div>
                <div className="messages-bg-glow-2"></div>
                
                {/* 1. Inbox sidebar chat list */}
                <div className="messages-list-pane">
                  


                  {/* Search Inbox bar */}
                  <div className="inbox-search-container">
                    <div className="search-input-wrapper inbox-search-wrapper">
                      <span className="inbox-search-icon">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                      </span>
                      <input type="text" placeholder="Search chats" className="comment-input" style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', width: '100%', padding: 0 }} />
                    </div>
                  </div>

                  {/* Notes bubble strip */}
                  <div className="messages-notes-strip">
                    <div className="messages-note-item">
                      <div className="messages-note-bubble">Your note</div>
                      <div className="messages-note-avatar-container">
                        {renderAvatar(user.username, 44)}
                        <div className="messages-note-badge">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                        </div>
                      </div>
                      <span className="messages-note-username">Your note</span>
                    </div>
                    <div className="messages-note-item" onClick={() => alert('Campfire talks note!')}>
                      <div className="messages-note-bubble">Trekking...</div>
                      {renderAvatar('backpacker_sam', 44)}
                      <span className="messages-note-username">sam</span>
                    </div>
                    <div className="messages-note-item" onClick={() => alert('Rice fields vlogs note!')}>
                      <div className="messages-note-bubble">Bali vibe!</div>
                      {renderAvatar('wanderlust_jenny', 44)}
                      <span className="messages-note-username">jenny</span>
                    </div>
                  </div>

                  {/* Chat users list */}
                  <div className="inbox-users-list">
                    {Object.keys(conversations).map((buddy) => (
                      <div 
                        key={buddy}
                        className={`inbox-user-item ${activeChatBuddy === buddy ? 'active' : ''}`}
                        onClick={() => handleSwitchActiveChat(buddy)}
                      >
                        {renderAvatar(buddy, 40)}
                        <div className="inbox-user-info-row">
                          <div className="inbox-user-name">@{buddy.split('_')[1] || buddy}</div>
                          <div className="inbox-user-status-container" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <span className="status-pulse-dot"></span>
                            <span className="inbox-user-status">Active now</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

                {/* 2. Main Chat dialog area */}
                <div className={`messages-chat-pane ${isSwitchingChat ? 'glass-switching' : ''}`}>
                  
                  {/* Chat header */}
                  <div className="chat-window-header">
                    {renderAvatar(activeChatBuddy, 36)}
                    <div className="chat-header-user-info">
                      <div className="chat-header-username">@{activeChatBuddy}</div>
                      <span className="chat-header-status">Active 5m ago</span>
                    </div>
                    
                    <div className="chat-header-actions">
                      <button className="chat-header-btn" onClick={() => alert('Starting voice call...')} title="Audio Call">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                      </button>
                      <button className="chat-header-btn" onClick={() => alert('Starting video chat...')} title="Video Call">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M23 7l-7 5 7 5V7z"></path>
                          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                        </svg>
                      </button>
                      <button className="chat-header-btn" onClick={() => alert('Chat Details details')} title="Details">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Messages container */}
                  <div className="inbox-chat-messages">
                    {(conversations[activeChatBuddy] || []).map((msg, mIdx) => (
                      <div 
                        key={mIdx}
                        className={`inbox-chat-bubble ${msg.sender === 'me' ? 'me' : 'them'}`}
                      >
                        <div>{msg.text}</div>
                        <span className="inbox-chat-bubble-time">{msg.time}</span>
                      </div>
                    ))}
                  </div>

                  {/* Chat inputs footer */}
                  <div className="inbox-chat-footer">
                    <form className={`inbox-chat-input-bar ${isSwitchingChat ? 'glass-switching' : ''}`} onSubmit={handleSendMessage}>
                      <button type="button" className="inbox-input-action-btn" onClick={() => alert('Opening emoji picker...')} title="Emoji">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                          <line x1="9" y1="9" x2="9.01" y2="9"></line>
                          <line x1="15" y1="9" x2="15.01" y2="9"></line>
                        </svg>
                      </button>
                      <input 
                        type="text" 
                        className="inbox-chat-input" 
                        placeholder="Message..." 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                      />
                      <button type="button" className="inbox-input-action-btn" onClick={() => alert('Select photo/media')} title="Attach Photo">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                      </button>
                      <button type="submit" className="inbox-chat-send-btn" disabled={!chatInput.trim()}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="22" y1="2" x2="11" y2="13"></line>
                          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                      </button>
                    </form>
                  </div>

                </div>

                {/* 3. Right Details Column */}
                <aside className={`messages-details-pane ${isSwitchingChat ? 'glass-switching' : ''}`}>
                  {renderAvatar(activeChatBuddy, 72)}
                  <h4 style={{ fontSize: '16px', fontWeight: 700, marginTop: '16px', fontFamily: 'var(--font-title)' }}>@{activeChatBuddy}</h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '24px' }}>Travel Buddy</span>

                  <div className="inbox-details-media-section">
                    <h5 className="inbox-details-media-title">Shared Media</h5>
                    <div className="attachments-grid">
                      <div className="attachment-card" onClick={() => alert('Viewing Ubud shared card')}>
                        <img src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=200&auto=format&fit=crop&q=80" alt="ubud" />
                      </div>
                      <div className="attachment-card" onClick={() => alert('Viewing Solang shared card')}>
                        <img src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=200&auto=format&fit=crop&q=80" alt="solang" />
                      </div>
                    </div>
                  </div>
                </aside>

              </div>
            )}

            {/* VIEW 4: EXPLORE SEARCH GRID */}
            {activeTab === 'search' && (
              <div 
                className="discover-page-container"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setDiscoverMousePos({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                  });
                }}
              >
                {/* Cursor-reactive ambient background glow */}
                <div 
                  className="cursor-reactive-glow"
                  style={{
                    left: `${discoverMousePos.x}px`,
                    top: `${discoverMousePos.y}px`
                  }}
                ></div>

                {/* Corner vignette glows */}
                <div className="discover-corner-glow glow-topleft"></div>
                <div className="discover-corner-glow glow-bottomright"></div>

                {/* Explore Search Header Row with Action Buttons */}
                <div className="explore-search-header-row">
                  <div className="instagram-explore-search-bar" onClick={() => { setShowCommandPalette(true); playUISound('open'); }}>
                    <div className="search-input-wrapper explore-search-input-wrapper">
                      {/* App Logo */}
                      <div className="explore-search-logo-container" title="Travora">
                        <Logo theme={theme} width={22} showText={false} />
                      </div>
                      {/* SVG Search Icon */}
                      <svg 
                        width="15" 
                        height="15" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="explore-search-svg-icon"
                      >
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                      <input 
                        type="text" 
                        readOnly
                        className="comment-input explore-search-field"
                        placeholder="Search romantic beach getaways..."
                        value={searchQuery}
                        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px', marginLeft: '10px', cursor: 'pointer' }}
                      />
                      <span className="search-hotkey-badge">⌘K</span>
                    </div>
                  </div>

                  {/* Quick Action controls to the right of the Search Bar */}
                  <div className="explore-search-actions">
                    {/* Sound Toggle controls */}
                    <button 
                      type="button" 
                      className={`explore-action-btn sound-toggle-btn ${soundEnabled ? 'active' : ''}`}
                      onClick={() => {
                        const next = !soundEnabled;
                        setSoundEnabled(next);
                        if (next) {
                          // synthesize visual confirmation tick
                          try {
                            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                            const osc = ctx.createOscillator();
                            const gain = ctx.createGain();
                            osc.connect(gain);
                            gain.connect(ctx.destination);
                            osc.frequency.setValueAtTime(600, ctx.currentTime);
                            gain.gain.setValueAtTime(0.015, ctx.currentTime);
                            osc.start();
                            osc.stop(ctx.currentTime + 0.1);
                          } catch(err) {}
                        }
                      }}
                      title={soundEnabled ? "Disable UI Sounds" : "Enable UI Sounds"}
                    >
                      <span className="action-icon-wrapper-sound">
                        {soundEnabled ? (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                          </svg>
                        ) : (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                            <line x1="23" y1="9" x2="17" y2="15"></line>
                            <line x1="17" y1="9" x2="23" y2="15"></line>
                          </svg>
                        )}
                      </span>
                      <span>{soundEnabled ? 'Sound On' : 'Muted'}</span>
                    </button>

                    <button 
                      className="explore-action-btn" 
                      onClick={() => { playUISound('click'); alert('Opening advanced travel filters...'); }} 
                      title="Advanced Filters"
                      onMouseEnter={() => playUISound('hover')}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="4" y1="21" x2="4" y2="14" />
                        <line x1="4" y1="10" x2="4" y2="3" />
                        <line x1="12" y1="21" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12" y2="3" />
                        <line x1="20" y1="21" x2="20" y2="16" />
                        <line x1="20" y1="12" x2="20" y2="3" />
                        <line x1="1" y1="14" x2="7" y2="14" />
                        <line x1="9" y1="8" x2="15" y2="8" />
                        <line x1="17" y1="16" x2="23" y2="16" />
                      </svg>
                      <span>Filters</span>
                    </button>
                    <button 
                      className="explore-action-btn active" 
                      onClick={() => { playUISound('click'); alert('Travora interactive Map coming soon!'); }} 
                      title="Map View"
                      onMouseEnter={() => playUISound('hover')}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                        <line x1="9" y1="3" x2="9" y2="18" />
                        <line x1="15" y1="6" x2="15" y2="21" />
                      </svg>
                      <span>Map View</span>
                    </button>
                  </div>
                </div>

                {/* Category Filter Horizontal Scrollbar */}
                <div className="explore-categories-scroll-wrapper">
                  <div className="explore-categories-container">
                    {[
                      'All',
                      'Mountains',
                      'Beaches',
                      'Tropical',
                      'Cities',
                      'Winter',
                      'Cultural'
                    ].map((catName) => (
                      <button
                        key={catName}
                        className={`explore-category-btn ${activeExploreCategory === catName ? 'active' : ''}`}
                        onClick={() => handleSwitchExploreCategory(catName)}
                        onMouseEnter={() => playUISound('hover')}
                      >
                        <span className="explore-category-icon-svg">
                          {renderCategoryIcon(catName)}
                        </span>
                        <span className="explore-category-name">{catName}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Living Morphing Hero Banner */}
                <div 
                  className="explore-popular-hero-card discover-premium-card" 
                  onMouseEnter={() => setIsHeroHovered(true)} 
                  onMouseLeave={() => setIsHeroHovered(false)}
                  onClick={() => {
                    setSearchQuery(heroDestinations[heroIndex].name.split(',')[0]);
                    playUISound('tap');
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="explore-popular-hero-bg-wrapper">
                    {heroDestinations.map((dest, idx) => (
                      <img 
                        key={dest.name}
                        src={dest.img} 
                        alt={dest.name} 
                        className={`explore-popular-hero-bg ${heroIndex === idx ? 'visible' : ''}`}
                      />
                    ))}
                    <div className="explore-popular-hero-gradient-overlay" />
                  </div>
                  
                  <div className="explore-popular-hero-badge">
                    <span className="explore-badge-pulse" />
                    <span className="pulse-ripple-wave"></span>
                    <span className="badge-text-glow">⚡ LIVE TRENDING OF TODAY</span>
                  </div>
                  
                  <div className="explore-popular-hero-content-glass">
                    <div className="explore-popular-hero-text">
                      <h4 className="explore-popular-hero-title">
                        {heroDestinations[heroIndex].name}
                      </h4>
                      <p className="explore-popular-hero-desc">
                        {heroDestinations[heroIndex].desc}
                      </p>
                    </div>
                    
                    <div className="explore-popular-hero-stats">
                      <div className="explore-hero-stat-item">
                        <span className="explore-hero-stat-label">DAILY VISITORS</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="live-stat-dot-pulse"></span>
                          <span className="explore-hero-stat-value count-up">
                            {heroDestinations[heroIndex].visitors}
                          </span>
                        </div>
                      </div>
                      <div className="explore-hero-stat-divider" />
                      <div className="explore-hero-stat-item">
                        <span className="explore-hero-stat-label">RATING</span>
                        <span className="explore-hero-stat-value count-up">
                          {heroDestinations[heroIndex].rating} <span style={{ color: '#f59e0b', fontSize: '9px' }}>{heroDestinations[heroIndex].stars}</span>
                        </span>
                      </div>
                      <button className="explore-hero-cta-btn btn-shimmer-sweep">
                        Explore
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '24px 0 16px', fontFamily: 'var(--font-title)', letterSpacing: '-0.3px', background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Trending Destinations</h3>
                
                {/* Premium Explore Grid */}
                <div 
                  className={`instagram-explore-grid ${isSwitchingCategory ? 'glass-switching' : ''} ${!hasEverSwitchedCategory ? 'no-animate' : ''}`}
                  style={{ transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
                >
                  {travelDestinations
                    .filter(dest => {
                      const matchesSearch = dest.name.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesCategory = activeExploreCategory === 'All' || dest.category === activeExploreCategory;
                      return matchesSearch && matchesCategory;
                    })
                    .map((dest, idx) => {
                      const totalLikes = 120 + (liveUpticks[idx] || 0);
                      return (
                        <div 
                          key={idx} 
                          className="instagram-explore-item-card discover-premium-card"
                          onMouseMove={(e) => {
                            const card = e.currentTarget;
                            const rect = card.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const y = e.clientY - rect.top;
                            const xc = rect.width / 2;
                            const yc = rect.height / 2;
                            const angleX = (yc - y) / 12; // degree tilt
                            const angleY = (x - xc) / 12; // degree tilt
                            card.style.transform = `perspective(800px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale3d(1.02, 1.02, 1.02)`;
                            
                            // Parallax glare spotlight sweep
                            const glare = card.querySelector('.card-glare-overlay') as HTMLElement;
                            if (glare) {
                              glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.08) 0%, transparent 60%)`;
                            }
                          }}
                          onMouseLeave={(e) => {
                            const card = e.currentTarget;
                            card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
                            const glare = card.querySelector('.card-glare-overlay') as HTMLElement;
                            if (glare) {
                              glare.style.background = 'transparent';
                            }
                          }}
                          onClick={() => {
                            setSearchQuery(dest.name.split(',')[0]);
                            playUISound('tap');
                          }}
                        >
                          {/* Spotlight Glare */}
                          <div className="card-glare-overlay"></div>

                          <div className="explore-item-image-wrapper">
                            <img src={dest.img} alt={dest.name} className="explore-item-image" />
                            <div className="explore-item-gradient-overlay" />
                          </div>
                          
                          {/* Top Floating Badges */}
                          <div className="explore-item-floating-header">
                            <span className="explore-item-category-badge">{dest.category}</span>
                            
                            {/* Live viewers pulse badge */}
                            <span className="explore-live-pulse-badge">
                              <span className="pulse-dot-red"></span>
                              <span>{8 + (idx * 3)} viewing</span>
                            </span>
                          </div>
                          
                          {/* Floating Info card at bottom */}
                          <div className="explore-item-footer-glass">
                            <div className="explore-item-info">
                              {/* Destination copy handles names correctly without truncations */}
                              <span className="explore-item-name">{dest.name}</span>
                              <span className="explore-item-count">{dest.count}</span>
                            </div>
                            
                            <div className="explore-item-stats">
                              {/* Likes indicator counter increments dynamically */}
                              <div 
                                className={`explore-item-stat-pill ${liveUpticks[idx] ? 'stat-uptick-pulse' : ''}`} 
                                title="Likes"
                                onClick={(e) => { e.stopPropagation(); playUISound('tap'); }}
                              >
                                <svg width="11" height="11" fill="currentColor" style={{ color: '#ec4899', marginRight: '2px' }} viewBox="0 0 24 24">
                                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>
                                <span className="stat-count-text">{totalLikes}</span>
                              </div>
                              <div className="explore-item-stat-pill" title="Comments">
                                <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '2px' }} viewBox="0 0 24 24">
                                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                                </svg>
                                <span>{3 + (idx * 2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  }
                  
                  {travelDestinations.filter(dest => {
                    const matchesSearch = dest.name.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesCategory = activeExploreCategory === 'All' || dest.category === activeExploreCategory;
                    return matchesSearch && matchesCategory;
                  }).length === 0 && (
                    <div className="explore-empty-state-glass">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        <line x1="8" y1="11" x2="14" y2="11"></line>
                      </svg>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>No destinations found</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Try searching for a different keyword or category.</div>
                    </div>
                  )}
                </div>

                {/* Command-K style AI Search Palette Overlay Modal */}
                {showCommandPalette && (
                  <div className="command-palette-overlay" onClick={() => setShowCommandPalette(false)}>
                    <div className="command-palette-modal" onClick={(e) => e.stopPropagation()}>
                      <div className="command-palette-header">
                        <svg className="palette-search-icon" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input 
                          type="text" 
                          className="command-palette-input"
                          placeholder={`Search '${typedText}'`}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          autoFocus
                        />
                        <span className="command-palette-close-badge" onClick={() => setShowCommandPalette(false)}>ESC</span>
                      </div>
                      
                      <div className="command-palette-results">
                        <div className="palette-section-title">MATCHING EXPLORE DESTINATIONS</div>
                        {travelDestinations
                          .filter(dest => dest.name.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((dest, idx) => (
                            <div 
                              key={idx}
                              className="palette-result-item"
                              onClick={() => {
                                setSearchQuery(dest.name.split(',')[0]);
                                setShowCommandPalette(false);
                                playUISound('tap');
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="palette-pin">📍</span>
                                <span className="result-name">{dest.name}</span>
                              </div>
                              <span className="result-category">{dest.category}</span>
                            </div>
                          ))}
                        
                        {travelDestinations.filter(dest => dest.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                          <div className="palette-no-results">No matching destinations found. Press ESC to close.</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VIEW 5: CREATE POST (REDESIGNED 3-COLUMN SOCIAL SCHEDULING DASHBOARD) */}
            {activeTab === 'create' && (
              <div className="creator-dashboard-wrapper">
                <header className="creator-dashboard-header">
                  <div className="header-left">
                    <h2 className="creator-dashboard-title">Create Travel Post</h2>
                    <p className="creator-dashboard-subtitle">Craft, organize, and schedule your next travel story effortlessly.</p>
                  </div>
                  <div className="header-right">
                    <div className="breadcrumb-nav">
                      <span className="breadcrumb-item">Dashboard</span>
                      <span className="breadcrumb-arrow">/</span>
                      <span className="breadcrumb-item">Content List</span>
                      <span className="breadcrumb-arrow">/</span>
                      <span className="breadcrumb-item active">Create Post</span>
                    </div>
                  </div>
                </header>

                <div className="creator-dashboard-layout">
                  {/* Left Column: Media Panel */}
                  <aside className="creator-dashboard-column media-panel-column">
                    <div className="creator-glass-card media-panel-card">
                      <div className="panel-header">
                        <h3 className="panel-title">Upload Media</h3>
                        <p className="panel-desc">Share photos or a video to attach to your post.</p>
                      </div>
                      
                      {/* Drag & Drop zone */}
                      <div 
                        className="upload-dropzone"
                        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('dragover'); }}
                        onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('dragover'); }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('dragover');
                          const files = Array.from(e.dataTransfer.files);
                          handleMediaUpload(files);
                        }}
                      >
                        <input 
                          type="file" 
                          id="media-upload-input" 
                          multiple 
                          accept="image/*" 
                          style={{ display: 'none' }} 
                          onChange={(e) => {
                            if (e.target.files) {
                              handleMediaUpload(Array.from(e.target.files));
                            }
                          }}
                        />
                        <label htmlFor="media-upload-input" className="upload-label">
                          <div className="upload-icon-wrapper">
                            <svg className="upload-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          <span className="upload-title">Click to upload or drag & drop</span>
                          <span className="upload-subtitle">Image, video, carousel</span>
                        </label>
                      </div>

                      <div className="media-library-header">
                        <span className="library-title">Media Library</span>
                        <span className="library-count">All ({mediaLibrary.length})</span>
                      </div>

                      {/* Media library grid */}
                      <div className="media-library-grid">
                        {/* Plus button for quick upload */}
                        <label htmlFor="media-upload-input" className="library-add-btn">
                          <span className="add-plus-symbol">+</span>
                        </label>

                        {mediaLibrary.map((item) => {
                          const isSelected = postImages.includes(item.url);
                          return (
                            <div 
                              key={item.id} 
                              className={`media-library-item ${isSelected ? 'selected' : ''}`}
                              onClick={() => toggleMediaSelection(item.url)}
                            >
                              <img src={item.url} alt={item.name} className="library-item-img" />
                              <div className="item-selection-overlay">
                                <span className="selection-checkbox">
                                  {isSelected && (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                                      <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                  )}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Attached Media List with details & reordering */}
                      <div className="attached-media-section">
                        <span className="section-label">Selected Media ({postImages.length})</span>
                        {postImages.length === 0 ? (
                          <div className="no-attached-media">No media attached to post. Select from library or upload.</div>
                        ) : (
                          <div className="attached-media-list">
                            {postImages.map((imgUrl, index) => {
                              const libItem = mediaLibrary.find(item => item.url === imgUrl) || {
                                name: `uploaded_image_${index + 1}.jpg`,
                                size: '1.4 MB',
                                dimensions: '1326x1326'
                              };
                              return (
                                <div key={imgUrl} className="attached-media-item">
                                  <div className="attached-item-left">
                                    {/* Reorder drag handle (mock buttons for precise control) */}
                                    <div className="reorder-controls">
                                      <button 
                                        type="button" 
                                        className="reorder-btn" 
                                        disabled={index === 0}
                                        onClick={(e) => { e.stopPropagation(); moveMedia(index, -1); }}
                                        title="Move Up"
                                      >
                                        ▲
                                      </button>
                                      <button 
                                        type="button" 
                                        className="reorder-btn" 
                                        disabled={index === postImages.length - 1}
                                        onClick={(e) => { e.stopPropagation(); moveMedia(index, 1); }}
                                        title="Move Down"
                                      >
                                        ▼
                                      </button>
                                    </div>
                                    <img src={imgUrl} alt="Attached Preview" className="attached-item-thumbnail" />
                                    <div className="attached-item-info">
                                      <span className="item-filename">{libItem.name}</span>
                                      <span className="item-meta">{libItem.dimensions} • {libItem.size}</span>
                                    </div>
                                  </div>
                                  <div className="attached-item-actions">
                                    <button 
                                      type="button" 
                                      className="media-item-action-btn delete-btn" 
                                      onClick={() => toggleMediaSelection(imgUrl)}
                                      title="Remove from post"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </aside>

                  {/* Center Column: Content Editor Form */}
                  <main className="creator-dashboard-column editor-form-column">
                    <div className="creator-glass-card editor-form-card">
                      <form onSubmit={handleCreatePost} className="editor-form">
                        
                        {/* Platform Selector Pills */}
                        <div className="form-section">
                          <label className="section-label">Platform Destination</label>
                          <div className="platform-selector">
                            {(['Feed', 'Stories', 'Community', 'Highlights'] as const).map((platform) => (
                              <button
                                key={platform}
                                type="button"
                                className={`platform-pill ${selectedPlatform === platform ? 'active' : ''}`}
                                onClick={() => setSelectedPlatform(platform)}
                              >
                                <span className="platform-icon">
                                  {platform === 'Feed' && '📱'}
                                  {platform === 'Stories' && '✨'}
                                  {platform === 'Community' && '👥'}
                                  {platform === 'Highlights' && '⭐'}
                                </span>
                                {platform}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Title field */}
                        <div className="form-group">
                          <label className="form-label" htmlFor="post-title-input">Title</label>
                          <input 
                            type="text" 
                            id="post-title-input" 
                            className="form-input-premium" 
                            placeholder="Austria: Panoramic Lake" 
                            value={postTitle}
                            onChange={(e) => setPostTitle(e.target.value)}
                            required
                          />
                        </div>

                        {/* Location autocomplete */}
                        <div className="form-group location-autocomplete-container">
                          <label className="form-label" htmlFor="post-location-input">Location</label>
                          <div className="form-input-with-icon">
                            <span className="input-icon">📍</span>
                            <input 
                              type="text" 
                              id="post-location-input" 
                              className="form-input-premium" 
                              placeholder="Where was this photo taken?" 
                              value={newPostLocation}
                              onChange={(e) => {
                                setNewPostLocation(e.target.value);
                                setLocationSuggestionsExpanded(true);
                              }}
                              onFocus={() => setLocationSuggestionsExpanded(true)}
                              required
                            />
                          </div>
                          
                          {/* Autocomplete list dropdown */}
                          {locationSuggestionsExpanded && newPostLocation && (
                            <div className="autocomplete-suggestions">
                              {travelDestinations
                                .filter(dest => dest.name.toLowerCase().includes(newPostLocation.toLowerCase()))
                                .map((dest) => (
                                  <div 
                                    key={dest.name} 
                                    className="autocomplete-item"
                                    onClick={() => {
                                      setNewPostLocation(dest.name);
                                      setLocationSuggestionsExpanded(false);
                                    }}
                                  >
                                    <span className="suggestion-icon">📍</span>
                                    <span className="suggestion-name">{dest.name}</span>
                                  </div>
                                ))}
                              <div 
                                className="autocomplete-item custom-add"
                                onClick={() => setLocationSuggestionsExpanded(false)}
                              >
                                <span className="suggestion-icon">➕</span>
                                <span className="suggestion-name">Use custom: "{newPostLocation}"</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Caption Textarea with character count */}
                        <div className="form-group">
                          <div className="label-row">
                            <label className="form-label" htmlFor="post-caption-input">Caption</label>
                            <span className="char-count">{newPostCaption.length} / 2200</span>
                          </div>
                          <textarea 
                            id="post-caption-input" 
                            className="form-input-premium form-textarea-premium" 
                            placeholder="Write a caption... (e.g. Scooter rides in Bali rice fields!) #wanderlust"
                            value={newPostCaption}
                            onChange={(e) => setNewPostCaption(e.target.value)}
                            required
                          />
                        </div>

                        {/* Tag travelers/friends section */}
                        <div className="form-group">
                          <label className="form-label" htmlFor="friend-tag-input">Tag Travelers / Friends</label>
                          <div className="tag-friends-input-wrapper">
                            <input
                              type="text"
                              id="friend-tag-input"
                              className="form-input-premium"
                              placeholder="Add people by name or username"
                              value={friendInput}
                              onChange={(e) => setFriendInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ',') {
                                  e.preventDefault();
                                  const tag = friendInput.trim();
                                  if (tag) {
                                    const formatted = tag.startsWith('@') ? tag : `@${tag}`;
                                    if (!taggedFriends.includes(formatted)) {
                                      setTaggedFriends(prev => [...prev, formatted]);
                                    }
                                    setFriendInput('');
                                  }
                                }
                              }}
                            />
                          </div>
                          <div className="tagged-friends-list">
                            {taggedFriends.map(friend => (
                              <span key={friend} className="friend-tag-pill">
                                {friend}
                                <button 
                                  type="button" 
                                  className="remove-tag-btn"
                                  onClick={() => setTaggedFriends(prev => prev.filter(f => f !== friend))}
                                >
                                  ✕
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Travel Categories */}
                        <div className="form-group">
                          <label className="form-label">Travel Categories</label>
                          <div className="categories-selection">
                            {['Adventure', 'Food', 'Beaches', 'Mountains', 'Culture'].map(cat => {
                              const isSelected = selectedCategories.includes(cat);
                              return (
                                <button
                                  key={cat}
                                  type="button"
                                  className={`category-pill ${isSelected ? 'selected' : ''}`}
                                  onClick={() => {
                                    setSelectedCategories(prev => {
                                      if (prev.includes(cat)) {
                                        return prev.filter(c => c !== cat);
                                      } else {
                                        return [...prev, cat];
                                      }
                                    });
                                  }}
                                >
                                  {cat}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Schedule Section */}
                        <div className="form-group schedule-form-section">
                          <label className="form-label">Schedule Post</label>
                          <div className="scheduler-inputs">
                            <div className="input-group">
                              <span className="scheduler-icon">📅</span>
                              <input 
                                type="date" 
                                className="form-input-premium schedule-date-picker"
                                value={scheduleDate} 
                                onChange={(e) => setScheduleDate(e.target.value)}
                              />
                            </div>
                            <div className="input-group">
                              <span className="scheduler-icon">⏰</span>
                              <input 
                                type="time" 
                                className="form-input-premium schedule-time-picker"
                                value={scheduleTime} 
                                onChange={(e) => setScheduleTime(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Visibility elegant radio cards */}
                        <div className="form-group">
                          <label className="form-label">Post Visibility</label>
                          <div className="visibility-options-grid">
                            {[
                              { key: 'public', title: 'Public', desc: 'Anyone on Travora can see this post' },
                              { key: 'followers', title: 'Followers Only', desc: 'Only your active followers can view' },
                              { key: 'private', title: 'Private (Only Me)', desc: 'Hidden completely from other users' }
                            ].map(option => (
                              <label key={option.key} className={`visibility-radio-card ${visibility === option.key ? 'active' : ''}`}>
                                <input
                                  type="radio"
                                  name="visibility-selection"
                                  value={option.key}
                                  checked={visibility === option.key}
                                  onChange={() => setVisibility(option.key as any)}
                                  className="sr-only"
                                />
                                <span className="radio-indicator"></span>
                                <span className="radio-content">
                                  <span className="radio-title">{option.title}</span>
                                  <span className="radio-description">{option.desc}</span>
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Feature Toggle Switches */}
                        <div className="toggles-list-section">
                          <div className="toggle-switch-row">
                            <div className="toggle-info">
                              <span className="toggle-label-title">Allow Comments</span>
                              <span className="toggle-label-desc">Let followers interact and leave comments on this post</span>
                            </div>
                            <label className="switch">
                              <input 
                                type="checkbox" 
                                checked={allowComments} 
                                onChange={(e) => setAllowComments(e.target.checked)} 
                              />
                              <span className="slider round"></span>
                            </label>
                          </div>

                          <div className="toggle-switch-row">
                            <div className="toggle-info">
                              <span className="toggle-label-title">Cross-Post to Facebook</span>
                              <span className="toggle-label-desc">Automatically post to linked Facebook pages</span>
                            </div>
                            <label className="switch">
                              <input 
                                type="checkbox" 
                                checked={crossPostFacebook} 
                                onChange={(e) => setCrossPostFacebook(e.target.checked)} 
                              />
                              <span className="slider round"></span>
                            </label>
                          </div>

                          <div className="toggle-switch-row">
                            <div className="toggle-info">
                              <span className="toggle-label-title">Cross-Post to Twitter / X</span>
                              <span className="toggle-label-desc">Push link and caption updates to your X audience</span>
                            </div>
                            <label className="switch">
                              <input 
                                type="checkbox" 
                                checked={crossPostTwitter} 
                                onChange={(e) => setCrossPostTwitter(e.target.checked)} 
                              />
                              <span className="slider round"></span>
                            </label>
                          </div>

                          <div className="toggle-switch-row">
                            <div className="toggle-info">
                              <span className="toggle-label-title">Cross-Post to TikTok</span>
                              <span className="toggle-label-desc">Share visual content onto your TikTok profile</span>
                            </div>
                            <label className="switch">
                              <input 
                                type="checkbox" 
                                checked={crossPostTiktok} 
                                onChange={(e) => setCrossPostTiktok(e.target.checked)} 
                              />
                              <span className="slider round"></span>
                            </label>
                          </div>

                          <div className="toggle-switch-row">
                            <div className="toggle-info">
                              <span className="toggle-label-title">Push Notifications</span>
                              <span className="toggle-label-desc">Alert close friends and top subscribers immediately</span>
                            </div>
                            <label className="switch">
                              <input 
                                type="checkbox" 
                                checked={sendNotification} 
                                onChange={(e) => setSendNotification(e.target.checked)} 
                              />
                              <span className="slider round"></span>
                            </label>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="form-action-buttons">
                          <button 
                            type="button" 
                            className="creator-action-btn btn-draft"
                            onClick={() => alert('Draft saved successfully!')}
                          >
                            Save Draft
                          </button>
                          <button 
                            type="button" 
                            className="creator-action-btn btn-schedule"
                            onClick={() => alert(`Post scheduled for ${scheduleDate} at ${scheduleTime}`)}
                          >
                            Schedule Post
                          </button>
                          <button 
                            type="submit" 
                            className="creator-action-btn btn-publish"
                          >
                            Publish Now
                          </button>
                        </div>

                      </form>
                    </div>
                  </main>

                  {/* Right Column: Sticky Live Preview Panel */}
                  <aside className="creator-dashboard-column preview-panel-column">
                    <div className="sticky-preview-wrapper">
                      <div className="preview-header">
                        <h3 className="preview-header-title">Live Preview</h3>
                      </div>
                      
                      {/* Glassmorphism Phone Frame */}
                      <div className="mobile-phone-frame">
                        {/* Device glare reflections */}
                        <div className="phone-glass-shine"></div>
                        <div className="phone-glass-border"></div>
                        
                        {/* Dynamic Island */}
                        <div className="phone-notch-island"></div>
                        
                        <div className="phone-screen-content">
                          {/* Status Bar */}
                          <div className="phone-status-bar">
                            <span className="status-time">9:41</span>
                            <div className="status-icons">
                              {/* Signal Bars SVG */}
                              <svg width="15" height="10" viewBox="0 0 15 10" fill="currentColor" className="status-icon-svg">
                                <rect x="0" y="7" width="2" height="3" rx="0.5" />
                                <rect x="3" y="5" width="2" height="5" rx="0.5" />
                                <rect x="6" y="3" width="2" height="7" rx="0.5" />
                                <rect x="9" y="1" width="2" height="9" rx="0.5" />
                                <rect x="12" y="0" width="2" height="10" rx="0.5" opacity="0.3" />
                              </svg>
                              {/* WiFi SVG */}
                              <svg width="14" height="10" viewBox="0 0 16 12" fill="currentColor" className="status-icon-svg">
                                <path d="M8 12a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-3.55-3.55a1.5 1.5 0 0 1 0-2.12c1.95-1.95 5.15-1.95 7.1 0a1.5 1.5 0 0 1-2.12 2.12c-.78-.78-2.06-.78-2.84 0a1.5 1.5 0 0 1-2.14 0zm-2.83-2.83a1.5 1.5 0 0 1 0-2.12c3.5-3.5 9.19-3.5 12.7 0a1.5 1.5 0 1 1-2.12 2.12c-2.33-2.33-6.13-2.33-8.46 0a1.5 1.5 0 0 1-2.12 0z" />
                              </svg>
                              {/* Battery SVG */}
                              <svg width="20" height="10" viewBox="0 0 22 11" fill="currentColor" className="status-icon-svg">
                                <rect x="1" y="1" width="16" height="9" rx="2" fill="none" stroke="currentColor" strokeWidth="1" />
                                <rect x="3" y="3" width="12" height="5" rx="1" fill="#10b981" />
                                <path d="M18 4h1v3h-1z" />
                              </svg>
                            </div>
                          </div>

                          {/* Social Post Content Preview */}
                          <div className="phone-post-card">
                            {/* Post Header */}
                            <div className="phone-post-header">
                              <div className="user-profile-info">
                                <div className="user-avatar-placeholder">
                                  {user?.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="Avatar" className="user-avatar-preview-img" />
                                  ) : (
                                    <div className="default-avatar-glow">🌟</div>
                                  )}
                                </div>
                                <div className="user-text-meta">
                                  <span className="preview-username">@{user?.username || 'Suvarnatest'}</span>
                                  <span className="preview-location">{newPostLocation ? newPostLocation.split(',')[0] : 'Travel Heaven 📍'}</span>
                                </div>
                              </div>
                              <button type="button" className="post-header-more-btn">
                                <svg width="18" height="4" viewBox="0 0 24 6" fill="currentColor">
                                  <circle cx="3" cy="3" r="3" />
                                  <circle cx="12" cy="3" r="3" />
                                  <circle cx="21" cy="3" r="3" />
                                </svg>
                              </button>
                            </div>

                            {/* Divider line */}
                            <div className="phone-post-divider"></div>

                            {/* Post Carousel Images */}
                            <div 
                              className="phone-post-media-container"
                              onClick={handleImageClick}
                              onDoubleClick={handleDoubleTapPreview}
                            >
                              {/* Glowing Heart animation overlay */}
                              {showHeartOverlay && (
                                <div className="heart-overlay-container animate-pop">
                                  <svg className="heart-overlay-icon" viewBox="0 0 24 24" fill="#ff007f">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                  </svg>
                                </div>
                              )}
                              
                              {postImages.length === 0 ? (
                                <div className="media-placeholder-visual">
                                  <span className="visual-icon">📸</span>
                                  <span className="visual-text">No media attached</span>
                                </div>
                              ) : (
                                <>
                                  <img 
                                    src={postImages[previewCarouselIndex < postImages.length ? previewCarouselIndex : 0]} 
                                    alt="Live Post Preview" 
                                    className="phone-preview-media-img" 
                                  />
                                  
                                  {/* Instagram-style indicator dots overlay at bottom center */}
                                  {postImages.length > 1 && (
                                    <div className="preview-carousel-indicators-dots">
                                      {postImages.map((_, idx) => (
                                        <span 
                                          key={idx} 
                                          className={`indicator-dot-small ${(previewCarouselIndex < postImages.length ? previewCarouselIndex : 0) === idx ? 'active' : ''}`}
                                        ></span>
                                      ))}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>

                            {/* Divider line */}
                            <div className="phone-post-divider"></div>

                            {/* Post Interaction Actions */}
                            <div className="phone-post-actions-row">
                              <div className="left-interactions-group">
                                <button 
                                  type="button" 
                                  className={`action-btn-preview heart-btn ${isPreviewLiked ? 'liked' : ''}`}
                                  onClick={() => setIsPreviewLiked(!isPreviewLiked)}
                                >
                                  <svg width="22" height="22" fill={isPreviewLiked ? "#ff007f" : "none"} stroke={isPreviewLiked ? "#ff007f" : "currentColor"} strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                  </svg>
                                </button>
                                
                                <button type="button" className="action-btn-preview">
                                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                  </svg>
                                </button>
                                
                                <button type="button" className="action-btn-preview">
                                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                  </svg>
                                </button>
                              </div>
                              
                              <button 
                                type="button" 
                                className={`action-btn-preview save-btn ${isPreviewSaved ? 'saved' : ''}`}
                                onClick={() => setIsPreviewSaved(!isPreviewSaved)}
                              >
                                <svg width="22" height="22" fill={isPreviewSaved ? "#ec4899" : "none"} stroke={isPreviewSaved ? "#ec4899" : "currentColor"} strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                                </svg>
                              </button>
                            </div>

                            {/* Divider line */}
                            <div className="phone-post-divider"></div>

                            {/* Likes info */}
                            <div className="phone-likes-section">
                              <span className="likes-bold">{isPreviewLiked ? '1,249 likes' : '1,248 likes'}</span>
                              <span className="likes-subtext">
                                Liked by <strong>traveler_anna</strong> and <strong>{isPreviewLiked ? '1,248' : '1,247'} others</strong>
                              </span>
                            </div>

                            {/* Caption details */}
                            <div className="phone-caption-section">
                              <div className="caption-text-block">
                                <span className="caption-username">@{user?.username || 'Suvarnatest'}</span>{' '}
                                {postTitle && <span className="caption-title">{postTitle} 🏔️</span>}{' '}
                                <span className="caption-body">
                                  {isCaptionExpanded 
                                    ? (newPostCaption || "The perfect morning view after hiking through the Alps. One of my favorite places I've ever visited.")
                                    : (newPostCaption ? (newPostCaption.length > 85 ? newPostCaption.slice(0, 85) : newPostCaption) : "The perfect morning view after hiking through the Alps. One of my favorite places I've ever visited.")
                                  }
                                  {!isCaptionExpanded && (newPostCaption ? newPostCaption.length > 85 : true) && (
                                    <span 
                                      className="caption-more-trigger"
                                      onClick={() => setIsCaptionExpanded(true)}
                                    >
                                      ...more
                                    </span>
                                  )}
                                </span>
                              </div>
                              
                              <div className="preview-hashtags-inline">
                                {(newPostCaption.match(/#[a-zA-Z0-9_]+/g) || ['#travora', '#explore', '#wanderlust']).join(' ')}
                              </div>

                              {newPostLocation && (
                                <div className="preview-location-chip">
                                  <span className="chip-icon">📍</span>
                                  <span className="chip-text">{newPostLocation}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            )}

            {/* VIEW 6: REDESIGNED PREMIUM TRAVEL PROFILE PAGE */}
            {activeTab === 'profile' && (
              <div className="profile-page-wrapper">
                
                {/* 1. Curved Header Profile Container Wrapper */}
                <div className="profile-header-card-wrapper">
                  <div className="profile-header-container">
                    
                    {/* Left: Avatar with dynamic gradient ring */}
                    <div className="profile-avatar-column">
                      <div className="profile-avatar-gradient-ring">
                        <div className="profile-avatar-circle-large">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.fullName} className="profile-avatar-img" />
                          ) : (
                            user.fullName.charAt(0).toUpperCase()
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Username, Action Buttons, Stats, and Biography */}
                    <div className="profile-info-column">
                      
                      {/* User Action Row */}
                      <div className="profile-action-row">
                        <h2 className="profile-username-header">@{editUsername || user.username}</h2>
                        <div className="profile-action-buttons-group">
                          <button 
                            className="profile-primary-action-btn"
                            onClick={() => setProfileTab('settings')}
                          >
                            Edit Profile
                          </button>
                          <button 
                            className="profile-icon-action-btn"
                            onClick={() => setProfileTab('settings')}
                            title="Settings"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="3" />
                              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                            </svg>
                          </button>
                          <button 
                            className="profile-icon-action-btn logout-btn-red"
                            onClick={logout}
                            title="Log Out"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                              <polyline points="16 17 21 12 16 7" />
                              <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Stats Summary Row */}
                      <div className="profile-stats-row-new">
                        <div className="profile-stat-item-new">
                          <span className="profile-stat-number">{userPosts.length}</span>
                          <span className="profile-stat-label">posts</span>
                        </div>
                        <div className="profile-stat-item-new">
                          <span className="profile-stat-number">12.5K</span>
                          <span className="profile-stat-label">followers</span>
                        </div>
                        <div className="profile-stat-item-new">
                          <span className="profile-stat-number">595</span>
                          <span className="profile-stat-label">following</span>
                        </div>
                        <div className="profile-stat-item-new">
                          <span className="profile-stat-number">6</span>
                          <span className="profile-stat-label">countries</span>
                        </div>
                        <div className="profile-stat-item-new" onClick={() => setProfileTab('milestones')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" style={{ display: 'inline-block' }}>
                            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                            <path d="M4 22h16" />
                            <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
                            <path d="M12 2a6 6 0 0 1 6 6v5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6z" />
                          </svg>
                          <span className="profile-stat-number" style={{ color: '#f59e0b', marginLeft: '2px' }}>5</span>
                          <span className="profile-stat-label">badges</span>
                        </div>
                      </div>

                      {/* Biography details */}
                      <div className="profile-bio-details-new">
                        <h3 className="profile-display-name-new">{editFullName || user.fullName}</h3>
                        <span className="profile-tag-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L14 19v-5.5l8 2.5z"/>
                          </svg>
                          Professional Nomad
                        </span>
                        <p className="profile-bio-paragraph">{editBio}</p>
                        {editWebsite && (
                          <a 
                            href={`https://${editWebsite}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="profile-bio-website-link"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '4px' }}>
                              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                            </svg>
                            {editWebsite}
                          </a>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                {/* 2. Highlights Stories Circular Row */}
                <div className="profile-highlights-row-container">
                  {highlights.map((hl, idx) => (
                    <div 
                      key={hl.id} 
                      className="highlight-story-item"
                      onClick={() => {
                        setSelectedHighlight(hl.id);
                        setActiveStoryIdx(0);
                      }}
                    >
                      <div className="highlight-story-circle-wrapper">
                        <div className="highlight-story-circle-inner">
                          <img src={hl.cover} alt={hl.title} className="highlight-story-img" />
                        </div>
                      </div>
                      <span className="highlight-story-label">{hl.title}</span>
                    </div>
                  ))}
                  
                  {/* Mock Add highlight */}
                  <div className="highlight-story-item opacity-60" onClick={() => alert('Add highlight story cover feature coming soon!')}>
                    <div className="highlight-story-circle-wrapper border-dashed-add">
                      <div className="highlight-story-circle-inner flex-add-plus">
                        <span>+</span>
                      </div>
                    </div>
                    <span className="highlight-story-label">New</span>
                  </div>
                </div>

                {/* 3. Dynamic Tabs Navigation Menu */}
                <div className="profile-tabs-nav">
                  <button 
                    className={`profile-tab-btn ${profileTab === 'posts' ? 'active' : ''}`}
                    onClick={() => setProfileTab('posts')}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                    <span>POSTS</span>
                  </button>
                  
                  <button 
                    className={`profile-tab-btn ${profileTab === 'saved' ? 'active' : ''}`}
                    onClick={() => setProfileTab('saved')}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                    <span>SAVED</span>
                  </button>
                  
                  <button 
                    className={`profile-tab-btn ${profileTab === 'milestones' ? 'active' : ''}`}
                    onClick={() => setProfileTab('milestones')}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span>MILESTONES</span>
                  </button>
                  
                  <button 
                    className={`profile-tab-btn ${profileTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setProfileTab('settings')}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    <span>SETTINGS</span>
                  </button>
                </div>

                {/* 4. Tab Contents Grid */}
                <div className="profile-tab-content-area">
                  
                  {/* TAB A: POSTS DYNAMIC POSTCARDS GRID */}
                  {profileTab === 'posts' && (
                    <div className="profile-media-grid">
                      {userPosts.map((post) => (
                        <div 
                          key={post.id} 
                          className="profile-postcard-card"
                          onClick={() => alert(`Opening post card details: "${post.title}"`)}
                        >
                          {/* Postal Stamp element */}
                          <div className="profile-postcard-stamp">
                            <div className="profile-postcard-stamp-inner">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M22 2L11 13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                              </svg>
                            </div>
                          </div>
                          {/* Polaroid Photo Frame */}
                          <div className="profile-postcard-photo-wrapper">
                            <img src={post.img} alt={post.title} className="profile-postcard-img" />
                            
                            <div className="profile-media-hover-overlay">
                              <div className="profile-media-hover-metrics">
                                <span>❤️ {post.likes}</span>
                                <span>💬 {post.comments}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Postcard handwritten info text */}
                          <div className="profile-postcard-info">
                            <h4 className="profile-postcard-title">{post.title}</h4>
                            <span className="profile-postcard-location">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '3px' }}>
                                <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/>
                                <circle cx="12" cy="10" r="3"/>
                              </svg>
                              {post.location}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TAB B: SAVED ITEMS GRID (Mocks Saved Reels) */}
                  {profileTab === 'saved' && (
                    <div className="profile-media-grid">
                      {/* Show first 3 vlogs from global vlogs to act as saved items */}
                      {vlogs.slice(0, 3).map((vlog) => (
                        <div 
                          key={vlog.id} 
                          className="profile-media-grid-item"
                          onClick={() => {
                            setActiveTab('reels');
                            const rIdx = reels.findIndex(r => r.username === vlog.username);
                            if (rIdx !== -1) setActiveReelIndex(rIdx);
                          }}
                        >
                          <img src={vlog.thumbnail} alt={vlog.title} className="profile-media-thumbnail" />
                          <div className="profile-media-hover-overlay">
                            <div className="profile-media-hover-metrics">
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                  <polygon points="5 3 19 12 5 21 5 3"/>
                                </svg>
                                Play
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {/* Plus save placeholders */}
                      <div className="profile-saved-empty-placeholder">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                        <h4>Save Travel Guides</h4>
                        <p>Toggle bookmark save on reels to catalog guides here.</p>
                      </div>
                    </div>
                  )}

                  {/* TAB C: MILESTONES ACHIEVEMENT timeline/grid */}
                  {profileTab === 'milestones' && (
                    <div className="profile-milestones-grid">
                      {milestones.map((ms) => (
                        <div 
                          key={ms.id} 
                          className={`milestone-badge-card ${ms.unlocked ? 'unlocked' : 'locked'}`}
                          onClick={() => setSelectedMilestone(ms)}
                        >
                          {/* Locked Badge Overlay */}
                          {!ms.unlocked && (
                            <div className="milestone-locked-badge" title="Locked milestone">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                              </svg>
                            </div>
                          )}

                          <div 
                            className="milestone-badge-icon-sphere"
                            style={{ background: ms.badgeColor }}
                          >
                            {renderMilestoneIcon(ms.id)}
                          </div>
                          
                          <div className="milestone-text-details">
                            <h4 className="milestone-title">{ms.title}</h4>
                            <p className="milestone-desc">{ms.desc}</p>
                            
                            {ms.unlocked ? (
                              <div className="milestone-unlock-date-badge">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ marginRight: '4px', color: '#10b981' }}>
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                {ms.date}
                              </div>
                            ) : (
                              <div className="milestone-progress-bar-wrapper">
                                <div className="milestone-progress-bar-fill" style={{ width: '60%' }} />
                                <span className="milestone-progress-bar-text">{ms.progress}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TAB D: EDIT PROFILE SETTINGS AND ROLE MANAGMENT */}
                  {profileTab === 'settings' && (
                    <div className="profile-settings-panel">
                      <form onSubmit={(e) => { e.preventDefault(); alert('Profile settings updated successfully!'); setProfileTab('posts'); }}>
                        
                        <div className="profile-settings-form-row">
                          <div className="form-group">
                            <label className="form-label-new">Full Name</label>
                            <input 
                              type="text" 
                              className="form-input" 
                              value={editFullName} 
                              onChange={(e) => setEditFullName(e.target.value)} 
                              required 
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label-new">Username</label>
                            <input 
                              type="text" 
                              className="form-input" 
                              value={editUsername} 
                              onChange={(e) => setEditUsername(e.target.value)} 
                              required 
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label-new">Email Address</label>
                          <input 
                            type="email" 
                            className="form-input" 
                            value={editEmail} 
                            onChange={(e) => setEditEmail(e.target.value)} 
                            required 
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label-new">Biography</label>
                          <textarea 
                            className="form-input-textarea" 
                            rows={3}
                            value={editBio} 
                            onChange={(e) => setEditBio(e.target.value)} 
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label-new">Website Link</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="website.com"
                            value={editWebsite} 
                            onChange={(e) => setEditWebsite(e.target.value)} 
                          />
                        </div>

                        {user.role === 'traveller' && (
                          <div className="profile-vlogger-settings-toggle">
                            <div className="toggle-text-column">
                              <span className="toggle-header-label">Switch Creator Mode</span>
                              <span className="toggle-sub-label">Publish vlogs and travel maps as a verified vlogger.</span>
                            </div>
                            <label className="switch">
                              <input 
                                type="checkbox" 
                                checked={user.travellerType === 'vlogger'} 
                                onChange={async (e) => {
                                  const result = await updateTravellerType(e.target.checked ? 'vlogger' : 'normal');
                                  if (!result.success) alert('Failed to switch mode.');
                                }} 
                              />
                              <span className="slider"></span>
                            </label>
                          </div>
                        )}

                        <div className="profile-settings-footer-actions">
                          <button type="submit" className="btn-primary">
                            Save Changes
                          </button>
                        </div>

                      </form>
                    </div>
                  )}

                </div>

                {/* --- MODAL 1: TRAVEL STORIES STORY HIGHLIGHT VIEWER CAROUSEL --- */}
                {selectedHighlight && (() => {
                  const hl = highlights.find(h => h.id === selectedHighlight);
                  if (!hl) return null;
                  const currentStory = hl.stories[activeStoryIdx % hl.stories.length];
                  
                  return (
                    <div className="highlight-stories-modal-overlay">
                      <div className="highlight-stories-modal-container">
                        
                        <div className="story-progress-segments-bar">
                          {hl.stories.map((s, idx) => (
                            <div key={idx} className="story-progress-bar-track">
                              <div 
                                className={`story-progress-bar-fill-indicator ${idx < activeStoryIdx ? 'completed' : idx === activeStoryIdx ? 'active-loading' : ''}`} 
                              />
                            </div>
                          ))}
                        </div>

                        <div className="story-viewer-top-row">
                          <div className="story-creator-avatar">
                            {renderAvatar(user.username, 30)}
                          </div>
                          <span className="story-creator-username">{user.username}</span>
                          <span className="story-topic-badge">{hl.title}</span>
                          <button 
                            className="story-viewer-close-btn"
                            onClick={() => setSelectedHighlight(null)}
                          >
                            &times;
                          </button>
                        </div>

                        <div className="story-viewer-image-pane">
                          <img src={currentStory.img} alt={currentStory.caption} className="story-viewer-img" />
                          <div className="story-viewer-caption-badge">
                            {currentStory.caption}
                          </div>
                        </div>

                        {hl.stories.length > 1 && (
                          <>
                            <button 
                              className="story-nav-btn prev"
                              onClick={() => setActiveStoryIdx(prev => (prev - 1 + hl.stories.length) % hl.stories.length)}
                            >
                              &#10094;
                            </button>
                            <button 
                              className="story-nav-btn next"
                              onClick={() => setActiveStoryIdx(prev => (prev + 1) % hl.stories.length)}
                            >
                              &#10095;
                            </button>
                          </>
                        )}

                      </div>
                    </div>
                  );
                })()}

                {/* --- MODAL 2: DETAIL ACHIEVEMENT MILESTONE SUCCESS BADGE CARD --- */}
                {selectedMilestone && (
                  <div className="milestone-badge-modal-overlay" onClick={() => setSelectedMilestone(null)}>
                    <div 
                      className="milestone-badge-modal-card"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button className="milestone-modal-close-x" onClick={() => setSelectedMilestone(null)}>
                        &times;
                      </button>

                      <div 
                        className={`milestone-modal-badge-sphere ${selectedMilestone.unlocked ? 'glow' : 'locked'}`}
                        style={{ background: selectedMilestone.badgeColor }}
                      >
                        {renderMilestoneIcon(selectedMilestone.id, 34)}
                      </div>

                      <div className="milestone-modal-card-details">
                        <span className="milestone-modal-badge-status">
                          {selectedMilestone.unlocked ? 'ACHIEVEMENT UNLOCKED' : 'ACHIEVEMENT LOCKED'}
                        </span>
                        <h3 className="milestone-modal-card-title">{selectedMilestone.title}</h3>
                        <p className="milestone-modal-card-desc">{selectedMilestone.desc}</p>
                        
                        {selectedMilestone.unlocked ? (
                          <div className="milestone-modal-status-badge success">
                            <span style={{ fontSize: '13px', fontWeight: 700 }}>Unearned: +{selectedMilestone.points} EXP</span>
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>Completed on {selectedMilestone.date}</span>
                          </div>
                        ) : (
                          <div className="milestone-modal-status-badge locked">
                            <span style={{ fontSize: '13px', fontWeight: 700 }}>EXP Reward: {selectedMilestone.points} EXP</span>
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>Progress: {selectedMilestone.progress || '0%'} Completed</span>
                          </div>
                        )}

                        <div className="milestone-modal-actions-row">
                          <button 
                            className="milestone-modal-action-btn-main"
                            onClick={() => {
                              if (selectedMilestone.unlocked) {
                                alert(`Shared achievement: Unlocked ${selectedMilestone.title}!`);
                              } else {
                                alert(`Start travelling to unlock this badge!`);
                              }
                            }}
                          >
                            {selectedMilestone.unlocked ? 'Share Achievement' : 'Conquer Milestone'}
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

        </div>

        {/* MOBILE ONLY: Bottom Tab Navigation footer bar */}
        <footer className="mobile-bottom-tabs">
          <button className={`social-tab-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => { setActiveTab('home'); setShowSearchDrawer(false); setShowNotificationsDrawer(false); }}>
            <svg width="24" height="24" fill={activeTab === 'home' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
          
          <button className={`social-tab-item ${(activeTab === 'search' && !showSearchDrawer) || showSearchDrawer ? 'active' : ''}`} onClick={() => { setActiveTab('search'); setShowSearchDrawer(false); setShowNotificationsDrawer(false); }}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          <button className={`social-tab-item ${activeTab === 'create' ? 'active' : ''}`} onClick={() => { setActiveTab('create'); setShowSearchDrawer(false); setShowNotificationsDrawer(false); }}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>

          <button className={`social-tab-item ${activeTab === 'reels' ? 'active' : ''}`} onClick={() => { setActiveTab('reels'); setShowSearchDrawer(false); setShowNotificationsDrawer(false); }}>
            <svg width="24" height="24" fill={activeTab === 'reels' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          <button className={`social-tab-item ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => { setActiveTab('messages'); setShowSearchDrawer(false); setShowNotificationsDrawer(false); }}>
            <svg width="24" height="24" fill={activeTab === 'messages' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        </footer>

        {/* --- PERSISTENT FLOATING AI CHATBOT BUBBLE --- */}
        <div 
          className="ai-chatbot-floating-bubble" 
          style={{ 
            zIndex: 101,
            bottom: isMiniInboxOpen ? '500px' : '80px',
            transition: 'bottom 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }} 
          onClick={() => setAiChatOpen(!aiChatOpen)}
        >
          <img src="/ai-guide.png" alt="AI" style={{ width: '28px', height: '28px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
        </div>

        {/* AI Chat drawer pane */}
        {aiChatOpen && (
          <div 
            className="ai-chatbot-panel" 
            style={{ 
              zIndex: 102,
              bottom: isMiniInboxOpen ? '570px' : '150px',
              transition: 'bottom 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          >
            <div className="ai-chatbot-header">
              <span className="ai-chatbot-title">
                <img src="/ai-guide.png" alt="AI Guide" style={{ width: '20px', height: '20px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                Travora AI Planner
              </span>
              <button className="ai-chatbot-close" onClick={() => setAiChatOpen(false)}>×</button>
            </div>
            
            <div className="ai-chatbot-messages">
              {aiChatMessages.map((msg, idx) => (
                <div key={idx} className={`ai-chat-bubble ${msg.sender === 'ai' ? 'ai' : 'user'}`}>
                  {msg.text.split('\n').map((line, lineIdx) => {
                    if (line.startsWith('**') || line.startsWith('-')) {
                      return <div key={lineIdx} style={{ margin: '4px 0', fontWeight: line.startsWith('**') ? 'bold' : 'normal' }}>{line.replace(/\*\*/g, '')}</div>;
                    }
                    return <p key={lineIdx} style={{ margin: '2px 0' }}>{line}</p>;
                  })}
                </div>
              ))}
              {aiTyping && (
                <div className="ai-chat-bubble ai" style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                  Typing suggestions...
                </div>
              )}
            </div>

            <form className="ai-chatbot-input-bar" onSubmit={handleSendAiMessage}>
              <input 
                type="text" 
                className="ai-chatbot-input" 
                placeholder="Ask about itineraries, Bali, Manali..."
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
              />
              <button type="submit" className="ai-chatbot-send-btn" aria-label="Send query">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </form>
          </div>
        )}

        {/* --- FLOATING MESSAGES TRAY --- */}
        {user && (
          <div className="floating-messages-tray-container">
            {!isMiniInboxOpen ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Floating Notification Bell Button */}
                <div 
                  className={`floating-notifications-pill spring-active ${showBellNotifications ? 'active' : ''}`}
                  onClick={() => setShowBellNotifications(!showBellNotifications)}
                >
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    {unreadNotifications > 0 && (
                      <span className="notifications-pill-badge">{unreadNotifications}</span>
                    )}
                  </div>
                </div>

                {/* Floating Notifications Dropdown Panel */}
                {showBellNotifications && (
                  <div className="floating-notifications-panel discover-premium-card animate-slide-up" style={{ zIndex: 120 }}>
                    <div className="notifications-panel-header">
                      <span>Notifications</span>
                      <button className="notifications-close-btn" onClick={() => setShowBellNotifications(false)}>&times;</button>
                    </div>
                    <div className="notifications-panel-list">
                      {notifications.map((notif) => (
                        <div key={notif.id} className="notification-panel-item" onClick={() => { setShowBellNotifications(false); showToast(`Viewing @${notif.username}'s action`); }}>
                          <span className="notification-avatar">
                            {notif.avatar.startsWith('http') || notif.avatar.startsWith('https') ? (
                              <img src={notif.avatar} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                              notif.avatar
                            )}
                          </span>
                          <div className="notification-content">
                            <span className="notification-username">@{notif.username}</span> {notif.text}
                            <span className="notification-time">{notif.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Messages Pill */}
                <div className="floating-messages-pill spring-active" onClick={() => setIsMiniInboxOpen(true)}>
                  <div className="floating-messages-pill-left">
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(-15deg)' }}>
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                      <span className="messages-pill-badge">2</span>
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '14px', marginLeft: '8px' }}>Messages</span>
                  </div>
                  <div className="floating-messages-pill-avatars">
                    <div className="floating-messages-pill-avatar-item">
                      {renderAvatar('backpacker_sam', 24)}
                    </div>
                    <div className="floating-messages-pill-avatar-item">
                      {renderAvatar('wanderlust_jenny', 24)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`floating-messages-drawer ${isExpandingFullscreen ? 'expanding-fullscreen' : ''}`}>
                {/* Header */}
                <div className="floating-messages-drawer-header">
                  <div className="drawer-header-left">
                    {miniSlideActive && (
                      <button 
                        className="drawer-header-back-btn" 
                        onClick={() => {
                          setMiniSlideActive(false);
                          setTimeout(() => {
                            setMiniActiveChatBuddy(null);
                          }, 350);
                        }} 
                        aria-label="Back to chats"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="15 18 9 12 15 6" />
                        </svg>
                      </button>
                    )}
                    <span className="drawer-chat-username" style={{ fontSize: '15px', fontWeight: 800 }}>
                      {miniSlideActive && miniActiveChatBuddy ? `@${miniActiveChatBuddy}` : 'Messages'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {!miniSlideActive && (
                      <button 
                        className="drawer-header-btn" 
                        onClick={() => {
                          setIsExpandingFullscreen(true);
                          setTimeout(() => {
                            setActiveTab('messages');
                            setIsMiniInboxOpen(false);
                            setIsExpandingFullscreen(false);
                          }, 450);
                        }}
                        title="Open full page"
                        aria-label="Expand to full screen"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="15 3 21 3 21 9" />
                          <polyline points="9 21 3 21 3 15" />
                          <line x1="21" y1="3" x2="14" y2="10" />
                          <line x1="3" y1="21" x2="10" y2="14" />
                        </svg>
                      </button>
                    )}
                    <button 
                      className="drawer-header-btn" 
                      onClick={() => { 
                        setIsMiniInboxOpen(false); 
                        setMiniSlideActive(false);
                        setMiniActiveChatBuddy(null); 
                      }} 
                      title="Minimize messages"
                      aria-label="Minimize messages"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Main Body with Sliding Track */}
                <div className="drawer-sliding-track-wrapper">
                  <div 
                    className="drawer-sliding-track"
                    style={{ 
                      transform: miniSlideActive ? 'translateX(-50%)' : 'translateX(0%)' 
                    }}
                  >
                    {/* PANEL 1: Chat List */}
                    <div className="drawer-sliding-panel panel-list">
                      {/* Search inside tray */}
                      <div className="drawer-search-wrapper">
                        <input 
                          type="text" 
                          placeholder="Search chats..." 
                          className="drawer-search-input"
                          value={miniSearchQuery}
                          onChange={(e) => setMiniSearchQuery(e.target.value)}
                        />
                      </div>
                      {/* Chat Buddies List */}
                      <div className="drawer-chats-list">
                        {Object.keys(conversations)
                          .filter(buddy => buddy.toLowerCase().includes(miniSearchQuery.toLowerCase()))
                          .map((buddy) => {
                            const chatMsgs = conversations[buddy] || [];
                            const lastMsg = chatMsgs[chatMsgs.length - 1];
                            const lastMsgText = lastMsg ? (lastMsg.sender === 'me' ? `You: ${lastMsg.text}` : lastMsg.text) : 'No messages yet';
                            return (
                              <div 
                                key={buddy} 
                                className="drawer-chat-item" 
                                onClick={() => {
                                  setMiniActiveChatBuddy(buddy);
                                  setMiniSlideActive(true);
                                }}
                              >
                                {renderAvatar(buddy, 36)}
                                <div className="drawer-chat-info">
                                  <span className="drawer-chat-username" style={{ fontWeight: 600, fontSize: '13px' }}>{buddy}</span>
                                  <span className="drawer-chat-lastmsg">{lastMsgText}</span>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {/* PANEL 2: Active Chat Conversation */}
                    <div className="drawer-sliding-panel panel-chat">
                      {miniActiveChatBuddy ? (
                        <>
                          {/* Message Bubble List */}
                          <div className="drawer-chat-messages" ref={(el) => { if (el) el.scrollTop = el.scrollHeight; }}>
                            {(conversations[miniActiveChatBuddy] || []).map((msg, mIdx) => (
                              <div key={mIdx} className={`drawer-msg-bubble ${msg.sender === 'me' ? 'me' : 'them'}`}>
                                {msg.text}
                              </div>
                            ))}
                          </div>
                          {/* Input Area */}
                          <form className="drawer-chat-input-area" onSubmit={handleSendMiniMessage}>
                            <input 
                              type="text" 
                              placeholder="Message..." 
                              className="drawer-chat-input-field"
                              value={miniChatInput}
                              onChange={(e) => setMiniChatInput(e.target.value)}
                            />
                            <button type="submit" className="drawer-chat-send-btn" disabled={!miniChatInput.trim()}>
                              Send
                            </button>
                          </form>
                        </>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '13px' }}>
                          Select a conversation
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- FULLSCREEN STORY VIEWER MODAL OVERLAY --- */}
        {showStoryViewer && activeImageStories[activeStoryIndex] && (
          <div className="story-viewer-overlay" style={{ zIndex: 200 }}>
            <div className="story-viewer-container">
              <div className="story-progress-bar-row">
                {activeImageStories.map((_, barIdx) => (
                  <div key={barIdx} className="story-progress-bar-bg">
                    <div 
                      className="story-progress-bar-fill" 
                      style={{ width: barIdx === activeStoryIndex ? `${storyProgress}%` : barIdx < activeStoryIndex ? '100%' : '0%' }} 
                    />
                  </div>
                ))}
              </div>

              <div className="story-viewer-header">
                <div className="story-viewer-user">
                  <div className="story-viewer-avatar">{activeImageStories[activeStoryIndex].avatar}</div>
                  <div>
                    <div className="story-viewer-name">{activeImageStories[activeStoryIndex].username}</div>
                    <span className="story-viewer-time">Travel Buddy</span>
                  </div>
                </div>
                <button className="story-viewer-close" onClick={() => setShowStoryViewer(false)}>×</button>
              </div>

              <div className="story-viewer-body">
                {activeStoryIndex > 0 && (
                  <button className="story-viewer-nav prev" onClick={(e) => { e.stopPropagation(); setActiveStoryIndex(prev => prev - 1); }}>◀</button>
                )}
                <img src={activeImageStories[activeStoryIndex].image} alt="Story content" className="story-viewer-img" />
                <div className="story-viewer-caption">{activeImageStories[activeStoryIndex].caption}</div>
                {activeStoryIndex < activeImageStories.length - 1 && (
                  <button className="story-viewer-nav next" onClick={(e) => { e.stopPropagation(); setActiveStoryIndex(prev => prev + 1); }}>▶</button>
                )}
              </div>

            </div>
          </div>
        )}

        {/* --- GLOBAL TOAST SYSTEM --- */}
        <div className="toast-notifications-container">
          {toasts.map((t) => (
            <div key={t.id} className="custom-toast-notification discover-premium-card animate-slide-up">
              <span className="toast-icon">✨</span>
              <span className="toast-message">{t.message}</span>
            </div>
          ))}
        </div>

      </div>
     </>
    );
  }

  return (
    <>
      {showSplash && (
        <div className={`splash-container ${fadeClass}`}>
          <div className="splash-logo-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Logo theme={theme} width={130} showText={true} />
            <div className="splash-progress-bar">
              <div className="splash-progress-line" />
            </div>
          </div>
        </div>
      )}
      <div className="split-screen-container">
        {/* Ambient Background Glow Blobs */}
        <div className="bg-glow-container">
          <div className="bg-blob bg-blob-1" />
          <div className="bg-blob bg-blob-2" />
          <div className="bg-blob bg-blob-3" />
        </div>

      {/* --- LEFT PANEL: Branding & Visual Showcase --- */}
      <div className="left-pane">
        <Logo theme={theme} width={120} />
        <h2 className="left-brand-text">
          See everyday moments from your <span className="gradient-text">travel buddies</span>.
        </h2>
        <p className="left-brand-sub">
          The unified travel network connecting vloggers, explorers, hotels, and agencies.
        </p>

        {/* CSS-based overlapping phone screen cards stack */}
        <div className="cards-stack-container">
          {/* Phone Card 1: Traveller Hike */}
          <div className="phone-card phone-card-1">
            <div className="phone-card-header">
              <div className="phone-avatar" style={{ background: '#f4a261' }} />
              <span className="phone-username">wander_sam</span>
            </div>
            <div className="phone-image-body" style={{ background: 'linear-gradient(to bottom, #2a9d8f, #e76f51)' }}>
              <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.5)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '7px', fontWeight: 600 }}>
                🏔️ Manali peaks
              </div>
            </div>
            <div className="phone-card-footer">
              <span className="phone-actions">❤️ 💬 🚀</span>
              <span className="phone-caption">First summit! 🌄 #wanderlust</span>
            </div>
          </div>

          {/* Phone Card 2: Hotel/Stay Provider */}
          <div className="phone-card phone-card-2">
            <div className="phone-card-header">
              <div className="phone-avatar" style={{ background: '#e76f51' }} />
              <span className="phone-username">villa_goa</span>
            </div>
            <div className="phone-image-body" style={{ background: 'linear-gradient(to bottom, #1d3557, #457b9d)' }}>
              <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.5)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '7px', fontWeight: 600 }}>
                🌴 Luxury Stays
              </div>
            </div>
            <div className="phone-card-footer">
              <span className="phone-actions">❤️ 💬 🚀</span>
              <span className="phone-caption">Book private villas direct! 🌊</span>
            </div>
          </div>

          {/* Phone Card 3: Vlogger Stream */}
          <div className="phone-card phone-card-3">
            <div className="phone-card-header">
              <div className="phone-avatar" style={{ background: '#2a9d8f' }} />
              <span className="phone-username">nomad_vlogs</span>
            </div>
            <div className="phone-image-body" style={{ background: 'linear-gradient(to bottom, #833ab4, #fd1d1d, #fcb045)' }}>
              <div style={{ position: 'absolute', top: '8px', right: '8px', background: '#ef4444', color: 'white', padding: '2px 5px', borderRadius: '3px', fontSize: '7px', fontWeight: 800 }}>
                LIVE
              </div>
            </div>
            <div className="phone-card-footer">
              <span className="phone-actions">❤️ 💬 🚀</span>
              <span className="phone-caption">Exploring hidden waterfalls... 💦</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- RIGHT PANEL: Interactive Form & Context --- */}
      <div className="right-pane">

        {/* Top-Right Header Actions */}
        <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', gap: '12px', zIndex: 50 }}>
          {user && (
            <button
              onClick={logout}
              className="theme-toggle-btn"
              style={{ position: 'static' }}
              aria-label="Log Out"
              title="Log Out"
            >
              {/* Door Exit Logout Icon */}
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 13v-2H10V9l-5 3 5 3v-2h6zM20 3H9c-1.1 0-2 .9-2 2v4h2V5h11v14H9v-4H7v4c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
              </svg>
            </button>
          )}
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            style={{ position: 'static' }}
            aria-label="Toggle dark/light mode"
            id="theme-toggle-btn"
          >
            {theme === 'light' ? (
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.3 22h-.1c-5.5 0-10-4.5-10-10 0-4.8 3.5-8.9 8.2-9.7.5-.1 1 .2 1.2.7.2.5.1 1.1-.3 1.4-2.8 2.2-4.2 5.7-3.6 9.3.8 4.4 4.5 7.8 9 8.1 2.3.1 4.5-.6 6.2-2 .4-.3.9-.3 1.3-.1.4.3.6.8.5 1.3-.8 4.7-4.9 8-9.7 8.3z" />
              </svg>
            ) : (
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 7c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0-5c.6 0 1 .4 1 1v2c0 .6-.4 1-1 1s-1-.4-1-1V3c0-.6.4-1 1-1zm0 14c.6 0 1 .4 1 1v2c0 .6-.4 1-1 1s-1-.4-1-1v-2c0-.6.4-1 1-1zM4 12c0-.6.4-1 1-1h2c.6 0 1 .4 1 1s-.4 1-1 1H5c-.6 0-1-.4-1-1zm14 0c0-.6.4-1 1-1h2c.6 0 1 .4 1 1s-.4 1-1 1h-2c-.6 0-1-.4-1-1zM5.2 6.6c.4-.4 1-.4 1.4 0l1.4 1.4c.4.4.4 1 0 1.4s-1 .4-1.4 0L5.2 8c-.4-.4-.4-1 0-1.4zm10.6 10.6c.4-.4 1-.4 1.4 0l1.4 1.4c.4.4.4 1 0 1.4s-1 .4-1.4 0l-1.4-1.4c-.4-.4-.4-1 0-1.4zm0-10.6c.4.4.4 1 0 1.4l-1.4 1.4c-.4.4-1 .4-1.4 0s-.4-1 0-1.4l1.4-1.4c.4-.4 1-.4 1.4 0zM7.2 16.2c.4.4.4 1 0 1.4l-1.4 1.4c-.4.4-1 .4-1.4 0s-.4-1 0-1.4l1.4-1.4c.4-.4 1-.4 1.4 0z" />
              </svg>
            )}
          </button>
        </div>



        {/* --- Form Context Inner Wrapper --- */}
        <div className={`form-inner-wrapper ${(contentVisible || user) ? 'visible' : ''}`}>

          {/* Logo Header (re-appears at top of form) */}
          <div className="logo-header">
            <Logo theme={theme} width={90} />
          </div>

            {/* --- Sign In / Sign Up Forms View --- */}
            <div style={{ width: '100%' }}>

              {/* Form Feedback */}
              {errorMsg && <div className="status-msg error">{errorMsg}</div>}
              {successMsg && <div className="status-msg success">{successMsg}</div>}

              {formMode === 'login' ? (
                /* --- LOG IN VIEW --- */
                <form onSubmit={handleSubmit}>
                  <h2 className="form-title" style={{ display: 'none' }}>Log into Travora</h2>
                  <p className="form-subtitle" style={{ display: 'none' }}>Log in to see photos and videos from your travel buddies.</p>

                  <div className="form-group">
                    <div className="form-input-container">
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Mobile number, username or email"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="form-input-container">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-input"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle-icon"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'Logging in...' : 'Log in'}
                  </button>

                  <a className="text-link-center" href="#forgot" onClick={(e) => { e.preventDefault(); setShowForgotModal(true); }}>
                    Forgot password?
                  </a>

                  <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', width: '100%' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--input-border)' }}></div>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', margin: '0 18px', textTransform: 'uppercase' }}>or</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--input-border)' }}></div>
                  </div>

                  {/* Switch to SignUp Outline Button */}
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => {
                      setFormMode('signup');
                      setErrorMsg('');
                      setSuccessMsg('');
                      setPassword(''); // Clear shared password state
                    }}
                  >
                    Create new account
                  </button>
                </form>
              ) : (
                /* --- SIGN UP VIEW --- */
                <form onSubmit={handleSubmit}>
                  <h2 className="form-title" style={{ textAlign: 'left', marginBottom: '4px' }}>Get started on Travora</h2>
                  <p className="form-subtitle" style={{ textAlign: 'left', marginBottom: '24px' }}>Sign up to see photos and videos from your friends.</p>

                  {/* Traveller vs Venture Sub-tabs */}
                  <div className="tabs-container" style={{ marginBottom: '16px' }}>
                    <button
                      type="button"
                      className={`tab-btn ${userRole === 'traveller' ? 'active' : ''}`}
                      onClick={() => { setUserRole('traveller'); setErrorMsg(''); }}
                    >
                      Traveller
                    </button>
                    <button
                      type="button"
                      className={`tab-btn ${userRole === 'business' ? 'active' : ''}`}
                      onClick={() => { setUserRole('business'); setErrorMsg(''); }}
                    >
                      Ventures
                    </button>
                  </div>

                  {/* 1. Email and Phone */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <div className="form-input-container">
                        <input
                          type="email"
                          name="signup-email-new"
                          className="form-input"
                          placeholder="Email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          autoComplete="off"
                        />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <div className="form-input-container">
                        <input
                          type="tel"
                          name="signup-phone-new"
                          className="form-input"
                          placeholder="Phone number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                          pattern="\d{10}"
                          title="10-digit phone number"
                          autoComplete="off"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Honeypots to trap browser autofill */}
                  <div style={{ position: 'absolute', opacity: 0, zIndex: -1, pointerEvents: 'none' }} aria-hidden="true">
                    <input type="text" name="fake-email" tabIndex={-1} autoComplete="username" />
                    <input type="password" name="fake-password" tabIndex={-1} autoComplete="current-password" />
                  </div>

                  {/* 2. Password with visibility toggle */}
                  <div className="form-group">
                    <div className="form-input-container">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="signup-new-secure-password"
                        className="form-input"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="password-toggle-icon"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <PasswordChecklist pwd={password} />
                  </div>

                  {/* 3. Birthday */}
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Birthday</label>
                    <div className="birthday-grid">
                      <select className="form-input" value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)} style={{ padding: '12px 10px' }}>
                        <option disabled>Month</option>
                        {months.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <select className="form-input" value={birthDay} onChange={(e) => setBirthDay(e.target.value)} style={{ padding: '12px 10px' }}>
                        <option disabled>Day</option>
                        {days.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <select className="form-input" value={birthYear} onChange={(e) => setBirthYear(e.target.value)} style={{ padding: '12px 10px' }}>
                        <option disabled>Year</option>
                        {years.map((y) => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* 4. Full Name */}
                  <div className="form-group">
                    <div className="form-input-container">
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* 5. Username */}
                  <div className="form-group">
                    <div className="form-input-container">
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Traveller Onboard Fields */}
                  {userRole === 'traveller' ? (
                    <div className="toggle-group">
                      <div>
                        <span className="toggle-title">Join as a Travel Vlogger</span>
                        <span className="toggle-desc" style={{ display: 'block' }}>Share journeys as a vlogger.</span>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={isVlogger}
                          onChange={(e) => setIsVlogger(e.target.checked)}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                  ) : (
                    /* Ventures Onboard Fields */
                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div className="form-group">
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Venture Name (Agency/Stay)"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          required
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '10px' }}>
                        <select
                          className="form-input"
                          value={businessType}
                          onChange={(e: any) => setBusinessType(e.target.value)}
                          style={{ padding: '12px 10px' }}
                        >
                          <option value="agency">Agency / Tour</option>
                          <option value="hotel">Hotel / Stay</option>
                        </select>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="License No."
                          value={registrationNumber}
                          onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                          required
                          pattern="^[A-Z0-9]{8,15}$"
                          title="Must be 8-15 uppercase letters or numbers"
                          autoComplete="off"
                        />
                      </div>

                      <div className="form-group">
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Venture Street Address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <input
                          type="url"
                          className="form-input"
                          placeholder="Website URL (Optional)"
                          value={websiteUrl}
                          onChange={(e) => setWebsiteUrl(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'Creating account...' : 'Submit'}
                  </button>

                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => {
                      setFormMode('login');
                      setErrorMsg('');
                      setSuccessMsg('');
                      setPassword(''); // Clear shared password state
                    }}
                  >
                    I already have an account
                  </button>
                </form>
              )}

              {/* Page Footer Navigation Links */}
              <div className="page-footer">
                <div className="footer-nav">
                  <a className="footer-nav-link" href="#about">About</a>
                  <a className="footer-nav-link" href="#blog">Blog</a>
                  <a className="footer-nav-link" href="#jobs">Jobs</a>
                  <a className="footer-nav-link" href="#help">Help</a>
                  <a className="footer-nav-link" href="#api">API</a>
                  <a className="footer-nav-link" href="#privacy">Privacy</a>
                  <a className="footer-nav-link" href="#terms">Terms</a>
                  <a className="footer-nav-link" href="#locations">Locations</a>
                </div>
                <div className="footer-copy">
                  © 2026 Travora
                </div>
              </div>

            </div>

        </div>

      </div>

      {/* --- FORGOT PASSWORD MODAL --- */}
      {showForgotModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Reset Password</h3>
              <button onClick={() => setShowForgotModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
            </div>

            {forgotError && <div className="status-msg error">{forgotError}</div>}
            {forgotSuccess && <div className="status-msg success">{forgotSuccess}</div>}

            {forgotStep === 1 && (
              <form onSubmit={handleForgotStep1}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Enter your email or phone number and we'll send you a link to get back into your account.</p>
                <div className="form-group">
                  <input type="text" className="form-input" placeholder="Email or Phone Number" value={forgotIdentifier} onChange={(e) => setForgotIdentifier(e.target.value)} required />
                </div>
                <button type="submit" className="btn-primary" disabled={forgotLoading}>
                  {forgotLoading ? 'Sending...' : 'Send OTP'}
                </button>
              </form>
            )}

            {forgotStep === 2 && (
              <form onSubmit={handleForgotStep2}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Enter the 6-digit OTP sent to your device.</p>
                <div className="form-group">
                  <input type="text" className="form-input" placeholder="Enter OTP" value={forgotOtp} onChange={(e) => setForgotOtp(e.target.value)} required maxLength={6} style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '20px', fontWeight: 600 }} />
                </div>
                <button type="submit" className="btn-primary" disabled={forgotLoading}>
                  {forgotLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </form>
            )}

            {forgotStep === 3 && (
              <form onSubmit={handleForgotStep3}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Enter your new password.</p>
                <div className="form-group">
                  <input type="password" className="form-input" placeholder="New Password" value={forgotNewPassword} onChange={(e) => setForgotNewPassword(e.target.value)} required minLength={8} />
                  <PasswordChecklist pwd={forgotNewPassword} />
                </div>
                <div className="form-group">
                  <input type="password" className="form-input" placeholder="Confirm Password" value={forgotConfirmPassword} onChange={(e) => setForgotConfirmPassword(e.target.value)} required minLength={8} />
                </div>
                <button type="submit" className="btn-primary" disabled={forgotLoading}>
                  {forgotLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
   </>
  );
}
