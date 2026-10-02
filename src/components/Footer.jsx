import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand info */}
          <div className="footer-brand">
            <div className="nav-brand">
              <div className="brand-icon-box">
                <ChefHat size={22} />
              </div>
              <div className="brand-text">
                Recipe <span>Haven</span>
              </div>
            </div>
            <p>
              A cozy, aesthetic corner for home cooks and food lovers to discover,
              cook, and share wholesome recipes crafted with love.
            </p>
          </div>

          {/* Quick links */}
          <div className="footer-col">
            <h4>Explore Haven</h4>
            <ul className="footer-links">
              <li>
                <Link to="/">Home Kitchen</Link>
              </li>
              <li>
                <a href="/#explore">Popular Recipes</a>
              </li>
              <li>
                <Link to="/add-recipe">Share a Recipe</Link>
              </li>
              <li>
                <Link to="/my-recipes">My Recipe Book</Link>
              </li>
            </ul>
          </div>

          {/* Community & Cooking tags */}
          <div className="footer-col">
            <h4>Culinary Love</h4>
            <ul className="footer-links">
              <li>Warm Breakfasts</li>
              <li>Handmade Pastas & Comfort Food</li>
              <li>Artisanal Coffee & Matcha</li>
              <li>Sweet Bakery & Desserts</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            Recipe Haven &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
