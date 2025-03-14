import React from "react";
import { Star } from "lucide-react";
import { useWatchlist } from "../../src/context/WatchlistContext.tsx";
import { useRating } from "../../src/context/RatingContext.tsx";
import { useAuth } from "../../src/context/AuthContext.tsx";
import StarRating from "../../src/components/StarRating.tsx";
import { Link } from "react-router-dom";
import { toast } from 'react-hot-toast';

interface MovieProps {
  id: string | number;
  title: string;
  rating?: number;
  image: string;
  year: string | number;
  genre?: string[];
  genres?: string[];
  genre_ids?: number[];
  user?: any;
}

const MovieCard: React.FC<MovieProps> = ({ 
  id, 
  title, 
  rating, 
  image, 
  year, 
  genre, 
  genres, 
  user = null 
}) => {
  const { user: contextUser } = useAuth();
  const currentUser = user || contextUser;
  
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const { rateMovie, getUserRating, getAverageRating } = useRating();
  
  const isInWatchlist = watchlist.some((movie) => String(movie.id) === String(id));
  const userRating = getUserRating(String(id));
  const avgRating = getAverageRating(String(id));

  // Use genres prop if available, fallback to genre prop
  const movieGenres = genres || genre || [];

  const handleRatingChange = (newRating: number) => {
    if (!currentUser) {
      toast.error('Please log in to rate movies', {
        position: 'top-right',
        duration: 3000,
      });
      return;
    }
    rateMovie(String(id), newRating);
  };

  const handleWatchlistToggle = () => {
    if (!currentUser) {
      toast.error('Please log in to manage watchlist', {
        position: 'top-right',
        duration: 3000,
      });
      return;
    }
    
    isInWatchlist
      ? removeFromWatchlist(id.toString())
      : addToWatchlist({
          id: id.toString(),
          title,
          rating,
          image,
          year: String(year),
          genre: movieGenres.slice(0, 2),
        });
  };

  return (
    <div className="bg-zinc-900/50 rounded-xl overflow-hidden movie-card-hover backdrop-blur-sm">
      {/* Movie Poster Clickable, But Not Buttons */}
      <div className="relative aspect-[2/3] group">
        <a href={`/movie/${id}`} className="block w-full h-full">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover hover-glow"
          />
        </a>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 p-4 w-full flex flex-col gap-2">
            {/* Star Rating - Only for logged-in users */}
            {currentUser && (
              <div className="flex flex-col items-center gap-1 mb-2">
                <div className="flex items-center space-x-1">
                  <StarRating
                    initialRating={userRating}
                    onRate={(rating, e) => {
                      e?.preventDefault(); // Prevent navigation
                      e?.stopPropagation(); // Stop event propagation
                      handleRatingChange(rating);
                    }}
                    size={24}
                    className="hover:scale-110 transition-transform"
                  />
                </div>
                {avgRating > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-white">Your Rating: {userRating || '-'}</span>
                    <span className="text-sm text-zinc-400">|</span>
                    <span className="text-sm text-white">Avg: {avgRating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <Link to={`/movie/${id}`} className="w-full">
                <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  View Details
                </button>
              </Link>

              {/* Watchlist Button - Only for logged-in users */}
              {currentUser && (
                <button
                  onClick={(e) => {
                    e.preventDefault(); // Prevent any default navigation
                    e.stopPropagation(); // Stop event from propagating
                    handleWatchlistToggle();
                  }}
                  className={`w-full py-2 rounded-lg font-semibold text-white transition-all duration-300 ease-in-out transform hover:scale-105 ${
                    isInWatchlist
                      ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-md"
                      : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-md"
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    {isInWatchlist ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    )}
                    {isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Rating Badge */}
        {rating !== undefined && (
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-yellow-500 font-medium">{rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Movie Info Section */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg truncate text-glow">{title}</h3>
          <span className="text-zinc-400 text-sm">{year}</span>
        </div>
        {movieGenres && movieGenres.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {movieGenres.slice(0, 2).map((g, index) => (
              <span
                key={index}
                className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded"
              >
                {g}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieCard;
