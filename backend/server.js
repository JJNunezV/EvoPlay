// 1. Importar las herramientas
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // <-- ¡NUEVO! Importamos el paquete cors.
require('dotenv').config();
const equipoRoutes = require('./routes/equipoRoutes');
const partidoRoutes = require('./routes/partidoRoutes');
const authRoutes = require('./routes/authRoutes');

// 2. Inicializar el servidor
const app = express();
const PORT = 5000;

// 3. Conectar a la base de datos
mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log('✅ Conectado a MongoDB exitosamente'))
  .catch((error) => console.error('❌ Error al conectar a MongoDB:', error.message));

// 4. Middlewares
app.use(cors()); // <-- ¡NUEVO! Le decimos al servidor que acepte peticiones de otros orígenes.
app.use(express.json());

// 5. Usar las rutas
app.use('/api/equipos', equipoRoutes);
app.use('/api/partidos', partidoRoutes);
app.use('/api/auth', authRoutes);

// 6. Ruta de prueba
app.get('/', (req, res) => {
  res.send('¡La API está funcionando correctamente!');
});

// 7. Poner el servidor a escuchar
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});