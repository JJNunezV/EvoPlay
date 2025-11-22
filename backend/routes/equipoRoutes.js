const express = require('express');
const router = express.Router();
const Equipo = require('../models/equipoModel');
const auth = require('../middleware/authMiddleware');

// --- Rutas PÚBLICAS ---

router.get('/', async (req, res) => {
  try {
    const equipos = await Equipo.find();
    res.json(equipos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los equipos' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const equipo = await Equipo.findById(req.params.id);
    if (!equipo) return res.status(404).json({ message: 'Equipo no encontrado' });
    res.json(equipo);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el equipo' });
  }
});

router.get('/stats/goleadores', async (req, res) => {
   try {
    const equipos = await Equipo.find();
    const todosLosJugadores = [];
    equipos.forEach(equipo => {
      equipo.jugadores.forEach(jugador => {
        if (jugador.goles > 0) {
          todosLosJugadores.push({
            nombre: jugador.nombre,
            goles: jugador.goles,
            nombreEquipo: equipo.nombre,
            logoEquipo: equipo.logoUrl,
            categoria: equipo.categoria // También mandamos la categoría por si acaso
          });
        }
      });
    });
    const goleadores = todosLosJugadores.sort((a, b) => b.goles - a.goles).slice(0, 5);
    res.json(goleadores);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener goleadores', error: error.message });
  }
});

// --- Rutas PROTEGIDAS ---

// POST: Crear equipo (ACTUALIZADO CON CATEGORIA)
router.post('/', auth, async (req, res) => {
  const { nombre, logoUrl, jugadores, categoria } = req.body; // <-- Recibimos categoria
  
  const nuevoEquipo = new Equipo({ 
    nombre, 
    logoUrl, 
    jugadores,
    categoria: categoria || 'Fútbol 7' // Si no mandan nada, ponemos Futbol 7 por defecto
  });

  try {
    const equipoGuardado = await nuevoEquipo.save();
    res.status(201).json(equipoGuardado);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear el equipo', error: error.message });
  }
});

// PUT: Actualizar equipo (ACTUALIZADO)
router.put('/:id', auth, async (req, res) => {
   try {
    // req.body ya trae la categoría actualizada
    const equipoActualizado = await Equipo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!equipoActualizado) return res.status(404).json({ message: 'No se encontró el equipo' });
    res.json(equipoActualizado);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el equipo' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const equipoBorrado = await Equipo.findByIdAndDelete(req.params.id);
    if (!equipoBorrado) {
      return res.status(404).json({ message: 'No se encontró el equipo para borrar' });
    }
    res.json({ message: 'Equipo borrado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al borrar el equipo' });
  }
});

module.exports = router;