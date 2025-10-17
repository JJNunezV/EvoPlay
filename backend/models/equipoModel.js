const mongoose = require('mongoose');

// 1. Creamos un "molde" o esquema solo para los jugadores
const jugadorSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  posicion: { type: String, default: 'N/A' },
  goles: { type: Number, default: 0 },
  asistencias: { type: Number, default: 0 }
});

// 2. Modificamos el esquema del equipo
const equipoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  logoUrl: {
    type: String,
    required: false
  },
  // Ahora, "jugadores" es una lista de objetos que siguen el molde de jugadorSchema
  jugadores: [jugadorSchema]
}, { timestamps: true });

const Equipo = mongoose.model('Equipo', equipoSchema);

module.exports = Equipo;