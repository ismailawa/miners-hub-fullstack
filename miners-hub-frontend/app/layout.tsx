import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
    title: 'Miners Hub',
    description: 'Digital ecosystem for the mining industry',
    manifest: '/manifest.webmanifest',
    icons: {
        icon: [
            { url: '/favicon.svg', type: 'image/svg+xml' },
            { url: '/icon.svg', type: 'image/svg+xml' },
        ],
        apple: [{ url: '/apple-icon.svg', type: 'image/svg+xml' }],
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            {/* Script to restore theme moved to providers/useEffect or handled by a ThemeProvider later. 
          For now we rely on logical defaults or hydration. */}
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
