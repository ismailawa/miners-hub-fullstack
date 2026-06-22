/**
 * Constants & Initial Dummy Data
 * 
 * Comprehensive dummy data for the Miners Hub application.
 * All data is properly typed using TypeScript interfaces from lib/types.ts.
 * Data reflects Nigerian mining context and is structured for database seeding.
 */

import {
  Miner,
  Event,
  MineralPrice,
  MapLocationData,
  Testimonial,
  Listing,
  Auction,
  Bid,
  NewsArticle,
  Webinar,
  KnowledgeBaseArticle,
  ForumPost,
  ProductionDataPoint,
  ExportData,
  MarketSentiment,
  MineralHistory,
  Shipment,
  Contract,
  ListingStatus,
  AuctionStatus,
  ContractStatus,
} from '../types';

// ============================================================================
// PARTNER LOGOS
// ============================================================================

export const PARTNER_LOGOS: string[] = [
  'https://cdn.simpleicons.org/microsoft/black',
  'https://cdn.simpleicons.org/google/black',
  'https://cdn.simpleicons.org/amazonaws/black',
  'https://cdn.simpleicons.org/meta/black',
  'https://cdn.simpleicons.org/apple/black',
];

// ============================================================================
// MINER DATA
// ============================================================================

export const MINERS_DATA: Miner[] = [
  {
    id: 'dummy-miner-1',
    userId: 'user-miner-1',
    name: 'Adewale Resources',
    location: 'Ogun State',
    minerals: ['Limestone', 'Granite'],
    rating: 4.8,
    imageUrl: 'https://picsum.photos/seed/miner1/300/300',
    contactEmail: 'contact@adewaleresources.ng',
    history: 'Founded in 2005, Adewale Resources has been a key player in Ogun State, specializing in sustainable limestone extraction for the construction industry.',
    siteImages: ['https://picsum.photos/seed/site1/200/200', 'https://picsum.photos/seed/site2/200/200', 'https://picsum.photos/seed/site3/200/200']
  },
  {
    id: 'dummy-miner-2',
    userId: 'user-miner-2',
    name: 'Bello Mining Corp',
    location: 'Kogi State',
    minerals: ['Iron Ore', 'Coal'],
    rating: 4.5,
    imageUrl: 'https://picsum.photos/seed/miner2/300/300',
    contactEmail: 'info@bellomining.com',
    history: 'Bello Mining Corp began operations in 1998, focusing on iron ore and coal. We are committed to technological advancement and safety in all our operations.',
    siteImages: ['https://picsum.photos/seed/site4/200/200', 'https://picsum.photos/seed/site5/200/200', 'https://picsum.photos/seed/site6/200/200']
  },
  {
    id: 'dummy-miner-3',
    userId: 'user-miner-3',
    name: 'Ngozi Gemstones',
    location: 'Plateau State',
    minerals: ['Tin', 'Gemstones'],
    rating: 4.9,
    imageUrl: 'https://picsum.photos/seed/miner3/300/300',
    contactEmail: 'enquiries@ngozigems.com',
    history: 'A family-owned business since 2010, Ngozi Gemstones is renowned for ethically sourcing some of Nigeria\'s finest tin and precious gemstones.',
    siteImages: ['https://picsum.photos/seed/site7/200/200', 'https://picsum.photos/seed/site8/200/200', 'https://picsum.photos/seed/site9/200/200']
  },
  {
    id: 'dummy-miner-4',
    userId: 'user-miner-4',
    name: 'Okoro Lead Works',
    location: 'Ebonyi State',
    minerals: ['Lead', 'Zinc'],
    rating: 4.3,
    imageUrl: 'https://picsum.photos/seed/miner4/300/300',
    contactEmail: 'support@okorolead.ng',
    history: 'Established in 2002, Okoro Lead Works is a leading processor of lead and zinc in Ebonyi, contributing significantly to the local economy and export market.',
    siteImages: ['https://picsum.photos/seed/site10/200/200', 'https://picsum.photos/seed/site11/200/200', 'https://picsum.photos/seed/site12/200/200']
  },
];

