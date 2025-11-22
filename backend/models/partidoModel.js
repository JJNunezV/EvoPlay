const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const partidoSchema = new Schema({
  equipoLocal: { type: Schema.Types.ObjectId, ref: 'Equipo', required: true },
  equipoVisitante: { type: Schema.Types.ObjectId, ref: 'Equipo', required: true },
  golesLocal: { type: Number, default: 0 },
  golesVisitante: { type: Number, default: 0 },
  fecha: { type: Date, required: true },
  // 👇 NUEVO CAMPO: Indica si el partido ya se jugó
  finalizado: { type: Boolean, default: true }, 
  detallesGoles: [{
    jugadorId: String,
    nombreJugador: String,
    asistenciaId: String,
    nombreAsistente: String,
    minuto: Number,
    equipo: String,
    esAutogol: { type: Boolean, default: false }
  }]
}, { timestamps: true });

const Partido = mongoose.model('Partido', partidoSchema);
module.exports = Partido;