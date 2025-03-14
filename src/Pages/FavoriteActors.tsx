import React from 'react';
import { Link } from 'react-router-dom';
import { useFavoriteActors } from '../context/FavoriteActorsContext.tsx';
import '../styles/FavoriteActors.css';

const FavoriteActors: React.FC = () => {
  const { favoriteActors } = useFavoriteActors();

  // Wrap the content with a container that has a minimum screen height and top padding
  // to ensure the fixed navbar doesn't overlap the content.
  if (favoriteActors.length === 0) {
    return (
      <div className="min-h-screen pt-20">
        <div className="favorite-actors-empty">
          <h2>No Favorite Actors Yet</h2>
          <p>
            Start exploring actors and click the heart icon to add them to your favorites!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="favorite-actors-container">
        <h2>My Favorite Actors</h2>
        <div className="favorite-actors-grid">
          {favoriteActors.map((actor) => (
            <Link to={`/actor/${actor.id}`} key={actor.id} className="favorite-actor-card">
              <img
                src={`https://image.tmdb.org/t/p/w300${actor.profile_path}`}
                alt={actor.name}
                className="favorite-actor-image"
              />
              <h3 className="favorite-actor-name">{actor.name}</h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FavoriteActors;