// ============================================================================
// EVENT DATA
// ============================================================================

export const EVENTS_DATA: Event[] = [
  { id: 'dummy-event-1', title: 'Nigeria Mining Week', date: '2024-10-15', location: 'Abuja, Nigeria', imageUrl: 'https://picsum.photos/seed/event1/600/400' },
  { id: 'dummy-event-2', title: 'Global Investors Summit', date: '2024-11-05', location: 'Lagos, Nigeria', imageUrl: 'https://picsum.photos/seed/event2/600/400' },
  { id: 'dummy-event-3', title: 'Sustainable Mining Webinar', date: '2024-12-01', location: 'Online', imageUrl: 'https://picsum.photos/seed/event3/600/400' },
];

// ============================================================================
// MINERAL PRICE DATA
// ============================================================================

export const MINERAL_PRICES_DATA: MineralPrice[] = [
  { name: 'Iron Ore', price: 115.50, change: 1.25, symbol: 'Fe' },
  { name: 'Lead Ore', price: 2150.75, change: -0.80, symbol: 'Pb' },
  { name: 'Zinc Ore', price: 2890.00, change: 2.10, symbol: 'Zn' },
  { name: 'Gold', price: 2330.40, change: 0.50, symbol: 'Au' },
  { name: 'Coal', price: 135.20, change: -1.55, symbol: 'C' },
  { name: 'Limestone', price: 15.00, change: 0.15, symbol: 'CaCO₃' }
];

// ============================================================================
// MAP LOCATION DATA
// ============================================================================

export const NIGERIA_MAP_DATA: MapLocationData[] = [
  { id: "abia", name: "Abia", minerals: ["Oil", "Gas"], factories: 1 },
  { id: "adamawa", name: "Adamawa", minerals: ["Bentonite", "Gypsum", "Magnesite"], factories: 2 },
  { id: "akwa-ibom", name: "Akwa Ibom", minerals: ["Oil", "Gas", "Clay"], factories: 2 },
  { id: "anambra", name: "Anambra", minerals: ["Natural Gas", "Crude Oil", "Bauxite"], factories: 1 },
  { id: "bauchi", name: "Bauchi", minerals: ["Gold", "Cassiterite"], factories: 0 },
  { id: "bayelsa", name: "Bayelsa", minerals: ["Oil", "Gas"], factories: 2 },
  { id: "benue", name: "Benue", minerals: ["Limestone", "Gypsum"], factories: 2 },
  { id: "borno", name: "Borno", minerals: ["Diatomite", "Clay"], factories: 0 },
  { id: "cross-river", name: "Cross River", minerals: ["Uranium", "Limestone"], factories: 1 },
  { id: "delta", name: "Delta", minerals: ["Oil", "Gas", "Silica Sand"], factories: 3 },
  { id: "ebonyi", name: "Ebonyi", minerals: ["Lead", "Zinc", "Salt"], factories: 3 },
  { id: "edo", name: "Edo", minerals: ["Limestone", "Marble", "Gold"], factories: 3 },
  { id: "ekiti", name: "Ekiti", minerals: ["Granite", "Kaolin"], factories: 1 },
  { id: "enugu", name: "Enugu", minerals: ["Coal", "Limestone"], factories: 3 },
  { id: "fct", name: "FCT", minerals: ["Construction Sand", "Gravel"], factories: 5 },
  { id: "gombe", name: "Gombe", minerals: ["Gypsum", "Limestone"], factories: 1 },
  { id: "imo", name: "Imo", minerals: ["Lead", "Zinc", "Oil"], factories: 2 },
  { id: "jigawa", name: "Jigawa", minerals: ["Soda Ash"], factories: 0 },
  { id: "kaduna", name: "Kaduna", minerals: ["Gold", "Graphite"], factories: 3 },
  { id: "kano", name: "Kano", minerals: ["Tin", "Columbite"], factories: 2 },
  { id: "katsina", name: "Katsina", minerals: ["Kaolin", "Marble"], factories: 1 },
  { id: "kebbi", name: "Kebbi", minerals: ["Gold"], factories: 1 },
  { id: "kogi", name: "Kogi", minerals: ["Iron Ore", "Coal", "Marble"], factories: 5 },
  { id: "kwara", name: "Kwara", minerals: ["Gold", "Marble", "Feldspar"], factories: 2 },
  { id: "lagos", name: "Lagos", minerals: ["Glass Sand", "Clay", "Bitumen"], factories: 8 },
  { id: "nassarawa", name: "Nasarawa", minerals: ["Baryte", "Gemstones"], factories: 2 },
  { id: "niger", name: "Niger", minerals: ["Gold", "Talc"], factories: 2 },
  { id: "ogun", name: "Ogun", minerals: ["Limestone", "Phosphate"], factories: 4 },
  { id: "ondo", name: "Ondo", minerals: ["Bitumen", "Oil", "Gas"], factories: 2 },
  { id: "osun", name: "Osun", minerals: ["Gold", "Granite", "Talc"], factories: 2 },
  { id: "oyo", name: "Oyo", minerals: ["Gemstones", "Gold", "Marble"], factories: 2 },
  { id: "plateau", name: "Plateau", minerals: ["Tin", "Columbite", "Gemstones"], factories: 4 },
  { id: "rivers", name: "Rivers", minerals: ["Oil", "Gas"], factories: 4 },
  { id: "sokoto", name: "Sokoto", minerals: ["Limestone", "Gypsum"], factories: 2 },
  { id: "taraba", name: "Taraba", minerals: ["Graphite", "Uranium", "Lead"], factories: 1 },
  { id: "yobe", name: "Yobe", minerals: ["Gypsum", "Diatomite"], factories: 0 },
  { id: "zamfara", name: "Zamfara", minerals: ["Gold", "Lead", "Zinc"], factories: 2 },
];

