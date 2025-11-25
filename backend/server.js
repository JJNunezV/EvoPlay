const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const equipoRoutes = require('./routes/equipoRoutes');
const partidoRoutes = require('./routes/partidoRoutes');
const authRoutes = require('./routes/authRoutes');
const configRoutes = require('./routes/configRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch((error) => console.error('❌ Error al conectar a MongoDB:', error.message));

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/equipos', equipoRoutes);
app.use('/api/partidos', partidoRoutes);
app.use('/api/config', configRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor BACKEND corriendo en http://localhost:${PORT}`);
});