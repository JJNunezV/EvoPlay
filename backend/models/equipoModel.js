const mongoose = require('mongoose');

const jugadorSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  // 👇 Definimos las posiciones fijas
  posicion: { 
    type: String, 
    enum: ['Portero', 'Defensa', 'Medio', 'Delantero'], 
    default: 'Medio' 
  },
  // 👇 Nuevo campo para saber si es titular o banca
  rol: {
    type: String,
    enum: ['Titular', 'Suplente'],
    default: 'Titular'
  },
  goles: { type: Number, default: 0 },
  asistencias: { type: Number, default: 0 }
});

const equipoSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  logoUrl: { type: String, required: false },
  categoria: {
    type: String,
    required: true,
    enum: ['Fútbol 7', 'Fútbol 11', 'Fútbol Rápido', 'Pádel', 'Voleibol'],
    default: 'Fútbol 7'
  },
  jugadores: [jugadorSchema]
}, { timestamps: true });

const Equipo = mongoose.model('Equipo', equipoSchema);
module.exports = Equipo;