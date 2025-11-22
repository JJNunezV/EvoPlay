const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const partidoSchema = new Schema({
  equipoLocal: { type: Schema.Types.ObjectId, ref: 'Equipo', required: true },
  equipoVisitante: { type: Schema.Types.ObjectId, ref: 'Equipo', required: true },
  golesLocal: { type: Number, default: 0 },
  golesVisitante: { type: Number, default: 0 },
  fecha: { type: Date, required: true },
  // Detalle de cada evento de gol
  detallesGoles: [{
    jugadorId: String,
    nombreJugador: String,
    asistenciaId: String,      // <-- NUEVO: ID del que dio el pase
    nombreAsistente: String,   // <-- NUEVO: Nombre del que dio el pase
    minuto: Number,
    equipo: String,            // 'local' o 'visitante' (el equipo del jugador)
    esAutogol: { type: Boolean, default: false } // <-- NUEVO: Check de autogol
  }]
}, { timestamps: true });

const Partido = mongoose.model('Partido', partidoSchema);
module.exports = Partido;