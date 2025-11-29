const express = require('express');
const router = express.Router();
const Partido = require('../models/partidoModel');
const Equipo = require('../models/equipoModel');
const auth = require('../middleware/authMiddleware');

// --- FUNCIÓN MAESTRA DE ESTADÍSTICAS ---
async function actualizarEstadisticas(partidoData) {
  const { detallesGoles, equipoLocal, equipoVisitante, golesLocal, golesVisitante } = partidoData;

  // 1. Sumar Goles y Asistencias
  if (detallesGoles && detallesGoles.length > 0) {
    for (const gol of detallesGoles) {
      if (!gol.esAutogol) {
        // Goles
        await Equipo.updateOne(
          { "jugadores._id": gol.jugadorId }, 
          { $inc: { "jugadores.$.goles": 1 } }
        );
        // Asistencias
        if (gol.asistenciaId) {
          await Equipo.updateOne(
            { "jugadores._id": gol.asistenciaId }, 
            { $inc: { "jugadores.$.asistencias": 1 } }
          );
        }
      }
    }
  }

  // 2. Sumar Porterías Imbatidas (Clean Sheets)
  // Si el Local recibió 0 goles -> Sumar al Portero Titular del Local
  if (golesVisitante === 0) {
    await Equipo.updateOne(
      { _id: equipoLocal, "jugadores.posicion": "Portero", "jugadores.rol": "Titular" },
      { $inc: { "jugadores.$.porteriasImbatidas": 1 } }
    );
  }
  // Si el Visitante recibió 0 goles -> Sumar al Portero Titular del Visitante
  if (golesLocal === 0) {
    await Equipo.updateOne(
      { _id: equipoVisitante, "jugadores.posicion": "Portero", "jugadores.rol": "Titular" },
      { $inc: { "jugadores.$.porteriasImbatidas": 1 } }
    );
  }
}

// Helper de filtro
const getCategoryFilter = async (categoria) => {
  if (!categoria) return {};
  const equipos = await Equipo.find({ categoria: categoria }).select('_id');
  const ids = equipos.map(e => e._id);
  return { $or: [ { equipoLocal: { $in: ids } }, { equipoVisitante: { $in: ids } } ] };
};

// --- RUTAS GET ---

router.get('/', async (req, res) => {
  try {
    const filtro = await getCategoryFilter(req.query.categoria);
    const partidos = await Partido.find(filtro).sort({ fecha: 1 }).populate('equipoLocal equipoVisitante');
    res.json(partidos);
  } catch (e) { res.status(500).json({ message: 'Error' }); }
});

router.get('/proximos', async (req, res) => {
  try {
    const filtro = await getCategoryFilter(req.query.categoria);
    const p = await Partido.find({ ...filtro, finalizado: false }).sort({ fecha: 1 }).limit(5).populate('equipoLocal equipoVisitante');
    res.json(p);
  } catch (e) { res.status(500).json({ message: 'Error' }); }
});

router.get('/recientes', async (req, res) => {
  try {
    const filtro = await getCategoryFilter(req.query.categoria);
    const p = await Partido.find({ ...filtro, finalizado: true }).sort({ fecha: -1 }).limit(5).populate('equipoLocal equipoVisitante');
    res.json(p);
  } catch (e) { res.status(500).json({ message: 'Error' }); }
});

// TABLA GENERAL
router.get('/standings', async (req, res) => {
  try {
    const categoria = req.query.categoria || 'Fútbol 7';
    const teams = await Equipo.find({ categoria });
    const matches = await Partido.find({ finalizado: true }).populate('equipoLocal equipoVisitante');
    
    const stats = {};
    teams.forEach(t => stats[t._id.toString()] = { _id: t._id, nombre: t.nombre, logoUrl: t.logoUrl, PJ:0, PG:0, PE:0, PP:0, GF:0, GC:0, DG:0, PTS:0 });

    matches.forEach(m => {
      if (m.equipoLocal.categoria === categoria && m.equipoVisitante.categoria === categoria) {
          const l = m.equipoLocal._id.toString(); const v = m.equipoVisitante._id.toString();
          if(stats[l] && stats[v]) {
             const gl = m.golesLocal; const gv = m.golesVisitante;
             stats[l].PJ++; stats[v].PJ++;
             stats[l].GF+=gl; stats[l].GC+=gv; stats[l].DG=stats[l].GF-stats[l].GC;
             stats[v].GF+=gv; stats[v].GC+=gl; stats[v].DG=stats[v].GF-stats[v].GC;
             if(gl>gv) { stats[l].PG++; stats[l].PTS+=3; stats[v].PP++; }
             else if(gv>gl) { stats[v].PG++; stats[v].PTS+=3; stats[l].PP++; }
             else { stats[l].PE++; stats[v].PE++; stats[l].PTS+=1; stats[v].PTS+=1; }
          }
      }
    });
    res.json(Object.values(stats).sort((a,b) => b.PTS - a.PTS || b.DG - a.DG));
  } catch (e) { res.status(500).json({message:'Error'}); }
});

