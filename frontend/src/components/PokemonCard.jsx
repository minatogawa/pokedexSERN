const PokemonCard = ({ pokemon, onDelete, onEdit }) => {
  const { id, name, types, sprites } = pokemon;

  // Get the first sprite URL from the sprites object
  const spriteUrl = sprites?.front_default || sprites?.[Object.keys(sprites)[0]] || '';

  const getTypeColor = (type) => {
    const colors = {
      normal: '#A8A878',
      fire: '#F08030',
      water: '#6890F0',
      electric: '#F8D030',
      grass: '#78C850',
      ice: '#98D8D8',
      fighting: '#C03028',
      poison: '#A040A0',
      ground: '#E0C068',
      flying: '#A890F0',
      psychic: '#F85888',
      bug: '#A8B820',
      rock: '#B8A038',
      ghost: '#705898',
      dragon: '#7038F8',
      dark: '#705848',
      steel: '#B8B8D0',
      fairy: '#EE99AC',
    };
    return colors[type.toLowerCase()] || '#68A090';
  };

  return (
    <div className="pokemon-card">
      <div className="pokemon-sprite">
        {spriteUrl ? (
          <img src={spriteUrl} alt={name} />
        ) : (
          <div className="no-sprite">No Image</div>
        )}
      </div>

      <div className="pokemon-info">
        <h3 className="pokemon-name">{name}</h3>

        <div className="pokemon-types">
          {types.map((type, index) => (
            <span
              key={index}
              className="type-badge"
              style={{ backgroundColor: getTypeColor(type) }}
            >
              {type}
            </span>
          ))}
        </div>
      </div>

      <div className="pokemon-actions">
        {onEdit && (
          <button
            className="action-button edit-button"
            onClick={() => onEdit(pokemon)}
            title="Edit Pokemon"
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button
            className="action-button delete-button"
            onClick={() => onDelete(id)}
            title="Delete Pokemon"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default PokemonCard;
