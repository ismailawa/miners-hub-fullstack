import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, VerificationStatus, UserRole } from '../lib/types';
import MultiFileInput, { FilePreview } from './MultiFileInput';
import { uploadDocument } from '../lib/api/documents';

type StepConfig = {
    title: string;
    description: string;
};

const STEPS: StepConfig[] = [
    { title: 'Role Selection', description: 'Tell us who you are' },
    { title: 'Personal information', description: 'Your basic details and identity' },
    { title: 'Business details', description: 'Company name and registration' },
    { title: 'Role specifics', description: 'Mining equipment or investment preferences' },
    { title: 'Upload documents', description: 'Attach required verification files' },
    { title: 'Review application', description: 'Review and submit your profile' },
];

const NATIONALITY_OPTIONS = [
    'Nigerian',
    'Ghanaian',
    'Kenyan',
    'South African',
    'Rwandan',
    'Tanzanian',
    'Ugandan',
    'Cameroonian',
    'Ivorian',
    'Senegalese',
    'Egyptian',
    'Moroccan',
    'United States',
    'United Kingdom',
    'Canadian',
    'Chinese',
    'Indian',
    'Other',
];

const IDENTIFICATION_TYPES = [
    'National Identification Number (NIN)',
    'International Passport',
    'Driver License',
    'Voter Card',
    'Residence Permit',
    'Tax Identification Number',
    'Other',
];

const INDUSTRY_OPTIONS = [
    'Mining',
    'Mineral Trading',
    'Mineral Processing',
    'Exploration',
    'Quarrying',
    'Logistics',
    'Equipment Leasing',
    'Investment',
    'Government / Regulatory',
    'Other',
];

const INVESTMENT_OPTIONS = [
    'Gold',
    'Lithium',
    'Iron Ore',
    'Lead/Zinc',
    'Gemstones',
    'Coal',
    'Tin',
    'Columbite',
    'Tantalite',
    'Limestone',
    'Barite',
    'Bitumen',
    'Granite',
    'Gypsum',
    'Kaolin',
    'Manganese',
    'Nickel',
    'Copper',
    'Bauxite',
    'Silica Sand',
    'Rare Earth Elements',
];

