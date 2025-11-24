router.get('/', async (req, res) => {
  try {
    let config = await Config.findOne({ id: 'global_config' });
    if (!config) {
      // Datos por defecto si es la primera vez
      config = await Config.create({
        id: 'global_config',
        header: { 
            titulo: 'EVOPLAY', 
            subtitulo: 'LEAGUE',
            links: [ {texto:'Inicio', url:'/'}, {texto:'Partidos', url:'/partidos'}, {texto:'Tabla', url:'/tabla'} ]
        },
        pages: {
          home: [
            { type: 'banner', title: 'TORNEO CLAUSURA' },
            { type: 'upcoming', title: '🔥 Próximos Partidos' },
            { type: 'scorers', title: '🏆 Goleadores' }
          ]
        }
      });
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Error al cargar configuración' });
  }
});