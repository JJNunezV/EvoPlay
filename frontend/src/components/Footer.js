import React from 'react';
import { FaInstagram, FaTwitter, FaFacebookF } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="luxury-footer">
      <div className="footer-content">
        
        {/* Sección 1: Marca */}
        <div className="footer-section">
          <h2 style={{color: '#d4af37', marginTop:0}}>EVOPLAY</h2>
          <p>La plataforma exclusiva para la gestión deportiva de alto nivel.</p>
        </div>

        {/* Sección 2: Enlaces */}
        <div className="footer-section">
          <h4>NAVEGACIÓN</h4>
          <a href="/">Inicio</a>
          <a href="/partidos">Calendario</a>
          <a href="/tabla">Estadísticas</a>
          <a href="/login">Admin</a>
        </div>

        {/* Sección 3: Contacto / Newsletter */}
        <div className="footer-section">
          <h4>CONTACTO</h4>
          <p>contacto@evoplay.com</p>
          <p>Guadalajara, Jalisco, MX</p>
          
          <div style={{marginTop: '20px', display:'flex', gap:'15px'}}>
            <FaInstagram size={20} color="white" style={{cursor:'pointer'}} />
            <FaTwitter size={20} color="white" style={{cursor:'pointer'}} />
            <FaFacebookF size={20} color="white" style={{cursor:'pointer'}} />
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        &copy; 2025 EvoPlay. Todos los derechos reservados. Diseño Premium.
      </div>
    </footer>
  );
}

export default Footer;