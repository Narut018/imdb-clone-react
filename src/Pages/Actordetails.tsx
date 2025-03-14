import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useFavoriteActors } from '../context/FavoriteActorsContext.tsx';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import '../styles/ActorDetails.css';

interface Movie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string;
  character: string;
}

interface ActorDetails {
  name: string;
  profile_path: string;
  biography: string;
  birthday: string;
  place_of_birth: string;
  known_for_department: string;
  popularity: number;
}

const ActorDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [actor, setActor] = useState<ActorDetails | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const { addFavoriteActor, removeFavoriteActor, isFavorite } = useFavoriteActors();

  const handleFavoriteClick = () => {
    if (!actor) return;
    
    if (isFavorite(id!)) {
      removeFavoriteActor(id!);
    } else {
      addFavoriteActor({
        id: id!,
        name: actor.name,
        profile_path: actor.profile_path,
      });
    }
  };

  useEffect(() => {
    const fetchActorDetails = async () => {
      try {
        setLoading(true);
        // Fetch actor details
        const detailsResponse = await fetch(
          `https://api.themoviedb.org/3/person/${id}?api_key=20aa58687a91f16d5c3fecf68b8e7dc1`
        );
        
        if (!detailsResponse.ok) {
          throw new Error('Failed to fetch actor details');
        }
        
        const actorData = await detailsResponse.json();
        setActor(actorData);

        // Fetch actor's movies
        const creditsResponse = await fetch(
          `https://api.themoviedb.org/3/person/${id}/movie_credits?api_key=20aa58687a91f16d5c3fecf68b8e7dc1`
        );
        
        if (!creditsResponse.ok) {
          throw new Error('Failed to fetch actor credits');
        }
        
        const creditsData = await creditsResponse.json();
        setMovies(creditsData.cast
          .filter((movie: Movie) => movie.poster_path && movie.release_date)
          .sort((a: Movie, b: Movie) => {
            return new Date(b.release_date).getTime() - new Date(a.release_date).getTime();
          }));

        setLoading(false);
      } catch (error) {
        console.error('Error fetching actor details:', error);
        setLoading(false);
      }
    };

    if (id) {
      fetchActorDetails();
    }
  }, [id]);

  if (loading || !actor) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-zinc-800 rounded-lg overflow-hidden">
          <div className="md:flex">
            {/* Actor Image */}
            <div className="md:w-1/3">
              <img
                src={actor.profile_path 
                  ? `https://image.tmdb.org/t/p/w500${actor.profile_path}`
                  : 'https://via.placeholder.com/500x750?text=No+Image'}
                alt={actor.name}
                className="w-full h-auto"
              />
            </div>

            {/* Actor Info */}
            <div className="p-6 md:w-2/3">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold text-white">{actor.name}</h1>
                <button 
                  onClick={handleFavoriteClick}
                  className="p-2 hover:scale-110 transition-transform"
                  aria-label={isFavorite(id!) ? "Remove from favorites" : "Add to favorites"}
                >
                  {isFavorite(id!) ? (
                    <FaHeart className="text-red-500" size={24} />
                  ) : (
                    <FaRegHeart className="text-white" size={24} />
                  )}
                </button>
              </div>
              
              <div className="space-y-4 text-zinc-300">
                {actor.birthday && (
                  <p><span className="font-semibold">Born:</span> {new Date(actor.birthday).toLocaleDateString()}</p>
                )}
                {actor.place_of_birth && (
                  <p><span className="font-semibold">Place of Birth:</span> {actor.place_of_birth}</p>
                )}
                <p><span className="font-semibold">Known For:</span> {actor.known_for_department}</p>
                <p><span className="font-semibold">Popularity:</span> {actor.popularity.toFixed(1)}</p>
                
                {actor.biography && (
                  <div>
                    <h2 className="text-xl font-semibold text-white mt-6 mb-3">Biography</h2>
                    <p className="text-zinc-300 leading-relaxed">{actor.biography}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Filmography */}
          <div className="p-6 border-t border-zinc-700">
            <h2 className="text-2xl font-bold text-white mb-6">Filmography</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {movies.map((movie) => (
                <div 
                  key={`${movie.id}-${movie.character}`}
                  className="bg-zinc-700 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300"
                >
                  <img
                    src={movie.poster_path 
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                      : 'https://via.placeholder.com/500x750?text=No+Poster'}
                    alt={movie.title}
                    className="w-full h-auto"
                  />
                  <div className="p-3">
                    <h3 className="text-white font-semibold text-sm truncate">{movie.title}</h3>
                    <p className="text-zinc-400 text-xs mt-1">
                      {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                    </p>
                    {movie.character && (
                      <p className="text-zinc-400 text-xs mt-1 italic">as {movie.character}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActorDetails;
