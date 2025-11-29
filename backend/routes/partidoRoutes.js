const express = require('express');
const router = express.Router(); // 👈 ESTA ERA LA LÍNEA QUE FALTABA
const Partido = require('../models/partidoModel');
const Equipo = require('../models/equipoModel');
const auth = require('../middleware/authMiddleware');

// Función auxiliar stats
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

// GET: Rutas básicas
router.get('/', async (req, res) => {
  try { const partidos = await Partido.find().sort({ fecha: 1 }).populate('equipoLocal', 'nombre logoUrl').populate('equipoVisitante', 'nombre logoUrl'); res.json(partidos); } catch (e) { res.status(500).json({message:'Error'}); }
});

router.get('/proximos', async (req, res) => {
  try { const p = await Partido.find({ finalizado: false }).sort({ fecha: 1 }).limit(5).populate('equipoLocal', 'nombre logoUrl').populate('equipoVisitante', 'nombre logoUrl'); res.json(p); } catch (e) { res.status(500).json({message:'Error'}); }
});

router.get('/recientes', async (req, res) => {
  try { const p = await Partido.find({ finalizado: true }).sort({ fecha: -1 }).limit(5).populate('equipoLocal', 'nombre logoUrl').populate('equipoVisitante', 'nombre logoUrl'); res.json(p); } catch (e) { res.status(500).json({message:'Error'}); }
});

// GET: Tabla General
router.get('/standings', async (req, res) => {
  try {
    const teams = await Equipo.find();
    const matches = await Partido.find({ finalizado: true });
    const stats = {};
    teams.forEach(team => { stats[team._id.toString()] = { _id: team._id, nombre: team.nombre, logoUrl: team.logoUrl, PJ:0, PG:0, PE:0, PP:0, GF:0, GC:0, DG:0, PTS:0 }; });
    matches.forEach(match => {
      const localId = match.equipoLocal.toString();
      const visitId = match.equipoVisitante.toString();
      if (stats[localId] && stats[visitId]) {
          const gl = match.golesLocal; const gv = match.golesVisitante;
          stats[localId].PJ++; stats[localId].GF+=gl; stats[localId].GC+=gv; stats[localId].DG=stats[localId].GF-stats[localId].GC;
          stats[visitId].PJ++; stats[visitId].GF+=gv; stats[visitId].GC+=gl; stats[visitId].DG=stats[visitId].GF-stats[visitId].GC;
          if (gl > gv) { stats[localId].PG++; stats[localId].PTS+=3; stats[visitId].PP++; }
          else if (gv > gl) { stats[visitId].PG++; stats[visitId].PTS+=3; stats[localId].PP++; }
          else { stats[localId].PE++; stats[localId].PTS+=1; stats[visitId].PE++; stats[visitId].PTS+=1; }
      }
    });
    res.json(Object.values(stats).sort((a, b) => { if (b.PTS !== a.PTS) return b.PTS - a.PTS; return b.DG - a.DG; }));
  } catch (e) { res.status(500).json({message:'Error'}); }
});

// GET: Tabla Fair Play
router.get('/cards', async (req, res) => {
  try {
    const teams = await Equipo.find();
    const matches = await Partido.find({ finalizado: true });
    const stats = {};
    teams.forEach(t => stats[t._id.toString()] = { ...t.toObject(), amarillas: 0, rojas: 0, total: 0 });
    
    matches.forEach(m => {
      if(m.detallesTarjetas) {
        m.detallesTarjetas.forEach(c => {
          const tid = c.equipo === 'local' ? m.equipoLocal.toString() : m.equipoVisitante.toString();
          if(stats[tid]) {
            if(c.tipo==='Amarilla') { stats[tid].amarillas++; stats[tid].total+=1; }
            else { stats[tid].rojas++; stats[tid].total+=3; }
          }
        });
      }
    });
    res.json(Object.values(stats).sort((a,b) => b.total - a.total));
  } catch (e) { res.status(500).json({message:'Error'}); }
});

// GET: Sanciones Detalladas
router.get('/sanciones', async (req, res) => {
  try {
    const matches = await Partido.find({ finalizado: true })
      .populate('equipoLocal', 'nombre logoUrl')
      .populate('equipoVisitante', 'nombre logoUrl')
      .sort({ fecha: -1 });

    let listaSanciones = [];

    matches.forEach(match => {
      if (match.detallesTarjetas) {
        match.detallesTarjetas.forEach(card => {
          const equipoData = card.equipo === 'local' ? match.equipoLocal : match.equipoVisitante;
          listaSanciones.push({
            jugador: card.nombreJugador,
            equipo: equipoData.nombre,
            logo: equipoData.logoUrl,
            tipo: card.tipo,
            motivo: card.motivo || 'Falta cometida',
            fecha: match.fecha,
            matchId: match._id
          });
        });
      }
    });
    res.json(listaSanciones);
  } catch (error) { res.status(500).json({ message: 'Error obteniendo sanciones' }); }
});

// POST y PUT
router.post('/', auth, async (req, res) => {
  try {
    const { equipoLocal, equipoVisitante, golesLocal, golesVisitante, fecha, detallesGoles, detallesTarjetas, finalizado } = req.body;
    const isFinal = finalizado === undefined ? true : finalizado;
    const nuevo = new Partido({ equipoLocal, equipoVisitante, fecha, finalizado: isFinal, golesLocal: isFinal?golesLocal:0, golesVisitante: isFinal?golesVisitante:0, detallesGoles: isFinal?detallesGoles:[], detallesTarjetas: isFinal?detallesTarjetas:[] });
    const guardado = await nuevo.save();
    if(isFinal) await actualizarEstadisticas(detallesGoles);
    res.status(201).json(guardado);
  } catch (e) { res.status(400).json({message:'Error'}); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const original = await Partido.findById(req.params.id);
    const actualizado = await Partido.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if(!original.finalizado && req.body.finalizado) await actualizarEstadisticas(req.body.detallesGoles);
    res.json(actualizado);
  } catch (e) { res.status(500).json({message:'Error'}); }
});

module.exports = router;