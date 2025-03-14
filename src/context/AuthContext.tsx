import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  sendEmailVerification,
  UserCredential,
  User as FirebaseUser 
} from 'firebase/auth';
import { auth } from '../firebase.ts'; 
import { User } from '../firebase.ts';

// Define the type for the AuthContext
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
  sendVerificationEmail: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: async () => {},
  signup: async () => {},
  isLoading: false,
  sendVerificationEmail: async () => {}
});

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const clearLocalStorageForNewUser = () => {
    localStorage.removeItem('watchlist');
    localStorage.removeItem('movieRatings');
    localStorage.removeItem('user');
    localStorage.removeItem(`favoriteActors_${user?.id}`); // Clear favorite actors for the user
  };

  const login = async (email: string, password: string) => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email address format');
      }
      
      clearLocalStorageForNewUser();
      
      const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      if (firebaseUser) {
        if (!firebaseUser.emailVerified) {
          // Sign out immediately if the email isn’t verified
          await signOut(auth);
          throw new Error('Please verify your email before logging in');
        }
        
        const userData: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          emailVerified: true,
          displayName: firebaseUser.displayName || ''
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error: any) {
      console.error('Login failed', error);
      
      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
            throw new Error('No user found with this email. Please sign up first.');
          case 'auth/wrong-password':
            throw new Error('Incorrect password. Please try again.');
          case 'auth/invalid-email':
            throw new Error('Invalid email address format.');
          case 'auth/user-disabled':
            throw new Error('This user account has been disabled.');
          case 'auth/too-many-requests':
            throw new Error('Too many login attempts. Please try again later.');
          default:
            throw new Error(`Login failed: ${error.message}`);
        }
      } else {
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem(`favoriteActors_${user?.id}`); // Clear favorite actors for the user
    } catch (error) {
      console.error('Logout failed', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string) => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
      clearLocalStorageForNewUser();
      
      const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      if (firebaseUser) {
        // Send verification email and immediately sign out
        await sendEmailVerification(firebaseUser);
        await signOut(auth);
      }
    } catch (error: any) {
      console.error('Signup failed', error);
      
      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            throw new Error('This email is already registered. Please use a different email or try logging in.');
          case 'auth/invalid-email':
            throw new Error('Invalid email address format.');
          case 'auth/weak-password':
            throw new Error('Password is too weak. Please choose a stronger password.');
          default:
            throw new Error(`Signup failed: ${error.message}`);
        }
      } else {
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const sendVerificationEmail = async () => {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
      } else {
        throw new Error('No user is currently signed up');
      }
    } catch (error) {
      console.error('Error sending verification email', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // If the email isn’t verified, sign out immediately
        if (!firebaseUser.emailVerified) {
          await signOut(auth);
          setUser(null);
          localStorage.removeItem('user');
          return;
        }
        
        const userData: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          emailVerified: firebaseUser.emailVerified,
          displayName: firebaseUser.displayName || ''
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        if (firebaseUser.emailVerified) {
          const event = new CustomEvent('email-verified', { 
            detail: { 
              userId: firebaseUser.uid,
              email: firebaseUser.email 
            } 
          });
          window.dispatchEvent(event);
        }
      } else {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem(`favoriteActors_${user?.id}`); // Clear favorite actors for the user
      }
    });
    
    return () => unsubscribe();
  }, []);

  const contextValue: AuthContextType = {
    user,
    login,
    signup,
    logout,
    isLoading,
    sendVerificationEmail
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;