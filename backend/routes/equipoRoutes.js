const express = require('express');
const router = express.Router();
const Equipo = require('../models/equipoModel');
// 👇 ESTA LÍNEA FALTABA 👇
const auth = require('../middleware/authMiddleware');

// --- Rutas PÚBLICAS ---

// GET: Obtener todos los equipos (con filtro opcional)
router.get('/', async (req, res) => {
  try {
    const { categoria } = req.query;
    const filtro = categoria && categoria !== 'Todos' ? { categoria } : {};
    const equipos = await Equipo.find(filtro);
    res.json(equipos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los equipos' });
  }
});

// GET: Obtener un equipo por ID
router.get('/:id', async (req, res) => {
  try {
    const equipo = await Equipo.findById(req.params.id);
    if (!equipo) return res.status(404).json({ message: 'Equipo no encontrado' });
    res.json(equipo);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el equipo' });
  }
});

// GET: Obtener goleadores
router.get('/stats/goleadores', async (req, res) => {
   try {
    const categoria = req.query.categoria;
    const filtro = categoria && categoria !== 'Todos' ? { categoria } : {};
    const equipos = await Equipo.find(filtro);
    
    const todosLosJugadores = [];
    equipos.forEach(equipo => {
      equipo.jugadores.forEach(jugador => {
        if (jugador.goles > 0) {
          todosLosJugadores.push({
            nombre: jugador.nombre,
            goles: jugador.goles,
            nombreEquipo: equipo.nombre,
            logoEquipo: equipo.logoUrl,
            categoria: equipo.categoria
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


// --- Rutas PROTEGIDAS (Requieren Login) ---

// POST: Crear equipo
router.post('/', auth, async (req, res) => {
  const { nombre, logoUrl, jugadores, categoria } = req.body;
  
  const nuevoEquipo = new Equipo({ 
    nombre, 
    logoUrl, 
    jugadores,
    categoria: categoria || 'Fútbol 7'
  });

  try {
    const equipoGuardado = await nuevoEquipo.save();
    res.status(201).json(equipoGuardado);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear el equipo', error: error.message });
  }
});

// PUT: Editar equipo
router.put('/:id', auth, async (req, res) => {
   try {
    const equipoActualizado = await Equipo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!equipoActualizado) return res.status(404).json({ message: 'No se encontró el equipo' });
    res.json(equipoActualizado);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el equipo' });
  }
});

// DELETE: Borrar equipo
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