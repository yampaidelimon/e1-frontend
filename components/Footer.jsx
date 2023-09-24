import React from 'react';

const Footer = () => (
  <footer className="bg-light p-3 text-center" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center'}}data-testid="footer">
    <div className="logo" data-testid="footer-logo" />
    <p data-testid="footer-text">
      © Copyrights {(new Date()).getFullYear()}. Grupo Sinco ilimitada. Todos los derechos reservados.
    </p>
  </footer>
);

export default Footer;
