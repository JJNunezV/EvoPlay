const express = require('express');
const router = express.Router();
const Partido = require('../models/partidoModel');
const Equipo = require('../models/equipoModel');
const auth = require('../middleware/authMiddleware');

// Función auxiliar para actualizar estadísticas de jugadores (Goles/Asistencias)
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

// GET: Obtener todos los partidos
router.get('/', async (req, res) => {
  try {
    const partidos = await Partido.find().sort({ fecha: 1 })
      .populate('equipoLocal', 'nombre logoUrl categoria')
      .populate('equipoVisitante', 'nombre logoUrl categoria');
    res.json(partidos);
  } catch (error) { res.status(500).json({ message: 'Error al obtener los partidos' }); }
});

// GET: Próximos partidos
router.get('/proximos', async (req, res) => {
  try {
    const proximos = await Partido.find({ finalizado: false })
      .sort({ fecha: 1 }).limit(5)
      .populate('equipoLocal', 'nombre logoUrl').populate('equipoVisitante', 'nombre logoUrl');
    res.json(proximos);
  } catch (error) { res.status(500).json({ message: 'Error al obtener próximos' }); }
});

// GET: Recientes
router.get('/recientes', async (req, res) => {
  try {
    const recientes = await Partido.find({ finalizado: true })
      .sort({ fecha: -1 }).limit(5)
      .populate('equipoLocal', 'nombre logoUrl').populate('equipoVisitante', 'nombre logoUrl');
    res.json(recientes);
  } catch (error) { res.status(500).json({ message: 'Error al obtener recientes' }); }
});

// GET: Tabla de Posiciones (FILTRADA POR CATEGORÍA)
router.get('/standings', async (req, res) => {
  try {
    const categoria = req.query.categoria || 'Fútbol 7'; // Por defecto Fútbol 7
    
    // 1. Traemos equipos de esa categoría
    const teams = await Equipo.find({ categoria: categoria });
    
    // 2. Traemos partidos finalizados y poblamos los equipos para ver su categoría
    const matches = await Partido.find({ finalizado: true })
      .populate('equipoLocal', 'categoria')
      .populate('equipoVisitante', 'categoria');
    
    const stats = {};

    // Inicializar stats solo para equipos de la categoría seleccionada
    teams.forEach(team => {
      stats[team._id.toString()] = { 
        _id: team._id, nombre: team.nombre, logoUrl: team.logoUrl, 
        PJ: 0, PG: 0, PE: 0, PP: 0, GF: 0, GC: 0, DG: 0, PTS: 0 
      };
    });

    matches.forEach(match => {
      // Validamos que el partido pertenezca a la categoría (ambos equipos deben ser de ella)
      if (match.equipoLocal.categoria === categoria && match.equipoVisitante.categoria === categoria) {
          const localId = match.equipoLocal._id.toString();
          const visitId = match.equipoVisitante._id.toString();
          
          if (stats[localId] && stats[visitId]) {
             const gl = match.golesLocal; const gv = match.golesVisitante;
             
             stats[localId].PJ++; stats[visitId].PJ++;
             stats[localId].GF += gl; stats[visitId].GF += gv;
             stats[localId].GC += gv; stats[visitId].GC += gl;
             stats[localId].DG = stats[localId].GF - stats[localId].GC;
             stats[visitId].DG = stats[visitId].GF - stats[visitId].GC;

             if (gl > gv) { stats[localId].PG++; stats[localId].PTS+=3; stats[visitId].PP++; }
             else if (gv > gl) { stats[visitId].PG++; stats[visitId].PTS+=3; stats[localId].PP++; }
             else { stats[localId].PE++; stats[visitId].PE++; stats[localId].PTS+=1; stats[visitId].PTS+=1; }
          }
      }
    });

    const standings = Object.values(stats).sort((a, b) => {
      if (b.PTS !== a.PTS) return b.PTS - a.PTS;
      return b.DG - a.DG;
    });

    res.json(standings);
  } catch (error) { res.status(500).json({ message: 'Error calculando tabla' }); }
});

// GET: Tabla de Tarjetas / Fair Play (FILTRADA POR CATEGORÍA)
router.get('/cards', async (req, res) => {
  try {
    const categoria = req.query.categoria || 'Fútbol 7';
    const teams = await Equipo.find({ categoria: categoria });
    
    const matches = await Partido.find({ finalizado: true })
      .populate('equipoLocal', 'categoria')
      .populate('equipoVisitante', 'categoria');

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

// GET: Sanciones Detalladas (FILTRADA POR CATEGORÍA)
router.get('/sanciones', async (req, res) => {
  try {
    const categoria = req.query.categoria || 'Fútbol 7';
    const matches = await Partido.find({ finalizado: true })
      .populate('equipoLocal', 'nombre logoUrl categoria')
      .populate('equipoVisitante', 'nombre logoUrl categoria')
      .sort({ fecha: -1 });

    let listaSanciones = [];

    matches.forEach(match => {
      // Filtramos por categoría del partido
      if (match.equipoLocal.categoria === categoria && match.equipoVisitante.categoria === categoria) {
        if (match.detallesTarjetas) {
          match.detallesTarjetas.forEach(card => {
            const equipoData = card.equipo === 'local' ? match.equipoLocal : match.equipoVisitante;
            listaSanciones.push({
              jugador: card.nombreJugador,
              equipo: equipoData.nombre,
              logo: equipoData.logoUrl,
              tipo: card.tipo,
              motivo: card.motivo || 'Falta cometida',
              fecha: match.fecha
            });
          });
        }
      }
    });
    res.json(listaSanciones);
  } catch (error) { res.status(500).json({ message: 'Error obteniendo sanciones' }); }
});

// POST: Crear partido
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
    if(isFinal) await actualizarEstadisticas(detallesGoles);
    res.status(201).json(guardado);
  } catch (e) { res.status(400).json({message:'Error'}); }
});

// PUT: Actualizar partido
router.put('/:id', auth, async (req, res) => {
  try {
    const original = await Partido.findById(req.params.id);
    const actualizado = await Partido.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if(!original.finalizado && req.body.finalizado) {
       await actualizarEstadisticas(req.body.detallesGoles);
    }
    res.json(actualizado);
  } catch (e) { res.status(500).json({message:'Error'}); }
});

// DELETE: Borrar partido (Por si acaso lo necesitas)
router.delete('/:id', auth, async (req, res) => {
  try {
    await Partido.findByIdAndDelete(req.params.id);
    res.json({ message: 'Partido eliminado' });
  } catch (error) { res.status(500).json({ message: 'Error al eliminar' }); }
});

module.exports = router;