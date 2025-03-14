import React, { createContext, useContext, useState, useEffect } from 'react';

interface Movie {
  id: number;
  title: string;
  genre_ids: number[];
}

interface UserRating {
  movieId: number;
  rating: number;
}

interface UserPreferencesContextType {
  watchlist: Movie[];
  ratings: UserRating[];
  addToWatchlist: (movie: Movie) => void;
  removeFromWatchlist: (movieId: number) => void;
  rateMovie: (movieId: number, rating: number) => void;
  getFavoriteGenres: () => number[];
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export const UserPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [watchlist, setWatchlist] = useState<Movie[]>(() => {
    const saved = localStorage.getItem('watchlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [ratings, setRatings] = useState<UserRating[]>(() => {
    const saved = localStorage.getItem('ratings');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('ratings', JSON.stringify(ratings));
  }, [ratings]);

  const addToWatchlist = (movie: Movie) => {
    if (!watchlist.some(m => m.id === movie.id)) {
      setWatchlist([...watchlist, movie]);
    }
  };

  const removeFromWatchlist = (movieId: number) => {
    setWatchlist(watchlist.filter(movie => movie.id !== movieId));
  };

  const rateMovie = (movieId: number, rating: number) => {
    setRatings(prevRatings => {
      const existingRating = prevRatings.find(r => r.movieId === movieId);
      if (existingRating) {
        return prevRatings.map(r => 
          r.movieId === movieId ? { ...r, rating } : r
        );
      }
      return [...prevRatings, { movieId, rating }];
    });
  };

  const getFavoriteGenres = (): number[] => {
    // Combine genres from watchlist and highly rated movies
    const allGenres = watchlist.flatMap(movie => movie.genre_ids);
    const highlyRatedMovies = watchlist.filter(movie => {
      const rating = ratings.find(r => r.movieId === movie.id);
      return rating && rating.rating >= 4;
    });
    
    const highlyRatedGenres = highlyRatedMovies.flatMap(movie => movie.genre_ids);
    
    // Count genre occurrences
    const genreCounts = [...allGenres, ...highlyRatedGenres].reduce((acc, genre) => {
      acc[genre] = (acc[genre] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    // Return top 3 most frequent genres
    return Object.entries(genreCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([genre]) => Number(genre));
  };

  return (
    <UserPreferencesContext.Provider value={{
      watchlist,
      ratings,
      addToWatchlist,
      removeFromWatchlist,
      rateMovie,
      getFavoriteGenres,
    }}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
};
