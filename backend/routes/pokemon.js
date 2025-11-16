const express = require('express');
const pool = require('../database');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

const parsePokemon = (row) => {
  if (!row) return null;
  let types = [];
  let sprites = {};
  try {
    types = JSON.parse(row.types);
  } catch (e) {
    types = [];
  }
  try {
    sprites = JSON.parse(row.sprites);
  } catch (e) {
    sprites = {};
  }
  return { ...row, types, sprites };
};

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Pokemon WHERE trainer_id = $1', [req.user.id]);
    const parsed = result.rows.map(parsePokemon);
    return res.json(parsed);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

router.post('/', async (req, res) => {
  const { name, types, sprites } = req.body;

  if (
    !name ||
    !Array.isArray(types) ||
    typeof sprites !== 'object' ||
    sprites === null ||
    Array.isArray(sprites)
  ) {
    return res.status(400).json({ error: 'Name, types array, and sprites object are required.' });
  }

  try {
    const typesJson = JSON.stringify(types);
    const spritesJson = JSON.stringify(sprites);
    const result = await pool.query(
      'INSERT INTO Pokemon (name, types, sprites, trainer_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, typesJson, spritesJson, req.user.id]
    );

    return res.status(201).json(parsePokemon(result.rows[0]));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM Pokemon WHERE id = $1 AND trainer_id = $2', [
      id,
      req.user.id,
    ]);
    const row = result.rows[0];

    if (!row) {
      return res.status(404).json({ error: 'Pokemon not found.' });
    }

    return res.json(parsePokemon(row));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, types, sprites } = req.body;

  try {
    const existingResult = await pool.query(
      'SELECT * FROM Pokemon WHERE id = $1 AND trainer_id = $2',
      [id, req.user.id]
    );
    const existing = existingResult.rows[0];

    if (!existing) {
      return res.status(404).json({ error: 'Pokemon not found.' });
    }

    const updatedName = typeof name === 'string' && name.length ? name : existing.name;
    const updatedTypes = Array.isArray(types) ? JSON.stringify(types) : existing.types;
    const updatedSprites =
      sprites && typeof sprites === 'object' && !Array.isArray(sprites)
        ? JSON.stringify(sprites)
        : existing.sprites;

    const updateResult = await pool.query(
      'UPDATE Pokemon SET name = $1, types = $2, sprites = $3 WHERE id = $4 RETURNING *',
      [updatedName, updatedTypes, updatedSprites, id]
    );

    return res.json(parsePokemon(updateResult.rows[0]));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const existingResult = await pool.query(
      'SELECT * FROM Pokemon WHERE id = $1 AND trainer_id = $2',
      [id, req.user.id]
    );
    const existing = existingResult.rows[0];

    if (!existing) {
      return res.status(404).json({ error: 'Pokemon not found.' });
    }

    await pool.query('DELETE FROM Pokemon WHERE id = $1 AND trainer_id = $2', [id, req.user.id]);
    return res.json({ message: 'Pokemon deleted successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
