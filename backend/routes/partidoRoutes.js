const express = require('express');
const router = express.Router();
const Partido = require('../models/partidoModel');
const Equipo = require('../models/equipoModel');
const auth = require('../middleware/authMiddleware');

// --- RUTAS EXISTENTES (GET) ---
router.get('/', async (req, res) => {
  try {
    const partidos = await Partido.find().sort({ fecha: 1 }).populate('equipoLocal', 'nombre logoUrl').populate('equipoVisitante', 'nombre logoUrl');
    res.json(partidos);
  } catch (error) { res.status(500).json({ message: 'Error' }); }
});

router.get('/proximos', async (req, res) => {
  try {
    const proximos = await Partido.find({ finalizado: false }).sort({ fecha: 1 }).limit(5).populate('equipoLocal', 'nombre logoUrl').populate('equipoVisitante', 'nombre logoUrl');
    res.json(proximos);
  } catch (error) { res.status(500).json({ message: 'Error' }); }
});

router.get('/recientes', async (req, res) => {
  try {
    const recientes = await Partido.find({ finalizado: true }).sort({ fecha: -1 }).limit(5).populate('equipoLocal', 'nombre logoUrl').populate('equipoVisitante', 'nombre logoUrl');
    res.json(recientes);
  } catch (error) { res.status(500).json({ message: 'Error' }); }
});

// TABLA DE POSICIONES
router.get('/standings', async (req, res) => {
  try {
    const teams = await Equipo.find();
    const matches = await Partido.find({ finalizado: true });
    const stats = {};
    
    teams.forEach(team => {
      stats[team._id.toString()] = { _id: team._id, nombre: team.nombre, logoUrl: team.logoUrl, PJ: 0, PG: 0, PE: 0, PP: 0, GF: 0, GC: 0, DG: 0, PTS: 0 };
    });

    matches.forEach(match => {
      const localId = match.equipoLocal.toString();
      const visitanteId = match.equipoVisitante.toString();
      if (stats[localId] && stats[visitanteId]) {
          const gl = match.golesLocal;
          const gv = match.golesVisitante;
          stats[localId].PJ++; stats[localId].GF += gl; stats[localId].GC += gv; stats[localId].DG = stats[localId].GF - stats[localId].GC;
          stats[visitanteId].PJ++; stats[visitanteId].GF += gv; stats[visitanteId].GC += gl; stats[visitanteId].DG = stats[visitanteId].GF - stats[visitanteId].GC;
          
          if (gl > gv) { stats[localId].PG++; stats[localId].PTS += 3; stats[visitanteId].PP++; }
          else if (gv > gl) { stats[visitanteId].PG++; stats[visitanteId].PTS += 3; stats[localId].PP++; }
          else { stats[localId].PE++; stats[localId].PTS += 1; stats[visitanteId].PE++; stats[visitanteId].PTS += 1; }
      }
    });

    const standings = Object.values(stats).sort((a, b) => {
      if (b.PTS !== a.PTS) return b.PTS - a.PTS;
      return b.DG - a.DG;
    });
    res.json(standings);
  } catch (error) { res.status(500).json({ message: 'Error' }); }
});

// 👇 NUEVA RUTA: TABLA DE TARJETAS (FAIR PLAY)
router.get('/cards', async (req, res) => {
  try {
    const teams = await Equipo.find();
    const matches = await Partido.find({ finalizado: true });
    const cardStats = {};

    teams.forEach(team => {
      cardStats[team._id.toString()] = { 
        _id: team._id, 
        nombre: team.nombre, 
        logoUrl: team.logoUrl, 
        amarillas: 0, 
        rojas: 0,
        total: 0 // Puntos de indisciplina (Amarilla=1, Roja=3)
      };
    });

    matches.forEach(match => {
      if (match.detallesTarjetas) {
        match.detallesTarjetas.forEach(card => {
          // Buscamos el ID del equipo basándonos en si fue local o visitante en ese partido
          const teamId = card.equipo === 'local' ? match.equipoLocal.toString() : match.equipoVisitante.toString();
          
          if (cardStats[teamId]) {
            if (card.tipo === 'Amarilla') {
              cardStats[teamId].amarillas++;
              cardStats[teamId].total += 1;
            } else {
              cardStats[teamId].rojas++;
              cardStats[teamId].total += 3; // Roja cuenta triple para el orden
            }
          }
        });
      }
    });

    // Ordenar: El que tenga MÁS tarjetas va arriba (o abajo si prefieres Fair Play)
    // Aquí ordenamos por "Más indisciplinado" arriba
    const standings = Object.values(cardStats).sort((a, b) => b.total - a.total);
    res.json(standings);

  } catch (error) { res.status(500).json({ message: 'Error calculando tarjetas' }); }
});

// POST Y PUT (Actualizados para recibir tarjetas)
router.post('/', auth, async (req, res) => {
  try {
    // Añadimos detallesTarjetas al destructuring
    const { equipoLocal, equipoVisitante, golesLocal, golesVisitante, fecha, detallesGoles, detallesTarjetas, finalizado } = req.body;
    
    const isFinalizado = finalizado === undefined ? true : finalizado;

    const nuevoPartido = new Partido({
      equipoLocal, equipoVisitante, fecha, finalizado: isFinalizado,
      golesLocal: isFinalizado ? golesLocal : 0,
      golesVisitante: isFinalizado ? golesVisitante : 0,
      detallesGoles: isFinalizado ? detallesGoles : [],
      detallesTarjetas: isFinalizado ? detallesTarjetas : [] // <-- Guardamos tarjetas
    });

    const guardado = await nuevoPartido.save();
    
    // Lógica de stats de goles (igual que antes)
    if (isFinalizado && detallesGoles) {
      for (const gol of detallesGoles) {
        if (!gol.esAutogol) {
          await Equipo.updateOne({ "jugadores._id": gol.jugadorId }, { $inc: { "jugadores.$.goles": 1 } });
          if (gol.asistenciaId) await Equipo.updateOne({ "jugadores._id": gol.asistenciaId }, { $inc: { "jugadores.$.asistencias": 1 } });
        }
      }
    }
    res.status(201).json(guardado);
  } catch (error) { res.status(400).json({ message: 'Error' }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const partidoOriginal = await Partido.findById(req.params.id);
    const partidoActualizado = await Partido.findByIdAndUpdate(req.params.id, req.body, { new: true });

    // Si se finaliza ahora, sumamos stats de goles
    if (!partidoOriginal.finalizado && req.body.finalizado && req.body.detallesGoles) {
       for (const gol of req.body.detallesGoles) {
        if (!gol.esAutogol) {
          await Equipo.updateOne({ "jugadores._id": gol.jugadorId }, { $inc: { "jugadores.$.goles": 1 } });
          if (gol.asistenciaId) await Equipo.updateOne({ "jugadores._id": gol.asistenciaId }, { $inc: { "jugadores.$.asistencias": 1 } });
        }
      }
    }
    res.json(partidoActualizado);
  } catch (error) { res.status(500).json({ message: 'Error' }); }
});

module.exports = router;