const express = require('express');
const router = express.Router();
const Partido = require('../models/partidoModel');
const Equipo = require('../models/equipoModel');
const auth = require('../middleware/authMiddleware');

// --- FUNCIÓN AUXILIAR: Actualizar Estadísticas ---
async function actualizarEstadisticas(detallesGoles) {
  if (detallesGoles && detallesGoles.length > 0) {
    for (const gol of detallesGoles) {
      if (!gol.esAutogol) {
        await Equipo.updateOne(
          { "jugadores._id": gol.jugadorId }, 
          { $inc: { "jugadores.$.goles": 1 } }
        );
        if (gol.asistenciaId) {
          await Equipo.updateOne(
            { "jugadores._id": gol.asistenciaId }, 
            { $inc: { "jugadores.$.asistencias": 1 } }
          );
        }
      }
    }
  }
}

// --- HELPER PARA FILTRAR POR CATEGORÍA ---
const getCategoryFilter = async (categoria) => {
  if (!categoria || categoria === 'Todos') return {};
  const equipos = await Equipo.find({ categoria: categoria }).select('_id');
  const ids = equipos.map(e => e._id);
  return {
    $or: [
      { equipoLocal: { $in: ids } },
      { equipoVisitante: { $in: ids } }
    ]
  };
};

// ================= RUTAS GET (PÚBLICAS) =================

