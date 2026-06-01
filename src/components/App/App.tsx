import { useEffect, useState } from 'react';
import SearchBar from '../SearchBar/SearchBar';
import type { Movie } from '../../types/movie';
import fetchMovies, {
  type MoviesHttpResponse,
} from '../../services/movieService';
import Loader from '../Loader/Loader';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import MovieGrid from '../MovieGrid/MovieGrid';
import MovieModal from '../MovieModal/MovieModal';
import toast, { Toaster } from 'react-hot-toast';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import ReactPaginateModule from 'react-paginate';
import type { ReactPaginateProps } from 'react-paginate';
import type { ComponentType } from 'react';
import css from './App.module.css';

type ModuleWithDefault<T> = { default: T };

const ReactPaginate = (
  ReactPaginateModule as unknown as ModuleWithDefault<
    ComponentType<ReactPaginateProps>
  >
).default;

interface PaginationProps {
  totalPages: number;
  page: number;
  setPage: (nextPage: number) => void;
}

const Pagination = ({ totalPages, page, setPage }: PaginationProps) => {
  return (
    <ReactPaginate
      pageCount={totalPages}
      pageRangeDisplayed={5}
      marginPagesDisplayed={1}
      onPageChange={({ selected }) => setPage(selected + 1)}
      forcePage={page - 1}
      containerClassName={css.pagination}
      activeClassName={css.active}
      nextLabel="→"
      previousLabel="←"
    />
  );
};

export default function App() {
  const [query, setQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [page, setPage] = useState(1);

  const moviesQuery = useQuery<MoviesHttpResponse>({
    queryKey: ['movies', query, page],
    queryFn: () => fetchMovies(query, page),
    placeholderData: keepPreviousData,
    enabled: query !== '',
  });

  const movies = moviesQuery.data?.results || [];
  const totalPages = moviesQuery.data?.total_pages ?? 0;
  const { isLoading, isError } = moviesQuery;

  useEffect(() => {
    if (moviesQuery.data && moviesQuery.data.results.length === 0) {
      toast.error('No movies found for your request.');
    }
  }, [moviesQuery.data]);

  const openModal = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  const closeModal = () => {
    setSelectedMovie(null);
  };

  const handleChangePage = (page: number) => {
    setPage(page);
  };

  const handleSubmit = (query: string) => {
    setQuery(query);
    setPage(1);
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      <SearchBar onSubmit={handleSubmit} />

      {movies.length > 0 && (
        <Pagination
          totalPages={totalPages}
          page={page}
          setPage={handleChangePage}
        />
      )}

      {isLoading && <Loader />}

      {isError && <ErrorMessage />}

      {movies.length > 0 && <MovieGrid onSelect={openModal} movies={movies} />}

      {selectedMovie && (
        <MovieModal onClose={closeModal} movie={selectedMovie} />
      )}
    </>
  );
}
