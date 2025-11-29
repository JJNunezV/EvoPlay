const express = require('express');
const router = express.Router();
const Equipo = require('../models/equipoModel');
// 👇 IMPORTANTE: Asegúrate de que esta ruta al middleware sea correcta
const auth = require('../middleware/authMiddleware');

// ================= RUTAS PÚBLICAS (GET) =================

// 1. OBTENER GOLEADORES (Esta debe ir ANTES de /:id para que no choque)
router.get('/stats/goleadores', async (req, res) => {
   try {
    // Si mandan ?categoria=Fútbol 7, filtramos. Si no, traemos todos.
    const filtro = req.query.categoria && req.query.categoria !== 'Todos' 
      ? { categoria: req.query.categoria } 
      : {};
      
    const equipos = await Equipo.find(filtro);
    
    const todosLosJugadores = [];
    equipos.forEach(equipo => {
      if (equipo.jugadores) {
        equipo.jugadores.forEach(jugador => {
          if (jugador.goles > 0) {
            todosLosJugadores.push({
              nombre: jugador.nombre,
              goles: jugador.goles,
              asistencias: jugador.asistencias || 0,
              porterias: jugador.porteriasImbatidas || 0,
              posicion: jugador.posicion,
              nombreEquipo: equipo.nombre,
              logoEquipo: equipo.logoUrl,
              categoria: equipo.categoria
            });
          }
        });
      }
    });

    // Ordenar por goles y tomar los mejores 10
    const goleadores = [...todosLosJugadores].sort((a, b) => b.goles - a.goles).slice(0, 10);
    const asistidores = [...todosLosJugadores].sort((a, b) => b.asistencias - a.asistencias).slice(0, 10);
    const porteros = [...todosLosJugadores].filter(p => p.posicion === 'Portero').sort((a, b) => b.porterias - a.porterias).slice(0, 10);

    res.json({ goleadores, asistidores, porteros });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
  }
});

// 2. OBTENER TODOS LOS EQUIPOS
router.get('/', async (req, res) => {
  try {
    const { categoria } = req.query;
    // Si la categoría es "Todos" o no viene, no filtramos
    const filtro = categoria && categoria !== 'Todos' ? { categoria } : {};
    
    const equipos = await Equipo.find(filtro);
    res.json(equipos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los equipos' });
  }
});

// 3. OBTENER UN SOLO EQUIPO POR ID
router.get('/:id', async (req, res) => {
  try {
    const equipo = await Equipo.findById(req.params.id);
    if (!equipo) return res.status(404).json({ message: 'Equipo no encontrado' });
    res.json(equipo);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el equipo' });
  }
});


// ================= RUTAS PROTEGIDAS (POST, PUT, DELETE) =================

// CREAR EQUIPO
router.post('/', auth, async (req, res) => {
  try {
    const { nombre, logoUrl, jugadores, categoria } = req.body;
    const nuevoEquipo = new Equipo({ 
      nombre, 
      logoUrl, 
      jugadores,
      categoria: categoria || 'Fútbol 7'
    });

    const equipoGuardado = await nuevoEquipo.save();
    res.status(201).json(equipoGuardado);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear el equipo', error: error.message });
  }
});

// EDITAR EQUIPO
router.put('/:id', auth, async (req, res) => {
   try {
    const equipoActualizado = await Equipo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!equipoActualizado) return res.status(404).json({ message: 'No se encontró el equipo' });
    res.json(equipoActualizado);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el equipo' });
  }
});

// BORRAR EQUIPO
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