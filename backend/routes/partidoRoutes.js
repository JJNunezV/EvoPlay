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

    // 2. MAGIA: Actualizar los goles de cada jugador en sus equipos
    if (detallesGoles && detallesGoles.length > 0) {
      for (const gol of detallesGoles) {
        // Buscamos el equipo que tiene a este jugador y le sumamos 1 gol
        await Equipo.updateOne(
          { "jugadores._id": gol.jugadorId },
          { $inc: { "jugadores.$.goles": 1 } }
        );
      }
    }

    res.status(201).json(partidoGuardado);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear el partido', error: error.message });
  }
});