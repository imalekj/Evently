import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, LogOut, Menu, Ticket, User as UserIcon, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../lib/useLanguage';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive ? 'text-purple-700 bg-purple-50' : 'text-slate-600 hover:text-purple-700'
  }`;

export default function Navbar() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { lang, toggleLang } = useLanguage();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-sm font-bold text-white">
            E
          </span>
          <span className="text-lg font-bold text-slate-900">{t('app.name')}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/" end className={navLinkClass}>
            {t('nav.home')}
          </NavLink>
          <NavLink to="/events" className={navLinkClass}>
            {t('nav.events')}
          </NavLink>
          {user && (
            <NavLink to="/events/new" className={navLinkClass}>
              {t('nav.createEvent')}
            </NavLink>
          )}
          {user?.role === 1 && (
            <NavLink to="/admin" className={navLinkClass}>
              {t('nav.admin')}
            </NavLink>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={toggleLang}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:border-purple-300 hover:text-purple-700"
          >
            {lang === 'ar' ? 'EN' : 'عربي'}
          </button>

          {!user ? (
            <>
              <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:text-purple-700">
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
              >
                {t('nav.register')}
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-purple-300"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-purple-700">
                  <UserIcon size={13} />
                </span>
                {user.fullName.split(' ')[0]}
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute end-0 z-20 mt-2 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-md">
                    <div className="border-b border-slate-100 px-4 py-2.5">
                      <p className="truncate text-sm font-semibold text-slate-800">{user.fullName}</p>
                      <p className="truncate text-xs text-slate-500">{user.email}</p>
                    </div>
                    <Link
                      to="/my-events"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Ticket size={15} className="text-slate-400" /> {t('nav.myEvents')}
                    </Link>
                    <Link
                      to="/my-bookings"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Ticket size={15} className="text-slate-400" /> {t('nav.myBookings')}
                    </Link>
                    {user.role === 1 && (
                      <Link
                        to="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <LayoutDashboard size={15} className="text-slate-400" /> {t('nav.admin')}
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 border-t border-slate-100 px-4 py-2 text-start text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={15} /> {t('nav.logout')}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen((v) => !v)} aria-label={t('nav.menu')}>
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            <NavLink to="/" end className={navLinkClass} onClick={() => setMobileOpen(false)}>
              {t('nav.home')}
            </NavLink>
            <NavLink to="/events" className={navLinkClass} onClick={() => setMobileOpen(false)}>
              {t('nav.events')}
            </NavLink>
            {user && (
              <>
                <NavLink to="/events/new" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                  {t('nav.createEvent')}
                </NavLink>
                <NavLink to="/my-events" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                  {t('nav.myEvents')}
                </NavLink>
                <NavLink to="/my-bookings" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                  {t('nav.myBookings')}
                </NavLink>
                {user.role === 1 && (
                  <NavLink to="/admin" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                    {t('nav.admin')}
                  </NavLink>
                )}
                <button
                  onClick={handleLogout}
                  className="mt-1 rounded-lg px-3 py-2 text-start text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  {t('nav.logout')}
                </button>
              </>
            )}
            <button
              onClick={toggleLang}
              className="mt-1 w-fit rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600"
            >
              {lang === 'ar' ? 'English' : 'العربية'}
            </button>
            {!user && (
              <div className="mt-2 flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-center text-sm font-medium text-slate-700"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-lg bg-purple-600 px-4 py-2 text-center text-sm font-semibold text-white"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