// ============================================================================
// TESTIMONIAL DATA
// ============================================================================

export const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: 'dummy-testimonial-1',
    name: 'Amina Okoro',
    role: 'Artisanal Miner, Plateau State',
    quote: "Miners Hub gave my small operation a global platform. The transparency and direct access to investors have transformed my business.",
    videoThumbnailUrl: 'https://picsum.photos/seed/testimonial1/800/450',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1',
  },
  {
    id: 'dummy-testimonial-2',
    name: 'David Chen',
    role: 'International Investor',
    quote: "The due diligence and verification process on Miners Hub is second to none. It's the only platform I trust for sourcing minerals in Africa.",
    videoThumbnailUrl: 'https://picsum.photos/seed/testimonial2/800/450',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1',
  },
  {
    id: 'dummy-testimonial-3',
    name: 'Fatima Bello',
    role: 'Logistics Partner',
    quote: "Integrating our logistics services with the platform has been seamless. We're connecting miners to markets faster than ever before.",
    videoThumbnailUrl: 'https://picsum.photos/seed/testimonial3/800/450',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1',
  },
  {
    id: 'dummy-testimonial-4',
    name: 'Samuel Adebayo',
    role: 'Geologist',
    quote: "The interactive map and resource data are invaluable. It's an essential tool for research and identifying promising new sites.",
    videoThumbnailUrl: 'https://picsum.photos/seed/testimonial4/800/450',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1',
  },
];

// ============================================================================
// MARKETPLACE LISTINGS (BUY NOW)
// ============================================================================

