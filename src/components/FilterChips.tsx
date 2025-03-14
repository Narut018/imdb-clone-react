import React from 'react';
import { Filter, X } from 'lucide-react';

interface FilterChipsProps {
  filters: {
    genres: string[];
    years: string[]; // Change from number[] to string[] for year ranges
    ratings: string[];
  };
  activeFilters: {
    genres: string[];
    years: string[];
    ratings: string[];
  };
  onFilterChange: (filterType: 'genres' | 'years' | 'ratings', value: string) => void;
}

const FilterChips: React.FC<FilterChipsProps> = ({ filters, activeFilters, onFilterChange }) => {
  // Function to clear all filters
  const clearAllFilters = () => {
    ['genres', 'years', 'ratings'].forEach(filterType => {
      activeFilters[filterType as keyof typeof activeFilters].forEach(value => {
        onFilterChange(filterType as 'genres' | 'years' | 'ratings', value);
      });
    });
  };

  // Year Ranges
  const yearRanges = ["1980 - 1990", "1991 - 2000", "2001 - 2010", "2011 - 2020", "2021 - 2025"];

  return (
    <div className="relative container mx-auto px-4 py-4">
      <div className="bg-zinc-900/30 backdrop-blur-md rounded-2xl border border-zinc-800 p-4 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-zinc-300">
            <Filter className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-semibold">Filters</h3>
          </div>
          {(activeFilters.genres.length > 0 || 
            activeFilters.years.length > 0 || 
            activeFilters.ratings.length > 0) && (
            <button 
              onClick={clearAllFilters}
              className="flex items-center gap-1 text-zinc-400 hover:text-emerald-500 transition-colors"
            >
              <X className="w-4 h-4" />
              <span className="text-sm">Clear All</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Genres */}
          <div className="flex flex-col gap-3">
            <h4 className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Genre</h4>
            <div className="flex flex-wrap gap-2">
              {filters.genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => onFilterChange('genres', genre)}
                  className={`
                    px-3 py-1 rounded-full text-xs font-medium
                    transition-all duration-300 
                    hover:scale-105 
                    ${
                      activeFilters.genres.includes(genre)
                        ? 'bg-emerald-500 text-black ring-2 ring-emerald-600 shadow-lg'
                        : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700/80 hover:text-white'
                    }
                  `}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Year Ranges */}
          <div className="flex flex-col gap-3">
            <h4 className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Year</h4>
            <div className="flex flex-wrap gap-2">
              {yearRanges.map((range) => (
                <button
                  key={range}
                  onClick={() => onFilterChange('years', range)}
                  className={`
                    px-3 py-1 rounded-full text-xs font-medium
                    transition-all duration-300 
                    hover:scale-105 
                    ${
                      activeFilters.years.includes(range)
                        ? 'bg-indigo-500 text-white ring-2 ring-indigo-600 shadow-lg'
                        : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700/80 hover:text-white'
                    }
                  `}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Ratings */}
          <div className="flex flex-col gap-3">
            <h4 className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Rating</h4>
            <div className="flex flex-wrap gap-2">
              {filters.ratings.map((rating) => (
                <button
                  key={rating}
                  onClick={() => onFilterChange('ratings', rating)}
                  className={`
                    px-3 py-1 rounded-full text-xs font-medium
                    transition-all duration-300 
                    hover:scale-105 
                    ${
                      activeFilters.ratings.includes(rating)
                        ? 'bg-rose-500 text-white ring-2 ring-rose-600 shadow-lg'
                        : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700/80 hover:text-white'
                    }
                  `}
                >
                  {rating}+
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterChips;
