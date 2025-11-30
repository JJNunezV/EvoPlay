import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaEnvelope, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';

function Footer({ customConfig }) {
  
  // Valores dinámicos desde el Admin (o defaults si no hay nada)
  const brandText = customConfig?.footer?.texto || 'La plataforma líder para la gestión de ligas deportivas profesionales y amateurs.';
  const contactEmail = customConfig?.footer?.contacto || 'contacto@evoplay.com';
  
  // Obtener colores de la config para el logo
  const primaryColor = customConfig?.colores?.primary || '#c5a059';

  return (
    <footer className="premium-footer">
      <div className="footer-container">
        
        {/* COLUMNA 1: MARCA */}
        <div className="footer-brand">
          <h2>EVO<span style={{color: primaryColor}}>PLAY</span></h2>
          <p>{brandText}</p>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-btn"><FaFacebookF /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-btn"><FaInstagram /></a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="social-btn"><FaTwitter /></a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="social-btn"><FaYoutube /></a>
          </div>
        </div>

        {/* COLUMNA 2: NAVEGACIÓN */}
        <div className="footer-links">
          <h3>Explorar</h3>
          <ul>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/partidos">Calendario de Juegos</Link></li>
            <li><Link to="/tabla">Tabla General</Link></li>
            <li><Link to="/login">Acceso Administrativo</Link></li>
          </ul>
        </div>

        {/* COLUMNA 3: CONTACTO OFICIAL */}
        <div className="footer-contact">
          <h3>Contacto Oficial</h3>
          <div className="contact-item">
            <FaMapMarkerAlt style={{color: primaryColor}} />
            <span>Guadalajara, Jalisco, México</span>
          </div>
          <div className="contact-item">
            <FaEnvelope style={{color: primaryColor}} />
            <span>{contactEmail}</span>
          </div>
          <div className="contact-item">
            <FaPhone style={{color: primaryColor}} />
            <span>+52 (33) 1234 5678</span>
          </div>
        </div>

      </div>

      {/* BARRA INFERIOR */}
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} EvoPlay League. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}

export default Footer;