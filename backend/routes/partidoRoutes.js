const express = require('express');
const router = express.Router();
const Partido = require('../models/partidoModel');
const Equipo = require('../models/equipoModel');
const auth = require('../middleware/authMiddleware');

// --- 1. LÓGICA DE ACTUALIZACIÓN DE ESTADÍSTICAS ---
async function actualizarEstadisticas(partidoData) {
  const { detallesGoles, equipoLocal, equipoVisitante, golesLocal, golesVisitante } = partidoData;

  // A) Sumar Goles y Asistencias
  if (detallesGoles && detallesGoles.length > 0) {
    for (const gol of detallesGoles) {
      if (!gol.esAutogol) {
        // Sumar Gol
        await Equipo.updateOne(
          { "jugadores._id": gol.jugadorId }, 
          { $inc: { "jugadores.$.goles": 1 } }
        );
        // Sumar Asistencia
        if (gol.asistenciaId) {
          await Equipo.updateOne(
            { "jugadores._id": gol.asistenciaId }, 
            { $inc: { "jugadores.$.asistencias": 1 } }
          );
        }
      }
    }
  }

  // B) Sumar Porterías Imbatidas (Clean Sheets)
  // Si el visitante no metió gol, el portero local (titular) gana +1
  if (parseInt(golesVisitante) === 0) {
    await Equipo.updateOne(
      { _id: equipoLocal, "jugadores.posicion": "Portero", "jugadores.rol": "Titular" },
      { $inc: { "jugadores.$.porteriasImbatidas": 1 } }
    );
  }
  // Si el local no metió gol, el portero visitante (titular) gana +1
  if (parseInt(golesLocal) === 0) {
    await Equipo.updateOne(
      { _id: equipoVisitante, "jugadores.posicion": "Portero", "jugadores.rol": "Titular" },
      { $inc: { "jugadores.$.porteriasImbatidas": 1 } }
    );
  }
}

// Helper para filtrar partidos por categoría de equipos
const getCategoryFilter = async (categoria) => {
  if (!categoria || categoria === 'Todos') return {};
  const equipos = await Equipo.find({ categoria: categoria }).select('_id');
  const ids = equipos.map(e => e._id);
  return { $or: [ { equipoLocal: { $in: ids } }, { equipoVisitante: { $in: ids } } ] };
};

// ================= RUTAS GET (PÚBLICAS) =================

// Obtener todos (con filtro)
router.get('/', async (req, res) => {
  try {
    const filtro = await getCategoryFilter(req.query.categoria);
    const partidos = await Partido.find(filtro).sort({ fecha: 1 })
      .populate('equipoLocal', 'nombre logoUrl categoria')
      .populate('equipoVisitante', 'nombre logoUrl categoria');
    res.json(partidos);
  } catch (e) { res.status(500).json({ message: 'Error server' }); }
});

// Tablas de Posiciones
router.get('/standings', async (req, res) => {
  try {
    const categoria = req.query.categoria || 'Fútbol 7';
    const teams = await Equipo.find({ categoria });
    const matches = await Partido.find({ finalizado: true }).populate('equipoLocal equipoVisitante');
    
    const stats = {};
    teams.forEach(t => stats[t._id.toString()] = { _id: t._id, nombre: t.nombre, logoUrl: t.logoUrl, PJ:0, PG:0, PE:0, PP:0, GF:0, GC:0, DG:0, PTS:0 });

    matches.forEach(m => {
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

// 👇 NUEVA RUTA: TOP PLAYERS (Goleadores, Asistencias, Porteros)
router.get('/stats/top-players', async (req, res) => {
  try {
    const categoria = req.query.categoria || 'Fútbol 7';
    // Buscamos equipos de esa categoría y traemos sus jugadores
    const teams = await Equipo.find({ categoria });
    
    let allPlayers = [];
    teams.forEach(t => {
      if (t.jugadores) {
        t.jugadores.forEach(j => {
          // Solo agregamos si tienen alguna estadística mayor a 0
          if (j.goles > 0 || j.asistencias > 0 || j.porteriasImbatidas > 0) {
            allPlayers.push({
              nombre: j.nombre,
              equipo: t.nombre,
              logo: t.logoUrl,
              goles: j.goles || 0,
              asistencias: j.asistencias || 0,
              porterias: j.porteriasImbatidas || 0,
              posicion: j.posicion
            });
          }
        });
      }
    });

    // Filtramos y ordenamos los Top 5 de cada rubro
    const goleadores = [...allPlayers].sort((a, b) => b.goles - a.goles).slice(0, 5);
    const asistidores = [...allPlayers].sort((a, b) => b.asistencias - a.asistencias).slice(0, 5);
    const porteros = [...allPlayers]
      .filter(p => p.posicion === 'Portero' && p.porterias > 0)
      .sort((a, b) => b.porterias - a.porterias)
      .slice(0, 5);

    res.json({ goleadores, asistidores, porteros });
  } catch (e) { 
    console.error(e);
    res.status(500).json({ message: 'Error stats players' }); 
  }
});

// Fair Play (Tarjetas por equipo)
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

// Sanciones Detalladas
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

// ================= RUTAS POST/PUT/DELETE (PROTEGIDAS) =================

router.post('/', auth, async (req, res) => {
  try {
    const isFinal = req.body.finalizado === undefined ? true : req.body.finalizado;
    const nuevo = new Partido({ ...req.body, finalizado: isFinal });
    const guardado = await nuevo.save();
    // Si se guardó como finalizado, actualizamos las stats de los jugadores
    if(isFinal) await actualizarEstadisticas(req.body);
    res.status(201).json(guardado);
  } catch(e) { res.status(400).json({message:'Error post'}); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const original = await Partido.findById(req.params.id);
    const actualizado = await Partido.findByIdAndUpdate(req.params.id, req.body, { new: true });
    // Si pasó de programado a finalizado, actualizamos stats
    if(!original.finalizado && req.body.finalizado) {
       await actualizarEstadisticas(req.body);
    }
    res.json(actualizado);
  } catch(e) { res.status(500).json({message:'Error put'}); }
});

router.delete('/:id', auth, async (req, res) => {
  try { await Partido.findByIdAndDelete(req.params.id); res.json({message:'Borrado'}); }
  catch(e) { res.status(500).json({message:'Error delete'}); }
});

module.exports = router;