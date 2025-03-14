import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext.tsx"; // Import AuthContext

// Define the Movie type
interface Movie {
  id: string;
  title: string;
  rating?: number;
  image: string;
  year: string;
  genre: string[];
}

// Define the context type
interface WatchlistContextType {
  watchlist: Movie[];
  addToWatchlist: (movie: Movie) => void;
  removeFromWatchlist: (movieId: string) => void;
  resetWatchlist: () => void;
}

// Create the WatchlistContext
const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

// Provider component
export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth(); // Get user from AuthContext
  const [watchlist, setWatchlist] = useState<Movie[]>([]);

  // Load watchlist from localStorage when the component mounts and user is logged in
  useEffect(() => {
    if (user) {
      const storedWatchlist = localStorage.getItem(`watchlist_${user.id}`);
      if (storedWatchlist) {
        setWatchlist(JSON.parse(storedWatchlist));
      }
    } else {
      // Clear watchlist if no user is logged in
      setWatchlist([]);
    }
  }, [user]);

  // Save watchlist to localStorage whenever it changes and user is logged in
  useEffect(() => {
    if (user) {
      localStorage.setItem(`watchlist_${user.id}`, JSON.stringify(watchlist));
    }
  }, [watchlist, user]);

  // Function to add a movie to the watchlist
  const addToWatchlist = (movie: Movie) => {
    // Check if user is logged in before adding to watchlist
    if (!user) {
      alert('Please log in to add movies to your watchlist');
      return;
    }
    setWatchlist((prev) => [...prev, movie]);
  };

  // Function to remove a movie from the watchlist
  const removeFromWatchlist = (movieId: string) => {
    // Check if user is logged in before removing from watchlist
    if (!user) {
      alert('Please log in to remove movies from your watchlist');
      return;
    }
    setWatchlist((prev) => prev.filter((movie) => movie.id !== movieId));
  };

  // Function to reset the watchlist
  const resetWatchlist = () => {
    // Check if user is logged in before resetting watchlist
    if (!user) {
      alert('Please log in to reset your watchlist');
      return;
    }
    setWatchlist([]);
    localStorage.removeItem(`watchlist_${user.id}`);
  };

  return (
    <WatchlistContext.Provider value={{ watchlist, addToWatchlist, removeFromWatchlist, resetWatchlist }}>
      {children}
    </WatchlistContext.Provider>
  );
};

// Custom hook to use the watchlist context
export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error("useWatchlist must be used within a WatchlistProvider");
  }
  return context;
};
