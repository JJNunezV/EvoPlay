const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const partidoSchema = new Schema({
  equipoLocal: { type: Schema.Types.ObjectId, ref: 'Equipo', required: true },
  equipoVisitante: { type: Schema.Types.ObjectId, ref: 'Equipo', required: true },
  golesLocal: { type: Number, default: 0 },
  golesVisitante: { type: Number, default: 0 },
  fecha: { type: Date, required: true },
  finalizado: { type: Boolean, default: true },
  
  detallesGoles: [{
    jugadorId: String,
    nombreJugador: String,
    asistenciaId: String,
    nombreAsistente: String,
    minuto: Number,
    equipo: String,
    esAutogol: { type: Boolean, default: false }
  }],

  detallesTarjetas: [{
    jugadorId: String,
    nombreJugador: String,
    tipo: { type: String, enum: ['Amarilla', 'Roja'] },
    minuto: Number,
    equipo: String,
    motivo: { type: String, default: '' } // 👈 NUEVO CAMPO
  }]

}, { timestamps: true });

const Partido = mongoose.model('Partido', partidoSchema);
module.exports = Partido;