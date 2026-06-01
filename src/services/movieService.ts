import axios from 'axios';
import type { Movie } from '../types/movie';

const myKey = import.meta.env.VITE_API_KEY;

export interface MoviesHttpResponse {
  results: Movie[];
  total_pages: number;
}

export default async function fetchMovies(
  query: string,
  page: number,
): Promise<MoviesHttpResponse> {
  const { data } = await axios.get<MoviesHttpResponse>(
    'https://api.themoviedb.org/3/search/movie',
    {
      params: {
        query: query,
        include_adult: false,
        language: 'en-US',
        page: page,
      },
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${myKey}`,
      },
    },
  );
  return data;
}
