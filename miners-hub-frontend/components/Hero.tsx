import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

const slides = [
  {
    image: 'https://picsum.photos/seed/mininghero1/1920/1080',
    title: "Connecting Africa's Mineral Wealth with Global Investors",
    subtitle: "The premier digital marketplace for transparent and efficient mineral trading, empowering miners, investors, and governments.",
    cta1: { text: 'Get Started', page: 'register' },
    cta2: { text: 'Learn More', page: 'services' },
  },
  {
    image: 'https://picsum.photos/seed/mininghero2/1920/1080',
    title: "Discover Verified Mineral Listings and Secure Your Supply Chain",
    subtitle: "Browse a real-time marketplace of high-quality minerals from vetted sources across Nigeria.",
    cta1: { text: 'Explore Marketplace', page: 'marketplace' },
    cta2: { text: 'View Miners', page: 'home', section: 'miners' },
  },
  {
    image: 'https://picsum.photos/seed/mininghero3/1920/1080',
    title: "Empowering Miners with Technology and Market Access",
    subtitle: "Our platform provides the tools, data, and connections you need to grow your mining business.",
    cta1: { text: 'Register as a Miner', page: 'register' },
    cta2: { text: 'Read Our Guide', page: 'registration-guide' },
  },
];


const Hero: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { setPage } = useAuth();

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setTimeout(goToNext, 7000); // Auto-advance every 7 seconds
    return () => clearTimeout(timer);
  }, [currentIndex, goToNext]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  };

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  const currentSlide = slides[currentIndex];

  return (
    <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center text-center px-4 overflow-hidden">
      {/* Background Slides */}
      {slides.map((slide, index) => (
        <div 
          key={index}
          className="absolute inset-0 bg-cover bg-center z-0 transition-opacity duration-1000 ease-in-out" 
          style={{ 
            backgroundImage: `url('${slide.image}')`,
            opacity: index === currentIndex ? 1 : 0,
          }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-primary bg-opacity-70"></div>
            {/* Grid Pattern */}
            <div 
                className="absolute inset-0 bg-repeat" 
                style={{
                    backgroundImage: 'url(\'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDQwTCA0MCAwIE0gMC41IDAgTCAwIDAuNSBNIDM5LjUgNDAgTCA0MCAzOS41IiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L2c+PC9zdmc+\')'
                }}
            ></div>
        </div>
      ))}
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto" key={currentIndex}>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-text-primary leading-tight mb-4 animate-fade-in-down"
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
          {currentSlide.title}
        </h1>
        <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          {currentSlide.subtitle}
        </p>
        <div className="flex justify-center space-x-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <button
            // FIX: The 'section' property might not exist on the cta1 object. Cast to a type with an optional 'section' to resolve the TypeScript error.
            onClick={() => setPage(currentSlide.cta1.page, { section: (currentSlide.cta1 as { section?: string }).section })}
            className="bg-accent text-accent-content hover:bg-yellow-400 font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-accent/40"
          >
            {currentSlide.cta1.text}
          </button>
          <button
            // FIX: The 'section' property might not exist on the cta2 object. Cast to a type with an optional 'section' to resolve potential TypeScript errors.
            onClick={() => setPage(currentSlide.cta2.page, { section: (currentSlide.cta2 as { section?: string }).section })}
            className="bg-transparent border-2 border-text-primary text-text-primary hover:bg-text-primary hover:text-primary font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105"
          >
            {currentSlide.cta2.text}
          </button>
        </div>
      </div>
      
       {/* Navigation Arrows */}
      <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-4 z-20">
          <button onClick={goToPrevious} className="bg-black/30 text-white p-3 rounded-full hover:bg-black/50 transition-colors" aria-label="Previous slide">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={goToNext} className="bg-black/30 text-white p-3 rounded-full hover:bg-black/50 transition-colors" aria-label="Next slide">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
      </div>

       {/* Dot Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
          {slides.map((_, slideIndex) => (
              <button 
                key={slideIndex} 
                onClick={() => goToSlide(slideIndex)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${currentIndex === slideIndex ? 'bg-accent w-6' : 'bg-white/50 hover:bg-white'}`}
                aria-label={`Go to slide ${slideIndex + 1}`}
              ></button>
          ))}
      </div>

       {/* Decorative gradient */}
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-primary to-transparent z-10"></div>
    </section>
  );
};

export default Hero;