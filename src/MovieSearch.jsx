import { useState, useEffect } from 'react';
import './MovieSearch.css';

const API_KEY = import.meta.env.VITE_OMDB_API_KEY;
const API_URL = `http://www.omdbapi.com/?apikey=${API_KEY}`;

export default function MovieSearch() {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) fetchSuggestions(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const fetchSuggestions = async (query) => {
    try {
      const response = await fetch(`${API_URL}&s=${query}`);
      const data = await response.json();
      if (data.Response === 'True') {
        setSuggestions(data.Search);
      } else {
        setSuggestions([]);
      }
    } catch {
      setSuggestions([]);
    }
  };

  const searchMovies = async () => {
    if (!query) return;
    setLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      const response = await fetch(`${API_URL}&s=${query}`);
      const data = await response.json();
      
      if (data.Response === 'True') {
        setMovies(data.Search);
      } else {
        setError(data.Error);
        setMovies([]);
      }
    } catch {
      setError('Failed to fetch movies. Try again later.');
    }
    setLoading(false);
  };

  const fetchMovieDetails = async (id) => {
    try {
      const response = await fetch(`${API_URL}&i=${id}&plot=full`);
      const data = await response.json();
      if (data.Response === 'True') {
        setSelectedMovie(data);
      }
    } catch {
      setSelectedMovie(null);
    }
  };

  return (
    <div className="firstDiv">
      <h1 className="movieSearch">Movie Search</h1>
      <div className="secondDiv">
        <input 
          className="inputBar"
          type="text"
          placeholder="Search for a movie..." 
          value={query} 
          onChange={(e) => setQuery(e.target.value)}
        />
        <button 
          className="searchButton" 
          onClick={searchMovies}
        >
          Search
        </button>
      </div>
      {suggestions.length > 0 && (
        <ul className="suggestionList">
          {suggestions.map((movie) => (
            <li key={movie.imdbID} onClick={() => setQuery(movie.Title)}>
              {movie.Title} ({movie.Year})
            </li>
          ))}
        </ul>
      )}
      {loading && <p className="LoadingText">Loading...</p>}
      {error && <p className="errorText">{error}</p>}
      <div className="thirdDiv">
        {movies.map(movie => (
          <div key={movie.imdbID} className='movieDiv' onClick={() => fetchMovieDetails(movie.imdbID)}>
            <img 
              src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/150'} 
              alt={movie.Title} 
              className="imagePoster"
            />
            <h2 className="movieTitle">{movie.Title}</h2>
            <p className="movieYear">{movie.Year}</p>
          </div>
        ))}
      </div>
      {selectedMovie && (
        <div className="modalBackground" onClick={() => setSelectedMovie(null)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <span className="closeButton" onClick={() => setSelectedMovie(null)}>×</span>
            <h2>{selectedMovie.Title} ({selectedMovie.Year})</h2>
            <img src={selectedMovie.Poster !== 'N/A' ? selectedMovie.Poster : 'https://via.placeholder.com/150'} alt={selectedMovie.Title} className="modalPoster" />
            <p><strong>Plot:</strong> {selectedMovie.Plot}</p>
            <p><strong>Director:</strong> {selectedMovie.Director}</p>
            <p><strong>Actors:</strong> {selectedMovie.Actors}</p>
            <p><strong>IMDb Rating:</strong> {selectedMovie.imdbRating}</p>
          </div>
        </div>
      )}
    </div>
  );
}
