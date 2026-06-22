import React, { useState } from 'react';

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setMessage('Please enter a valid email address.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      const subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]');
      if (!subscribers.includes(email)) {
        subscribers.push(email);
        localStorage.setItem('newsletter_subscribers', JSON.stringify(subscribers));
        setMessage('Thank you for subscribing!');
      } else {
        setMessage('This email is already subscribed.');
      }
    } catch (error) {
      console.error('Could not save email to localStorage', error);
      setMessage('Subscription failed. Please try again.');
    }
    
    setEmail('');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <section id="newsletter" className="py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="bg-secondary rounded-lg shadow-lg p-8 md:p-12 border border-border grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary">Stay Connected</h2>
            <p className="text-lg text-text-secondary mt-4">
              Subscribe to our newsletter to receive the latest market analysis, platform updates, and exclusive event invitations directly to your inbox.
            </p>
          </div>
          <div>
            <form onSubmit={handleSubscribe}>
              <label htmlFor="newsletter-email" className="sr-only">Email address</label>
              <div className="flex flex-col sm:flex-row">
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-primary text-text-primary placeholder-text-muted border border-border rounded-md sm:rounded-r-none py-3 px-4 focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                  aria-label="Email for newsletter"
                />
                <button
                  type="submit"
                  className="bg-accent text-accent-content hover:bg-yellow-400 font-semibold px-6 py-3 rounded-md sm:rounded-l-none mt-2 sm:mt-0 transition-colors duration-300"
                >
                  Subscribe
                </button>
              </div>
              {message && <p className="text-sm mt-3 text-accent">{message}</p>}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;