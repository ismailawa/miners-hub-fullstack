import React, { useRef, useState, useEffect } from 'react';
import { TESTIMONIALS_DATA } from '../lib/constants/data';
import { Testimonial } from '../lib/types';

interface VideoModalProps {
  videoUrl: string;
  onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ videoUrl, onClose }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-primary/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-secondary rounded-lg shadow-xl relative w-full max-w-4xl aspect-video transform transition-transform duration-300 scale-95"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'scaleUp 0.3s ease-out forwards' }}
      >
        <button 
          onClick={onClose} 
          className="absolute -top-3 -right-3 text-accent-content bg-accent rounded-full h-9 w-9 flex items-center justify-center z-10 hover:bg-yellow-300 transition-colors"
          aria-label="Close video player"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <iframe
          src={videoUrl}
          title="Testimonial Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full rounded-lg"
        ></iframe>
      </div>
       <style>{`
        @keyframes scaleUp {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};


const TestimonialCard: React.FC<{ testimonial: Testimonial; onPlayClick: (videoUrl: string) => void }> = ({ testimonial, onPlayClick }) => {
  return (
    <div className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/3 p-4 snap-center">
      <div className="bg-secondary rounded-lg overflow-hidden shadow-lg h-full flex flex-col">
        <button onClick={() => onPlayClick(testimonial.videoUrl)} className="relative block group cursor-pointer">
          <img src={testimonial.videoThumbnailUrl} alt={`Testimonial from ${testimonial.name}`} className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-primary/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent-content" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </button>
        <div className="p-6 flex flex-col flex-grow">
          <blockquote className="text-text-secondary border-l-4 border-accent pl-4 italic">
            "{testimonial.quote}"
          </blockquote>
          <div className="mt-4">
            <p className="font-bold text-text-primary">{testimonial.name}</p>
            <p className="text-sm text-text-muted">{testimonial.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Testimonials: React.FC = () => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = scrollContainerRef.current.clientWidth * 0.75; 
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };
    
    const handleOpenModal = (videoUrl: string) => {
        setSelectedVideoUrl(videoUrl);
    };

    const handleCloseModal = () => {
        setSelectedVideoUrl(null);
    };


  return (
    <section id="testimonials" className="py-20 bg-primary">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
            <div className="max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary">Voices of Our Community</h2>
                <p className="text-lg text-text-secondary mt-4">See how Miners Hub is making a tangible impact across the industry.</p>
            </div>
            <div className="hidden sm:flex space-x-2">
                <button onClick={() => scroll('left')} aria-label="Previous testimonial" className="bg-secondary hover:bg-border text-text-primary p-3 rounded-full transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <button onClick={() => scroll('right')} aria-label="Next testimonial" className="bg-secondary hover:bg-border text-text-primary p-3 rounded-full transition-colors">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
        
        <div className="relative">
            <div ref={scrollContainerRef} className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-4">
                {TESTIMONIALS_DATA.map(testimonial => (
                    <TestimonialCard 
                        key={testimonial.id} 
                        testimonial={testimonial} 
                        onPlayClick={handleOpenModal}
                    />
                ))}
            </div>
        </div>
      </div>
      {selectedVideoUrl && <VideoModal videoUrl={selectedVideoUrl} onClose={handleCloseModal} />}
    </section>
  );
};

export default Testimonials;