const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const partidoSchema = new Schema({
  equipoLocal: { type: Schema.Types.ObjectId, ref: 'Equipo', required: true },
  equipoVisitante: { type: Schema.Types.ObjectId, ref: 'Equipo', required: true },
  golesLocal: { type: Number, default: 0 },
  golesVisitante: { type: Number, default: 0 },
  fecha: { type: Date, required: true },
  // Nuevo: Guardamos el detalle de cada gol
  detallesGoles: [{
    jugadorId: String,
    nombreJugador: String,
    minuto: Number,
    equipo: String // 'local' o 'visitante'
  }]
}, { timestamps: true });

const Partido = mongoose.model('Partido', partidoSchema);
module.exports = Partido;