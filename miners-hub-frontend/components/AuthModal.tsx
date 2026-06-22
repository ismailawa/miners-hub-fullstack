import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserFriendlyMessage } from '../lib/api/errors';

const AuthModal: React.FC = () => {
  // FIX: Replaced modal-specific state with the `page`-based navigation from AuthContext to align with the app's architecture.
  const { 
    page, setPage,
    login, register 
  } = useAuth();
  
  const isLoginView = page === 'login';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // FIX: Modal visibility is now derived from the `page` state.
  const isOpen = page === 'login' || page === 'register';

  useEffect(() => {
    if (!isOpen) return;
    
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPage('home');
        setName('');
        setEmail('');
        setPassword('');
        setError('');
        setIsLoading(false);
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, setPage]);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setError('');
    setIsLoading(false);
  };

  const handleClose = () => {
    // FIX: Navigates to the 'home' page instead of attempting to set modal-specific state.
    setPage('home');
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLoginView) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      // FIX: On successful auth, the context handles navigation, so an explicit handleClose() is no longer needed.
    } catch (err: unknown) {
      const errorMessage = getUserFriendlyMessage(err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 transition-opacity duration-300 animate-fade-in"
      onClick={handleClose}
    >
      <div 
        className="bg-secondary rounded-lg shadow-xl w-full max-w-md transform transition-transform duration-300"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'scaleUp 0.3s ease-out forwards' }}
      >
        <div className="p-8 relative">
          <button 
            onClick={handleClose} 
            className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"
            aria-label="Close authentication form"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <h2 className="text-2xl font-bold text-text-primary text-center mb-2">
            {isLoginView ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-center text-text-secondary mb-6">
            {isLoginView ? 'Sign in to continue to Miners Hub' : 'Join the premier digital marketplace'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginView && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1" htmlFor="name">Full Name</label>
                <input 
                  id="name" 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                  className="w-full bg-primary text-text-primary border border-border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1" htmlFor="email">Email</label>
              <input 
                id="email" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="w-full bg-primary text-text-primary border border-border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1" htmlFor="password">Password</label>
              <input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="w-full bg-primary text-text-primary border border-border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-accent text-accent-content font-semibold py-2.5 rounded-md hover:bg-yellow-400 transition-colors duration-300 disabled:bg-border disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : (isLoginView ? 'Login' : 'Register')}
            </button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6">
            {isLoginView ? "Don't have an account?" : "Already have an account?"}
            {/* FIX: Swaps between login and register pages instead of using local modal state. */}
            <button 
              onClick={() => {
                setPage(isLoginView ? 'register' : 'login');
                resetForm();
              }} 
              className="font-semibold text-accent hover:underline ml-1"
            >
              {isLoginView ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>
       <style>{`
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
            animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AuthModal;