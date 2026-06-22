import React from 'react';

const guideSteps = [
    {
        title: 'Step 1: Understand the Legal Framework',
        content: (
            <>
                <p>All mineral resources in Nigeria are legally vested in the Federal Government (Nigerian Minerals and Mining Act, 2007, Section 1). The primary law governing all mining activities is this Act.</p>
                <ul>
                    <li><strong>Governing Body:</strong> The industry is regulated by the Ministry of Mines and Steel Development.</li>
                    <li><strong>Administrative Agency:</strong> The <strong>Mining Cadastre Office (MCO)</strong> is the sole agency responsible for the administration of all mineral titles (Section 5). All applications are submitted to the MCO.</li>
                </ul>
                <p>Understanding this framework is the first step to ensuring full compliance.</p>
            </>
        ),
    },
    {
        title: 'Step 2: Determine the Required Mineral Title',
        content: (
            <>
                <p>The Act provides different titles for various stages and scales of mining operations (Section 46). You must apply for the one that matches your objective:</p>
                <ul>
                    <li><strong>Reconnaissance Permit:</strong> For broad, non-exclusive searching of minerals. No drilling or excavation allowed.</li>
                    <li><strong>Exploration Licence:</strong> Grants exclusive rights to explore for minerals in a specific area. A prerequisite for a Mining Lease.</li>
                    <li><strong>Small-scale Mining Lease:</strong> For smaller operations, available to individuals, co-operatives, or companies.</li>
                    <li><strong>Mining Lease:</strong> For large-scale commercial exploitation. Only granted to incorporated companies.</li>
                    <li><strong>Quarry Lease:</strong> For extracting construction materials like sand, gravel, limestone, etc.</li>
                    <li><strong>Water Use Permit:</strong> Required for using a water source for mining purposes.</li>
                </ul>
            </>
        ),
    },
    {
        title: 'Step 3: Meet Qualification & Application Criteria',
        content: (
            <>
                <p>Each mineral title has specific qualification requirements (Sections 47-53). For example, while a citizen of Nigeria can apply for a Reconnaissance Permit, a Mining Lease requires an incorporated company.</p>
                <p>Key application requirements submitted to the Mining Cadastre Office include:</p>
                <ul>
                    <li><strong>Proof of Financial Capability:</strong> You must demonstrate sufficient working capital for your proposed operation (Section 54).</li>
                    <li><strong>Technical Competence:</strong> Evidence of technical expertise to carry out the exploration or mining is required (Section 54).</li>
                    <li><strong>First Come, First Served:</strong> The MCO applies this principle strictly for competing applications (Section 8).</li>
                </ul>
            </>
        ),
    },
    {
        title: 'Step 4: Fulfill Pre-Development Obligations',
        content: (
            <>
                <p>After a mineral title is granted, several critical obligations must be met before any development work or extraction can begin:</p>
                <ul>
                    <li><strong>Community Development Agreement (CDA):</strong> You must conclude a CDA with your host community. This agreement outlines social contributions and is mandatory (Section 116).</li>
                    <li><strong>Environmental Impact Assessment (EIA):</strong> An EIA, approved by the Federal Ministry of Environment, is required to assess and mitigate environmental risks (Section 119).</li>
                    <li><strong>Environmental Protection and Rehabilitation Program (EPRP):</strong> A detailed plan for mine closure and land reclamation must be submitted and approved (Section 120).</li>
                    <li><strong>Compensation:</strong> You must have duly notified, compensated, or offered compensation to all users of land within your lease area (Section 71).</li>
                </ul>
                <p>Failure to meet these requirements can lead to the suspension of your mineral title.</p>
            </>
        )
    }
];

const GuideStep: React.FC<{ number: number; title: string; children: React.ReactNode; isLast?: boolean }> = ({ number, title, children, isLast }) => (
    <div className="flex">
        <div className="flex flex-col items-center mr-6">
            <div>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent text-accent-content font-bold text-xl">{number}</div>
            </div>
            {!isLast && <div className="w-px h-full bg-border"></div>}
        </div>
        <div className="bg-secondary rounded-lg border border-border p-6 pb-8 flex-1">
            <h3 className="text-xl font-bold text-text-primary mb-4">{title}</h3>
            <div className="prose prose-invert max-w-none prose-p:text-text-secondary prose-li:text-text-secondary">
                {children}
            </div>
        </div>
    </div>
);


const RegistrationGuidePage: React.FC = () => {
    return (
        <main className="pt-20 pb-12 md:py-20 bg-primary">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 animate-fade-in-down">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary">Mining Company Registration Guide</h1>
                    <p className="text-lg text-text-secondary mt-4 max-w-3xl mx-auto">A step-by-step guide to achieving legal compliance for your mining operations in Nigeria.</p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <div className="space-y-8">
                       {guideSteps.map((step, index) => (
                           <GuideStep
                                key={step.title}
                                number={index + 1}
                                title={step.title}
                                isLast={index === guideSteps.length - 1}
                           >
                                {step.content}
                           </GuideStep>
                       ))}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default RegistrationGuidePage;