import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

const TMDB_API_KEY = "20aa58687a91f16d5c3fecf68b8e7dc1";
const BASE_IMAGE_URL = "https://image.tmdb.org/t/p/w500";

interface Movie {
  id: number;
  title: string;
  rating: number;
  image: string;
  year: number;
  overview: string;
  release_date: string;
}

const UpcomingMovies = () => {
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingMovies = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/upcoming?api_key=${TMDB_API_KEY}`
        );
        const data = await response.json();

        const transformedMovies = data.results.map((movie: any) => ({
          id: movie.id,
          title: movie.title,
          rating: movie.vote_average,
          image: movie.poster_path ? `${BASE_IMAGE_URL}${movie.poster_path}` : "",
          year: new Date(movie.release_date).getFullYear(),
          overview: movie.overview,
          release_date: movie.release_date,
        }));

        setUpcomingMovies(transformedMovies);
      } catch (error) {
        console.error("Error fetching upcoming movies:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpcomingMovies();
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-8">
        <Clock className="w-8 h-8 text-yellow-500" />
        <h1 className="text-3xl font-bold">Upcoming Movies</h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {upcomingMovies.map((movie) => (
          <div key={movie.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform">
            <img
              src={movie.image || "/placeholder-movie.jpg"}
              alt={movie.title}
              className="w-full h-[400px] object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{movie.title}</h3>
              <div className="flex justify-between items-center text-sm text-gray-400 mb-2">
                <span>Release: {movie.release_date}</span>
                <span>Rating: {movie.rating.toFixed(1)}</span>
              </div>
              <p className="text-sm text-gray-400 line-clamp-3">{movie.overview}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingMovies;
