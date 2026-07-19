'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import TagPill from '@/components/shared/TagPill';
import RadioCard from '@/components/shared/RadioCard';
import ToggleSwitch from '@/components/shared/ToggleSwitch';
import ChartCard from '@/components/shared/ChartCard';
import Logo from '@/components/Logo';

// ----------------------------------------------------
// Mock Destination Database
// ----------------------------------------------------
interface DestinationData {
  fullName: string;
  visaStatus: string;
  visaDetails: string;
  visaUrl: string;
  visaTime: string;
  visaDocuments: string[];
  exchangeRate: string;
  exchangeAdvice: string;
  cardAcceptance: number; // Percentage Card (e.g. 70 means 70% Card, 30% Cash)
  flights: Array<{ id: string; airline: string; price: number; stops: string; duration: string }>;
  ventures: Array<{ id: string; name: string; price: number; rating: number; image: string; category: string }>;
  itinerary: Array<{ day: number; activities: Array<{ id: string; title: string; time: string; cost: number }> }>;
  attractions: Array<{ id: string; name: string; desc: string; duration: string; cost: number }>;
  food: Array<{ name: string; desc: string; rating: number }>;
  souvenirs: Array<{ name: string; price: string; location: string }>;
  weatherBackup: string[];
  emergencyContacts: string[];
}

