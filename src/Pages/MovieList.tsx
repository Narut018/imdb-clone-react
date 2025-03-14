import { Search, SlidersHorizontal } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useWatchlist } from "../../src/context/WatchlistContext.tsx";
import { useRating } from "../../src/context/RatingContext.tsx";
import { useAuth } from "../../src/context/AuthContext.tsx";
import MovieCard from "../../src/components/MovieCard.tsx";
import FilterChips from "../../src/components/FilterChips.tsx";

const TMDB_API_KEY = "20aa58687a91f16d5c3fecf68b8e7dc1";

interface Movie {
  id: number;
  title: string;
  rating: number;
  image: string;
  year: number;
  genre: string[];
}

const MovieList = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search");
  const { watchlist } = useWatchlist();
  const { getUserRating, getAverageRating } = useRating();
  const [isLoading, setIsLoading] = useState(true);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genreMap, setGenreMap] = useState<Map<number, string>>(new Map()); // Store genre ID -> Name
  const [filters, setFilters] = useState({
    genres: [] as string[],
    years: ["1980 - 1990", "1991 - 2000", "2001 - 2010", "2011 - 2020", "2021 - 2025"],
    ratings: Array.from({ length: 10 }, (_, i) => `${i + 1}`),
  });
  const [activeFilters, setActiveFilters] = useState({
    genres: [] as string[],
    years: [] as string[],
    ratings: [] as string[],
  });

  // Fetch genres from TMDB
  const fetchGenres = async () => {
    try {
      const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}`);
      const data = await response.json();
      const newGenreMap = new Map(data.genres.map((g: any) => [g.id, g.name]));
      setGenreMap(newGenreMap); // Store in state
      setFilters((prev) => ({
        ...prev,
        genres: data.genres.map((g: any) => g.name), // Store genre names
      }));
    } catch (error) {
      console.error("Error fetching genres:", error);
    }
  };

  // Fetch movies from TMDB with applied filters
  const fetchMovies = async () => {
    try {
      setIsLoading(true);
      let apiUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&sort_by=popularity.desc`;

      if (search) {
        apiUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(search)}`;
      }

      // Apply Year Filter
      if (activeFilters.years.length > 0) {
        const [startYear, endYear] = activeFilters.years[0].split(" - ").map(Number);
        apiUrl += `&primary_release_date.gte=${startYear}-01-01&primary_release_date.lte=${endYear}-12-31`;
      }

      // Apply Genre Filter
      if (activeFilters.genres.length > 0) {
        const selectedGenreIds = activeFilters.genres
          .map((genre) => [...genreMap.entries()].find(([_, name]) => name === genre)?.[0])
          .filter(Boolean)
          .join(",");
        if (selectedGenreIds) apiUrl += `&with_genres=${selectedGenreIds}`;
      }

      // Apply Rating Filter
      if (activeFilters.ratings.length > 0) {
        const minRating = Math.min(...activeFilters.ratings.map(Number));
        apiUrl += `&vote_average.gte=${minRating}`;
      }

      // Fetch movie data
      const response = await fetch(apiUrl);
      const data = await response.json();

      // Transform movie data with genres mapped
      const transformedMovies = data.results.map((movie: any) => ({
        id: movie.id,
        title: movie.title,
        rating: movie.vote_average,
        image: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        year: new Date(movie.release_date).getFullYear(),
        genre: movie.genre_ids.map((id: number) => genreMap.get(id) || "Unknown"),
      }));

      setMovies(transformedMovies);
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch genres first, then movies
  useEffect(() => {
    fetchGenres();
  }, []);

  // Fetch movies when filters or search changes
  useEffect(() => {
    if (genreMap.size > 0) {
      fetchMovies();
    }
  }, [search, activeFilters, genreMap]);

  // Handle filter change
  const handleFilterChange = (filterType: "genres" | "years" | "ratings", value: string) => {
    setActiveFilters((prev) => {
      const currentFilters = [...prev[filterType]];
      const valueIndex = currentFilters.indexOf(value);

      if (valueIndex === -1) {
        currentFilters.push(value);
      } else {
        currentFilters.splice(valueIndex, 1);
      }

      return {
        ...prev,
        [filterType]: currentFilters,
      };
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Movies</h1>
          <button
            onClick={() => setIsLoading(!isLoading)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            <SlidersHorizontal size={20} />
            Filters
          </button>
        </div>

        <FilterChips filters={filters} activeFilters={activeFilters} onFilterChange={handleFilterChange} />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {movies.length > 0 ? (
            movies.map((movie) => (
              <MovieCard
                key={movie.id}
                id={movie.id}
                title={movie.title}
                rating={movie.rating}
                image={movie.image}
                year={movie.year}
                genres={movie.genre}
                user={user}
              />
            ))
          ) : (
            <p className="text-center text-gray-400 col-span-full">No movies found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieList;
