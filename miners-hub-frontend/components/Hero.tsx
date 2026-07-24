import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { VerificationStatus } from "../lib/types";

const slides = [
  {
    id: "connecting",
    image: "/connecting.png",
    imagePosition: "center",
    eyebrow: "Africa mineral trade network",
    title: {
      start: "Connecting Africa's",
      highlight: "Mineral Wealth",
      end: "with Global Investors",
    },
    subtitle:
      "A transparent mineral marketplace connecting verified miners, investors, buyers, and government stakeholders.",
    cta1: { text: "Explore Marketplace", page: "marketplace" },
    cta2: { text: "Watch Video", page: "services" },
  },
  {
    id: "investors",
    image: "/investors.png",
    imagePosition: "center",
    eyebrow: "Verified investor opportunities",
    title: {
      start: "Unlocking Nigeria's",
      highlight: "Mineral Projects",
      end: "for Trusted Capital",
    },
    subtitle:
      "Review investable mineral projects with due diligence, risk scoring, compliance records, and evidence.",
    cta1: { text: "View Opportunities", page: "investment-opportunities" },
    cta2: { text: "Explore Services", page: "services" },
  },
  {
    id: "technology",
    image: "/technology.png",
    imagePosition: "center",
    eyebrow: "Digital mining infrastructure",
    title: {
      start: "Empowering Miners",
      highlight: "with Technology",
      end: "and Market Access",
    },
    subtitle:
      "Digitize onboarding, mine-site records, licenses, reports, lab results, logistics, and export readiness.",
    cta1: { text: "Register as a Miner", page: "register" },
    cta2: { text: "Read Our Guide", page: "registration-guide" },
  },
];

const featureCards = [
  {
    title: "Empowering Miners with Technology and Market Access",
    description:
      "Our platform provides the tools, data, and connections needed to grow legal mining operations.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="m14.7 6.3 3 3M4 20l9.6-9.6m-1.8-5.1 6.9 6.9m-8.7-8.7h6.3l4.2 4.2-6.3 6.3L10 9.8V3.5Z"
      />
    ),
  },
  {
    title: "Discover Verified Mineral Listings",
    description:
      "Browse a real-time marketplace of high-quality minerals from vetted sources across Nigeria.",
    icon: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.6 9h16.8M3.6 15h16.8M12 3c2.2 2.5 3.3 5.5 3.3 9S14.2 18.5 12 21c-2.2-2.5-3.3-5.5-3.3-9S9.8 5.5 12 3Z" />
      </>
    ),
  },
  {
    title: "Secure. Transparent. Reliable.",
    description:
      "Every transaction is designed around verification, compliance, escrow readiness, and traceability.",
    icon: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3 5 6v5c0 4.6 2.9 8.8 7 10 4.1-1.2 7-5.4 7-10V6l-7-3Z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.8 12.2 11.4 14l3-4" />
      </>
    ),
  },
];

const stats = [
  { value: "2,000+", label: "Verified Miners", icon: "users" },
  { value: "500+", label: "Mineral Listings", icon: "gem" },
  { value: "30+", label: "Countries Reached", icon: "globe" },
  { value: "100+", label: "Active Investors", icon: "handshake" },
];

