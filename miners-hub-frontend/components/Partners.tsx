import React, { useEffect, useState } from 'react';
import {
  getPublishedTrustedPartners,
  type TrustedPartner,
} from '../lib/api/trusted-partners';

const Partners: React.FC = () => {
  const [partners, setPartners] = useState<TrustedPartner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    void getPublishedTrustedPartners()
      .then((data) => {
        if (mounted) setPartners(data);
      })
      .catch(() => {
        if (mounted) setPartners([]);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading || partners.length === 0) return null;

  const marqueePartners =
    partners.length > 2 ? [...partners, ...partners] : partners;

  return (
    <section className="bg-primary pb-12 pt-20">
      <div className="container mx-auto px-4">
        <h2 className="mb-10 text-center text-sm font-bold uppercase tracking-widest text-text-muted">
          Trusted by Industry Leaders
        </h2>
        <div className="relative w-full overflow-hidden">
          <div
            className={`flex items-center ${
              partners.length > 2
                ? 'animate-marquee-slow hover:[animation-play-state:paused]'
                : 'justify-center gap-12'
            }`}
          >
            {marqueePartners.map((partner, index) => {
              const logo = (
                <img
                  className="h-10 max-w-[180px] object-contain"
                  src={partner.logoUrl}
                  alt={partner.name}
                />
              );

              return (
                <div key={`${partner.id}-${index}`} className="mx-8 flex-shrink-0">
                  {partner.websiteUrl ? (
                    <a
                      href={partner.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={partner.name}
                      className="block opacity-75 transition-opacity hover:opacity-100"
                    >
                      {logo}
                    </a>
                  ) : (
                    logo
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Partners;
