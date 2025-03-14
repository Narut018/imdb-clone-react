import "./App.css";
import Navbar from "./components/Navbar.tsx";
import MovieCard from './components/MovieCard.tsx';
import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom";
import Home from "./Pages/Home.tsx";
import MovieList from "./Pages/MovieList.tsx";
import MovieDetails from "./Pages/MovieDetails.tsx";
import ActorList from "./Pages/ActorList.tsx";
import Toprated from "./Pages/Toprated.jsx";
import Actordetails from "./Pages/Actordetails.tsx";
import { WatchlistProvider } from "./context/WatchlistContext.tsx";
import { RatingProvider } from "./context/RatingContext.tsx";
import Watchlist from "./Pages/Watchlist.tsx";
import { FavoriteActorsProvider } from './context/FavoriteActorsContext.tsx';
import FavoriteActors from "./Pages/FavoriteActors.tsx";
import TrendingMovies from "./Pages/TrendingMovies.tsx";
import UpcomingMovies from "./Pages/UpcomingMovies.tsx";
import { getTrending } from './services/tmdbApi.ts';
import React, { useState, useEffect } from 'react';
import { TrendingUp } from "lucide-react";
import { UserPreferencesProvider } from './context/UserPreferencesContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';

function App() {
  const [trendingItems, setTrendingItems] = useState([]);

  useEffect(() => {
    const fetchTrending = async () => {
      const items = await getTrending();
      setTrendingItems(items);
    };
    fetchTrending();
  }, []);

  return (
    <HashRouter>
      <AuthProvider>
        <UserPreferencesProvider>
          <WatchlistProvider>
            <RatingProvider>
              <FavoriteActorsProvider>
                <div className="min-h-screen bg-black text-white">
                  <Navbar />
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/movies" element={<MovieList />} />
                    <Route path="/movie/:id" element={<MovieDetails />} />
                    <Route path="/actors" element={<ActorList />} />
                    <Route path="/actor/:id" element={<Actordetails />} />
                    <Route path="/watchlist" element={<Watchlist />} />
                    <Route path="/favorite-actors" element={<FavoriteActors />} />
                    <Route path="/top-rated" element={<Toprated />} />
                    <Route path="/trending" element={<TrendingMovies trendingItems={trendingItems} />} />
                    <Route path="/coming-soon" element={<UpcomingMovies />} />
                  </Routes>
                </div>
              </FavoriteActorsProvider>
            </RatingProvider>
          </WatchlistProvider>
        </UserPreferencesProvider>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
