import React from 'react';
import { FaInstagram, FaTwitter, FaFacebookF } from 'react-icons/fa';

// Recibimos 'customConfig' como propiedad desde App.js
function Footer({ customConfig }) {
  
  // Valores dinámicos
  const footerText = customConfig?.footer?.texto || 'La plataforma exclusiva para la gestión deportiva de alto nivel.';
  const contactEmail = customConfig?.footer?.contacto || 'contacto@evoplay.com';
  const primaryColor = customConfig?.colores?.primary || '#c5a059';

  return (
    <footer className="luxury-footer">
      <div className="footer-content">
        
        {/* Sección 1: Marca Dinámica */}
        <div className="footer-section">
          {/* Usamos el color primario configurado */}
          <h2 style={{color: primaryColor, marginTop:0}}>EVOPLAY</h2>
          <p>{footerText}</p>
        </div>

        {/* Sección 2: Enlaces */}
        <div className="footer-section">
          <h4>NAVEGACIÓN</h4>
          <a href="/">Inicio</a>
          <a href="/partidos">Calendario</a>
          <a href="/tabla">Estadísticas</a>
          <a href="/login">Admin</a>
        </div>

        {/* Sección 3: Contacto Dinámico */}
        <div className="footer-section">
          <h4>CONTACTO</h4>
          <p>{contactEmail}</p>
          <p>Guadalajara, Jalisco, MX</p>
          
          <div style={{marginTop: '20px', display:'flex', gap:'15px', justifyContent: 'center'}}>
            <FaInstagram size={20} color="white" style={{cursor:'pointer'}} />
            <FaTwitter size={20} color="white" style={{cursor:'pointer'}} />
            <FaFacebookF size={20} color="white" style={{cursor:'pointer'}} />
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} EvoPlay. Todos los derechos reservados. Diseño Premium.
      </div>
    </footer>
  );
}

export default Footer;