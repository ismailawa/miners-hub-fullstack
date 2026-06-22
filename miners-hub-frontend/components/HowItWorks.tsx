import React, { useEffect, useRef } from 'react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>,
      title: 'Register & Verify',
      description: 'Create your account as a miner or investor and complete our secure verification process to ensure trust and safety.',
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
      title: 'Discover Opportunities',
      description: 'Browse our extensive database of mineral listings or find credible miners with detailed profiles and ratings.',
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>,
      title: 'Transact Securely',
      description: 'Utilize our secure payment and escrow services to conduct transactions with confidence and full transparency.',
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
      title: 'Track & Grow',
      description: 'Monitor your portfolio, track shipments, and access real-time data to grow your business and investments.',
    },
  ];

  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.2,
      }
    );

    stepRefs.current.forEach((ref) => {
      if (ref) {
        observer.observe(ref);
      }
    });

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      stepRefs.current.forEach((ref) => {
        if (ref) {
          observer.unobserve(ref);
        }
      });
    };
  }, []);

  return (
    <section className="py-20 bg-primary overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary">How It Works</h2>
          <p className="text-lg text-text-secondary mt-4 max-w-2xl mx-auto">A simple, transparent, and efficient process for everyone involved.</p>
        </div>

        {/* Vertical Roadmap Container */}
        <div className="relative max-w-5xl mx-auto">
          {/* The vertical line */}
          <div className="absolute left-6 md:left-1/2 top-0 h-full w-0.5 bg-border md:-translate-x-1/2" aria-hidden="true"></div>

          {/* Steps */}
          <div className="relative">
            {steps.map((step, index) => (
              <div
                key={index}
                // FIX: The ref callback function should not return a value. 
                // Using a concise body with parentheses `(el) => (assignment)` returns the result of the assignment.
                // Changed to a block body `(el) => { assignment }` to ensure a void return type.
                ref={(el) => { stepRefs.current[index] = el; }}
                className={`roadmap-step ${index % 2 === 0 ? 'roadmap-step-left' : 'md:roadmap-step-right roadmap-step-left'}`}
              >
                <div className={`mb-12 md:mb-8 flex md:justify-between items-center w-full ${index % 2 !== 0 ? 'md:flex-row-reverse' : 'flex-row'}`}>
                  {/* Spacer for desktop layout */}
                  <div className="hidden md:block w-5/12"></div>
                  
                  {/* Marker */}
                  <div className="z-10 absolute left-6 md:left-1/2 top-0 md:top-auto -translate-x-1/2">
                    <div className="w-12 h-12 bg-primary border-2 border-accent text-accent flex items-center justify-center rounded-full font-bold text-xl">
                      {index + 1}
                    </div>
                  </div>

                  {/* Card */}
                  <div className="md:w-5/12 w-full ml-20 md:ml-0">
                    <div className="p-6 bg-secondary/50 rounded-lg shadow-lg border border-border hover:border-accent hover:-translate-y-1 transition-all duration-300">
                      <div className="mb-4 text-accent">{step.icon}</div>
                      <h3 className="text-xl font-bold mb-2 text-text-primary">{step.title}</h3>
                      <p className="text-text-secondary">{step.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;