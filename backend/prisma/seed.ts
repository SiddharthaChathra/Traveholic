import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding travel destinations...');

  const destinations = [
    {
      id: 'bali',
      fullName: 'Ubud, Bali',
      visaStatus: 'Visa on Arrival Required',
      visaDetails: 'Citizens of over 80 countries require a Visa on Arrival (VoA) valid for 30 days, extendable once. Costs IDR 500,000 (~$32 USD). Last updated: June 2026.',
      visaUrl: 'https://molina.imigrasi.go.id/',
      visaTime: 'Immediate (VoA) or 48 hours (e-VoA)',
      visaDocuments: JSON.stringify([
        'Passport valid for 6 months',
        'Return ticket out of Indonesia',
        'VoA Fee payment'
      ]),
      exchangeRate: '1 USD = 16,245 IDR',
      exchangeAdvice: 'Avoid airport currency booths as their margins are ~8-12%. Withdraw from local ATMs inside banks (like BCA or Mandiri) for best rates, typically a 1-3% network fee.',
      cardAcceptance: 70,
      flights: JSON.stringify([
        { id: 'f-bali-1', airline: 'Singapore Airlines', price: 680, stops: '1 Stop (SIN)', duration: '11h 20m' },
        { id: 'f-bali-2', airline: 'Garuda Indonesia', price: 840, stops: 'Non-stop', duration: '9h 15m' },
        { id: 'f-bali-3', airline: 'Qatar Airways', price: 920, stops: '1 Stop (DOH)', duration: '14h 40m' }
      ]),
      itinerary: JSON.stringify([
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
      ]),
      attractions: JSON.stringify([
        { id: 'attr-b1', name: 'Uluwatu Cliff Temple & Kecak Dance', desc: 'Ancient clifftop temple hosting epic cultural sunset performances.', duration: '3 hours', cost: 15 },
        { id: 'attr-b2', name: 'Tegenungan Jungle Waterfall Hike', desc: 'Scenic jungle paths leading down to a massive, thundering waterfall canyon.', duration: '2 hours', cost: 8 },
        { id: 'attr-b3', name: 'Nusa Penida Kelingking Beach Tour', desc: 'Boat transfer to the famous T-Rex shaped coastal viewpoint.', duration: '8 hours', cost: 50 }
      ]),
      food: JSON.stringify([
        { name: 'Babi Guling (Suckling Pig)', desc: 'Spiced roasted pork served with coconut rice and local sambal.', rating: 4.8 },
        { name: 'Nasi Goreng & Sate Lilit', desc: 'Indonesian fried rice paired with minced fish satay on lemongrass skewers.', rating: 4.7 }
      ]),
      souvenirs: JSON.stringify([
        { name: 'Ata Rattan Handbags', price: '$15 - $25', location: 'Ubud Market' },
        { name: 'Luwak Coffee & Spices', price: '$10 - $20', location: 'Tegallalang Plantations' }
      ]),
      weatherBackup: JSON.stringify([
        'Indoor Cooking Class at Ubud Culinary Center',
        'Glass Blowing workshop in Seminyak art galleries',
        'Indonesian Spa & Yoga retreat inside canopy studios'
      ]),
      emergencyContacts: JSON.stringify([
        'BIMC Hospital Ubud: +62 361 3000 911',
        'Police: 110',
        'Tourist Assistance: +62 361 750000'
      ])
    },
    {
      id: 'manali',
      fullName: 'Manali, Himachal Pradesh',
      visaStatus: 'eVisa or Regular Visa Required',
      visaDetails: 'Foreign tourists require an eVisa prior to boarding, valid for 30 days to 5 years. Costs $10 - $80 depending on nationality. Last updated: May 2026.',
      visaUrl: 'https://indianvisaonline.gov.in/evisa/',
      visaTime: '72 hours processing',
      visaDocuments: JSON.stringify([
        'Passport valid for 6 months',
        'Digital passport photo',
        'Scanned passport page'
      ]),
      exchangeRate: '1 USD = 83.50 INR',
      exchangeAdvice: 'Avoid local bazaar forex dealers; use official bank desks in Mall Road. ATMs are widely available, but carry cash for remote trekking stops and taxi operators.',
      cardAcceptance: 50,
      flights: JSON.stringify([
        { id: 'f-man-1', airline: 'Air India', price: 420, stops: '1 Stop (DEL)', duration: '8h 40m' },
        { id: 'f-man-2', airline: 'IndiGo Airlines', price: 380, stops: '1 Stop (DEL)', duration: '9h 15m' }
      ]),
      itinerary: JSON.stringify([
        {
          day: 1,
          activities: [
            { id: 'act-m1', title: 'Walk around Old Manali Cafe street', time: '11:00 AM', cost: 5 },
            { id: 'act-m2', title: 'Visit Hadimba Wood Temple', time: '02:00 PM', cost: 2 },
            { id: 'act-m3', title: 'Riverside trout dinner feast', time: '07:00 PM', cost: 12 }
          ]
        }
      ]),
      attractions: JSON.stringify([
        { id: 'attr-m1', name: 'Solang Valley Adventure activities', desc: 'Glacier paragliding, ATV rides, and ski slope walks.', duration: '5 hours', cost: 35 },
        { id: 'attr-m2', name: 'Jogini Waterfall Trek', desc: 'Cozy walk from Vashisht village through tall pine woods.', duration: '3 hours', cost: 0 }
      ]),
      food: JSON.stringify([
        { name: 'Siddu with Ghee', desc: 'Traditional steamed wheat bread stuffed with local spices and walnuts.', rating: 4.9 },
        { name: 'Himachali Dham Thali', desc: 'Festive slow-cooked lentil platters served over premium basmati rice.', rating: 4.8 }
      ]),
      souvenirs: JSON.stringify([
        { name: 'Himachali Woolen Shawls', price: '$20 - $50', location: 'Mall Road Handloom cooperative' }
      ]),
      weatherBackup: JSON.stringify([
        'Museum of Himachal Culture visit',
        'Local hot spring baths inside Vashisht indoor cabins'
      ]),
      emergencyContacts: JSON.stringify([
        'Lady Willingdon Hospital: +91 1902 252389',
        'Police: 112'
      ])
    }
  ];

  for (const dest of destinations) {
    const upserted = await prisma.destination.upsert({
      where: { id: dest.id },
      update: dest,
      create: dest,
    });
    console.log(`Upserted destination: ${upserted.fullName}`);
  }

  // Seed some initial listings if there are none
  console.log('Seeding initial business profile listings...');
  const firstBusiness = await prisma.businessProfile.findFirst();
  if (firstBusiness) {
    const initialListings = [
      {
        id: 'list-1',
        name: 'Grand Oceanfront Deluxe Suite',
        price: 220,
        rating: 4.9,
        reviewsCount: 180,
        location: 'Nusa Dua, Bali',
        category: 'Hotel Room',
        image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&auto=format&fit=crop&q=80',
        businessProfileId: firstBusiness.id
      },
      {
        id: 'list-2',
        name: 'Forest Canopy Private Villa',
        price: 450,
        rating: 4.8,
        reviewsCount: 96,
        location: 'Ubud, Bali',
        category: 'Villa',
        image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=600&auto=format&fit=crop&q=80',
        businessProfileId: firstBusiness.id
      },
      {
        id: 'list-5',
        name: 'Manali Alpine Retreat',
        price: 180,
        rating: 4.7,
        reviewsCount: 42,
        location: 'Manali, India',
        category: 'Cabin',
        image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&auto=format&fit=crop&q=80',
        businessProfileId: firstBusiness.id
      }
    ];

    for (const listing of initialListings) {
      await prisma.listing.upsert({
        where: { id: listing.id },
        update: listing,
        create: listing,
      });
      console.log(`Upserted stay listing: ${listing.name}`);
    }
  } else {
    console.log('No business profiles found, skipping stays listing seed for now.');
  }

  // Seed default social mock vlogs
  console.log('Seeding default vlogs...');
  const vlogs = [
    {
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
      isVerified: true
    },
    {
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
      isVerified: true
    },
    {
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
      isVerified: false
    },
    {
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
      isVerified: false
    }
  ];

  for (const vlog of vlogs) {
    await prisma.vlog.upsert({
      where: { id: vlog.id },
      update: vlog,
      create: vlog,
    });
    console.log(`Upserted vlog: ${vlog.title}`);
  }

  // Seed default social feed posts
  console.log('Seeding default posts...');
  const posts = [
    {
      id: 'post-1',
      caption: 'Cruising through the winding scenic roads of Leh. Truly life changing! 🏍️🏔️',
      images: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80',
      location: 'Khardung La Pass, India',
      likesCount: 154,
      creatorId: 'user-default-creator'
    },
    {
      id: 'post-2',
      caption: 'Enjoying clean organic bowls in the heart of Bali rice fields. Simply paradise 🌴🥣',
      images: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80',
      location: 'Ubud, Bali',
      likesCount: 290,
      creatorId: 'user-default-creator'
    }
  ];

  for (const post of posts) {
    await prisma.post.upsert({
      where: { id: post.id },
      update: post,
      create: post
    });
    console.log(`Upserted social post: ${post.caption}`);
  }

  console.log('Seeding complete! 🎉');
}

async function run() {
  try {
    await main();
  } catch (e) {
    console.error('Error during seeding:', e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
