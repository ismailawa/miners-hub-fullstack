/**
 * Initial Dummy Data for Miners Hub
 * Realistic Nigerian mining industry data for development and demonstration
 * All data properly typed using TypeScript interfaces from lib/types.ts
 * Structured for easy database seeding
 */

import type {
  Miner,
  Event,
  MineralPrice,
  MapLocationData,
  Testimonial,
  Listing,
  Auction,
  NewsArticle,
  Webinar,
  KnowledgeBaseArticle,
  ForumPost,
} from "@/lib/types";
import { ListingStatus } from "@/lib/types";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate a deterministic ID for dummy data
 * Uses sequential counter for predictable IDs that work well for database seeding
 * Format: dummy-{type}-{number} for easy identification
 */
let idCounter = 0;
function generateId(type: string = "item"): string {
  idCounter++;
  return `dummy-${type}-${idCounter.toString().padStart(4, "0")}`;
}

/**
 * Generate a date string (ISO format) for timestamps
 */
function dateString(daysAgo: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

/**
 * Generate a future date string
 */
function futureDate(daysAhead: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString();
}

// ============================================================================
// MINER DATA
// ============================================================================

export const dummyMiners: Miner[] = [
  {
    id: generateId("miner"),
    userId: generateId("user"),
    companyName: "Kaduna Mining Corporation",
    miningLicence: "ML/2023/001",
    location: "Kaduna State, Chikun LGA",
    createdAt: dateString(180),
    updatedAt: dateString(10),
  },
  {
    id: generateId("miner"),
    userId: generateId("user"),
    companyName: "Jos Plateau Minerals Ltd",
    miningLicence: "ML/2022/045",
    location: "Plateau State, Jos North LGA",
    createdAt: dateString(240),
    updatedAt: dateString(5),
  },
  {
    id: generateId("miner"),
    userId: generateId("user"),
    companyName: "Niger Delta Gold Mining Co.",
    miningLicence: "ML/2023/089",
    location: "Rivers State, Port Harcourt LGA",
    createdAt: dateString(120),
    updatedAt: dateString(2),
  },
  {
    id: generateId("miner"),
    userId: generateId("user"),
    companyName: "Kogi State Mineral Resources",
    miningLicence: "ML/2022/156",
    location: "Kogi State, Lokoja LGA",
    createdAt: dateString(300),
    updatedAt: dateString(15),
  },
  {
    id: generateId("miner"),
    userId: generateId("user"),
    companyName: "Zamfara Tin Mining Group",
    miningLicence: "ML/2023/234",
    location: "Zamfara State, Anka LGA",
    createdAt: dateString(90),
    updatedAt: dateString(1),
  },
  {
    id: generateId("miner"),
    userId: generateId("user"),
    companyName: "Bauchi Coal & Minerals",
    miningLicence: "ML/2021/078",
    location: "Bauchi State, Bauchi LGA",
    createdAt: dateString(400),
    updatedAt: dateString(20),
  },
];

// ============================================================================
// EVENT DATA
// ============================================================================

export const dummyEvents: Event[] = [
  {
    id: generateId("event"),
    title: "Nigeria Mining Week 2024",
    description:
      "Annual conference bringing together miners, investors, and government officials to discuss the future of mining in Nigeria.",
    location: "Abuja, FCT",
    startDate: futureDate(45),
    endDate: futureDate(47),
    organizer: "Ministry of Mines and Steel Development",
    registrationUrl: "https://nigeriaminingweek.com/register",
    imageUrl: null,
    createdAt: dateString(30),
    updatedAt: dateString(5),
  },
  {
    id: generateId("event"),
    title: "West African Mining Summit",
    description:
      "Regional summit focusing on sustainable mining practices and investment opportunities across West Africa.",
    location: "Lagos, Lagos State",
    startDate: futureDate(90),
    endDate: futureDate(92),
    organizer: "West African Mining Association",
    registrationUrl: null,
    imageUrl: null,
    createdAt: dateString(60),
    updatedAt: dateString(10),
  },
  {
    id: generateId("event"),
    title: "Artisanal Mining Safety Workshop",
    description:
      "Training workshop for artisanal miners on safety practices, environmental protection, and legal compliance.",
    location: "Jos, Plateau State",
    startDate: futureDate(20),
    endDate: futureDate(21),
    organizer: "Nigerian Mining Safety Commission",
    registrationUrl: null,
    imageUrl: null,
    createdAt: dateString(15),
    updatedAt: dateString(2),
  },
];

// ============================================================================
// MINERAL PRICE DATA
// ============================================================================

export const dummyMineralPrices: MineralPrice[] = [
  {
    id: generateId("price"),
    mineralType: "Gold",
    price: 2850000, // NGN per kg
    unit: "per kg",
    location: null, // National average
    source: "Nigerian Mining Exchange",
    date: dateString(0),
    createdAt: dateString(0),
  },
  {
    id: generateId("price"),
    mineralType: "Gold",
    price: 2900000,
    unit: "per kg",
    location: "Kaduna State",
    source: "Kaduna Mining Exchange",
    date: dateString(0),
    createdAt: dateString(0),
  },
  {
    id: generateId("price"),
    mineralType: "Tin",
    price: 450000,
    unit: "per ton",
    location: null,
    source: "Nigerian Mining Exchange",
    date: dateString(0),
    createdAt: dateString(0),
  },
  {
    id: generateId("price"),
    mineralType: "Tin",
    price: 480000,
    unit: "per ton",
    location: "Plateau State",
    source: "Jos Mining Exchange",
    date: dateString(0),
    createdAt: dateString(0),
  },
  {
    id: generateId("price"),
    mineralType: "Coal",
    price: 35000,
    unit: "per ton",
    location: null,
    source: "Nigerian Mining Exchange",
    date: dateString(0),
    createdAt: dateString(0),
  },
  {
    id: generateId("price"),
    mineralType: "Coal",
    price: 38000,
    unit: "per ton",
    location: "Enugu State",
    source: "Enugu Mining Exchange",
    date: dateString(0),
    createdAt: dateString(0),
  },
  {
    id: generateId("price"),
    mineralType: "Lead",
    price: 180000,
    unit: "per ton",
    location: null,
    source: "Nigerian Mining Exchange",
    date: dateString(0),
    createdAt: dateString(0),
  },
  {
    id: generateId("price"),
    mineralType: "Zinc",
    price: 220000,
    unit: "per ton",
    location: null,
    source: "Nigerian Mining Exchange",
    date: dateString(0),
    createdAt: dateString(0),
  },
  {
    id: generateId("price"),
    mineralType: "Iron Ore",
    price: 85000,
    unit: "per ton",
    location: null,
    source: "Nigerian Mining Exchange",
    date: dateString(0),
    createdAt: dateString(0),
  },
  {
    id: generateId("price"),
    mineralType: "Limestone",
    price: 12000,
    unit: "per ton",
    location: null,
    source: "Nigerian Mining Exchange",
    date: dateString(0),
    createdAt: dateString(0),
  },
];

// ============================================================================
// MAP LOCATION DATA
// ============================================================================

export const dummyMapLocations: MapLocationData[] = [
  {
    id: generateId("location"),
    name: "Birnin Gwari Gold Deposit",
    state: "Kaduna State",
    lga: "Birnin Gwari LGA",
    coordinates: {
      lat: 10.6637,
      lng: 6.7964,
    },
    mineralTypes: ["Gold", "Lead", "Zinc"],
    description:
      "Major gold deposit area with significant reserves. Active mining operations by licensed companies.",
    verified: true,
    createdAt: dateString(200),
    updatedAt: dateString(30),
  },
  {
    id: generateId("location"),
    name: "Jos Tin Fields",
    state: "Plateau State",
    lga: "Jos North LGA",
    coordinates: {
      lat: 9.8965,
      lng: 8.8583,
    },
    mineralTypes: ["Tin", "Columbite", "Tantalite"],
    description:
      "Historic tin mining region with extensive deposits. Known for high-quality tin ore.",
    verified: true,
    createdAt: dateString(250),
    updatedAt: dateString(25),
  },
  {
    id: generateId("location"),
    name: "Enugu Coal Basin",
    state: "Enugu State",
    lga: "Enugu North LGA",
    coordinates: {
      lat: 6.4474,
      lng: 7.5133,
    },
    mineralTypes: ["Coal", "Limestone"],
    description:
      "Rich coal deposits with mining history dating back to colonial era. Active coal mining operations.",
    verified: true,
    createdAt: dateString(300),
    updatedAt: dateString(40),
  },
  {
    id: generateId("location"),
    name: "Itakpe Iron Ore Deposit",
    state: "Kogi State",
    lga: "Okene LGA",
    coordinates: {
      lat: 7.7833,
      lng: 6.7167,
    },
    mineralTypes: ["Iron Ore", "Limestone"],
    description:
      "Major iron ore deposit supplying the Ajaokuta Steel Company. High-grade iron ore reserves.",
    verified: true,
    createdAt: dateString(180),
    updatedAt: dateString(20),
  },
  {
    id: generateId("location"),
    name: "Zamfara Gold Belt",
    state: "Zamfara State",
    lga: "Anka LGA",
    coordinates: {
      lat: 12.1131,
      lng: 5.9264,
    },
    mineralTypes: ["Gold", "Lead"],
    description:
      "Significant gold deposits with both artisanal and commercial mining activities.",
    verified: true,
    createdAt: dateString(150),
    updatedAt: dateString(15),
  },
  {
    id: generateId("location"),
    name: "Ebonyi Lead-Zinc Deposit",
    state: "Ebonyi State",
    lga: "Ishielu LGA",
    coordinates: {
      lat: 6.3167,
      lng: 8.0833,
    },
    mineralTypes: ["Lead", "Zinc"],
    description:
      "Rich lead and zinc deposits with active mining operations. Known for high-grade ore.",
    verified: true,
    createdAt: dateString(120),
    updatedAt: dateString(10),
  },
];

// ============================================================================
// TESTIMONIAL DATA
// ============================================================================

export const dummyTestimonials: Testimonial[] = [
  {
    id: generateId("testimonial"),
    authorName: "Alhaji Musa Bello",
    authorRole: "Mining Company Owner",
    authorCompany: "Kaduna Mining Corporation",
    authorImageUrl: null,
    content:
      "Miners Hub has transformed how we connect with buyers. The platform is transparent, secure, and has significantly increased our sales. Highly recommended for any serious miner in Nigeria.",
    rating: 5,
    featured: true,
    createdAt: dateString(60),
    updatedAt: dateString(5),
  },
  {
    id: generateId("testimonial"),
    authorName: "Dr. Fatima Ibrahim",
    authorRole: "Investment Director",
    authorCompany: "Nigerian Mining Investment Fund",
    authorImageUrl: null,
    content:
      "As an investor, Miners Hub provides the transparency and verification we need. The platform makes it easy to find verified miners and assess opportunities. Excellent service.",
    rating: 5,
    featured: true,
    createdAt: dateString(45),
    updatedAt: dateString(3),
  },
  {
    id: generateId("testimonial"),
    authorName: "Engr. John Okoro",
    authorRole: "Miner",
    authorCompany: "Jos Plateau Minerals Ltd",
    authorImageUrl: null,
    content:
      "The auction system is fantastic. We've sold more minerals through auctions than traditional methods. The bidding process is fair and transparent.",
    rating: 4,
    featured: false,
    createdAt: dateString(30),
    updatedAt: dateString(2),
  },
  {
    id: generateId("testimonial"),
    authorName: "Hajia Aisha Mohammed",
    authorRole: "Business Owner",
    authorCompany: null,
    authorImageUrl: null,
    content:
      "I started as a small-scale miner and Miners Hub helped me grow my business. The platform connects me directly with buyers, cutting out middlemen.",
    rating: 5,
    featured: false,
    createdAt: dateString(20),
    updatedAt: dateString(1),
  },
];

// ============================================================================
// MARKETPLACE LISTINGS (BUY NOW)
// ============================================================================

// Buy Now Listings
export const dummyListings: Listing[] = [
  {
    id: generateId("listing"),
    minerId: dummyMiners[0].id,
    mineralType: "Gold",
    quantity: 50, // tons
    price: 2850000, // NGN per kg
    gradePurity: "22 karat (91.67%)",
    location: "Kaduna State, Chikun LGA",
    moisturePercentage: 0.5,
    status: ListingStatus.PUBLISHED,
    listingType: "buy_now",
    createdAt: dateString(5),
    updatedAt: dateString(1),
  },
  {
    id: generateId("listing"),
    minerId: dummyMiners[1].id,
    mineralType: "Tin",
    quantity: 200, // tons
    price: 450000, // NGN per ton
    gradePurity: "High grade (95%+)",
    location: "Plateau State, Jos North LGA",
    moisturePercentage: 2.0,
    status: ListingStatus.PUBLISHED,
    listingType: "buy_now",
    createdAt: dateString(3),
    updatedAt: dateString(0),
  },
  {
    id: generateId("listing"),
    minerId: dummyMiners[2].id,
    mineralType: "Coal",
    quantity: 500, // tons
    price: 35000, // NGN per ton
    gradePurity: "Bituminous",
    location: "Rivers State, Port Harcourt LGA",
    moisturePercentage: 8.0,
    status: ListingStatus.PUBLISHED,
    listingType: "buy_now",
    createdAt: dateString(7),
    updatedAt: dateString(2),
  },
  {
    id: generateId("listing"),
    minerId: dummyMiners[3].id,
    mineralType: "Iron Ore",
    quantity: 1000, // tons
    price: 85000, // NGN per ton
    gradePurity: "Fe 62%",
    location: "Kogi State, Lokoja LGA",
    moisturePercentage: 3.5,
    status: ListingStatus.PUBLISHED,
    listingType: "buy_now",
    createdAt: dateString(10),
    updatedAt: dateString(5),
  },
  {
    id: generateId("listing"),
    minerId: dummyMiners[4].id,
    mineralType: "Gold",
    quantity: 25, // tons
    price: 2900000, // NGN per kg
    gradePurity: "24 karat (99.9%)",
    location: "Zamfara State, Anka LGA",
    moisturePercentage: 0.2,
    status: ListingStatus.PUBLISHED,
    listingType: "buy_now",
    createdAt: dateString(2),
    updatedAt: dateString(0),
  },
  {
    id: generateId("listing"),
    minerId: dummyMiners[5].id,
    mineralType: "Limestone",
    quantity: 2000, // tons
    price: 12000, // NGN per ton
    gradePurity: "CaCO3 95%",
    location: "Bauchi State, Bauchi LGA",
    moisturePercentage: 1.0,
    status: ListingStatus.PUBLISHED,
    listingType: "buy_now",
    createdAt: dateString(15),
    updatedAt: dateString(8),
  },
];

// Auction Listings (separate from Buy Now listings)
export const dummyAuctionListings: Listing[] = [
  {
    id: generateId("listing"),
    minerId: dummyMiners[0].id,
    mineralType: "Gold",
    quantity: 30, // tons
    price: 2800000, // NGN per kg (starting price)
    gradePurity: "22 karat (91.67%)",
    location: "Kaduna State, Chikun LGA",
    moisturePercentage: 0.5,
    status: ListingStatus.PUBLISHED,
    listingType: "auction",
    createdAt: dateString(2),
    updatedAt: dateString(0),
  },
  {
    id: generateId("listing"),
    minerId: dummyMiners[1].id,
    mineralType: "Tin",
    quantity: 150, // tons
    price: 430000, // NGN per ton (starting price)
    gradePurity: "High grade (95%+)",
    location: "Plateau State, Jos North LGA",
    moisturePercentage: 2.0,
    status: ListingStatus.PUBLISHED,
    listingType: "auction",
    createdAt: dateString(1),
    updatedAt: dateString(0),
  },
  {
    id: generateId("listing"),
    minerId: dummyMiners[2].id,
    mineralType: "Lead",
    quantity: 100, // tons
    price: 170000, // NGN per ton (starting price)
    gradePurity: "High grade (92%+)",
    location: "Rivers State, Port Harcourt LGA",
    moisturePercentage: 1.5,
    status: ListingStatus.PUBLISHED,
    listingType: "auction",
    createdAt: dateString(10),
    updatedAt: dateString(1),
  },
];

// ============================================================================
// AUCTION LISTINGS
// ============================================================================

export const dummyAuctions: Auction[] = [
  {
    id: generateId("auction"),
    listingId: dummyAuctionListings[0].id, // References actual auction listing
    startTime: dateString(-2),
    endTime: futureDate(5),
    startingBid: 2800000, // NGN per kg
    currentBid: 2850000,
    minimumIncrement: 50000,
    status: "active",
    createdAt: dateString(2),
    updatedAt: dateString(0),
  },
  {
    id: generateId("auction"),
    listingId: dummyAuctionListings[1].id, // References actual auction listing
    startTime: dateString(-1),
    endTime: futureDate(7),
    startingBid: 430000, // NGN per ton
    currentBid: 445000,
    minimumIncrement: 10000,
    status: "active",
    createdAt: dateString(1),
    updatedAt: dateString(0),
  },
  {
    id: generateId("auction"),
    listingId: dummyAuctionListings[2].id, // References actual auction listing
    startTime: dateString(-10),
    endTime: dateString(-1),
    startingBid: 170000, // NGN per ton
    currentBid: 185000,
    minimumIncrement: 5000,
    status: "completed",
    createdAt: dateString(10),
    updatedAt: dateString(1),
  },
];

// Export all listings (buy-now and auction) combined
export const allListings: Listing[] = [...dummyListings, ...dummyAuctionListings];

// ============================================================================
// NEWS ARTICLES
// ============================================================================

export const dummyNewsArticles: NewsArticle[] = [
  {
    id: generateId("news"),
    title: "Nigeria's Mining Sector Sees 15% Growth in Q3 2024",
    content:
      "The Nigerian mining sector recorded significant growth in the third quarter of 2024, with gold and tin exports leading the way. The Ministry of Mines and Steel Development reports increased investment in mining infrastructure and improved regulatory framework...",
    excerpt:
      "Nigeria's mining sector shows strong growth with gold and tin exports driving the expansion.",
    author: "Amina Hassan",
    imageUrl: null,
    publishedAt: dateString(2),
    category: "Industry News",
    tags: ["mining", "economy", "growth", "exports"],
    views: 1250,
    createdAt: dateString(2),
    updatedAt: dateString(1),
  },
  {
    id: generateId("news"),
    title: "New Mining Regulations to Boost Transparency",
    content:
      "The federal government has introduced new regulations aimed at improving transparency in the mining sector. The regulations require all miners to register on digital platforms and provide detailed documentation of their operations...",
    excerpt:
      "New regulations aim to improve transparency and accountability in Nigeria's mining sector.",
    author: "Chukwuemeka Okafor",
    imageUrl: null,
    publishedAt: dateString(5),
    category: "Regulations",
    tags: ["regulations", "transparency", "government", "compliance"],
    views: 890,
    createdAt: dateString(5),
    updatedAt: dateString(3),
  },
  {
    id: generateId("news"),
    title: "Kaduna State Opens New Mining Processing Facility",
    content:
      "Kaduna State has commissioned a new mineral processing facility that will process gold, lead, and zinc. The facility is expected to create over 500 jobs and boost local mining operations...",
    excerpt:
      "New processing facility in Kaduna State set to boost local mining operations and create jobs.",
    author: "Musa Abdullahi",
    imageUrl: null,
    publishedAt: dateString(8),
    category: "Infrastructure",
    tags: ["infrastructure", "kaduna", "processing", "jobs"],
    views: 650,
    createdAt: dateString(8),
    updatedAt: dateString(6),
  },
];

// ============================================================================
// WEBINAR DATA
// ============================================================================

export const dummyWebinars: Webinar[] = [
  {
    id: generateId("webinar"),
    title: "Introduction to Digital Mining Platforms",
    description:
      "Learn how digital platforms are transforming the mining industry in Nigeria. This webinar covers registration, listing creation, and best practices for using Miners Hub.",
    presenter: "Dr. Ibrahim Musa",
    presenterBio: "Senior Mining Consultant with 20+ years of experience",
    scheduledDate: futureDate(14),
    duration: 60, // minutes
    registrationUrl: "https://minershub.ng/webinars/intro-digital-mining",
    recordingUrl: null,
    imageUrl: null,
    createdAt: dateString(20),
    updatedAt: dateString(5),
  },
  {
    id: generateId("webinar"),
    title: "Mining Safety and Environmental Compliance",
    description:
      "Essential training on mining safety practices and environmental regulations in Nigeria. Learn about compliance requirements and best practices.",
    presenter: "Engr. Fatima Bello",
    presenterBio: "Environmental Compliance Officer, Nigerian Mining Safety Commission",
    scheduledDate: futureDate(28),
    duration: 90,
    registrationUrl: null,
    recordingUrl: null,
    imageUrl: null,
    createdAt: dateString(15),
    updatedAt: dateString(3),
  },
];

// ============================================================================
// KNOWLEDGE BASE ARTICLES
// ============================================================================

export const dummyKnowledgeBaseArticles: KnowledgeBaseArticle[] = [
  {
    id: generateId("kb"),
    title: "How to Register as a Miner on Miners Hub",
    content:
      "Step-by-step guide to registering your mining company on Miners Hub. Learn about required documents, verification process, and account setup...",
    category: "Getting Started",
    tags: ["registration", "miner", "verification", "setup"],
    author: "Miners Hub Support",
    views: 3200,
    helpful: 285,
    notHelpful: 12,
    createdAt: dateString(100),
    updatedAt: dateString(10),
  },
  {
    id: generateId("kb"),
    title: "Understanding Mineral Pricing on Miners Hub",
    content:
      "Learn how mineral prices are determined, how to set competitive prices for your listings, and factors that affect pricing...",
    category: "Pricing",
    tags: ["pricing", "minerals", "market", "economics"],
    author: "Market Analysis Team",
    views: 1850,
    helpful: 156,
    notHelpful: 8,
    createdAt: dateString(80),
    updatedAt: dateString(15),
  },
  {
    id: generateId("kb"),
    title: "Creating Effective Listings: Best Practices",
    content:
      "Tips for creating listings that attract buyers. Learn about writing descriptions, uploading quality images, and setting competitive prices...",
    category: "Listings",
    tags: ["listings", "best-practices", "marketing", "sales"],
    author: "Miners Hub Support",
    views: 2400,
    helpful: 210,
    notHelpful: 15,
    createdAt: dateString(60),
    updatedAt: dateString(5),
  },
];

// ============================================================================
// FORUM POSTS
// ============================================================================

export const dummyForumPosts: ForumPost[] = [
  {
    id: generateId("forum"),
    authorId: generateId("user"),
    title: "Best Practices for Gold Mining in Kaduna",
    content:
      "I've been mining gold in Kaduna for 5 years. Here are some tips I've learned along the way...",
    category: "Mining Techniques",
    tags: ["gold", "kaduna", "mining", "tips"],
    views: 450,
    replies: 12,
    pinned: false,
    locked: false,
    createdAt: dateString(10),
    updatedAt: dateString(2),
  },
  {
    id: generateId("forum"),
    authorId: generateId("user"),
    title: "How to Get Mining License in Nigeria",
    content:
      "Complete guide to obtaining a mining license in Nigeria. Includes required documents, fees, and processing time...",
    category: "Legal & Compliance",
    tags: ["license", "legal", "compliance", "government"],
    views: 890,
    replies: 25,
    pinned: true,
    locked: false,
    createdAt: dateString(30),
    updatedAt: dateString(5),
  },
  {
    id: generateId("forum"),
    authorId: generateId("user"),
    title: "Market Trends: Tin Prices Q4 2024",
    content:
      "Discussion about current tin prices and market trends. Share your experiences and predictions...",
    category: "Market Discussion",
    tags: ["tin", "prices", "market", "trends"],
    views: 320,
    replies: 8,
    pinned: false,
    locked: false,
    createdAt: dateString(5),
    updatedAt: dateString(1),
  },
];

// ============================================================================
// HELPER FUNCTIONS FOR DATA INITIALIZATION
// ============================================================================

/**
 * Get all dummy data as a single object
 * Useful for database seeding
 */
export function getAllDummyData() {
  return {
    miners: dummyMiners,
    events: dummyEvents,
    mineralPrices: dummyMineralPrices,
    mapLocations: dummyMapLocations,
    testimonials: dummyTestimonials,
    listings: allListings, // Includes both buy_now and auction listings
    auctions: dummyAuctions,
    newsArticles: dummyNewsArticles,
    webinars: dummyWebinars,
    knowledgeBaseArticles: dummyKnowledgeBaseArticles,
    forumPosts: dummyForumPosts,
  };
}

/**
 * Get dummy data by type
 */
export function getDummyDataByType<T extends keyof ReturnType<typeof getAllDummyData>>(
  type: T
): ReturnType<typeof getAllDummyData>[T] {
  const allData = getAllDummyData();
  return allData[type];
}

/**
 * Initialize data for a specific entity type
 * Useful for populating initial state or database
 * Returns a copy of the data array for safe mutation
 */
export function initializeData<T extends keyof ReturnType<typeof getAllDummyData>>(
  type: T
): ReturnType<typeof getAllDummyData>[T] {
  const data = getDummyDataByType(type);
  // Return a deep copy to prevent mutations to original data
  return JSON.parse(JSON.stringify(data)) as ReturnType<typeof getAllDummyData>[T];
}

/**
 * Get featured testimonials only
 */
export function getFeaturedTestimonials(): Testimonial[] {
  return dummyTestimonials.filter((t) => t.featured);
}

/**
 * Get active auctions only
 */
export function getActiveAuctions(): Auction[] {
  return dummyAuctions.filter((a) => a.status === "active");
}

/**
 * Get published listings only
 */
export function getPublishedListings(): Listing[] {
  return dummyListings.filter((l) => l.status === ListingStatus.PUBLISHED);
}

/**
 * Get latest mineral prices (most recent date)
 */
export function getLatestMineralPrices(): MineralPrice[] {
  const latestDate = Math.max(
    ...dummyMineralPrices.map((p) => new Date(p.date).getTime())
  );
  return dummyMineralPrices.filter(
    (p) => new Date(p.date).getTime() === latestDate
  );
}

/**
 * Get verified map locations only
 */
export function getVerifiedMapLocations(): MapLocationData[] {
  return dummyMapLocations.filter((l) => l.verified);
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  miners: dummyMiners,
  events: dummyEvents,
  mineralPrices: dummyMineralPrices,
  mapLocations: dummyMapLocations,
  testimonials: dummyTestimonials,
  listings: allListings, // Includes both buy_now and auction listings
  auctionListings: dummyAuctionListings, // Export auction listings separately for convenience
  auctions: dummyAuctions,
  newsArticles: dummyNewsArticles,
  webinars: dummyWebinars,
  knowledgeBaseArticles: dummyKnowledgeBaseArticles,
  forumPosts: dummyForumPosts,
  helpers: {
    getAllDummyData,
    getDummyDataByType,
    initializeData,
    getFeaturedTestimonials,
    getActiveAuctions,
    getPublishedListings,
    getLatestMineralPrices,
    getVerifiedMapLocations,
  },
};

