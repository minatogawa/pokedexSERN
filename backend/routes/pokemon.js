const express = require('express');
const db = require('../database');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });

const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });

const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });

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
    const rows = await all('SELECT * FROM Pokemon WHERE trainer_id = ?', [req.user.id]);
    const parsed = rows.map(parsePokemon);
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
    const result = await run(
      'INSERT INTO Pokemon (name, types, sprites, trainer_id) VALUES (?, ?, ?, ?)',
      [name, typesJson, spritesJson, req.user.id]
    );

    const created = await get('SELECT * FROM Pokemon WHERE id = ? AND trainer_id = ?', [
      result.id,
      req.user.id,
    ]);

    return res.status(201).json(parsePokemon(created));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const row = await get('SELECT * FROM Pokemon WHERE id = ? AND trainer_id = ?', [
      id,
      req.user.id,
    ]);

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
    const existing = await get('SELECT * FROM Pokemon WHERE id = ? AND trainer_id = ?', [
      id,
      req.user.id,
    ]);

    if (!existing) {
      return res.status(404).json({ error: 'Pokemon not found.' });
    }

    const updatedName = typeof name === 'string' && name.length ? name : existing.name;
    const updatedTypes = Array.isArray(types) ? JSON.stringify(types) : existing.types;
    const updatedSprites =
      sprites && typeof sprites === 'object' && !Array.isArray(sprites)
        ? JSON.stringify(sprites)
        : existing.sprites;

    await run('UPDATE Pokemon SET name = ?, types = ?, sprites = ? WHERE id = ?', [
      updatedName,
      updatedTypes,
      updatedSprites,
      id,
    ]);

    const updated = await get('SELECT * FROM Pokemon WHERE id = ? AND trainer_id = ?', [
      id,
      req.user.id,
    ]);

    return res.json(parsePokemon(updated));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await get('SELECT * FROM Pokemon WHERE id = ? AND trainer_id = ?', [
      id,
      req.user.id,
    ]);

    if (!existing) {
      return res.status(404).json({ error: 'Pokemon not found.' });
    }

    await run('DELETE FROM Pokemon WHERE id = ? AND trainer_id = ?', [id, req.user.id]);
    return res.json({ message: 'Pokemon deleted successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
