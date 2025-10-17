const express = require('express');
const router = express.Router();
const Partido = require('../models/partidoModel');
const Equipo = require('../models/equipoModel'); // <-- Esta es la línea que probablemente faltaba

// GET: Obtener todos los partidos
router.get('/', async (req, res) => {
  try {
    const partidos = await Partido.find()
      .populate('equipoLocal', 'nombre logoUrl')
      .populate('equipoVisitante', 'nombre logoUrl');
    res.json(partidos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los partidos' });
  }
});

// POST: Crear un nuevo partido
router.post('/', async (req, res) => {
  const nuevoPartido = new Partido({
    equipoLocal: req.body.equipoLocal,
    equipoVisitante: req.body.equipoVisitante,
    golesLocal: req.body.golesLocal,
    golesVisitante: req.body.golesVisitante,
    fecha: req.body.fecha
  });
  try {
    const partidoGuardado = await nuevoPartido.save();
    res.status(201).json(partidoGuardado);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear el partido', error: error.message });
  }
});

// GET: Calcular y devolver la tabla de posiciones
router.get('/standings', async (req, res) => {
  try {
    const teams = await Equipo.find();
    const matches = await Partido.find();
    const stats = {};
    teams.forEach(team => {
      stats[team._id] = {
        nombre: team.nombre, logoUrl: team.logoUrl,
        PJ: 0, PG: 0, PE: 0, PP: 0,
        GF: 0, GC: 0, DG: 0, PTS: 0
      };
    });
    matches.forEach(match => {
      const localId = match.equipoLocal.toString();
      const visitanteId = match.equipoVisitante.toString();
      const golesLocal = match.golesLocal;
      const golesVisitante = match.golesVisitante;
      stats[localId].PJ++;
      stats[visitanteId].PJ++;
      stats[localId].GF += golesLocal;
      stats[visitanteId].GF += golesVisitante;
      stats[localId].GC += golesVisitante;
      stats[visitanteId].GC += golesLocal;
      if (golesLocal > golesVisitante) {
        stats[localId].PG++;
        stats[visitanteId].PP++;
        stats[localId].PTS += 3;
      } else if (golesVisitante > golesLocal) {
        stats[visitanteId].PG++;
        stats[localId].PP++;
        stats[visitanteId].PTS += 3;
      } else {
        stats[localId].PE++;
        stats[visitanteId].PE++;
        stats[localId].PTS += 1;
        stats[visitanteId].PTS += 1;
      }
    });
    const standings = Object.values(stats).sort((a, b) => {
      if (b.PTS !== a.PTS) return b.PTS - a.PTS;
      a.DG = a.GF - a.GC;
      b.DG = b.GF - b.GC;
      return b.DG - a.DG;
    });
    res.json(standings);
  } catch (error) {
    res.status(500).json({ message: 'Error al calcular la tabla', error: error.message });
  }
});

module.exports = router;