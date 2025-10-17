// backend/routes/equipoRoutes.js
const express = require('express');
const router = express.Router();
const Equipo = require('../models/equipoModel');
const auth = require('../middleware/authMiddleware');

// GET /api/equipos - Obtener TODOS los equipos (PÚBLICA)
router.get('/', async (req, res) => {
  try {
    const equipos = await Equipo.find();
    res.json(equipos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los equipos' });
  }
});

// --- A PARTIR DE AQUÍ, TODO ESTÁ PROTEGIDO ---
router.post('/', auth, async (req, res) => {
  const { nombre, logoUrl, jugadores } = req.body;
  const nuevoEquipo = new Equipo({ nombre, logoUrl, jugadores });
  try {
    const equipoGuardado = await nuevoEquipo.save();
    res.status(201).json(equipoGuardado);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear el equipo' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const equipoBorrado = await Equipo.findByIdAndDelete(req.params.id);
    if (!equipoBorrado) return res.status(404).json({ message: 'No se encontró equipo para borrar' });
    res.json({ message: 'Equipo borrado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al borrar el equipo' });
  }
});

// (Aquí irían las otras rutas como PUT, GET/:id, etc., pero estas son las críticas)
module.exports = router;