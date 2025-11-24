const express = require('express'); // <--- FALTABA ESTO
const router = express.Router();    // <--- Y ESTO
const Config = require('../models/configModel');
const auth = require('../middleware/authMiddleware');

// GET: Obtener la configuración (PÚBLICA)
router.get('/', async (req, res) => {
  try {
    let config = await Config.findOne({ id: 'global_config' });
    // Si es la primera vez y no existe, creamos la default
    if (!config) {
      config = await Config.create({
        id: 'global_config',
        header: { 
            titulo: 'EVOPLAY', 
            subtitulo: 'LEAGUE',
            links: [ {texto:'Inicio', url:'/'}, {texto:'Partidos', url:'/partidos'}, {texto:'Tabla', url:'/tabla'} ]
        },
        pages: {
          home: [
            { type: 'banner', title: 'TORNEO CLAUSURA', isVisible: true },
            { type: 'upcoming', title: '🔥 Próximos Partidos', isVisible: true },
            { type: 'scorers', title: '🏆 Goleadores', isVisible: true }
          ]
        }
      });
    }
    res.json(config);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al cargar configuración' });
  }
});

// PUT: Guardar cambios (SOLO ADMIN)
router.put('/', auth, async (req, res) => {
  try {
    // Usamos findOneAndUpdate con 'upsert: true' (si no existe, lo crea)
    const config = await Config.findOneAndUpdate(
      { id: 'global_config' },
      req.body,
      { new: true, upsert: true }
    );
    res.json(config);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al guardar configuración' });
  }
});

module.exports = router; // <--- NO OLVIDES ESTA AL FINAL