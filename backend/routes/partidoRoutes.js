const express = require('express');
const router = express.Router();
const Partido = require('../models/partidoModel');
const Equipo = require('../models/equipoModel');

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

// GET: Próximos partidos
router.get('/proximos', async (req, res) => {
  try {
    const proximosPartidos = await Partido.find({ fecha: { $gte: new Date() } })
      .sort({ fecha: 1 }).limit(5)
      .populate('equipoLocal', 'nombre logoUrl').populate('equipoVisitante', 'nombre logoUrl');
    res.json(proximosPartidos);
  } catch (error) {
    res.status(500).json({ message: 'Error' });
  }
});

// GET: Recientes
router.get('/recientes', async (req, res) => {
  try {
    const partidosRecientes = await Partido.find({ fecha: { $lt: new Date() } })
      .sort({ fecha: -1 }).limit(5)
      .populate('equipoLocal', 'nombre logoUrl').populate('equipoVisitante', 'nombre logoUrl');
    res.json(partidosRecientes);
  } catch (error) {
    res.status(500).json({ message: 'Error' });
  }
});

// GET: Tabla de posiciones (sin cambios en lógica, solo código limpio)
router.get('/standings', async (req, res) => {
  try {
    const teams = await Equipo.find();
    const matches = await Partido.find();
    const stats = {};
    teams.forEach(team => {
      stats[team._id] = { _id: team._id, nombre: team.nombre, logoUrl: team.logoUrl, PJ: 0, PG: 0, PE: 0, PP: 0, GF: 0, GC: 0, DG: 0, PTS: 0 };
    });
    matches.forEach(match => {
      if (stats[match.equipoLocal] && stats[match.equipoVisitante]) {
          const localId = match.equipoLocal.toString();
          const visitanteId = match.equipoVisitante.toString();
          const gl = match.golesLocal;
          const gv = match.golesVisitante;
          stats[localId].PJ++; stats[visitanteId].PJ++;
          stats[localId].GF += gl; stats[visitanteId].GF += gv;
          stats[localId].GC += gv; stats[visitanteId].GC += gl;
          if (gl > gv) { stats[localId].PG++; stats[visitanteId].PP++; stats[localId].PTS += 3; }
          else if (gv > gl) { stats[visitanteId].PG++; stats[localId].PP++; stats[visitanteId].PTS += 3; }
          else { stats[localId].PE++; stats[visitanteId].PE++; stats[localId].PTS += 1; stats[visitanteId].PTS += 1; }
      }
    });
    const standings = Object.values(stats).sort((a, b) => {
      if (b.PTS !== a.PTS) return b.PTS - a.PTS;
      a.DG = a.GF - a.GC; b.DG = b.GF - b.GC; return b.DG - a.DG;
    });
    res.json(standings);
  } catch (error) { res.status(500).json({ message: 'Error' }); }
});

// POST: Crear partido con lógica de Autogoles y Asistencias
router.post('/', async (req, res) => {
  const { equipoLocal, equipoVisitante, golesLocal, golesVisitante, fecha, detallesGoles } = req.body;

  const nuevoPartido = new Partido({
    equipoLocal, equipoVisitante, golesLocal, golesVisitante, fecha, detallesGoles
  });

  try {
    const partidoGuardado = await nuevoPartido.save();

    // Actualizar estadísticas de jugadores
    if (detallesGoles && detallesGoles.length > 0) {
      for (const gol of detallesGoles) {
        // SI NO ES AUTOGOL: Sumamos gol al jugador y asistencia al compañero
        if (!gol.esAutogol) {
          // 1. Sumar gol
          await Equipo.updateOne(
            { "jugadores._id": gol.jugadorId },
            { $inc: { "jugadores.$.goles": 1 } }
          );
          // 2. Sumar asistencia (si existe)
          if (gol.asistenciaId) {
            await Equipo.updateOne(
              { "jugadores._id": gol.asistenciaId },
              { $inc: { "jugadores.$.asistencias": 1 } } // Asegúrate de tener el campo asistencias en el modelo Equipo
            );
          }
        }
        // SI ES AUTOGOL: No sumamos estadísticas positivas al jugador
      }
    }
    res.status(201).json(partidoGuardado);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear el partido', error: error.message });
  }
});

module.exports = router;