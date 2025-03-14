import React, { useState, useEffect, useCallback } from 'react';
import { Star, Loader } from 'lucide-react';
import MovieCarousel from './MovieCarousel.tsx';
import { useWatchlist } from '../context/WatchlistContext.tsx';
import { useRating } from '../context/RatingContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';

const TMDB_API_KEY = "20aa58687a91f16d5c3fecf68b8e7dc1";

interface Movie {
  id: string;
  title: string;
  rating: number;
  image: string;
  year: string;
  genre_ids: number[];
  genres: string[];
}

interface Genre {
  id: number;
  name: string;
}

const Recommendations = () => {
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [genres, setGenres] = useState<Genre[]>([]);
  const { watchlist } = useWatchlist();
  const { ratings, getAverageRating } = useRating();
  const { user } = useAuth();

  // Fetch genres once when component mounts
  const fetchGenres = async () => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}`
      );
      const data = await response.json();
      setGenres(data.genres);
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  const getFavoriteGenres = useCallback((): number[] => {
    // Get genres from watchlist movies
    const watchlistGenres = watchlist.flatMap(movie => {
      try {
        return typeof movie.genre === 'string' 
          ? JSON.parse(movie.genre) 
          : movie.genre;
      } catch (e) {
        console.error('Error parsing genre:', e);
        return [];
      }
    }).flat();

    // Get genres from highly rated movies
    const highlyRatedMovies = watchlist.filter(movie => {
      const rating = getAverageRating(movie.id);
      return rating >= 4;
    });

    const ratedGenres = highlyRatedMovies.flatMap(movie => {
      try {
        return typeof movie.genre === 'string'
          ? JSON.parse(movie.genre)
          : movie.genre;
      } catch (e) {
        console.error('Error parsing genre:', e);
        return [];
      }
    }).flat();

    // Count genre occurrences
    const genreCounts = [...watchlistGenres, ...ratedGenres].reduce((acc, genre) => {
      if (genre) {
        acc[genre] = (acc[genre] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Return top 3 most frequent genres
    return Object.entries(genreCounts as Record<string, number>)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([genre]) => Number(genre));
  }, [watchlist, getAverageRating]);

  const fetchRecommendedMovies = useCallback(async () => {
    try {
      setIsLoading(true);
      const favoriteGenres = getFavoriteGenres();
      let moviesData;

      // Always fetch popular movies first
      const popularResponse = await fetch(
        `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`
      );
      const popularData = await popularResponse.json();

      // If user has preferences, also fetch genre-based recommendations
      if (favoriteGenres.length > 0) {
        const genreResponse = await fetch(
          `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${favoriteGenres.join(',')}&sort_by=popularity.desc&vote_count.gte=100`
        );
        const genreData = await genreResponse.json();
        
        // Combine both results
        moviesData = [...genreData.results, ...popularData.results];
      } else {
        moviesData = popularData.results;
      }

      // Format and deduplicate movies
      const uniqueMovies = Array.from(new Set(moviesData.map((m: any) => m.id)))
        .map(id => moviesData.find((m: any) => m.id === id))
        .filter((movie: any) => movie.poster_path);

      const formattedMovies = uniqueMovies.map((movie: any) => ({
        id: String(movie.id),
        title: movie.title,
        rating: movie.vote_average,
        image: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        year: movie.release_date ? new Date(movie.release_date).getFullYear().toString() : "",
        genre_ids: movie.genre_ids || [],
        genres: movie.genre_ids?.map((id: number) => 
          genres.find(g => g.id === id)?.name || ''
        ).filter(Boolean) || [],
      }));

      // Sort movies based on user preferences if they exist
      let sortedMovies = formattedMovies;
      if (favoriteGenres.length > 0) {
        const userAverageRating = ratings.length > 0
          ? ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length
          : 0;

        sortedMovies = formattedMovies.sort((a, b) => {
          const aGenreMatch = a.genre_ids.some(id => favoriteGenres.includes(id));
          const bGenreMatch = b.genre_ids.some(id => favoriteGenres.includes(id));
          
          if (aGenreMatch && !bGenreMatch) return -1;
          if (!aGenreMatch && bGenreMatch) return 1;
          
          if (userAverageRating > 0) {
            const aRating = getAverageRating(a.id);
            const bRating = getAverageRating(b.id);
            return Math.abs(bRating - userAverageRating) - Math.abs(aRating - userAverageRating);
          }
          
          return b.rating - a.rating;
        });
      }

      // Take top 10 movies, excluding any that are already in watchlist
      const filteredMovies = sortedMovies
        .filter(movie => !watchlist.some(w => w.id === movie.id))
        .slice(0, 10);

      setRecommendedMovies(filteredMovies);
    } catch (error) {
      console.error('Error fetching recommended movies:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getFavoriteGenres, watchlist, ratings, genres, getAverageRating]);

  // Fetch genres when component mounts
  useEffect(() => {
    fetchGenres();
  }, []);

  // Fetch recommendations when dependencies change
  useEffect(() => {
    fetchRecommendedMovies();
  }, [fetchRecommendedMovies, watchlist, ratings]);

  if (!user) {
    return null;
  }

  if (recommendedMovies.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className="my-8">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-6 h-6 text-yellow-400" />
        <h2 className="text-2xl font-bold">
          {watchlist.length > 0 || ratings.length > 0 
            ? "Recommended for You" 
            : "Popular Movies"}
        </h2>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader className="w-8 h-8 animate-spin text-yellow-400" />
        </div>
      ) : (
        <MovieCarousel movies={recommendedMovies} />
      )}
    </div>
  );
};

export default Recommendations;