export const MARKETPLACE_LISTINGS_DATA: Listing[] = [
  {
    id: 'dummy-listing-1',
    minerId: 'user-miner-2',
    mineral: 'Iron Ore',
    quantity: 500,
    unit: 'tonne',
    pricePerUnit: 110,
    grade: 'Fe 62% Grade',
    location: 'Kogi State',
    description: 'High-quality Iron Ore lumps, ready for immediate shipment. Sourced from our primary mine in Itakpe, Kogi. Lab analysis report available upon request.',
    images: ['https://picsum.photos/seed/iron1/600/400', 'https://picsum.photos/seed/iron2/600/400', 'https://picsum.photos/seed/iron3/600/400'],
    status: ListingStatus.AVAILABLE,
    type: 'buy-now',
    datePosted: '2024-07-20T10:00:00Z',
    createdAt: '2024-07-20T10:00:00Z',
    updatedAt: '2024-07-20T10:00:00Z',
    minerName: 'Bello Mining Corp',
    minerImageUrl: 'https://picsum.photos/seed/miner2/100/100',
  },
  {
    id: 'dummy-listing-2',
    minerId: 'user-miner-3',
    mineral: 'Tourmaline',
    quantity: 50,
    unit: 'kg',
    pricePerUnit: 800,
    grade: 'Assorted Gem-Grade',
    location: 'Plateau State',
    description: 'A beautiful assortment of raw, uncut tourmaline crystals. Perfect for jewelers and collectors. Ethically sourced from our mines near Jos.',
    images: ['https://picsum.photos/seed/gem1/600/400', 'https://picsum.photos/seed/gem2/600/400'],
    status: ListingStatus.AVAILABLE,
    type: 'buy-now',
    datePosted: '2024-07-18T14:30:00Z',
    createdAt: '2024-07-18T14:30:00Z',
    updatedAt: '2024-07-18T14:30:00Z',
    minerName: 'Ngozi Gemstones',
    minerImageUrl: 'https://picsum.photos/seed/miner3/100/100',
  },
  {
    id: 'dummy-listing-3',
    minerId: 'user-miner-4',
    mineral: 'Lead Ore',
    quantity: 250,
    unit: 'tonne',
    pricePerUnit: 2100,
    grade: 'Pb 75% Concentrate',
    location: 'Ebonyi State',
    description: 'High-concentration lead ore (Galena). Processed at our facility in Ebonyi. Available for bulk purchase. Competitive pricing.',
    images: ['https://picsum.photos/seed/lead1/600/400'],
    status: ListingStatus.AVAILABLE,
    type: 'buy-now',
    datePosted: '2024-07-21T09:00:00Z',
    createdAt: '2024-07-21T09:00:00Z',
    updatedAt: '2024-07-21T09:00:00Z',
    minerName: 'Okoro Lead Works',
    minerImageUrl: 'https://picsum.photos/seed/miner4/100/100',
  },
  {
    id: 'dummy-listing-4',
    minerId: 'user-miner-1',
    mineral: 'Limestone',
    quantity: 1000,
    unit: 'tonne',
    pricePerUnit: 14.50,
    grade: 'CaCO₃ 98% Purity',
    location: 'Ogun State',
    description: 'Premium quality limestone suitable for cement production and industrial applications. Mined from our Ewekoro quarry.',
    images: ['https://picsum.photos/seed/lime1/600/400'],
    status: ListingStatus.AVAILABLE,
    type: 'buy-now',
    datePosted: '2024-07-19T11:00:00Z',
    createdAt: '2024-07-19T11:00:00Z',
    updatedAt: '2024-07-19T11:00:00Z',
    minerName: 'Adewale Resources',
    minerImageUrl: 'https://picsum.photos/seed/miner1/100/100',
  },
  {
    id: 'dummy-listing-5',
    minerId: 'user-miner-2',
    mineral: 'Coal',
    quantity: 2000,
    unit: 'tonne',
    pricePerUnit: 130,
    grade: 'High-Grade Anthracite',
    location: 'Enugu State',
    description: 'Premium quality anthracite coal, low sulfur content. Ideal for industrial and power generation applications.',
    images: ['https://picsum.photos/seed/coal1/600/400'],
    status: ListingStatus.AVAILABLE,
    type: 'buy-now',
    datePosted: '2024-07-22T08:00:00Z',
    createdAt: '2024-07-22T08:00:00Z',
    updatedAt: '2024-07-22T08:00:00Z',
    minerName: 'Bello Mining Corp',
    minerImageUrl: 'https://picsum.photos/seed/miner2/100/100',
  },
  {
    id: 'dummy-listing-6',
    minerId: 'user-miner-3',
    mineral: 'Tin Ore',
    quantity: 150,
    unit: 'tonne',
    pricePerUnit: 25000,
    grade: 'Sn 70% Concentrate',
    location: 'Plateau State',
    description: 'High-purity Tin Ore (Cassiterite) concentrate. Sourced from our responsible mining operations in the Jos Plateau.',
    images: ['https://picsum.photos/seed/tin1/600/400'],
    status: ListingStatus.AVAILABLE,
    type: 'buy-now',
    datePosted: '2024-07-22T11:30:00Z',
    createdAt: '2024-07-22T11:30:00Z',
    updatedAt: '2024-07-22T11:30:00Z',
    minerName: 'Ngozi Gemstones',
    minerImageUrl: 'https://picsum.photos/seed/miner3/100/100',
  },
];

