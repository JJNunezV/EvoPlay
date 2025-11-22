const express = require('express');
const router = express.Router();
const Partido = require('../models/partidoModel');
const Equipo = require('../models/equipoModel');

// GET: Obtener todos los partidos
router.get('/', async (req, res) => {
  try {
    const partidos = await Partido.find()
      .populate('equipoLocal', 'nombre logoUrl')
      .populate('equipoVisitante', 'nombre logoUrl');
    res.json(partidos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los partidos' });
  }
});

// GET: Obtener los próximos 5 partidos
router.get('/proximos', async (req, res) => {
  try {
    const proximosPartidos = await Partido.find({ fecha: { $gte: new Date() } })
      .sort({ fecha: 1 })
      .limit(5)
      .populate('equipoLocal', 'nombre logoUrl')
      .populate('equipoVisitante', 'nombre logoUrl');
    res.json(proximosPartidos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener próximos partidos' });
  }
});

// GET: Obtener los últimos 5 partidos jugados
router.get('/recientes', async (req, res) => {
  try {
    const partidosRecientes = await Partido.find({ fecha: { $lt: new Date() } })
      .sort({ fecha: -1 })
      .limit(5)
      .populate('equipoLocal', 'nombre logoUrl')
      .populate('equipoVisitante', 'nombre logoUrl');
    res.json(partidosRecientes);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener partidos recientes' });
  }
});

// GET: Calcular y devolver la tabla de posiciones
router.get('/standings', async (req, res) => {
  try {
    const teams = await Equipo.find();
    const matches = await Partido.find();
    const stats = {};
    
    // Inicializar estadísticas para cada equipo
    teams.forEach(team => {
      stats[team._id] = {
        _id: team._id,
        nombre: team.nombre, 
        logoUrl: team.logoUrl,
        PJ: 0, PG: 0, PE: 0, PP: 0,
        GF: 0, GC: 0, DG: 0, PTS: 0
      };
    });

    // Calcular puntos
    matches.forEach(match => {
      // Verificamos que los equipos existan en nuestra lista (por si se borró alguno)
      if (stats[match.equipoLocal] && stats[match.equipoVisitante]) {
          const localId = match.equipoLocal.toString();
          const visitanteId = match.equipoVisitante.toString();
          const golesLocal = match.golesLocal;
          const golesVisitante = match.golesVisitante;
          
          // Sumar goles
          stats[localId].PJ++; stats[visitanteId].PJ++;
          stats[localId].GF += golesLocal; stats[visitanteId].GF += golesVisitante;
          stats[localId].GC += golesVisitante; stats[visitanteId].GC += golesLocal;
          
          // Sumar puntos
          if (golesLocal > golesVisitante) {
            stats[localId].PG++; stats[visitanteId].PP++; stats[localId].PTS += 3;
          } else if (golesVisitante > golesLocal) {
            stats[visitanteId].PG++; stats[localId].PP++; stats[visitanteId].PTS += 3;
          } else {
            stats[localId].PE++; stats[visitanteId].PE++; stats[localId].PTS += 1; stats[visitanteId].PTS += 1;
          }
      }
    });

    // Ordenar tabla
    const standings = Object.values(stats).sort((a, b) => {
      if (b.PTS !== a.PTS) return b.PTS - a.PTS;
      a.DG = a.GF - a.GC; b.DG = b.GF - b.GC;
      return b.DG - a.DG;
    });
    
    res.json(standings);
  } catch (error) {
    res.status(500).json({ message: 'Error al calcular la tabla', error: error.message });
  }
});

// POST: Crear un nuevo partido Y actualizar goleadores
router.post('/', async (req, res) => {
  const { equipoLocal, equipoVisitante, golesLocal, golesVisitante, fecha, detallesGoles } = req.body;

  const nuevoPartido = new Partido({
    equipoLocal,
    equipoVisitante,
    golesLocal,
    golesVisitante,
    fecha,
    detallesGoles
  });

  try {
    // 1. Guardar el partido
    const partidoGuardado = await nuevoPartido.save();

    // 2. Actualizar los goles de cada jugador
    if (detallesGoles && detallesGoles.length > 0) {
      for (const gol of detallesGoles) {
        // Solo sumamos si NO es autogol
        if (!gol.esAutogol) {
          await Equipo.updateOne(
            { "jugadores._id": gol.jugadorId },
            { $inc: { "jugadores.$.goles": 1 } }
          );
          // Si hay asistencia, también la sumamos
          if (gol.asistenciaId) {
             await Equipo.updateOne(
              { "jugadores._id": gol.asistenciaId },
              { $inc: { "jugadores.$.asistencias": 1 } }
            );
          }
        }
      }
    }

    res.status(201).json(partidoGuardado);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear el partido', error: error.message });
  }
});

module.exports = router;