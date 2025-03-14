import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext.tsx';

interface FavoriteActor {
  id: string;
  name: string;
  profile_path: string;
}

interface FavoriteActorsContextType {
  favoriteActors: FavoriteActor[];
  addFavoriteActor: (actor: FavoriteActor) => void;
  removeFavoriteActor: (actorId: string) => void;
  isFavorite: (actorId: string) => boolean;
}

const FavoriteActorsContext = createContext<FavoriteActorsContextType | undefined>(undefined);

export const FavoriteActorsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [favoriteActors, setFavoriteActors] = useState<FavoriteActor[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  // Load favorites when user changes
  useEffect(() => {
    const loadFavorites = () => {
      setIsLoading(true);
      if (user?.id) { // Ensure user.id exists
        try {
          const saved = localStorage.getItem(`favoriteActors_${user.id}`);
          setFavoriteActors(saved ? JSON.parse(saved) : []);
        } catch (error) {
          console.error('Error parsing favorites:', error);
          setFavoriteActors([]);
        }
      } else {
        setFavoriteActors([]); // Clear if no user
      }
      setIsLoading(false);
    };

    loadFavorites();
  }, [user?.id]); // Watch user.id specifically

  // Save favorites when they change
  useEffect(() => {
    if (user?.id && !isLoading) { // Prevent initial empty save
      localStorage.setItem(`favoriteActors_${user.id}`, JSON.stringify(favoriteActors));
    }
  }, [favoriteActors, user?.id, isLoading]);

  const addFavoriteActor = (actor: FavoriteActor) => {
    if (!user) {
      alert('Please log in to add favorite actors');
      return;
    }
    setFavoriteActors((prev) => [...prev, actor]);
  };

  const removeFavoriteActor = (actorId: string) => {
    if (!user) {
      alert('Please log in to remove favorite actors');
      return;
    }
    setFavoriteActors((prev) => prev.filter((actor) => actor.id !== actorId));
  };

  const isFavorite = (actorId: string) => {
    return favoriteActors.some((actor) => actor.id === actorId);
  };

  return (
    <FavoriteActorsContext.Provider value={{ favoriteActors, addFavoriteActor, removeFavoriteActor, isFavorite }}>
      {children}
    </FavoriteActorsContext.Provider>
  );
};

export const useFavoriteActors = () => {
  const context = useContext(FavoriteActorsContext);
  if (context === undefined) {
    throw new Error('useFavoriteActors must be used within a FavoriteActorsProvider');
  }
  return context;
};