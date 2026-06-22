'use client';

import Hero from '../../components/Hero';
import Partners from '../../components/Partners';
import MineralPrices from '../../components/MineralPrices';
import HowItWorks from '../../components/HowItWorks';
import Miners from '../../components/Miners';
import MapSection from '../../components/MapSection';
import Events from '../../components/Events';
import Newsletter from '../../components/Newsletter';
import Testimonials from '../../components/Testimonials';

export default function HomePage() {
    return (
        <>
            <Hero />
            <Partners />
            <MineralPrices />
            <HowItWorks />
            <Miners />
            <MapSection />
            <Events />
            <Newsletter />
            <Testimonials />
        </>
    );
}
