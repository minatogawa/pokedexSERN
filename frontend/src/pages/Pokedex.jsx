import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { pokemonAPI } from '../services/api';
import SearchBar from '../components/SearchBar';
import PokemonCard from '../components/PokemonCard';

const Pokedex = () => {
  const [pokemon, setPokemon] = useState([]);
  const [filteredPokemon, setFilteredPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPokemon, setEditingPokemon] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    types: '',
    spriteUrl: '',
  });

  const { logout } = useAuth();
  const navigate = useNavigate();

  const fetchPokemon = useCallback(async () => {
    try {
      setLoading(true);
      const response = await pokemonAPI.getAll();
      setPokemon(response.data);
      setFilteredPokemon(response.data);
    } catch (err) {
      setError('Failed to fetch Pokemon');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPokemon();
  }, [fetchPokemon]);

  const handleSearchResults = useCallback((results) => {
    setFilteredPokemon(results);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Pokemon?')) {
      return;
    }

    try {
      await pokemonAPI.delete(id);
      setPokemon((prev) => prev.filter((p) => p.id !== id));
      setFilteredPokemon((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert('Failed to delete Pokemon');
      console.error(err);
    }
  };

  const handleEdit = (pokemonToEdit) => {
    setEditingPokemon(pokemonToEdit);
    setFormData({
      name: pokemonToEdit.name,
      types: pokemonToEdit.types.join(', '),
      spriteUrl: pokemonToEdit.sprites.front_default || '',
    });
    setShowAddForm(true);
  };

  const handleAddNew = () => {
    setEditingPokemon(null);
    setFormData({ name: '', types: '', spriteUrl: '' });
    setShowAddForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const typesArray = formData.types
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t);

    if (!formData.name || typesArray.length === 0) {
      alert('Name and at least one type are required');
      return;
    }

    const pokemonData = {
      name: formData.name,
      types: typesArray,
      sprites: { front_default: formData.spriteUrl || '' },
    };

    try {
      if (editingPokemon) {
        const response = await pokemonAPI.update(editingPokemon.id, pokemonData);
        setPokemon((prev) =>
          prev.map((p) => (p.id === editingPokemon.id ? response.data : p))
        );
        setFilteredPokemon((prev) =>
          prev.map((p) => (p.id === editingPokemon.id ? response.data : p))
        );
      } else {
        const response = await pokemonAPI.create(pokemonData);
        setPokemon((prev) => [...prev, response.data]);
        setFilteredPokemon((prev) => [...prev, response.data]);
      }
      setShowAddForm(false);
      setEditingPokemon(null);
      setFormData({ name: '', types: '', spriteUrl: '' });
    } catch (err) {
      alert(editingPokemon ? 'Failed to update Pokemon' : 'Failed to create Pokemon');
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="pokedex-container">
        <div className="loading">Loading your Pokemon...</div>
      </div>
    );
  }

  return (
    <div className="pokedex-container">
      <header className="pokedex-header">
        <h1>My Pokedex</h1>
        <div className="header-actions">
          <button className="add-button" onClick={handleAddNew}>
            + Add Pokemon
          </button>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <SearchBar pokemon={pokemon} onSearchResults={handleSearchResults} />

      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingPokemon ? 'Edit Pokemon' : 'Add New Pokemon'}</h2>
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Pokemon name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="types">Types (comma-separated)</label>
                <input
                  type="text"
                  id="types"
                  value={formData.types}
                  onChange={(e) =>
                    setFormData({ ...formData, types: e.target.value })
                  }
                  placeholder="fire, flying"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="spriteUrl">Sprite URL</label>
                <input
                  type="url"
                  id="spriteUrl"
                  value={formData.spriteUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, spriteUrl: e.target.value })
                  }
                  placeholder="https://example.com/sprite.png"
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-button">
                  {editingPokemon ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="pokemon-grid">
        {filteredPokemon.length > 0 ? (
          filteredPokemon.map((p) => (
            <PokemonCard
              key={p.id}
              pokemon={p}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))
        ) : (
          <div className="no-pokemon">
            {pokemon.length === 0
              ? 'No Pokemon in your Pokedex yet. Add your first one!'
              : 'No Pokemon match your search.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pokedex;
