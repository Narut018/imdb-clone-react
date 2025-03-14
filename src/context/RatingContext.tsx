import React, { createContext, useContext, useState, useEffect } from 'react';

interface Rating {
  movieId: string;
  rating: number;
}

interface RatingContextType {
  ratings: Rating[];
  averageRatings: { [key: string]: number };
  rateMovie: (movieId: string, rating: number) => void;
  getUserRating: (movieId: string) => number;
  getAverageRating: (movieId: string) => number;
  resetRatings: () => void;
}

const RatingContext = createContext<RatingContextType | undefined>(undefined);

export const RatingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ratings, setRatings] = useState<Rating[]>(() => {
    const savedRatings = localStorage.getItem('movieRatings');
    return savedRatings ? JSON.parse(savedRatings) : [];
  });

  const [averageRatings, setAverageRatings] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    localStorage.setItem('movieRatings', JSON.stringify(ratings));
    
    // Calculate average ratings
    const avgRatings: { [key: string]: number } = {};
    ratings.forEach((rating) => {
      if (!avgRatings[rating.movieId]) {
        const movieRatings = ratings.filter(r => r.movieId === rating.movieId);
        const sum = movieRatings.reduce((acc, curr) => acc + curr.rating, 0);
        avgRatings[rating.movieId] = sum / movieRatings.length;
      }
    });
    setAverageRatings(avgRatings);
  }, [ratings]);

  const rateMovie = (movieId: string, rating: number) => {
    setRatings(prevRatings => {
      const existingRatingIndex = prevRatings.findIndex(
        r => r.movieId === movieId
      );

      if (existingRatingIndex > -1) {
        const newRatings = [...prevRatings];
        newRatings[existingRatingIndex] = { movieId, rating };
        return newRatings;
      }

      return [...prevRatings, { movieId, rating }];
    });
  };

  const getUserRating = (movieId: string): number => {
    const userRating = ratings.find(r => r.movieId === movieId);
    return userRating ? userRating.rating : 0;
  };

  const getAverageRating = (movieId: string): number => {
    return averageRatings[movieId] || 0;
  };

  // Function to reset the ratings
  const resetRatings = () => {
    setRatings([]);
    setAverageRatings({});
    localStorage.removeItem('movieRatings');
  };

  return (
    <RatingContext.Provider
      value={{
        ratings,
        averageRatings,
        rateMovie,
        getUserRating,
        getAverageRating,
        resetRatings,
      }}
    >
      {children}
    </RatingContext.Provider>
  );
};

export const useRating = () => {
  const context = useContext(RatingContext);
  if (context === undefined) {
    throw new Error('useRating must be used within a RatingProvider');
  }
  return context;
};