// ============================================================================
// AUCTION DATA
// ============================================================================

export const AUCTION_LISTINGS_DATA: Auction[] = [
  {
    id: 'dummy-auction-1',
    minerId: 'user-miner-3',
    mineral: 'Rare Blue Tourmaline',
    quantity: 5,
    unit: 'kg',
    startingBid: 2500,
    currentBid: 3200,
    highestBidderId: 'user-1',
    auctionEndDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    bidHistory: [
      { id: 'dummy-bid-1', auctionId: 'dummy-auction-1', bidderId: 'user-1', amount: 3200, date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), bidderName: 'John Doe' },
      { id: 'dummy-bid-2', auctionId: 'dummy-auction-1', bidderId: 'user-temp-2', amount: 3000, date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), bidderName: 'Jane Smith' },
    ],
    grade: 'AAA Grade Collector Piece',
    location: 'Plateau State',
    description: 'Exceptional 5kg single-crystal Blue Tourmaline. Museum quality with deep indigo color. A true collector\'s item.',
    images: ['https://picsum.photos/seed/tourmaline1/600/400'],
    status: 'active',
    datePosted: '2024-07-25T10:00:00Z',
    createdAt: '2024-07-25T10:00:00Z',
    updatedAt: '2024-07-25T10:00:00Z',
    minerName: 'Ngozi Gemstones',
    minerImageUrl: 'https://picsum.photos/seed/miner3/100/100',
    highestBidderName: 'John Doe',
  },
  {
    id: 'dummy-auction-2',
    minerId: 'user-miner-1',
    mineral: 'Raw Gold Nugget Lot',
    quantity: 500,
    unit: 'gram',
    startingBid: 35000,
    currentBid: 35000,
    highestBidderId: null,
    auctionEndDate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    bidHistory: [],
    grade: 'Natural Placer Gold',
    location: 'Kaduna State',
    description: 'A rich lot of 500 grams of raw placer gold nuggets, sourced from our artisanal mines in Kaduna.',
    images: ['https://picsum.photos/seed/nugget1/600/400'],
    status: 'active',
    datePosted: '2024-07-26T08:00:00Z',
    createdAt: '2024-07-26T08:00:00Z',
    updatedAt: '2024-07-26T08:00:00Z',
    minerName: 'Adewale Resources',
    minerImageUrl: 'https://picsum.photos/seed/miner1/100/100',
    highestBidderName: undefined,
  },
];

// ============================================================================
// NEWS ARTICLES
// ============================================================================

