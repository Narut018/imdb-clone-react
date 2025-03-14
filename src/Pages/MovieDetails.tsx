import {
  Award,
  BarChart3,
  Calendar,
  Clock,
  DollarSign,
  Globe,
  Heart,
  Play,
  Share2,
  Star,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useRating } from "../../src/context/RatingContext.tsx";
import { useAuth } from "../../src/context/AuthContext.tsx";
import { useWatchlist } from "../../src/context/WatchlistContext.tsx";
import StarRating from "../../src/components/StarRating.tsx";
import toast from 'react-hot-toast';

const TMDB_API_KEY = "20aa58687a91f16d5c3fecf68b8e7dc1";
const BASE_IMAGE_URL = "https://image.tmdb.org/t/p/original";

interface MovieDetailsType {
  id: number;
  title: string;
  rating: number;
  vote_average: number;
  release_date: string;
  runtime: number;
  genres: { id: number; name: string }[];
  overview: string;
  poster_path: string;
  backdrop_path: string;
  credits: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string;
      biography: string;
    }[];
    crew: {
      id: number;
      name: string;
      job: string;
    }[];
  };
  videos: {
    results: {
      key: string;
      type: string;
    }[];
  };
  production_companies: {
    id: number;
    name: string;
  }[];
  budget: number;
  revenue: number;
  vote_count: number;
}

const MovieDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const { rateMovie, getUserRating, getAverageRating } = useRating();
  const userRating = getUserRating(id || "");
  const avgRating = getAverageRating(id || "");
  
  const [movie, setMovie] = useState<MovieDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch movie details');
        }
        const data = await response.json();
        setMovie(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMovieDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-500">{error || 'Movie not found'}</div>
      </div>
    );
  }

  const trailerVideo = movie.videos?.results.find(
    (video) => video.type === "Trailer"
  );
  const director = movie.credits.crew.find((person) => person.job === "Director");

  const isInWatchlist = movie ? watchlist.some(w => w.id === movie.id.toString()) : false;

  const handleAddToWatchlist = () => {
    if (!user) {
      toast.error('Please log in to add movies to your watchlist', {
        position: 'top-right',
        duration: 3000,
      });
      return;
    }
    if (movie) {
      if (isInWatchlist) {
        removeFromWatchlist(movie.id.toString());
      } else {
        addToWatchlist({
          id: movie.id.toString(),
          title: movie.title,
          rating: movie.vote_average,
          image: `${BASE_IMAGE_URL}${movie.poster_path}`,
          year: new Date(movie.release_date).getFullYear().toString(),
          genre: movie.genres.map(g => g.name)
        });
      }
    }
  };

  const handleRateMovie = (rating: number) => {
    if (!user) {
      toast.error('Please log in to rate movies', {
        position: 'top-right',
        duration: 3000,
      });
      return;
    }
    rateMovie(id || "", rating);
  };

  return (
    <div>
      <div className="relative h-[90vh]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${BASE_IMAGE_URL}${movie.backdrop_path || movie.poster_path})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80" />
        </div>

        <div className="relative container mx-auto px-4 h-full flex items-end pb-12">
          <div className="grid md:grid-cols-3 gap-8 items-end">
            <div className="hidden md:block">
              <img
                src={`${BASE_IMAGE_URL}${movie.poster_path}`}
                alt={movie.title}
                className="rounded-lg shadow-xl aspect-[2/3] object-cover"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="text-yellow-500 font-semibold">
                    {(movie.vote_average / 2).toFixed(1)} Rating
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">{movie.runtime} min</span>
                </div>
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">{movie.release_date}</span>
                </div>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                {movie.title}
              </h1>

              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-gray-800/80 backdrop-blur-sm rounded-full text-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-4">
                {trailerVideo && (
                  <a
                    href={`https://www.youtube.com/watch?v=${trailerVideo.key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-yellow-500 text-black px-8 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-yellow-400 transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    Watch Trailer
                  </a>
                )}
                {user ? (
                  <>
                    <button 
                      onClick={handleAddToWatchlist}
                      className={`bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md flex items-center gap-2 ${
                        isInWatchlist ? 'from-red-600 to-red-700 hover:from-red-700 hover:to-red-800' : ''
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        {isInWatchlist ? (
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        ) : (
                          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        )}
                      </svg>
                      {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                    </button>
                    <button className="bg-gray-800/80 backdrop-blur-sm text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <div className="text-gray-400 italic">
                    Please <Link to="/login" className="text-yellow-500 underline">login</Link> to add to watchlist
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 mt-6">
                <div className="flex flex-col items-start gap-2">
                  <div className="text-lg font-semibold">Your Rating</div>
                  {user ? (
                    <StarRating
                      initialRating={userRating}
                      onRate={handleRateMovie}
                    />
                  ) : (
                    <div className="text-gray-400 italic">
                      Please <Link to="/login" className="text-yellow-500 underline">login</Link> to rate this movie
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-start gap-2">
                  <div className="text-lg font-semibold">Average Rating</div>
                  <div className="flex items-center gap-2">
                    <StarRating
                      initialRating={avgRating}
                      readonly={true}
                      onRate={() => {}}
                    />
                    <span className="text-lg">({avgRating.toFixed(1)})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <main className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Overview</h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                {movie.overview}
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Movie Statistics</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span>Vote Count: {movie.vote_count}</span>
                </div>
                <div className="flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <span>Budget: ${(movie.budget / 1000000).toFixed(1)}M</span>
                </div>
                <div className="flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <span>Revenue: ${(movie.revenue / 1000000).toFixed(1)}M</span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-6">Top Cast</h2>
              <div className="grid grid-cols-2 gap-6">
                {movie.credits.cast.slice(0, 6).map((actor) => (
                  <Link
                    key={actor.id}
                    to={`/actor/${actor.id}`}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 hover:bg-gray-700/50 transition-colors flex gap-4"
                  >
                    <img
                      src={actor.profile_path ? `${BASE_IMAGE_URL}${actor.profile_path}` : `https://ui-avatars.com/api/?name=${actor.name}`}
                      alt={actor.name}
                      className="w-24 h-24 rounded-xl object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-lg mb-1">
                        {actor.name}
                      </h3>
                      <p className="text-gray-400 mb-2">{actor.character}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <div>
            <div className="sticky top-24 space-y-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
                <h3 className="font-semibold mb-4">Movie Info</h3>
                <dl className="space-y-4">
                  {director && (
                    <div>
                      <dt className="text-gray-400">Director</dt>
                      <dd>{director.name}</dd>
                    </div>
                  )}
                  {movie.production_companies.length > 0 && (
                    <div>
                      <dt className="text-gray-400">Production Company</dt>
                      <dd>{movie.production_companies[0].name}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-gray-400">Release Date</dt>
                    <dd>{new Date(movie.release_date).toLocaleDateString()}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-400">Runtime</dt>
                    <dd>{movie.runtime} minutes</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MovieDetails;
