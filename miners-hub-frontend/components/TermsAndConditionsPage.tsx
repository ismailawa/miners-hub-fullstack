import React from 'react';

const PolicySection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section className="mb-8">
        <h2 className="text-2xl font-bold text-accent mb-4">{title}</h2>
        <div className="prose prose-invert max-w-none text-text-secondary space-y-4">
            {children}
        </div>
    </section>
);

const TermsAndConditionsPage: React.FC = () => {
    return (
        <main className="pt-20 pb-12 md:py-20 bg-primary">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto bg-secondary p-8 md:p-12 rounded-lg border border-border">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-extrabold text-text-primary">Terms and Conditions</h1>
                        <p className="text-sm text-text-muted mt-2">Last Updated: {new Date().toLocaleDateString()}</p>
                    </div>

                    <PolicySection title="1. Acceptance of Terms">
                        <p>
                            By accessing or using the Miners Hub platform ("Service"), you agree to be bound by these Terms and Conditions ("Terms"). If you disagree with any part of the terms, then you may not access the Service.
                        </p>
                    </PolicySection>

                    <PolicySection title="2. User Accounts and Registration">
                        <p>
                            You must be at least 18 years old to create an account. You are responsible for safeguarding your account information, including your password, and for any activities or actions under your account. You agree to provide accurate, current, and complete information during the registration and verification process.
                        </p>
                    </PolicySection>

                    <PolicySection title="3. Marketplace and Transactions">
                        <p>
                            Miners Hub provides a platform for miners and investors to connect. We are not a party to any transaction between users. We do not buy or sell minerals directly. We provide services such as user verification and secure payment escrow to facilitate trust, but we do not guarantee the quality, safety, or legality of any mineral listings.
                        </p>
                    </PolicySection>

                    <PolicySection title="4. User Conduct">
                        <p>You agree not to use the Service to:</p>
                        <ul>
                            <li>Post false, inaccurate, misleading, defamatory, or libelous content.</li>
                            <li>Violate any laws, third-party rights, or our policies.</li>
                            <li>Distribute viruses or any other technologies that may harm Miners Hub or the interests or property of users.</li>
                            <li>Attempt to gain unauthorized access to our systems or engage in any activity that disrupts, diminishes the quality of, interferes with the performance of, or impairs the functionality of the Service.</li>
                        </ul>
                    </PolicySection>
                    
                    <PolicySection title="5. Intellectual Property">
                         <p>
                            The Service and its original content, features, and functionality are and will remain the exclusive property of Miners Hub and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.
                        </p>
                    </PolicySection>
                    
                     <PolicySection title="6. Disclaimers and Limitation of Liability">
                        <p>
                            The Service is provided on an "AS IS" and "AS AVAILABLE" basis. Miners Hub makes no warranties, expressed or implied, and hereby disclaims all other warranties. In no event shall Miners Hub be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the platform.
                        </p>
                    </PolicySection>

                    <PolicySection title="7. Governing Law">
                        <p>
                            These Terms shall be governed and construed in accordance with the laws of the Federal Republic of Nigeria, without regard to its conflict of law provisions.
                        </p>
                    </PolicySection>

                     <PolicySection title="8. Changes to Terms">
                        <p>
                           We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide at least 30 days' notice prior to any new terms taking effect. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
                        </p>
                    </PolicySection>

                    <PolicySection title="9. Contact Information">
                        <p>
                            If you have any questions about these Terms, please contact us at <a href="mailto:legal@minershub.com" className="text-accent hover:underline">legal@minershub.com</a>.
                        </p>
                    </PolicySection>
                </div>
            </div>
        </main>
    );
};

export default TermsAndConditionsPage;
