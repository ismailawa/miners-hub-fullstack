import React from "react";
import { useAuth } from "../contexts/AuthContext";

const ServiceCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <div className="bg-secondary p-6 rounded-lg border border-border transform hover:-translate-y-2 transition-transform duration-300">
    <div className="text-accent mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-text-primary mb-2">{title}</h3>
    <p className="text-text-secondary">{description}</p>
  </div>
);

const BenefitItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="flex items-start space-x-3">
    <svg
      className="flex-shrink-0 h-6 w-6 text-green-400"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M5 13l4 4L19 7"
      />
    </svg>
    <span className="text-text-secondary">{children}</span>
  </li>
);

const ServicesPage: React.FC = () => {
  const { setPage } = useAuth();

  const services = [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
      title: "Verified Marketplace",
      description:
        "Access approved listings from verified sellers with document status, due diligence evidence, lab links, escrow readiness, and traceability signals.",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01"
          />
        </svg>
      ),
      title: "Secure Escrow & Payments",
      description:
        "Conduct transactions with confidence. Our secure escrow service holds funds until all parties fulfill their obligations, ensuring financial safety.",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1zM3 11h10"
          />
        </svg>
      ),
      title: "Integrated Logistics",
      description:
        "From mine to market, our logistics solutions cover ground transport, warehousing, customs clearance, and international shipping for a seamless supply chain.",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      ),
      title: "Data & Analytics",
      description:
        "Make informed decisions with access to real-time market data, price trends, production analytics, and export statistics.",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      title: "Compliance & Advisory",
      description:
        "Track license records, renewal signals, document reviews, environmental obligations, inspection actions, and export-readiness requirements.",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      title: "Investor Readiness",
      description:
        "Package site, license, production, compliance, ESG, logistics, and risk evidence into opportunities investors can evaluate with confidence.",
    },
  ];

  return (
    <main className="pt-20 pb-12 md:py-20 bg-primary">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center py-16 animate-fade-in-down">
          <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary">
            Our Services
          </h1>
          <p className="text-lg text-text-secondary mt-4 max-w-3xl mx-auto">
            Compliance-first digital infrastructure for verified mineral
            commerce, regulatory visibility, logistics coordination, and
            investor-ready opportunities.
          </p>
        </div>

        {/* Services Grid */}
        <section className="mb-20">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <ServiceCard key={service.title} {...service} />
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://picsum.photos/seed/services/800/600"
                alt="Mining professionals collaborating"
                className="rounded-lg shadow-lg"
              />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-text-primary mb-6">
                Why Choose Miners Hub?
              </h2>
              <ul className="space-y-4">
                <BenefitItem>
                  <strong>Legal mineral identity:</strong> Connect listings,
                  sites, users, licenses, documents, and review history.
                </BenefitItem>
                <BenefitItem>
                  <strong>Enhanced trust:</strong> Verification, escrow, lab
                  evidence, and mineral passports reduce counterparty
                  uncertainty.
                </BenefitItem>
                <BenefitItem>
                  <strong>Operational efficiency:</strong> Coordinate discovery,
                  due diligence, negotiation, payment, logistics, and delivery
                  evidence.
                </BenefitItem>
                <BenefitItem>
                  <strong>Regulatory visibility:</strong> Support production,
                  compliance, environmental, revenue, and audit reporting
                  workflows.
                </BenefitItem>
                <BenefitItem>
                  <strong>Investment readiness:</strong> Present opportunities
                  with risk, ESG, logistics, and compliance context.
                </BenefitItem>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-secondary rounded-lg shadow-lg p-8 md:p-12 border border-border text-center">
          <h2 className="text-3xl font-extrabold text-text-primary">
            Ready to Operate in a More Trusted Minerals Economy?
          </h2>
          <p className="text-lg text-text-secondary mt-4 max-w-2xl mx-auto">
            Join Miners Hub to formalize mineral activity, trade with
            confidence, and package stronger investment opportunities.
          </p>
          <div className="mt-8">
            <button
              onClick={() => setPage("register")}
              className="bg-accent text-accent-content hover:bg-yellow-400 font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-accent/40"
            >
              Get Started
            </button>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ServicesPage;
