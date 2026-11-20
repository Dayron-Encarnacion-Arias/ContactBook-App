import { Link, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import EnamelPicker from './components/EnamelPicker.jsx';
import ContactsPage from './pages/ContactsPage.jsx';
import ContactFormPage from './pages/ContactFormPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

// Rutas que exigen sesión iniciada
function RequireAuth({ children }) {
  const { token } = useAuth();
  const location = useLocation();
  if (!token) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

export default function App() {
  const { user, logout } = useAuth();

  return (
    <div className="fridge">
      {/* La cabecera es la puerta del congelador */}
      <header className="freezer">
        <Link to="/" className="badge-brand" aria-label="ContactBook, inicio">
          ContactBook
        </Link>
        <nav className="nav" aria-label="Principal">
          <NavLink to="/" end>Contactos</NavLink>
          {user ? (
            <>
              <span className="nav-user">
                {user.name}
                {user.role === 'admin' && <span className="role">admin</span>}
              </span>
              <button type="button" className="text-button" onClick={logout}>Salir</button>
            </>
          ) : (
            <>
              <NavLink to="/login">Entrar</NavLink>
              <NavLink to="/register">Crear cuenta</NavLink>
            </>
          )}
        </nav>
        <EnamelPicker />
      </header>

      <main className="door">
        <Routes>
          <Route path="/" element={<ContactsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/contacts/new" element={<RequireAuth><ContactFormPage /></RequireAuth>} />
          <Route path="/contacts/:id/edit" element={<RequireAuth><ContactFormPage /></RequireAuth>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}
