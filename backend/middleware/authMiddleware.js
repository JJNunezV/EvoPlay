const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('x-auth-token'); // Buscamos el token en los headers
  if (!token) {
    return res.status(401).json({ message: 'No hay token, autorización denegada' });
  }

  try {
    const decoded = jwt.verify(token, 'TU_CLAVE_SECRETA_DEBE_SER_MAS_LARGA');
    req.user = decoded;
    next(); // Si el token es válido, permite que la petición continúe
  } catch (e) {
    res.status(400).json({ message: 'El token no es válido' });
  }
};