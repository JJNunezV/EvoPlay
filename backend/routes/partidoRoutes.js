const express = require('express');
const router = express.Router();
const Partido = require('../models/partidoModel');
const Equipo = require('../models/equipoModel');
const auth = require('../middleware/authMiddleware');

// --- Helper para actualizar estadísticas ---
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

// --- Helper para filtrar por categoría ---
const getCategoryFilter = async (categoria) => {
  if (!categoria || categoria === 'Todos') return {};
  const equipos = await Equipo.find({ categoria: categoria }).select('_id');
  const ids = equipos.map(e => e._id);
  return { $or: [ { equipoLocal: { $in: ids } }, { equipoVisitante: { $in: ids } } ] };
};

// GET: Todos los partidos (con filtro)
router.get('/', async (req, res) => {
  try {
    const filtro = await getCategoryFilter(req.query.categoria);
    const partidos = await Partido.find(filtro).sort({ fecha: 1 })
      .populate('equipoLocal', 'nombre logoUrl categoria')
      .populate('equipoVisitante', 'nombre logoUrl categoria');
    res.json(partidos);
  } catch (e) { res.status(500).json({ message: 'Error server partidos' }); }
});

// GET: Tablas (Standings)
router.get('/standings', async (req, res) => {
  try {
    const categoria = req.query.categoria || 'Fútbol 7';
    const teams = await Equipo.find({ categoria });
    const matches = await Partido.find({ finalizado: true }).populate('equipoLocal equipoVisitante');
    
    const stats = {};
    teams.forEach(t => stats[t._id.toString()] = { _id: t._id, nombre: t.nombre, logoUrl: t.logoUrl, PJ:0, PG:0, PE:0, PP:0, GF:0, GC:0, DG:0, PTS:0 });

    matches.forEach(m => {
      // Verificar que los equipos existan y sean de la categoría
      if (m.equipoLocal && m.equipoVisitante && m.equipoLocal.categoria === categoria) {
          const l = m.equipoLocal._id.toString(); 
          const v = m.equipoVisitante._id.toString();
          
          if(stats[l] && stats[v]) {
             const gl = m.golesLocal; const gv = m.golesVisitante;
             stats[l].PJ++; stats[v].PJ++;
             stats[l].GF+=gl; stats[v].GF+=gv;
             stats[l].GC+=gv; stats[v].GC+=gl;
             stats[l].DG = stats[l].GF - stats[l].GC;
             stats[v].DG = stats[v].GF - stats[v].GC;

             if(gl>gv) { stats[l].PG++; stats[l].PTS+=3; stats[v].PP++; }
             else if(gv>gl) { stats[v].PG++; stats[v].PTS+=3; stats[l].PP++; }
             else { stats[l].PE++; stats[v].PE++; stats[l].PTS+=1; stats[v].PTS+=1; }
          }
      }
    });
    res.json(Object.values(stats).sort((a,b) => b.PTS - a.PTS || b.DG - a.DG));
  } catch (e) { res.status(500).json({message:'Error standings'}); }
});

// GET: Tarjetas
router.get('/cards', async (req, res) => {
  try {
    const cat = req.query.categoria || 'Fútbol 7';
    const teams = await Equipo.find({categoria:cat});
    const matches = await Partido.find({finalizado:true}).populate('equipoLocal equipoVisitante');
    const stats = {};
    teams.forEach(t => stats[t._id.toString()] = { ...t.toObject(), amarillas:0, rojas:0, total:0 });
    
    matches.forEach(m => {
       if(m.equipoLocal && m.equipoLocal.categoria === cat) {
          if(m.detallesTarjetas) {
            m.detallesTarjetas.forEach(c => {
               const tid = c.equipo==='local'?m.equipoLocal._id.toString():m.equipoVisitante._id.toString();
               if(stats[tid]) { c.tipo==='Amarilla' ? (stats[tid].amarillas++, stats[tid].total++) : (stats[tid].rojas++, stats[tid].total+=3); }
            });
          }
       }
    });
    res.json(Object.values(stats).sort((a,b) => b.total - a.total));
  } catch(e) { res.status(500).json({message:'Error cards'}); }
});

// GET: Sanciones
router.get('/sanciones', async (req, res) => {
  try {
    const cat = req.query.categoria || 'Fútbol 7';
    const matches = await Partido.find({finalizado:true}).sort({fecha:-1}).populate('equipoLocal equipoVisitante');
    let list = [];
    matches.forEach(m => {
       if(m.equipoLocal && m.equipoLocal.categoria === cat) {
          if(m.detallesTarjetas) {
            m.detallesTarjetas.forEach(c => {
               const eq = c.equipo==='local'?m.equipoLocal:m.equipoVisitante;
               list.push({ jugador:c.nombreJugador, equipo:eq.nombre, logo:eq.logoUrl, tipo:c.tipo, motivo:c.motivo, fecha:m.fecha });
            });
          }
       }
    });
    res.json(list);
  } catch(e) { res.status(500).json({message:'Error sanciones'}); }
});

// POST: Crear
router.post('/', auth, async (req, res) => {
  try {
    const isFinal = req.body.finalizado === undefined ? true : req.body.finalizado;
    const nuevo = new Partido({ ...req.body, finalizado: isFinal });
    const guardado = await nuevo.save();
    if(isFinal) await actualizarEstadisticas(req.body.detallesGoles);
    res.status(201).json(guardado);
  } catch(e) { res.status(400).json({message:'Error post'}); }
});

// PUT: Editar
router.put('/:id', auth, async (req, res) => {
  try {
    const original = await Partido.findById(req.params.id);
    const actualizado = await Partido.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if(!original.finalizado && req.body.finalizado) await actualizarEstadisticas(req.body.detallesGoles);
    res.json(actualizado);
  } catch(e) { res.status(500).json({message:'Error put'}); }
});

module.exports = router;