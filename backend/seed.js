const bcrypt = require('bcryptjs');
const db = require('./database');

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

    // Using a Promise-based wrapper for db.run and db.get
    const run = (query, params = []) => new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) {
                console.error('Error running query:', query, params);
                return reject(err);
            }
            resolve({ lastID: this.lastID, changes: this.changes });
        });
    });

    try {
        await run('BEGIN TRANSACTION;');

        // Create tables
        await run(`
            CREATE TABLE IF NOT EXISTS Users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL
            )
        `);
        console.log('Table "Users" created or already exists.');

        await run(`
            CREATE TABLE IF NOT EXISTS Pokemon (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                types TEXT NOT NULL,
                sprites TEXT NOT NULL,
                trainer_id INTEGER NOT NULL,
                FOREIGN KEY(trainer_id) REFERENCES Users(id)
            )
        `);
        console.log('Table "Pokemon" created or already exists.');

        // Clear existing data
        await run('DELETE FROM Pokemon');
        await run('DELETE FROM Users');
        console.log('Cleared existing data from "Users" and "Pokemon" tables.');

        // Hash password and insert user
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(SEED_PASSWORD, saltRounds);
        
        const { lastID: trainerId } = await run(
            'INSERT INTO Users (email, password_hash) VALUES (?, ?)',
            [SEED_EMAIL, hashedPassword]
        );
        console.log(`Seed user created with ID: ${trainerId}`);

        // Insert Pokemon
        const stmt = db.prepare('INSERT INTO Pokemon (name, types, sprites, trainer_id) VALUES (?, ?, ?, ?)');
        for (const pokemon of POKEMON_DATA) {
            await new Promise((resolve, reject) => {
                stmt.run([pokemon.name, pokemon.types, pokemon.sprites, trainerId], (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });
        }
        stmt.finalize();
        console.log(`${POKEMON_DATA.length} sample Pokémon inserted.`);

        await run('COMMIT;');

        console.log('\nDatabase seeding completed successfully!');
        console.log('========================================');
        console.log('You can now log in with these credentials:');
        console.log(`  Email: ${SEED_EMAIL}`);
        console.log(`  Password: ${SEED_PASSWORD}`);
        console.log('========================================');

    } catch (error) {
        await run('ROLLBACK;');
        console.error('Error during database seeding:', error.message);
    } finally {
        db.close((err) => {
            if (err) {
                console.error('Error closing the database:', err.message);
            } else {
                console.log('Database connection closed.');
            }
        });
    }
}

seed();