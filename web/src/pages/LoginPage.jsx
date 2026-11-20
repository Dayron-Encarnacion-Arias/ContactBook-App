import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

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
    <section className="narrow">
      <h1>Entrar</h1>
      {location.state?.registered && <p className="notice">Cuenta creada. Ya puedes entrar.</p>}
      <form className="card form" onSubmit={handleSubmit}>
        <label>
          Correo
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        </label>
        <label>
          Contraseña
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="alert">{error}</p>}
        <button type="submit" className="button" disabled={sending}>
          {sending ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
      <p className="muted center">
        ¿No tienes cuenta? <Link to="/register">Crea una</Link>
      </p>
    </section>
  );
}