const MOCK_DESTINATIONS: Record<string, DestinationData> = {
  bali: {
    fullName: 'Ubud, Bali',
    visaStatus: 'Visa on Arrival Required',
    visaDetails: 'Citizens of over 80 countries require a Visa on Arrival (VoA) valid for 30 days, extendable once. Costs IDR 500,000 (~$32 USD). Last updated: June 2026.',
    visaUrl: 'https://molina.imigrasi.go.id/',
    visaTime: 'Immediate (VoA) or 48 hours (e-VoA)',
    visaDocuments: ['Passport valid for 6 months', 'Return ticket out of Indonesia', 'VoA Fee payment'],
    exchangeRate: '1 USD = 16,245 IDR',
    exchangeAdvice: 'Avoid airport currency booths as their margins are ~8-12%. Withdraw from local ATMs inside banks (like BCA or Mandiri) for best rates, typically a 1-3% network fee.',
    cardAcceptance: 70,
    flights: [
      { id: 'f-bali-1', airline: 'Singapore Airlines', price: 680, stops: '1 Stop (SIN)', duration: '11h 20m' },
      { id: 'f-bali-2', airline: 'Garuda Indonesia', price: 840, stops: 'Non-stop', duration: '9h 15m' },
      { id: 'f-bali-3', airline: 'Qatar Airways', price: 920, stops: '1 Stop (DOH)', duration: '14h 40m' }
    ],
    ventures: [
      { id: 'list-2', name: 'Forest Canopy Private Villa', price: 450, rating: 4.8, image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=600&auto=format&fit=crop&q=80', category: 'Villa' },
      { id: 'list-1', name: 'Grand Oceanfront Deluxe Suite', price: 220, rating: 4.9, image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&auto=format&fit=crop&q=80', category: 'Hotel Room' }
    ],
    itinerary: [
      {
        day: 1,
        activities: [
          { id: 'act-b1', title: 'Visit Ubud Sacred Monkey Forest', time: '10:00 AM', cost: 12 },
          { id: 'act-b2', title: 'Stroll around Tegallalang Rice Terraces', time: '02:00 PM', cost: 5 },
          { id: 'act-b3', title: 'Traditional Balinese Dinner at warung', time: '07:30 PM', cost: 15 }
        ]
      },
      {
        day: 2,
        activities: [
          { id: 'act-b4', title: 'Sunrise trek up Mount Batur', time: '04:00 AM', cost: 45 },
          { id: 'act-b5', title: 'Relaxing hot springs spa soak', time: '11:30 AM', cost: 25 },
          { id: 'act-b6', title: 'Sunset dinner cruise in Jimbaran', time: '05:30 PM', cost: 60 }
        ]
      }
    ],
    attractions: [
      { id: 'attr-b1', name: 'Uluwatu Cliff Temple & Kecak Dance', desc: 'Ancient clifftop temple hosting epic cultural sunset performances.', duration: '3 hours', cost: 15 },
      { id: 'attr-b2', name: 'Tegenungan Jungle Waterfall Hike', desc: 'Scenic jungle paths leading down to a massive, thundering waterfall canyon.', duration: '2 hours', cost: 8 },
      { id: 'attr-b3', name: 'Nusa Penida Kelingking Beach Tour', desc: 'Boat transfer to the famous T-Rex shaped coastal viewpoint.', duration: '8 hours', cost: 50 }
    ],
    food: [
      { name: 'Babi Guling (Suckling Pig)', desc: 'Spiced roasted pork served with coconut rice and local sambal.', rating: 4.8 },
      { name: 'Nasi Goreng & Sate Lilit', desc: 'Indonesian fried rice paired with minced fish satay on lemongrass skewers.', rating: 4.7 }
    ],
    souvenirs: [
      { name: 'Ata Rattan Handbags', price: '$15 - $25', location: 'Ubud Market' },
      { name: 'Luwak Coffee & Spices', price: '$10 - $20', location: 'Tegallalang Plantations' }
    ],
    weatherBackup: [
      'Indoor Cooking Class at Ubud Culinary Center',
      'Glass Blowing workshop in Seminyak art galleries',
      'Indonesian Spa & Yoga retreat inside canopy studios'
    ],
    emergencyContacts: ['BIMC Hospital Ubud: +62 361 3000 911', 'Police: 110', 'Tourist Assistance: +62 361 750000']
  },
  manali: {
    fullName: 'Manali, Himachal Pradesh',
    visaStatus: 'eVisa or Regular Visa Required',
    visaDetails: 'Foreign tourists require an eVisa prior to boarding, valid for 30 days to 5 years. Costs $10 - $80 depending on nationality. Last updated: May 2026.',
    visaUrl: 'https://indianvisaonline.gov.in/evisa/',
    visaTime: '72 hours processing',
    visaDocuments: ['Passport valid for 6 months', 'Digital passport photo', 'Scanned passport page'],
    exchangeRate: '1 USD = 83.50 INR',
    exchangeAdvice: 'Avoid local bazaar forex dealers; use official bank desks in Mall Road. ATMs are widely available, but carry cash for remote trekking stops and taxi operators.',
    cardAcceptance: 50,
    flights: [
      { id: 'f-man-1', airline: 'Air India', price: 420, stops: '1 Stop (DEL)', duration: '8h 40m' },
      { id: 'f-man-2', airline: 'IndiGo Airlines', price: 380, stops: '1 Stop (DEL)', duration: '9h 15m' }
    ],
    ventures: [
      { id: 'list-5', name: 'Manali Alpine Retreat', price: 180, rating: 4.7, image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&auto=format&fit=crop&q=80', category: 'Cabin' }
    ],
    itinerary: [
      {
        day: 1,
        activities: [
          { id: 'act-m1', title: 'Walk around Old Manali Cafe street', time: '11:00 AM', cost: 5 },
          { id: 'act-m2', title: 'Visit Hadimba Wood Temple', time: '02:00 PM', cost: 2 },
          { id: 'act-m3', title: 'Riverside trout dinner feast', time: '07:00 PM', cost: 12 }
        ]
      }
    ],
    attractions: [
      { id: 'attr-m1', name: 'Solang Valley Adventure activities', desc: 'Glacier paragliding, ATV rides, and ski slope walks.', duration: '5 hours', cost: 35 },
      { id: 'attr-m2', name: 'Jogini Waterfall Trek', desc: 'Cozy walk from Vashisht village through tall pine woods.', duration: '3 hours', cost: 0 }
    ],
    food: [
      { name: 'Siddu with Ghee', desc: 'Traditional steamed wheat bread stuffed with local spices and walnuts.', rating: 4.9 },
      { name: 'Himachali Dham Thali', desc: 'Festive slow-cooked lentil platters served over premium basmati rice.', rating: 4.8 }
    ],
    souvenirs: [
      { name: 'Himachali Woolen Shawls', price: '$20 - $50', location: 'Mall Road Handloom cooperative' }
    ],
    weatherBackup: [
      'Museum of Himachal Culture visit',
      'Local hot spring baths inside Vashisht indoor cabins'
    ],
    emergencyContacts: ['Lady Willingdon Hospital: +91 1902 252389', 'Police: 112']
  }
};

// Fallback dynamic destination mockup
const getDestinationData = (dest: string): DestinationData => {
  const key = dest.toLowerCase().trim();
  if (MOCK_DESTINATIONS[key]) {
    return MOCK_DESTINATIONS[key];
  }
  // Generate generic structured fallback data for any searched destination
  const formatted = dest.charAt(0).toUpperCase() + dest.slice(1);
  return {
    fullName: `${formatted} Gateway`,
    visaStatus: 'Visa Free or VoA Required',
    visaDetails: `Most foreign nationalities require visa-on-arrival or brief electronic pre-clearance for entry to ${formatted}. Verify with embassy sources.`,
    visaUrl: 'https://www.google.com/search?q=' + encodeURIComponent(formatted + ' official tourism visa portal'),
    visaTime: '24-72 hours processing',
    visaDocuments: ['Passport valid for 6 months', 'Return flight confirmation', 'Sufficient travel funds proof'],
    exchangeRate: '1 USD = 1.00 Local',
    exchangeAdvice: 'Always avoid airport kiosks. Standard bank cards at ATMs offer the lowest fee rates.',
    cardAcceptance: 80,
    flights: [
      { id: 'f-gen-1', airline: 'International Airways', price: 550, stops: '1 Stop', duration: '12h 30m' },
      { id: 'f-gen-2', airline: 'Global Express Line', price: 720, stops: 'Non-stop', duration: '8h 00m' }
    ],
    ventures: [
      { id: 'list-fallback', name: 'Verified Venture Stay', price: 160, rating: 4.6, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80', category: 'Boutique Stay' }
    ],
    itinerary: [
      {
        day: 1,
        activities: [
          { id: 'act-g1', title: `Explore Downtown ${formatted}`, time: '09:30 AM', cost: 10 },
          { id: 'act-g2', title: 'Local Food Tasting tour', time: '01:00 PM', cost: 20 },
          { id: 'act-g3', title: 'Historical Landmark walk', time: '04:00 PM', cost: 15 }
        ]
      }
    ],
    attractions: [
      { id: 'attr-g1', name: `Central Heritage Museum of ${formatted}`, desc: 'Preserves regional records, paintings, and traditional crafts.', duration: '2 hours', cost: 10 }
    ],
    food: [
      { name: 'Regional Specialty Platters', desc: 'Curated tasting platters utilizing local spices and seasonal yields.', rating: 4.6 }
    ],
    souvenirs: [
      { name: 'Local Handicrafts & magnets', price: '$5 - $15', location: 'Central Bazaar' }
    ],
    weatherBackup: ['Visit regional art galleries', 'Enjoy boutique spas or local indoor cafes'],
    emergencyContacts: ['General Emergency: 112', 'Local Medical Support: 911']
  };
};

const ALL_DESTINATIONS = [
  { name: 'Ubud, Bali', key: 'bali' },
  { name: 'Manali, Himachal Pradesh', key: 'manali' },
  { name: 'Seminyak, Goa', key: 'seminyak' },
  { name: 'Reykjavik, Iceland', key: 'reykjavik' },
  { name: 'Paris, France', key: 'paris' },
  { name: 'Amalfi Coast, Italy', key: 'amalfi' }
];

const DESTINATION_CURRENCIES: Record<string, string> = {
  bali: 'IDR',
  manali: 'INR',
  seminyak: 'IDR',
  reykjavik: 'ISK',
  paris: 'EUR',
  amalfi: 'EUR'
};

interface CountryData {
  currencyCode: string;
  cardAcceptance: number;
  advice: string;
}

const COUNTRY_DATA_MAP: Record<string, CountryData> = {
  indonesia: {
    currencyCode: 'IDR',
    cardAcceptance: 70,
    advice: 'Avoid airport currency booths. Withdraw from local ATMs inside reputable bank lobbies (like BCA, Mandiri, or BNI) for the best rates, and select "Without Conversion" if prompted.'
  },
  india: {
    currencyCode: 'INR',
    cardAcceptance: 80,
    advice: 'UPI and cards are widely used in cities, but cash is essential for auto-rickshaws, small stalls, and local markets. Use official bank ATMs inside Mall Road or commercial complexes.'
  },
  france: {
    currencyCode: 'EUR',
    cardAcceptance: 90,
    advice: 'Cards are accepted for almost all transactions. Avoid independent ATMs like Euronet; use bank-owned ATMs (e.g. BNP Paribas, SG) to avoid massive markup fees.'
  },
  italy: {
    currencyCode: 'EUR',
    cardAcceptance: 85,
    advice: 'Contactless is very common, but carry small coins/cash for espresso bars, public toilets, and small gelato shops. ATMs inside post offices (Postamat) or major banks are best.'
  },
  iceland: {
    currencyCode: 'ISK',
    cardAcceptance: 98,
    advice: 'Iceland is almost entirely cashless. Even public restrooms and parking meters accept cards. You do not need to carry any physical cash.'
  },
  japan: {
    currencyCode: 'JPY',
    cardAcceptance: 60,
    advice: 'Cash is king in Japan for temples, street food, and smaller restaurants. Convenient store ATMs (especially 7-Bank or Lawson) are very safe and support foreign cards with low fees.'
  },
  unitedkingdom: {
    currencyCode: 'GBP',
    cardAcceptance: 95,
    advice: 'Almost completely cashless. Contactless cards or mobile payments are standard on all public transport, markets, and shops. Carry zero cash.'
  },
  uk: {
    currencyCode: 'GBP',
    cardAcceptance: 95,
    advice: 'Almost completely cashless. Contactless cards or mobile payments are standard on all public transport, markets, and shops. Carry zero cash.'
  },
  unitedstates: {
    currencyCode: 'USD',
    cardAcceptance: 95,
    advice: 'Credit/debit cards are accepted everywhere. Avoid high-fee third-party ATMs in bars or gas stations. Use major bank ATMs (Chase, BofA, Wells Fargo).'
  },
  usa: {
    currencyCode: 'USD',
    cardAcceptance: 95,
    advice: 'Credit/debit cards are accepted everywhere. Avoid high-fee third-party ATMs in bars or gas stations. Use major bank ATMs (Chase, BofA, Wells Fargo).'
  },
  australia: {
    currencyCode: 'AUD',
    cardAcceptance: 95,
    advice: 'Extremely card-friendly. Contactless "tap-and-go" is standard. Some places surcharge up to 1.5% on cards, but cash is rarely necessary.'
  },
  switzerland: {
    currencyCode: 'CHF',
    cardAcceptance: 85,
    advice: 'Very card-friendly, but cash is still appreciated in rural alpine areas and traditional local markets. Use ATMs of cantonal banks (Kantonalbank) for best rates.'
  },
  singapore: {
    currencyCode: 'SGD',
    cardAcceptance: 90,
    advice: 'Mobile payments and contactless cards are standard. Cash is mainly useful for eating at hawker centers. ATMs are abundant inside MRT stations and shopping malls.'
  },
  thailand: {
    currencyCode: 'THB',
    cardAcceptance: 55,
    advice: 'Cash is required for street food, markets, massage shops, and taxis. Cards are accepted in malls and hotels. ATMs charge a flat 220 THB fee per withdrawal, so withdraw large amounts at once.'
  },
  vietnam: {
    currencyCode: 'VND',
    cardAcceptance: 45,
    advice: 'Cash is essential. Most daily vendors, taxis, and local cafes do not accept foreign cards. Use bank-owned ATMs (like Vietcombank or BIDV) and carry plenty of small bills.'
  }
};

const PlaneLogoSVG = ({ size = 24, color = 'currentColor', style = {} }: { size?: number; color?: string; style?: React.CSSProperties }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    style={style}
  >
    <path 
      d="M21 3C18 3 14 7 11.5 10L6 7L3 9L9.5 13.5L7 16L3.5 15L2 17L5 19L7 22L9 20.5L8 17L10.5 14.5L15 21L17 18L14 12.5C17 10 21 6 21 3Z" 
      fill={color} 
    />
    <path d="M10.5 7.5L9.5 8.5" stroke={color} strokeWidth="1" strokeLinecap="round" />
    <path d="M12 8.5L11 9.5" stroke={color} strokeWidth="1" strokeLinecap="round" />
    <path d="M13.5 9.5L12.5 10.5" stroke={color} strokeWidth="1" strokeLinecap="round" />
    <path d="M14.5 13.5L15.5 12.5" stroke={color} strokeWidth="1" strokeLinecap="round" />
    <path d="M15.5 15L16.5 14" stroke={color} strokeWidth="1" strokeLinecap="round" />
    <path d="M16.5 16.5L17.5 15.5" stroke={color} strokeWidth="1" strokeLinecap="round" />
  </svg>
);

// ----------------------------------------------------
// Core Client Workspace Component
// ----------------------------------------------------
interface TripPlannerClientProps {
  initialDestination?: string;
}

export default function TripPlannerClient({ initialDestination = '' }: TripPlannerClientProps) {
  const router = useRouter();

  // Step state
  const [currentStep, setCurrentStep] = useState(1);

  // Audio feedback helper
  const playUISound = (type: 'tap' | 'open' | 'click' | 'hover') => {
    try {
      if (typeof window !== 'undefined' && (window as any).playUISound) {
        (window as any).playUISound(type);
      } else {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(type === 'hover' ? 1200 : 800, ctx.currentTime);
        gain.gain.setValueAtTime(0.01, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      }
    } catch (e) {
      // safe fallback
    }
  };

  // Form states (Step 1)
  const [destinationInput, setDestinationInput] = useState(initialDestination);
  const [activeDestination, setActiveDestination] = useState<string>('');
  
  // Custom Date Picker states
  const [dateSelectionMode, setDateSelectionMode] = useState<'calendar' | 'flexible'>('calendar');
  const [startCustomDate, setStartCustomDate] = useState<Date | null>(null);
  const [endCustomDate, setEndCustomDate] = useState<Date | null>(null);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(9); // Default October
  const [currentYear, setCurrentYear] = useState(2026);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [flexibleMode, setFlexibleMode] = useState(false);
  const [flexibleMonth, setFlexibleMonth] = useState('October 2026');
  const [travelersCount, setTravelersCount] = useState(2);
  const [tripPurpose, setTripPurpose] = useState('leisure');
  const [targetBudget, setTargetBudget] = useState(2000);
  const [currency, setCurrency] = useState('$ USD');

  // Suggestion list dropdown states
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [matchingSuggestions, setMatchingSuggestions] = useState<Array<{ name: string; key: string }>>([]);

  // Currency Dropdown states
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);

  // Nationality Dropdown states
  const [isNationalityDropdownOpen, setIsNationalityDropdownOpen] = useState(false);

  // Sync custom dates to stayNights and formatted string dates
  useEffect(() => {
    if (startCustomDate && endCustomDate) {
      const diffTime = Math.abs(endCustomDate.getTime() - startCustomDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setStayNights(diffDays || 1);
      setStartDate(startCustomDate.toISOString().split('T')[0]);
      setEndDate(endCustomDate.toISOString().split('T')[0]);
    }
  }, [startCustomDate, endCustomDate]);

  // Document states (Step 2)
  const [userNationality, setUserNationality] = useState('United States');

  // Flight states (Step 4)
  const [selectedOutboundFlight, setSelectedOutboundFlight] = useState<any | null>(null);
  const [selectedReturnFlight, setSelectedReturnFlight] = useState<any | null>(null);
  const [isFlightBooked, setIsFlightBooked] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isBookingReturnFlight, setIsBookingReturnFlight] = useState(false);

  // Stay states (Step 5)
  const [bookedStay, setBookedStay] = useState<any | null>(null);
  const [stayNights, setStayNights] = useState(3);
  const [stayRatingFilter, setStayRatingFilter] = useState(4.0);

  // Itinerary states (Step 6)
  const [activeItinerary, setActiveItinerary] = useState<any[]>([]);
  const [selectedItineraryDay, setSelectedItineraryDay] = useState(1);

  // Manual Expenses list (Step 8)
  const [manualExpenses, setManualExpenses] = useState<Array<{ id: string; name: string; amount: number }>>([]);
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');

  // Itinerary generator to plan a full trip guide for all days of the trip
  const generateItinerary = (destination: string, nights: number) => {
    if (!destination) return [];
    const data = getDestinationData(destination);
    const numDays = nights + 1;
    const itinerary = [];

    const genericActivities = [
      { title: 'Morning yoga session & healthy breakfast', time: '08:30 AM', cost: 10 },
      { title: 'Explore local traditional food markets', time: '11:00 AM', cost: 5 },
      { title: 'Cozy café lunch & regional tea tasting', time: '01:30 PM', cost: 12 },
      { title: 'Neighborhood guided walking tour', time: '03:30 PM', cost: 15 },
      { title: 'Scenic sunset viewpoint & photos', time: '06:00 PM', cost: 0 },
      { title: 'Local cultural dinner feast', time: '08:00 PM', cost: 25 },
      { title: 'Sightseeing at historical architecture', time: '10:00 AM', cost: 8 },
      { title: 'Leisurely garden walk & afternoon tea', time: '03:00 PM', cost: 10 },
      { title: 'Drinks and live music at regional lounge', time: '09:30 PM', cost: 20 }
    ];

    const attractions = [...(data.attractions || [])];

    for (let day = 1; day <= numDays; day++) {
      const activities = [];
      
      // If mock itinerary has this day's details, use them
      if (data.itinerary && data.itinerary[day - 1]) {
        activities.push(...data.itinerary[day - 1].activities.map((act: any, idx: number) => ({
          ...act,
          id: act.id || `act-mock-${day}-${idx}-${Date.now()}`
        })));
      } else {
        // Distribute local attractions if available
        if (attractions.length > 0) {
          const attr = attractions[(day - 1) % attractions.length];
          activities.push({
            id: `act-attr-${day}-${attr.id}`,
            title: attr.name,
            time: '10:00 AM',
            cost: attr.cost
          });
        }
        
        // Add 2 generic activities to fill out the day
        const genIdx1 = (day * 2) % genericActivities.length;
        const genIdx2 = (day * 2 + 3) % genericActivities.length;
        
        activities.push({
          id: `act-gen-${day}-1`,
          title: genericActivities[genIdx1].title,
          time: '02:30 PM',
          cost: genericActivities[genIdx1].cost
        });
        
        activities.push({
          id: `act-gen-${day}-2`,
          title: genericActivities[genIdx2].title,
          time: '07:30 PM',
          cost: genericActivities[genIdx2].cost
        });
      }

      itinerary.push({
        day,
        activities
      });
    }

    return itinerary;
  };

  // Sync active itinerary when destination or trip duration changes
  useEffect(() => {
    if (activeDestination) {
      const generated = generateItinerary(activeDestination, stayNights);
      setActiveItinerary(generated);
      setSelectedItineraryDay(1);
    }
  }, [activeDestination, stayNights]);

  // ----------------------------------------------------
  // Sync Route pre-fills on load
  // ----------------------------------------------------
  useEffect(() => {
    if (initialDestination) {
      const decoded = decodeURIComponent(initialDestination);
      handleSetDestination(decoded);
      setDestinationInput(decoded);
    }
  }, [initialDestination]);

  const handleSetDestination = (dest: string) => {
    setActiveDestination(dest.toLowerCase());
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (destinationInput.trim()) {
      handleSetDestination(destinationInput.trim());
    }
  };

  // Dynamic destination data state
  const [destData, setDestData] = useState<DestinationData>(getDestinationData('bali'));

  useEffect(() => {
    const destName = activeDestination || 'bali';
    fetch(`/api/destinations/${destName}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setDestData(data);
        } else {
          setDestData(getDestinationData(destName));
        }
      })
      .catch(err => {
        console.error("Error loading destination from DB:", err);
        setDestData(getDestinationData(destName));
      });
  }, [activeDestination]);

  const getDynamicCountryData = (dest: string): CountryData => {
    let text = dest.toLowerCase().trim();
    if (text.includes('bali') || text.includes('seminyak') || text.includes('ubud') || text.includes('jakarta')) {
      text += ' indonesia';
    } else if (text.includes('manali') || text.includes('himachal') || text.includes('goa') || text.includes('delhi') || text.includes('mumbai') || text.includes('india')) {
      text += ' india';
    } else if (text.includes('paris') || text.includes('nice') || text.includes('lyon') || text.includes('france')) {
      text += ' france';
    } else if (text.includes('amalfi') || text.includes('rome') || text.includes('florence') || text.includes('venice') || text.includes('italy')) {
      text += ' italy';
    } else if (text.includes('reykjavik') || text.includes('iceland')) {
      text += ' iceland';
    } else if (text.includes('tokyo') || text.includes('kyoto') || text.includes('osaka') || text.includes('japan')) {
      text += ' japan';
    } else if (text.includes('london') || text.includes('uk') || text.includes('united kingdom')) {
      text += ' uk';
    } else if (text.includes('new york') || text.includes('california') || text.includes('los angeles') || text.includes('usa') || text.includes('united states')) {
      text += ' usa';
    } else if (text.includes('sydney') || text.includes('melbourne') || text.includes('australia')) {
      text += ' australia';
    }

    for (const key of Object.keys(COUNTRY_DATA_MAP)) {
      if (text.includes(key)) {
        return COUNTRY_DATA_MAP[key];
      }
    }
    
    const matchingMock = Object.keys(MOCK_DESTINATIONS).find(k => text.includes(k));
    if (matchingMock) {
      const mockObj = MOCK_DESTINATIONS[matchingMock];
      const code = mockObj.exchangeRate.split('=').pop()?.trim().split(' ').pop() || 'IDR';
      return {
        currencyCode: code,
        cardAcceptance: mockObj.cardAcceptance,
        advice: mockObj.exchangeAdvice
      };
    }

    if (text.includes('germany') || text.includes('spain') || text.includes('greece') || text.includes('netherlands') || text.includes('belgium') || text.includes('austria') || text.includes('portugal') || text.includes('europe')) {
      return {
        currencyCode: 'EUR',
        cardAcceptance: 85,
        advice: 'Eurozone is very card friendly. ATMs inside major bank lobbies are safest. Reject dynamic currency conversion (DCC) if prompted by ATM prompts.'
      };
    }
    if (text.includes('canada')) {
      return {
        currencyCode: 'CAD',
        cardAcceptance: 95,
        advice: 'Cards and contactless payments are standard. ATM withdrawals can be done safely at major bank branches (TD, RBC, Scotiabank).'
      };
    }
    if (text.includes('mexico')) {
      return {
        currencyCode: 'MXN',
        cardAcceptance: 60,
        advice: 'Cash (Pesos) is strongly recommended for local transport, street food, and tips. ATMs at major national banks (Banamex, BBVA) offer secure rates.'
      };
    }

    return {
      currencyCode: 'USD',
      cardAcceptance: 75,
      advice: 'Always choose to pay or withdraw in local currency when prompted by terminal screens to ensure your home bank handles the exchange rate instead of local vendor markups.'
    };
  };

  const dynamicFinances = getDynamicCountryData(activeDestination || 'bali');

  // Currency Converter State
  const [calcUsdAmount, setCalcUsdAmount] = useState('100');
  const [realRates, setRealRates] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchRates() {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        if (res.ok) {
          const data = await res.json();
          if (data && data.rates) {
            setRealRates(data.rates);
          }
        }
      } catch (err) {
        console.error('Failed to fetch real-world exchange rates:', err);
      }
    }
    fetchRates();
  }, []);

  const getLocalCurrencyCode = () => {
    if (dynamicFinances && dynamicFinances.currencyCode) {
      return dynamicFinances.currencyCode;
    }
    const key = activeDestination.toLowerCase().trim();
    if (DESTINATION_CURRENCIES[key]) {
      return DESTINATION_CURRENCIES[key];
    }
    try {
      const rateStr = destData.exchangeRate;
      const parts = rateStr.split('=');
      if (parts.length === 2) {
        const words = parts[1].trim().split(' ');
        const code = words[words.length - 1];
        if (code && code !== 'Local') return code;
      }
    } catch (e) {
      // fallback
    }
    return 'IDR';
  };

  const getExchangeRateValue = () => {
    const code = getLocalCurrencyCode();
    if (realRates && realRates[code]) {
      return realRates[code];
    }

    try {
      const rateStr = destData.exchangeRate; // e.g. "1 USD = 16,245 IDR" or "1 USD = 83.50 INR"
      const parts = rateStr.split('=');
      if (parts.length === 2) {
        const valStr = parts[1].trim().replace(/,/g, '').split(' ')[0];
        const val = parseFloat(valStr);
        if (!isNaN(val)) return val;
      }
    } catch (e) {
      // fallback
    }
    return 1;
  };

  const getFlightRouteDetails = () => {
    const key = activeDestination.toLowerCase().trim();
    let details = { from: 'NYC', fromCity: 'New York', to: 'DEST', toCity: 'Destination' };
    if (key.includes('bali') || key.includes('seminyak') || key.includes('ubud')) {
      details = { from: 'JFK', fromCity: 'New York', to: 'DPS', toCity: 'Bali' };
    } else if (key.includes('manali') || key.includes('himachal')) {
      details = { from: 'DEL', fromCity: 'Delhi', to: 'KUU', toCity: 'Kullu' };
    } else if (key.includes('paris') || key.includes('france')) {
      details = { from: 'JFK', fromCity: 'New York', to: 'CDG', toCity: 'Paris' };
    } else if (key.includes('amalfi') || key.includes('naples')) {
      details = { from: 'JFK', fromCity: 'New York', to: 'NAP', toCity: 'Naples' };
    } else if (key.includes('reykjavik') || key.includes('iceland')) {
      details = { from: 'JFK', fromCity: 'New York', to: 'KEF', toCity: 'Reykjavik' };
    }
    
    if (isBookingReturnFlight) {
      return { from: details.to, fromCity: details.toCity, to: details.from, toCity: details.fromCity };
    }
    return details;
  };

  const getSkyscannerUrl = (destination: string) => {
    const term = destination.toLowerCase();
    let code = 'dps'; // Bali
    if (term.includes('manali') || term.includes('himachal') || term.includes('delhi')) {
      code = 'del';
    } else if (term.includes('goa')) {
      code = 'goi';
    } else if (term.includes('paris') || term.includes('france')) {
      code = 'cdg';
    } else if (term.includes('amalfi') || term.includes('naples') || term.includes('italy')) {
      code = 'nap';
    } else if (term.includes('reykjavik') || term.includes('iceland')) {
      code = 'kef';
    }
    return `https://www.skyscanner.com/transport/flights/anywhere/${code}/?utm_source=travora&adults=${travelersCount}`;
  };

  // ----------------------------------------------------
  // Live Budget Calculations (Step 8)
  // ----------------------------------------------------
  const calculateCosts = () => {
    let visaCost = activeDestination ? 35 : 0; // VoA estimation
    let flightCost = 0;
    if (selectedOutboundFlight) flightCost += selectedOutboundFlight.price;
    if (selectedReturnFlight) flightCost += selectedReturnFlight.price;

    let accommodationCost = 0;
    if (bookedStay) {
      accommodationCost += bookedStay.price * stayNights;
    }

    let activitiesCost = 0;
    activeItinerary.forEach(day => {
      day.activities.forEach((act: any) => {
        activitiesCost += act.cost;
      });
    });

    let manualCost = manualExpenses.reduce((sum, item) => sum + item.amount, 0);

    const subtotal = visaCost + flightCost + accommodationCost + activitiesCost + manualCost;
    return {
      visaCost,
      flightCost,
      accommodationCost,
      activitiesCost,
      manualCost,
      subtotal
    };
  };

  const costBreakdown = calculateCosts();
  const isOverBudget = costBreakdown.subtotal > targetBudget;
  const budgetRatio = Math.min((costBreakdown.subtotal / targetBudget) * 100, 100);

  // ----------------------------------------------------
  // Step list configs (Non-linear navigation)
  // ----------------------------------------------------
  const STEPS = [
    { number: 1, title: 'Trip Basics', subtitle: 'Select destination & budget' },
    { number: 2, title: 'Passport & Visa', subtitle: 'Document checking & disclaimers' },
    { number: 3, title: 'Currency & Forex', subtitle: 'Rates & local payment guide' },
    { number: 4, title: 'Flight Booking', subtitle: 'Compare flight search lists' },
    { number: 5, title: 'Where to Stay', subtitle: 'Venture & boutique lodges' },
    { number: 6, title: 'Itinerary Plan', subtitle: 'Day timeline & activity additions' },
    { number: 7, title: 'Food & Attractions', subtitle: 'Top dishes & attractions checklist' },
    { number: 8, title: 'Budget Analytics', subtitle: 'Planned spend tracker' },
    { number: 9, title: 'Return Checklist', subtitle: 'Boarding pass & baggage' }
  ];

  // Itinerary helper triggers
  const handleAddActivity = (dayIndex: number, title: string, cost: number) => {
    setActiveItinerary(prev => {
      return prev.map((day, idx) => {
        if (idx === dayIndex) {
          return {
            ...day,
            activities: [
              ...day.activities,
              { id: 'act-added-' + Date.now(), title, time: 'Flexible', cost }
            ]
          };
        }
        return day;
      });
    });
  };

  const handleRemoveActivity = (dayIndex: number, actId: string) => {
    setActiveItinerary(prev => {
      return prev.map((day, idx) => {
        if (idx === dayIndex) {
          return {
            ...day,
            activities: day.activities.filter((act: any) => act.id !== actId)
          };
        }
        return day;
      });
    });
  };

  const handleMoveActivity = (dayIndex: number, actIdx: number, direction: 'up' | 'down') => {
    setActiveItinerary(prev => {
      return prev.map((day, idx) => {
        if (idx === dayIndex) {
          const list = [...day.activities];
          const newIdx = direction === 'up' ? actIdx - 1 : actIdx + 1;
          if (newIdx >= 0 && newIdx < list.length) {
            const temp = list[actIdx];
            list[actIdx] = list[newIdx];
            list[newIdx] = temp;
          }
          return { ...day, activities: list };
        }
        return day;
      });
    });
  };

  const handleAddManualExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(newExpenseAmount);
    if (newExpenseName.trim() && !isNaN(amt) && amt > 0) {
      setManualExpenses([...manualExpenses, { id: 'exp-' + Date.now(), name: newExpenseName.trim(), amount: amt }]);
      setNewExpenseName('');
      setNewExpenseAmount('');
    }
  };

  const handleRemoveManualExpense = (id: string) => {
    setManualExpenses(manualExpenses.filter(item => item.id !== id));
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-gradient)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>
      {/* Background ambient glows */}
      <div className="bg-glow-container" style={{ pointerEvents: 'none' }}>
        <div className="bg-blob bg-blob-1" style={{ opacity: 0.15 }} />
        <div className="bg-blob bg-blob-2" style={{ opacity: 0.1 }} />
      </div>

      <div style={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
        
        {/* LEFT COLUMN: Interactive Stepper Sidebar */}
        <div 
          style={{ 
            width: '320px', 
            background: 'var(--left-pane-bg)', 
            backdropFilter: 'var(--glass-backdrop)', 
            borderRight: '1px solid var(--card-border)', 
            padding: '28px 24px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '24px',
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflowY: 'auto'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} 
              onClick={() => router.push('/')}
            >
              <Logo theme="dark" width={28} showText={false} />
              <span style={{ 
                color: 'white', 
                fontFamily: 'var(--font-logo)', 
                fontSize: '22px', 
                fontWeight: 800, 
                background: 'var(--brand-gradient)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent', 
                backgroundClip: 'text',
                whiteSpace: 'nowrap'
              }}>
                Travora
              </span>
            </div>
            
            <button 
              onClick={() => router.push('/')}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '6px 12px',
                color: 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              }}
            >
              ← Back
            </button>
          </div>

          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800, marginTop: '8px' }}>
            Trip Planning Workspace
          </div>

          {/* Stepper Navigation Nodes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
            {STEPS.map((step) => {
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              return (
                <button
                  key={step.number}
                  onClick={() => {
                    if (activeDestination || step.number === 1) {
                      setCurrentStep(step.number);
                    }
                  }}
                  style={{
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    textAlign: 'left',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    cursor: activeDestination || step.number === 1 ? 'pointer' : 'not-allowed',
                    opacity: activeDestination || step.number === 1 ? 1 : 0.4,
                    background: isActive ? 'rgba(255,255,255,0.04)' : 'transparent',
                    transition: 'background 0.2s',
                    position: 'relative'
                  }}
                >
                  {/* Stepper active bar glow */}
                  {isActive && (
                    <motion.div 
                      layoutId="planner-sidebar-active"
                      style={{ position: 'absolute', left: 0, top: '15%', bottom: '15%', width: '3px', background: 'var(--primary)', borderRadius: '2px' }}
                    />
                  )}

                  {/* Stepper Node Circle */}
                  <div 
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 800,
                      background: isCompleted ? '#10b981' : isActive ? 'var(--brand-gradient)' : 'rgba(255,255,255,0.06)',
                      border: isActive ? 'none' : '1px solid rgba(255,255,255,0.1)',
                      color: isActive || isCompleted ? 'white' : 'var(--text-muted)',
                      flexShrink: 0
                    }}
                  >
                    {isCompleted ? '✓' : step.number}
                  </div>

                  <div>
                    <span style={{ fontSize: '12px', fontWeight: isActive ? 800 : 600, color: isActive ? 'white' : 'var(--text-secondary)', display: 'block' }}>
                      {step.title}
                    </span>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                      {step.subtitle}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Exit back to home feed */}
          <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
            <button 
              onClick={() => router.push('/')}
              style={{
                width: '100%',
                padding: '11px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                color: 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              Exit Workspace
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Step Content Render Area */}
        <div style={{ flex: 1, padding: '48px 64px', overflowY: 'auto', height: '100vh' }}>
          
          {/* Global Header Banner: pre-fill details or summary */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', borderBottom: '1px solid var(--card-border)', paddingBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>
                {activeDestination ? `Planning Trip to ${destData.fullName}` : 'End-to-End Trip Planner'}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
                Complete each step to verify bookings, document checks, and build itineraries.
              </p>
            </div>
            
            {/* Live Budget Counter widget */}
            {activeDestination && (
              <div 
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '16px',
                  padding: '12px 20px',
                  textAlign: 'right',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}
              >
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>PROJECTED COST</span>
                  <span style={{ fontSize: '18px', fontWeight: 900, color: isOverBudget ? '#ef4444' : '#10b981' }}>
                    {currency.split(' ')[0]}{costBreakdown.subtotal}
                  </span>
                </div>
                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '16px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>TARGET BUDGET</span>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'white' }}>
                    {currency.split(' ')[0]}{targetBudget}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Render Step Contents dynamically */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}
            >
              
              {/* ---------------------------------------------------- */}
              {/* STEP 1: TRIP BASICS */}
              {/* ---------------------------------------------------- */}
              {currentStep === 1 && (
                <>
                  <div className="discover-premium-card" style={{ padding: '28px', borderRadius: '20px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Step 1: Configure Trip Basics</h3>
                    
                    {/* Destination input with Autocomplete Suggestions */}
                    <div style={{ position: 'relative' }}>
                      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                          <input 
                            type="text"
                            value={destinationInput}
                            onChange={(e) => {
                              const val = e.target.value;
                              setDestinationInput(val);
                              if (val.trim().length > 0) {
                                const filtered = ALL_DESTINATIONS.filter(item => 
                                  item.name.toLowerCase().includes(val.toLowerCase())
                                );
                                setMatchingSuggestions(filtered);
                                setShowSuggestions(true);
                              } else {
                                setShowSuggestions(false);
                              }
                            }}
                            onFocus={() => {
                              if (destinationInput.trim().length > 0) {
                                const filtered = ALL_DESTINATIONS.filter(item => 
                                  item.name.toLowerCase().includes(destinationInput.toLowerCase())
                                );
                                setMatchingSuggestions(filtered);
                                setShowSuggestions(true);
                              }
                            }}
                            onBlur={() => {
                              // delay closing suggestion list slightly so click handles register
                              setTimeout(() => setShowSuggestions(false), 200);
                            }}
                            placeholder="Search destination, e.g. Bali, Manali..."
                            style={{
                              width: '100%',
                              padding: '14px',
                              background: 'var(--input-bg)',
                              border: '1px solid var(--input-border)',
                              borderRadius: '12px',
                              color: 'white',
                              outline: 'none',
                              fontSize: '13px'
                            }}
                          />
                        </div>
                        <button 
                          type="submit"
                          style={{
                            padding: '12px 24px',
                            background: 'var(--brand-gradient)',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '13px',
                            cursor: 'pointer'
                          }}
                        >
                          Set Destination
                        </button>
                      </form>

                      {/* Autocomplete Suggestion Dropdown Overlay */}
                      {showSuggestions && matchingSuggestions.length > 0 && (
                        <div 
                          style={{
                            position: 'absolute',
                            top: 'calc(100% + 4px)',
                            left: 0,
                            right: 0,
                            background: 'rgba(15, 14, 23, 0.96)',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid var(--card-border)',
                            borderRadius: '12px',
                            boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
                            zIndex: 50,
                            overflow: 'hidden'
                          }}
                        >
                          {matchingSuggestions.map((item) => (
                            <div
                              key={item.key}
                              onClick={() => {
                                playUISound('click');
                                setDestinationInput(item.name);
                                handleSetDestination(item.key);
                                setShowSuggestions(false);
                              }}
                              style={{
                                padding: '12px 16px',
                                fontSize: '13px',
                                color: 'white',
                                cursor: 'pointer',
                                borderBottom: '1px solid rgba(255,255,255,0.03)',
                                transition: 'background 0.2s',
                                textAlign: 'left'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                            >
                              {item.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Pre-fill Quick Presets */}
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textAlign: 'left' }}>QUICK POPULAR PRESETS:</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {ALL_DESTINATIONS.slice(0, 3).map(preset => (
                          <button 
                            key={preset.key}
                            onClick={() => { 
                              playUISound('click');
                              setDestinationInput(preset.name); 
                              handleSetDestination(preset.key); 
                            }} 
                            style={{ 
                              background: 'rgba(255,255,255,0.04)', 
                              border: '1px solid rgba(255,255,255,0.08)', 
                              borderRadius: '20px', 
                              padding: '6px 14px', 
                              fontSize: '11px', 
                              color: 'white', 
                              cursor: 'pointer',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Animated Calendar / Date month selector */}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>Travel Dates</label>
                        
                        {/* Selector Tab slider */}
                        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', padding: '2px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <button
                            type="button"
                            onClick={() => { playUISound('click'); setFlexibleMode(false); }}
                            style={{
                              position: 'relative',
                              padding: '6px 14px',
                              borderRadius: '16px',
                              background: 'transparent',
                              border: 'none',
                              fontSize: '11px',
                              fontWeight: 700,
                              color: !flexibleMode ? 'white' : 'var(--text-muted)',
                              cursor: 'pointer',
                              zIndex: 1
                            }}
                          >
                            {!flexibleMode && (
                              <motion.div
                                layoutId="date-mode-pill"
                                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                                style={{ position: 'absolute', inset: 0, background: 'var(--brand-gradient)', borderRadius: '16px', zIndex: -1 }}
                              />
                            )}
                            Calendar Date Range
                          </button>
                          <button
                            type="button"
                            onClick={() => { playUISound('click'); setFlexibleMode(true); }}
                            style={{
                              position: 'relative',
                              padding: '6px 14px',
                              borderRadius: '16px',
                              background: 'transparent',
                              border: 'none',
                              fontSize: '11px',
                              fontWeight: 700,
                              color: flexibleMode ? 'white' : 'var(--text-muted)',
                              cursor: 'pointer',
                              zIndex: 1
                            }}
                          >
                            {flexibleMode && (
                              <motion.div
                                layoutId="date-mode-pill"
                                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                                style={{ position: 'absolute', inset: 0, background: 'var(--brand-gradient)', borderRadius: '16px', zIndex: -1 }}
                              />
                            )}
                            Flexible Month
                          </button>
                        </div>
                      </div>

                      {/* Display mode views */}
                      <AnimatePresence mode="wait">
                        {!flexibleMode ? (
                          <motion.div
                            key="calendar-view"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                          >
                            {/* Custom Glassmorphic Calendar Picker */}
                            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '16px' }}>
                              
                              {/* Month switcher navigation header */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    playUISound('click');
                                    if (currentMonthIndex === 0) {
                                      setCurrentMonthIndex(11);
                                      setCurrentYear(prev => prev - 1);
                                    } else {
                                      setCurrentMonthIndex(prev => prev - 1);
                                    }
                                  }}
                                  style={{ background: 'rgba(255,255,255,0.04)', border: 'none', borderRadius: '6px', color: 'white', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                  ◀
                                </button>
                                
                                <span style={{ fontWeight: 800, fontSize: '13px', color: 'white' }}>
                                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][currentMonthIndex]} {currentYear}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => {
                                    playUISound('click');
                                    if (currentMonthIndex === 11) {
                                      setCurrentMonthIndex(0);
                                      setCurrentYear(prev => prev + 1);
                                    } else {
                                      setCurrentMonthIndex(prev => prev + 1);
                                    }
                                  }}
                                  style={{ background: 'rgba(255,255,255,0.04)', border: 'none', borderRadius: '6px', color: 'white', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                  ▶
                                </button>
                              </div>

                              {/* Weekdays */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '6px' }}>
                                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                                  <span key={d} style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)' }}>{d}</span>
                                ))}
                              </div>

                              {/* Days Grid */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                                {(() => {
                                  const pad = new Date(currentYear, currentMonthIndex, 1).getDay();
                                  const daysCount = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
                                  const cells = [];
                                  
                                  // padding cells
                                  for (let i = 0; i < pad; i++) {
                                    cells.push(<div key={`pad-${i}`} />);
                                  }

                                  // active day cells
                                  for (let d = 1; d <= daysCount; d++) {
                                    const dDate = new Date(currentYear, currentMonthIndex, d);
                                    
                                    const isStart = startCustomDate && dDate.toDateString() === startCustomDate.toDateString();
                                    const isEnd = endCustomDate && dDate.toDateString() === endCustomDate.toDateString();
                                    const isBetween = startCustomDate && endCustomDate && dDate > startCustomDate && dDate < endCustomDate;
                                    
                                    cells.push(
                                      <button
                                        key={`day-${d}`}
                                        type="button"
                                        onClick={() => {
                                          playUISound('tap');
                                          if (!startCustomDate || (startCustomDate && endCustomDate)) {
                                            setStartCustomDate(dDate);
                                            setEndCustomDate(null);
                                          } else {
                                            if (dDate < startCustomDate) {
                                              setStartCustomDate(dDate);
                                            } else {
                                              setEndCustomDate(dDate);
                                            }
                                          }
                                        }}
                                        style={{
                                          padding: '8px 0',
                                          borderRadius: '8px',
                                          background: isStart || isEnd ? 'var(--brand-gradient)' : isBetween ? 'rgba(236,72,153,0.15)' : 'transparent',
                                          border: isStart || isEnd ? 'none' : '1px solid transparent',
                                          color: isStart || isEnd ? 'white' : isBetween ? '#ec4899' : 'var(--text-secondary)',
                                          fontSize: '11px',
                                          fontWeight: isStart || isEnd || isBetween ? 800 : 500,
                                          cursor: 'pointer',
                                          transition: 'background 0.2s, color 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                          if (!isStart && !isEnd && !isBetween) {
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                                          }
                                        }}
                                        onMouseLeave={(e) => {
                                          if (!isStart && !isEnd && !isBetween) {
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.borderColor = 'transparent';
                                          }
                                        }}
                                      >
                                        {d}
                                      </button>
                                    );
                                  }
                                  return cells;
                                })()}
                              </div>
                            </div>

                            {/* Custom Date summary panel */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)', textAlign: 'left' }}>
                              <div>
                                <span style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>DEPARTURE</span>
                                <span style={{ fontSize: '13px', fontWeight: 800, color: 'white', marginTop: '2px', display: 'block' }}>
                                  {startCustomDate ? startCustomDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select Start Date'}
                                </span>
                              </div>
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>➔</span>
                              <div>
                                <span style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>RETURN</span>
                                <span style={{ fontSize: '13px', fontWeight: 800, color: 'white', marginTop: '2px', display: 'block' }}>
                                  {endCustomDate ? endCustomDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select End Date'}
                                </span>
                              </div>
                              {startCustomDate && endCustomDate && (
                                <div style={{ background: 'rgba(236,72,153,0.15)', color: '#ec4899', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 800 }}>
                                  {Math.round((endCustomDate.getTime() - startCustomDate.getTime()) / (1000 * 60 * 60 * 24))} Nights
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="flexible-view"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            style={{ display: 'flex', gap: '10px' }}
                          >
                            {/* Premium Select cards */}
                            {['October 2026', 'December 2026', 'March 2027'].map((monthStr) => {
                              const isMonthSel = flexibleMonth === monthStr;
                              return (
                                <div
                                  key={monthStr}
                                  onClick={() => {
                                    playUISound('click');
                                    setFlexibleMonth(monthStr);
                                    setStartDate('');
                                    setEndDate('');
                                    setStartCustomDate(null);
                                    setEndCustomDate(null);
                                  }}
                                  style={{
                                    flex: 1,
                                    padding: '16px',
                                    borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: isMonthSel ? '1.5px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    position: 'relative',
                                    transition: 'border 0.2s'
                                  }}
                                >
                                  {isMonthSel && (
                                    <motion.div
                                      layoutId="active-flexible-month-border"
                                      style={{
                                        position: 'absolute',
                                        inset: -1.5,
                                        borderRadius: '12px',
                                        border: '1.5px solid transparent',
                                        background: 'var(--brand-gradient)',
                                        WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                                        WebkitMaskComposite: 'xor',
                                        maskComposite: 'exclude',
                                        pointerEvents: 'none'
                                      }}
                                    />
                                  )}
                                  <span style={{ fontSize: '18px', display: 'block', marginBottom: '6px' }}>📅</span>
                                  <span style={{ fontSize: '12px', fontWeight: 800, color: 'white' }}>{monthStr}</span>
                                  <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>Flexible Month Departure</span>
                                </div>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
                      {/* Travelers Count */}
                      <div style={{ textAlign: 'left' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Number of Travelers</label>
                        <input 
                          type="number"
                          value={travelersCount}
                          onChange={(e) => setTravelersCount(Number(e.target.value))}
                          min={1}
                          max={20}
                          style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '10px', color: 'white', fontSize: '13px', outline: 'none' }}
                        />
                      </div>
                    </div>

                    {/* Trip purpose Custom Sliding Segment Selector */}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px', textAlign: 'left' }}>
                      <label style={{ display: 'block', marginBottom: '12px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Trip Purpose / Style</label>
                      <div 
                        style={{ 
                          display: 'flex', 
                          background: 'rgba(255, 255, 255, 0.02)', 
                          padding: '4px', 
                          borderRadius: '30px', 
                          gap: '4px',
                          border: '1px solid var(--card-border)',
                          width: 'fit-content',
                          flexWrap: 'wrap'
                        }}
                      >
                        {['leisure', 'adventure', 'business', 'wellness', 'culture', 'family'].map((style) => {
                          const isPurposeSel = tripPurpose === style;
                          return (
                            <button
                              key={style}
                              type="button"
                              onClick={() => {
                                playUISound('click');
                                setTripPurpose(style);
                              }}
                              style={{
                                position: 'relative',
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                padding: '8px 18px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: 700,
                                color: isPurposeSel ? 'white' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                transition: 'color 0.2s',
                                zIndex: 1
                              }}
                            >
                              {/* Sliding Category selector indicator background */}
                              {isPurposeSel && (
                                <motion.div
                                  layoutId="trip-purpose-active-pill"
                                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                  style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'var(--brand-gradient)',
                                    borderRadius: '20px',
                                    zIndex: -1,
                                    boxShadow: '0 4px 10px rgba(236,72,153,0.2)'
                                  }}
                                />
                              )}
                              {style.charAt(0).toUpperCase() + style.slice(1)}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Budget configure & Custom currency dropdown */}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px', display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '20px', textAlign: 'left' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Target Budget Amount</label>
                        <input 
                          type="number"
                          value={targetBudget}
                          onChange={(e) => setTargetBudget(Number(e.target.value))}
                          min={100}
                          style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '10px', color: 'white', fontSize: '13px', outline: 'none' }}
                        />
                      </div>
                      
                      {/* Custom Currency drop UI */}
                      <div style={{ position: 'relative' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Currency</label>
                        
                        {/* Selector Trigger */}
                        <div
                          onClick={() => {
                            playUISound('click');
                            setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen);
                          }}
                          style={{
                            padding: '12px 14px',
                            background: 'var(--input-bg)',
                            border: '1px solid var(--input-border)',
                            borderRadius: '10px',
                            color: 'white',
                            fontSize: '13px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            userSelect: 'none'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', width: '20px', height: '14px', borderRadius: '2px', overflow: 'hidden' }}>
                              <img 
                                src={currency.includes('USD') ? 'https://flagcdn.com/w40/us.png' : currency.includes('EUR') ? 'https://flagcdn.com/w40/eu.png' : currency.includes('JPY') ? 'https://flagcdn.com/w40/jp.png' : currency.includes('GBP') ? 'https://flagcdn.com/w40/gb.png' : 'https://flagcdn.com/w40/in.png'} 
                                alt="flag" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </span>
                            <span style={{ fontWeight: 700 }}>
                              {currency}
                            </span>
                          </div>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', transform: isCurrencyDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                            ▼
                          </span>
                        </div>

                        {/* Dropdown Options List */}
                        <AnimatePresence>
                          {isCurrencyDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.95 }}
                              transition={{ duration: 0.15 }}
                              style={{
                                position: 'absolute',
                                top: 'calc(100% + 6px)',
                                right: 0,
                                left: 0,
                                background: 'rgba(15, 14, 23, 0.98)',
                                backdropFilter: 'blur(16px)',
                                border: '1px solid var(--card-border)',
                                borderRadius: '12px',
                                boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
                                zIndex: 60,
                                padding: '6px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '2px'
                              }}
                            >
                              {[
                                { code: 'USD', name: 'US Dollar', symbol: '$', flagUrl: 'https://flagcdn.com/w40/us.png' },
                                { code: 'EUR', name: 'Euro', symbol: '€', flagUrl: 'https://flagcdn.com/w40/eu.png' },
                                { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flagUrl: 'https://flagcdn.com/w40/jp.png' },
                                { code: 'GBP', name: 'British Pound', symbol: '£', flagUrl: 'https://flagcdn.com/w40/gb.png' },
                                { code: 'INR', name: 'Indian Rupee', symbol: '₹', flagUrl: 'https://flagcdn.com/w40/in.png' }
                              ].map((opt) => {
                                const isSel = currency.includes(opt.code);
                                return (
                                  <div
                                    key={opt.code}
                                    onClick={() => {
                                      setCurrency(`${opt.symbol} ${opt.code}`);
                                      setIsCurrencyDropdownOpen(false);
                                    }}
                                    style={{
                                      padding: '10px 12px',
                                      borderRadius: '8px',
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      cursor: 'pointer',
                                      background: isSel ? 'rgba(255,255,255,0.06)' : 'transparent',
                                      transition: 'background 0.2s',
                                      textAlign: 'left'
                                    }}
                                    onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                                    onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                      <span style={{ display: 'flex', alignItems: 'center', width: '20px', height: '14px', borderRadius: '2px', overflow: 'hidden' }}>
                                        <img src={opt.flagUrl} alt={opt.code} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                      </span>
                                      <div>
                                        <span style={{ fontSize: '12px', fontWeight: 800, color: 'white', display: 'block' }}>{opt.code}</span>
                                        <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block' }}>{opt.name}</span>
                                      </div>
                                    </div>
                                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#ec4899' }}>{opt.symbol}</span>
                                  </div>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => activeDestination ? setCurrentStep(2) : alert('Please enter or select a destination first')}
                      className="btn-shimmer-sweep"
                      style={{ padding: '14px 28px', background: 'var(--brand-gradient)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 700, fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(236,72,153,0.3)' }}
                    >
                      Next Step: Document Checks &rarr;
                    </button>
                  </div>
                </>
              )}

              {/* ---------------------------------------------------- */}
              {/* STEP 2: DOCUMENTS: PASSPORT & VISA */}
              {/* ---------------------------------------------------- */}
              {currentStep === 2 && (
                <>
                  <div className="discover-premium-card" style={{ padding: '32px', borderRadius: '24px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '32px', textAlign: 'left' }}>
                    
                    {/* Header Title */}
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'white', margin: 0 }}>Step 2: Passport &amp; Visa Guidelines</h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Check travel authorizations and passport validation policies.
                      </p>
                    </div>
                    
                    {/* Nationality Config & Status row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                      {/* Nationality custom flag select */}
                      <div style={{ position: 'relative' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Your Nationality</label>
                        
                        <div
                          onClick={() => {
                            playUISound('click');
                            setIsNationalityDropdownOpen(!isNationalityDropdownOpen);
                          }}
                          style={{
                            padding: '14px',
                            background: 'var(--input-bg)',
                            border: '1px solid var(--input-border)',
                            borderRadius: '12px',
                            color: 'white',
                            fontSize: '13px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            userSelect: 'none'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', width: '22px', height: '15px', borderRadius: '2px', overflow: 'hidden' }}>
                              <img 
                                src={userNationality === 'United States' ? 'https://flagcdn.com/w40/us.png' : userNationality === 'United Kingdom' ? 'https://flagcdn.com/w40/gb.png' : userNationality === 'India' ? 'https://flagcdn.com/w40/in.png' : userNationality === 'Germany' ? 'https://flagcdn.com/w40/de.png' : 'https://flagcdn.com/w40/au.png'} 
                                alt="flag" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </span>
                            <span style={{ fontWeight: 700 }}>{userNationality}</span>
                          </div>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', transform: isNationalityDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                            ▼
                          </span>
                        </div>

                        {/* Dropdown Options */}
                        <AnimatePresence>
                          {isNationalityDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.95 }}
                              transition={{ duration: 0.15 }}
                              style={{
                                position: 'absolute',
                                top: 'calc(100% + 6px)',
                                right: 0,
                                left: 0,
                                background: 'rgba(15, 14, 23, 0.98)',
                                backdropFilter: 'blur(16px)',
                                border: '1px solid var(--card-border)',
                                borderRadius: '12px',
                                boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
                                zIndex: 60,
                                padding: '6px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '2px'
                              }}
                            >
                              {[
                                { name: 'United States', flagUrl: 'https://flagcdn.com/w40/us.png' },
                                { name: 'United Kingdom', flagUrl: 'https://flagcdn.com/w40/gb.png' },
                                { name: 'India', flagUrl: 'https://flagcdn.com/w40/in.png' },
                                { name: 'Germany', flagUrl: 'https://flagcdn.com/w40/de.png' },
                                { name: 'Australia', flagUrl: 'https://flagcdn.com/w40/au.png' }
                              ].map((opt) => {
                                const isSel = userNationality === opt.name;
                                return (
                                  <div
                                    key={opt.name}
                                    onClick={() => {
                                      setUserNationality(opt.name);
                                      setIsNationalityDropdownOpen(false);
                                    }}
                                    style={{
                                      padding: '11px 12px',
                                      borderRadius: '8px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '10px',
                                      cursor: 'pointer',
                                      background: isSel ? 'rgba(255,255,255,0.06)' : 'transparent',
                                      transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                                    onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}
                                  >
                                    <span style={{ display: 'flex', alignItems: 'center', width: '22px', height: '15px', borderRadius: '2px', overflow: 'hidden' }}>
                                      <img src={opt.flagUrl} alt={opt.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </span>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'white' }}>{opt.name}</span>
                                  </div>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      {/* Destination Status Badge Card */}
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Entry Requirement Status</label>
                        <div 
                          style={{ 
                            background: destData.visaStatus.toLowerCase().includes('free') ? 'rgba(16,185,129,0.06)' : 'rgba(245,158,11,0.06)', 
                            border: destData.visaStatus.toLowerCase().includes('free') ? '1px solid rgba(16,185,129,0.15)' : '1px solid rgba(245,158,11,0.15)',
                            padding: '12px 18px', 
                            borderRadius: '12px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '10px',
                            height: '50px'
                          }}
                        >
                          <span style={{ fontSize: '18px' }}>
                            {destData.visaStatus.toLowerCase().includes('free') ? '🟢' : '🟡'}
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: destData.visaStatus.toLowerCase().includes('free') ? '#34d399' : '#fbbf24' }}>
                            {destData.visaStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Visa details cards grid splits */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
                      {/* Policy summary details card */}
                      <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.5px' }}>OFFICIAL POLICY INFO</span>
                        <p style={{ fontSize: '13px', lineHeight: '1.6', margin: 0, color: 'var(--text-secondary)' }}>
                          {destData.visaDetails}
                        </p>
                      </div>

                      {/* CTA Embassy Portal and Processing details */}
                      <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
                        <div>
                          <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 800, display: 'block' }}>EST. PROCESSING TIME</span>
                          <span style={{ fontSize: '15px', fontWeight: 900, color: 'white', display: 'block', marginTop: '2px' }}>{destData.visaTime}</span>
                        </div>

                        <div>
                          <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 800, display: 'block', marginBottom: '6px' }}>PORTAL ACCESS</span>
                          <a 
                            href={destData.visaUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn-shimmer-sweep"
                            style={{ 
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '10px 16px', 
                              background: 'var(--brand-gradient)', 
                              borderRadius: '8px', 
                              color: 'white', 
                              fontSize: '11px', 
                              fontWeight: 800, 
                              textDecoration: 'none',
                              boxShadow: '0 4px 10px rgba(236,72,153,0.15)'
                            }}
                          >
                            Apply Official Portal &rarr;
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Passport Check validity warning alert */}
                    <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.15)', borderRadius: '16px', padding: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ 
                        width: '44px', 
                        height: '44px', 
                        borderRadius: '10px', 
                        background: 'rgba(245, 158, 11, 0.1)', 
                        border: '1px solid rgba(245, 158, 11, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                          {/* Hat Cap Crown */}
                          <path d="M6 6c0-2.5 2.7-3.5 6-3.5s6 1 6 3.5" />
                          {/* Hat Strap Band */}
                          <path d="M5.5 6.5h13" />
                          {/* Visor Brim */}
                          <path d="M4 8c0 1 3.5 1.5 8 1.5s8-.5 8-1.5" />
                          {/* Cap Emblem */}
                          <circle cx="12" cy="4.8" r="0.8" fill="#fbbf24" />
                          
                          {/* Face */}
                          <path d="M8.5 8v1.5c0 2.2 1.5 4 3.5 4s3.5-1.8 3.5-4V8" />
                          {/* Left Ear */}
                          <path d="M8.5 9.5c-.5 0-.8.4-.8.8s.3.8.8.8" />
                          {/* Right Ear */}
                          <path d="M15.5 9.5c.5 0 .8.4 .8.8s-.3.8-.8.8" />
                          
                          {/* Shoulders Outline */}
                          <path d="M3.5 21v-2.5c0-1.8 1.5-3.2 3.5-3.5M20.5 21v-2.5c0-1.8-1.5-3.2-3.5-3.5" />
                          {/* Neck */}
                          <path d="M10 13.5v1.5h4v-1.5" />
                          {/* Collar */}
                          <path d="M8.2 16.5l2-1.5 1.8 1.8 1.8-1.8 2 1.5" />
                          {/* Tie */}
                          <polygon points="11.5,16.8 12.5,16.8 12.8,21 11.2,21" fill="#fbbf24" stroke="none" />
                          {/* Left Badge */}
                          <rect x="5.5" y="18" width="2.5" height="1" rx="0.2" fill="#fbbf24" opacity="0.8" stroke="none" />
                          {/* Right Badge */}
                          <rect x="16" y="18" width="2.5" height="1" rx="0.2" fill="#fbbf24" opacity="0.8" stroke="none" />
                        </svg>
                      </div>
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#fbbf24', display: 'block' }}>Passport Validity Check Warning</span>
                        <p style={{ fontSize: '11px', color: 'rgba(251,191,36,0.8)', margin: '4px 0 0 0', lineHeight: '1.5' }}>
                          Passports must hold at least 6 months validity from departure. Our record indicates your passport expires on <strong>December 12, 2026</strong>. If departing after June 2026, please renew prior to booking checks.
                        </p>
                      </div>
                    </div>

                    {/* Checklists spacious */}
                    <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '24px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'white', margin: '0 0 16px 0' }}>Required Documents Checklist:</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {destData.visaDocuments.map((doc, dIdx) => (
                          <label 
                            key={dIdx} 
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '12px', 
                              fontSize: '12px', 
                              color: 'var(--text-secondary)', 
                              cursor: 'pointer',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              background: 'rgba(255,255,255,0.01)',
                              border: '1px solid rgba(255,255,255,0.03)',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.01)'; }}
                          >
                            <input 
                              type="checkbox" 
                              defaultChecked={dIdx === 0} 
                              style={{ width: '16px', height: '16px', accentColor: '#ec4899', cursor: 'pointer' }}
                            />
                            <span>{doc}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Legal disclaimer */}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: '1.6' }}>
                      Disclaimer: This section is for informational guidance only and does not constitute immigration or legal advice. Please cross-reference with official consulate websites before booking travel.
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button onClick={() => setCurrentStep(1)} style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>&larr; Back</button>
                    <button onClick={() => setCurrentStep(3)} style={{ padding: '12px 24px', background: 'var(--brand-gradient)', border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>Next: Currency &amp; Money &rarr;</button>
                  </div>
                </>
              )}

              {/* ---------------------------------------------------- */}
              {/* STEP 3: CURRENCY & MONEY */}
              {/* ---------------------------------------------------- */}
              {currentStep === 3 && (
                <>
                  <div className="discover-premium-card" style={{ padding: '28px', borderRadius: '20px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '28px' }}>
                    
                    {/* Header Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px' }}>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, fontFamily: 'var(--font-title)', color: 'white' }}>Step 3: Currency &amp; Smart Payment Splits</h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Plan how to carry funds, estimate exchange rates, and minimize foreign transaction fees.</p>
                      </div>
                    </div>

                    {/* Top Widgets Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                      
                      {/* Live Exchange Rate Card */}
                      <div style={{ 
                        background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.05) 0%, rgba(52, 211, 153, 0.01) 100%)', 
                        padding: '24px', 
                        borderRadius: '16px', 
                        border: '1px solid rgba(52, 211, 153, 0.15)', 
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(52, 211, 153, 0.05)', filter: 'blur(10px)' }} />
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Live Exchange Rate</span>
                        <span style={{ fontSize: '26px', fontWeight: 900, color: '#34d399', display: 'block', marginTop: '10px', fontFamily: 'var(--font-title)' }}>
                          1 USD = {getExchangeRateValue().toLocaleString(undefined, { maximumFractionDigits: 2 })} {getLocalCurrencyCode()}
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>Rate fetched live from public exchange API.</span>
                      </div>

                      <div style={{ 
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(245, 158, 11, 0.05) 100%)', 
                        padding: '24px', 
                        borderRadius: '16px', 
                        border: '1px solid rgba(255,255,255,0.06)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>Card vs Cash Recommendation</span>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>
                          <span style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '4px' }}>💳 Card Acceptance: {dynamicFinances.cardAcceptance}%</span>
                          <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>💵 Cash Required: {100 - dynamicFinances.cardAcceptance}%</span>
                        </div>
                        {/* Segmented Progress Track */}
                        <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', overflow: 'hidden', display: 'flex', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ width: `${dynamicFinances.cardAcceptance}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)', boxShadow: '0 0 10px rgba(59,130,246,0.3)' }} />
                          <div style={{ width: `${100 - dynamicFinances.cardAcceptance}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #fbbf24)', boxShadow: '0 0 10px rgba(245,158,11,0.3)' }} />
                        </div>
                      </div>
                    </div>

                    {/* Interactive Forex Calculator */}
                    <div style={{ 
                      background: 'rgba(255, 255, 255, 0.01)', 
                      border: '1px solid var(--card-border)', 
                      borderRadius: '16px', 
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'white', margin: 0 }}>Smart Exchange Calculator</h4>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Enter a USD amount to estimate currency conversion and compare hidden exchange fees.</p>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', fontWeight: 800, color: 'rgba(255,255,255,0.4)' }}>$</span>
                          <input 
                            type="number" 
                            value={calcUsdAmount} 
                            onChange={(e) => setCalcUsdAmount(e.target.value)} 
                            placeholder="Enter USD amount"
                            style={{ 
                              width: '100%', 
                              background: 'rgba(255,255,255,0.02)', 
                              border: '1px solid rgba(255,255,255,0.1)', 
                              borderRadius: '10px', 
                              padding: '12px 14px 12px 28px', 
                              color: 'white', 
                              fontSize: '14px', 
                              fontWeight: 700,
                              outline: 'none',
                              transition: 'border-color 0.2s'
                            }} 
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                          />
                        </div>
                        <span style={{ fontSize: '20px', color: 'rgba(255,255,255,0.2)' }}>&rarr;</span>
                        <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '12px 14px', color: 'white', fontSize: '14px', fontWeight: 800 }}>
                          {( (parseFloat(calcUsdAmount) || 0) * getExchangeRateValue() ).toLocaleString(undefined, { maximumFractionDigits: 2 })} {getLocalCurrencyCode()}
                        </div>
                      </div>
                    </div>

                    {/* Comparison Cards Grid (Replacing Table) */}
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '14px' }}>Compare Exchange Options</span>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        
                        {/* Option 1: Airport Kiosk */}
                        <div style={{ 
                          background: 'rgba(255,255,255,0.01)', 
                          border: '1px solid rgba(239, 68, 68, 0.15)', 
                          borderRadius: '16px', 
                          padding: '20px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          position: 'relative'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', fontWeight: 800, color: 'white' }}>✈️ Airport Kiosk</span>
                            <span style={{ fontSize: '9px', fontWeight: 800, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '3px 8px', borderRadius: '20px', textTransform: 'uppercase' }}>High Markup</span>
                          </div>
                          
                          <div style={{ margin: '4px 0' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Typical Fee Range</span>
                            <span style={{ fontSize: '20px', fontWeight: 800, color: '#ef4444' }}>8% - 12%</span>
                          </div>

                          <div style={{ background: 'rgba(239, 68, 68, 0.03)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.05)', fontSize: '11px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.4' }}>
                            Convenient but extremely expensive. Avoid unless emergency.
                          </div>

                          <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Estimated Loss:</span>
                            <span style={{ fontWeight: 800, color: '#ef4444' }}>
                              ${((parseFloat(calcUsdAmount) || 0) * 0.10).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Option 2: Local Bank ATM */}
                        <div style={{ 
                          background: 'linear-gradient(to bottom, rgba(16, 185, 129, 0.02), transparent)', 
                          border: '1px solid rgba(16, 185, 129, 0.3)', 
                          borderRadius: '16px', 
                          padding: '20px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          boxShadow: '0 4px 20px rgba(16, 185, 129, 0.05)'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', fontWeight: 800, color: 'white' }}>🏦 Local Bank ATM</span>
                            <span style={{ fontSize: '9px', fontWeight: 800, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '3px 8px', borderRadius: '20px', textTransform: 'uppercase' }}>Recommended</span>
                          </div>
                          
                          <div style={{ margin: '4px 0' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Typical Fee Range</span>
                            <span style={{ fontSize: '20px', fontWeight: 800, color: '#10b981' }}>1% - 3%</span>
                          </div>

                          <div style={{ background: 'rgba(16, 185, 129, 0.03)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.05)', fontSize: '11px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.4' }}>
                            Best exchange rate margin. Always select local currency option if prompted.
                          </div>

                          <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Estimated Loss:</span>
                            <span style={{ fontWeight: 800, color: '#10b981' }}>
                              ${((parseFloat(calcUsdAmount) || 0) * 0.02).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Option 3: Forex Card */}
                        <div style={{ 
                          background: 'rgba(255,255,255,0.01)', 
                          border: '1px solid rgba(245, 158, 11, 0.15)', 
                          borderRadius: '16px', 
                          padding: '20px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', fontWeight: 800, color: 'white' }}>💳 Forex Card / Bank</span>
                            <span style={{ fontSize: '9px', fontWeight: 800, background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '3px 8px', borderRadius: '20px', textTransform: 'uppercase' }}>Good Alternative</span>
                          </div>
                          
                          <div style={{ margin: '4px 0' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Typical Fee Range</span>
                            <span style={{ fontSize: '20px', fontWeight: 800, color: '#f59e0b' }}>2% - 4%</span>
                          </div>

                          <div style={{ background: 'rgba(245, 158, 11, 0.03)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.05)', fontSize: '11px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.4' }}>
                            Secure pre-loaded cards but minor transaction markup overlays apply.
                          </div>

                          <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Estimated Loss:</span>
                            <span style={{ fontWeight: 800, color: '#f59e0b' }}>
                              ${((parseFloat(calcUsdAmount) || 0) * 0.03).toFixed(2)}
                            </span>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Forex Advice Alert Box */}
                    <div style={{ 
                      background: 'rgba(255,255,255,0.01)', 
                      border: '1px solid var(--card-border)', 
                      borderRadius: '16px', 
                      padding: '20px',
                      display: 'flex',
                      gap: '14px',
                      alignItems: 'flex-start'
                    }}>
                      <span style={{ fontSize: '18px' }}>💡</span>
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: 'white', display: 'block', marginBottom: '4px' }}>Smart Withdrawal Advice</span>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                          {dynamicFinances.advice}
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button onClick={() => setCurrentStep(2)} style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>&larr; Back</button>
                    <button onClick={() => setCurrentStep(4)} style={{ padding: '12px 24px', background: 'var(--brand-gradient)', border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>Next: Flight Booking &rarr;</button>
                  </div>
                </>
              )}

              {/* ---------------------------------------------------- */}
              {/* STEP 4: FLIGHTS SEARCH & BOOK */}
              {/* ---------------------------------------------------- */}
              {currentStep === 4 && (
                <>
                  {/* Invisible definition of primary gradient for the Plane Logo SVG */}
                  <svg style={{ height: 0, width: 0, position: 'absolute' }}>
                    <defs>
                      <linearGradient id="primary-glow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>

                  <div className="discover-premium-card" style={{ padding: '28px', borderRadius: '20px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, fontFamily: 'var(--font-title)' }}>
                      {isBookingReturnFlight ? 'Step 4: Licensed Partner Return Flight Comparisons' : 'Step 4: Licensed Partner Flight Comparisons'}
                    </h3>
                    
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {isBookingReturnFlight ? 'Booking return flights back to your home destination.' : 'Prices update live from our booking partners.'}
                    </span>

                    {/* Passengers Selector */}
                    {!isFlightBooked && (
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '16px 20px', 
                        background: 'rgba(255,255,255,0.02)', 
                        border: '1px solid rgba(255,255,255,0.05)', 
                        borderRadius: '14px',
                        textAlign: 'left'
                      }}>
                        <div>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: 'white', display: 'block' }}>Number of Passengers</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Adjust the number of tickets to book</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <button 
                            type="button"
                            onClick={() => { playUISound('click'); setTravelersCount(prev => Math.max(1, prev - 1)); }}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              color: 'white',
                              cursor: 'pointer',
                              fontSize: '16px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            -
                          </button>
                          <span style={{ fontSize: '15px', fontWeight: 800, color: 'white', minWidth: '20px', textAlign: 'center' }}>
                            {travelersCount}
                          </span>
                          <button 
                            type="button"
                            onClick={() => { playUISound('click'); setTravelersCount(prev => Math.min(20, prev + 1)); }}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              color: 'white',
                              cursor: 'pointer',
                              fontSize: '16px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Flight list */}
                    {!isFlightBooked ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {destData.flights.map((flight) => {
                          const isSelected = selectedOutboundFlight?.id === flight.id;
                          const route = getFlightRouteDetails();
                          return (
                            <div 
                              key={flight.id}
                              style={{
                                padding: '24px 20px',
                                background: isSelected ? 'rgba(236,72,153,0.04)' : 'rgba(255,255,255,0.01)',
                                border: isSelected ? '1.5px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '18px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '24px',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                boxShadow: isSelected ? '0 10px 30px rgba(236,72,153,0.05)' : 'none'
                              }}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedOutboundFlight(null);
                                  setSelectedReturnFlight(null);
                                  setIsFlightBooked(false);
                                  setIsRedirecting(false);
                                } else {
                                  setSelectedOutboundFlight(flight);
                                  setSelectedReturnFlight({ price: 0 });
                                  setIsFlightBooked(false);
                                  setIsRedirecting(false);
                                }
                              }}
                            >
                              {/* Left: Airline Icon & Name */}
                              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', width: '25%' }}>
                                <div style={{ 
                                  width: '42px', 
                                  height: '42px', 
                                  background: isSelected ? 'var(--brand-gradient)' : 'rgba(255,255,255,0.03)', 
                                  borderRadius: '12px', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  color: isSelected ? 'white' : 'var(--primary)',
                                  boxShadow: isSelected ? '0 4px 12px rgba(236,72,153,0.2)' : 'none',
                                  transition: 'all 0.3s ease',
                                  flexShrink: 0
                                }}>
                                  <PlaneLogoSVG size={22} color={isSelected ? 'white' : 'url(#primary-glow-grad)'} />
                                </div>
                                <div>
                                  <span style={{ fontSize: '14px', fontWeight: 800, color: 'white', display: 'block', letterSpacing: '-0.3px' }}>{flight.airline}</span>
                                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px', display: 'block' }}>Carrier</span>
                                </div>
                              </div>

                              {/* Middle: Flight Timeline Visual Route */}
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', justifyContent: 'center' }}>
                                  
                                  {/* Departure Point */}
                                  <div style={{ textAlign: 'right', minWidth: '60px' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 800, color: 'white', display: 'block' }}>{route.from}</span>
                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>{route.fromCity}</span>
                                  </div>

                                  {/* Timeline Path Line with SVG */}
                                  <div style={{ display: 'flex', alignItems: 'center', position: 'relative', flex: 1, minWidth: '80px', justifyContent: 'center' }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)' }} />
                                    
                                    <div style={{ 
                                      height: '2px', 
                                      flex: 1, 
                                      background: 'linear-gradient(to right, var(--text-muted), var(--primary), var(--text-muted))', 
                                      opacity: 0.6,
                                      margin: '0 8px',
                                      position: 'relative'
                                    }}>
                                      <div style={{ 
                                        position: 'absolute', 
                                        top: '50%', 
                                        left: '50%', 
                                        transform: 'translate(-50%, -50%)', 
                                        background: 'var(--card-bg)', 
                                        padding: '0 6px'
                                      }}>
                                        <PlaneLogoSVG size={14} color="var(--primary)" />
                                      </div>
                                    </div>

                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 8px var(--primary)' }} />
                                  </div>

                                  {/* Destination Point */}
                                  <div style={{ textAlign: 'left', minWidth: '60px' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 800, color: 'white', display: 'block' }}>{route.to}</span>
                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>{route.toCity}</span>
                                  </div>

                                </div>

                                {/* Stops & Duration Badges */}
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{flight.duration}</span>
                                  <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--text-muted)' }} />
                                  <span style={{ 
                                    fontSize: '9px', 
                                    fontWeight: 800, 
                                    background: flight.stops.includes('Non-stop') ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', 
                                    color: flight.stops.includes('Non-stop') ? '#10b981' : '#f59e0b', 
                                    padding: '2px 8px', 
                                    borderRadius: '20px',
                                    textTransform: 'uppercase'
                                  }}>
                                    {flight.stops}
                                  </span>
                                </div>

                              </div>

                              {/* Right: Pricing & CTA */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', width: '30%', justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
                                <div style={{ textAlign: 'right' }}>
                                  <span style={{ fontSize: '22px', fontWeight: 900, color: 'white', display: 'block', fontFamily: 'var(--font-title)' }}>${flight.price}</span>
                                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>round-trip</span>
                                  {travelersCount > 1 && (
                                    <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 700, display: 'block', marginTop: '2px' }}>
                                      ${flight.price * travelersCount} total ({travelersCount} tickets)
                                    </span>
                                  )}
                                </div>

                                <button
                                  onClick={() => {
                                    if (isSelected) {
                                      setSelectedOutboundFlight(null);
                                      setSelectedReturnFlight(null);
                                      setIsFlightBooked(false);
                                      setIsRedirecting(false);
                                    } else {
                                      setSelectedOutboundFlight(flight);
                                      setSelectedReturnFlight({ price: 0 });
                                      setIsFlightBooked(false);
                                      setIsRedirecting(false);
                                    }
                                  }}
                                  style={{
                                    padding: '10px 16px',
                                    background: isSelected ? 'transparent' : 'var(--brand-gradient)',
                                    border: isSelected ? '1.5px solid var(--primary)' : 'none',
                                    borderRadius: '10px',
                                    color: isSelected ? 'var(--primary)' : 'white',
                                    fontSize: '11px',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {isSelected ? '✓ Selected' : 'Select'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* State C: Flight Booked / Confirmed Summary Card */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {(() => {
                          const route = getFlightRouteDetails();
                          return (
                            <div 
                              style={{
                                padding: '20px',
                                background: 'rgba(16,185,129,0.04)',
                                border: '1.5px solid #10b981',
                                borderRadius: '18px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '24px'
                              }}
                            >
                              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', width: '30%' }}>
                                <div style={{ 
                                  width: '42px', 
                                  height: '42px', 
                                  background: '#10b981', 
                                  borderRadius: '12px', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center', 
                                  color: 'white',
                                  boxShadow: '0 4px 12px rgba(16,185,129,0.2)',
                                  flexShrink: 0
                                }}>
                                  <PlaneLogoSVG size={22} color="white" />
                                </div>
                                <div>
                                  <span style={{ fontSize: '14px', fontWeight: 800, color: 'white', display: 'block' }}>{selectedOutboundFlight.airline}</span>
                                  <span style={{ fontSize: '9px', fontWeight: 800, background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>CONFIRMED</span>
                                </div>
                              </div>

                              {/* Route Timeline */}
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', justifyContent: 'center' }}>
                                  <div style={{ textAlign: 'right', minWidth: '60px' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 800, color: 'white', display: 'block' }}>{route.from}</span>
                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>{route.fromCity}</span>
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', position: 'relative', flex: 1, minWidth: '80px', justifyContent: 'center' }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)' }} />
                                    <div style={{ height: '2px', flex: 1, background: '#10b981', opacity: 0.6, margin: '0 8px', position: 'relative' }}>
                                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'var(--card-bg)', padding: '0 6px' }}>
                                        <PlaneLogoSVG size={14} color="#10b981" />
                                      </div>
                                    </div>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                                  </div>

                                  <div style={{ textAlign: 'left', minWidth: '60px' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 800, color: 'white', display: 'block' }}>{route.to}</span>
                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>{route.toCity}</span>
                                  </div>
                                </div>
                                
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{selectedOutboundFlight.duration} • {selectedOutboundFlight.stops}</span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', width: '25%', justifyContent: 'flex-end' }}>
                                <div style={{ textAlign: 'right' }}>
                                  <span style={{ fontSize: '20px', fontWeight: 900, color: '#10b981', display: 'block' }}>${selectedOutboundFlight.price}</span>
                                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>round-trip</span>
                                  {travelersCount > 1 && (
                                    <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 700, display: 'block', marginTop: '2px' }}>
                                      ${selectedOutboundFlight.price * travelersCount} total ({travelersCount} tickets)
                                    </span>
                                  )}
                                </div>
                                
                                <button
                                  onClick={() => {
                                    setSelectedOutboundFlight(null);
                                    setSelectedReturnFlight(null);
                                    setIsFlightBooked(false);
                                    setIsRedirecting(false);
                                  }}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    textDecoration: 'underline',
                                    cursor: 'pointer',
                                    padding: '8px 12px'
                                  }}
                                >
                                  Change Flight
                                </button>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {selectedOutboundFlight && !isFlightBooked && !isRedirecting && (
                      <div style={{ 
                        background: 'rgba(255,255,255,0.01)', 
                        border: '1px solid rgba(255,255,255,0.05)', 
                        borderRadius: '18px', 
                        padding: '24px', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        gap: '24px' 
                      }}>
                        <div>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: 'white', display: 'block' }}>Selected: {selectedOutboundFlight.airline} (${selectedOutboundFlight.price} x {travelersCount} = ${selectedOutboundFlight.price * travelersCount})</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px', lineHeight: '1.4' }}>
                            We will redirect you to Skyscanner to search live seat inventory for {travelersCount} travelers and finalize payment.
                          </span>
                        </div>
                        <button 
                          onClick={() => {
                            window.open(getSkyscannerUrl(activeDestination), '_blank');
                            setIsRedirecting(true);
                          }}
                          style={{ 
                            background: 'var(--brand-gradient)', 
                            border: 'none', 
                            color: 'white', 
                            borderRadius: '10px', 
                            padding: '12px 24px', 
                            fontSize: '12px', 
                            fontWeight: 800, 
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(236,72,153,0.2)',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Checkout on Skyscanner &rarr;
                        </button>
                      </div>
                    )}

                    {selectedOutboundFlight && !isFlightBooked && isRedirecting && (
                      <div style={{ 
                        background: 'rgba(236,72,153,0.02)', 
                        border: '1px solid rgba(236,72,153,0.2)', 
                        borderRadius: '18px', 
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary)', display: 'block' }}>Skyscanner Checkout Session Active</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>Complete your ticket purchase in the newly opened Skyscanner tab.</span>
                          </div>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: TRV-{Math.floor(Math.random() * 90000) + 10000}</span>
                        </div>

                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                          We have pre-configured search parameters for <strong>{selectedOutboundFlight.airline}</strong>. Once you finish checkout and payment on Skyscanner, click <strong>Verify &amp; Confirm Booking</strong> below to import this reservation into your trip itinerary.
                        </div>

                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                          <button 
                            onClick={() => {
                              setIsFlightBooked(true);
                              setIsRedirecting(false);
                            }}
                            style={{ 
                              background: '#10b981', 
                              border: 'none', 
                              color: 'white', 
                              borderRadius: '10px', 
                              padding: '12px 24px', 
                              fontSize: '12px', 
                              fontWeight: 800, 
                              cursor: 'pointer',
                              boxShadow: '0 4px 12px rgba(16,185,129,0.2)'
                            }}
                          >
                            ✓ Verify &amp; Confirm Booking
                          </button>
                          
                          <button
                            onClick={() => {
                              setIsRedirecting(false);
                              setSelectedOutboundFlight(null);
                              setSelectedReturnFlight(null);
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-muted)',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              textDecoration: 'underline'
                            }}
                          >
                            Cancel Selection
                          </button>
                        </div>
                      </div>
                    )}

                    {selectedOutboundFlight && isFlightBooked && (
                      <div style={{ 
                        background: 'rgba(16,185,129,0.06)', 
                        border: '1px solid rgba(16,185,129,0.15)', 
                        borderRadius: '18px', 
                        padding: '24px', 
                        display: 'flex', 
                        gap: '16px', 
                        alignItems: 'center' 
                      }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '50%', 
                          background: 'rgba(16,185,129,0.15)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          color: '#10b981', 
                          fontSize: '20px', 
                          fontWeight: 800, 
                          flexShrink: 0 
                        }}>
                          ✓
                        </div>
                        <div>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: '#34d399', display: 'block' }}>Flight Confirmed!</span>
                          <span style={{ fontSize: '12px', color: 'rgba(52,211,153,0.8)', display: 'block', marginTop: '4px', lineHeight: '1.4' }}>
                            Pre-authorized with official Skyscanner booking links. Your seat is fully secured and added to your projected budget.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button 
                      onClick={() => {
                        if (isBookingReturnFlight) {
                          setIsBookingReturnFlight(false);
                          setCurrentStep(9);
                        } else {
                          setCurrentStep(3);
                        }
                      }} 
                      style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}
                    >
                      &larr; Back
                    </button>
                    <button 
                      onClick={() => {
                        if (isBookingReturnFlight) {
                          setIsBookingReturnFlight(false);
                          setCurrentStep(9);
                        } else {
                          setCurrentStep(5);
                        }
                      }} 
                      style={{ padding: '12px 24px', background: 'var(--brand-gradient)', border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}
                    >
                      {isBookingReturnFlight ? 'Return to Checklist \u2192' : 'Next: Stays & Accommodation \u2192'}
                    </button>
                  </div>
                </>
              )}

              {/* ---------------------------------------------------- */}
              {/* STEP 5: WHERE TO STAY */}
              {/* ---------------------------------------------------- */}
              {currentStep === 5 && (
                <>
                  <div className="discover-premium-card" style={{ padding: '28px', borderRadius: '20px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Step 5: Verified Venture &amp; Partner Hotels</h3>
                      
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>VENTURE PARTNERS PRIORITIZED</span>
                    </div>

                    {/* Filter controls */}
                    <div style={{ display: 'flex', gap: '16px', background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>STAY NIGHTS:</span>
                      <input 
                        type="number" 
                        value={stayNights} 
                        onChange={(e) => setStayNights(Number(e.target.value))} 
                        min={1} 
                        style={{ width: '60px', padding: '6px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '6px', color: 'white', fontSize: '12px' }} 
                      />

                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '16px' }}>MIN RATING:</span>
                      <select 
                        value={stayRatingFilter} 
                        onChange={(e) => setStayRatingFilter(Number(e.target.value))}
                        style={{ padding: '6px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '6px', color: 'white', fontSize: '12px' }}
                      >
                        <option value={4.0}>4.0+ Stars</option>
                        <option value={4.5}>4.5+ Stars</option>
                        <option value={4.8}>4.8+ Stars</option>
                      </select>
                    </div>

                    {/* Stay listings */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {destData.ventures
                        .filter(stay => stay.rating >= stayRatingFilter)
                        .map((stay) => {
                          const isBooked = bookedStay?.id === stay.id;
                          const totalStayPrice = stay.price * stayNights;
                          return (
                            <div 
                              key={stay.id}
                              style={{
                                display: 'flex',
                                background: 'rgba(255,255,255,0.02)',
                                border: isBooked ? '1.5px solid var(--primary)' : '1px solid rgba(255,255,255,0.06)',
                                borderRadius: '16px',
                                overflow: 'hidden'
                              }}
                            >
                              <img src={stay.image} alt={stay.name} style={{ width: '130px', objectFit: 'cover' }} />
                              <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '10px', background: 'rgba(236,72,153,0.15)', color: '#ec4899', padding: '3px 8px', borderRadius: '4px', fontWeight: 800 }}>
                                      VENTURE PARTNER
                                    </span>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{stay.category}</span>
                                  </div>
                                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'white', margin: '4px 0' }}>{stay.name}</h4>
                                  <span style={{ fontSize: '11px', color: '#fbbf24', fontWeight: 700 }}>★ {stay.rating} rating</span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                                  <div>
                                    <span style={{ fontSize: '14px', fontWeight: 900, color: 'white' }}>${stay.price}</span>
                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}> / night (${totalStayPrice} total)</span>
                                  </div>
                                  
                                  <button
                                    onClick={() => {
                                      if (isBooked) {
                                        setBookedStay(null);
                                      } else {
                                        setBookedStay(stay);
                                        alert(`Stay booked successfully! Total cost $${totalStayPrice} added to your budget projected expenditure.`);
                                      }
                                    }}
                                    style={{
                                      padding: '8px 16px',
                                      background: isBooked ? '#ef4444' : 'var(--primary)',
                                      border: 'none',
                                      borderRadius: '8px',
                                      color: 'white',
                                      fontSize: '11px',
                                      fontWeight: 800,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    {isBooked ? 'Cancel Booking' : 'Book Stay'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button onClick={() => setCurrentStep(4)} style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>&larr; Back</button>
                    <button onClick={() => setCurrentStep(6)} style={{ padding: '12px 24px', background: 'var(--brand-gradient)', border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>Next: Itinerary timeline &rarr;</button>
                  </div>
                </>
              )}

              {/* ---------------------------------------------------- */}
              {/* STEP 6: ITINERARY PLAN */}
              {/* ---------------------------------------------------- */}
              {currentStep === 6 && (
                <>
                  <div className="discover-premium-card" style={{ padding: '28px', borderRadius: '20px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Step 6: Editable Itinerary Timeline</h3>

                    {/* Day Navigator */}
                    {activeItinerary.length > 0 && (
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        gap: '12px',
                        padding: '16px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '16px',
                        marginBottom: '8px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', width: '100%', justifyContent: 'space-between' }}>
                          <button
                            type="button"
                            disabled={selectedItineraryDay === 1}
                            onClick={() => { playUISound('click'); setSelectedItineraryDay(prev => Math.max(1, prev - 1)); }}
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: selectedItineraryDay === 1 ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              color: selectedItineraryDay === 1 ? 'var(--text-muted)' : 'white',
                              cursor: selectedItineraryDay === 1 ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '14px',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            ◀
                          </button>

                          <div style={{ textAlign: 'center' }}>
                            <span style={{ fontSize: '18px', fontWeight: 900, color: 'white', display: 'block', fontFamily: 'var(--font-title)' }}>
                              Day {selectedItineraryDay}
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                              of {activeItinerary.length} Days Trip Guide
                            </span>
                          </div>

                          <button
                            type="button"
                            disabled={selectedItineraryDay === activeItinerary.length}
                            onClick={() => { playUISound('click'); setSelectedItineraryDay(prev => Math.min(activeItinerary.length, prev + 1)); }}
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: selectedItineraryDay === activeItinerary.length ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              color: selectedItineraryDay === activeItinerary.length ? 'var(--text-muted)' : 'white',
                              cursor: selectedItineraryDay === activeItinerary.length ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '14px',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            ▶
                          </button>
                        </div>

                        {/* Progress Dots */}
                        <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                          {activeItinerary.map((dayPlan) => {
                            const isCurrent = dayPlan.day === selectedItineraryDay;
                            return (
                              <div
                                key={dayPlan.day}
                                onClick={() => { playUISound('tap'); setSelectedItineraryDay(dayPlan.day); }}
                                style={{
                                  width: isCurrent ? '24px' : '8px',
                                  height: '8px',
                                  borderRadius: '4px',
                                  background: isCurrent ? 'var(--brand-gradient)' : 'rgba(255,255,255,0.15)',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease'
                                }}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Day Timeline Activities */}
                    <div style={{ position: 'relative', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
                      {/* Vertical line connecting the dots */}
                      {activeItinerary[selectedItineraryDay - 1]?.activities.length > 1 && (
                        <div style={{ 
                          position: 'absolute', 
                          top: '12px', 
                          bottom: '12px', 
                          left: '7px', 
                          width: '2px', 
                          background: 'linear-gradient(to bottom, var(--primary), var(--secondary))',
                          opacity: 0.4
                        }} />
                      )}

                      {activeItinerary[selectedItineraryDay - 1]?.activities.map((act: any, actIdx: number) => (
                        <div 
                          key={act.id} 
                          style={{
                            display: 'flex',
                            position: 'relative',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'rgba(255,255,255,0.015)',
                            padding: '16px 20px',
                            borderRadius: '16px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            transition: 'all 0.25s ease',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                          }}
                        >
                          {/* Dot on the left timeline */}
                          <div style={{
                            position: 'absolute',
                            left: '-21px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: 'var(--primary)',
                            boxShadow: '0 0 8px var(--primary)',
                            zIndex: 2
                          }} />

                          {/* Left contents: Time and title */}
                          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', textAlign: 'left' }}>
                            <span style={{ 
                              fontSize: '11px', 
                              fontWeight: 800,
                              color: 'white', 
                              background: 'rgba(255,255,255,0.05)', 
                              padding: '6px 12px', 
                              borderRadius: '8px',
                              border: '1px solid rgba(255,255,255,0.08)',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}>
                              {act.time}
                            </span>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>{act.title}</span>
                          </div>

                          {/* Right contents: Cost, Up/Down, Remove */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 800 }}>${act.cost}</span>
                            
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button 
                                onClick={() => handleMoveActivity(selectedItineraryDay - 1, actIdx, 'up')} 
                                disabled={actIdx === 0} 
                                style={{ 
                                  background: 'rgba(255,255,255,0.03)', 
                                  border: '1px solid rgba(255,255,255,0.05)', 
                                  color: actIdx === 0 ? 'rgba(255,255,255,0.1)' : 'white', 
                                  borderRadius: '6px',
                                  width: '24px',
                                  height: '24px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: actIdx === 0 ? 'not-allowed' : 'pointer',
                                  fontSize: '10px',
                                  transition: 'all 0.2s'
                                }}
                              >
                                ▲
                              </button>
                              <button 
                                onClick={() => handleMoveActivity(selectedItineraryDay - 1, actIdx, 'down')} 
                                disabled={actIdx === activeItinerary[selectedItineraryDay - 1].activities.length - 1} 
                                style={{ 
                                  background: 'rgba(255,255,255,0.03)', 
                                  border: '1px solid rgba(255,255,255,0.05)', 
                                  color: actIdx === activeItinerary[selectedItineraryDay - 1].activities.length - 1 ? 'rgba(255,255,255,0.1)' : 'white', 
                                  borderRadius: '6px',
                                  width: '24px',
                                  height: '24px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: actIdx === activeItinerary[selectedItineraryDay - 1].activities.length - 1 ? 'not-allowed' : 'pointer',
                                  fontSize: '10px',
                                  transition: 'all 0.2s'
                                }}
                              >
                                ▼
                              </button>
                            </div>
                            
                            <button 
                              onClick={() => handleRemoveActivity(selectedItineraryDay - 1, act.id)}
                              style={{ 
                                background: 'rgba(239,68,68,0.05)', 
                                border: '1px solid rgba(239,68,68,0.15)', 
                                color: '#f87171', 
                                borderRadius: '8px',
                                padding: '6px 12px',
                                fontSize: '11px', 
                                fontWeight: 800, 
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.05)'; }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}

                      {(!activeItinerary[selectedItineraryDay - 1] || activeItinerary[selectedItineraryDay - 1].activities.length === 0) && (
                        <div style={{ 
                          padding: '32px 16px', 
                          textAlign: 'center', 
                          color: 'var(--text-muted)', 
                          fontSize: '12px', 
                          background: 'rgba(255,255,255,0.01)', 
                          border: '2px dashed rgba(255,255,255,0.05)', 
                          borderRadius: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span style={{ fontSize: '24px' }}>🗺️</span>
                          <span>No activities scheduled for Day {selectedItineraryDay}.</span>
                          <span style={{ fontSize: '11px' }}>Browse and add spots from the next step!</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button onClick={() => setCurrentStep(5)} style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>&larr; Back</button>
                    <button onClick={() => setCurrentStep(7)} style={{ padding: '12px 24px', background: 'var(--brand-gradient)', border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>Next: Food &amp; Attractions &rarr;</button>
                  </div>
                </>
              )}

              {/* ---------------------------------------------------- */}
              {/* STEP 7: FOOD, PLACES & SOUVENIRS */}
              {/* ---------------------------------------------------- */}
              {currentStep === 7 && (
                <>
                  <div className="discover-premium-card" style={{ padding: '28px', borderRadius: '20px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Step 7: Local Spots, Cuisine &amp; Souvenirs</h3>

                    {/* Grid of options */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '28px' }}>
                      
                      {/* Attractions list with Add to Itinerary triggers */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--primary)' }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
                          </span>
                          <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'white', margin: 0, fontFamily: 'var(--font-title)' }}>Curated Local Attractions</h4>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          {destData.attractions.map((attr) => (
                            <div 
                              key={attr.id}
                              style={{
                                padding: '20px',
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.005) 100%)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderLeft: '4px solid var(--primary)',
                                borderRadius: '14px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '16px',
                                transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.borderColor = 'rgba(236,72,153,0.3)';
                                e.currentTarget.style.boxShadow = '0 8px 30px rgba(236,72,153,0.08)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
                              }}
                            >
                              <div style={{ textAlign: 'left', flex: 1 }}>
                                <span style={{ fontSize: '14px', fontWeight: 800, color: 'white', display: 'block' }}>{attr.name}</span>
                                
                                <div style={{ display: 'flex', gap: '8px', margin: '8px 0', flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: '10px', color: 'white', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', padding: '3px 8px', borderRadius: '20px' }}>
                                    ⏱️ {attr.duration}
                                  </span>
                                  <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 700, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', padding: '3px 8px', borderRadius: '20px' }}>
                                    Cost: {attr.cost === 0 ? 'Free' : `$${attr.cost}`}
                                  </span>
                                </div>
                                
                                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>{attr.desc}</p>
                              </div>
                              
                              <button
                                onClick={() => {
                                  playUISound('click');
                                  handleAddActivity(selectedItineraryDay - 1, attr.name, attr.cost);
                                  alert(`"${attr.name}" added to Day ${selectedItineraryDay} Timeline! Check Step 6.`);
                                }}
                                style={{
                                  background: 'var(--brand-gradient)',
                                  border: 'none',
                                  color: 'white',
                                  padding: '10px 16px',
                                  borderRadius: '10px',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  alignSelf: 'center',
                                  whiteSpace: 'nowrap',
                                  boxShadow: '0 4px 12px rgba(236,72,153,0.2)',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                              >
                                + Add Day {selectedItineraryDay}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Food & Souvenirs */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        
                        {/* Food / Cuisine Card */}
                        <div style={{ 
                          padding: '20px', 
                          background: 'rgba(255,255,255,0.01)', 
                          border: '1px solid rgba(255,255,255,0.04)', 
                          borderRadius: '16px' 
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px' }}>
                              <img src="/cuisine-icon.png" alt="Cuisine" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </span>
                            <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'white', margin: 0, fontFamily: 'var(--font-title)' }}>Local Signature Cuisine</h4>
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {destData.food.map((dish, dIdx) => (
                              <div 
                                key={dIdx} 
                                style={{ 
                                  background: 'rgba(255,255,255,0.015)', 
                                  padding: '12px 14px', 
                                  border: '1px solid rgba(255,255,255,0.03)', 
                                  borderRadius: '12px',
                                  textAlign: 'left',
                                  transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.015)'; }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                  <span style={{ fontSize: '12px', fontWeight: 800, color: 'white' }}>{dish.name}</span>
                                  <span style={{ 
                                    fontSize: '9px', 
                                    color: '#fbbf24', 
                                    fontWeight: 800, 
                                    background: 'rgba(251,191,36,0.08)', 
                                    padding: '2px 6px', 
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '3px'
                                  }}>
                                    ★ {dish.rating}
                                  </span>
                                </div>
                                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>{dish.desc}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Souvenirs Card */}
                        <div style={{ 
                          padding: '20px', 
                          background: 'rgba(255,255,255,0.01)', 
                          border: '1px solid rgba(255,255,255,0.04)', 
                          borderRadius: '16px' 
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px' }}>
                              <img src="/souvenirs-icon.png" alt="Souvenirs" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </span>
                            <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'white', margin: 0, fontFamily: 'var(--font-title)' }}>Recommended Souvenirs</h4>
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {destData.souvenirs.map((item, sIdx) => (
                              <div 
                                key={sIdx} 
                                style={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between', 
                                  alignItems: 'center',
                                  background: 'rgba(255,255,255,0.015)', 
                                  padding: '12px 14px', 
                                  border: '1px solid rgba(255,255,255,0.03)', 
                                  borderRadius: '12px',
                                  textAlign: 'left',
                                  transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.015)'; }}
                              >
                                <div>
                                  <span style={{ fontSize: '12px', fontWeight: 800, color: 'white', display: 'block' }}>{item.name}</span>
                                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
                                      {item.location}
                                    </span>
                                  </span>
                                </div>
                                <span style={{ 
                                  fontSize: '11px', 
                                  fontWeight: 800, 
                                  color: '#34d399',
                                  background: 'rgba(52,211,153,0.08)',
                                  padding: '3px 8px',
                                  borderRadius: '6px'
                                }}>
                                  {item.price}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button onClick={() => setCurrentStep(6)} style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>&larr; Back</button>
                    <button onClick={() => setCurrentStep(8)} style={{ padding: '12px 24px', background: 'var(--brand-gradient)', border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>Next: Budget Tracker &rarr;</button>
                  </div>
                </>
              )}

              {/* ---------------------------------------------------- */}
              {/* STEP 8: BUDGET TRACKER */}
              {/* ---------------------------------------------------- */}
              {currentStep === 8 && (
                <>
                  <div className="discover-premium-card" style={{ padding: '28px', borderRadius: '20px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Step 8: Budget Dashboard &amp; Analytics</h3>

                    {/* Warning state if over budget */}
                    {isOverBudget && (
                      <div style={{ 
                        background: 'linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(239,68,68,0.02) 100%)', 
                        border: '1px solid rgba(239,68,68,0.15)', 
                        borderLeft: '4px solid #ef4444',
                        borderRadius: '16px', 
                        padding: '18px 24px', 
                        display: 'flex', 
                        gap: '16px', 
                        alignItems: 'center',
                        boxShadow: '0 4px 30px rgba(239,68,68,0.03)',
                        backdropFilter: 'blur(4px)',
                        textAlign: 'left'
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', flexShrink: 0 }}>
                          <img src="/budget-warning-icon.png" alt="Warning" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </span>
                        <div>
                          <span style={{ fontSize: '13px', fontWeight: 900, color: '#f87171', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Warning: Budget Limit Exceeded</span>
                          <p style={{ fontSize: '11.5px', color: '#fca5a5', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                            Your current projected expenditure (${costBreakdown.subtotal}) exceeds your target budget (${targetBudget}) by <strong style={{ color: '#ef4444' }}>${costBreakdown.subtotal - targetBudget}</strong>.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Chart layout card */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '28px' }}>
                      
                      {/* Breakdown list */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        
                        {/* Predefined expense items in progress cards */}
                        {[
                          { icon: '/budget-visa-icon.png', label: 'Visa VoA Pre-auth', amount: costBreakdown.visaCost, color: 'var(--primary)' },
                          { icon: '/budget-flights-icon.png', label: 'Outbound/Return Flights', amount: costBreakdown.flightCost, color: '#3b82f6' },
                          { icon: '/budget-stay-icon.png', label: 'Hotel Accommodation', amount: costBreakdown.accommodationCost, color: '#10b981' },
                          { icon: '/budget-activities-icon.png', label: 'Itinerary Activities', amount: costBreakdown.activitiesCost, color: '#fbbf24' }
                        ].map((card, idx) => {
                          const cardRatio = targetBudget > 0 ? (card.amount / targetBudget) * 100 : 0;
                          return (
                            <div 
                              key={idx} 
                              style={{
                                padding: '14px 18px',
                                background: 'rgba(255,255,255,0.015)',
                                border: '1px solid rgba(255,255,255,0.04)',
                                borderRadius: '14px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                transition: 'all 0.2s ease',
                                textAlign: 'left'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.015)'; }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px' }}>
                                    <img 
                                      src={card.icon} 
                                      alt={card.label} 
                                      style={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        objectFit: 'contain',
                                        filter: card.icon.includes('visa') ? 'brightness(0) invert(1)' : 'none'
                                      }} 
                                    />
                                  </span>
                                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'white' }}>{card.label}</span>
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: 800, color: 'white' }}>${card.amount}</span>
                              </div>
                              {/* Mini progress bar */}
                              <div style={{ height: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ width: `${Math.min(100, cardRatio)}%`, height: '100%', background: card.color, borderRadius: '2px' }} />
                              </div>
                            </div>
                          );
                        })}

                        {/* Manual expenses */}
                        {manualExpenses.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'left', marginBottom: '2px' }}>
                              Additional Expenses
                            </span>
                            {manualExpenses.map(item => (
                              <div key={item.id} style={{
                                padding: '12px 16px',
                                background: 'rgba(251,191,36,0.015)',
                                border: '1px solid rgba(251,191,36,0.08)',
                                borderRadius: '12px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                textAlign: 'left'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px' }}>
                                    <img src="/budget-manual-icon.png" alt="Expense" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                  </span>
                                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'white' }}>{item.name}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#fbbf24' }}>${item.amount}</span>
                                  <button 
                                    onClick={() => { playUISound('click'); handleRemoveManualExpense(item.id); }}
                                    style={{ 
                                      background: 'rgba(239,68,68,0.08)', 
                                      border: 'none', 
                                      color: '#f87171', 
                                      fontSize: '12px', 
                                      cursor: 'pointer',
                                      width: '20px',
                                      height: '20px',
                                      borderRadius: '50%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      lineHeight: 1
                                    }}
                                  >
                                    &times;
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Visual gauge chart */}
                      <div style={{ 
                        background: 'rgba(255,255,255,0.01)', 
                        padding: '24px', 
                        borderRadius: '20px', 
                        border: '1px solid rgba(255,255,255,0.04)', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: '20px'
                      }}>
                        <div style={{ position: 'relative', width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {/* High-tech rotating dashed ring in background */}
                          <svg width="150" height="150" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
                            <circle
                              cx="75"
                              cy="75"
                              r="68"
                              fill="none"
                              stroke="rgba(255,255,255,0.02)"
                              strokeWidth="1.5"
                              strokeDasharray="4 6"
                            />
                            {/* Main Track */}
                            <circle
                              cx="75"
                              cy="75"
                              r="58"
                              fill="none"
                              stroke="rgba(255,255,255,0.04)"
                              strokeWidth="8"
                            />
                            {/* Progress Arc */}
                            <circle
                              cx="75"
                              cy="75"
                              r="58"
                              fill="none"
                              stroke={isOverBudget ? '#f87171' : 'url(#gauge-grad)'}
                              strokeWidth="8"
                              strokeDasharray={`${2 * Math.PI * 58}`}
                              strokeDashoffset={`${2 * Math.PI * 58 * (1 - Math.min(100, budgetRatio) / 100)}`}
                              strokeLinecap="round"
                              style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
                            />
                            <defs>
                              <linearGradient id="gauge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#ec4899" />
                                        <stop offset="100%" stopColor="#8b5cf6" />
                              </linearGradient>
                            </defs>
                          </svg>
                          
                          {/* Readout labels */}
                          <div style={{ zIndex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span style={{ fontSize: '26px', fontWeight: 900, color: 'white', letterSpacing: '-0.5px', fontFamily: 'monospace' }}>
                              {Math.round(budgetRatio)}%
                            </span>
                            <span style={{ fontSize: '8px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' }}>
                              Spent
                            </span>
                            <span style={{ fontSize: '10px', color: isOverBudget ? '#f87171' : '#34d399', fontWeight: 700, marginTop: '4px' }}>
                              {isOverBudget ? 'Over Budget' : `$${targetBudget - costBreakdown.subtotal} Left`}
                            </span>
                          </div>
                        </div>
                        
                        {/* Budget summary */}
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Target Budget: ${targetBudget}</span>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: 'white', display: 'block', marginTop: '2px' }}>Total Spent: ${costBreakdown.subtotal}</span>
                        </div>
                      </div>
                    </div>

                    {/* Add Manual Expense Form */}
                    <form onSubmit={handleAddManualExpense} style={{ display: 'flex', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
                      <input 
                        type="text" 
                        value={newExpenseName} 
                        onChange={(e) => setNewExpenseName(e.target.value)} 
                        placeholder="Expense name, e.g. Taxi tips" 
                        required
                        style={{ 
                          flex: 1, 
                          padding: '12px 16px', 
                          background: 'var(--input-bg)', 
                          border: '1px solid var(--input-border)', 
                          borderRadius: '10px', 
                          color: 'white', 
                          fontSize: '12px',
                          outline: 'none',
                          transition: 'all 0.2s'
                        }} 
                      />
                      <input 
                        type="number" 
                        value={newExpenseAmount} 
                        onChange={(e) => setNewExpenseAmount(e.target.value)} 
                        placeholder="Amount ($)" 
                        required
                        min={1}
                        style={{ 
                          width: '120px', 
                          padding: '12px 16px', 
                          background: 'var(--input-bg)', 
                          border: '1px solid var(--input-border)', 
                          borderRadius: '10px', 
                          color: 'white', 
                          fontSize: '12px',
                          outline: 'none',
                          transition: 'all 0.2s'
                        }} 
                      />
                      <button 
                        type="submit" 
                        style={{ 
                          padding: '12px 20px', 
                          background: 'var(--brand-gradient)', 
                          border: 'none', 
                          borderRadius: '10px', 
                          color: 'white', 
                          fontSize: '12px', 
                          fontWeight: 800, 
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(236,72,153,0.2)',
                          transition: 'all 0.2s',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        + Add Expense
                      </button>
                    </form>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button onClick={() => setCurrentStep(7)} style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>&larr; Back</button>
                    <button onClick={() => setCurrentStep(9)} style={{ padding: '12px 24px', background: 'var(--brand-gradient)', border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>Next: Return Checklist &rarr;</button>
                  </div>
                </>
              )}

              {/* ---------------------------------------------------- */}
              {/* STEP 9: RETURN CHECKLIST */}
              {/* ---------------------------------------------------- */}
              {currentStep === 9 && (
                <>
                  <div className="discover-premium-card" style={{ padding: '28px', borderRadius: '20px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Step 9: Return Checklist &amp; departure preps</h3>

                    {/* Return flight widget */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>RETURN FLIGHT DETECTED</span>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: 'white', display: 'block', marginTop: '4px' }}>
                          {selectedOutboundFlight ? `${selectedOutboundFlight.airline} return trip` : 'No return flight selected'}
                        </span>
                      </div>
                      {selectedOutboundFlight ? (
                        <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 700 }}>
                          ✓ Pre-booked
                        </span>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 700 }}>
                            ⏳ Awaiting flight selection
                          </span>
                          <button 
                            onClick={() => {
                              setIsBookingReturnFlight(true);
                              setCurrentStep(4);
                            }} 
                            style={{ 
                              padding: '8px 16px', 
                              background: 'var(--brand-gradient)', 
                              border: 'none', 
                              borderRadius: '8px', 
                              color: 'white', 
                              fontSize: '11px', 
                              fontWeight: 700, 
                              cursor: 'pointer' 
                            }}
                          >
                            Book Flights
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Pre-departure checklist */}
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'white', marginBottom: '12px' }}>Pre-Departure Checklists:</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                          <input type="checkbox" defaultChecked />
                          Online check-in (opens 24 hours prior to departure)
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                          <input type="checkbox" />
                          Verify baggage weight limits (usually 23kg check-in, 7kg cabin)
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                          <input type="checkbox" />
                          Download re-entry QR codes or declare custom checklists
                        </label>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px', textAlign: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '64px', marginBottom: '12px' }}>
                        <img src="/congrats-badge.png" alt="Congrats" style={{ height: '100%', objectFit: 'contain' }} />
                      </span>
                      <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'white', margin: '4px 0 0 0' }}>Your Trip Planning is Ready!</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '380px', margin: '8px auto 0 auto', lineHeight: '1.6' }}>
                        All flights, hotel checkouts, visa application forms, and budget limits are logged to your personal profile.
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button onClick={() => setCurrentStep(8)} style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>&larr; Back</button>
                    <button 
                      onClick={() => {
                        const newTrip = {
                          id: 'trip-' + Date.now(),
                          destination: activeDestination,
                          stayNights,
                          startDate: startDate || '2026-10-12',
                          endDate: endDate || '2026-10-15',
                          budget: targetBudget,
                          currency: currency,
                          flight: selectedOutboundFlight ? {
                            airline: selectedOutboundFlight.airline,
                            price: selectedOutboundFlight.price,
                            duration: selectedOutboundFlight.duration,
                            stops: selectedOutboundFlight.stops
                          } : null,
                          stay: bookedStay ? {
                            name: bookedStay.name,
                            price: bookedStay.price,
                            rating: bookedStay.rating
                          } : null,
                          savedAt: new Date().toISOString()
                        };
                        try {
                          const existing = JSON.parse(localStorage.getItem('traveholic_planned_trips') || '[]');
                          existing.push(newTrip);
                          localStorage.setItem('traveholic_planned_trips', JSON.stringify(existing));
                        } catch (e) {
                          console.error(e);
                        }
                        alert('All details saved successfully! Navigating to your profile where you can view this trip.');
                        router.push('/?tab=profile');
                      }} 
                      style={{ padding: '12px 24px', background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)', border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: 800 }}
                    >
                      Complete &amp; Save Trip
                    </button>
                  </div>
                </>
              )}

            </motion.div>
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
