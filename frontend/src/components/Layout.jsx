import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main className="container" style={{ minHeight: 'calc(100vh - 160px)' }}>
        {children}
      </main>
      <footer className="footer">
        <div className="container">
          <p>&copy; 2026 Antigravity Kitchen. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
};

export default Layout;
