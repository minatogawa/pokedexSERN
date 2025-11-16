import { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';

const SearchBar = ({ pokemon, onSearchResults }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Configure Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(pokemon, {
      keys: ['name'],
      threshold: 0.4, // Lower threshold = stricter matching
      includeScore: true,
    });
  }, [pokemon]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      // If search is empty, return all pokemon
      onSearchResults(pokemon);
    } else {
      // Perform fuzzy search
      const results = fuse.search(searchTerm);
      const filteredPokemon = results.map((result) => result.item);
      onSearchResults(filteredPokemon);
    }
  }, [searchTerm, pokemon, fuse, onSearchResults]);

  const handleClear = () => {
    setSearchTerm('');
  };

  return (
    <div className="search-bar">
      <div className="search-input-wrapper">
        <input
          type="text"
          placeholder="Search Pokemon by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <button className="clear-search" onClick={handleClear}>
            &times;
          </button>
        )}
      </div>
      {searchTerm && (
        <p className="search-info">
          Showing results for "{searchTerm}"
        </p>
      )}
    </div>
  );
};

export default SearchBar;
