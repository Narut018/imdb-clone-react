import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { LogIn, Lock, Mail, X, Eye, EyeOff } from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
  onSignupClick?: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onSignupClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth(); // Add isLoading from useAuth

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    try {
      await login(email, password);
      onClose(); // Close the modal on successful login
    } catch (err: any) {
      // Display the specific error message from the login function.
      setError(err.message || 'Login failed. Please check your credentials.');
      console.error('Login failed', err);
    }
  };

  const handleSignupClick = () => {
    onClose(); // Close login modal
    onSignupClick && onSignupClick(); // Open signup modal if callback provided
  };

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
          <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-zinc-400 mb-4 text-sm">Log in to continue your movie journey</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-5 mb-3">
            <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-2 rounded-lg text-sm">
              {error}
            </div>
          </div>
        )}

        {/* Login Form */}
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
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {/* Forgot Password Link */}
            <div className="text-right mt-1">
              <a 
                href="#" 
                className="text-xs text-blue-500 hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Forgot password feature coming soon!');
                }}
              >
                Forgot Password?
              </a>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading} // Disable button when loading
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors font-semibold flex items-center justify-center space-x-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="animate-spin">
                <LogIn className="mr-2" size={18} />
              </div>
            ) : (
              <>
                <LogIn className="mr-2" size={18} />
                Log In
              </>
            )}
          </button>

          {/* Signup Redirect */}
          <div className="text-center">
            <p className="text-zinc-400 text-xs">
              Don't have an account?{' '}
              <button 
                type="button" 
                onClick={handleSignupClick}
                className="text-blue-500 hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>

          {/* Social Login Divider */}
          <div className="flex items-center my-3">
            <div className="flex-grow border-t border-zinc-700"></div>
            <span className="mx-3 text-zinc-500 text-xs">or continue with</span>
            <div className="flex-grow border-t border-zinc-700"></div>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg flex items-center justify-center text-sm"
              onClick={() => alert('Google login coming soon!')}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.613 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 15.827 0 12.48 0 5.893 0 .533 5.387.533 12s5.36 12 11.947 12c3.313 0 5.893-1.093 7.88-3.147 2.027-2.027 2.667-4.88 2.667-7.187 0-.713-.053-1.373-.16-1.907H12.48z" />
              </svg>
              Google
            </button>
            <button
              type="button"
              className="bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg flex items-center justify-center text-sm"
              onClick={() => alert('GitHub login coming soon!')}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;