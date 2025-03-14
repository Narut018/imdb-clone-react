import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaSearch } from 'react-icons/fa';
import { useFavoriteActors } from '../context/FavoriteActorsContext.tsx';

const TMDB_API_KEY = "20aa58687a91f16d5c3fecf68b8e7dc1";
const BASE_IMAGE_URL = "https://image.tmdb.org/t/p/w500";

interface Movie {
  id: number;
  title: string;
  character?: string;
}

interface Actor {
  id: number;
  name: string;
  profile_path: string;
  movies: Movie[];
  popularity: number;
  biography?: string;
}

export default function ActorList() {
  const [actors, setActors] = useState<Actor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const { addFavoriteActor, removeFavoriteActor, isFavorite } = useFavoriteActors();

  const fetchActors = async (page: number, query: string = '') => {
    setIsLoading(true);
    setError(null);
    try {
      // Determine which API endpoint to use based on whether there's a search query
      const baseUrl = query
        ? `https://api.themoviedb.org/3/search/person`
        : `https://api.themoviedb.org/3/person/popular`;
      
      const response = await fetch(
        `${baseUrl}?api_key=${TMDB_API_KEY}&language=en-US&page=${page}${query ? `&query=${encodeURIComponent(query)}` : ''}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch actors');
      }
      
      const data = await response.json();
      setTotalPages(data.total_pages);

      // For each actor, fetch their movie credits
      const actorsWithMovies = await Promise.all(
        data.results.map(async (actor: any) => {
          const creditsResponse = await fetch(
            `https://api.themoviedb.org/3/person/${actor.id}/movie_credits?api_key=${TMDB_API_KEY}&language=en-US`
          );
          
          if (!creditsResponse.ok) {
            return {
              id: actor.id,
              name: actor.name,
              profile_path: actor.profile_path,
              popularity: actor.popularity,
              movies: [],
            };
          }
          
          const creditsData = await creditsResponse.json();

          // Get the top 3 movies by popularity
          const topMovies = creditsData.cast
            ?.sort((a: any, b: any) => b.popularity - a.popularity)
            .slice(0, 3)
            .map((movie: any) => ({
              id: movie.id,
              title: movie.title,
              character: movie.character,
            })) || [];

          return {
            id: actor.id,
            name: actor.name,
            profile_path: actor.profile_path,
            popularity: actor.popularity,
            movies: topMovies,
          };
        })
      );

      setActors(actorsWithMovies);
    } catch (err) {
      setError('Failed to fetch actors. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchActors(1, searchQuery);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    if (!searchQuery) {
      fetchActors(currentPage);
    }
  }, [currentPage]);

  const handleFavoriteClick = (e: React.MouseEvent, actor: Actor) => {
    e.preventDefault();
    if (isFavorite(actor.id.toString())) {
      removeFavoriteActor(actor.id.toString());
    } else {
      addFavoriteActor({
        id: actor.id.toString(),
        name: actor.name,
        profile_path: actor.profile_path,
        movies: actor.movies.map(movie => movie.title),
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 p-8">
      <div className="container mx-auto">
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search actors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-800 text-white rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {actors.map((actor) => (
                <Link
                  key={actor.id}
                  to={`/actor/${actor.id}`}
                  className="bg-zinc-800 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-200 relative group"
                >
                  <div className="aspect-[2/3] relative">
                    {actor.profile_path ? (
                      <img
                        src={`${BASE_IMAGE_URL}${actor.profile_path}`}
                        alt={actor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-700 flex items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                    <button
                      onClick={(e) => handleFavoriteClick(e, actor)}
                      className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 transition-opacity"
                    >
                      {isFavorite(actor.id.toString()) ? (
                        <FaHeart className="text-red-500 w-5 h-5" />
                      ) : (
                        <FaRegHeart className="text-white w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">{actor.name}</h3>
                    {actor.movies.length > 0 && (
                      <div className="text-sm text-gray-400">
                        <p className="font-medium text-gray-300 mb-1">Known for:</p>
                        <ul>
                          {actor.movies.map((movie) => (
                            <li key={movie.id} className="truncate">
                              {movie.title}
                              {movie.character && ` as ${movie.character}`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-zinc-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700"
                >
                  Previous
                </button>
                <span className="text-white">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-zinc-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}