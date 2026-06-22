import React, { useState, useEffect } from 'react';
import { MINERS_DATA } from '../lib/constants/data';
import { Miner } from '../lib/types';
import { useAuth } from '../contexts/AuthContext';
import MinerChatModal from './MinerChatModal';

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center text-accent">
      {[...Array(fullStars)].map((_, i) => (
        <svg key={`full-${i}`} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
      ))}
      {halfStar && <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0v15z"/></svg>}
      {[...Array(emptyStars)].map((_, i) => (
        <svg key={`empty-${i}`} className="w-5 h-5 fill-current text-border" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
      ))}
    </div>
  );
};


const MinerDetailModal: React.FC<{ miner: Miner | null, onClose: () => void, onStartChat: (miner: Miner) => void }> = ({ miner, onClose, onStartChat }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        setCurrentImageIndex(0); // Reset to the first image when the miner changes
    }, [miner]);
    
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!miner) return null;

    const allImages = [miner.imageUrl, ...miner.siteImages];

    const handlePrev = () => {
        setCurrentImageIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentImageIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1));
    };


    return (
        <div className="fixed inset-0 bg-primary/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 animate-fade-in" onClick={onClose}>
            <div className="bg-secondary rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-transform duration-300 animate-scale-up" onClick={(e) => e.stopPropagation()}>
                <div className="p-8 relative">
                    <button onClick={onClose} className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors" aria-label="Close modal">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <div className="relative group">
                                <img src={allImages[currentImageIndex]} alt={miner.name} className="w-full h-80 object-cover rounded-lg mb-4 border border-border" />
                                <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={handlePrev} className="bg-black/50 text-white p-2 rounded-full hover:bg-black/80 transition-transform active:scale-95" aria-label="Previous image">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                    </button>
                                    <button onClick={handleNext} className="bg-black/50 text-white p-2 rounded-full hover:bg-black/80 transition-transform active:scale-95" aria-label="Next image">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                {allImages.map((img, index) => (
                                    <button key={img} onClick={() => setCurrentImageIndex(index)} className={`w-20 h-20 object-cover rounded-md border-2 transition-colors ${currentImageIndex === index ? 'border-accent' : 'border-transparent'}`}>
                                        <img src={img} alt={`thumbnail ${index + 1}`} className="w-full h-full object-cover rounded-sm"/>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                             <h2 className="text-3xl font-bold text-text-primary mb-2">{miner.name}</h2>
                             <p className="text-text-secondary mb-2">{miner.location}</p>
                             <div className="flex items-center space-x-2 mb-4">
                                <StarRating rating={miner.rating} />
                                <span className="text-sm font-bold text-text-primary">{miner.rating.toFixed(1)}</span>
                             </div>

                             <div className="mt-6 bg-primary p-4 rounded-lg border border-border">
                                <h3 className="font-semibold text-text-primary mb-2">Company History</h3>
                                <p className="text-text-secondary text-sm">{miner.history}</p>
                             </div>
                             
                             <div className="mt-6">
                                 <h3 className="font-semibold text-text-primary mb-2">Specializes In</h3>
                                 <div className="flex flex-wrap gap-2">
                                    {miner.minerals.map((mineral, index) => (
                                    <span key={index} className="bg-accent/10 text-accent text-xs font-semibold px-2.5 py-1 rounded-full">{mineral}</span>
                                    ))}
                                 </div>
                             </div>
                             
                             <div className="mt-8 flex flex-col sm:flex-row gap-2">
                                 <button 
                                     onClick={() => onStartChat(miner)} 
                                     className="flex-1 flex items-center justify-center bg-accent text-accent-content font-semibold py-3 px-6 sm:px-3 rounded-md hover:bg-yellow-400 transition-colors"
                                     aria-label="Chat with Miner"
                                 >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                      </svg>
                                     <span className="sm:hidden ml-2">Chat with Miner</span>
                                 </button>
                                 <a 
                                    href={`mailto:${miner.contactEmail}`} 
                                    className="sm:flex-shrink-0 flex items-center justify-center bg-border text-text-primary font-semibold py-3 sm:px-3 rounded-md hover:bg-border/80 transition-colors"
                                    aria-label="Email Miner"
                                 >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span className="sm:hidden ml-2">Email Miner</span>
                                 </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-scale-up { animation: scaleUp 0.3s ease-out forwards; }
                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};


const MinerCard: React.FC<{ miner: Miner, onSelect: (miner: Miner) => void }> = ({ miner, onSelect }) => {
  return (
    <div className="bg-secondary rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-2 transition-transform duration-300 group flex flex-col">
      <img src={miner.imageUrl} alt={miner.name} className="w-full h-48 object-cover" />
      <div className="p-6 flex flex-col flex-grow">
        <div>
            <h3 className="text-xl font-bold text-text-primary">{miner.name}</h3>
            <p className="text-sm text-text-muted mt-1">{miner.location}</p>
            <div className="mt-4">
                <StarRating rating={miner.rating} />
            </div>
        </div>
        <div className="mt-auto pt-4">
            <button 
                onClick={() => onSelect(miner)}
                className="w-full bg-border text-text-primary font-semibold py-2 rounded-md hover:bg-accent hover:text-accent-content transition-colors duration-300"
            >
                View Profile
            </button>
        </div>
      </div>
    </div>
  );
};

const Miners: React.FC = () => {
  const [miners] = useState<Miner[]>(MINERS_DATA);
  const [selectedMiner, setSelectedMiner] = useState<Miner | null>(null);
  const { currentUser, setPage } = useAuth();
  const [chattingWith, setChattingWith] = useState<Miner | null>(null);

  const handleStartChat = (minerToChat: Miner) => {
    if (!currentUser) {
        setPage('login');
        return;
    }
    setSelectedMiner(null); // close detail modal
    setChattingWith(minerToChat);
  };

  return (
    <>
      <section id="miners" className="py-20 bg-primary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary">Credible & Verified Miners</h2>
            <p className="text-lg text-text-secondary mt-4 max-w-2xl mx-auto">Connect with trusted mining professionals and companies across Nigeria.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {miners.map((miner) => (
              <MinerCard key={miner.id} miner={miner} onSelect={setSelectedMiner} />
            ))}
          </div>
        </div>
      </section>
      <MinerDetailModal miner={selectedMiner} onClose={() => setSelectedMiner(null)} onStartChat={handleStartChat} />
      <MinerChatModal isOpen={!!chattingWith} onClose={() => setChattingWith(null)} miner={chattingWith as Miner | null} />
    </>
  );
};

export default Miners;