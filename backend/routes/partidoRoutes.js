const express = require('express');
const router = express.Router();
const Partido = require('../models/partidoModel');
const Equipo = require('../models/equipoModel');
const auth = require('../middleware/authMiddleware');

// Función auxiliar para actualizar estadísticas de jugadores
async function actualizarEstadisticas(detallesGoles) {
  if (detallesGoles && detallesGoles.length > 0) {
    for (const gol of detallesGoles) {
      // Si no es autogol, cuenta para el jugador
      if (!gol.esAutogol) {
        await Equipo.updateOne(
          { "jugadores._id": gol.jugadorId }, 
          { $inc: { "jugadores.$.goles": 1 } }
        );
        // Si hay asistencia, cuenta para el asistente
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

// GET: Obtener todos los partidos (PÚBLICA)
router.get('/', async (req, res) => {
  try {
    const partidos = await Partido.find().sort({ fecha: 1 })
      .populate('equipoLocal', 'nombre logoUrl')
      .populate('equipoVisitante', 'nombre logoUrl');
    res.json(partidos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los partidos' });
  }
});

// GET: Próximos partidos (PÚBLICA)
router.get('/proximos', async (req, res) => {
  try {
    const proximos = await Partido.find({ finalizado: false })
      .sort({ fecha: 1 }).limit(5)
      .populate('equipoLocal', 'nombre logoUrl')
      .populate('equipoVisitante', 'nombre logoUrl');
    res.json(proximos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener próximos' });
  }
});

// GET: Recientes (PÚBLICA)
router.get('/recientes', async (req, res) => {
  try {
    const recientes = await Partido.find({ finalizado: true })
      .sort({ fecha: -1 }).limit(5)
      .populate('equipoLocal', 'nombre logoUrl')
      .populate('equipoVisitante', 'nombre logoUrl');
    res.json(recientes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener recientes' });
  }
});

// GET: Tabla de Posiciones (PÚBLICA - Aquí estaba el error 500)
router.get('/standings', async (req, res) => {
  try {
    const teams = await Equipo.find();
    // Solo contamos partidos que ya terminaron
    const matches = await Partido.find({ finalizado: true });
    
    const stats = {};

    // 1. Inicializar stats para cada equipo con ID como string para evitar errores
    teams.forEach(team => {
      stats[team._id.toString()] = { 
        _id: team._id, 
        nombre: team.nombre, 
        logoUrl: team.logoUrl, 
        PJ: 0, PG: 0, PE: 0, PP: 0, 
        GF: 0, GC: 0, DG: 0, PTS: 0 
      };
    });

    // 2. Calcular puntos
    matches.forEach(match => {
      // Convertimos IDs a string para asegurar que coincidan con las llaves del objeto stats
      const localId = match.equipoLocal.toString();
      const visitanteId = match.equipoVisitante.toString();

      // Verificamos que ambos equipos existan en la base de datos (por si se borró alguno)
      if (stats[localId] && stats[visitanteId]) {
          const gl = match.golesLocal;
          const gv = match.golesVisitante;

          // Stats Local
          stats[localId].PJ++;
          stats[localId].GF += gl;
          stats[localId].GC += gv;
          stats[localId].DG = stats[localId].GF - stats[localId].GC;

          // Stats Visitante
          stats[visitanteId].PJ++;
          stats[visitanteId].GF += gv;
          stats[visitanteId].GC += gl;
          stats[visitanteId].DG = stats[visitanteId].GF - stats[visitanteId].GC;

          // Puntos
          if (gl > gv) { 
            stats[localId].PG++; stats[localId].PTS += 3;
            stats[visitanteId].PP++;
          } else if (gv > gl) { 
            stats[visitanteId].PG++; stats[visitanteId].PTS += 3;
            stats[localId].PP++;
          } else { 
            stats[localId].PE++; stats[localId].PTS += 1;
            stats[visitanteId].PE++; stats[visitanteId].PTS += 1;
          }
      }
    });

    // 3. Ordenar: Primero Puntos, luego Diferencia de Goles
    const standings = Object.values(stats).sort((a, b) => {
      if (b.PTS !== a.PTS) return b.PTS - a.PTS;
      return b.DG - a.DG;
    });

    res.json(standings);
  } catch (error) { 
    console.error("Error calculando tabla:", error);
    res.status(500).json({ message: 'Error interno al calcular la tabla' }); 
  }
});

// POST: Crear partido (PROTEGIDA)
router.post('/', auth, async (req, res) => {
  try {
    const { equipoLocal, equipoVisitante, golesLocal, golesVisitante, fecha, detallesGoles, finalizado } = req.body;
    
    const isFinalizado = finalizado === undefined ? true : finalizado;

    const nuevoPartido = new Partido({
      equipoLocal, equipoVisitante, fecha, 
      finalizado: isFinalizado,
      golesLocal: isFinalizado ? golesLocal : 0,
      golesVisitante: isFinalizado ? golesVisitante : 0,
      detallesGoles: isFinalizado ? detallesGoles : []
    });

    const guardado = await nuevoPartido.save();
    
    if (isFinalizado) {
      await actualizarEstadisticas(detallesGoles);
    }
    res.status(201).json(guardado);
  } catch (error) { 
    console.error(error);
    res.status(400).json({ message: 'Error al crear el partido' }); 
  }
});

// PUT: Editar/Finalizar partido (PROTEGIDA)
router.put('/:id', auth, async (req, res) => {
  try {
    const partidoOriginal = await Partido.findById(req.params.id);
    if (!partidoOriginal) return res.status(404).json({message: 'Partido no encontrado'});

    const partidoActualizado = await Partido.findByIdAndUpdate(req.params.id, req.body, { new: true });

    // Si se finaliza ahora, sumamos stats
    if (!partidoOriginal.finalizado && req.body.finalizado) {
       await actualizarEstadisticas(req.body.detallesGoles);
    }

    res.json(partidoActualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar' });
  }
});

module.exports = router;