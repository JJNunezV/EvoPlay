import React, { useState } from 'react';
import api from '../api'; // Usamos nuestro mensajero api
import { useNavigate } from 'react-router-dom';

function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 👇 AQUÍ ESTÁ EL CAMBIO: Usamos api.post y la ruta corta
      const response = await api.post('/api/auth/login', { email, password });
      
      localStorage.setItem('token', response.data.token);
      onLoginSuccess();
      navigate('/equipos');
    } catch (error) {
      console.error("Error en login:", error);
      alert('Error: Credenciales inválidas');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Iniciar Sesión</h2>
      <input 
        type="email" 
        placeholder="Email" 
        value={email} 
        onChange={e => setEmail(e.target.value)} 
        required 
      />
      <input 
        type="password" 
        placeholder="Contraseña" 
        value={password} 
        onChange={e => setPassword(e.target.value)} 
        required 
      />
      <button type="submit">Entrar</button>
    </form>
  );
}

export default LoginPage;