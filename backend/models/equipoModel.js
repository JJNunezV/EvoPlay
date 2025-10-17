const mongoose = require('mongoose');

// 1. Definimos el "molde" (Schema)
// Le decimos a Mongoose qué campos tendrá un equipo y de qué tipo serán.
const equipoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true, // El nombre es obligatorio
    trim: true      // Quita los espacios en blanco al inicio y al final
  },
  logoUrl: {
    type: String,
    required: false // El logo es opcional
  },
  jugadores: [
    {
      type: String // Por ahora, una simple lista de nombres de jugadores
    }
  ]
}, { timestamps: true }); // timestamps: true añade automáticamente los campos createdAt y updatedAt

// 2. Creamos el "Modelo" a partir del Schema
// El Modelo es el que nos permitirá hacer operaciones (crear, leer, actualizar, borrar) en la base de datos.
const Equipo = mongoose.model('Equipo', equipoSchema);

// 3. Exportamos el Modelo para poder usarlo en otras partes del proyecto
module.exports = Equipo;