import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-primary text-text-secondary min-h-screen overflow-x-hidden flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}
