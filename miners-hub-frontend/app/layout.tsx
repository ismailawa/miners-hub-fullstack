import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Miners Hub',
    description: 'Digital ecosystem for the mining industry',
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
            <body className={inter.className}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
