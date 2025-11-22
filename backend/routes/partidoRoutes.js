const express = require('express');
const router = express.Router();
const Partido = require('../models/partidoModel');
const Equipo = require('../models/equipoModel');
const auth = require('../middleware/authMiddleware'); // Asegúrate de importar auth

// Función auxiliar para actualizar estadísticas (se usa al crear o al finalizar)
async function actualizarEstadisticas(detallesGoles) {
  if (detallesGoles && detallesGoles.length > 0) {
    for (const gol of detallesGoles) {
      if (!gol.esAutogol) {
        await Equipo.updateOne({ "jugadores._id": gol.jugadorId }, { $inc: { "jugadores.$.goles": 1 } });
        if (gol.asistenciaId) {
          await Equipo.updateOne({ "jugadores._id": gol.asistenciaId }, { $inc: { "jugadores.$.asistencias": 1 } });
        }
      }
    }
  }
}

// GET: Obtener todos
router.get('/', async (req, res) => {
  try {
    const partidos = await Partido.find().sort({ fecha: 1 }) // Ordenados por fecha
      .populate('equipoLocal', 'nombre logoUrl').populate('equipoVisitante', 'nombre logoUrl');
    res.json(partidos);
  } catch (error) { res.status(500).json({ message: 'Error' }); }
});

// GET: Próximos (Solo los NO finalizados)
router.get('/proximos', async (req, res) => {
  try {
    const proximos = await Partido.find({ finalizado: false }).sort({ fecha: 1 }).limit(5)
      .populate('equipoLocal', 'nombre logoUrl').populate('equipoVisitante', 'nombre logoUrl');
    res.json(proximos);
  } catch (error) { res.status(500).json({ message: 'Error' }); }
});

// GET: Recientes (Solo los FINALIZADOS)
router.get('/recientes', async (req, res) => {
  try {
    const recientes = await Partido.find({ finalizado: true }).sort({ fecha: -1 }).limit(5)
      .populate('equipoLocal', 'nombre logoUrl').populate('equipoVisitante', 'nombre logoUrl');
    res.json(recientes);
  } catch (error) { res.status(500).json({ message: 'Error' }); }
});

// GET: Tabla (Solo cuenta partidos FINALIZADOS)
router.get('/standings', async (req, res) => {
  try {
    const teams = await Equipo.find();
    const proximos = await Partido.find({ finalizado: false }).sort({ fecha: 1 }).limit(5)
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

// POST: Crear partido (Puede ser programado O finalizado)
router.post('/', auth, async (req, res) => {
  const { equipoLocal, equipoVisitante, golesLocal, golesVisitante, fecha, detallesGoles, finalizado } = req.body;
  
  // Si solo programamos, forzamos goles a 0
  const isFinalizado = finalizado === undefined ? true : finalizado; // Por defecto true si no envían nada

  const nuevoPartido = new Partido({
    equipoLocal, equipoVisitante, fecha, finalizado: isFinalizado,
    golesLocal: isFinalizado ? golesLocal : 0,
    golesVisitante: isFinalizado ? golesVisitante : 0,
    detallesGoles: isFinalizado ? detallesGoles : []
  });

  try {
    const guardado = await nuevoPartido.save();
    // Solo actualizamos estadísticas si YA se jugó
    if (isFinalizado) {
      await actualizarEstadisticas(detallesGoles);
    }
    res.status(201).json(guardado);
  } catch (error) { res.status(400).json({ message: 'Error' }); }
});

// PUT: Finalizar un partido programado (O editar uno existente)
router.put('/:id', auth, async (req, res) => {
  try {
    // 1. Buscamos el partido original para ver si ya estaba finalizado
    const partidoOriginal = await Partido.findById(req.params.id);
    
    // 2. Actualizamos con los nuevos datos (goles, eventos, status finalizado)
    const partidoActualizado = await Partido.findByIdAndUpdate(req.params.id, req.body, { new: true });

    // 3. Si antes NO estaba finalizado y AHORA SÍ (es decir, lo acabamos de jugar) -> Sumamos stats
    if (!partidoOriginal.finalizado && req.body.finalizado) {
       await actualizarEstadisticas(req.body.detallesGoles);
    }

    res.json(partidoActualizado);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar' });
  }
});

module.exports = router;