// 1. Obtener TODOS los partidos
router.get('/', async (req, res) => {
  try {
    const filtroCategoria = await getCategoryFilter(req.query.categoria);
    const partidos = await Partido.find(filtroCategoria)
      .sort({ fecha: 1 })
      .populate('equipoLocal', 'nombre logoUrl categoria')
      .populate('equipoVisitante', 'nombre logoUrl categoria');
    res.json(partidos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los partidos' });
  }
});

// 2. Obtener PRÓXIMOS partidos
router.get('/proximos', async (req, res) => {
  try {
    const filtroCategoria = await getCategoryFilter(req.query.categoria);
    const filtroFinal = { ...filtroCategoria, finalizado: false };
    const proximos = await Partido.find(filtroFinal)
      .sort({ fecha: 1 })
      .limit(5)
      .populate('equipoLocal', 'nombre logoUrl')
      .populate('equipoVisitante', 'nombre logoUrl');
    res.json(proximos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener próximos' });
  }
});

// 3. Obtener RESULTADOS recientes
router.get('/recientes', async (req, res) => {
  try {
    const filtroCategoria = await getCategoryFilter(req.query.categoria);
    const filtroFinal = { ...filtroCategoria, finalizado: true };
    const recientes = await Partido.find(filtroFinal)
      .sort({ fecha: -1 })
      .limit(5)
      .populate('equipoLocal', 'nombre logoUrl')
      .populate('equipoVisitante', 'nombre logoUrl');
    res.json(recientes);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener recientes' });
  }
});

// 4. TABLA DE POSICIONES
router.get('/standings', async (req, res) => {
  try {
    const categoria = req.query.categoria || 'Fútbol 7';
    const teams = await Equipo.find({ categoria: categoria });
    const filtroPartidos = await getCategoryFilter(categoria);
    const matches = await Partido.find({ ...filtroPartidos, finalizado: true })
      .populate('equipoLocal')
      .populate('equipoVisitante');
    
    const stats = {};
    teams.forEach(t => stats[t._id.toString()] = { _id: t._id, nombre: t.nombre, logoUrl: t.logoUrl, PJ:0, PG:0, PE:0, PP:0, GF:0, GC:0, DG:0, PTS:0 });

    matches.forEach(m => {
      if (m.equipoLocal.categoria === categoria && m.equipoVisitante.categoria === categoria) {
          const l = m.equipoLocal._id.toString(); 
          const v = m.equipoVisitante._id.toString();
          if (stats[l] && stats[v]) {
             const gl = m.golesLocal; const gv = m.golesVisitante;
             stats[l].PJ++; stats[v].PJ++;
             stats[l].GF+=gl; stats[v].GF+=gv;
             stats[l].GC+=gv; stats[v].GC+=gl;
             stats[l].DG = stats[l].GF - stats[l].GC;
             stats[v].DG = stats[v].GF - stats[v].GC;

             if (gl > gv) { stats[l].PG++; stats[l].PTS+=3; stats[v].PP++; }
             else if (gv > gl) { stats[v].PG++; stats[v].PTS+=3; stats[l].PP++; }
             else { stats[l].PE++; stats[v].PE++; stats[l].PTS+=1; stats[v].PTS+=1; }
          }
      }
    });
    res.json(Object.values(stats).sort((a,b) => b.PTS - a.PTS || b.DG - a.DG));
  } catch (e) { res.status(500).json({message:'Error standings'}); }
});

// 5. FAIR PLAY (Tarjetas)
router.get('/cards', async (req, res) => {
  try {
    const categoria = req.query.categoria || 'Fútbol 7';
    const teams = await Equipo.find({ categoria: categoria });
    const filtroPartidos = await getCategoryFilter(categoria);
    const matches = await Partido.find({ ...filtroPartidos, finalizado: true })
      .populate('equipoLocal').populate('equipoVisitante');

    const stats = {};
    teams.forEach(t => stats[t._id.toString()] = { _id: t._id, nombre: t.nombre, logoUrl: t.logoUrl, amarillas: 0, rojas: 0, total: 0 });
    
    matches.forEach(m => {
      if (m.equipoLocal.categoria === categoria && m.equipoVisitante.categoria === categoria) {
        if(m.detallesTarjetas) {
          m.detallesTarjetas.forEach(c => {
            const tid = c.equipo === 'local' ? m.equipoLocal._id.toString() : m.equipoVisitante._id.toString();
            if(stats[tid]) {
              if(c.tipo==='Amarilla') { stats[tid].amarillas++; stats[tid].total+=1; }
              else { stats[tid].rojas++; stats[tid].total+=3; }
            }
          });
        }
      }
    });
    res.json(Object.values(stats).sort((a,b) => b.total - a.total));
  } catch (e) { res.status(500).json({message:'Error cards'}); }
});

// 6. SANCIONES
router.get('/sanciones', async (req, res) => {
  try {
    const categoria = req.query.categoria || 'Fútbol 7';
    const filtroPartidos = await getCategoryFilter(categoria);
    const matches = await Partido.find({ ...filtroPartidos, finalizado: true })
      .populate('equipoLocal').populate('equipoVisitante')
      .sort({ fecha: -1 });

    let listaSanciones = [];
    matches.forEach(m => {
      if (m.equipoLocal.categoria === categoria && m.equipoVisitante.categoria === categoria) {
        if (m.detallesTarjetas) {
          m.detallesTarjetas.forEach(c => {
            const eq = c.equipo === 'local' ? m.equipoLocal : m.equipoVisitante;
            listaSanciones.push({
              jugador: c.nombreJugador,
              equipo: eq.nombre,
              logo: eq.logoUrl,
              tipo: c.tipo,
              motivo: c.motivo || 'Falta',
              fecha: m.fecha
            });
          });
        }
      }
    });
    res.json(listaSanciones);
  } catch (e) { res.status(500).json({message:'Error sanciones'}); }
});

// 7. TOP PLAYERS (Goleadores, Asistencias, Porteros)
router.get('/stats/top-players', async (req, res) => {
  try {
    const categoria = req.query.categoria || 'Fútbol 7';
    const teams = await Equipo.find({ categoria });
    
    let allPlayers = [];
    teams.forEach(t => {
      if (t.jugadores) {
        t.jugadores.forEach(j => {
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

    const goleadores = [...allPlayers].sort((a, b) => b.goles - a.goles).slice(0, 5);
    const asistidores = [...allPlayers].sort((a, b) => b.asistencias - a.asistencias).slice(0, 5);
    const porteros = [...allPlayers]
      .filter(p => p.posicion === 'Portero' && p.porterias > 0)
      .sort((a, b) => b.porterias - a.porterias)
      .slice(0, 5);

    res.json({ goleadores, asistidores, porteros });
  } catch (e) { res.status(500).json({message:'Error stats players'}); }
});


// ================= RUTAS PROTEGIDAS (POST, PUT, DELETE) =================

// CREAR PARTIDO
router.post('/', auth, async (req, res) => {
  try {
    const { equipoLocal, equipoVisitante, golesLocal, golesVisitante, fecha, detallesGoles, detallesTarjetas, finalizado } = req.body;
    const isFinal = finalizado === undefined ? true : finalizado;

    const nuevoPartido = new Partido({
      equipoLocal, equipoVisitante, fecha, finalizado: isFinal,
      golesLocal: isFinal ? golesLocal : 0,
      golesVisitante: isFinal ? golesVisitante : 0,
      detallesGoles: isFinal ? detallesGoles : [],
      detallesTarjetas: isFinal ? detallesTarjetas : []
    });

    const guardado = await nuevoPartido.save();
    if(isFinal) await actualizarEstadisticas(req.body);
    res.status(201).json(guardado);
  } catch (e) { res.status(400).json({message:'Error post'}); }
});

// ACTUALIZAR PARTIDO
router.put('/:id', auth, async (req, res) => {
  try {
    const original = await Partido.findById(req.params.id);
    const actualizado = await Partido.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if(!original.finalizado && req.body.finalizado) await actualizarEstadisticas(req.body);
    res.json(actualizado);
  } catch (e) { res.status(500).json({message:'Error put'}); }
});

// ELIMINAR PARTIDO
router.delete('/:id', auth, async (req, res) => {
  try { await Partido.findByIdAndDelete(req.params.id); res.json({message:'Borrado'}); }
  catch(e) { res.status(500).json({message:'Error delete'}); }
});

module.exports = router;