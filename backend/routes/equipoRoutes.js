const express = require('express');
const router = express.Router();
const Equipo = require('../models/equipoModel');
const auth = require('../middleware/authMiddleware'); // <--- ESTA ERA LA QUE FALTABA ANTES

// --- RUTAS PÚBLICAS ---

// GET: Obtener todos los equipos (con filtro opcional)
router.get('/', async (req, res) => {
  try {
    const { categoria } = req.query;
    // Si categoría es 'Todos' o no existe, traemos todo. Si no, filtramos.
    const filtro = (!categoria || categoria === 'Todos') ? {} : { categoria };
    
    const equipos = await Equipo.find(filtro);
    res.json(equipos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener equipos' });
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

// GET: Stats (Goleadores)
router.get('/stats/goleadores', async (req, res) => {
  try {
    const categoria = req.query.categoria;
    const filtro = (!categoria || categoria === 'Todos') ? {} : { categoria };
    const equipos = await Equipo.find(filtro);
    
    let todosLosJugadores = [];
    equipos.forEach(eq => {
      if(eq.jugadores && Array.isArray(eq.jugadores)) {
        eq.jugadores.forEach(jug => {
          if(jug.goles > 0) {
            todosLosJugadores.push({
              nombre: jug.nombre,
              goles: jug.goles,
              asistencias: jug.asistencias || 0,
              porterias: jug.porteriasImbatidas || 0,
              posicion: jug.posicion,
              nombreEquipo: eq.nombre,
              logoEquipo: eq.logoUrl,
              categoria: eq.categoria
            });
          }
        });
      }
    });
    
    // Tops
    const goleadores = [...todosLosJugadores].sort((a,b) => b.goles - a.goles).slice(0, 10);
    const asistidores = [...todosLosJugadores].sort((a,b) => b.asistencias - a.asistencias).slice(0, 10);
    const porteros = [...todosLosJugadores].filter(p => p.posicion === 'Portero').sort((a,b) => b.porterias - a.porterias).slice(0, 10);

    res.json({ goleadores, asistidores, porteros });
  } catch (error) {
    res.status(500).json({ message: 'Error stats' });
  }
});


// --- RUTAS PROTEGIDAS ---

// POST: Crear
router.post('/', auth, async (req, res) => {
  try {
    const nuevoEquipo = new Equipo(req.body);
    const guardado = await nuevoEquipo.save();
    res.status(201).json(guardado);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear' });
  }
});

// PUT: Editar
router.put('/:id', auth, async (req, res) => {
  try {
    const actualizado = await Equipo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ message: 'Error al editar' });
  }
});

// DELETE: Borrar
router.delete('/:id', auth, async (req, res) => {
  try {
    await Equipo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al borrar' });
  }
});

module.exports = router;