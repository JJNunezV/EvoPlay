// GET: Obtener todos los partidos (PÚBLICA, sin 'auth')
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