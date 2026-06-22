import { useMemo } from 'react';
import {
    MINERS_DATA,
    MARKETPLACE_LISTINGS_DATA,
    NEWS_DATA,
    EVENTS_DATA,
    WEBINARS_DATA
} from '../lib/constants/data';

export type SearchCategory = 'miners' | 'listings' | 'news' | 'events' | 'webinars';

export interface SearchResult {
    id: string;
    title: string;
    description: string;
    category: SearchCategory;
    link: string;
    imageUrl?: string;
}

export const useGlobalSearch = (query: string) => {
    const results = useMemo(() => {
        if (!query || query.length < 2) return [];

        const lowerQuery = query.toLowerCase();
        const allResults: SearchResult[] = [];

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
