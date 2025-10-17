const express = require('express');
const router = express.Router();
const Equipo = require('../models/equipoModel'); // Importamos nuestro "molde" de equipo

// RUTA 1: Obtener todos los equipos (GET)
// Cuando alguien pida la lista de equipos, haz esto:
router.get('/', async (req, res) => {
  try {
    const equipos = await Equipo.find(); // Busca en la base de datos todos los equipos
    res.json(equipos); // Responde con la lista de equipos en formato JSON
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los equipos', error: error.message });
  }
});

// RUTA 2: Crear un nuevo equipo (POST)
// Cuando alguien quiera crear un equipo nuevo, haz esto:
router.post('/', async (req, res) => {
  // 'req.body' contiene la información que nos envían para crear el equipo (ej: nombre, logo)
  const nuevoEquipo = new Equipo({
    nombre: req.body.nombre,
    logoUrl: req.body.logoUrl,
    jugadores: req.body.jugadores
  });

  try {
    const equipoGuardado = await nuevoEquipo.save(); // Intenta guardar el nuevo equipo en la BD
    res.status(201).json(equipoGuardado); // Responde con el equipo recién creado y un estado de "Creado"
  } catch (error) {
    res.status(400).json({ message: 'Error al crear el equipo', error: error.message });
  }

  // RUTA 3: Borrar un equipo por su ID (DELETE)
router.delete('/:id', async (req, res) => {
  try {
    const equipoBorrado = await Equipo.findByIdAndDelete(req.params.id);
    if (!equipoBorrado) {
      return res.status(404).json({ message: 'No se encontró el equipo' });
    }
    res.json({ message: 'Equipo borrado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al borrar el equipo', error: error.message });
  }
  });

    // RUTA 4: Actualizar un equipo por su ID (PUT)
  router.put('/:id', async (req, res) => {
  try {
    const equipoActualizado = await Equipo.findByIdAndUpdate(
      req.params.id, // El ID del equipo a actualizar
      req.body,      // La nueva información que enviamos
      { new: true }  // Esta opción hace que nos devuelva el documento ya actualizado
    );
    if (!equipoActualizado) {
      return res.status(404).json({ message: 'No se encontró el equipo' });
    }
    res.json(equipoActualizado); // Respondemos con el equipo ya modificado
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el equipo', error: error.message });
  }
});

});

module.exports = router; // Exportamos el router para que el servidor principal pueda usarlo