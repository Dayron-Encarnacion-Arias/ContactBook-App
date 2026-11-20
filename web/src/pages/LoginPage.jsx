import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import Magnet from '../components/Magnet.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      await login(email, password);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(err.message);
      setSending(false);
    }
  }

  return (
    <section className="pinned-page">
      <form className="note pinned note-personal" onSubmit={handleSubmit}>
        <Magnet size="lg">C</Magnet>
        <h1>Abre la nevera</h1>
        <p className="soft">Entra para pegar, corregir y despegar contactos.</p>
        {location.state?.registered && <p className="notice" role="status">Cuenta creada. Ya puedes entrar.</p>}

        <div className="fields">
          <label className="field">
            <span>Correo</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus autoComplete="email" />
          </label>
          <label className="field">
            <span>Contraseña</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          </label>
        </div>

        {error && <p className="alert" role="alert">{error}</p>}

        <div className="form-actions">
          <Link to="/register" className="text-button">Crear una cuenta</Link>
          <button type="submit" className="button" disabled={sending}>
            {sending ? 'Entrando…' : 'Entrar'}
          </button>
        </div>
      </form>
    </section>
  );
}
