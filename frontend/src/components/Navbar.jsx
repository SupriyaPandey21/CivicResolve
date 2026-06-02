import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Landmark, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const [open, setOpen] = useState(false);

  const linkCls = ({ isActive }) =>
    `text-sm font-semibold tracking-wide transition-colors ${
      isActive
        ? "text-[var(--cr-accent)]"
        : "text-white/80 hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-40 bg-[var(--cr-primary)] border-b border-[var(--cr-primary-2)]">
      <div className="cr-container flex items-center justify-between h-16">

        {/* Brand */}
        <Link
          to="/"
          className="flex items-center gap-2 text-white"
          data-testid="brand-link"
        >
          <span className="w-9 h-9 rounded-md bg-[var(--cr-accent)] grid place-items-center">
            <Landmark size={20} className="text-white" />
          </span>

          <span className="font-bold text-lg tracking-tight">
            CivicResolve
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-7">
          <NavLink
            to="/"
            end
            className={linkCls}
            data-testid="nav-home"
          >
            Home
          </NavLink>

          <NavLink
            to="/ministries"
            className={linkCls}
            data-testid="nav-ministries"
          >
            Ministries
          </NavLink>

          {user && (
            <NavLink
              to="/cases"
              className={linkCls}
              data-testid="nav-cases"
            >
              My Cases
            </NavLink>
          )}

          {user && (
            <NavLink
              to="/report"
              className={linkCls}
              data-testid="nav-report"
            >
              Report
            </NavLink>
          )}
        </nav>

        {/* Desktop Right */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <span
                className="text-white/70 text-sm"
                data-testid="nav-user-name"
              >
                {user.name}
              </span>

              <button
                onClick={() => {
                  logout();
                  nav("/");
                }}
                className="text-white/80 hover:text-white text-sm flex items-center gap-1"
                data-testid="logout-btn"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-white/80 hover:text-white text-sm font-semibold"
                data-testid="nav-login"
              >
                Sign In
              </Link>

              <Link
                to="/register"
                className="bg-[var(--cr-accent)] hover:bg-[var(--cr-accent-dark)] text-white text-sm font-semibold px-4 py-2 rounded-md"
                data-testid="nav-register"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={() => setOpen(!open)}
          data-testid="mobile-menu-toggle"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div
          className="md:hidden bg-[var(--cr-primary-2)] border-t border-[var(--cr-primary)] px-6 py-4 space-y-3"
          data-testid="mobile-menu"
        >
          <NavLink
            to="/"
            end
            className="block text-white"
            onClick={() => setOpen(false)}
          >
            Home
          </NavLink>

          <NavLink
            to="/ministries"
            className="block text-white"
            onClick={() => setOpen(false)}
          >
            Ministries
          </NavLink>

          {user && (
            <NavLink
              to="/cases"
              className="block text-white"
              onClick={() => setOpen(false)}
            >
              My Cases
            </NavLink>
          )}

          {user && (
            <NavLink
              to="/report"
              className="block text-white"
              onClick={() => setOpen(false)}
            >
              Report
            </NavLink>
          )}

          {user ? (
            <button
              onClick={() => {
                logout();
                setOpen(false);
                nav("/");
              }}
              className="text-white"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="block text-white"
                onClick={() => setOpen(false)}
              >
                Sign In
              </Link>

              <Link
                to="/register"
                className="block text-[var(--cr-accent)] font-semibold"
                onClick={() => setOpen(false)}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}