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
      avatar: '🏃‍♂️',
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
      avatar: '👩‍🌾',
      location: 'Seminyak, Bali 🌊',
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
      avatar: '📹',
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
      avatar: '🎒',
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
      avatar: '👩‍🌾',
      location: 'Ubud, Bali 🌴',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop&q=80',
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
      avatar: '🧗‍♂️',
      location: 'Solang Valley, Manali 🏔️',
      image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&auto=format&fit=crop&q=80',
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
      avatar: '🏨',
      location: 'Seminyak, Goa 🌊',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
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
    { id: 'story-1', username: 'Your Story', avatar: '👋', image: '', caption: '', viewed: false, isLive: false },
    { id: 'story-2', username: 'nomad_vlogs', avatar: '🎥', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80', caption: 'LIVE STREAM: Hidden Waterfalls Trek! 💦🎥', viewed: false, isLive: true },
    { id: 'story-3', username: 'backpacker_sam', avatar: '🧗‍♂️', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80', caption: 'Campfire talks in the freezing cold! 🪵🔥', viewed: false, isLive: false },
    { id: 'story-4', username: 'wanderlust_jenny', avatar: '👩‍🌾', image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&auto=format&fit=crop&q=80', caption: 'Scooter rides through Bali rice fields! 🛵🌾', viewed: false, isLive: false },
    { id: 'story-5', username: 'nomad_alex', avatar: '🏃‍♂️', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop&q=80', caption: 'Fresh croissants in Paris! 🥐🇫🇷', viewed: false, isLive: false }
  ]);

  // Active story viewing states
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [storyProgress, setStoryProgress] = useState(0);

  // Notifications State
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 'n1', username: 'backpacker_sam', avatar: '🧗‍♂️', type: 'like', text: 'liked your post.', time: '2m ago' },
    { id: 'n2', username: 'wanderlust_jenny', avatar: '👩‍🌾', type: 'comment', text: 'commented: "Stunning shot!"', time: '15m ago' },
    { id: 'n3', username: 'nomad_alex', avatar: '🏃‍♂️', type: 'follow', text: 'started following you.', time: '1h ago' }
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

  // Reels list data
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

    const newPost = {
      id: `post-${Date.now()}`,
      username: user?.username || 'me',
      avatar: '🌟',
      location: newPostLocation.trim() || 'Travel Heaven 📍',
      image: creatorPresets[selectedPresetImageIndex],
      caption: newPostCaption.trim(),
      hashtags: ['#travora', '#explore', '#wanderlust'],
      likesCount: 0,
      comments: []
    };

    setPosts((prev) => [newPost, ...prev]);
    setNewPostCaption('');
    setNewPostLocation('');
    setActiveTab('home');
  };

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
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
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
                            <div className="story-avatar">{story.avatar}</div>
                            {story.id === 'story-1' && <div className="user-add-story-badge">+</div>}
                          </div>
                          <span className="story-username">{story.username}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Posts feed */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {posts.map((post) => {
                      const isLiked = likedPosts.has(post.id);
                      const isSaved = savedPosts.has(post.id);
                      const commentsOpen = expandedComments[post.id];

                      return (
                        <article key={post.id} className="post-card">
                          
                          {/* Post Header */}
                          <div className="post-card-header">
                            <div className="post-card-user-info">
                              <div className="post-card-avatar">{post.avatar}</div>
                              <div>
                                <span className="post-card-username">{post.username}</span>
                                <span className="post-card-location">📍 {post.location}</span>
                              </div>
                            </div>
                            <button className="post-action-btn" style={{ color: 'var(--text-muted)' }}>•••</button>
                          </div>

                          {/* Post Media */}
                          <div className="post-card-media-container" onDoubleClick={() => toggleLike(post.id)}>
                            <img src={post.image} alt="post" className="post-card-img" />
                          </div>

                          {/* Post Actions */}
                          <div className="post-card-actions">
                            <div className="post-card-left-actions">
                              <button className={`post-action-btn-with-count ${isLiked ? 'liked' : ''}`} onClick={() => toggleLike(post.id)}>
                                <svg width="22" height="22" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <span className="post-action-count">{formatCount(post.likesCount)}</span>
                              </button>
                              
                              <button className="post-action-btn-with-count" onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !commentsOpen }))}>
                                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                                </svg>
                                <span className="post-action-count">{post.comments.length}</span>
                              </button>

                              <button className="post-action-btn-with-count" onClick={() => alert('Post shared!')}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="22" y1="2" x2="11" y2="13" />
                                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                </svg>
                              </button>
                            </div>
                            <button className={`post-action-btn ${isSaved ? 'saved' : ''}`} onClick={() => toggleSave(post.id)}>
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
                                <button className="comment-submit-btn" onClick={() => handleAddComment(post.id)}>Post</button>
                              </div>
                            </div>
                          )}

                        </article>
                      );
                    })}
                  </div>

                </div>

                {/* Right side Suggestions Column */}
                <div className="instagram-feed-right-column">
                  
                  {/* Current User Card */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 800 }}>
                      {user.fullName.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '13px' }}>{user.username}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.fullName}</div>
                    </div>
                    <button className="suggested-profile-switch-btn" onClick={() => setActiveTab('profile')}>Switch</button>
                  </div>

                  {/* Suggestions Header */}
                  <div className="instagram-suggested-header">
                    <span>Suggested for you</span>
                    <button style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer' }} onClick={() => alert('Suggested based on local buddies activity!')}>See all</button>
                  </div>

                  {/* Suggested list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    
                    <div className="instagram-suggested-user-row">
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f4a261', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>👩‍🌾</div>
                      <div className="instagram-suggested-user-info">
                        <span className="instagram-suggested-username">wanderlust_jenny</span>
                        <span className="instagram-suggested-relationship">Suggested for you</span>
                      </div>
                      <button className="follow-btn" onClick={() => alert('Jenny added to your network!')}>Follow</button>
                    </div>

                    <div className="instagram-suggested-user-row">
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#2a9d8f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>🧗‍♂️</div>
                      <div className="instagram-suggested-user-info">
                        <span className="instagram-suggested-username">backpacker_sam</span>
                        <span className="instagram-suggested-relationship">Followed by nomad_vlogs + 2 others</span>
                      </div>
                      <button className="follow-btn" onClick={() => alert('Sam added to your network!')}>Follow</button>
                    </div>

                    <div className="instagram-suggested-user-row">
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e76f51', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>🏨</div>
                      <div className="instagram-suggested-user-info">
                        <span className="instagram-suggested-username">stay_luxury_bali</span>
                        <span className="instagram-suggested-relationship">Suggested Stay partner</span>
                      </div>
                      <button className="follow-btn" onClick={() => alert('Stay partner saved.')}>Follow</button>
                    </div>

                  </div>

                  {/* Vlogs Scrollable Feed Section */}
                  <div className="vlogs-section-header">
                    <span className="vlogs-section-title">Explore Travel Vlogs</span>
                    <span className="vlogs-section-badge">Live Feed</span>
                  </div>

                  <div className="vlogs-scroll-container">
                    {vlogs.map((vlog) => (
                      <div key={vlog.id} className="vlog-feed-card">
                        {/* Vlog Header */}
                        <div className="vlog-card-header">
                          <div className="vlog-user-info">
                            <span className="vlog-avatar">{vlog.avatar}</span>
                            <div className="vlog-user-details">
                              <span className="vlog-username">{vlog.username}</span>
                              <span className="vlog-location">📍 {vlog.location}</span>
                            </div>
                          </div>
                          <span className="vlog-duration-badge">{vlog.duration}</span>
                        </div>

                        {/* Vlog Thumbnail Media */}
                        <div className="vlog-media-container" onClick={() => alert(`Opening Full Screen Vlog Player for @${vlog.username}'s journey...`)}>
                          <img src={vlog.thumbnail} alt={vlog.title} className="vlog-img" />
                          <div className="vlog-play-overlay">
                            <div className="vlog-play-button">
                              <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Vlog Details */}
                        <div className="vlog-caption-section">
                          <p className="vlog-title-text">{vlog.title}</p>
                          <div className="vlog-metrics-row">
                            <span className="vlog-views">{vlog.views}</span>
                            <button 
                              className={`vlog-like-btn ${vlog.liked ? 'liked' : ''}`} 
                              onClick={() => toggleLikeVlog(vlog.id)}
                            >
                              {vlog.liked ? '❤️' : '🤍'} {vlog.likes}
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
              <div className="reels-desktop-layout">
                {reels.map((reel, rIdx) => {
                  if (rIdx !== activeReelIndex) return null;
                  return (
                    <React.Fragment key={reel.id}>
                      
                      {/* Immersive Vertical Card */}
                      <div className="reels-desktop-card" style={{ background: reel.imageGradient }}>
                        <div className="reel-gradient-overlay" />
                        
                        {/* Play Indicator */}
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid rgba(255,255,255,0.3)', pointerEvents: 'none' }}>
                          <svg width="20" height="20" fill="white" viewBox="0 0 24 24" style={{ marginLeft: '2px' }}>
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>

                        {/* Title Overlays */}
                        <div className="reel-bottom-details">
                          <div className="reel-user-row">
                            <div className="reel-user-avatar">{reel.avatar}</div>
                            <span className="reel-username">@{reel.username}</span>
                            <span style={{ background: '#ef4444', color: 'white', fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '3px', textTransform: 'uppercase' }}>VLOG</span>
                          </div>
                          <p className="reel-caption">{reel.caption}</p>
                          <div className="reel-soundtrack">
                            <span>🎵</span>
                            <span>{reel.soundtrack}</span>
                          </div>
                        </div>

                      </div>

                      {/* Actions Column (Floating right of card) */}
                      <div className="reels-desktop-actions-column">
                        
                        <button className="reels-action-circle-btn" onClick={() => alert('Liked Reel!')} title="Like">
                          ❤️
                        </button>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>{reel.likes}</span>

                        <button className="reels-action-circle-btn" onClick={() => alert('Comments drawer open')} title="Comment">
                          💬
                        </button>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>{reel.comments}</span>

                        <button className="reels-action-circle-btn" onClick={() => alert('Copied Reel link!')} title="Share">
                          🚀
                        </button>
                        
                        {/* Vinyl rotating icon */}
                        <div className="vinyl-disc-rotating" style={{ marginTop: '16px' }} />

                        {/* Up/Down Reel shift indicators */}
                        <button 
                          className="reels-nav-arrow" 
                          style={{ marginTop: '24px' }}
                          onClick={() => setActiveReelIndex(prev => (prev - 1 + reels.length) % reels.length)}
                          title="Previous Reel"
                        >
                          ▲
                        </button>
                        <button 
                          className="reels-nav-arrow" 
                          onClick={() => setActiveReelIndex(prev => (prev + 1) % reels.length)}
                          title="Next Reel"
                        >
                          ▼
                        </button>

                      </div>

                    </React.Fragment>
                  );
                })}
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
              <div className="instagram-explore-container">
                
                {/* Explore Search Header Row with Action Buttons */}
                <div className="explore-search-header-row">
                  <div className="instagram-explore-search-bar">
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
                        className="comment-input explore-search-field"
                        placeholder="Search explore destinations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px', marginLeft: '10px' }}
                      />
                    </div>
                  </div>

                  {/* Quick Action controls to the right of the Search Bar */}
                  <div className="explore-search-actions">
                    <button className="explore-action-btn" onClick={() => alert('Opening advanced travel filters...')} title="Advanced Filters">
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
                    <button className="explore-action-btn active" onClick={() => alert('Travora interactive Map coming soon!')} title="Map View">
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
                      >
                        <span className="explore-category-icon-svg">
                          {renderCategoryIcon(catName)}
                        </span>
                        <span className="explore-category-name">{catName}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hero Popular Destination Banner (Above grid) */}
                <div className="explore-popular-hero-card" onClick={() => setSearchQuery('Ubud')}>
                  <div className="explore-popular-hero-bg-wrapper">
                    <img 
                      src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80" 
                      alt="Popular Bali today" 
                      className="explore-popular-hero-bg"
                    />
                    <div className="explore-popular-hero-gradient-overlay" />
                  </div>
                  
                  <div className="explore-popular-hero-badge">
                    <span className="explore-badge-pulse" />
                    🔥 POPULAR DESTINATION OF TODAY
                  </div>
                  
                  <div className="explore-popular-hero-content-glass">
                    <div className="explore-popular-hero-text">
                      <h4 className="explore-popular-hero-title">Ubud, Bali 🌴</h4>
                      <p className="explore-popular-hero-desc">Experience the calming spiritual energy, lush green rice terraces, and beautiful waterfalls of Bali's cultural heart.</p>
                    </div>
                    <div className="explore-popular-hero-stats">
                      <div className="explore-hero-stat-item">
                        <span className="explore-hero-stat-label">DAILY VISITORS</span>
                        <span className="explore-hero-stat-value">12.5k posts</span>
                      </div>
                      <div className="explore-hero-stat-divider" />
                      <div className="explore-hero-stat-item">
                        <span className="explore-hero-stat-label">RATING</span>
                        <span className="explore-hero-stat-value">4.9 ★★★★★</span>
                      </div>
                      <button className="explore-hero-cta-btn">
                        Explore
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '24px 0 16px', fontFamily: 'var(--font-title)' }}>Trending Destinations</h3>
                
                {/* Premium Explore Grid */}
                <div className={`instagram-explore-grid ${isSwitchingCategory ? 'glass-switching' : ''} ${!hasEverSwitchedCategory ? 'no-animate' : ''}`}>
                  {travelDestinations
                    .filter(dest => {
                      const matchesSearch = dest.name.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesCategory = activeExploreCategory === 'All' || dest.category === activeExploreCategory;
                      return matchesSearch && matchesCategory;
                    })
                    .map((dest, idx) => (
                      <div 
                        key={idx} 
                        className="instagram-explore-item-card"
                        onClick={() => {
                          setSearchQuery(dest.name.split(',')[0]);
                        }}
                      >
                        <div className="explore-item-image-wrapper">
                          <img src={dest.img} alt={dest.name} className="explore-item-image" />
                          <div className="explore-item-gradient-overlay" />
                        </div>
                        
                        {/* Top Floating Badges */}
                        <div className="explore-item-floating-header">
                          <span className="explore-item-category-badge">{dest.category}</span>
                        </div>
                        
                        {/* Floating Info card at bottom */}
                        <div className="explore-item-footer-glass">
                          <div className="explore-item-info">
                            <span className="explore-item-name">{dest.name}</span>
                            <span className="explore-item-count">{dest.count}</span>
                          </div>
                          <div className="explore-item-stats">
                            <div className="explore-item-stat-pill" title="Likes">
                              <span>❤️</span> 120
                            </div>
                            <div className="explore-item-stat-pill" title="Comments">
                              <span>💬</span> {3 + (idx * 2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
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

              </div>
            )}

            {/* VIEW 5: CREATE POST */}
            {activeTab === 'create' && (
              <div className="create-post-container" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 24px' }}>
                <h2 className="form-title" style={{ textAlign: 'left', fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-title)' }}>Create Travel Post</h2>
                <p className="form-subtitle" style={{ textAlign: 'left', marginBottom: '24px' }}>Share your journeys and stories with the network.</p>

                <form onSubmit={handleCreatePost}>
                  {/* Preset picker */}
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 600 }}>Select Travel Photo</label>
                    <div style={{ height: '300px', borderRadius: '12px', overflow: 'hidden', background: '#cbd5e1', marginBottom: '10px' }}>
                      <img src={creatorPresets[selectedPresetImageIndex]} alt="Creator preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div className="create-preset-grid">
                      {creatorPresets.map((preset, idx) => (
                        <div 
                          key={idx}
                          className={`create-preset-item ${selectedPresetImageIndex === idx ? 'selected' : ''}`}
                          onClick={() => setSelectedPresetImageIndex(idx)}
                        >
                          <img src={preset} alt={`Preset ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '24px' }}>
                    <div className="form-input-container">
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Location tag (e.g. Ubud, Bali 🌴)" 
                        value={newPostLocation}
                        onChange={(e) => setNewPostLocation(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="form-input-container">
                      <textarea 
                        className="form-input" 
                        placeholder="Write a caption... (e.g. Scooter rides in Bali rice fields!)" 
                        style={{ minHeight: '100px', resize: 'vertical', paddingTop: '10px' }}
                        value={newPostCaption}
                        onChange={(e) => setNewPostCaption(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
                    Share Post
                  </button>
                </form>
              </div>
            )}

            {/* VIEW 6: INTEGRATED PROFILE PAGE */}
            {activeTab === 'profile' && (
              <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 24px' }}>
                <h2 className="form-title" style={{ textAlign: 'left', fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-title)' }}>My Profile & Settings</h2>
                <p className="form-subtitle" style={{ textAlign: 'left', marginBottom: '24px' }}>Manage your account settings and preferences.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Profile Header */}
                  <div style={{ textAlign: 'center', margin: '20px 0' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 800, margin: '0 auto 12px auto' }}>
                      {user.fullName.charAt(0)}
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: 800 }}>{user.fullName}</h3>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>@{user.username}</span>
                  </div>

                  <div style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '12px', padding: '14px 16px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', fontWeight: 600, textTransform: 'uppercase' }}>Email Address</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{user.email}</span>
                  </div>

                  <div style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '12px', padding: '14px 16px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', fontWeight: 600, textTransform: 'uppercase' }}>Account Role</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, textTransform: 'capitalize' }}>{user.role}</span>
                  </div>

                  {user.role === 'traveller' ? (
                    <div className="toggle-group" style={{ margin: '0' }}>
                      <div>
                        <span className="toggle-title">Vlogger Status</span>
                        <span className="toggle-desc" style={{ display: 'block' }}>Share journeys as a travel vlogger.</span>
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
                  ) : (
                    <div style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', fontWeight: 600, textTransform: 'uppercase' }}>Venture Name</span>
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>{user.businessProfile?.businessName || 'Business Stay'}</span>
                    </div>
                  )}

                  <button 
                    onClick={logout} 
                    className="btn-primary" 
                    style={{ background: 'var(--accent-red)', boxShadow: 'none', marginTop: '24px' }}
                  >
                    Sign Out Account
                  </button>

                </div>
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
              <div className="floating-messages-pill" onClick={() => setIsMiniInboxOpen(true)}>
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
