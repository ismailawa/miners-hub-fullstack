import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const ValueCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="bg-secondary p-6 rounded-lg border border-border text-center">
        <div className="text-accent inline-block mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-text-primary mb-2">{title}</h3>
        <p className="text-text-secondary">{description}</p>
    </div>
);

const TeamMemberCard: React.FC<{ imageUrl: string; name: string; role: string }> = ({ imageUrl, name, role }) => (
     <div className="bg-secondary rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-2 transition-transform duration-300 group">
        <img src={imageUrl} alt={name} className="w-full h-64 object-cover" />
        <div className="p-4 text-center">
            <h3 className="text-lg font-bold text-text-primary">{name}</h3>
            <p className="text-accent">{role}</p>
        </div>
    </div>
);


const AboutUsPage: React.FC = () => {
    const { setPage } = useAuth();

    const values = [
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
            title: 'Integrity',
            description: 'We uphold the highest standards of honesty and transparency in every transaction and interaction.'
        },
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
            title: 'Innovation',
            description: 'We leverage cutting-edge technology to simplify complexities and create a seamless trading experience.'
        },
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.122-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.122-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
            title: 'Empowerment',
            description: 'We are dedicated to empowering local miners and communities, fostering sustainable growth and shared prosperity.'
        }
    ];

    const team = [
        { imageUrl: 'https://picsum.photos/seed/ceo/400/600', name: 'Dr. Tunde Adebayo', role: 'Founder & CEO' },
        { imageUrl: 'https://picsum.photos/seed/cto/400/600', name: 'Chinwe Nwosu', role: 'Chief Technology Officer' },
        { imageUrl: 'https://picsum.photos/seed/coo/400/600', name: 'David Chen', role: 'Chief Operations Officer' },
        { imageUrl: 'https://picsum.photos/seed/cfo/400/600', name: 'Amina Bello', role: 'Head of Miner Relations' },
    ];


    return (
        <main className="pt-20 pb-12 md:py-20 bg-primary">
            <div className="container mx-auto px-4">
                {/* Header */}
                <section className="text-center py-16 animate-fade-in-down">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary">About Miners Hub</h1>
                    <p className="text-lg text-text-secondary mt-4 max-w-3xl mx-auto">We are forging the digital backbone of Africa's mineral trade, connecting verified miners with global opportunities.</p>
                </section>

                {/* Our Story */}
                <section className="mb-20">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="order-2 md:order-1">
                             <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary mb-6">Our Story</h2>
                             <div className="space-y-4 text-text-secondary">
                                <p>Miners Hub was born from a simple yet powerful observation: Africa's vast mineral wealth was largely inaccessible to the global market in a transparent and efficient way. Small-scale and artisanal miners struggled to connect with credible buyers, while international investors faced significant challenges in navigating the complexities of the local market.</p>
                                <p>Founded by a team of geologists, tech innovators, and finance experts with deep roots in Nigeria, we set out to build a platform that bridges this gap. Our mission is to leverage technology to formalize the sector, empower local communities, and create a trusted ecosystem for mineral trading that benefits everyone.</p>
                             </div>
                        </div>
                         <div className="order-1 md:order-2">
                             <img src="https://picsum.photos/seed/aboutus/800/600" alt="Mining operation" className="rounded-lg shadow-lg" />
                        </div>
                    </div>
                </section>
                
                {/* Our Values */}
                <section className="mb-20">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary">Our Values</h2>
                        <p className="text-lg text-text-secondary mt-4 max-w-2xl mx-auto">The principles that guide every decision we make.</p>
                    </div>
                    <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {values.map(value => (
                            <ValueCard key={value.title} {...value} />
                        ))}
                    </div>
                </section>

                {/* Meet the Team */}
                <section className="mb-20">
                    <div className="text-center mb-12">
                         <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary">Meet the Team</h2>
                        <p className="text-lg text-text-secondary mt-4 max-w-2xl mx-auto">The passionate individuals driving our mission forward.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {team.map(member => (
                            <TeamMemberCard key={member.name} {...member} />
                        ))}
                    </div>
                </section>
                
                {/* CTA Section */}
                <section className="bg-secondary rounded-lg shadow-lg p-8 md:p-12 border border-border text-center">
                     <h2 className="text-3xl font-extrabold text-text-primary">Join Us on Our Mission</h2>
                    <p className="text-lg text-text-secondary mt-4 max-w-2xl mx-auto">
                       Become part of a community that is building a more transparent and prosperous future for the African mineral sector.
                    </p>
                    <div className="mt-8">
                        <button onClick={() => setPage('register')} className="bg-accent text-accent-content hover:bg-yellow-400 font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-accent/40">
                            Get Started
                        </button>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default AboutUsPage;