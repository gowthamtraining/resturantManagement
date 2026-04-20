import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 72px)' }}>
        {children}
      </main>
      <footer className="footer">
        <div className="container">
          <p style={{ fontSize: '0.85rem' }}>© 2026 Royal Kitchen · Built with ❤️ for great food</p>
        </div>
      </footer>
    </>
  );
};

export default Layout;
