import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    // Si no hay token, redirige al usuario a la página de login
    return <Navigate to="/login" />;
  }
  return children; // Si hay token, muestra la página solicitada
}

export default ProtectedRoute;