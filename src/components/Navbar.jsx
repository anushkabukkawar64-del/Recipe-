import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ChefHat, PlusCircle, BookOpen, Home, LogIn, LogOut, UserPlus, Menu, X, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="navbar-wrapper">
      <div className="container">
        <nav className="navbar">
          {/* Brand Logo */}
          <Link to="/" className="nav-brand" onClick={closeMenu}>
            <div className="brand-icon-box">
              <ChefHat size={24} />
            </div>
            <div className="brand-text">
              Recipe <span>Haven</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <ul className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <li>
              <NavLink
                to="/"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                onClick={closeMenu}
                end
              >
                <Home size={18} />
                <span>Home</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/#explore"
                className="nav-link"
                onClick={() => {
                  closeMenu();
                  const el = document.getElementById('explore-recipes');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <BookOpen size={18} />
                <span>Explore Recipes</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/add-recipe"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                onClick={closeMenu}
              >
                <PlusCircle size={18} />
                <span>Add Recipe</span>
              </NavLink>
            </li>

            {isAuthenticated && (
              <li>
                <NavLink
                  to="/my-recipes"
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                  onClick={closeMenu}
                >
                  <User size={18} />
                  <span>My Recipes</span>
                </NavLink>
              </li>
            )}

            {/* Mobile-only auth links inside drawer */}
            <li className="mobile-only-auth">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="btn btn-outline btn-sm"
                  style={{ width: '100%', marginTop: '10px' }}
                >
                  <LogOut size={16} /> Logout
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                  <Link
                    to="/login"
                    className="btn btn-outline btn-sm"
                    onClick={closeMenu}
                    style={{ width: '100%' }}
                  >
                    <LogIn size={16} /> Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-primary btn-sm"
                    onClick={closeMenu}
                    style={{ width: '100%' }}
                  >
                    <UserPlus size={16} /> Register
                  </Link>
                </div>
              )}
            </li>
          </ul>

          {/* Desktop Right Actions */}
          <div className="nav-actions">
            {isAuthenticated ? (
              <div className="desktop-auth-buttons" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div className="user-badge" title={user?.email}>
                  <User size={16} />
                  <span>{user?.name || 'Chef'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline btn-sm"
                  title="Log out of your account"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="desktop-auth-buttons" style={{ display: 'flex', gap: '10px' }}>
                <Link to="/login" className="btn btn-outline btn-sm">
                  <LogIn size={16} /> Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  <UserPlus size={16} /> Register
                </Link>
              </div>
            )}

            {/* Mobile Toggle Button */}
            <button
              className="nav-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