// 👇 NUEVO: TOP PLAYERS (Goleadores, Asistentes, Porteros)
router.get('/stats/top-players', async (req, res) => {
  try {
    const categoria = req.query.categoria || 'Fútbol 7';
    const teams = await Equipo.find({ categoria });
    
    let players = [];
    teams.forEach(t => {
      t.jugadores.forEach(j => {
        players.push({
          nombre: j.nombre,
          equipo: t.nombre,
          logo: t.logoUrl,
          goles: j.goles,
          asistencias: j.asistencias,
          porterias: j.porteriasImbatidas,
          posicion: j.posicion
        });
      });
    });

    const goleadores = [...players].sort((a,b) => b.goles - a.goles).slice(0, 5);
    const asistidores = [...players].sort((a,b) => b.asistencias - a.asistencias).slice(0, 5);
    const porteros = [...players].filter(p => p.posicion === 'Portero').sort((a,b) => b.porterias - a.porterias).slice(0, 5);

    res.json({ goleadores, asistidores, porteros });
  } catch (e) { res.status(500).json({message:'Error stats'}); }
});

// FAIR PLAY Y SANCIONES
router.get('/cards', async (req, res) => {
  try {
    const cat = req.query.categoria || 'Fútbol 7';
    const teams = await Equipo.find({categoria:cat});
    const matches = await Partido.find({finalizado:true}).populate('equipoLocal equipoVisitante');
    const stats = {};
    teams.forEach(t => stats[t._id.toString()] = { ...t.toObject(), amarillas:0, rojas:0, total:0 });
    matches.forEach(m => {
       if(m.equipoLocal.categoria === cat) {
          m.detallesTarjetas.forEach(c => {
             const tid = c.equipo==='local'?m.equipoLocal._id.toString():m.equipoVisitante._id.toString();
             if(stats[tid]) { c.tipo==='Amarilla' ? (stats[tid].amarillas++, stats[tid].total++) : (stats[tid].rojas++, stats[tid].total+=3); }
          });
       }
    });
    res.json(Object.values(stats).sort((a,b) => b.total - a.total));
  } catch(e) { res.status(500).json({message:'Error'}); }
});

router.get('/sanciones', async (req, res) => {
  try {
    const cat = req.query.categoria || 'Fútbol 7';
    const matches = await Partido.find({finalizado:true}).sort({fecha:-1}).populate('equipoLocal equipoVisitante');
    let list = [];
    matches.forEach(m => {
       if(m.equipoLocal.categoria === cat) {
          m.detallesTarjetas.forEach(c => {
             const eq = c.equipo==='local'?m.equipoLocal:m.equipoVisitante;
             list.push({ jugador:c.nombreJugador, equipo:eq.nombre, logo:eq.logoUrl, tipo:c.tipo, motivo:c.motivo, fecha:m.fecha });
          });
       }
    });
    res.json(list);
  } catch(e) { res.status(500).json({message:'Error'}); }
});

// --- RUTAS PROTEGIDAS ---

router.post('/', auth, async (req, res) => {
  try {
    const { detallesGoles, finalizado } = req.body;
    const isFinal = finalizado === undefined ? true : finalizado;
    const nuevo = new Partido({ ...req.body, finalizado: isFinal });
    const guardado = await nuevo.save();
    if(isFinal) await actualizarEstadisticas(req.body); // Pasamos todo el body para tener acceso a equipos y goles
    res.status(201).json(guardado);
  } catch(e) { res.status(400).json({message:'Error'}); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const original = await Partido.findById(req.params.id);
    const actualizado = await Partido.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if(!original.finalizado && req.body.finalizado) await actualizarEstadisticas(req.body);
    res.json(actualizado);
  } catch(e) { res.status(500).json({message:'Error'}); }
});

router.delete('/:id', auth, async (req, res) => {
  try { await Partido.findByIdAndDelete(req.params.id); res.json({message:'Borrado'}); } catch(e) { res.status(500).json({message:'Error'}); }
});

module.exports = router;