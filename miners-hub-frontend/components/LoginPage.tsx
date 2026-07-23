import React, { useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import {
    requestPasswordResetOtp,
    resetPasswordWithOtp,
    verifyPasswordResetOtp,
} from '../lib/api/auth';
import { getUserFriendlyMessage } from '../lib/api/errors';
import BrandLogo from './BrandLogo';

type AuthMode = 'login' | 'forgot' | 'verify' | 'reset';

const LoginPage: React.FC = () => {
    const { login, setPage } = useAuth();
    const { addNotification } = useNotification();
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);
    const lastVerifiedOtpRef = useRef('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            await login(email, password);
            addNotification({
                type: 'success',
                title: 'Login Successful',
                message: 'Welcome back to Miners Hub!',
            });
            // On successful login, auth context will redirect.
        } catch (err: unknown) {
            const errorMessage = getUserFriendlyMessage(err);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        await sendPasswordResetOtp();
    };

    const sendPasswordResetOtp = async () => {
        setError('');
        setSuccess('');
        setOtp('');
        lastVerifiedOtpRef.current = '';
        setIsLoading(true);

        try {
            const response = await requestPasswordResetOtp(email);
            setSuccess(response.message);
            setMode('verify');
        } catch (err: unknown) {
            setError(getUserFriendlyMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const verifyOtpCode = async (code: string) => {
        if (code.length !== 6 || isLoading || lastVerifiedOtpRef.current === code) return;

        setError('');
        setSuccess('');
        setIsLoading(true);
        lastVerifiedOtpRef.current = code;

        try {
            await verifyPasswordResetOtp(email, code);
            setOtp(code);
            setSuccess('OTP verified. Set your new password.');
            setMode('reset');
        } catch (err: unknown) {
            setError(getUserFriendlyMessage(err));
            lastVerifiedOtpRef.current = '';
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        await verifyOtpCode(otp);
    };

    const updateOtp = (value: string, nextFocusIndex?: number) => {
        const digits = value.replace(/\D/g, '').slice(0, 6);
        setOtp(digits);

        if (nextFocusIndex !== undefined && digits.length < 6) {
            otpInputRefs.current[nextFocusIndex]?.focus();
        }

        if (digits.length === 6) {
            otpInputRefs.current[5]?.blur();
            void verifyOtpCode(digits);
        }
    };

    const handleOtpBoxChange = (index: number, value: string) => {
        if (value.replace(/\D/g, '').length > 1) {
            updateOtp(value);
            return;
        }

        const digit = value.replace(/\D/g, '').slice(-1);
        const otpDigits = otp.padEnd(6, ' ').split('');
        otpDigits[index] = digit || ' ';
        const nextOtp = otpDigits.join('').replace(/\s/g, '').slice(0, 6);

        setOtp(nextOtp);

        if (digit && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }

        if (nextOtp.length === 6) {
            otpInputRefs.current[index]?.blur();
            void verifyOtpCode(nextOtp);
        }
    };

    const handleOtpPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
        event.preventDefault();
        updateOtp(event.clipboardData.getData('text'));
    };

    const handleOtpKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Backspace' && !otp[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }

        if (event.key === 'ArrowLeft' && index > 0) {
            event.preventDefault();
            otpInputRefs.current[index - 1]?.focus();
        }

        if (event.key === 'ArrowRight' && index < 5) {
            event.preventDefault();
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsLoading(true);
        try {
            await resetPasswordWithOtp(email, otp, newPassword);
            setPassword('');
            setOtp('');
            setNewPassword('');
            setConfirmPassword('');
            setMode('login');
            setSuccess('Password reset successfully. Sign in with your new password.');
        } catch (err: unknown) {
            setError(getUserFriendlyMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const returnToLogin = () => {
        setMode('login');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        lastVerifiedOtpRef.current = '';
        setError('');
        setSuccess('');
    };

    const title = mode === 'login' ? 'Welcome Back' : 'Reset Password';
    const subtitle = mode === 'login'
        ? 'Sign in to continue to Miners Hub.'
        : mode === 'forgot'
            ? 'Enter your email and we will send a password reset OTP.'
            : mode === 'verify'
                ? 'Enter the six-digit OTP sent to your email.'
                : 'Create a new password for your account.';

    return (
        <div className="min-h-screen bg-primary text-text-secondary flex">
            {/* Left Column */}
            <div className="hidden lg:flex w-1/2 bg-cover bg-center relative items-center justify-center p-12" style={{ backgroundImage: `url('https://picsum.photos/seed/authpage/1200/1800')` }}>
                <div className="absolute inset-0 bg-primary bg-opacity-70"></div>
                <div className="relative z-10 text-center text-white">
                    <button onClick={() => setPage('home')} className="flex items-center space-x-2 mx-auto mb-8">
                        <BrandLogo size="lg" textClassName="text-white" />
                    </button>
                    <h1 className="text-4xl font-extrabold mb-4" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                        Unlock Africa's Mineral Wealth
                    </h1>
                    <p className="text-lg">
                        The premier digital marketplace for transparent and efficient mineral trading.
                    </p>
                </div>
            </div>

            {/* Right Column */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md">
                    <div className="lg:hidden mb-8">
                         <button onClick={() => setPage('home')} className="flex items-center space-x-2">
                            <BrandLogo size="sm" />
                        </button>
                    </div>
                    <h2 className="text-3xl font-bold text-text-primary mb-2">{title}</h2>
                    <p className="text-text-secondary mb-8">{subtitle}</p>
                    
                    {mode === 'login' && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1" htmlFor="email">Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                                    </div>
                                    <input 
                                        id="email" 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required 
                                        placeholder="e.g., john.doe@example.com"
                                        className="w-full bg-primary text-text-primary border border-border rounded-md py-2.5 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-accent"
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between gap-4 mb-1">
                                    <label className="block text-sm font-medium text-text-secondary" htmlFor="password">Password</label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setError('');
                                            setSuccess('');
                                            setMode('forgot');
                                        }}
                                        className="text-xs font-semibold text-accent hover:underline"
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                    </div>
                                    <input 
                                        id="password" 
                                        type="password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required 
                                        placeholder="••••••••"
                                        className="w-full bg-primary text-text-primary border border-border rounded-md py-2.5 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-accent"
                                    />
                                </div>
                            </div>

                            {success && <p className="text-green-400 text-sm text-center">{success}</p>}
                            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full bg-accent text-accent-content font-semibold py-3 rounded-md hover:bg-yellow-400 transition-colors duration-300 disabled:bg-border disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </button>
                        </form>
                    )}

                    {mode === 'forgot' && (
                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1" htmlFor="reset-email">Email</label>
                                <input
                                    id="reset-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="e.g., john.doe@example.com"
                                    className="w-full bg-primary text-text-primary border border-border rounded-md py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-accent"
                                />
                            </div>
                            {success && <p className="text-green-400 text-sm text-center">{success}</p>}
                            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                            <button type="submit" disabled={isLoading} className="w-full bg-accent text-accent-content font-semibold py-3 rounded-md hover:bg-yellow-400 transition-colors duration-300 disabled:bg-border disabled:cursor-not-allowed">
                                {isLoading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                            <button type="button" onClick={returnToLogin} className="w-full text-sm font-semibold text-text-secondary hover:text-accent">
                                Back to sign in
                            </button>
                        </form>
                    )}

                    {mode === 'verify' && (
                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2" htmlFor="otp-0">OTP</label>
                                <div className="grid grid-cols-6 gap-2">
                                    {Array.from({ length: 6 }).map((_, index) => (
                                        <input
                                            key={index}
                                            ref={(element) => {
                                                otpInputRefs.current[index] = element;
                                            }}
                                            id={`otp-${index}`}
                                            type="text"
                                            value={otp[index] || ''}
                                            onChange={(e) => handleOtpBoxChange(index, e.target.value)}
                                            onPaste={handleOtpPaste}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            disabled={isLoading}
                                            required
                                            inputMode="numeric"
                                            autoComplete={index === 0 ? 'one-time-code' : 'off'}
                                            pattern="[0-9]"
                                            maxLength={index === 0 ? 6 : 1}
                                            aria-label={`OTP digit ${index + 1}`}
                                            className="h-12 w-full rounded-md border border-border bg-primary text-center text-lg font-bold text-text-primary outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:cursor-wait disabled:opacity-60"
                                        />
                                    ))}
                                </div>
                            </div>
                            {success && <p className="text-green-400 text-sm text-center">{success}</p>}
                            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                            <button type="submit" disabled={isLoading || otp.length !== 6} className="w-full bg-accent text-accent-content font-semibold py-3 rounded-md hover:bg-yellow-400 transition-colors duration-300 disabled:bg-border disabled:cursor-not-allowed">
                                {isLoading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                            <button type="button" onClick={() => void sendPasswordResetOtp()} disabled={isLoading} className="w-full text-sm font-semibold text-text-secondary hover:text-accent disabled:opacity-50">
                                Resend OTP
                            </button>
                            <button type="button" onClick={returnToLogin} className="w-full text-sm font-semibold text-text-secondary hover:text-accent">
                                Back to sign in
                            </button>
                        </form>
                    )}

                    {mode === 'reset' && (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1" htmlFor="new-password">New Password</label>
                                <input
                                    id="new-password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full bg-primary text-text-primary border border-border rounded-md py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-accent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1" htmlFor="confirm-password">Confirm Password</label>
                                <input
                                    id="confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full bg-primary text-text-primary border border-border rounded-md py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-accent"
                                />
                            </div>
                            {success && <p className="text-green-400 text-sm text-center">{success}</p>}
                            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                            <button type="submit" disabled={isLoading} className="w-full bg-accent text-accent-content font-semibold py-3 rounded-md hover:bg-yellow-400 transition-colors duration-300 disabled:bg-border disabled:cursor-not-allowed">
                                {isLoading ? 'Resetting...' : 'Reset Password'}
                            </button>
                            <button type="button" onClick={returnToLogin} className="w-full text-sm font-semibold text-text-secondary hover:text-accent">
                                Back to sign in
                            </button>
                        </form>
                    )}

                    {mode === 'login' && <p className="text-center text-sm text-text-muted mt-6">
                        Don't have an account?
                        <button onClick={() => setPage('register')} className="font-semibold text-accent hover:underline ml-1">
                            Register
                        </button>
                    </p>}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