export const NEWS_DATA: NewsArticle[] = [
  {
    id: 'dummy-news-1',
    category: 'Market Analysis',
    title: 'Nigerian Government Announces $500M Fund to Boost Solid Mineral Sector',
    imageUrl: 'https://picsum.photos/seed/news1/800/600',
    author: 'Chijioke Okafor',
    date: '2024-07-25',
    summary: 'The Federal Government has launched a groundbreaking $500 million fund aimed at providing critical financing for mining projects, enhancing geological data collection, and improving infrastructure.',
    isHeadline: true,
    country: 'Nigeria',
  },
  {
    id: 'dummy-news-2',
    category: 'Technology',
    title: 'New Drone Technology Set to Revolutionize Geological Surveys in West Africa',
    imageUrl: 'https://picsum.photos/seed/news2/600/400',
    author: 'Amina Bello',
    date: '2024-07-24',
    summary: 'A partnership between a Lagos-based tech firm and a German engineering company has unveiled advanced drone systems capable of conducting high-resolution magnetic surveys.',
    country: 'Nigeria',
  },
  {
    id: 'dummy-news-3',
    category: 'International',
    title: 'Global Lithium Demand Surges as EV Market Booms',
    imageUrl: 'https://picsum.photos/seed/news3/600/400',
    author: 'David Chen',
    date: '2024-07-23',
    summary: 'With electric vehicle sales hitting record highs, the global appetite for lithium is soaring. International mining giants are now turning their attention to Africa.',
    country: 'Global',
  },
];

// ============================================================================
// WEBINARS
// ============================================================================

export const WEBINARS_DATA: Webinar[] = [
  {
    id: 'dummy-webinar-1',
    title: 'The Future of Sustainable Mining in Africa',
    description: 'Join industry experts as they discuss the latest trends in sustainable practices, ESG reporting, and community engagement.',
    thumbnailUrl: 'https://picsum.photos/seed/webinar1/400/225',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1',
    speaker: 'Dr. Amina Okoro',
    date: '2024-06-15',
  },
  {
    id: 'dummy-webinar-2',
    title: 'Leveraging Technology for Mineral Exploration',
    description: 'Discover how AI, drones, and satellite imagery are revolutionizing the way we find and assess mineral deposits.',
    thumbnailUrl: 'https://picsum.photos/seed/webinar2/400/225',
    videoUrl: 'https://www.youtube.com/embed/o-YBDTqX_ZU?autoplay=1',
    speaker: 'Samuel Adebayo',
    date: '2024-05-28',
  },
];

// ============================================================================
// KNOWLEDGE BASE ARTICLES
// ============================================================================

export const KNOWLEDGE_BASE_DATA: KnowledgeBaseArticle[] = [
  { id: 'dummy-kb-1', category: 'Getting Started', title: 'How to Create a Listing on Miners Hub', content: 'Detailed step-by-step guide on creating an effective and attractive mineral listing.', tags: ['listing', 'guide', 'miners'], createdAt: new Date().toISOString() },
  { id: 'dummy-kb-2', category: 'Getting Started', title: 'Understanding the Verification Process', content: 'An overview of our rigorous vetting process for miners and investors.', tags: ['verification', 'kyc', 'trust'], createdAt: new Date().toISOString() },
  {
    id: 'dummy-kb-3',
    category: 'Legal & Compliance',
    title: 'Nigerian Minerals and Mining Act 2007: A Comprehensive Overview',
    content: "The Nigerian Minerals and Mining Act of 2007 is the cornerstone of mining regulation in Nigeria. It establishes that all mineral resources are owned by the Federal Government.",
    tags: ['legal', 'act', 'regulation', 'compliance', 'nigeria'],
    createdAt: new Date().toISOString()
  },
];

// ============================================================================
// FORUM DATA
// ============================================================================

export const FORUM_CATEGORIES = {
  'general': { name: 'General Discussion', description: 'Talk about anything related to the mining industry.' },
  'equipment': { name: 'Equipment & Machinery', description: 'Discuss, review, and get advice on mining equipment.' },
  'investment': { name: 'Investment Opportunities', description: 'Share and discover potential investment opportunities.' },
  'policy': { name: 'Policy & Regulation', description: 'Discuss the impact of government policies and regulations.' },
};

