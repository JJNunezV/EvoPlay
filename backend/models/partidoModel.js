const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const partidoSchema = new Schema({
  equipoLocal: {
    type: Schema.Types.ObjectId, // Guardamos una referencia, no el nombre.
    ref: 'Equipo', // Le decimos a Mongoose que esta referencia es a un 'Equipo'.
    required: true
  },
  equipoVisitante: {
    type: Schema.Types.ObjectId,
    ref: 'Equipo',
    required: true
  },
  golesLocal: {
    type: Number,
    default: 0 // Si no se especifica, el marcador empieza en 0.
  },
  golesVisitante: {
    type: Number,
    default: 0
  },
  fecha: {
    type: Date,
    required: true
  }
}, { timestamps: true });

const Partido = mongoose.model('Partido', partidoSchema);

module.exports = Partido;