const HeroIcon: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <span
    className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-amber-300/[0.35] bg-amber-400/10 text-amber-300 shadow-[0_0_28px_rgba(245,158,11,0.24)] ${className}`}
  >
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {children}
    </svg>
  </span>
);

const StatIcon: React.FC<{ icon: string }> = ({ icon }) => {
  const paths: Record<string, React.ReactNode> = {
    users: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11a4 4 0 1 0-8 0" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 20a6 6 0 0 1 12 0M17 8a3 3 0 0 1 2 5.2M18.5 20a4.5 4.5 0 0 0-3-4.2" />
      </>
    ),
    gem: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 3h12l4 6-10 12L2 9l4-6Zm-4 6h20M8 3l4 18 4-18" />
    ),
    globe: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.6 9h16.8M3.6 15h16.8M12 3c2.2 2.5 3.3 5.5 3.3 9S14.2 18.5 12 21c-2.2-2.5-3.3-5.5-3.3-9S9.8 5.5 12 3Z" />
      </>
    ),
    handshake: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m7.5 12.5 2.3 2.3a2.5 2.5 0 0 0 3.5 0l.9-.9m-6.7-1.4L5 15l-3-3 4.8-4.8a3 3 0 0 1 4.2 0l.5.5m2 2 1.3-1.3a3 3 0 0 1 4.2 0L22 11l-3 3-1.7-1.7m-3.8-2.6 3.8 3.8a2.5 2.5 0 0 1 0 3.5l-.6.6a2 2 0 0 1-2.8 0l-.6-.6" />
    ),
  };

  return (
    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-amber-300/25 bg-black/25 text-amber-300">
      <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {paths[icon]}
      </svg>
    </span>
  );
};

const Hero: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { currentUser, setPage } = useAuth();

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setTimeout(goToNext, 8000);
    return () => clearTimeout(timer);
  }, [currentIndex, goToNext]);

  useEffect(() => {
    slides.forEach((slide) => {
      const image = new Image();
      image.src = slide.image;
    });
  }, []);

  const currentSlide = slides[currentIndex];
  const shouldContinueOnboarding = Boolean(
    currentUser &&
      (!currentUser.onboardingComplete ||
        currentUser.status !== VerificationStatus.VERIFIED),
  );

  const handlePrimaryAction = () => {
    if (shouldContinueOnboarding) {
      setPage("onboarding");
      return;
    }
    setPage(currentSlide.cta1.page);
  };

  return (
    <section className="relative isolate h-[900px] overflow-hidden bg-[#061119] pt-24 text-white sm:h-[880px] lg:h-[860px]">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          aria-hidden={index !== currentIndex}
          className={`absolute inset-0 -z-20 bg-cover transition-[opacity,transform] duration-[1600ms] ease-out ${
            index === currentIndex ? "scale-100 opacity-100" : "scale-[1.03] opacity-0"
          }`}
          style={{
            backgroundImage: `url('${slide.image}')`,
            backgroundPosition: slide.imagePosition,
          }}
        />
      ))}

      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_70%_12%,rgba(245,158,11,0.18),transparent_28%),linear-gradient(90deg,rgba(2,8,13,0.96)_0%,rgba(2,8,13,0.76)_42%,rgba(2,8,13,0.34)_72%,rgba(2,8,13,0.78)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-64 bg-gradient-to-t from-[#061119] via-[#061119]/72 to-transparent" />
      <div className="absolute inset-y-0 left-0 -z-10 w-2/3 bg-gradient-to-r from-black/70 via-black/28 to-transparent" />

      <div className="mx-auto grid h-full w-full max-w-7xl grid-rows-[minmax(0,1fr)_auto_auto] gap-7 px-5 pb-8 sm:px-8 lg:px-10">
        <div className="grid min-h-0 items-center gap-8 pt-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(300px,0.42fr)]">
          <div className="max-w-3xl self-center">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-200 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_16px_rgba(252,211,77,0.9)]" />
              {currentSlide.eyebrow}
            </p>

            <h1 className="max-w-3xl text-[clamp(1.9rem,4vw,3.55rem)] font-black leading-[1.04] text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.55)]">
              <span className="block sm:whitespace-nowrap">{currentSlide.title.start}</span>
              <span className="block bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500 bg-clip-text text-transparent sm:whitespace-nowrap">
                {currentSlide.title.highlight}
              </span>
              <span className="block sm:whitespace-nowrap">{currentSlide.title.end}</span>
            </h1>

            <p className="mt-4 max-w-[34rem] text-sm leading-6 text-white/[0.84] sm:h-12 sm:text-base">
              {currentSlide.subtitle}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handlePrimaryAction}
                className="inline-flex h-10 items-center justify-center rounded-md bg-gradient-to-r from-amber-300 to-amber-500 px-5 text-xs font-extrabold text-[#081018] shadow-[0_18px_45px_rgba(245,158,11,0.28)] transition-transform hover:-translate-y-0.5 hover:from-amber-200 hover:to-amber-400"
              >
                {shouldContinueOnboarding ? "Continue Onboarding" : currentSlide.cta1.text}
              </button>
              <button
                onClick={() => setPage(currentSlide.cta2.page)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/[0.35] bg-black/20 px-5 text-xs font-bold text-white backdrop-blur-md transition-colors hover:border-amber-300 hover:text-amber-200"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#081018]">
                  <svg className="ml-0.5 h-2.5 w-2.5" viewBox="0 0 12 14" fill="currentColor" aria-hidden="true">
                    <path d="M11 7 1 13V1l10 6Z" />
                  </svg>
                </span>
                {currentSlide.cta2.text}
              </button>
            </div>
          </div>

          <div className="hidden self-end justify-self-end lg:block">
            <div className="relative h-[320px] w-[280px]">
              <div className="absolute bottom-0 right-0 h-36 w-56 rounded-[55%_45%_40%_60%] bg-emerald-400/20 blur-3xl" />
              <div className="absolute bottom-3 right-2 grid grid-cols-3 items-end gap-3">
                {["bg-amber-400", "bg-slate-500", "bg-emerald-500", "bg-zinc-300", "bg-stone-700"].map((color, index) => (
                  <span
                    key={color}
                    className={`${color} block rounded-[38%_62%_45%_55%] border border-white/20 shadow-2xl`}
                    style={{
                      width: `${44 + index * 8}px`,
                      height: `${36 + (index % 3) * 16}px`,
                      transform: `rotate(${[-9, 7, -5, 11, -13][index]}deg)`,
                      opacity: 0.82,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          {featureCards.map((card) => (
            <article
              key={card.title}
              className="min-h-[118px] rounded-lg border border-white/[0.14] bg-white/[0.075] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl"
            >
              <div className="flex items-start gap-3.5">
                <HeroIcon>{card.icon}</HeroIcon>
                <div>
                  <h2 className="text-sm font-extrabold leading-snug text-white sm:text-base">
                    {card.title}
                  </h2>
                  <p className="mt-2 hidden text-xs leading-5 text-white/[0.78] sm:block">
                    {card.description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`flex items-center gap-4 ${index > 0 ? "lg:border-l lg:border-white/[0.14] lg:pl-8" : ""}`}
            >
              <StatIcon icon={stat.icon} />
              <div>
                <p className="text-xl font-black leading-none text-white">{stat.value}</p>
                <p className="mt-1 text-xs font-medium text-white/[0.76]">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-8 right-5 z-10 flex gap-2 sm:right-8 lg:right-10">
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.id}
              onClick={() => setCurrentIndex(slideIndex)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                currentIndex === slideIndex ? "w-9 bg-amber-300" : "w-2.5 bg-white/[0.45] hover:bg-white/75"
              }`}
              aria-label={`Go to ${slide.eyebrow}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
