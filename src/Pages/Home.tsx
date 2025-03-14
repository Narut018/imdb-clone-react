import React, { useState, useMemo, useEffect } from "react";
import Hero from "../components/Hero.tsx";
import { Film, Clapperboard, VideoIcon, Trophy, TrendingUp, Star, Clock, Award } from "lucide-react";
import { Link } from "react-router-dom";
import MovieCarousel from "../components/MovieCarousel.tsx";
import FilterChips from "../components/FilterChips.tsx";
import Recommendations from "../components/Recommendations.tsx";

const TMDB_API_KEY = "20aa58687a91f16d5c3fecf68b8e7dc1";
const BASE_IMAGE_URL = "https://image.tmdb.org/t/p/w500";

interface Movie {
  id: number;
  title: string;
  rating: number;
  image: string;
  year: number;
  genre_ids: number[];
  genres: string[];
}

interface Genre {
  id: number;
  name: string;
}

const Home = () => {
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    return genreIds.map(id => {
      const genre = genres.find(g => g.id === id);
      return genre ? genre.name : '';
    }).filter(name => name !== '');
  };

  const fetchMovies = async () => {
    try {
      // Fetch trending movies
      const trendingResponse = await fetch(
        `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}`
      );
      const trendingData = await trendingResponse.json();

      // Fetch upcoming movies
      const upcomingResponse = await fetch(
        `https://api.themoviedb.org/3/movie/upcoming?api_key=${TMDB_API_KEY}`
      );
      const upcomingData = await upcomingResponse.json();

      // Transform trending movies data
      const transformedTrending = trendingData.results.slice(0, 5).map((movie: any) => ({
        id: movie.id,
        title: movie.title,
        rating: movie.vote_average,
        image: `${BASE_IMAGE_URL}${movie.poster_path}`,
        year: new Date(movie.release_date).getFullYear(),
        genre_ids: movie.genre_ids,
        genres: getGenreNames(movie.genre_ids)
      }));

      // Transform upcoming movies data
      const transformedUpcoming = upcomingData.results.slice(0, 4).map((movie: any) => ({
        id: movie.id,
        title: movie.title,
        rating: movie.vote_average,
        image: `${BASE_IMAGE_URL}${movie.poster_path}`,
        year: new Date(movie.release_date).getFullYear(),
        genre_ids: movie.genre_ids,
        genres: getGenreNames(movie.genre_ids)
      }));

      setTrendingMovies(transformedTrending);
      setUpcomingMovies(transformedUpcoming);
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
      fetchMovies();
    }
  }, [genres]);

  // Get unique filters from movies
  const allMovies = [...trendingMovies, ...upcomingMovies];
  const filters = useMemo(() => ({
    genres: Array.from(new Set(genres.map(genre => genre.name))).sort(),
    years: Array.from(new Set(allMovies.map(movie => movie.year))).sort(),
    ratings: ['7.0+', '8.0+', '9.0+']
  }), [allMovies, genres]);

  // State for active filters
  const [activeFilters, setActiveFilters] = useState<{
    genres: string[];
    years: number[];
    ratings: string[];
  }>({
    genres: [],
    years: [],
    ratings: []
  });

  // Filter movies based on active filters
  const filteredTrendingMovies = useMemo(() => {
    return trendingMovies.filter(movie => {
      const matchesGenre = activeFilters.genres.length === 0 || 
        movie.genres.some(g => activeFilters.genres.includes(g));
      const matchesYear = activeFilters.years.length === 0 || 
        activeFilters.years.includes(movie.year);
      const matchesRating = activeFilters.ratings.length === 0 || 
        activeFilters.ratings.some(r => {
          const minRating = parseFloat(r.replace('+', ''));
          return movie.rating >= minRating;
        });
      return matchesGenre && matchesYear && matchesRating;
    });
  }, [trendingMovies, activeFilters]);

  const filteredUpcomingMovies = useMemo(() => {
    return upcomingMovies.filter(movie => {
      const matchesGenre = activeFilters.genres.length === 0 || 
        movie.genres.some(g => activeFilters.genres.includes(g));
      const matchesYear = activeFilters.years.length === 0 || 
        activeFilters.years.includes(movie.year);
      const matchesRating = activeFilters.ratings.length === 0 || 
        activeFilters.ratings.some(r => {
          const minRating = parseFloat(r.replace('+', ''));
          return movie.rating >= minRating;
        });
      return matchesGenre && matchesYear && matchesRating;
    });
  }, [upcomingMovies, activeFilters]);

  // Handle filter changes
  const handleFilterChange = (filterType: 'genres' | 'years' | 'ratings', value: string | number) => {
    setActiveFilters(prev => {
      const currentFilters = prev[filterType] as any[];
      const newFilters = currentFilters.includes(value)
        ? currentFilters.filter(f => f !== value)
        : [...currentFilters, value];
      return {
        ...prev,
        [filterType]: newFilters
      };
    });
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <Hero />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            {
              icon: Film,
              label: "Trending",
              path: "/trending",
              color: "bg-emerald-500",
            },
            {
              icon: Clapperboard,
              label: "Top Rated",
              path: "/top-rated",
              color: "bg-indigo-500",
            },
            {
              icon: VideoIcon,
              label: "Coming Soon",
              path: "/coming-soon",
              color: "bg-rose-500",
            },
            {
              icon: Trophy,
              label: "Awards",
              path: "/awards",
              color: "bg-amber-500",
            },
          ].map((category, index) => (
            <Link
              key={index}
              to={category.path}
              className={`${category.color} p-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-70 transition-opacity`}
            >
              <category.icon className="w-5 h-5" />
              <span className="font-medium">{category.label}</span>
            </Link>
          ))}
        </div>
       
               <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-yellow-500" />
              Trending Now
            </h2>
            <Link to="/trending" className="text-yellow-500 hover:text-yellow-400">
              View All
            </Link>
          </div>
          <MovieCarousel movies={filteredTrendingMovies}/>
        </section>
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Clock className="w-6 h-6 text-yellow-500" />
              Coming Soon
            </h2>
            <Link to="/coming-soon" className="text-yellow-500 hover:text-yellow-400">
              View All
            </Link>
          </div>
          <MovieCarousel movies={filteredUpcomingMovies} />
          <Recommendations />
        </section>
      </main>
    </div>
  );
};

export default Home;
