// Load environment variables (defaults to .env.development for local runs)
const envName = process.env.NODE_ENV || 'development';
require('dotenv').config({ path: `.env.${envName}` });
require('dotenv').config();

const bcrypt = require('bcryptjs');
const pool = require('./database');

const POKEMON_DATA = [
    { name: 'Bulbasaur', types: '["Grass", "Poison"]', sprites: '{"front_default": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"}' },
    { name: 'Charmander', types: '["Fire"]', sprites: '{"front_default": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png"}' },
    { name: 'Squirtle', types: '["Water"]', sprites: '{"front_default": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png"}' },
    { name: 'Pikachu', types: '["Electric"]', sprites: '{"front_default": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png"}' },
    { name: 'Jigglypuff', types: '["Normal", "Fairy"]', sprites: '{"front_default": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png"}' },
    { name: 'Gengar', types: '["Ghost", "Poison"]', sprites: '{"front_default": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png"}' },
    { name: 'Mewtwo', types: '["Psychic"]', sprites: '{"front_default": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png"}' },
    { name: 'Snorlax', types: '["Normal"]', sprites: '{"front_default": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png"}' },
    { name: 'Dragonite', types: '["Dragon", "Flying"]', sprites: '{"front_default": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png"}' },
    { name: 'Eevee', types: '["Normal"]', sprites: '{"front_default": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png"}' },
    { name: 'Magikarp', types: '["Water"]', sprites: '{"front_default": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/129.png"}' },
    { name: 'Gyarados', types: '["Water", "Flying"]', sprites: '{"front_default": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/130.png"}' }
];

const SEED_EMAIL = 'trainer@pokedex.com';
const SEED_PASSWORD = 'password123';

async function seed() {
    console.log('Starting database seeding...');

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const existing = await client.query(
            'SELECT id FROM Users WHERE email = $1',
            [SEED_EMAIL]
        );
        let trainerId = existing.rows[0]?.id;

        if (!trainerId) {
            const hashedPassword = await bcrypt.hash(SEED_PASSWORD, 10);
            const inserted = await client.query(
                'INSERT INTO Users (email, password_hash) VALUES ($1, $2) RETURNING id',
                [SEED_EMAIL, hashedPassword]
            );
            trainerId = inserted.rows[0].id;
            console.log(`Seed user created with ID: ${trainerId}`);
        } else {
            console.log(`Seed user already exists with ID: ${trainerId}`);
        }

        // Clear existing Pokémon for this trainer to avoid duplicates
        await client.query('DELETE FROM Pokemon WHERE trainer_id = $1', [trainerId]);

        for (const pokemon of POKEMON_DATA) {
            await client.query(
                'INSERT INTO Pokemon (name, types, sprites, trainer_id) VALUES ($1, $2, $3, $4)',
                [pokemon.name, pokemon.types, pokemon.sprites, trainerId]
            );
        }
        console.log(`${POKEMON_DATA.length} sample Pokémon inserted for trainer ${trainerId}.`);

        await client.query('COMMIT');

        console.log('\nDatabase seeding completed successfully!');
        console.log('========================================');
        console.log('You can now log in with these credentials:');
        console.log(`  Email: ${SEED_EMAIL}`);
        console.log(`  Password: ${SEED_PASSWORD}`);
        console.log('========================================');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error during database seeding:', error.message);
    } finally {
        client.release();
        console.log('Database connection closed.');
        await pool.end(); // ensure Node process exits cleanly after seeding
    }
}

seed();
