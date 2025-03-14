const API_KEY = '20aa58687a91f16d5c3fecf68b8e7dc1';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  profile_path?: string;
  poster_path?: string;
  media_type: 'movie' | 'tv' | 'person';
  release_date?: string;
  first_air_date?: string;
  known_for_department?: string;
  character?: string;
  vote_average?: number;
}

export interface SearchResponse {
  page: number;
  results: SearchResult[];
  total_pages: number;
  total_results: number;
}

export const searchMulti = async (query: string): Promise<SearchResult[]> => {
  if (!query.trim()) return [];
  
  try {
    const response = await fetch(
      `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`
    );
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data: SearchResponse = await response.json();
    return data.results.slice(0, 8); // Limit to 8 results for better UX
  } catch (error) {
    console.error('Error searching TMDB:', error);
    return [];
  }
};

export const getTrending = async (): Promise<SearchResult[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/trending/all/day?api_key=${API_KEY}&language=en-US`
    );
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data: SearchResponse = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching trending:', error);
    return [];
  }
};

export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return '/placeholder.jpg';
  return `${IMAGE_BASE_URL}${path}`;
};

export const formatDate = (date: string | undefined): string => {
  if (!date) return '';
  return date.split('-')[0]; // Return just the year
};

export const getMediaTypeIcon = (mediaType: string): string => {
  switch (mediaType) {
    case 'movie':
      return '🎬';
    case 'tv':
      return '📺';
    case 'person':
      return '👤';
    default:
      return '🎬';
  }
};

export const getTitle = (item: SearchResult): string => {
  if (item.media_type === 'person') {
    return item.name || 'Unknown Name';
  }
  return item.title || item.name || 'Unknown Title';
};
