const express = require('express');
const router = express.Router();
const Partido = require('../models/partidoModel');
const Equipo = require('../models/equipoModel');
const auth = require('../middleware/authMiddleware');

// --- FUNCIÓN AUXILIAR: Actualizar Estadísticas de Jugadores ---
async function actualizarEstadisticas(detallesGoles) {
  if (detallesGoles && detallesGoles.length > 0) {
    for (const gol of detallesGoles) {
      // Solo sumamos si NO es autogol
      if (!gol.esAutogol) {
        // Sumar gol al anotador
        await Equipo.updateOne(
          { "jugadores._id": gol.jugadorId },
          { $inc: { "jugadores.$.goles": 1 } }
        );
        // Sumar asistencia al compañero (si existe)
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
// Devuelve un objeto de filtro para Mongoose basado en la categoría
const getCategoryFilter = async (categoria) => {
  if (!categoria) return {};
  // Buscamos los IDs de los equipos que pertenecen a esa categoría
  const equipos = await Equipo.find({ categoria: categoria }).select('_id');
  const ids = equipos.map(e => e._id);
  
  // Retornamos filtro: que el local O el visitante sean de esa categoría
  return {
    $or: [
      { equipoLocal: { $in: ids } },
      { equipoVisitante: { $in: ids } }
    ]
  };
};

// ================= RUTAS PÚBLICAS (GET) =================

// 1. Obtener TODOS los partidos (Con filtro opcional de categoría)
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

// 2. Obtener PRÓXIMOS partidos (No finalizados + Filtro)
router.get('/proximos', async (req, res) => {
  try {
    const filtroCategoria = await getCategoryFilter(req.query.categoria);
    // Combinamos el filtro de categoría con el de no finalizado
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

// 3. Obtener RESULTADOS recientes (Finalizados + Filtro)
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

// 4. TABLA DE POSICIONES (Calculada dinámicamente)
router.get('/standings', async (req, res) => {
  try {
    const categoria = req.query.categoria || 'Fútbol 7';
    
    // Traemos equipos de la categoría
    const teams = await Equipo.find({ categoria: categoria });
    
    // Traemos partidos finalizados de esa categoría
    const filtroPartidos = await getCategoryFilter(categoria);
    const matches = await Partido.find({ ...filtroPartidos, finalizado: true })
      .populate('equipoLocal')
      .populate('equipoVisitante');
    
    const stats = {};

    // Inicializar stats
    teams.forEach(team => {
      stats[team._id.toString()] = { 
        _id: team._id, nombre: team.nombre, logoUrl: team.logoUrl, 
        PJ: 0, PG: 0, PE: 0, PP: 0, GF: 0, GC: 0, DG: 0, PTS: 0 
      };
    });

    // Calcular puntos
    matches.forEach(match => {
      // Doble verificación de categoría
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

// 5. TABLA DE TARJETAS / FAIR PLAY
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

// 6. TRIBUNAL DISCIPLINARIO (Sanciones detalladas)
router.get('/sanciones', async (req, res) => {
  try {
    const categoria = req.query.categoria || 'Fútbol 7';
    const filtroPartidos = await getCategoryFilter(categoria);
    const matches = await Partido.find({ ...filtroPartidos, finalizado: true })
      .populate('equipoLocal').populate('equipoVisitante')
      .sort({ fecha: -1 });

    let listaSanciones = [];

    matches.forEach(match => {
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
    // Si se guarda como finalizado, actualizamos stats de jugadores
    if(isFinal) await actualizarEstadisticas(detallesGoles);
    res.status(201).json(guardado);
  } catch (e) { res.status(400).json({message:'Error al crear partido'}); }
});

// ACTUALIZAR PARTIDO (Jugar uno programado)
router.put('/:id', auth, async (req, res) => {
  try {
    const original = await Partido.findById(req.params.id);
    const actualizado = await Partido.findByIdAndUpdate(req.params.id, req.body, { new: true });

    // Si antes NO estaba finalizado y AHORA SÍ, sumamos stats
    if(!original.finalizado && req.body.finalizado) {
       await actualizarEstadisticas(req.body.detallesGoles);
    }
    res.json(actualizado);
  } catch (e) { res.status(500).json({message:'Error al actualizar'}); }
});

// ELIMINAR PARTIDO
router.delete('/:id', auth, async (req, res) => {
  try {
    await Partido.findByIdAndDelete(req.params.id);
    res.json({ message: 'Partido eliminado' });
  } catch (error) { res.status(500).json({ message: 'Error al eliminar' }); }
});

module.exports = router;