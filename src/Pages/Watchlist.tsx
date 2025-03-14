import React from "react";
import { useWatchlist } from "../context/WatchlistContext.tsx";

const Watchlist = () => {
  const { watchlist, removeFromWatchlist } = useWatchlist();

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white container mx-auto p-4">
      <h2 className="text-3xl font-bold text-center mb-6">Your Watchlist</h2>

      {watchlist.length === 0 ? (
        <p className="text-center text-gray-500">No movies in your watchlist.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {watchlist.map((movie) => (
            <div key={movie.id} className="bg-gray-800 rounded-lg shadow-lg p-4">
              {/* Ensure container fully matches the image size */}
              <div className="w-full aspect-[2/3] overflow-hidden rounded-lg">
                <img
                  className="w-full h-full object-cover"
                  src={movie.image}
                  alt={movie.title}
                  loading="lazy"
                />
              </div>
              <h3 className="text-lg font-semibold text-white mt-3">{movie.title}</h3>
              <button
                onClick={() => removeFromWatchlist(movie.id)}
                className="mt-3 w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Remove from Watchlist
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;
