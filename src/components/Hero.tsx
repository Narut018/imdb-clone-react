import React, { useState, useEffect } from "react";
import { Play, Star, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

interface Movie {
  id: number;
  title: string;
  vote_average: number;
  release_date: string;
  overview: string;
  backdrop_path: string;
  trailer_key?: string;
}

const Hero = () => {
  const [currentMovie, setCurrentMovie] = useState(0);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/trending/movie/week?api_key=${process.env.REACT_APP_TMDB_API_KEY}`
        );
        const data = await response.json();
        const moviesWithTrailers = await Promise.all(
          data.results.slice(0, 5).map(async (movie: Movie) => {
            const trailerResponse = await fetch(
              `https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${process.env.REACT_APP_TMDB_API_KEY}`
            );
            const trailerData = await trailerResponse.json();
            const trailer = trailerData.results.find(
              (video: any) => video.type === "Trailer" && video.site === "YouTube"
            );
            return {
              ...movie,
              trailer_key: trailer?.key || null,
            };
          })
        );
        setMovies(moviesWithTrailers);
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    };

    fetchMovies();
  }, []);

  useEffect(() => {
    if (movies.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentMovie((prev) => (prev + 1) % movies.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [movies]);

  if (movies.length === 0) {
    return <div className="h-[90vh] bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
    </div>;
  }

  const movie = movies[currentMovie];
  const imageUrl = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
  const formattedDate = new Date(movie.release_date).toLocaleDateString('en-US', { 
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="relative h-[90vh] bg-gradient-to-b from-transparent to-zinc-900">
      {showTrailer && movie.trailer_key ? (
        <div className="absolute inset-0 bg-zinc-900 z-50">
          <button
            onClick={() => setShowTrailer(false)}
            className="absolute top-4 right-4 text-white bg-zinc-800/50 p-2 rounded-full hover:bg-zinc-800/70 z-50"
          >
            Close
          </button>
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${movie.trailer_key}?autoplay=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      ) : (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000 gradient-mask"
            style={{
              backgroundImage: `url('${imageUrl}')`,
            }}
          >
            <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" />
          </div>

          <div className="relative container mx-auto px-4 h-full flex items-center">
            <div className="flex items-center w-full">
              <div className="max-w-2xl bg-zinc-900/30 backdrop-blur-md p-8 rounded-2xl border border-zinc-800 shadow-2xl relative flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2 bg-zinc-800/50 backdrop-blur-md px-3 py-1.5 rounded-full">
                    <Star className="w-5 h-5 text-emerald-500 fill-current" />
                    <span className="text-emerald-400 font-semibold">
                      {movie.vote_average.toFixed(1)} Rating
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-zinc-800/50 backdrop-blur-md px-3 py-1.5 rounded-full">
                    <Calendar className="w-5 h-5 text-indigo-400" />
                    <span className="text-indigo-300">{formattedDate}</span>
                  </div>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold mb-4 text-glow text-white">
                  {movie.title}
                </h1>
                <p className="text-zinc-300 text-lg mb-8 line-clamp-3 max-w-xl">
                  {movie.overview}
                </p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => movie.trailer_key && setShowTrailer(true)}
                    className={`${
                      movie.trailer_key
                        ? "bg-emerald-500 hover:bg-emerald-400"
                        : "bg-zinc-500 cursor-not-allowed"
                    } text-black px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all hover:scale-105 duration-300`}
                    disabled={!movie.trailer_key}
                  >
                    <Play className="w-5 h-5" />
                    Watch Trailer
                  </button>
                  <Link
                    to={`/movie/${movie.id}`}
                    className="bg-zinc-800/70 backdrop-blur-md text-white px-8 py-3 rounded-xl font-semibold hover:bg-zinc-700 transition-all hover:scale-105 duration-300"
                  >
                    More Info
                  </Link>
                </div>
              </div>
              
              {/* Movie navigation dots moved to the side */}
              <div className="flex flex-col items-center gap-3 ml-4">
                {movies.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentMovie(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      currentMovie === index ? "bg-emerald-500 scale-125" : "bg-zinc-600"
                    }`}
                    aria-label={`Switch to movie ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Hero;
