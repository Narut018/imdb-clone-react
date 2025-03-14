import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { useWatchlist } from "../../src/context/WatchlistContext.tsx";
import { useRating } from "../../src/context/RatingContext.tsx";
import { useAuth } from "../../src/context/AuthContext.tsx";
import StarRating from "../../src/components/StarRating.tsx";
import { toast } from 'react-hot-toast';
import MovieCard from "../components/MovieCard.tsx";

const TMDB_API_KEY = "20aa58687a91f16d5c3fecf68b8e7dc1";
const BASE_IMAGE_URL = "https://image.tmdb.org/t/p/w500";

interface Movie {
  id: number;
  title: string;
  rating: number;
  image: string;
  year: number;
  overview: string;
  genres: string[];
}

interface Genre {
  id: number;
  name: string;
}

const TrendingMovies = () => {
  const { user } = useAuth();
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const { rateMovie, getUserRating, getAverageRating } = useRating();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    genres: [] as string[],
    yearRange: { min: 1980, max: 2025 },
    ratingRange: { min: 0, max: 10 }
  });

  const fetchGenres = async () => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}`
      );
      const data = await response.json();
      setGenres(data.genres);
    } catch (error) {
      console.error("Error fetching genres:", error);
    }
  };

  const getGenreNames = (genreIds: number[]): string[] => {
    if (!genreIds || !genres) return [];
    return genreIds
      .map(id => {
        const genre = genres.find(g => g.id === id);
        return genre ? genre.name : '';
      })
      .filter(Boolean);
  };

  const fetchMovies = async (pageNum: number) => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}&page=${pageNum}`
      );
      const data = await response.json();
      
      const transformedMovies = data.results.map((movie: any) => ({
        id: movie.id,
        title: movie.title,
        rating: movie.vote_average || 0,
        image: movie.poster_path 
          ? `${BASE_IMAGE_URL}${movie.poster_path}`
          : 'https://via.placeholder.com/300x450?text=No+Image',
        year: new Date(movie.release_date || Date.now()).getFullYear(),
        overview: movie.overview,
        genres: getGenreNames(movie.genre_ids || [])
      }));

      setMovies(prev => pageNum === 1 ? transformedMovies : [...prev, ...transformedMovies]);
      setTotalPages(data.total_pages);
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  useEffect(() => {
    if (genres.length > 0) {
      fetchMovies(page);
    }
  }, [genres, page]);

  const loadMore = () => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
    }
  };

  const filteredMovies = movies.filter(movie => {
    const matchesSearch = search === "" || 
      movie.title.toLowerCase().includes(search.toLowerCase());
    const matchesYear = 
      movie.year >= filters.yearRange.min && 
      movie.year <= filters.yearRange.max;
    const matchesGenre = 
      filters.genres.length === 0 || 
      movie.genres.some(g => filters.genres.includes(g));
    const matchesRating =
      movie.rating >= filters.ratingRange.min &&
      movie.rating <= filters.ratingRange.max;

    return matchesSearch && matchesYear && matchesGenre && matchesRating;
  });

  const handleAddToWatchlist = (movie: Movie) => {
    if (!user) {
      toast.error('Please log in to add movies to your watchlist', {
        position: 'top-right',
        duration: 3000,
      });
      return;
    }
    addToWatchlist({
      id: movie.id,
      title: movie.title,
      poster_path: movie.image,
      rating: movie.rating,
    });
  };

  const handleRateMovie = (movieId: string, rating: number) => {
    if (!user) {
      toast.error('Please log in to rate movies', {
        position: 'top-right',
        duration: 3000,
      });
      return;
    }
    rateMovie(movieId, rating);
  };

  if (isLoading && movies.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Search movies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-900/50 rounded-xl backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Star className="w-8 h-8 text-yellow-500" />
          Trending Movies
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-8 bg-zinc-900/30 p-4 rounded-xl backdrop-blur-sm">
        <div className="flex-1 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Year:</span>
            <select
              value={filters.yearRange.min}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                yearRange: { ...prev.yearRange, min: parseInt(e.target.value) }
              }))}
              className="bg-gray-800 rounded-lg px-3 py-1.5 text-sm"
            >
              {Array.from({ length: 46 }, (_, i) => 2025 - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <span className="text-gray-400">-</span>
            <select
              value={filters.yearRange.max}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                yearRange: { ...prev.yearRange, max: parseInt(e.target.value) }
              }))}
              className="bg-gray-800 rounded-lg px-3 py-1.5 text-sm"
            >
              {Array.from({ length: 46 }, (_, i) => 2025 - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-400">Genre:</span>
            <select
              value={filters.genres[0] || ''}
              onChange={(e) => {
                const genre = e.target.value;
                setFilters(prev => ({
                  ...prev,
                  genres: genre ? [genre] : []
                }));
              }}
              className="bg-gray-800 rounded-lg px-3 py-1.5 text-sm min-w-[150px]"
            >
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.name}>{genre.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-400">Rating:</span>
            <select
              value={filters.ratingRange.min}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                ratingRange: { ...prev.ratingRange, min: parseInt(e.target.value) }
              }))}
              className="bg-gray-800 rounded-lg px-3 py-1.5 text-sm"
            >
              {Array.from({ length: 11 }, (_, i) => i).map(rating => (
                <option key={rating} value={rating}>{rating}</option>
              ))}
            </select>
            <span className="text-gray-400">-</span>
            <select
              value={filters.ratingRange.max}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                ratingRange: { ...prev.ratingRange, max: parseInt(e.target.value) }
              }))}
              className="bg-gray-800 rounded-lg px-3 py-1.5 text-sm"
            >
              {Array.from({ length: 11 }, (_, i) => i).map(rating => (
                <option key={rating} value={rating}>{rating}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredMovies.map(movie => (
          <MovieCard
            key={movie.id}
            id={movie.id}
            title={movie.title}
            rating={movie.rating}
            image={movie.image}
            year={movie.year}
            genres={movie.genres}
            user={user}
          />
        ))}
      </div>

      {page < totalPages && filteredMovies.length > 0 && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            className="bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default TrendingMovies;
