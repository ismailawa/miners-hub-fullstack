import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, UserDocument, VerificationStatus, UserRole } from '../lib/types';
import MultiFileInput, { FilePreview } from './MultiFileInput';

const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});

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
        nin: '',
        businessName: '',
        companyRegNumber: '',
        businessAddress: '',
        businessWebsite: '',
        industry: '',
        yearsInOperation: '',
        miningEquipment: '',
        certifications: '',
        investmentPreferences: [] as string[],
        riskAppetite: null as 'low' | 'medium' | 'high' | null,
    });
    const [documents, setDocuments] = useState<{ [key: string]: FilePreview[] }>({});
    const [fileErrors, setFileErrors] = useState<{ [key: string]: string | null }>({});

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handleCheckboxChange = (value: string) => {
        setFormData(prev => {
            const newPreferences = prev.investmentPreferences.includes(value)
                ? prev.investmentPreferences.filter(item => item !== value)
                : [...prev.investmentPreferences, value];
            return { ...prev, investmentPreferences: newPreferences };
        });
    };

    const handleFilesAdded = (key: string, newFiles: File[]) => {
        setFileErrors(prev => ({ ...prev, [key]: null })); 
        const validFiles: FilePreview[] = [];
        for (const file of newFiles) {
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
    
    const handleSubmit = async () => {
        if (!currentUser) return;
        setIsSubmitting(true);
        try {
            const uploadedDocuments: { [key: string]: UserDocument[] } = {};
            for (const key in documents) {
                uploadedDocuments[key] = await Promise.all(
                    documents[key].map(async (filePreview) => ({
                        name: filePreview.file.name,
                        url: await toBase64(filePreview.file)
                    }))
                );
            }

            const updatedUser: User = {
                ...currentUser,
                ...formData,
                role: formData.role === 'miner' ? UserRole.MINER : formData.role === 'investor' ? UserRole.INVESTOR : null,
                miningEquipment: (formData.miningEquipment || '').split(',').map(s => s.trim()).filter(Boolean),
                certifications: (formData.certifications || '').split(',').map(s => s.trim()).filter(Boolean),
                investmentPreferences: formData.investmentPreferences,
                riskAppetite: formData.riskAppetite,
                onboardingComplete: true,
                status: VerificationStatus.PENDING,
                documents: uploadedDocuments,
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
                                    <div><InputField label="Nationality" name="nationality" value={formData.nationality} onChange={handleInputChange} required placeholder="e.g., Nigerian" /></div>
                                    <div><InputField label="NIN" name="nin" value={formData.nin} onChange={handleInputChange} required placeholder="e.g., 123456789012" /></div>
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
                                    <div><InputField label="Industry / Sector" name="industry" value={formData.industry} onChange={handleInputChange} required placeholder="e.g., Solid Minerals" /></div>
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
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-border pt-4">
                                                {['Gold', 'Lithium', 'Iron Ore', 'Lead/Zinc', 'Gemstones', 'Coal'].map(mineral => (
                                                    <label key={mineral} className="flex flex-col items-center justify-center space-y-2 p-4 bg-secondary border border-border rounded-xl has-[:checked]:bg-accent/10 has-[:checked]:border-accent cursor-pointer transition-colors duration-200 hover:border-accent/50">
                                                        <input type="checkbox" checked={formData.investmentPreferences.includes(mineral)} onChange={() => handleCheckboxChange(mineral)} className="sr-only" />
                                                        <span className="text-sm font-semibold">{mineral}</span>
                                                    </label>
                                                ))}
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
                                <p className="text-lg text-text-secondary mb-10 leading-relaxed">You can add as much information as you want for each client so that AI could start analyzing it.</p>
                                <div className="space-y-6">
                                    {Object.entries(requiredDocs).map(([key, label]) => (
                                        <div key={key} className="bg-secondary p-6 rounded-xl border border-border">
                                            <MultiFileInput
                                                id={key}
                                                label={label}
                                                files={documents[key] || []}
                                                onFilesAdded={(files) => handleFilesAdded(key, files)}
                                                onFileRemoved={(index) => handleFileRemoved(key, index)}
                                                error={fileErrors[key]}
                                            />
                                        </div>
                                    ))}
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
                                        <ReviewItem label="Nationality" value={formData.nationality} />
                                        <ReviewItem label="NIN" value={formData.nin} />
                                    </ReviewSection>

                                    <ReviewSection title="Business Information">
                                        <ReviewItem label="Business Name" value={formData.businessName} />
                                        <ReviewItem label="Business Address" value={formData.businessAddress} />
                                        <ReviewItem label="CAC Number" value={formData.companyRegNumber} />
                                        <ReviewItem label="Website" value={formData.businessWebsite} />
                                        <ReviewItem label="Industry" value={formData.industry} />
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
                                        {Object.keys(requiredDocs).map(key => (
                                            <ReviewItem
                                                key={key}
                                                label={requiredDocs[key as keyof typeof requiredDocs]}
                                                value={
                                                    (documents[key] && documents[key].length > 0)
                                                        ? <ul className="list-disc list-inside">{documents[key].map(f => <li key={f.file.name}>{f.file.name}</li>)}</ul>
                                                        : <span className="text-red-400 font-medium">No files uploaded</span>
                                                }
                                            />
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