export const FORUM_DATA: ForumPost[] = [
  {
    id: 'dummy-post-1',
    authorId: 'user-miner-2',
    authorName: 'Bello Mining Corp',
    title: 'Best practices for managing tailings?',
    content: 'We are looking to improve our environmental footprint and would love to hear how other mid-sized operations are managing their tailings.',
    category: 'general',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['environment', 'tailings', 'sustainability'],
    replies: [
      { id: 'dummy-reply-1', postId: 'dummy-post-1', authorId: 'user-1', content: 'Have you looked into dry stacking?', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), authorName: 'John Doe' }
    ]
  },
  {
    id: 'dummy-post-2',
    authorId: 'user-1',
    authorName: 'John Doe',
    title: 'Seeking investment in a promising lithium deposit in Nasarawa',
    content: 'Our geological surveys indicate a significant lithium deposit. We have the initial exploration license and are seeking partners for the next phase.',
    category: 'investment',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['lithium', 'investment', 'nasarawa'],
    replies: []
  },
];

// ============================================================================
// FORUM USERS
// ============================================================================

export const FORUM_USERS: { [id: string]: { name: string; imageUrl?: string } } = {
  'user-1': {
    name: 'John Doe',
    imageUrl: 'https://picsum.photos/seed/user1/200/200',
  },
  'user-miner-2': {
    name: 'Bello Mining Corp',
    imageUrl: 'https://picsum.photos/seed/miner2/100/100',
  },
  'user-temp-2': {
    name: 'Jane Smith',
    imageUrl: 'https://picsum.photos/seed/user2/200/200',
  },
};

// ============================================================================
// ANALYTICS DATA
// ============================================================================

export const PRODUCTION_DATA: ProductionDataPoint[] = [
  { month: 'Jan', 'Iron Ore': 40, 'Gold': 24, 'Lithium': 12 },
  { month: 'Feb', 'Iron Ore': 30, 'Gold': 14, 'Lithium': 22 },
  { month: 'Mar', 'Iron Ore': 20, 'Gold': 58, 'Lithium': 18 },
  { month: 'Apr', 'Iron Ore': 28, 'Gold': 39, 'Lithium': 40 },
  { month: 'May', 'Iron Ore': 19, 'Gold': 48, 'Lithium': 25 },
  { month: 'Jun', 'Iron Ore': 24, 'Gold': 38, 'Lithium': 27 },
  { month: 'Jul', 'Iron Ore': 35, 'Gold': 43, 'Lithium': 30 },
];

export const PRICE_CORRELATION_DATA: { minerals: string[], correlations: number[][] } = {
  minerals: ['Gold', 'Iron', 'Lithium', 'Coal', 'Zinc'],
  correlations: [
    [1.0, 0.2, 0.6, -0.3, 0.4],
    [0.2, 1.0, 0.1, 0.7, 0.8],
    [0.6, 0.1, 1.0, -0.1, 0.3],
    [-0.3, 0.7, -0.1, 1.0, 0.5],
    [0.4, 0.8, 0.3, 0.5, 1.0],
  ]
};

export const EXPORT_DATA: ExportData[] = [
  { country: 'China', volume: 4500 },
  { country: 'India', volume: 2800 },
  { country: 'Germany', volume: 1900 },
  { country: 'USA', volume: 1500 },
  { country: 'Netherlands', volume: 1200 },
];

export const MARKET_SENTIMENT_DATA: MarketSentiment = {
  sentiment: 'Bullish',
  value: 78
};

const generateHistoricalData = (basePrice: number, days: number, volatility: number) => {
  const data = [];
  let price = basePrice;
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - 1 - i));
    const changePercent = 2 * volatility * Math.random();
    if (changePercent > volatility) {
      price *= (1 + (changePercent - volatility));
    } else {
      price *= (1 - (volatility - changePercent));
    }
    price += (Math.random() - 0.5) * 5;
    price = Math.max(price, basePrice * 0.8);

    data.push({ date: date.toISOString().split('T')[0], price: parseFloat(price.toFixed(2)) });
  }
  return data;
};