const CheckIcon = () => (
    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const ProgressBar: React.FC<{ currentStep: number; steps: StepConfig[], isVertical?: boolean }> = ({ currentStep, steps, isVertical = false }) => (
    <nav aria-label="Progress" className="w-full">
        <ol role="list" className={`space-y-6 ${!isVertical ? 'flex space-y-0 space-x-8 overflow-x-auto no-scrollbar pb-2' : 'flex flex-col'}`}>
            {steps.map((step, index) => {
                const isCompleted = index < currentStep;
                const isActive = index === currentStep;

                return (
                    <li key={step.title} className={!isVertical ? 'flex-shrink-0' : 'relative'}>
                        <div className={`group flex ${isVertical ? 'flex-row items-start' : 'flex-col items-center'} transition-colors duration-300`}>
                            {/* Icon Container */}
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${isVertical ? 'mr-4 mt-0.5' : 'mb-3'} transition-all duration-300 ${
                                isCompleted ? 'bg-green-500 text-white' :
                                isActive ? 'bg-accent shadow-[0_0_0_4px_rgba(217,119,6,0.2)]' :
                                'bg-gray-200 dark:bg-gray-700'
                            }`}>
                                {isCompleted ? (
                                    <CheckIcon />
                                ) : isActive ? (
                                    <div className="w-3 h-3 bg-white rounded-full"></div>
                                ) : (
                                    <div className="w-3 h-3 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                                )}
                            </div>
                            
                            {/* Text Container */}
                            <div className="flex flex-col">
                                <span className={`text-sm font-bold transition-colors duration-300 ${isActive ? 'text-text-primary' : isCompleted ? 'text-text-secondary' : 'text-text-muted'}`}>
                                    {step.title}
                                </span>
                                <span className={`text-xs mt-1 transition-colors duration-300 ${isActive ? 'text-text-secondary' : 'text-text-muted'}`}>
                                    {step.description}
                                </span>
                            </div>
                        </div>
                    </li>
                );
            })}
        </ol>
    </nav>
);

const ReviewSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-secondary border border-border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-text-primary border-b border-border pb-3 mb-4">{title}</h3>
        <dl className="space-y-4">{children}</dl>
    </div>
);

const ReviewItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <dt className="text-sm font-medium text-text-muted sm:w-1/3">{label}</dt>
        <dd className="text-sm font-semibold text-text-primary mt-1 sm:mt-0 sm:w-2/3 text-right break-words">{value || '-'}</dd>
    </div>
);

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-semibold text-text-secondary mb-1.5">{label}</label>
        <input 
            {...props} 
            className={`w-full bg-primary p-3.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all ${props.className || ''}`} 
        />
    </div>
);

const SelectField: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; options: string[] }> = ({ label, options, ...props }) => (
    <div>
        <label className="block text-sm font-semibold text-text-secondary mb-1.5">{label}</label>
        <select
            {...props}
            className={`w-full bg-primary p-3.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all ${props.className || ''}`}
        >
            <option value="">Select an option</option>
            {options.map(option => (
                <option key={option} value={option}>{option}</option>
            ))}
        </select>
    </div>
);

const SearchableSelect: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; options: string[] }> = ({ label, options, id, ...props }) => {
    const listId = `${id || props.name}-options`;

    return (
        <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1.5">{label}</label>
            <input
                {...props}
                id={id}
                list={listId}
                className={`w-full bg-primary p-3.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all ${props.className || ''}`}
            />
            <datalist id={listId}>
                {options.map(option => (
                    <option key={option} value={option} />
                ))}
            </datalist>
        </div>
    );
};

const getFileTypeLabel = (file: File) => {
    if (file.type === 'application/pdf') return 'PDF';
    if (file.type.startsWith('image/')) return file.type.replace('image/', '').toUpperCase();
    return 'FILE';
};

export const OnboardingPage: React.FC = () => {
    const { currentUser, updateUser, setPage } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        role: null as 'miner' | 'investor' | null,
        name: currentUser?.name || '',
        phoneNumber: '',
        address: '',
        dateOfBirth: '',
        nationality: '',
        otherNationality: '',
        identificationType: 'National Identification Number (NIN)',
        otherIdentificationType: '',
        identificationNumber: '',
        nin: '',
        businessName: '',
        companyRegNumber: '',
        businessAddress: '',
        businessWebsite: '',
        industry: '',
        otherIndustry: '',
        yearsInOperation: '',
        miningEquipment: '',
        certifications: '',
        investmentPreferences: [] as string[],
        riskAppetite: null as 'low' | 'medium' | 'high' | null,
    });
    const [documents, setDocuments] = useState<{ [key: string]: FilePreview[] }>({});
    const [fileErrors, setFileErrors] = useState<{ [key: string]: string | null }>({});
    const [additionalDocs, setAdditionalDocs] = useState<Array<{ key: string; label: string }>>([]);
    const [additionalDocName, setAdditionalDocName] = useState('');

    useEffect(() => {
      if(currentUser && !formData.name) {
        setFormData(prev => ({ ...prev, name: currentUser.name }));
      }
    }, [currentUser, formData.name]);

    useEffect(() => {
        return () => {
            Object.values(documents).flat().forEach((filePreview: FilePreview) => {
                URL.revokeObjectURL(filePreview.previewUrl);
            });
        };
    }, [documents]);

    const handleNext = () => {
        const form = document.querySelector<HTMLFormElement>('#onboarding-step-form');
        if (form && form.reportValidity()) {
            document.getElementById('main-scroll-area')?.scrollTo({ top: 0, behavior: 'smooth' });
            setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
        }
    };
    
    const handleBack = () => {
        document.getElementById('main-scroll-area')?.scrollTo({ top: 0, behavior: 'smooth' });
        setCurrentStep(prev => Math.max(prev - 1, 0));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handleInvestmentPreferenceAdd = (value: string) => {
        if (!value) return;
        setFormData(prev => prev.investmentPreferences.includes(value)
            ? prev
            : { ...prev, investmentPreferences: [...prev.investmentPreferences, value] }
        );
    };

    const handleInvestmentPreferenceRemove = (value: string) => {
        setFormData(prev => ({
            ...prev,
            investmentPreferences: prev.investmentPreferences.filter(item => item !== value),
        }));
    };

    const handleFilesAdded = (key: string, newFiles: File[]) => {
        setFileErrors(prev => ({ ...prev, [key]: null })); 
        const validFiles: FilePreview[] = [];
        const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf'];
        for (const file of newFiles) {
            if (!allowedTypes.includes(file.type)) {
                setFileErrors(prev => ({ ...prev, [key]: `File "${file.name}" must be a PNG, JPG, or PDF.` }));
                continue;
            }
            if (file.size > 10 * 1024 * 1024) { 
                setFileErrors(prev => ({ ...prev, [key]: `File "${file.name}" exceeds 10MB limit.` }));
                continue; 
            }
            validFiles.push({ file, previewUrl: URL.createObjectURL(file) });
        }
        setDocuments(prev => ({
            ...prev,
            [key]: [...(prev[key] || []), ...validFiles],
        }));
    };

    const handleFileRemoved = (key: string, index: number) => {
        const fileList = documents[key];
        const fileToRemove = fileList?.[index];
        if (fileList && fileToRemove) {
            URL.revokeObjectURL(fileToRemove.previewUrl);
            const updatedFiles = fileList.filter((_, i) => i !== index);
            setDocuments(prev => ({ ...prev, [key]: updatedFiles }));
        }
    };

    const handleAddAdditionalDoc = () => {
        const label = additionalDocName.trim();
        if (!label) return;

        const key = `additional:${label}`;
        setAdditionalDocs(prev => prev.some(doc => doc.key === key) ? prev : [...prev, { key, label }]);
        setAdditionalDocName('');
    };

    const handleRemoveAdditionalDoc = (key: string) => {
        documents[key]?.forEach(filePreview => URL.revokeObjectURL(filePreview.previewUrl));
        setAdditionalDocs(prev => prev.filter(doc => doc.key !== key));
        setDocuments(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
        setFileErrors(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    };
    
    const handleSubmit = async () => {
        if (!currentUser) return;
        setIsSubmitting(true);
        try {
            for (const key in documents) {
                await Promise.all(
                    documents[key].map(filePreview => uploadDocument(filePreview.file, { type: 'kyc' as any, uploadCategory: key }))
                );
            }

            const resolvedNationality = formData.nationality === 'Other' ? formData.otherNationality : formData.nationality;
            const resolvedIdentificationType = formData.identificationType === 'Other' ? formData.otherIdentificationType : formData.identificationType;
            const resolvedIndustry = formData.industry === 'Other' ? formData.otherIndustry : formData.industry;

            const updatedUser: User = {
                ...currentUser,
                ...formData,
                role: formData.role === 'miner' ? UserRole.MINER : formData.role === 'investor' ? UserRole.INVESTOR : null,
                nationality: resolvedNationality,
                nin: resolvedIdentificationType && formData.identificationNumber
                    ? `${resolvedIdentificationType}: ${formData.identificationNumber}`
                    : formData.identificationNumber,
                industry: resolvedIndustry,
                miningEquipment: (formData.miningEquipment || '').split(',').map(s => s.trim()).filter(Boolean),
                certifications: (formData.certifications || '').split(',').map(s => s.trim()).filter(Boolean),
                investmentPreferences: formData.investmentPreferences,
                riskAppetite: formData.riskAppetite,
                onboardingComplete: true,
                status: VerificationStatus.PENDING,
            };
            await updateUser(updatedUser);
            setPage('profile', { initialTab: 'overview' });
        } catch (error) {
            console.error("Onboarding submission failed", error);
            alert("Failed to save your onboarding data. The documents might be too large.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const minerDocs = { 
      'id': 'Government-issued ID (NIN Card, Passport)', 
      'cac': 'CAC Certificate', 
      'miningLease': 'Mineral Title / Mining Lease',
      'eia': 'Environmental Impact Assessment (EIA) Approval',
      'cda': 'Community Development Agreement (CDA)',
      'otherPermits': 'Other Relevant Permits & Certifications',
    };
    
    const investorDocs = { 
      'id': 'Government-issued ID (NIN Card, Passport)',
      'cac': 'CAC Certificate', 
      'proofOfFunds': 'Proof of Funds',
      'accreditation': 'Investor Accreditation (if applicable)',
    };
    
    const requiredDocs = formData.role === 'miner' ? minerDocs : investorDocs;
    const documentEntries = [
        ...Object.entries(requiredDocs),
        ...additionalDocs.map(doc => [doc.key, doc.label] as [string, string]),
    ];
    const resolvedNationality = formData.nationality === 'Other' ? formData.otherNationality : formData.nationality;
    const resolvedIdentificationType = formData.identificationType === 'Other' ? formData.otherIdentificationType : formData.identificationType;
    const resolvedIndustry = formData.industry === 'Other' ? formData.otherIndustry : formData.industry;

    return (
        <main className="h-screen overflow-hidden flex flex-col md:flex-row bg-primary text-text-primary font-sans">
            {/* Split Screen Layout */}
            <div className="flex-1 flex flex-col md:flex-row w-full">
                
                {/* Desktop Sidebar Tracker */}
                <aside className="hidden md:flex md:w-1/3 lg:w-[400px] flex-col bg-secondary border-r border-border p-10 lg:p-14 relative">
                    <div className="z-10 flex-1">
                        <div className="flex items-center mb-10">
                            {/* Logo Placeholder - Matches image logo placement */}
                            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-white font-bold text-xl mr-3">
                                M
                            </div>
                        </div>
                        <p className="text-sm font-medium text-text-secondary mb-12">Complete following steps to setup your profile</p>
                        <ProgressBar currentStep={currentStep} steps={STEPS} isVertical={true} />
                    </div>
                </aside>

                {/* Mobile Top Tracker */}
                <div className="md:hidden bg-secondary border-b border-border p-6 sticky top-0 z-20">
                    <ProgressBar currentStep={currentStep} steps={STEPS} isVertical={false} />
                </div>

                {/* Main Content Area */}
                <div id="main-scroll-area" className="flex-1 flex flex-col p-6 md:p-12 lg:p-20 overflow-y-auto bg-primary">
                    <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col">
                        
                        <div className="mb-8">
                            <span className="text-accent font-bold text-sm tracking-wide mb-3 block">Step {currentStep + 1} of {STEPS.length}</span>
                        </div>

                        <form id="onboarding-step-form" onSubmit={(e) => e.preventDefault()} className="flex-1">
                            {/* Step 0: Role Selection */}
                            {currentStep === 0 && (
                            <div className="step-container">
                                <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Tell us who you are</h1>
                                <p className="text-lg text-text-secondary mb-10 leading-relaxed">Select the role that best describes your primary objective on Miners Hub.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                     <button type="button" onClick={() => setFormData({ ...formData, role: 'miner' })} className={`text-left p-8 rounded-2xl border-2 transition-all duration-300 transform ${formData.role === 'miner' ? 'border-accent bg-accent/5 ring-4 ring-accent/10' : 'border-border bg-secondary hover:border-accent/40'}`}>
                                        <div className="text-5xl mb-6">⛏️</div>
                                        <h2 className="text-xl font-bold mb-2">I am a Miner</h2>
                                        <p className="text-sm text-text-muted leading-relaxed">I want to list my mining projects, manage contracts, and connect with verified investors.</p>
                                    </button>
                                    <button type="button" onClick={() => setFormData({ ...formData, role: 'investor' })} className={`text-left p-8 rounded-2xl border-2 transition-all duration-300 transform ${formData.role === 'investor' ? 'border-accent bg-accent/5 ring-4 ring-accent/10' : 'border-border bg-secondary hover:border-accent/40'}`}>
                                        <div className="text-5xl mb-6">💰</div>
                                        <h2 className="text-xl font-bold mb-2">I am an Investor</h2>
                                        <p className="text-sm text-text-muted leading-relaxed">I want to discover, evaluate, and invest securely in verified mining operations.</p>
                                    </button>
                                </div>
                            </div>
                            )}

                            {/* Step 1: Personal Info */}
                            {currentStep === 1 && (
                            <div className="step-container">
                                <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Personal information</h1>
                                <p className="text-lg text-text-secondary mb-10 leading-relaxed">Please provide your basic details to verify your identity on the platform.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="sm:col-span-2"><InputField label="Full Name" name="name" value={formData.name} onChange={handleInputChange} required placeholder="e.g., John Doe" /></div>
                                    <div><InputField label="Phone Number" type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required placeholder="e.g., 08012345678" /></div>
                                    <div><InputField label="Date of Birth" type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} required /></div>
                                    <div className="sm:col-span-2"><InputField label="Home Address" name="address" value={formData.address} onChange={handleInputChange} required placeholder="e.g., 123 Main Street, Lagos" /></div>
                                    <div>
                                        <SearchableSelect
                                            label="Nationality"
                                            id="nationality"
                                            name="nationality"
                                            value={formData.nationality}
                                            onChange={handleInputChange}
                                            options={NATIONALITY_OPTIONS}
                                            required
                                            placeholder="Search or select nationality"
                                        />
                                    </div>
                                    {formData.nationality === 'Other' && (
                                        <div>
                                            <InputField label="Specify Nationality" name="otherNationality" value={formData.otherNationality} onChange={handleInputChange} required placeholder="Enter nationality" />
                                        </div>
                                    )}
                                    <div>
                                        <SelectField
                                            label="Means of Identification"
                                            name="identificationType"
                                            value={formData.identificationType}
                                            onChange={handleInputChange}
                                            options={IDENTIFICATION_TYPES}
                                            required
                                        />
                                    </div>
                                    {formData.identificationType === 'Other' && (
                                        <div>
                                            <InputField label="Specify Identification Type" name="otherIdentificationType" value={formData.otherIdentificationType} onChange={handleInputChange} required placeholder="e.g., Work permit" />
                                        </div>
                                    )}
                                    <div className={formData.identificationType === 'Other' ? 'sm:col-span-2' : ''}>
                                        <InputField label={`${resolvedIdentificationType || 'Identification'} Number`} name="identificationNumber" value={formData.identificationNumber} onChange={handleInputChange} required placeholder="Enter ID number" />
                                    </div>
                                </div>
                            </div>
                            )}

                            {/* Step 2: Business Info */}
                            {currentStep === 2 && (
                            <div className="step-container">
                                <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Business details</h1>
                                <p className="text-lg text-text-secondary mb-10 leading-relaxed">Add information about your company and its registration status.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="sm:col-span-2"><InputField label="Business Name" name="businessName" value={formData.businessName} onChange={handleInputChange} required placeholder="e.g., Acme Mining Corp" /></div>
                                    <div className="sm:col-span-2"><InputField label="Business Address" name="businessAddress" value={formData.businessAddress} onChange={handleInputChange} required placeholder="e.g., 456 Business Avenue, Abuja" /></div>
                                    <div><InputField label="Company Registration Number" name="companyRegNumber" value={formData.companyRegNumber} onChange={handleInputChange} required placeholder="e.g., RC 123456" /></div>
                                    <div><InputField label="Company Website (Optional)" type="url" name="businessWebsite" value={formData.businessWebsite} onChange={handleInputChange} placeholder="https://example.com" /></div>
                                    <div>
                                        <SelectField
                                            label="Industry / Sector"
                                            name="industry"
                                            value={formData.industry}
                                            onChange={handleInputChange}
                                            options={INDUSTRY_OPTIONS}
                                            required
                                        />
                                    </div>
                                    {formData.industry === 'Other' && (
                                        <div>
                                            <InputField label="Specify Industry / Sector" name="otherIndustry" value={formData.otherIndustry} onChange={handleInputChange} required placeholder="Enter industry or sector" />
                                        </div>
                                    )}
                                    <div><InputField label="Years in Operation" type="number" name="yearsInOperation" value={formData.yearsInOperation} onChange={handleInputChange} required placeholder="e.g., 5" /></div>
                                </div>
                            </div>
                            )}

                            {/* Step 3: Role Specifics */}
                            {currentStep === 3 && (
                            <div className="step-container">
                                <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Role specifics</h1>
                                <p className="text-lg text-text-secondary mb-10 leading-relaxed">Tell us more about your {formData.role === 'miner' ? 'mining capabilities' : 'investment goals'}.</p>
                                
                                {formData.role === 'miner' ? (
                                    <div className="space-y-6">
                                        <InputField label="Key Mining Equipment (comma-separated)" name="miningEquipment" value={formData.miningEquipment} onChange={handleInputChange} placeholder="e.g., Excavator, Drill Rig, Crusher" />
                                        <InputField label="Certifications & Licenses (comma-separated)" name="certifications" value={formData.certifications} onChange={handleInputChange} placeholder="e.g., Mining Lease No., ESG Certified" />
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        <div>
                                            <h3 className="text-sm font-semibold text-text-secondary mb-3">Investment Preferences</h3>
                                            <div className="border-t border-border pt-4">
                                                <select
                                                    aria-label="Add investment preference"
                                                    value=""
                                                    onChange={(e) => handleInvestmentPreferenceAdd(e.target.value)}
                                                    className="w-full bg-primary p-3.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                                                >
                                                    <option value="">Select minerals or sectors to add</option>
                                                    {INVESTMENT_OPTIONS.filter(option => !formData.investmentPreferences.includes(option)).map(option => (
                                                        <option key={option} value={option}>{option}</option>
                                                    ))}
                                                </select>

                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {formData.investmentPreferences.length > 0 ? (
                                                        formData.investmentPreferences.map(preference => (
                                                            <span key={preference} className="inline-flex max-w-full items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-2 text-sm font-semibold text-text-primary">
                                                                <span className="truncate">{preference}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleInvestmentPreferenceRemove(preference)}
                                                                    className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-text-muted hover:bg-red-500/10 hover:text-red-400"
                                                                    aria-label={`Remove ${preference}`}
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 18 12-12M6 6l12 12" />
                                                                    </svg>
                                                                </button>
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <p className="text-sm text-text-muted">No investment preferences selected yet.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-text-secondary mb-3">Risk Appetite</h3>
                                            <div className="flex flex-wrap gap-4 border-t border-border pt-4">
                                                {(['low', 'medium', 'high'] as const).map(level => (
                                                    <button key={level} type="button" onClick={() => setFormData(prev => ({ ...prev, riskAppetite: level }))} className={`px-8 py-3 rounded-full text-sm font-bold capitalize transition-all duration-300 transform hover:scale-[1.02] ${formData.riskAppetite === level ? 'bg-accent text-accent-content shadow-md' : 'bg-secondary border border-border hover:border-accent/50 text-text-secondary'}`}>
                                                        {level} Risk
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            )}

                            {/* Step 4: Documents */}
                            {currentStep === 4 && (
                            <div className="step-container">
                                <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Upload documents</h1>
                                <p className="text-lg text-text-secondary mb-10 leading-relaxed">Drag each verification file into its dropzone, or click a dropzone to choose files from your device.</p>
                                <div className="space-y-6">
                                    {documentEntries.map(([key, label]) => (
                                        <div key={key} className="bg-secondary p-6 rounded-xl border border-border">
                                            {key.startsWith('additional:') && (
                                                <div className="mb-4 flex justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveAdditionalDoc(key)}
                                                        className="text-sm font-semibold text-red-400 hover:text-red-300"
                                                    >
                                                        Remove document type
                                                    </button>
                                                </div>
                                            )}
                                            <MultiFileInput
                                                id={key}
                                                label={label}
                                                files={documents[key] || []}
                                                onFilesAdded={(files) => handleFilesAdded(key, files)}
                                                onFileRemoved={(index) => handleFileRemoved(key, index)}
                                                error={fileErrors[key]}
                                                accept="image/png,image/jpeg,application/pdf"
                                                helperText="Upload a clear PNG, JPG, or PDF. Maximum file size is 10MB."
                                            />
                                        </div>
                                    ))}
                                    <div className="bg-secondary p-6 rounded-xl border border-border">
                                        <label className="block text-sm font-semibold text-text-secondary mb-1.5">Additional document type</label>
                                        <div className="flex flex-col gap-3 sm:flex-row">
                                            <input
                                                value={additionalDocName}
                                                onChange={(e) => setAdditionalDocName(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleAddAdditionalDoc();
                                                    }
                                                }}
                                                className="w-full bg-primary p-3.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                                                placeholder="e.g., Tax clearance certificate"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddAdditionalDoc}
                                                disabled={!additionalDocName.trim()}
                                                className="whitespace-nowrap rounded-lg bg-accent px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Add document
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            )}

                            {/* Step 5: Review */}
                            {currentStep === 5 && (
                            <div className="step-container">
                                <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Review application</h1>
                                <p className="text-lg text-text-secondary mb-10 leading-relaxed">Ensure all information is correct before launching your workspace.</p>
                                <div className="space-y-6">
                                    <ReviewSection title="Personal Information">
                                        <ReviewItem label="Role" value={<span className="capitalize font-bold text-accent">{formData.role}</span>} />
                                        <ReviewItem label="Full Name" value={formData.name} />
                                        <ReviewItem label="Phone Number" value={formData.phoneNumber} />
                                        <ReviewItem label="Date of Birth" value={formData.dateOfBirth} />
                                        <ReviewItem label="Address" value={formData.address} />
                                        <ReviewItem label="Nationality" value={resolvedNationality} />
                                        <ReviewItem label="Identification Type" value={resolvedIdentificationType} />
                                        <ReviewItem label="Identification Number" value={formData.identificationNumber} />
                                    </ReviewSection>

                                    <ReviewSection title="Business Information">
                                        <ReviewItem label="Business Name" value={formData.businessName} />
                                        <ReviewItem label="Business Address" value={formData.businessAddress} />
                                        <ReviewItem label="CAC Number" value={formData.companyRegNumber} />
                                        <ReviewItem label="Website" value={formData.businessWebsite} />
                                        <ReviewItem label="Industry" value={resolvedIndustry} />
                                        <ReviewItem label="Years in Operation" value={formData.yearsInOperation} />
                                    </ReviewSection>

                                    <ReviewSection title="Role-Specific Information">
                                        {formData.role === 'miner' ? (
                                            <>
                                                <ReviewItem label="Mining Equipment" value={formData.miningEquipment} />
                                                <ReviewItem label="Certifications" value={formData.certifications} />
                                            </>
                                        ) : (
                                            <>
                                                <ReviewItem label="Investment Preferences" value={formData.investmentPreferences.join(', ')} />
                                                <ReviewItem label="Risk Appetite" value={<span className="capitalize">{formData.riskAppetite}</span>} />
                                            </>
                                        )}
                                    </ReviewSection>

                                    <ReviewSection title="Uploaded Documents">
                                        {documentEntries.map(([key, label]) => (
                                            <div key={key} className="flex flex-col gap-3 border-b border-border/70 pb-4 last:border-b-0 last:pb-0">
                                                <dt className="text-sm font-medium text-text-muted">{label}</dt>
                                                <dd>
                                                    {(documents[key] && documents[key].length > 0)
                                                        ? (
                                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                                {documents[key].map((filePreview, index) => (
                                                                    <div key={`${filePreview.file.name}-${index}`} className="flex min-w-0 items-center gap-3 rounded-lg border border-border bg-primary p-3">
                                                                        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md border border-border bg-secondary">
                                                                            {filePreview.file.type.startsWith('image/') ? (
                                                                                <img src={filePreview.previewUrl} alt={filePreview.file.name} className="h-full w-full object-cover" />
                                                                            ) : (
                                                                                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-text-muted">
                                                                                    {getFileTypeLabel(filePreview.file)}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <p className="truncate text-sm font-semibold text-text-primary" title={filePreview.file.name}>{filePreview.file.name}</p>
                                                                            <p className="mt-1 text-xs text-text-muted">{getFileTypeLabel(filePreview.file)}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )
                                                        : <span className="text-sm font-medium text-red-400">No files uploaded</span>
                                                    }
                                                </dd>
                                            </div>
                                        ))}
                                    </ReviewSection>
                                </div>
                            </div>
                            )}
                        </form>

                        {/* Navigation Buttons */}
                        <div className="mt-12 pt-6 flex justify-between items-center w-full">
                            <button
                                onClick={handleBack}
                                disabled={currentStep === 0 || isSubmitting}
                                className={`flex items-center text-sm font-bold text-text-secondary hover:text-text-primary transition-colors ${currentStep === 0 ? 'invisible' : ''}`}
                            >
                                <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                                Back
                            </button>
                            
                            <div className="flex space-x-4">
                                {currentStep < STEPS.length - 1 ? (
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        disabled={(!formData.role && currentStep === 0)}
                                        className="px-8 py-3 text-sm font-bold text-white bg-accent rounded-full hover:bg-yellow-500 shadow-lg shadow-accent/20 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                                    >
                                        Continue
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="px-8 py-3 text-sm font-bold text-white bg-green-500 rounded-full hover:bg-green-600 shadow-lg shadow-green-500/20 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};
