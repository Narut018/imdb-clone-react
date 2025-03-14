import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { User, Lock, Mail, X, Timer } from 'lucide-react';

interface SignupModalProps {
  onClose: () => void;
}

const SignupModal: React.FC<SignupModalProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [verificationCountdown, setVerificationCountdown] = useState(300); // 5 minutes
  const { signup, sendVerificationEmail } = useAuth();

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsEmailSent(false);

    // Validation
    if (!email) {
      setError('Email is required');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (passwordStrength < 3) {
      setError('Password is too weak');
      return;
    }

    try {
      await signup(email, password);
      setIsEmailSent(true);
      // Optional: Add a toast or alert about verification email
    } catch (signupError: any) {
      setError(signupError.message || 'Signup failed');
    }
  };

  const handleResendVerification = async () => {
    try {
      await sendVerificationEmail();
      // Optional: Add a toast or alert about resent verification email
    } catch (resendError: any) {
      setError(resendError.message || 'Failed to resend verification email');
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordStrength(calculatePasswordStrength(value));
  };

  useEffect(() => {
    let countdownTimer: NodeJS.Timeout;
    
    if (isEmailSent) {
      countdownTimer = setInterval(() => {
        setVerificationCountdown((prevTime) => {
          if (prevTime <= 1) {
            // Auto-close if verification not completed
            onClose();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    // Add event listener for email verification
    const handleEmailVerified = (event: CustomEvent) => {
      // Automatically close the modal when email is verified
      onClose();
    };

    window.addEventListener('email-verified', handleEmailVerified as EventListener);

    return () => {
      if (countdownTimer) clearInterval(countdownTimer);
      window.removeEventListener('email-verified', handleEmailVerified as EventListener);
    };
  }, [isEmailSent, onClose]);

  return (
    <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-24 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-zinc-900 rounded-xl shadow-2xl w-full max-w-sm relative border border-zinc-800 my-auto">
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        {/* Modal Header */}
        <div className="p-5 pb-0">
          <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-zinc-400 mb-4 text-sm">Join our movie community today!</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-5 mb-3">
            <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-2 rounded-lg text-sm">
              {error}
            </div>
          </div>
        )}

        {!isEmailSent ? (
          <form onSubmit={handleSubmit} className="p-5 pt-0 space-y-3">
            {/* Email Input */}
            <div className="relative">
              <label htmlFor="email" className="block text-zinc-400 mb-1 text-sm">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="relative">
              <label htmlFor="password" className="block text-zinc-400 mb-1 text-sm">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Create a strong password"
                  required
                />
              </div>
              {/* Password Strength Indicator */}
              <div className="mt-1 flex space-x-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div 
                    key={level} 
                    className={`h-1 flex-1 rounded-full ${
                      passwordStrength >= level 
                        ? level <= 2 
                          ? 'bg-red-500' 
                          : level <= 4 
                            ? 'bg-yellow-500' 
                            : 'bg-green-500'
                        : 'bg-zinc-700'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                {passwordStrength === 0 && 'Password strength'}
                {passwordStrength === 1 && 'Very weak'}
                {passwordStrength === 2 && 'Weak'}
                {passwordStrength === 3 && 'Moderate'}
                {passwordStrength === 4 && 'Strong'}
                {passwordStrength === 5 && 'Very strong'}
              </p>
            </div>

            {/* Confirm Password Input */}
            <div className="relative">
              <label htmlFor="confirm-password" className="block text-zinc-400 mb-1 text-sm">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                  type="password"
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors font-semibold flex items-center justify-center space-x-2 text-sm"
            >
              <User className="mr-2" size={18} />
              Create Account
            </button>

            {/* Login Redirect */}
            <div className="text-center">
              <p className="text-zinc-400 text-xs">
                Already have an account?{' '}
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="text-blue-500 hover:underline"
                >
                  Log in
                </button>
              </p>
            </div>
          </form>
        ) : (
          <div className="p-5 pt-0 space-y-3">
            <h2 className="text-2xl font-bold text-white mb-2">Verify Your Email</h2>
            <p className="text-zinc-400 mb-4 text-sm">A verification email has been sent to {email}. Please check your inbox.</p>
            
            {/* New Verification Countdown */}
            <div className="flex items-center justify-center space-x-2 text-zinc-400">
              <Timer size={18} />
              <span>
                Time to verify: {Math.floor(verificationCountdown / 60)}:
                {(verificationCountdown % 60).toString().padStart(2, '0')}
              </span>
            </div>
            
            <p className="text-zinc-400 mb-4 text-sm text-center">
              Didn't receive the email? <button onClick={handleResendVerification} className="text-blue-500 hover:underline">Resend Verification Email</button>
            </p>
            
            {/* Optional: Add a warning if time is running low */}
            {verificationCountdown <= 60 && (
              <div className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 p-2 rounded-lg text-sm text-center">
                Hurry! You have less than a minute to verify your email.
              </div>
            )}
            
            <button onClick={onClose} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors font-semibold flex items-center justify-center space-x-2 text-sm">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignupModal;
