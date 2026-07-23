import { useMemo } from 'react';
import {
    MINERS_DATA,
    MARKETPLACE_LISTINGS_DATA,
    NEWS_DATA,
    EVENTS_DATA,
    WEBINARS_DATA
} from '../lib/constants/data';

export type SearchCategory = 'pages' | 'miners' | 'listings' | 'news' | 'events' | 'webinars';

export interface SearchResult {
    id: string;
    title: string;
    description: string;
    category: SearchCategory;
    link: string;
    page?: string;
    imageUrl?: string;
    keywords?: string[];
}

const PAGE_RESULTS: SearchResult[] = [
    {
        id: 'marketplace',
        title: 'Marketplace',
        description: 'Search verified minerals, sellers, prices, quantities, and auctions.',
        category: 'pages',
        link: '/marketplace',
        page: 'marketplace',
        keywords: ['buy minerals', 'sell minerals', 'listings', 'auction', 'gold', 'lithium', 'market'],
    },
    {
        id: 'investor-opportunities',
        title: 'Investor Opportunities',
        description: 'Review investment-ready mine opportunities, diligence packs, and inquiries.',
        category: 'pages',
        link: '/investment-opportunities',
        page: 'investment-opportunities',
        keywords: ['investment', 'investor', 'opportunity', 'due diligence', 'finance'],
    },
    {
        id: 'logistics',
        title: 'Logistics',
        description: 'Request haulage, warehousing, transport quotes, and delivery support.',
        category: 'pages',
        link: '/logistics',
        page: 'logistics',
        keywords: ['transport', 'shipment', 'haulage', 'delivery', 'warehouse'],
    },
    {
        id: 'registration-guide',
        title: 'Registration Guide',
        description: 'Learn mining registration, licensing, and compliance steps.',
        category: 'pages',
        link: '/registration-guide',
        page: 'registration-guide',
        keywords: ['register', 'license', 'compliance', 'cadastre', 'guide'],
    },
    {
        id: 'knowledge-base',
        title: 'Knowledge Base',
        description: 'Find practical mining, trade, compliance, and onboarding answers.',
        category: 'pages',
        link: '/knowledge-base',
        page: 'knowledge-base',
        keywords: ['help', 'support', 'learn', 'faq', 'documents'],
    },
    {
        id: 'data-analytics',
        title: 'Data & Analytics',
        description: 'Explore market trends, production analytics, and price forecasts.',
        category: 'pages',
        link: '/data-analytics',
        page: 'data-analytics',
        keywords: ['analytics', 'prices', 'market summary', 'forecast', 'data'],
    },
];

const matches = (query: string, values: Array<string | undefined>) => (
    values.some(value => value?.toLowerCase().includes(query))
);

export const useGlobalSearch = (query: string) => {
    const results = useMemo(() => {
        if (!query || query.length < 2) return [];

        const lowerQuery = query.toLowerCase();
        const allResults: SearchResult[] = [];

        PAGE_RESULTS.forEach(page => {
            if (matches(lowerQuery, [page.title, page.description, ...(page.keywords || [])])) {
                allResults.push(page);
            }
        });

        // Search Miners
        MINERS_DATA.forEach(miner => {
            if (
                miner.name.toLowerCase().includes(lowerQuery) ||
                miner.location.toLowerCase().includes(lowerQuery) ||
                miner.minerals.some(m => m.toLowerCase().includes(lowerQuery))
            ) {
                allResults.push({
                    id: miner.id,
                    title: miner.name,
                    description: `${miner.location} - ${miner.minerals.join(', ')}`,
                    category: 'miners',
                    link: `/miner/${miner.id}`,
                    imageUrl: miner.imageUrl
                });
            }
        });

        // Search Listings
        MARKETPLACE_LISTINGS_DATA.forEach(listing => {
            if (
                listing.mineral.toLowerCase().includes(lowerQuery) ||
                listing.description.toLowerCase().includes(lowerQuery) ||
                listing.location.toLowerCase().includes(lowerQuery)
            ) {
                allResults.push({
                    id: listing.id,
                    title: `${listing.mineral} (${listing.quantity} ${listing.unit})`,
                    description: `${listing.location} - ${listing.grade}`,
                    category: 'listings',
                    link: `/marketplace/${listing.id}`, // Note: Adjust link based on actual routing
                    imageUrl: listing.images[0]
                });
            }
        });

        // Search News
        NEWS_DATA.forEach(news => {
            if (
                news.title.toLowerCase().includes(lowerQuery) ||
                news.summary.toLowerCase().includes(lowerQuery)
            ) {
                allResults.push({
                    id: news.id,
                    title: news.title,
                    description: news.summary.substring(0, 60) + '...',
                    category: 'news',
                    link: `/news/${news.id}`,
                    imageUrl: news.imageUrl
                });
            }
        });

        // Search Events
        EVENTS_DATA.forEach(event => {
            if (
                event.title.toLowerCase().includes(lowerQuery) ||
                event.location.toLowerCase().includes(lowerQuery)
            ) {
                allResults.push({
                    id: event.id.toString(),
                    title: event.title,
                    description: `${event.date} - ${event.location}`,
                    category: 'events',
                    link: '/events', // Or specific event link if available
                    imageUrl: event.imageUrl
                });
            }
        });

        // Search Webinars
        WEBINARS_DATA.forEach(webinar => {
            if (
                webinar.title.toLowerCase().includes(lowerQuery) ||
                webinar.description.toLowerCase().includes(lowerQuery)
            ) {
                allResults.push({
                    id: webinar.id,
                    title: webinar.title,
                    description: webinar.speaker,
                    category: 'webinars',
                    link: '/resources', // Assuming webinars are under resources
                    imageUrl: webinar.thumbnailUrl
                });
            }
        });

        return allResults;
    }, [query]);

    return results;
};
