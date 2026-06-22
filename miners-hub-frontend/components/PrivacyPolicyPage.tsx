import React from 'react';

const PolicySection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section className="mb-8">
        <h2 className="text-2xl font-bold text-accent mb-4">{title}</h2>
        <div className="prose prose-invert max-w-none text-text-secondary space-y-4">
            {children}
        </div>
    </section>
);

const PrivacyPolicyPage: React.FC = () => {
    return (
        <main className="pt-20 pb-12 md:py-20 bg-primary">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto bg-secondary p-8 md:p-12 rounded-lg border border-border">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-extrabold text-text-primary">Privacy Policy</h1>
                        <p className="text-sm text-text-muted mt-2">Last Updated: {new Date().toLocaleDateString()}</p>
                    </div>

                    <PolicySection title="1. Introduction">
                        <p>
                            Welcome to Miners Hub ("we," "our," or "us"). We are committed to protecting your privacy and handling your personal data in an open and transparent manner. This Privacy Policy explains how we collect, use, process, and disclose your information in conjunction with your access to and use of the Miners Hub platform and services.
                        </p>
                    </PolicySection>

                    <PolicySection title="2. Information We Collect">
                        <p>We collect information you provide directly to us, information we collect automatically when you use our services, and information we collect from other sources.</p>
                        <h3 className="text-lg font-semibold text-text-primary">2.1 Information You Provide to Us</h3>
                        <ul>
                            <li><strong>Account Information:</strong> When you register for an account, we collect information such as your name, email address, phone number, and password.</li>
                            <li><strong>Profile and Verification Information:</strong> To use certain features, we may ask for additional information, which may include your business details, government-issued ID, financial information, and documents related to your mining or investment activities.</li>
                            <li><strong>Communications:</strong> When you communicate with us or use the platform to communicate with other users, we collect information about your communication and any information you choose to provide.</li>
                        </ul>
                        <h3 className="text-lg font-semibold text-text-primary">2.2 Information We Automatically Collect</h3>
                        <ul>
                            <li><strong>Usage Information:</strong> We collect information about your interactions with the platform, such as the pages you view, your searches for listings, and other actions.</li>
                            <li><strong>Log Data and Device Information:</strong> We automatically collect log data and device information when you access and use the platform, even if you have not created an account. This information includes, among other things: details about how you’ve used the platform, IP address, access dates and times, hardware and software information.</li>
                        </ul>
                    </PolicySection>

                    <PolicySection title="3. How We Use Your Information">
                        <p>We use the information we collect for various purposes, including to:</p>
                        <ul>
                            <li>Provide, improve, and develop the platform.</li>
                            <li>Enable you to access and use the platform for trading, communication, and networking.</li>
                            <li>Verify or authenticate information or identifications provided by you.</li>
                            <li>Send you service or support messages, updates, security alerts, and account notifications.</li>
                            <li>Comply with our legal obligations and enforce our Terms of Service.</li>
                        </ul>
                    </PolicySection>

                    <PolicySection title="4. Information Sharing and Disclosure">
                        <p>We may share your information with other parties in the following circumstances:</p>
                        <ul>
                            <li><strong>With Other Users:</strong> To facilitate transactions and interactions on the platform, we may need to share certain information, such as your profile, business details, and listings, with other users.</li>
                            <li><strong>Compliance with Law:</strong> We may disclose your information to courts, law enforcement, or government authorities if we are required or permitted to do so by law.</li>
                            <li><strong>Business Transfers:</strong> If we undertake or are involved in any merger, acquisition, reorganization, sale of assets, or bankruptcy, we may sell, transfer or share some or all of our assets, including your information.</li>
                        </ul>
                    </PolicySection>
                    
                    <PolicySection title="5. Data Security">
                         <p>
                            We are continuously implementing and updating administrative, technical, and physical security measures to help protect your information against unauthorized access, loss, destruction, or alteration.
                        </p>
                    </PolicySection>
                    
                     <PolicySection title="6. Your Rights">
                        <p>
                            You have the right to access, update, and delete your personal information through your account settings. You may also have certain rights under applicable data protection law, including the right to object to or restrict our processing of your personal data.
                        </p>
                    </PolicySection>

                    <PolicySection title="7. Changes to This Privacy Policy">
                        <p>
                            We reserve the right to modify this Privacy Policy at any time. If we make material changes to this policy, we will notify you through the platform or by sending you an email.
                        </p>
                    </PolicySection>

                    <PolicySection title="8. Contact Us">
                        <p>
                            If you have any questions or complaints about this Privacy Policy or our information handling practices, you may email us at <a href="mailto:privacy@minershub.com" className="text-accent hover:underline">privacy@minershub.com</a>.
                        </p>
                    </PolicySection>
                </div>
            </div>
        </main>
    );
};

export default PrivacyPolicyPage;
