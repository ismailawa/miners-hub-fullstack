import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="bg-secondary p-8 rounded-lg border border-border transform hover:-translate-y-2 transition-transform duration-300">
        <div className="text-accent mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-text-primary mb-2">{title}</h3>
        <p className="text-text-secondary">{description}</p>
    </div>
);

const WarehousingPage: React.FC = () => {
    const { setPage } = useAuth();

    const features = [
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
            title: 'Secure Facilities',
            description: 'State-of-the-art security with 24/7 surveillance, controlled access, and trained personnel to ensure your assets are protected.'
        },
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
            title: 'Advanced Inventory Management',
            description: 'Real-time tracking of your inventory with our digital platform. Manage stock levels, view reports, and schedule movements with ease.'
        },
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 11l7-7 7 7M5 19l7-7 7 7" /></svg>,
            title: 'Climate-Controlled Environments',
            description: 'Specialized storage options for sensitive minerals, ensuring preservation of quality and integrity through controlled temperature and humidity.'
        },
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
            title: 'Strategic Locations',
            description: 'Our warehouses are strategically located near major ports and transport hubs, reducing transit times and logistics costs.'
        },
    ];

    return (
        <main className="pt-20 bg-primary">
            {/* Hero Section */}
            <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center text-center px-4 overflow-hidden">
                <div 
                    className="absolute inset-0 bg-cover bg-center z-0" 
                    style={{ backgroundImage: `url('https://picsum.photos/seed/warehouse/1920/1080')` }}
                >
                    <div className="absolute inset-0 bg-primary bg-opacity-70"></div>
                </div>
                <div className="relative z-10 max-w-4xl mx-auto animate-fade-in-up">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-text-primary">Secure Warehousing & Storage</h1>
                    <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mt-4">
                        Protecting your valuable mineral assets with state-of-the-art facilities and advanced inventory management.
                    </p>
                </div>
            </section>

            <div className="container mx-auto px-4 py-20">
                {/* Features Section */}
                <section className="mb-20">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary">Our Facility Features</h2>
                        <p className="text-lg text-text-secondary mt-4 max-w-2xl mx-auto">Designed to provide maximum security and efficiency for your mineral storage needs.</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map(feature => (
                            <FeatureCard key={feature.title} {...feature} />
                        ))}
                    </div>
                </section>
                
                {/* Process Section */}
                <section className="mb-20">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                             <img src="https://picsum.photos/seed/warehouse2/800/600" alt="Warehouse interior" className="rounded-lg shadow-lg" />
                        </div>
                        <div>
                             <h2 className="text-3xl font-extrabold text-text-primary mb-6">A Streamlined Process</h2>
                             <div className="space-y-4 text-text-secondary">
                                <p>Our process is designed for simplicity and efficiency. From initial consultation to final dispatch, we handle every detail.</p>
                                <ul className="space-y-4">
                                    <li className="flex items-start"><span className="text-accent font-bold text-lg mr-3 mt-1">&#x2713;</span><span><strong>Consultation:</strong> We assess your specific storage needs and recommend the best solution.</span></li>
                                    <li className="flex items-start"><span className="text-accent font-bold text-lg mr-3 mt-1">&#x2713;</span><span><strong>Receiving & Inspection:</strong> Your assets are carefully received, inspected, and documented upon arrival.</span></li>
                                    <li className="flex items-start"><span className="text-accent font-bold text-lg mr-3 mt-1">&#x2713;</span><span><strong>Secure Storage:</strong> Your minerals are stored in the appropriate environment with real-time inventory tracking.</span></li>
                                    <li className="flex items-start"><span className="text-accent font-bold text-lg mr-3 mt-1">&#x2713;</span><span><strong>Dispatch & Delivery:</strong> We coordinate with our logistics partners for seamless dispatch and delivery to your desired destination.</span></li>
                                </ul>
                             </div>
                        </div>
                    </div>
                </section>
                
                {/* CTA Section */}
                <section className="bg-secondary rounded-lg shadow-lg p-8 md:p-12 border border-border text-center">
                     <h2 className="text-3xl font-extrabold text-text-primary">Ready to Secure Your Assets?</h2>
                    <p className="text-lg text-text-secondary mt-4 max-w-2xl mx-auto">
                        Contact us today to get a customized quote for our warehousing and storage solutions.
                    </p>
                    <div className="mt-8">
                        <button onClick={() => setPage('logistics', { section: 'logistics-quote' })} className="bg-accent text-accent-content hover:bg-yellow-400 font-bold py-3 px-8 rounded-full text-lg transition-all duration-300">
                            Get a Quote
                        </button>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default WarehousingPage;