export const HISTORICAL_PRICE_DATA: MineralHistory = {
  'Gold': generateHistoricalData(2300, 365, 0.01),
  'Iron Ore': generateHistoricalData(115, 365, 0.02),
  'Lithium': generateHistoricalData(15000, 365, 0.035),
};

// ============================================================================
// SHIPMENT DATA
// ============================================================================

export const SHIPMENT_DATA: { [key: string]: Shipment } = {
  'MH78654321': {
    trackingId: 'MH78654321',
    origin: 'Jos, Plateau State',
    destination: 'Port of Shanghai, China',
    currentStatus: 'at-port',
    estimatedDelivery: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    history: [
      { status: 'at-port', location: 'Apapa Port, Lagos', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), notes: 'Awaiting customs clearance.' },
      { status: 'in-transit', location: 'Lagos, Nigeria', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), notes: 'Arrived at Lagos logistics hub.' },
      { status: 'in-transit', location: 'Onitsha, Anambra State', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), notes: 'Departed from regional hub.' },
      { status: 'pending', location: 'Jos, Plateau State', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), notes: 'Shipment picked up from mine site.' },
    ],
  },
};

// ============================================================================
// CONTRACTS DATA
// ============================================================================

export const CONTRACTS_DATA: Contract[] = [
  {
    id: 'dummy-contract-1',
    listingId: 'dummy-listing-1',
    mineral: 'Iron Ore',
    minerId: 'user-miner-2',
    minerName: 'Bello Mining Corp',
    investorId: 'user-1',
    investorName: 'John Doe',
    terms: `This agreement is made for the sale of 500 tonnes of Iron Ore (Fe 62% Grade) at a price of $110 per tonne, totaling $55,000.`,
    status: ContractStatus.PENDING_MINER_SIGNATURE,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    quantity: 500,
    unit: 'tonne',
    pricePerUnit: 110,
  }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getAllDummyData() {
  return {
    miners: MINERS_DATA,
    events: EVENTS_DATA,
    mineralPrices: MINERAL_PRICES_DATA,
    mapLocations: NIGERIA_MAP_DATA,
    testimonials: TESTIMONIALS_DATA,
    listings: MARKETPLACE_LISTINGS_DATA,
    auctions: AUCTION_LISTINGS_DATA,
    news: NEWS_DATA,
    webinars: WEBINARS_DATA,
    knowledgeBase: KNOWLEDGE_BASE_DATA,
    forumPosts: FORUM_DATA,
    contracts: CONTRACTS_DATA,
    productionData: PRODUCTION_DATA,
    exportData: EXPORT_DATA,
    marketSentiment: MARKET_SENTIMENT_DATA,
    historicalPrices: HISTORICAL_PRICE_DATA,
    shipments: SHIPMENT_DATA,
  };
}

export function getDummyDataByType(type: string): unknown {
  const data = getAllDummyData() as Record<string, unknown>;
  return data[type] || null;
}

export function initializeData<T>(entityType: string): T[] {
  const data = getDummyDataByType(entityType);
  if (!data) return [];
  return JSON.parse(JSON.stringify(data)) as T[];
}

export function getFeaturedTestimonials(): Testimonial[] {
  return [...TESTIMONIALS_DATA];
}

export function getActiveAuctions(): Auction[] {
  return AUCTION_LISTINGS_DATA.filter(auction => auction.status === 'active');
}

export function getPublishedListings(): Listing[] {
  return MARKETPLACE_LISTINGS_DATA.filter(listing => listing.status === ListingStatus.AVAILABLE);
}

export function getLatestMineralPrices(): MineralPrice[] {
  return [...MINERAL_PRICES_DATA].sort((a, b) => a.name.localeCompare(b.name));
}

export function getVerifiedMapLocations(): MapLocationData[] {
  return [...NIGERIA_MAP_DATA];
}

export function getAllListings(): (Listing | Auction)[] {
  return [...MARKETPLACE_LISTINGS_DATA, ...AUCTION_LISTINGS_DATA];
}
