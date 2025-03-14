import React, { useState, useCallback, useRef, useEffect } from "react";
import { Search, X, Loader2, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Interfaces
export interface Movie {
    id: number;
    title: string;
    release_date: string;
    poster_path: string | null;
}

export interface Person {
    id: number;
    name: string;
    profile_path: string | null;
}

export interface Genre {
    id: number;
    name: string;
}

export interface SearchResults {
    movies: Movie[];
    people: Person[];
    loading: boolean;
}

interface MovieResponse {
    results: Movie[];
}

interface PersonResponse {
    results: Person[];
}

// TMDB Constants
const TMDB_API_KEY = "20aa58687a91f16d5c3fecf68b8e7dc1";
const TMDB_IMG_BASE = "https://image.tmdb.org/t/p/w92";
const RESULTS_PER_PAGE = 2;
const YEAR_OPTIONS = Array.from({ length: 2025 - 1995 + 1 }, (_, i) => 1995 + i);

const SearchBox: React.FC = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [selectedYear, setSelectedYear] = useState<string | null>(null);
    const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [showAllMovies, setShowAllMovies] = useState(false);
    const [showAllPeople, setShowAllPeople] = useState(false);
    const [showYearDropdown, setShowYearDropdown] = useState(false);
    const [showGenreDropdown, setShowGenreDropdown] = useState(false);
    const [results, setResults] = useState<SearchResults>({
        movies: [],
        people: [],
        loading: false,
    });
    const searchTimeout = useRef<number | null>(null);

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const response = await fetch(
                    `https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}`
                );
                const data = await response.json();
                setGenres(data.genres);
            } catch (error) {
                console.error("Error fetching genres:", error);
            }
        };
        fetchGenres();
    }, []);

    const handleCloseSearch = () => {
        setIsOpen(false);
        setQuery("");
        setSelectedYear(null);
        setSelectedGenres([]);
        setResults({ movies: [], people: [], loading: false });
        setShowAllMovies(false);
        setShowAllPeople(false);
    };

    const searchTMDB = useCallback(async () => {
        const hasQuery = query.trim() !== "";
        const hasFilters = selectedGenres.length > 0 || selectedYear !== null;

        if (!hasQuery && !hasFilters) {
            setResults({ movies: [], people: [], loading: false });
            return;
        }

        setResults((prev) => ({ ...prev, loading: true }));

        try {
            const commonParams = {
                api_key: TMDB_API_KEY,
                include_adult: "false",
            };

            let moviesData: MovieResponse = { results: [] };
            let peopleData: PersonResponse = { results: [] };

            // Actor search with filters
            if (hasQuery && hasFilters) {
                // First search for people
                const peopleParams = new URLSearchParams({
                    ...commonParams,
                    query: query.trim(),
                });
                const peopleUrl = `https://api.themoviedb.org/3/search/person?${peopleParams}`;
                const peopleResponse = await fetch(peopleUrl);
                peopleData = await peopleResponse.json() as PersonResponse;

                // If people found, search their movies with filters
                if (peopleData.results.length > 0) {
                    const actorId = peopleData.results[0].id;
                    const movieParams = new URLSearchParams(commonParams);
                    movieParams.append('with_cast', actorId.toString());
                    if (selectedGenres.length > 0) {
                        movieParams.append('with_genres', selectedGenres.join(','));
                    }
                    if (selectedYear) {
                        movieParams.append('primary_release_year', selectedYear);
                    }
                    const movieUrl = `https://api.themoviedb.org/3/discover/movie?${movieParams}`;
                    const moviesResponse = await fetch(movieUrl);
                    moviesData = await moviesResponse.json() as MovieResponse;
                }
            }
            // Regular filtered search
            else if (hasFilters) {
                const movieParams = new URLSearchParams(commonParams);
                if (selectedGenres.length > 0) {
                    movieParams.append('with_genres', selectedGenres.join(','));
                }
                if (selectedYear) {
                    movieParams.append('primary_release_year', selectedYear);
                }
                const movieUrl = `https://api.themoviedb.org/3/discover/movie?${movieParams}`;
                const moviesResponse = await fetch(movieUrl);
                moviesData = await moviesResponse.json() as MovieResponse;
            }
            // Regular search (no filters)
            else if (hasQuery) {
                const [moviesResponse, peopleResponse] = await Promise.all([
                    fetch(`https://api.themoviedb.org/3/search/movie?${new URLSearchParams({ ...commonParams, query: query.trim() })}`),
                    fetch(`https://api.themoviedb.org/3/search/person?${new URLSearchParams({ ...commonParams, query: query.trim() })}`),
                ]);
                moviesData = await moviesResponse.json() as MovieResponse;
                peopleData = await peopleResponse.json() as PersonResponse;
            }

            setResults({
                movies: moviesData.results || [],
                people: peopleData.results || [],
                loading: false,
            });
        } catch (error) {
            console.error("Search error:", error);
            setResults({ movies: [], people: [], loading: false });
        }
    }, [query, selectedYear, selectedGenres]);

    const handleSearch = useCallback(() => {
        if (searchTimeout.current) window.clearTimeout(searchTimeout.current);
        searchTimeout.current = window.setTimeout(searchTMDB, 500);
    }, [searchTMDB]);

    useEffect(() => {
        handleSearch();
        return () => {
            if (searchTimeout.current) window.clearTimeout(searchTimeout.current);
        };
    }, [handleSearch]);

    const handleYearSelect = (year: string) => {
        setSelectedYear((prev) => (prev === year ? null : year));
        setShowYearDropdown(false);
    };

    const handleGenreToggle = (genreId: number) => {
        setSelectedGenres((prev) =>
            prev.includes(genreId)
                ? prev.filter((id) => id !== genreId)
                : [...prev, genreId]
        );
    };

    const displayedMovies = showAllMovies
        ? results.movies
        : results.movies.slice(0, RESULTS_PER_PAGE);
    const displayedPeople = showAllPeople
        ? results.people
        : results.people.slice(0, RESULTS_PER_PAGE);

    // Theme styling
    const themeClasses = {
        searchButton: `flex items-center gap-1 p-2 md:p-1 border rounded-full transition-colors text-sm md:text-base border-gray-300 hover:bg-gray-100 text-gray-600`,
        modal: `fixed top-16 left-1/2 -translate-x-1/2 w-[90vw] max-w-xl rounded-lg shadow-xl border p-3 md:p-4 z-50 max-h-[70vh] flex flex-col bg-white border-gray-300 md:absolute md:top-full md:mt-2`,
        input: `w-full p-1 pl-10 border rounded-lg text-sm md:text-base bg-white border-gray-300 text-black`,
        dropdownButton: `w-full p-1 border rounded-lg text-left flex justify-between items-center transition-colors text-sm md:text-base border-gray-300 hover:bg-gray-100 text-gray-600`,
        dropdownContent: `absolute top-full left-0 w-full mt-1 border rounded-lg shadow-lg max-h-40 overflow-y-auto z-50 bg-white border-gray-300`,
        resultItem: `flex items-center gap-2 p-1 hover:bg-opacity-20 rounded-lg cursor-pointer transition-colors hover:bg-gray-100`,
        textPrimary: "text-black",
        textSecondary: "text-gray-500",
        icon: "text-gray-600",
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={themeClasses.searchButton}
            >
                <Search className="w-5 h-5 md:w-6 md:h-6" />
                <span className="hidden md:inline">movies,actors,year,genre</span>
            </button>

            {isOpen && (
                <div className={themeClasses.modal}>
                    <div className="flex justify-end items-center mb-2">
                        <button
                            onClick={handleCloseSearch}
                            className={`p-1 rounded-full hover:bg-opacity-20 hover:bg-black-200`}
                        >
                            <X className={`w-5 h-5 ${themeClasses.icon}`} />
                        </button>
                    </div>

                    <div className="space-y-3 flex-grow">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search movies or actors..."
                                value={query}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    setQuery(e.target.value)
                                }
                                className={themeClasses.input}
                            />
                            <Search
                                className={`absolute left-3 top-2.5 w-3 h-3 ${themeClasses.icon}`}
                            />
                        </div>

                        <div className="flex flex-col md:flex-row gap-2">
                            <div className="relative flex-1">
                                <button
                                    onClick={() => setShowYearDropdown(!showYearDropdown)}
                                    className={themeClasses.dropdownButton}
                                >
                                    <span>{selectedYear || "Select Year"}</span>
                                    <ChevronDown
                                        className={`w-4 h-4 transform transition-transform ${
                                            showYearDropdown ? "rotate-180" : ""
                                        } ${themeClasses.icon}`}
                                    />
                                </button>
                                {showYearDropdown && (
                                    <div className={themeClasses.dropdownContent}>
                                        {YEAR_OPTIONS.map((year) => (
                                            <button
                                                key={year}
                                                onClick={() => handleYearSelect(year.toString())}
                                                className={`w-full p-1 text-left hover:bg-opacity-20 text-sm ${
                                                    selectedYear === year.toString()
                                                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                                                        : "hover:bg-gray-100 text-gray-800"
                                                }`}
                                            >
                                                {year}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="relative flex-1">
                                <button
                                    onClick={() => setShowGenreDropdown(!showGenreDropdown)}
                                    className={themeClasses.dropdownButton}
                                >
                                    <span>
                                        {selectedGenres.length === 0
                                            ? "Select Genres"
                                            : `${selectedGenres.length} selected`}
                                    </span>
                                    <ChevronDown
                                        className={`w-4 h-4 transform transition-transform ${
                                            showGenreDropdown ? "rotate-180" : ""
                                        } ${themeClasses.icon}`}
                                    />
                                </button>
                                {showGenreDropdown && (
                                    <div className={themeClasses.dropdownContent}>
                                        {genres.map((genre) => (
                                            <label
                                                key={genre.id}
                                                className={`flex items-center p-1 hover:bg-opacity-20 cursor-pointer text-sm hover:bg-gray-100`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedGenres.includes(genre.id)}
                                                    onChange={() => handleGenreToggle(genre.id)}
                                                    className="mr-2 accent-blue-500"
                                                />
                                                <span className={themeClasses.textPrimary}>
                                                    {genre.name}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {results.loading ? (
                        <div className="flex justify-center items-center py-4">
                            <Loader2 className={`w-5 h-5 animate-spin ${themeClasses.icon}`} />
                        </div>
                    ) : (
                        <div className="mt-3 flex-1 overflow-y-auto">
                            <div className="flex flex-col md:flex-row gap-4">
                                {results.movies.length > 0 && (
                                    <div className="flex-1 min-w-[200px]">
                                        <h3
                                            className={`text-sm font-semibold mb-2 sticky top-0 py-0 text-gray-600 bg-white`}
                                        >
                                            Movies ({results.movies.length})
                                        </h3>
                                        <div className="space-y-0">
                                            {displayedMovies.map((movie) => (
                                                <div
                                                    key={movie.id}
                                                    className={themeClasses.resultItem}
                                                    onClick={() => {
                                                        navigate(`/movie/${movie.id}`);
                                                        handleCloseSearch();
                                                    }}
                                                >
                                                    {movie.poster_path ? (
                                                        <img
                                                            src={`${TMDB_IMG_BASE}${movie.poster_path}`}
                                                            alt={movie.title}
                                                            className="w-10 h-12 object-cover rounded"
                                                        />
                                                    ) : (
                                                        <div
                                                            className={`w-10 h-14 rounded flex items-center justify-center bg-gray-200`}
                                                        >
                                                            <Search
                                                                className={`w-5 h-5 ${themeClasses.icon}`}
                                                            />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p
                                                            className={`font-medium text-sm ${themeClasses.textPrimary}`}
                                                        >
                                                            {movie.title}
                                                        </p>
                                                        <p
                                                            className={`text-xs ${themeClasses.textSecondary}`}
                                                        >
                                                            {movie.release_date?.split("-")[0] || "N/A"}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                            {results.movies.length > RESULTS_PER_PAGE && (
                                                <button
                                                    onClick={() => setShowAllMovies(!showAllMovies)}
                                                    className={`w-full text-xs md:text-sm text-blue-400 hover:text-blue-300 py-1 flex items-center justify-center gap-1 ${themeClasses.textSecondary}`}
                                                >
                                                    {showAllMovies ? "Show Less" : "Show More"}
                                                    <ChevronDown
                                                        className={`w-3 h-3 md:w-4 md:h-4 transform transition-transform ${
                                                            showAllMovies ? "rotate-180" : ""
                                                        }`}
                                                    />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {results.people.length > 0 && (
                                    <div className="flex-1 min-w-[200px]">
                                        <h3
                                            className={`text-sm font-semibold mb-2 sticky top-0 py-1 text-gray-600 bg-white`}
                                        >
                                            People ({results.people.length})
                                        </h3>
                                        <div className="space-y-0">
                                            {displayedPeople.map((person) => (
                                                <div
                                                    key={person.id}
                                                    className={themeClasses.resultItem}
                                                    onClick={() => {
                                                        navigate(`/actor/${person.id}`);
                                                        handleCloseSearch();
                                                    }}
                                                >
                                                    {person.profile_path ? (
                                                        <img
                                                            src={`${TMDB_IMG_BASE}${person.profile_path}`}
                                                            alt={person.name}
                                                            className="w-10 h-10 object-cover rounded-full"
                                                        />
                                                    ) : (
                                                        <div
                                                            className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-200`}
                                                        >
                                                            <Search
                                                                className={`w-5 h-5 ${themeClasses.icon}`}
                                                            />
                                                        </div>
                                                    )}
                                                    <p
                                                        className={`font-medium text-sm ${themeClasses.textPrimary}`}
                                                    >
                                                        {person.name}
                                                    </p>
                                                </div>
                                            ))}
                                            {results.people.length > RESULTS_PER_PAGE && (
                                                <button
                                                    onClick={() => setShowAllPeople(!showAllPeople)}
                                                    className={`w-full text-xs md:text-sm text-blue-400 hover:text-blue-300 py-1 flex items-center justify-center gap-1 ${themeClasses.textSecondary}`}
                                                >
                                                    {showAllPeople ? "Show Less" : "Show More"}
                                                    <ChevronDown
                                                        className={`w-3 h-3 md:w-4 md:h-4 transform transition-transform ${
                                                            showAllPeople ? "rotate-180" : ""
                                                        }`}
                                                    />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {!results.loading &&
                                results.movies.length === 0 &&
                                results.people.length === 0 && (
                                    <div className={`text-center py-4 ${themeClasses.textSecondary}`}>
                                        <Search className="w-5 h-5 mx-auto mb-2" />
                                        <p className="text-sm">No results found</p>
                                    </div>
                                )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBox;