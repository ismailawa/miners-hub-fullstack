import React from 'react';
import { PARTNER_LOGOS } from '../lib/constants/data';

const Partners: React.FC = () => {
  const duplicatedLogos = [...PARTNER_LOGOS, ...PARTNER_LOGOS];

  return (
    <div className="pt-20 pb-12 bg-primary">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-sm font-bold text-text-muted uppercase tracking-widest mb-10">
          Trusted by Industry Leaders
        </h2>
        <div className="relative w-full overflow-hidden group">
          <div className="flex items-center animate-marquee-slow group-hover:[animation-play-state:paused]">
            {duplicatedLogos.map((logo, index) => (
              <div key={index} className="flex-shrink-0 mx-12">
                <img
                  className="h-8 md:h-10 object-contain dark:invert"
                  src={logo}
                  alt={`Partner logo ${index % PARTNER_LOGOS.length + 1}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Partners;